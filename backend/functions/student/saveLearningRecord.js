const { v4: uuidv4 } = require('uuid');
const { success, error, unauthorized, serverError } = require('../../utils/response');
const { getUserFromRequest, isApproved } = require('../../utils/auth');
const { saveLearningRecord } = require('../../utils/dynamodb');

/**
 * 학습 기록 저장
 * POST /student/learning-record
 *
 * Body:
 * {
 *   "contentId": "...",
 *   "contentTitle": "...",
 *   "startTime": "...",
 *   "endTime": "...",
 *   "duration": 1800,
 *   "stages": {...},
 *   "totalScore": 85,
 *   "completed": true,
 *   "progress": 100
 * }
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromRequest(event);
    if (!user) return unauthorized('인증이 필요합니다');
    if (user.role === 'student' && !isApproved(user)) {
      return unauthorized('승인된 학생만 접근 가능합니다');
    }

    const body = JSON.parse(event.body || '{}');
    const {
      contentId,
      contentTitle,
      startTime,
      endTime,
      duration,
      stages,
      totalScore,
      completed,
      progress,
      // 새로운 필드들
      score,
      accuracy,
      timeSpent,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      stagesDetail,
      wrongQuestions,
      timestamp,
    } = body;

    if (!contentId || !contentTitle) {
      return error('필수 필드를 입력해주세요');
    }

    const record = {
      userId: user.userId,
      recordId: `LEARNING#${contentId}#${Date.now()}`,
      contentId,
      contentTitle,
      userName: user.name,
      userEmail: user.email,
      school: user.school,
      grade: user.grade,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date().toISOString(),
      duration: duration || 0,
      stages: stages || stagesDetail || {},
      totalScore: totalScore || score || 0,
      completed: completed || false,
      progress: progress || 100,
      // 추가 상세 정보
      accuracy: accuracy || 0,
      timeSpent: timeSpent || duration || 0,
      totalQuestions: totalQuestions || 0,
      correctAnswers: correctAnswers || 0,
      wrongAnswers: wrongAnswers || 0,
      wrongQuestions: wrongQuestions || [],
      createdAt: timestamp || new Date().toISOString(),
    };

    await saveLearningRecord(record);

    return success({
      message: '학습 기록이 저장되었습니다',
      record,
    }, 201);
  } catch (err) {
    console.error('SaveLearningRecord Error:', err);
    return serverError('학습 기록 저장 중 오류가 발생했습니다', err.message);
  }
};
