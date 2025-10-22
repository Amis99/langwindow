const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'ap-northeast-2' });

const CONTENTS_TABLE = process.env.CONTENTS_TABLE || 'langwindow-backend-contents-dev';

const newContent = {
  contentId: 'seonwoo-hwi-bulkkot',
  title: '선우휘 - 불꽃 (내신 대비 워크북)',
  filename: '선우휘 불꽃 내신 대비 워크북.html',
  category: 'literature',
  subcategory: '현대소설',
  difficulty: '심화',
  estimatedTime: '45분',
  description: '선우휘의 단편소설 \'불꽃\'을 분석하고 내신을 대비합니다',
  tags: ['현대소설', '선우휘', '내신대비', '문학', '전쟁', '서술형'],
  stages: ['딥러서치', '어휘', '문장', 'OX퀴즈', '서술형'],
  uploadDate: new Date().toISOString().split('T')[0],
  thumbnailUrl: 'images/thumbnails/bulkkot.png',
  questionCount: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function addContent() {
  try {
    console.log('📚 DynamoDB에 콘텐츠 추가 중...\n');
    console.log('테이블:', CONTENTS_TABLE);
    console.log('콘텐츠:', JSON.stringify(newContent, null, 2));

    await dynamodb.put({
      TableName: CONTENTS_TABLE,
      Item: newContent
    }).promise();

    console.log('\n✅ 콘텐츠가 성공적으로 추가되었습니다!');
    console.log('🌐 확인: https://amis99.github.io/langwindow/');
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    throw error;
  }
}

addContent();
