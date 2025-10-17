// ========================================
// 전역 변수
// ========================================
let allContents = [];
let filteredContents = [];
let currentCategory = 'all';
let currentSort = 'date-desc';

// ========================================
// 초기화
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadContents();
    setupEventListeners();
});

// ========================================
// 메타데이터 로드
// ========================================
async function loadContents() {
    try {
        const response = await fetch('contents-metadata.json');
        const data = await response.json();
        allContents = data.contents;
        filteredContents = [...allContents];

        updateStats();
        renderContents();
        hideLoading();
    } catch (error) {
        console.error('콘텐츠 로드 실패:', error);
        document.getElementById('loadingIndicator').innerHTML = `
            <p style="color: #E74C3C;">콘텐츠를 불러올 수 없습니다. 페이지를 새로고침해주세요.</p>
        `;
    }
}

// ========================================
// 이벤트 리스너 설정
// ========================================
function setupEventListeners() {
    // 검색 입력
    document.getElementById('searchInput').addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // 카테고리 필터
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-category');
            applyFilters();
        });
    });

    // 정렬
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilters();
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('contentModal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ========================================
// 검색 처리
// ========================================
function handleSearch(query) {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
        filteredContents = filterByCategory(allContents, currentCategory);
    } else {
        filteredContents = allContents.filter(content => {
            return content.title.toLowerCase().includes(lowerQuery) ||
                   content.description.toLowerCase().includes(lowerQuery) ||
                   content.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                   content.subcategory.toLowerCase().includes(lowerQuery);
        });

        // 검색 결과에도 카테고리 필터 적용
        if (currentCategory !== 'all') {
            filteredContents = filteredContents.filter(c => c.category === currentCategory);
        }
    }

    sortContents();
    renderContents();
    updateStats();
}

// ========================================
// 필터 적용
// ========================================
function applyFilters() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();

    // 카테고리 필터
    filteredContents = filterByCategory(allContents, currentCategory);

    // 검색어 필터
    if (searchQuery) {
        filteredContents = filteredContents.filter(content => {
            return content.title.toLowerCase().includes(searchQuery) ||
                   content.description.toLowerCase().includes(searchQuery) ||
                   content.tags.some(tag => tag.toLowerCase().includes(searchQuery));
        });
    }

    sortContents();
    renderContents();
    updateStats();
}

// ========================================
// 카테고리 필터링
// ========================================
function filterByCategory(contents, category) {
    if (category === 'all') {
        return [...contents];
    }
    return contents.filter(c => c.category === category);
}

// ========================================
// 정렬
// ========================================
function sortContents() {
    switch (currentSort) {
        case 'date-desc':
            filteredContents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            break;
        case 'date-asc':
            filteredContents.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
            break;
        case 'title-asc':
            filteredContents.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
            break;
        case 'difficulty':
            const difficultyOrder = { '기초': 1, '중급': 2, '심화': 3, '고급': 4 };
            filteredContents.sort((a, b) =>
                (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0)
            );
            break;
    }
}

// ========================================
// 콘텐츠 렌더링
// ========================================
function renderContents() {
    const grid = document.getElementById('contentsGrid');
    const noResults = document.getElementById('noResults');

    if (filteredContents.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';

    grid.innerHTML = filteredContents.map(content => createContentCard(content)).join('');

    // 카드 클릭 이벤트 추가
    document.querySelectorAll('.content-card').forEach(card => {
        card.addEventListener('click', () => {
            const contentId = card.getAttribute('data-content-id');
            openContent(contentId);
        });
    });
}

// ========================================
// 콘텐츠 카드 생성
// ========================================
function createContentCard(content) {
    const categoryIcon = getCategoryIcon(content.category);
    const categoryColor = getCategoryColor(content.category);
    const difficultyClass = getDifficultyClass(content.difficulty);

    return `
        <div class="content-card" data-content-id="${content.id}">
            <div class="card-thumbnail" style="background: ${categoryColor};">
                ${categoryIcon}
                <div class="card-category-badge">${getCategoryName(content.category)}</div>
            </div>
            <div class="card-body">
                <h3 class="card-title">${content.title}</h3>
                <p class="card-description">${content.description}</p>
                <div class="card-meta">
                    <span class="meta-badge ${difficultyClass}">${content.difficulty}</span>
                    <span class="meta-badge" style="background: #E8F5E9; color: #4CAF50;">
                        ⏱️ ${content.estimatedTime}
                    </span>
                </div>
                <div class="card-stats">
                    <span>📅 ${formatDate(content.uploadDate)}</span>
                    <span>${content.subcategory}</span>
                </div>
                ${content.tags ? `
                <div class="card-tags">
                    ${content.tags.slice(0, 3).map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ========================================
// 유틸리티 함수들
// ========================================
function getCategoryIcon(category) {
    const icons = {
        'grammar': '📚',
        'literature': '📖',
        'reading': '📰',
        'classical': '📜'
    };
    return icons[category] || '📄';
}

function getCategoryColor(category) {
    const colors = {
        'grammar': 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
        'literature': 'linear-gradient(135deg, #E24A4A 0%, #C62828 100%)',
        'reading': 'linear-gradient(135deg, #50C878 0%, #2E7D52 100%)',
        'classical': 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)'
    };
    return colors[category] || 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)';
}

function getCategoryName(category) {
    const names = {
        'grammar': '문법',
        'literature': '문학',
        'reading': '독해',
        'classical': '고전/중세'
    };
    return names[category] || '기타';
}

function getDifficultyClass(difficulty) {
    const classes = {
        '기초': 'difficulty-basic',
        '중급': 'difficulty-intermediate',
        '심화': 'difficulty-advanced',
        '고급': 'difficulty-advanced'
    };
    return classes[difficulty] || 'difficulty-intermediate';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// ========================================
// 통계 업데이트
// ========================================
function updateStats() {
    document.getElementById('totalContents').textContent = allContents.length;
    document.getElementById('filteredCount').textContent = filteredContents.length;
}

// ========================================
// 로딩 인디케이터
// ========================================
function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

// ========================================
// 모달 관련 함수
// ========================================
function openContent(contentId) {
    const content = allContents.find(c => c.id === contentId);
    if (!content) return;

    const modal = document.getElementById('contentModal');
    const modalTitle = document.getElementById('modalTitle');
    const contentFrame = document.getElementById('contentFrame');

    modalTitle.textContent = content.title;
    contentFrame.src = `contents/${content.filename}`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('contentModal');
    const contentFrame = document.getElementById('contentFrame');

    modal.style.display = 'none';
    contentFrame.src = '';
    document.body.style.overflow = 'auto';
}

// ========================================
// 전역 함수로 노출 (HTML에서 사용)
// ========================================
window.closeModal = closeModal;
