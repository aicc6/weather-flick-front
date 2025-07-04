import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * API 에러 응답에서 사용자에게 표시할 메시지를 추출합니다
 *
 * Weather Flick 백엔드는 모든 에러를 다음 구조로 표준화합니다:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "사용자에게 표시할 메시지",
 *     "details": [...]  // 선택적
 *   }
 * }
 *
 * @param {Error} error - 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 사용자에게 표시할 에러 메시지
 */
export function extractErrorMessage(
  error,
  defaultMessage = '오류가 발생했습니다.',
) {
  // 1. Weather Flick 백엔드 표준 응답 구조 (최우선)
  if (error.data?.error?.message) {
    return error.data.error.message
  }

  // 2. axios 응답 구조로 래핑된 경우
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message
  }

  // 3. FastAPI 기본 응답 (백엔드에서 사용하지 않지만 혹시 모를 경우)
  if (error.data?.detail) {
    return Array.isArray(error.data.detail)
      ? error.data.detail[0]?.msg || '입력 데이터 검증에 실패했습니다.'
      : error.data.detail
  }

  if (error.response?.data?.detail) {
    return Array.isArray(error.response.data.detail)
      ? error.response.data.detail[0]?.msg || '입력 데이터 검증에 실패했습니다.'
      : error.response.data.detail
  }

  // 4. 네트워크 에러 등 (fetch API 사용 시)
  if (error.message) {
    // 네트워크 에러는 사용자 친화적 메시지로 변환
    if (error.message.includes('fetch')) {
      return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
    }
    if (error.message.includes('NetworkError')) {
      return '네트워크 오류가 발생했습니다.'
    }
    return error.message
  }

  return defaultMessage
}

/**
 * API 에러에서 상세 정보를 추출합니다 (폼 검증 등에 사용)
 * @param {Error} error - 에러 객체
 * @returns {Array} 에러 상세 정보 배열
 */
export function extractErrorDetails(error) {
  // Weather Flick 백엔드 표준 응답
  if (error.data?.error?.details) {
    return error.data.error.details
  }

  // axios 응답 구조
  if (error.response?.data?.error?.details) {
    return error.response.data.error.details
  }

  return []
}
