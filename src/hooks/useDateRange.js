import { useCallback } from 'react'
import { format, addDays } from 'date-fns'

/**
 * 날짜 범위 관련 유틸리티 훅
 * @returns {Object} 날짜 관련 유틸리티 함수들
 */
export default function useDateRange() {
  const formatDate = useCallback((date) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd')
  }, [])

  const getDatesInRange = useCallback((from, to) => {
    if (!from || !to) return []
    
    const result = []
    let currentDate = new Date(from)
    const endDate = new Date(to)

    while (currentDate <= endDate) {
      result.push(format(currentDate, 'yyyy-MM-dd'))
      currentDate = addDays(currentDate, 1)
    }

    return result
  }, [])

  const isValidDateRange = useCallback((from, to) => {
    if (!from || !to) return false
    return from <= to
  }, [])

  const getDayCount = useCallback((from, to) => {
    if (!from || !to) return 0
    const diffTime = Math.abs(to - from)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }, [])

  return {
    formatDate,
    getDatesInRange,
    isValidDateRange,
    getDayCount,
  }
}