# 언어의 창 온라인 학습관

국어 학습 콘텐츠를 제공하는 온라인 학습 플랫폼입니다.

## 주요 기능

- **카테고리별 분류**: 문법, 문학, 독해, 고전/중세국어
- **실시간 검색**: 제목, 설명, 태그를 기반으로 한 즉시 검색
- **다양한 정렬**: 최신순, 오래된순, 제목순, 난이도순
- **모달 뷰어**: 학습 콘텐츠를 모달 창에서 바로 열람
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 프로젝트 구조

```
언어의창-학습관/
├── index.html                    # 메인 페이지
├── contents-metadata.json        # 콘텐츠 메타데이터
├── css/
│   └── styles.css               # 스타일시트
├── js/
│   └── main.js                  # 메인 JavaScript
├── contents/                    # 학습 콘텐츠 HTML 파일들
│   ├── 한글 맞춤법 해설 3장 소리에 관한 것 워크북.html
│   ├── 음운 변동 연습1.html
│   └── ...
└── images/
    └── thumbnails/              # 콘텐츠 썸네일 이미지
```

## 새 콘텐츠 추가 방법

### 1. HTML 파일 추가
`contents/` 폴더에 새로운 학습 콘텐츠 HTML 파일을 추가합니다.

### 2. 메타데이터 업데이트
`contents-metadata.json` 파일의 `contents` 배열에 새 항목을 추가합니다:

```json
{
  "id": "unique-content-id",
  "title": "콘텐츠 제목",
  "category": "grammar",
  "subcategory": "맞춤법",
  "description": "콘텐츠 설명",
  "difficulty": "중급",
  "filename": "파일명.html",
  "thumbnailUrl": "images/thumbnails/thumbnail.png",
  "uploadDate": "2025-01-17",
  "estimatedTime": "30분",
  "tags": ["태그1", "태그2"],
  "stages": ["딥러서치", "OX퀴즈", "객관식"]
}
```

### 3. 카테고리 종류
- `grammar`: 문법
- `literature`: 문학
- `reading`: 독해
- `classical`: 고전/중세국어

### 4. 난이도 종류
- `기초`: 기초 수준
- `중급`: 중급 수준
- `심화`: 심화 수준
- `고급`: 고급 수준

## GitHub Pages 배포 방법

### 1. GitHub 리포지토리 생성

1. GitHub에 로그인
2. 새 리포지토리 생성 (예: `language-learning-platform`)
3. Public으로 설정

### 2. 코드 업로드

```bash
# Git 초기화
cd "C:\Users\RENEWCOM PC\Documents\claude-code\언어의창-학습관"
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 언어의 창 온라인 학습관"

# 원격 리포지토리 연결 (본인의 GitHub 계정으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/language-learning-platform.git

# 푸시
git branch -M main
git push -u origin main
```

### 3. GitHub Pages 활성화

1. GitHub 리포지토리의 **Settings** 탭으로 이동
2. 좌측 메뉴에서 **Pages** 선택
3. **Source**를 `Deploy from a branch`로 설정
4. **Branch**를 `main` / `/ (root)` 선택
5. **Save** 클릭

몇 분 후 `https://YOUR_USERNAME.github.io/language-learning-platform/` 에서 사이트에 접속할 수 있습니다.

## 가비아 커스텀 도메인 연결 (선택사항)

### 1. GitHub Pages 설정

1. GitHub Pages 설정에서 **Custom domain**에 도메인 입력 (예: `learn.yourdomain.com`)
2. **Enforce HTTPS** 체크

### 2. 가비아 DNS 설정

1. 가비아 관리 콘솔 로그인
2. 도메인 관리 > DNS 정보 선택
3. 다음 레코드 추가:

**A 레코드** (apex domain 사용 시):
```
@ → 185.199.108.153
@ → 185.199.109.153
@ → 185.199.110.153
@ → 185.199.111.153
```

**CNAME 레코드** (서브도메인 사용 시):
```
learn → YOUR_USERNAME.github.io
```

4. DNS 전파 대기 (최대 24시간)

## 기술 스택

- **HTML5**: 구조 및 마크업
- **CSS3**: 스타일링 및 애니메이션
- **JavaScript (ES6+)**: 동적 기능 구현
- **JSON**: 데이터 관리
- **GitHub Pages**: 호스팅

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이선스

Copyright 2025 언어의 창 온라인 학습관. All rights reserved.

## 문의

- GitHub Issues를 통해 버그 리포트 및 기능 요청
- 이메일: contact@yourdomain.com
