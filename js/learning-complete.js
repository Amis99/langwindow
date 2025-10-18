/**
 * 학습 완료 시스템
 * 모든 학습 콘텐츠에서 공통으로 사용하는 학습 완료 및 결과 전송 스크립트
 */

// API 설정 로드
if (typeof API_CONFIG === 'undefined') {
    console.error('API_CONFIG가 로드되지 않았습니다. config.js를 먼저 로드하세요.');
}

/**
 * 학습 완료 버튼을 결과 페이지에 추가
 * 기존 버튼 옆에 배치됩니다
 */
function addCompleteLearningButton() {
    console.log('=== 학습 완료 버튼 추가 시작 ===');

    // 이미 추가되었는지 확인
    if (document.getElementById('completeLearningBtn')) {
        console.log('버튼이 이미 추가되어 있습니다.');
        return;
    }

    // 여러 방법으로 버튼 컨테이너 찾기
    let targetContainer = null;

    // 방법 1: "결과 이미지 저장" 버튼의 부모 찾기
    const saveImageBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('결과 이미지 저장') || btn.textContent.includes('이미지 저장')
    );

    if (saveImageBtn) {
        targetContainer = saveImageBtn.parentElement;
        console.log('방법 1 성공: 결과 이미지 저장 버튼의 부모 찾음');
    }

    // 방법 2: "처음부터 다시하기" 버튼의 부모 찾기
    if (!targetContainer) {
        const restartBtn = Array.from(document.querySelectorAll('button')).find(btn =>
            btn.textContent.includes('처음부터 다시하기') || btn.textContent.includes('다시하기')
        );

        if (restartBtn) {
            targetContainer = restartBtn.parentElement;
            console.log('방법 2 성공: 다시하기 버튼의 부모 찾음');
        }
    }

    // 방법 3: main-content 내부에서 버튼이 2개 이상 있는 div 찾기
    if (!targetContainer) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            const containers = mainContent.querySelectorAll('div');
            for (let container of containers) {
                const buttons = container.querySelectorAll('button');
                if (buttons.length >= 2) {
                    targetContainer = container;
                    console.log('방법 3 성공: main-content 내 버튼 컨테이너 찾음');
                    break;
                }
            }
        }
    }

    if (!targetContainer) {
        console.error('버튼 컨테이너를 찾을 수 없습니다.');
        // 대안: main-content의 끝에 새 div 생성
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            targetContainer = document.createElement('div');
            targetContainer.style.cssText = 'text-align: center; margin-top: 30px; padding-bottom: 30px;';
            mainContent.appendChild(targetContainer);
            console.log('대안: 새 컨테이너 생성');
        } else {
            console.error('main-content도 찾을 수 없습니다.');
            return;
        }
    }

    // 학습 완료 버튼 생성
    const completeBtn = document.createElement('button');
    completeBtn.id = 'completeLearningBtn';
    completeBtn.innerHTML = '✅ 학습 완료';
    completeBtn.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 18px 50px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
    `;

    completeBtn.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    };

    completeBtn.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    };

    completeBtn.onclick = handleCompleteLearning;

    targetContainer.appendChild(completeBtn);
}

/**
 * 학습 완료 처리
 */
async function handleCompleteLearning() {
    const btn = document.getElementById('completeLearningBtn');

    // 로그인 확인
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
        alert('로그인이 필요합니다. 학생 대시보드에서 콘텐츠를 시작해주세요.');
        return;
    }

    // 사용자 정보 확인
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) {
        alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
    }

    const user = JSON.parse(userStr);

    // 학습 결과 데이터 수집
    const learningData = collectLearningData();

    if (!learningData) {
        alert('학습 데이터를 수집할 수 없습니다.');
        return;
    }

    // 확인 메시지
    if (!confirm('학습을 완료하고 결과를 저장하시겠습니까?')) {
        return;
    }

    // 버튼 비활성화 및 로딩 표시
    btn.disabled = true;
    btn.innerHTML = '⏳ 저장 중...';

    try {
        // 콘텐츠 ID 추출 (URL 또는 문서 제목에서)
        const contentId = getContentId();
        const contentTitle = document.title || '학습 콘텐츠';

        // API 호출
        const response = await fetch(`${API_CONFIG.BASE_URL}/student/learning-record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                contentId: contentId,
                contentTitle: contentTitle,
                userId: user.userId,
                userName: user.name,
                score: learningData.totalScore || 0,
                accuracy: learningData.totalAccuracy || 0,
                timeSpent: Math.round((learningData.totalElapsedTime || 0) / 1000 / 60), // 분 단위
                totalQuestions: (learningData.totalCorrect || 0) + (learningData.totalWrong || 0),
                correctAnswers: learningData.totalCorrect || 0,
                wrongAnswers: learningData.totalWrong || 0,
                stagesDetail: learningData.stagesDetail || {},
                wrongQuestions: extractWrongQuestions(learningData.stagesDetail),
                completed: true,
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || '저장에 실패했습니다.');
        }

        // 성공
        btn.innerHTML = '✅ 완료!';
        btn.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';

        alert('🎉 학습이 완료되었습니다!\n결과가 저장되었습니다.');

        // 3초 후 학생 대시보드로 이동
        setTimeout(() => {
            if (confirm('학생 대시보드로 돌아가시겠습니까?')) {
                window.location.href = '/student-dashboard.html';
            } else {
                // 버튼 다시 활성화 (재전송 가능하도록)
                btn.disabled = false;
                btn.innerHTML = '✅ 학습 완료';
                btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
        }, 2000);

    } catch (error) {
        console.error('학습 완료 저장 실패:', error);
        alert('❌ 저장에 실패했습니다: ' + error.message);

        // 버튼 복구
        btn.disabled = false;
        btn.innerHTML = '✅ 학습 완료';
    }
}

