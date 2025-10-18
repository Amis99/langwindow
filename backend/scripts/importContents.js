const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// DynamoDB 설정
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-2'
});

const CONTENTS_TABLE = process.env.CONTENTS_TABLE || 'langwindow-backend-contents-dev';

// 메타데이터 파일 읽기
const metadataPath = path.join(__dirname, '../../contents-metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

async function importContents() {
  console.log(`📚 ${metadata.contents.length}개의 콘텐츠를 DynamoDB에 등록합니다...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const content of metadata.contents) {
    try {
      const item = {
        contentId: content.id,
        title: content.title,
        category: content.category,
        subcategory: content.subcategory,
        description: content.description,
        difficulty: content.difficulty,
        filename: content.filename,
        thumbnailUrl: content.thumbnailUrl || '',
        uploadDate: content.uploadDate,
        estimatedTime: content.estimatedTime,
        tags: content.tags || [],
        stages: content.stages || [],
        questionCount: content.questionCount || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamodb.put({
        TableName: CONTENTS_TABLE,
        Item: item
      }).promise();

      console.log(`✅ [${successCount + 1}/${metadata.contents.length}] ${content.title}`);
      successCount++;

    } catch (error) {
      console.error(`❌ 실패: ${content.title}`);
      console.error(`   오류: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`========================================\n`);

  if (successCount > 0) {
    console.log(`🎉 콘텐츠 등록이 완료되었습니다!`);
  }
}

// 실행
importContents().catch(error => {
  console.error('❌ 콘텐츠 등록 중 오류 발생:', error);
  process.exit(1);
});
