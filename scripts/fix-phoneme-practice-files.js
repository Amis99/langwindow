const fs = require('fs');
const path = require('path');

// 음운 변동 연습 파일들만 처리
const files = [
    '음운 변동 연습 샘플.html',
    '음운 변동 연습1.html'
];

const contentsDir = path.join(__dirname, '../contents');

console.log(`📚 음운 변동 연습 파일 2개 수정 시작...\n`);

// 추가할 데이터 export 코드
const dataExportCode = `
        // 학습 완료 시스템을 위한 데이터 export
        window.learningResultData = {
            totalStages: 1, // 음운 변동 연습은 단일 활동
            totalCorrect: correctAnswers || 0,
            totalWrong: incorrectAnswers || 0,
            totalAccuracy: accuracy || 0,
            totalScore: accuracy || 0,
            totalElapsedTime: elapsedTime * 1000 || 0, // 밀리초로 변환
            stagesDetail: {
                phonemePractice: {
                    correct: correctAnswers || 0,
                    wrong: incorrectAnswers || 0,
                    accuracy: accuracy || 0,
                    score: accuracy || 0,
                    time: elapsedTime || 0,
                    completedWords: completedWords || []
                }
            }
        };
        console.log('학습 데이터 export:', window.learningResultData);
`;

// 추가할 버튼 호출 코드
const buttonCallCode = `

            // 학습 완료 버튼 추가
            if (typeof addCompleteLearningButton === 'function') {
                setTimeout(() => addCompleteLearningButton(), 500);
            }`;

let successCount = 0;

files.forEach((file, index) => {
    const filePath = path.join(contentsDir, file);

    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  [${index + 1}/${files.length}] ${file} - 파일을 찾을 수 없음`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');

        let modified = false;

        // 1. 데이터 export 추가 (function showResults() { 바로 다음)
        if (!content.includes('window.learningResultData')) {
            const pattern = /function showResults\(\) \{/;
            if (pattern.test(content)) {
                content = content.replace(
                    pattern,
                    `function showResults() {${dataExportCode}`
                );
                modified = true;
                console.log(`✅ [${index + 1}/${files.length}] ${file} - 데이터 export 추가`);
            }
        } else {
            console.log(`⏭️  [${index + 1}/${files.length}] ${file} - 데이터 export 이미 있음`);
        }

        // 2. 버튼 호출 추가 (부모 프로그램 전송 코드 뒤)
        if (!content.includes('addCompleteLearningButton')) {
            // }, '*'); 를 찾아서 그 다음에 버튼 호출 추가
            const pattern = /\}, '\*'\);[\s]*\}/;
            if (pattern.test(content)) {
                content = content.replace(
                    pattern,
                    `}, '*');${buttonCallCode}\n        }`
                );
                modified = true;
                console.log(`✅ [${index + 1}/${files.length}] ${file} - 버튼 호출 추가`);
            }
        } else {
            console.log(`⏭️  [${index + 1}/${files.length}] ${file} - 버튼 호출 이미 있음`);
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            successCount++;
            console.log(`🎉 [${index + 1}/${files.length}] ${file} - 수정 완료\n`);
        }

    } catch (error) {
        console.error(`❌ [${index + 1}/${files.length}] ${file} - 오류: ${error.message}`);
    }
});

console.log(`\n========================================`);
console.log(`✅ 성공: ${successCount}개`);
console.log(`========================================\n`);

if (successCount > 0) {
    console.log(`🎉 ${successCount}개 파일이 수정되었습니다!`);
}