/**
 * 학습 데이터 수집
 * 각 학습 콘텐츠에서 전역 변수로 관리하는 데이터를 수집
 */
function collectLearningData() {
    console.log('=== 학습 데이터 수집 시작 ===');
    console.log('totalScore:', typeof totalScore !== 'undefined' ? totalScore : 'undefined');
    console.log('totalCorrect:', typeof totalCorrect !== 'undefined' ? totalCorrect : 'undefined');
    console.log('totalWrong:', typeof totalWrong !== 'undefined' ? totalWrong : 'undefined');
    console.log('stageResults:', typeof stageResults !== 'undefined' ? stageResults : 'undefined');

    // 전역 변수 체크 (window 객체를 통해 확인)
    const hasScore = typeof window.totalScore !== 'undefined';
    const hasCorrect = typeof window.totalCorrect !== 'undefined';
    const hasStageResults = typeof window.stageResults !== 'undefined';

    console.log('hasScore:', hasScore, 'hasCorrect:', hasCorrect, 'hasStageResults:', hasStageResults);

    // 최소한 점수 정보가 있으면 수집
    if (hasScore || hasCorrect || hasStageResults) {
        const data = {
            totalStages: window.totalStages || 5,
            totalCorrect: window.totalCorrect || 0,
            totalWrong: window.totalWrong || 0,
            totalAccuracy: window.totalAccuracy || 0,
            totalScore: window.totalScore || 0,
            totalElapsedTime: window.globalStartTime ? (Date.now() - window.globalStartTime) : 0,
            stagesDetail: window.stageResults || {}
        };

        console.log('수집된 데이터:', data);
        return data;
    }

    console.error('학습 데이터를 찾을 수 없습니다. 전역 변수가 정의되지 않았습니다.');
    return null;
}

/**
 * 틀린 문제 목록 추출
 */
function extractWrongQuestions(stagesDetail) {
    if (!stagesDetail) return [];

    const wrongQuestions = [];

    for (let stage in stagesDetail) {
        const stageData = stagesDetail[stage];
        if (stageData.wrongQuestions && Array.isArray(stageData.wrongQuestions)) {
            stageData.wrongQuestions.forEach(item => {
                wrongQuestions.push({
                    stage: stage,
                    question: item.question || '',
                    userAnswer: item.userAnswer || '',
                    correctAnswer: item.correctAnswer || '',
                    explanation: item.explanation || ''
                });
            });
        }
    }

    return wrongQuestions;
}

/**
 * 콘텐츠 ID 추출
 * URL 파라미터, 파일명, 또는 문서 제목에서 추출
 */
function getContentId() {
    // URL 파라미터에서 contentId 확인
    const urlParams = new URLSearchParams(window.location.search);
    const contentIdParam = urlParams.get('contentId');
    if (contentIdParam) return contentIdParam;

    // 파일명에서 추출 (확장자 제거)
    const filename = window.location.pathname.split('/').pop();
    if (filename) {
        return filename.replace(/\.html$/, '').toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-가-힣]/g, '');
    }

    // 기본값
    return 'unknown-content';
}

/**
 * 결과 페이지가 표시될 때 자동으로 버튼 추가
 * MutationObserver를 사용하여 결과 페이지 감지
 */
function initLearningCompleteSystem() {
    // DOM 변화 감지
    const observer = new MutationObserver((mutations) => {
        // 결과 페이지가 표시되었는지 확인
        const resultElements = document.querySelectorAll('[style*="결과"], button[onclick*="saveFinalResults"], button[onclick*="이미지 저장"]');

        if (resultElements.length > 0) {
            // 결과 페이지로 판단, 버튼 추가
            addCompleteLearningButton();
        }
    });

    // body 감시 시작
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 페이지 로드 시 이미 결과 페이지인 경우 즉시 버튼 추가
    setTimeout(() => {
        addCompleteLearningButton();
    }, 1000);
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLearningCompleteSystem);
} else {
    initLearningCompleteSystem();
}

// 전역 함수로 노출 (수동 호출 가능)
window.addCompleteLearningButton = addCompleteLearningButton;
window.handleCompleteLearning = handleCompleteLearning;
