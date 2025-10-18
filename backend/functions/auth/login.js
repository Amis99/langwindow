const bcrypt = require('bcryptjs');
const { success, error, serverError } = require('../../utils/response');
const { getUserByEmail } = require('../../utils/dynamodb');
const { generateToken } = require('../../utils/auth');

/**
 * 로그인 (관리자 및 학생 공통)
 * POST /auth/login
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 */
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const { email, password } = body;

    // 필수 필드 검증
    if (!email || !password) {
      return error('이메일과 비밀번호를 입력해주세요');
    }

    // 사용자 찾기
    const user = await getUserByEmail(email);

    if (!user) {
      return error('이메일 또는 비밀번호가 올바르지 않습니다', 401);
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return error('이메일 또는 비밀번호가 올바르지 않습니다', 401);
    }

    // 학생의 경우 승인 상태 확인
    if (user.role === 'student' && user.status !== 'approved') {
      if (user.status === 'pending') {
        return error('관리자 승인 대기 중입니다', 403);
      } else if (user.status === 'rejected') {
        return error('회원가입이 거부되었습니다. 관리자에게 문의하세요', 403);
      }
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status,
    });

    // 응답 시 비밀번호 제외
    const { password: _, ...userWithoutPassword } = user;

    return success({
      message: '로그인 성공',
      token,
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error('Login Error:', err);
    return serverError('로그인 처리 중 오류가 발생했습니다', err.message);
  }
};
