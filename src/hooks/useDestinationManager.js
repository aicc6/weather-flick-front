import { useState, useCallback } from 'react'

/**
 * 목적지 관리를 위한 커스텀 훅
 * @returns {Object} 목적지 관련 상태와 함수들
 */
export default function useDestinationManager() {
  const [destinationsByDate, setDestinationsByDate] = useState({})

  const addDestination = useCallback((date, destination) => {
    if (!date || !destination || destination.trim() === '') return

    setDestinationsByDate(prev => {
      const existing = prev[date] || []
      
      // 중복 체크
      if (existing.includes(destination)) {
        return prev
      }

      return {
        ...prev,
        [date]: [...existing, destination]
      }
    })
  }, [])

  const removeDestination = useCallback((date, destination) => {
    if (!date || !destination) return

    setDestinationsByDate(prev => {
      const existing = prev[date] || []
      const filtered = existing.filter(dest => dest !== destination)
      
      if (filtered.length === 0) {
        const { [date]: removed, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [date]: filtered
      }
    })
  }, [])

  const clearDestinations = useCallback((date) => {
    if (!date) return

    setDestinationsByDate(prev => {
      const { [date]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllDestinations = useCallback(() => {
    setDestinationsByDate({})
  }, [])

  const getDestinationsForDate = useCallback((date) => {
    return destinationsByDate[date] || []
  }, [destinationsByDate])

  const hasDestinations = useCallback(() => {
    return Object.keys(destinationsByDate).some(date => 
      destinationsByDate[date] && destinationsByDate[date].length > 0
    )
  }, [destinationsByDate])

  return {
    destinationsByDate,
    addDestination,
    removeDestination,
    clearDestinations,
    clearAllDestinations,
    getDestinationsForDate,
    hasDestinations,
  }
}