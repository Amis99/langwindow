const { success, error, unauthorized, forbidden, notFound, serverError } = require('../../utils/response');
const { getUserFromRequest, isAdmin } = require('../../utils/auth');
const { getUserById, updateUser } = require('../../utils/dynamodb');

exports.handler = async (event) => {
  try {
    const admin = getUserFromRequest(event);
    if (!admin) return unauthorized('인증이 필요합니다');
    if (!isAdmin(admin)) return forbidden('관리자만 접근 가능합니다');

    const userId = event.pathParameters?.userId;
    if (!userId) return error('userId가 필요합니다');

    const user = await getUserById(userId);
    if (!user) return notFound('사용자를 찾을 수 없습니다');

    const updatedUser = await updateUser(userId, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: admin.userId,
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return success({
      message: '학생이 거부되었습니다',
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('RejectUser Error:', err);
    return serverError('학생 거부 처리 중 오류가 발생했습니다', err.message);
  }
};
