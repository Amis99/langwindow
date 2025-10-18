/**
 * HTTP 응답 헬퍼 함수
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json',
};

/**
 * 성공 응답
 */
function success(data, statusCode = 200) {
  return {
    statusCode,
    headers,
    body: JSON.stringify({
      success: true,
      data,
    }),
  };
}

/**
 * 에러 응답
 */
function error(message, statusCode = 400, details = null) {
  return {
    statusCode,
    headers,
    body: JSON.stringify({
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    }),
  };
}

/**
 * 인증 실패 응답
 */
function unauthorized(message = 'Unauthorized') {
  return error(message, 401);
}

/**
 * 권한 없음 응답
 */
function forbidden(message = 'Forbidden') {
  return error(message, 403);
}

/**
 * Not Found 응답
 */
function notFound(message = 'Not Found') {
  return error(message, 404);
}

/**
 * 서버 에러 응답
 */
function serverError(message = 'Internal Server Error', details = null) {
  console.error('Server Error:', message, details);
  return error(message, 500, details);
}

module.exports = {
  success,
  error,
  unauthorized,
  forbidden,
  notFound,
  serverError,
};
