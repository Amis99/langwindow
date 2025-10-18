const fs = require('fs');
const path = require('path');

// contents 폴더의 모든 HTML 파일 찾기
const contentsDir = path.join(__dirname, '../contents');
const files = fs.readdirSync(contentsDir).filter(file => file.endsWith('.html'));

console.log(`📚 ${files.length}개의 학습 콘텐츠 파일을 찾았습니다.\n`);

// 추가할 스크립트 태그
const scriptTags = `
    <!-- 학습 완료 시스템 -->
    <script src="../js/config.js"></script>
    <script src="../js/learning-complete.js"></script>
</body>`;

let successCount = 0;
let skipCount = 0;

files.forEach((file, index) => {
    const filePath = path.join(contentsDir, file);

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // 이미 스크립트가 추가되어 있는지 확인
        if (content.includes('learning-complete.js')) {
            console.log(`⏭️  [${index + 1}/${files.length}] ${file} - 이미 추가됨, 건너뜀`);
            skipCount++;
            return;
        }

        // </body> 태그를 찾아서 그 전에 스크립트 추가
        const closingBodyIndex = content.lastIndexOf('</body>');

        if (closingBodyIndex === -1) {
            console.log(`⚠️  [${index + 1}/${files.length}] ${file} - </body> 태그를 찾을 수 없음`);
            return;
        }

        // </body> 태그를 스크립트 태그로 교체
        const newContent = content.substring(0, closingBodyIndex) + scriptTags + content.substring(closingBodyIndex + 7);

        // 파일 저장
        fs.writeFileSync(filePath, newContent, 'utf8');

        console.log(`✅ [${index + 1}/${files.length}] ${file} - 스크립트 추가 완료`);
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
    console.log(`🎉 ${successCount}개 파일에 학습 완료 시스템이 추가되었습니다!`);
}
