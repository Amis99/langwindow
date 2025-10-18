const { success, error, unauthorized, notFound, serverError } = require('../../utils/response');
const { getUserFromRequest, isApproved } = require('../../utils/auth');
const { getContentById } = require('../../utils/dynamodb');

exports.handler = async (event) => {
  try {
    const user = getUserFromRequest(event);
    if (!user) return unauthorized('인증이 필요합니다');
    if (user.role === 'student' && !isApproved(user)) {
      return unauthorized('승인된 학생만 접근 가능합니다');
    }

    const contentId = event.pathParameters?.contentId;
    if (!contentId) return error('contentId가 필요합니다');

    const content = await getContentById(contentId);
    if (!content) return notFound('콘텐츠를 찾을 수 없습니다');

    return success({ content });
  } catch (err) {
    console.error('GetContentDetail Error:', err);
    return serverError('콘텐츠 조회 중 오류가 발생했습니다', err.message);
  }
};
