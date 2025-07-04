import { useState, useCallback, useRef, useMemo } from 'react'

/**
 * 목적지 검색 및 자동완성을 위한 커스텀 훅
 * @returns {Object} 검색 관련 상태와 함수들
 */
export default function useDestinationSearch() {
  const [destInputs, setDestInputs] = useState({})
  const [destSuggestions, setDestSuggestions] = useState({})
  const [showDestDropdown, setShowDestDropdown] = useState({})
  const [activeDateInput, setActiveDateInput] = useState('')

  const debounceTimers = useRef({})

  const searchDestinations = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      return []
    }

    try {
      const response = await fetch(
        `/api/destinations/search?q=${encodeURIComponent(query)}`,
      )
      if (!response.ok) {
        throw new Error('검색 실패')
      }

      const data = await response.json()
      return data.suggestions || []
    } catch (error) {
      console.error('목적지 검색 오류:', error)
      return []
    }
  }, [])

  const updateDestInput = useCallback(
    (date, value) => {
      setDestInputs((prev) => ({
        ...prev,
        [date]: value,
      }))

      // 기존 타이머 클리어
      if (debounceTimers.current[date]) {
        clearTimeout(debounceTimers.current[date])
      }

      // 디바운스 검색
      if (value.trim().length >= 2) {
        debounceTimers.current[date] = setTimeout(async () => {
          const suggestions = await searchDestinations(value)
          setDestSuggestions((prev) => ({
            ...prev,
            [date]: suggestions,
          }))
          setShowDestDropdown((prev) => ({
            ...prev,
            [date]: suggestions.length > 0,
          }))
        }, 300)
      } else {
        setDestSuggestions((prev) => ({
          ...prev,
          [date]: [],
        }))
        setShowDestDropdown((prev) => ({
          ...prev,
          [date]: false,
        }))
      }
    },
    [searchDestinations],
  )

  const clearDestInput = useCallback((date) => {
    setDestInputs((prev) => {
      const { [date]: removed, ...rest } = prev
      return rest
    })
    setDestSuggestions((prev) => {
      const { [date]: removed, ...rest } = prev
      return rest
    })
    setShowDestDropdown((prev) => {
      const { [date]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const hideDropdown = useCallback((date) => {
    setShowDestDropdown((prev) => ({
      ...prev,
      [date]: false,
    }))
  }, [])

  const showDropdown = useCallback(
    (date) => {
      if (destSuggestions[date]?.length > 0) {
        setShowDestDropdown((prev) => ({
          ...prev,
          [date]: true,
        }))
        setActiveDateInput(date)
      }
    },
    [destSuggestions],
  )

  const clearAllInputs = useCallback(() => {
    // 모든 타이머 클리어
    Object.values(debounceTimers.current).forEach((timer) => {
      if (timer) clearTimeout(timer)
    })
    debounceTimers.current = {}

    setDestInputs({})
    setDestSuggestions({})
    setShowDestDropdown({})
    setActiveDateInput('')
  }, [])

  const memoizedReturn = useMemo(
    () => ({
      destInputs,
      destSuggestions,
      showDestDropdown,
      activeDateInput,
      updateDestInput,
      clearDestInput,
      hideDropdown,
      showDropdown,
      clearAllInputs,
    }),
    [
      destInputs,
      destSuggestions,
      showDestDropdown,
      activeDateInput,
      updateDestInput,
      clearDestInput,
      hideDropdown,
      showDropdown,
      clearAllInputs,
    ],
  )

  return memoizedReturn
}
