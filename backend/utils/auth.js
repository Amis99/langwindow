const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/**
 * JWT 토큰 생성
 */
function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * JWT 토큰 검증
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Authorization 헤더에서 토큰 추출
 */
function extractToken(event) {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;

  if (!authHeader) {
    return null;
  }

  // Bearer 토큰 형식 확인
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 요청에서 사용자 정보 추출 (미들웨어 역할)
 */
function getUserFromRequest(event) {
  const token = extractToken(event);

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  return decoded;
}

/**
 * 관리자 권한 확인
 */
function isAdmin(user) {
  return user && user.role === 'admin';
}

/**
 * 학생 권한 확인
 */
function isStudent(user) {
  return user && user.role === 'student';
}

/**
 * 승인된 사용자인지 확인
 */
function isApproved(user) {
  return user && user.status === 'approved';
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  getUserFromRequest,
  isAdmin,
  isStudent,
  isApproved,
};
