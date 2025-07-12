/**
 * 안전한 React key 생성 유틸리티 함수들
 */

/**
 * 객체에서 안전한 key 생성
 * @param {Object} item - key를 생성할 객체
 * @param {string} prefix - key 접두사 (선택사항)
 * @param {number} index - 배열 인덱스 (fallback용)
 * @returns {string} 안전한 key 문자열
 */
export const generateSafeKey = (item, prefix = '', index = 0) => {
  const safeId =
    item?.id ||
    item?.course_id ||
    item?.plan_id ||
    item?.route_id ||
    item?.guide_id ||
    index
  const safePrefix = prefix ? `${prefix}-` : ''
  return `${safePrefix}${safeId}`
}

/**
 * 값과 인덱스로 안전한 key 생성
 * @param {string} prefix - key 접두사
 * @param {number|string} index - 인덱스 또는 식별자
 * @param {any} value - 값 (문자열로 변환됨)
 * @returns {string} 안전한 key 문자열
 */
export const generateSafeKeyWithValue = (prefix, index, value) => {
  const safePrefix = prefix || 'item'
  const safeIndex = index ?? 0
  const safeValue =
    value
      ?.toString()
      ?.replace(/\s+/g, '-')
      ?.replace(/[^a-zA-Z0-9-_]/g, '') || 'empty'
  return `${safePrefix}-${safeIndex}-${safeValue}`
}

/**
 * 복합 key 생성 (여러 값 조합)
 * @param {...any} parts - key 구성 요소들
 * @returns {string} 안전한 key 문자열
 */
export const generateCompositeKey = (...parts) => {
  return parts
    .map((part) => {
      if (typeof part === 'object' && part !== null) {
        return part.id || part.course_id || part.plan_id || 'obj'
      }
      return (
        part
          ?.toString()
          ?.replace(/\s+/g, '-')
          ?.replace(/[^a-zA-Z0-9-_]/g, '') || 'empty'
      )
    })
    .join('-')
}

/**
 * 태그나 테마용 안전한 key 생성
 * @param {string} courseId - 코스 ID
 * @param {string} type - 태그 타입 ('list-tag', 'grid-tag' 등)
 * @param {number} index - 배열 인덱스
 * @param {string} tag - 태그 값
 * @returns {string} 안전한 key 문자열
 */
export const generateTagKey = (courseId, type, index, tag) => {
  const safeId = courseId || 'unknown'
  const safeType = type || 'default'
  const safeIndex = index ?? 0
  const safeTag =
    tag
      ?.toString()
      ?.replace(/\s+/g, '-')
      ?.replace(/[^a-zA-Z0-9-_]/g, '') || 'empty'

  return `${safeId}-${safeType}-${safeIndex}-${safeTag}`
}

/**
 * 디버깅용 - key 생성 과정 로그
 * @param {string} key - 생성된 key
 * @param {string} context - 컨텍스트 정보
 */
export const logKeyGeneration = (key, context) => {
  // 개발 중에만 사용하는 로그 함수
  console.log(`[Key Generation] ${context}: ${key}`)
}
