const { success, unauthorized, forbidden, serverError } = require('../../utils/response');
const { getUserFromRequest, isAdmin } = require('../../utils/auth');
const { getAllUsers } = require('../../utils/dynamodb');

exports.handler = async (event) => {
  try {
    const admin = getUserFromRequest(event);
    if (!admin) return unauthorized('인증이 필요합니다');
    if (!isAdmin(admin)) return forbidden('관리자만 접근 가능합니다');

    const users = await getAllUsers();
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return success({
      count: usersWithoutPassword.length,
      users: usersWithoutPassword,
    });
  } catch (err) {
    console.error('GetAllUsers Error:', err);
    return serverError('사용자 목록 조회 중 오류가 발생했습니다', err.message);
  }
};
