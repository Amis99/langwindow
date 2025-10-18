const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE;
const CONTENTS_TABLE = process.env.CONTENTS_TABLE;
const LEARNING_RECORDS_TABLE = process.env.LEARNING_RECORDS_TABLE;

/**
 * DynamoDB 아이템 가져오기
 */
async function getItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  const result = await dynamodb.get(params).promise();
  return result.Item;
}

/**
 * DynamoDB 아이템 저장
 */
async function putItem(tableName, item) {
  const params = {
    TableName: tableName,
    Item: item,
  };

  await dynamodb.put(params).promise();
  return item;
}

/**
 * DynamoDB 아이템 업데이트
 */
async function updateItem(tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames = {}) {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ...(Object.keys(expressionAttributeNames).length > 0 && { ExpressionAttributeNames: expressionAttributeNames }),
    ReturnValues: 'ALL_NEW',
  };

  const result = await dynamodb.update(params).promise();
  return result.Attributes;
}

/**
 * DynamoDB 아이템 삭제
 */
async function deleteItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  await dynamodb.delete(params).promise();
}

/**
 * DynamoDB 쿼리
 */
async function query(tableName, keyConditionExpression, expressionAttributeValues, indexName = null) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ...(indexName && { IndexName: indexName }),
  };

  const result = await dynamodb.query(params).promise();
  return result.Items;
}

/**
 * DynamoDB 스캔
 */
async function scan(tableName, filterExpression = null, expressionAttributeValues = null) {
  const params = {
    TableName: tableName,
    ...(filterExpression && { FilterExpression: filterExpression }),
    ...(expressionAttributeValues && { ExpressionAttributeValues: expressionAttributeValues }),
  };

  const result = await dynamodb.scan(params).promise();
  return result.Items;
}

/**
 * 이메일로 사용자 찾기
 */
async function getUserByEmail(emailValue) {
  const params = {
    TableName: USERS_TABLE,
    IndexName: 'EmailIndex',
    KeyConditionExpression: '#email = :email',
    ExpressionAttributeNames: {
      '#email': 'email'
    },
    ExpressionAttributeValues: {
      ':email': emailValue
    }
  };

  const result = await dynamodb.query(params).promise();
  return result.Items.length > 0 ? result.Items[0] : null;
}

/**
 * userId로 사용자 찾기
 */
async function getUserById(userId) {
  return await getItem(USERS_TABLE, { userId });
}

/**
 * 승인 대기 중인 사용자 목록 가져오기
 */
async function getPendingUsers() {
  const params = {
    TableName: USERS_TABLE,
    IndexName: 'StatusIndex',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'pending'
    }
  };

  const result = await dynamodb.query(params).promise();
  return result.Items;
}

/**
 * 전체 사용자 목록 가져오기
 */
async function getAllUsers() {
  return await scan(USERS_TABLE);
}

/**
 * 사용자 생성
 */
async function createUser(user) {
  return await putItem(USERS_TABLE, user);
}

/**
 * 사용자 업데이트
 */
async function updateUser(userId, updates) {
  const updateExpressions = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  Object.keys(updates).forEach((key, index) => {
    const placeholder = `:val${index}`;
    const namePlaceholder = `#attr${index}`;

    updateExpressions.push(`${namePlaceholder} = ${placeholder}`);
    expressionAttributeValues[placeholder] = updates[key];
    expressionAttributeNames[namePlaceholder] = key;
  });

  return await updateItem(
    USERS_TABLE,
    { userId },
    `SET ${updateExpressions.join(', ')}`,
    expressionAttributeValues,
    expressionAttributeNames
  );
}

/**
 * 사용자 삭제
 */
async function deleteUser(userId) {
  await deleteItem(USERS_TABLE, { userId });
}

/**
 * 콘텐츠 생성
 */
async function createContent(content) {
  return await putItem(CONTENTS_TABLE, content);
}

/**
 * 전체 콘텐츠 목록 가져오기
 */
async function getAllContents() {
  return await scan(CONTENTS_TABLE);
}

/**
 * 콘텐츠 ID로 콘텐츠 가져오기
 */
async function getContentById(contentId) {
  return await getItem(CONTENTS_TABLE, { contentId });
}

/**
 * 학습 기록 저장
 */
async function saveLearningRecord(record) {
  return await putItem(LEARNING_RECORDS_TABLE, record);
}

/**
 * 사용자별 학습 기록 가져오기
 */
async function getLearningRecordsByUser(userId) {
  return await query(
    LEARNING_RECORDS_TABLE,
    'userId = :userId',
    { ':userId': userId }
  );
}

/**
 * 전체 학습 기록 가져오기
 */
async function getAllLearningRecords() {
  return await scan(LEARNING_RECORDS_TABLE);
}

module.exports = {
  // 기본 CRUD
  getItem,
  putItem,
  updateItem,
  deleteItem,
  query,
  scan,

  // 사용자 관련
  getUserByEmail,
  getUserById,
  getPendingUsers,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,

  // 콘텐츠 관련
  createContent,
  getAllContents,
  getContentById,

  // 학습 기록 관련
  saveLearningRecord,
  getLearningRecordsByUser,
  getAllLearningRecords,

  // 테이블 이름
  USERS_TABLE,
  CONTENTS_TABLE,
  LEARNING_RECORDS_TABLE,
};
