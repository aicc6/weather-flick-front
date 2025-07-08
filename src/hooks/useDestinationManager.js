import { useState, useCallback } from 'react'

/**
 * 목적지 관리를 위한 커스텀 훅
 * @returns {Object} 목적지 관련 상태와 함수들
 */
export default function useDestinationManager() {
  const [destinationsByDate, setDestinationsByDate] = useState({})

  const addDestination = useCallback((date, destination) => {
    if (
      !date ||
      !destination ||
      (typeof destination === 'string'
        ? destination.trim() === ''
        : !destination.description)
    )
      return

    setDestinationsByDate((prev) => {
      const existing = prev[date] || []

      // 중복 체크 (place_id 기준)
      const isDuplicate =
        destination.place_id &&
        existing.some((dest) => dest.place_id === destination.place_id)

      if (isDuplicate) {
        return prev
      }

      return {
        ...prev,
        [date]: [...existing, destination],
      }
    })
  }, [])

  const removeDestination = useCallback((date, destination) => {
    if (!date || !destination) return

    setDestinationsByDate((prev) => {
      const existing = prev[date] || []
      const filtered = existing.filter(
        (dest) => dest.place_id !== destination.place_id,
      )

      if (filtered.length === 0) {
        const { [date]: _removed, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [date]: filtered,
      }
    })
  }, [])

  const clearDestinations = useCallback((date) => {
    if (!date) return

    setDestinationsByDate((prev) => {
      const { [date]: _removed, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllDestinations = useCallback(() => {
    setDestinationsByDate({})
  }, [])

  const getDestinationsForDate = useCallback(
    (date) => {
      return destinationsByDate[date] || []
    },
    [destinationsByDate],
  )

  const hasDestinations = useCallback(() => {
    return Object.keys(destinationsByDate).some(
      (date) => destinationsByDate[date] && destinationsByDate[date].length > 0,
    )
  }, [destinationsByDate])

  const reorderDestinations = useCallback((date, newOrder) => {
    setDestinationsByDate((prev) => ({
      ...prev,
      [date]: newOrder,
    }))
  }, [])

  // 초기 데이터 설정 (편집 모드용)
  const setInitialDestinations = useCallback((initialData) => {
    if (initialData && typeof initialData === 'object') {
      setDestinationsByDate(initialData)
    }
  }, [])

  // 과거 날짜 삭제 기능 추가
  const removePastDates = useCallback(() => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]

    setDestinationsByDate((prev) => {
      const filtered = {}
      Object.entries(prev).forEach(([date, destinations]) => {
        // 오늘 이후의 날짜만 유지
        if (date >= todayString) {
          filtered[date] = destinations
        }
      })
      return filtered
    })
  }, [])

  // 과거 날짜 개수 확인 함수
  const getPastDatesCount = useCallback(() => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]

    return Object.keys(destinationsByDate).filter((date) => date < todayString)
      .length
  }, [destinationsByDate])

  return {
    destinationsByDate,
    addDestination,
    removeDestination,
    clearDestinations,
    clearAllDestinations,
    getDestinationsForDate,
    hasDestinations,
    reorderDestinations,
    setInitialDestinations,
    removePastDates,
    getPastDatesCount,
  }
}
