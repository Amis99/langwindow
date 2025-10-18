const fs = require('fs');
const path = require('path');

// contents 폴더의 모든 HTML 파일 찾기
const contentsDir = path.join(__dirname, '../contents');
const files = fs.readdirSync(contentsDir).filter(file => file.endsWith('.html'));

console.log(`📚 ${files.length}개의 학습 콘텐츠 파일을 찾았습니다.\n`);

// 추가할 코드: displayFinalResults 함수 시작 부분에 데이터 export
const dataExportCode = `
        // 학습 완료 시스템을 위한 데이터 export
        window.learningResultData = {
            totalStages: totalStages || 5,
            totalCorrect: totalCorrect || 0,
            totalWrong: totalWrong || 0,
            totalAccuracy: totalAccuracy || 0,
            totalScore: totalScore || 0,
            totalElapsedTime: totalElapsedTime || (Date.now() - globalStartTime),
            stagesDetail: stageResults || {}
        };
        console.log('학습 데이터 export:', window.learningResultData);
`;

let successCount = 0;
let skipCount = 0;

files.forEach((file, index) => {
    const filePath = path.join(contentsDir, file);

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // 이미 수정되어 있는지 확인
        if (content.includes('window.learningResultData')) {
            console.log(`⏭️  [${index + 1}/${files.length}] ${file} - 이미 수정됨, 건너뜀`);
            skipCount++;
            return;
        }

        // showFinalResults 함수 찾기
        const functionPattern = /function showFinalResults\(\) \{/;

        if (!functionPattern.test(content)) {
            console.log(`⚠️  [${index + 1}/${files.length}] ${file} - showFinalResults 함수를 찾을 수 없음`);
            return;
        }

        // 함수 시작 직후에 데이터 export 코드 추가
        content = content.replace(
            /function showFinalResults\(\) \{/,
            `function showFinalResults() {${dataExportCode}`
        );

        // 파일 저장
        fs.writeFileSync(filePath, content, 'utf8');

        console.log(`✅ [${index + 1}/${files.length}] ${file} - 데이터 export 추가 완료`);
        successCount++;

    } catch (error) {
        console.error(`❌ [${index + 1}/${files.length}] ${file} - 오류: ${error.message}`);
    }
});

console.log(`\n========================================`);
console.log(`✅ 성공: ${successCount}개`);
console.log(`⏭️  건너뜀: ${skipCount}개`);
console.log(`❌ 실패: ${files.length - successCount - skipCount}개`);
console.log(`========================================\n`);

if (successCount > 0) {
    console.log(`🎉 ${successCount}개 파일에 데이터 export가 추가되었습니다!`);
}
