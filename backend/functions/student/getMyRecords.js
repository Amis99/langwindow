const { success, unauthorized, serverError } = require('../../utils/response');
const { getUserFromRequest, isApproved } = require('../../utils/auth');
const { getLearningRecordsByUser } = require('../../utils/dynamodb');

/**
 * 내 학습 기록 조회
 * GET /student/my-records
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromRequest(event);
    if (!user) return unauthorized('인증이 필요합니다');
    if (user.role === 'student' && !isApproved(user)) {
      return unauthorized('승인된 학생만 접근 가능합니다');
    }

    const records = await getLearningRecordsByUser(user.userId);

    // 최신순 정렬
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return success({
      count: records.length,
      records,
    });
  } catch (err) {
    console.error('GetMyRecords Error:', err);
    return serverError('학습 기록 조회 중 오류가 발생했습니다', err.message);
  }
};
