const { success, unauthorized, serverError } = require('../../utils/response');
const { getUserFromRequest, isApproved } = require('../../utils/auth');
const { getAllContents } = require('../../utils/dynamodb');

/**
 * 콘텐츠 목록 조회
 * GET /student/contents
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromRequest(event);

    if (!user) {
      return unauthorized('인증이 필요합니다');
    }

    // 승인된 학생만 접근 가능
    if (user.role === 'student' && !isApproved(user)) {
      return unauthorized('승인된 학생만 접근 가능합니다');
    }

    const contents = await getAllContents();

    return success({
      count: contents.length,
      contents,
    });
  } catch (err) {
    console.error('GetContents Error:', err);
    return serverError('콘텐츠 목록 조회 중 오류가 발생했습니다', err.message);
  }
};
