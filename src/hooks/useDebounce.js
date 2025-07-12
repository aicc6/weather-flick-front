import { useState, useEffect } from 'react'

/**
 * 디바운스 커스텀 훅
 * 빠르게 변화하는 값을 지연시켜 성능을 최적화합니다
 *
 * @param {any} value - 디바운스할 값
 * @param {number} delay - 지연 시간 (밀리초)
 * @returns {any} 디바운스된 값
 */
export const useDebounce = (value, delay) => {
  // 디바운스된 값을 저장할 상태
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // delay 후에 값을 업데이트하는 타이머 설정
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 값이 변경되면 이전 타이머를 정리
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// 기본 export로도 제공
export default useDebounce
