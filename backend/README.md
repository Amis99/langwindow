# 언어의 창 학습관 - 백엔드 API

AWS Lambda + API Gateway + DynamoDB 기반 서버리스 백엔드입니다.

## 📋 목차

- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [사전 요구사항](#사전-요구사항)
- [설치 및 설정](#설치-및-설정)
- [배포](#배포)
- [API 엔드포인트](#api-엔드포인트)
- [환경 변수](#환경-변수)

## 🛠 기술 스택

- **Runtime**: Node.js 22.x
- **Framework**: Serverless Framework
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## 📁 프로젝트 구조

```
backend/
├── functions/              # Lambda 함수들
│   ├── auth/              # 인증 관련
│   │   ├── register.js    # 학생 회원가입
│   │   ├── login.js       # 로그인
│   │   └── getMe.js       # 현재 사용자 정보
│   ├── admin/             # 관리자 기능
│   │   ├── getPendingUsers.js
│   │   ├── approveUser.js
│   │   ├── rejectUser.js
│   │   ├── getAllUsers.js
│   │   ├── deleteUser.js
│   │   ├── uploadContent.js
│   │   └── getAllLearningRecords.js
│   └── student/           # 학생 기능
│       ├── getContents.js
│       ├── getContentDetail.js
│       ├── saveLearningRecord.js
│       └── getMyRecords.js
├── utils/                 # 공통 유틸리티
│   ├── response.js        # HTTP 응답 헬퍼
│   ├── auth.js            # JWT 인증 헬퍼
│   └── dynamodb.js        # DynamoDB 헬퍼
├── scripts/               # 스크립트
│   └── createAdmin.js     # 관리자 계정 생성
├── package.json
├── serverless.yml         # Serverless Framework 설정
└── README.md
```

## 📦 사전 요구사항

1. **Node.js** (v18 이상)
2. **npm** 또는 **yarn**
3. **AWS CLI** 설치 및 설정
4. **AWS 계정**

## 🚀 설치 및 설정

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. AWS CLI 설정

```bash
# AWS CLI 설치 (Windows)
# https://aws.amazon.com/cli/ 에서 다운로드

# AWS 자격증명 설정
aws configure
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region name: ap-northeast-2
# Default output format: json
```

### 3. Serverless Framework 설치 (전역)

```bash
npm install -g serverless
```

## 🔧 배포

### 1. 배포 명령어

```bash
# 개발 환경 배포
npm run deploy

# 또는
serverless deploy

# 프로덕션 배포
serverless deploy --stage prod
```

배포가 완료되면 다음과 같은 출력이 표시됩니다:

```
Service Information
service: langwindow-backend
stage: dev
region: ap-northeast-2
api keys:
  None
endpoints:
  POST - https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/auth/register
  POST - https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/auth/login
  ...
```

**API Gateway URL**을 복사해두세요. 프론트엔드에서 사용합니다.

### 2. 초기 관리자 계정 생성

배포 후 첫 관리자 계정을 생성해야 합니다:

```bash
# 환경 변수 설정 (Windows PowerShell)
$env:USERS_TABLE="langwindow-backend-users-dev"

# 관리자 계정 생성
node scripts/createAdmin.js admin@example.com YourPassword123! 관리자이름
```

### 3. 배포 제거 (필요시)

```bash
serverless remove
```

## 📡 API 엔드포인트

### 인증 (Auth)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | 학생 회원가입 | No |
| POST | `/auth/login` | 로그인 | No |
| GET | `/auth/me` | 현재 사용자 정보 | Yes |

### 관리자 (Admin)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/pending-users` | 승인 대기 학생 목록 | Admin |
| PUT | `/admin/approve-user/{userId}` | 학생 승인 | Admin |
| PUT | `/admin/reject-user/{userId}` | 학생 거부 | Admin |
| GET | `/admin/users` | 전체 사용자 목록 | Admin |
| DELETE | `/admin/user/{userId}` | 사용자 삭제 | Admin |
| POST | `/admin/content/upload` | 콘텐츠 업로드 | Admin |
| GET | `/admin/learning-records` | 전체 학습 기록 | Admin |

### 학생 (Student)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/student/contents` | 콘텐츠 목록 | Student (Approved) |
| GET | `/student/content/{contentId}` | 콘텐츠 상세 | Student (Approved) |
| POST | `/student/learning-record` | 학습 기록 저장 | Student (Approved) |
| GET | `/student/my-records` | 내 학습 기록 | Student (Approved) |

## 🔑 환경 변수

Serverless Framework가 자동으로 관리하지만, 로컬 테스트 시 필요합니다:

```bash
USERS_TABLE=langwindow-backend-users-dev
CONTENTS_TABLE=langwindow-backend-contents-dev
LEARNING_RECORDS_TABLE=langwindow-backend-learning-records-dev
JWT_SECRET=your-secret-key-change-this-in-production
STAGE=dev
```

## 🧪 API 테스트 예시

### 1. 로그인

```bash
curl -X POST https://your-api-url/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourPassword123!"
  }'
```

### 2. 현재 사용자 정보 조회

```bash
curl -X GET https://your-api-url/dev/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 💰 예상 AWS 비용

**월 사용량 (학생 100명 기준):**

- **API Gateway**: $3.50/월 (100만 요청)
- **Lambda**: 프리티어 범위 내 ($0)
- **DynamoDB**: 프리티어 범위 내 또는 $1-2/월
- **S3**: $1-3/월 (스토리지)

**총 예상 비용: $5-10/월**

## 📄 라이선스

Copyright 2025 언어의 창 온라인 학습관. All rights reserved.

## 🤝 기여

- GitHub Issues를 통해 버그 리포트 및 기능 요청
- Pull Request 환영

## 📞 문의

- Email: itsme0215@hanmail.net
- GitHub: @Amis99
