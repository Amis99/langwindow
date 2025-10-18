const { success, unauthorized, forbidden, serverError } = require('../../utils/response');
const { getUserFromRequest, isAdmin } = require('../../utils/auth');
const { getPendingUsers } = require('../../utils/dynamodb');

/**
 * 승인 대기 중인 학생 목록 조회
 * GET /admin/pending-users
 *
 * Headers:
 *   Authorization: Bearer <token>
 */
exports.handler = async (event) => {
  try {
    // 관리자 권한 확인
    const user = getUserFromRequest(event);

    if (!user) {
      return unauthorized('인증이 필요합니다');
    }

    if (!isAdmin(user)) {
      return forbidden('관리자만 접근 가능합니다');
    }

    // 승인 대기 중인 사용자 목록 가져오기
    const pendingUsers = await getPendingUsers();

    // 비밀번호 제거
    const usersWithoutPassword = pendingUsers.map(({ password, ...user }) => user);

    return success({
      count: usersWithoutPassword.length,
      users: usersWithoutPassword,
    });

  } catch (err) {
    console.error('GetPendingUsers Error:', err);
    return serverError('승인 대기 목록 조회 중 오류가 발생했습니다', err.message);
  }
};
