/**
 * API 설정
 */
const API_CONFIG = {
  BASE_URL: 'https://9mzh8nus8h.execute-api.ap-northeast-2.amazonaws.com/dev',
  ENDPOINTS: {
    // 인증
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GET_ME: '/auth/me',

    // 관리자
    GET_PENDING_USERS: '/admin/pending-users',
    APPROVE_USER: '/admin/approve-user',
    REJECT_USER: '/admin/reject-user',
    GET_ALL_USERS: '/admin/users',
    DELETE_USER: '/admin/user',
    UPLOAD_CONTENT: '/admin/content/upload',
    GET_ALL_LEARNING_RECORDS: '/admin/learning-records',

    // 학생
    GET_CONTENTS: '/student/contents',
    GET_CONTENT_DETAIL: '/student/content',
    SAVE_LEARNING_RECORD: '/student/learning-record',
    GET_MY_RECORDS: '/student/my-records',
    INCREMENT_LEARNING_COUNT: '/student/content/increment-learning-count',
    GET_RANKINGS: '/student/rankings',
  }
};

// 로컬 스토리지 키
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'current_user',
};
