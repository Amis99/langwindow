const { success, unauthorized, serverError } = require('../../utils/response');
const { getUserFromRequest } = require('../../utils/auth');
const { getAllLearningRecords, getAllUsers } = require('../../utils/dynamodb');

exports.handler = async (event) => {
  try {
    const user = getUserFromRequest(event);
    if (!user) return unauthorized('인증이 필요합니다');

    // 전체 학습 기록과 사용자 목록을 병렬로 가져오기
    const [allRecords, allUsers] = await Promise.all([
      getAllLearningRecords(),
      getAllUsers()
    ]);

    // userId를 키로 하는 사용자 맵 생성 (빠른 조회를 위해)
    const userMap = {};
    allUsers.forEach(u => {
      userMap[u.userId] = u;
    });

    // 개인정보를 제외하고 랭킹에 필요한 정보만 포함
    const sanitizedRecords = allRecords.map(record => {
      const recordUser = userMap[record.userId];

      return {
        userId: record.userId,
        userName: recordUser?.name || record.userName || '알 수 없음',
        userSchool: recordUser?.school || record.userSchool || '',
        userGrade: recordUser?.grade || record.userGrade || record.grade || '',
        contentId: record.contentId,
        contentTitle: record.contentTitle,
        totalScore: record.totalScore || record.score || 0,
        correctAnswers: record.correctAnswers || 0,
        wrongAnswers: record.wrongAnswers || 0,
        createdAt: record.createdAt,
        completedAt: record.completedAt,
        endTime: record.endTime
      };
    });

    return success({
      count: sanitizedRecords.length,
      records: sanitizedRecords,
    });
  } catch (err) {
    console.error('GetRankings Error:', err);
    return serverError('랭킹 조회 중 오류가 발생했습니다', err.message);
  }
};
