const { success, error, unauthorized, forbidden, notFound, serverError } = require('../../utils/response');
const { getUserFromRequest, isAdmin } = require('../../utils/auth');
const { getUserById, deleteUser } = require('../../utils/dynamodb');

exports.handler = async (event) => {
  try {
    const admin = getUserFromRequest(event);
    if (!admin) return unauthorized('인증이 필요합니다');
    if (!isAdmin(admin)) return forbidden('관리자만 접근 가능합니다');

    const userId = event.pathParameters?.userId;
    if (!userId) return error('userId가 필요합니다');

    const user = await getUserById(userId);
    if (!user) return notFound('사용자를 찾을 수 없습니다');

    // 관리자는 삭제할 수 없도록
    if (user.role === 'admin') {
      return forbidden('관리자 계정은 삭제할 수 없습니다');
    }

    await deleteUser(userId);

    return success({
      message: '사용자가 삭제되었습니다',
      userId,
    });
  } catch (err) {
    console.error('DeleteUser Error:', err);
    return serverError('사용자 삭제 중 오류가 발생했습니다', err.message);
  }
};
