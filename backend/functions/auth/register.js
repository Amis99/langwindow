const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { success, error, serverError } = require('../../utils/response');
const { createUser, getUserByEmail } = require('../../utils/dynamodb');

/**
 * 학생 회원가입
 * POST /auth/register
 *
 * Body:
 * {
 *   "email": "student@school.com",
 *   "password": "password123",
 *   "name": "홍길동",
 *   "school": "서울고등학교",
 *   "grade": "2학년"
 * }
 */
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    // 필수 필드 검증
    const { email, password, name, school, grade } = body;

    if (!email || !password || !name || !school || !grade) {
      return error('모든 필드를 입력해주세요');
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return error('올바른 이메일 형식이 아닙니다');
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return error('비밀번호는 최소 6자 이상이어야 합니다');
    }

    // 이미 존재하는 이메일 확인
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return error('이미 등록된 이메일입니다');
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    const newUser = {
      userId: uuidv4(),
      email,
      password: hashedPassword,
      name,
      school,
      grade,
      role: 'student',
      status: 'pending', // 관리자 승인 대기
      createdAt: new Date().toISOString(),
    };

    await createUser(newUser);

    // 응답 시 비밀번호 제외
    const { password: _, ...userWithoutPassword } = newUser;

    return success({
      message: '회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.',
      user: userWithoutPassword,
    }, 201);

  } catch (err) {
    console.error('Register Error:', err);
    return serverError('회원가입 처리 중 오류가 발생했습니다', err.message);
  }
};
