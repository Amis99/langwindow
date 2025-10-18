const { success, unauthorized, forbidden, notFound, serverError } = require('../../utils/response');
const { getUserFromRequest, isAdmin } = require('../../utils/auth');
const { getUserById, updateUser } = require('../../utils/dynamodb');

/**
 * 학생 승인
 * PUT /admin/approve-user/{userId}
 *
 * Headers:
 *   Authorization: Bearer <token>
 */
exports.handler = async (event) => {
  try {
    // 관리자 권한 확인
    const admin = getUserFromRequest(event);

    if (!admin) {
      return unauthorized('인증이 필요합니다');
    }

    if (!isAdmin(admin)) {
      return forbidden('관리자만 접근 가능합니다');
    }

    // userId 추출
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return error('userId가 필요합니다');
    }

    // 사용자 존재 확인
    const user = await getUserById(userId);

    if (!user) {
      return notFound('사용자를 찾을 수 없습니다');
    }

    // 사용자 승인
    const updatedUser = await updateUser(userId, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: admin.userId,
    });

    // 비밀번호 제거
    const { password, ...userWithoutPassword } = updatedUser;

    return success({
      message: '학생이 승인되었습니다',
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error('ApproveUser Error:', err);
    return serverError('학생 승인 처리 중 오류가 발생했습니다', err.message);
  }
};
