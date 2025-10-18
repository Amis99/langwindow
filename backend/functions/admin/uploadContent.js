const { v4: uuidv4 } = require('uuid');
const { success, error, unauthorized, forbidden, serverError } = require('../../utils/response');
const { getUserFromRequest, isAdmin } = require('../../utils/auth');
const { createContent } = require('../../utils/dynamodb');

/**
 * 콘텐츠 업로드
 * POST /admin/content/upload
 *
 * Body:
 * {
 *   "title": "새로운 콘텐츠",
 *   "category": "grammar",
 *   "subcategory": "맞춤법",
 *   "description": "설명",
 *   "difficulty": "중급",
 *   "filename": "content.html",
 *   "thumbnailUrl": "...",
 *   "estimatedTime": "30분",
 *   "tags": ["태그1", "태그2"],
 *   "stages": ["딥러서치", "OX퀴즈"]
 * }
 */
exports.handler = async (event) => {
  try {
    const admin = getUserFromRequest(event);
    if (!admin) return unauthorized('인증이 필요합니다');
    if (!isAdmin(admin)) return forbidden('관리자만 접근 가능합니다');

    const body = JSON.parse(event.body || '{}');
    const {
      title,
      category,
      subcategory,
      description,
      difficulty,
      filename,
      thumbnailUrl,
      estimatedTime,
      tags,
      stages,
    } = body;

    // 필수 필드 검증
    if (!title || !category || !filename) {
      return error('필수 필드를 입력해주세요');
    }

    // 새 콘텐츠 생성
    const newContent = {
      contentId: uuidv4(),
      title,
      category,
      subcategory: subcategory || '',
      description: description || '',
      difficulty: difficulty || '중급',
      filename,
      thumbnailUrl: thumbnailUrl || '',
      uploadDate: new Date().toISOString().split('T')[0],
      estimatedTime: estimatedTime || '30분',
      tags: tags || [],
      stages: stages || ['딥러서치', 'OX퀴즈', '객관식'],
      uploadedBy: admin.userId,
      uploadedByName: admin.name,
    };

    await createContent(newContent);

    return success({
      message: '콘텐츠가 업로드되었습니다',
      content: newContent,
    }, 201);
  } catch (err) {
    console.error('UploadContent Error:', err);
    return serverError('콘텐츠 업로드 중 오류가 발생했습니다', err.message);
  }
};
