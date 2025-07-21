/**
 * 날짜/시간 포맷팅 유틸리티
 * 모든 시간 정보를 한국 시간(Asia/Seoul)으로 일관되게 표시
 */

// 한국 시간대 상수
const KST_TIMEZONE = 'Asia/Seoul';
const KO_LOCALE = 'ko-KR';

/**
 * 날짜를 한국어 형식으로 포맷 (예: 2025년 1월 20일)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @param {object} options - 추가 포맷 옵션
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '날짜 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: KST_TIMEZONE,
      ...options
    }).format(date);
  } catch (error) {
    console.warn('날짜 형식 오류:', dateString, error);
    return '잘못된 날짜';
  }
};

/**
 * 날짜를 짧은 형식으로 포맷 (예: 2025-01-20)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @param {object} options - 추가 포맷 옵션
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDateShort = (dateString, options = {}) => {
  if (!dateString) return '날짜 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: KST_TIMEZONE,
      ...options
    }).format(date);
  } catch (error) {
    console.warn('날짜 형식 오류:', dateString, error);
    return '잘못된 날짜';
  }
};

/**
 * 날짜와 시간을 함께 포맷 (예: 2025년 1월 20일 오후 2:30)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @param {object} options - 추가 포맷 옵션
 * @returns {string} 포맷된 날짜시간 문자열
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return '날짜 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: KST_TIMEZONE,
      ...options
    }).format(date);
  } catch (error) {
    console.warn('날짜 형식 오류:', dateString, error);
    return '잘못된 날짜';
  }
};

/**
 * 시간만 포맷 (예: 오후 2:30)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @param {object} options - 추가 포맷 옵션
 * @returns {string} 포맷된 시간 문자열
 */
export const formatTime = (dateString, options = {}) => {
  if (!dateString) return '시간 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return new Intl.DateTimeFormat(KO_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: KST_TIMEZONE,
      ...options
    }).format(date);
  } catch (error) {
    console.warn('날짜 형식 오류:', dateString, error);
    return '잘못된 시간';
  }
};

/**
 * 현재 한국 시간의 타임스탬프를 반환
 * @returns {string} 한국 시간 기준 타임스탬프
 */
export const getCurrentTimestamp = () => {
  return new Date().toLocaleTimeString(KO_LOCALE, {
    timeZone: KST_TIMEZONE,
    hour12: false
  });
};

/**
 * 현재 한국 시간의 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns {string} YYYY-MM-DD 형식의 날짜
 */
export const getCurrentDateString = () => {
  const now = new Date();
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: KST_TIMEZONE
  }).format(now);
};

/**
 * 상대적 시간 표시 (예: 2분 전, 1시간 전)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 상대적 시간 문자열
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '시간 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    console.warn('날짜 형식 오류:', dateString, error);
    return '잘못된 날짜';
  }
};

/**
 * 날짜 범위 검증 (여행 계획용)
 * @param {string} startDate - 시작일
 * @param {string} endDate - 종료일
 * @returns {object} 검증 결과 { isValid: boolean, message: string }
 */
export const validateDateRange = (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, message: '올바른 날짜를 입력해주세요.' };
    }
    
    if (start < today) {
      return { isValid: false, message: '시작일은 오늘 이후여야 합니다.' };
    }
    
    if (end < start) {
      return { isValid: false, message: '종료일은 시작일 이후여야 합니다.' };
    }
    
    const diffInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffInDays > 30) {
      return { isValid: false, message: '여행 기간은 30일을 초과할 수 없습니다.' };
    }
    
    return { isValid: true, message: '' };
  } catch (error) {
    return { isValid: false, message: '날짜 검증 중 오류가 발생했습니다.' };
  }
};

/**
 * ISO 문자열을 한국 시간대로 변환하여 Date 객체 반환
 * @param {string} isoString - ISO 8601 형식의 날짜 문자열
 * @returns {Date} 한국 시간대로 변환된 Date 객체
 */
export const parseToKST = (isoString) => {
  if (!isoString) return null;
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // UTC로 파싱된 날짜를 한국 시간대로 조정
    const kstOffset = 9 * 60; // KST는 UTC+9
    const utcOffset = date.getTimezoneOffset();
    const totalOffset = kstOffset + utcOffset;
    
    return new Date(date.getTime() + (totalOffset * 60 * 1000));
  } catch (error) {
    console.warn('ISO 날짜 파싱 오류:', isoString, error);
    return null;
  }
};

// 기본 내보내기
export default {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatTime,
  getCurrentTimestamp,
  getCurrentDateString,
  formatRelativeTime,
  validateDateRange,
  parseToKST
};