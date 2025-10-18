/**
 * 초기 관리자 계정 생성 스크립트
 *
 * 사용법:
 * node scripts/createAdmin.js <email> <password> <name>
 *
 * 예시:
 * node scripts/createAdmin.js admin@example.com admin123 관리자
 */

const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// AWS 설정
AWS.config.update({ region: 'ap-northeast-2' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

// 환경 변수에서 테이블 이름 가져오기 (없으면 기본값 사용)
const USERS_TABLE = process.env.USERS_TABLE || 'langwindow-backend-users-dev';

async function createAdmin(email, password, name) {
  try {
    console.log('관리자 계정 생성 시작...');
    console.log(`테이블: ${USERS_TABLE}`);
    console.log(`이메일: ${email}`);
    console.log(`이름: ${name}`);

    // 이미 존재하는 이메일 확인
    const existingUser = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
    }).promise();

    if (existingUser.Items && existingUser.Items.length > 0) {
      console.error('❌ 이미 등록된 이메일입니다.');
      process.exit(1);
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 생성
    const admin = {
      userId: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
      school: 'N/A',
      grade: 'N/A',
    };

    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: admin,
    }).promise();

    console.log('✅ 관리자 계정이 성공적으로 생성되었습니다!');
    console.log('User ID:', admin.userId);
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 명령줄 인자 파싱
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('사용법: node scripts/createAdmin.js <email> <password> <name>');
  console.error('예시: node scripts/createAdmin.js admin@example.com admin123 관리자');
  process.exit(1);
}

const [email, password, name] = args;

createAdmin(email, password, name);
