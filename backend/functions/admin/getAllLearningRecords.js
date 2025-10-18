const { success, unauthorized, forbidden, serverError } = require('../../utils/response');
const { getUserFromRequest, isAdmin } = require('../../utils/auth');
const { getAllLearningRecords } = require('../../utils/dynamodb');

exports.handler = async (event) => {
  try {
    const admin = getUserFromRequest(event);
    if (!admin) return unauthorized('인증이 필요합니다');
    if (!isAdmin(admin)) return forbidden('관리자만 접근 가능합니다');

    const records = await getAllLearningRecords();

    return success({
      count: records.length,
      records,
    });
  } catch (err) {
    console.error('GetAllLearningRecords Error:', err);
    return serverError('학습 기록 조회 중 오류가 발생했습니다', err.message);
  }
};
