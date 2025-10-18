const fs = require('fs');
const path = require('path');

// contents 폴더의 모든 HTML 파일 찾기
const contentsDir = path.join(__dirname, '../contents');
const files = fs.readdirSync(contentsDir).filter(file => file.endsWith('.html'));

console.log(`📚 ${files.length}개의 학습 콘텐츠 파일을 찾았습니다.\n`);

// 추가할 코드
const buttonCallCode = `
            // 학습 완료 버튼 추가
            if (typeof addCompleteLearningButton === 'function') {
                setTimeout(() => addCompleteLearningButton(), 500);
            }`;

let successCount = 0;
let skipCount = 0;

files.forEach((file, index) => {
    const filePath = path.join(contentsDir, file);

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // 이미 수정되어 있는지 확인
        if (content.includes('addCompleteLearningButton')) {
            console.log(`⏭️  [${index + 1}/${files.length}] ${file} - 이미 수정됨, 건너뜀`);
            skipCount++;
            return;
        }

        // displayFinalResults 함수의 끝부분 찾기
        // "부모 프로그램에 최종 결과 전송" 또는 "sendFinalDataToParent()" 찾기
        const patterns = [
            /sendFinalDataToParent\(\);/g,
            /\/\/ 부모 프로그램으로 최종 데이터 전송[\s\S]*?}\s*}/g
        ];

        let modified = false;

        for (let pattern of patterns) {
            if (pattern.test(content)) {
                // sendFinalDataToParent() 호출 다음에 버튼 추가 코드 삽입
                content = content.replace(
                    /sendFinalDataToParent\(\);/,
                    `sendFinalDataToParent();${buttonCallCode}`
                );
                modified = true;
                break;
            }
        }

        // 패턴을 찾지 못한 경우, displayFinalResults 함수의 마지막 부분에 추가
        if (!modified) {
            // document.getElementById('main-content').style.display = 'block'; 이후에 추가
            const displayPattern = /document\.getElementById\('main-content'\)\.style\.display = 'block';/;
            if (displayPattern.test(content)) {
                content = content.replace(
                    displayPattern,
                    `document.getElementById('main-content').style.display = 'block';${buttonCallCode}`
                );
                modified = true;
            }
        }

        if (!modified) {
            console.log(`⚠️  [${index + 1}/${files.length}] ${file} - displayFinalResults 함수를 찾을 수 없음`);
            return;
        }

        // 파일 저장
        fs.writeFileSync(filePath, content, 'utf8');

        console.log(`✅ [${index + 1}/${files.length}] ${file} - 버튼 호출 추가 완료`);
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
    console.log(`🎉 ${successCount}개 파일에 버튼 호출이 추가되었습니다!`);
}
