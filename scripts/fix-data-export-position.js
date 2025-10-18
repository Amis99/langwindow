const fs = require('fs');
const path = require('path');

const contentsDir = path.join(__dirname, '../contents');
const files = fs.readdirSync(contentsDir).filter(file => file.endsWith('.html'));

console.log(`📚 ${files.length}개 파일의 데이터 export 위치 수정...\n`);

let successCount = 0;
let alreadyFixedCount = 0;

files.forEach((file, index) => {
    const filePath = path.join(contentsDir, file);

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // 패턴 1: showFinalResults() 함수 시작 직후에 잘못 추가된 데이터 export 찾기
        const wrongPattern = /function showFinalResults\(\) \{\s*\/\/ 학습 완료 시스템을 위한 데이터 export[\s\S]*?console\.log\('학습 데이터 export:', window\.learningResultData\);\s*\n/;

        // 패턴 2: showResults() 함수 (음운 변동 연습)
        const wrongPattern2 = /function showResults\(\) \{\s*\/\/ 학습 완료 시스템을 위한 데이터 export[\s\S]*?console\.log\('학습 데이터 export:', window\.learningResultData\);\s*\n/;

        let match = content.match(wrongPattern) || content.match(wrongPattern2);

        if (!match) {
            console.log(`⏭️  [${index + 1}/${files.length}] ${file} - 이미 올바른 위치에 있음`);
            alreadyFixedCount++;
            return;
        }

        // 잘못된 위치의 코드 제거
        const dataExportCode = match[0].replace(/function show(Final)?Results\(\) \{\s*/, '');
        content = content.replace(match[0], match[0].split('\n')[0] + '\n');

        // 올바른 위치에 삽입: document.getElementById('main-content').style.display = 'block'; 직전
        const correctInsertPattern = /(document\.getElementById\('main-content'\)\.style\.display = 'block';)/;

        if (correctInsertPattern.test(content)) {
            content = content.replace(
                correctInsertPattern,
                `${dataExportCode}\n            $1`
            );

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ [${index + 1}/${files.length}] ${file} - 데이터 export 위치 수정 완료`);
            successCount++;
        } else {
            console.log(`⚠️  [${index + 1}/${files.length}] ${file} - 올바른 삽입 위치를 찾을 수 없음`);
        }

    } catch (error) {
        console.error(`❌ [${index + 1}/${files.length}] ${file} - 오류: ${error.message}`);
    }
});

console.log(`\n========================================`);
console.log(`✅ 수정 성공: ${successCount}개`);
console.log(`⏭️  이미 올바름: ${alreadyFixedCount}개`);
console.log(`❌ 실패: ${files.length - successCount - alreadyFixedCount}개`);
console.log(`========================================\n`);

if (successCount > 0) {
    console.log(`🎉 ${successCount}개 파일의 데이터 export 위치가 수정되었습니다!`);
}
