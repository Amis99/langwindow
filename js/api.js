/**
 * API 호출 유틸리티
 */

class API {
  /**
   * HTTP 요청 보내기
   */
  static async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 토큰이 있으면 Authorization 헤더 추가
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '요청 처리 중 오류가 발생했습니다');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET 요청
   */
  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST 요청
   */
  static post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT 요청
   */
  static put(endpoint, body = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : null,
    });
  }

  /**
   * DELETE 요청
   */
  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ==================== 인증 API ====================

  /**
   * 회원가입
   */
  static register(email, password, name, school, grade) {
    return this.post(API_CONFIG.ENDPOINTS.REGISTER, {
      email,
      password,
      name,
      school,
      grade,
    });
  }

  /**
   * 로그인
   */
  static login(email, password) {
    return this.post(API_CONFIG.ENDPOINTS.LOGIN, {
      email,
      password,
    });
  }

  /**
   * 현재 사용자 정보
   */
  static getMe() {
    return this.get(API_CONFIG.ENDPOINTS.GET_ME);
  }

  // ==================== 관리자 API ====================

  /**
   * 승인 대기 학생 목록
   */
  static getPendingUsers() {
    return this.get(API_CONFIG.ENDPOINTS.GET_PENDING_USERS);
  }

  /**
   * 학생 승인
   */
  static approveUser(userId) {
    return this.put(`${API_CONFIG.ENDPOINTS.APPROVE_USER}/${userId}`);
  }

  /**
   * 학생 거부
   */
  static rejectUser(userId) {
    return this.put(`${API_CONFIG.ENDPOINTS.REJECT_USER}/${userId}`);
  }

  /**
   * 전체 사용자 목록
   */
  static getAllUsers() {
    return this.get(API_CONFIG.ENDPOINTS.GET_ALL_USERS);
  }

  /**
   * 사용자 삭제
   */
  static deleteUser(userId) {
    return this.delete(`${API_CONFIG.ENDPOINTS.DELETE_USER}/${userId}`);
  }

  /**
   * 콘텐츠 업로드
   */
  static uploadContent(content) {
    return this.post(API_CONFIG.ENDPOINTS.UPLOAD_CONTENT, content);
  }

  /**
   * 전체 학습 기록
   */
  static getAllLearningRecords() {
    return this.get(API_CONFIG.ENDPOINTS.GET_ALL_LEARNING_RECORDS);
  }

  // ==================== 학생 API ====================

  /**
   * 콘텐츠 목록
   */
  static getContents() {
    return this.get(API_CONFIG.ENDPOINTS.GET_CONTENTS);
  }

  /**
   * 콘텐츠 상세
   */
  static getContentDetail(contentId) {
    return this.get(`${API_CONFIG.ENDPOINTS.GET_CONTENT_DETAIL}/${contentId}`);
  }

  /**
   * 학습 기록 저장
   */
  static saveLearningRecord(record) {
    return this.post(API_CONFIG.ENDPOINTS.SAVE_LEARNING_RECORD, record);
  }

  /**
   * 내 학습 기록
   */
  static getMyRecords() {
    return this.get(API_CONFIG.ENDPOINTS.GET_MY_RECORDS);
  }
}

// ==================== 인증 헬퍼 ====================

/**
 * 로그인 처리
 */
function saveAuth(token, user) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * 로그아웃 처리
 */
function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

/**
 * 현재 사용자 정보 가져오기
 */
function getCurrentUser() {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * 로그인 여부 확인
 */
function isAuthenticated() {
  return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * 관리자 여부 확인
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

/**
 * 학생 여부 확인
 */
function isStudent() {
  const user = getCurrentUser();
  return user && user.role === 'student';
}

/**
 * 승인된 학생 여부 확인
 */
function isApprovedStudent() {
  const user = getCurrentUser();
  return user && user.role === 'student' && user.status === 'approved';
}
