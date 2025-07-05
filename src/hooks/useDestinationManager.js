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

      // 중복 체크 (description 기준)
      const isDuplicate = existing.some((dest) => {
        if (typeof dest === 'string' && typeof destination === 'string') {
          return dest === destination
        } else if (
          typeof dest === 'object' &&
          typeof destination === 'object'
        ) {
          return dest.description === destination.description
        } else if (
          typeof dest === 'object' &&
          typeof destination === 'string'
        ) {
          return dest.description === destination
        } else if (
          typeof dest === 'string' &&
          typeof destination === 'object'
        ) {
          return dest === destination.description
        }
        return false
      })
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
      const filtered = existing.filter((dest) => {
        if (typeof dest === 'string' && typeof destination === 'string') {
          return dest !== destination
        } else if (
          typeof dest === 'object' &&
          typeof destination === 'object'
        ) {
          return dest.description !== destination.description
        } else if (
          typeof dest === 'object' &&
          typeof destination === 'string'
        ) {
          return dest.description !== destination
        } else if (
          typeof dest === 'string' &&
          typeof destination === 'object'
        ) {
          return dest !== destination.description
        }
        return true
      })

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

  return {
    destinationsByDate,
    addDestination,
    removeDestination,
    clearDestinations,
    clearAllDestinations,
    getDestinationsForDate,
    hasDestinations,
    reorderDestinations,
  }
}
