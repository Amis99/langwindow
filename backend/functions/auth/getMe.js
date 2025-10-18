const { success, unauthorized, serverError } = require('../../utils/response');
const { getUserFromRequest } = require('../../utils/auth');
const { getUserById } = require('../../utils/dynamodb');

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /auth/me
 *
 * Headers:
 *   Authorization: Bearer <token>
 */
exports.handler = async (event) => {
  try {
    // 토큰에서 사용자 정보 추출
    const tokenUser = getUserFromRequest(event);

    if (!tokenUser) {
      return unauthorized('인증이 필요합니다');
    }

    // DB에서 최신 사용자 정보 조회
    const user = await getUserById(tokenUser.userId);

    if (!user) {
      return unauthorized('사용자를 찾을 수 없습니다');
    }

    // 응답 시 비밀번호 제외
    const { password: _, ...userWithoutPassword } = user;

    return success({
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error('GetMe Error:', err);
    return serverError('사용자 정보 조회 중 오류가 발생했습니다', err.message);
  }
};
