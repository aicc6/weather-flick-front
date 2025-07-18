import { useState, useCallback, useRef, useMemo } from 'react'
import { destinationsApi } from '@/store/api'
import { useDispatch } from 'react-redux'

/**
 * RTK Query 기반 목적지 검색 및 자동완성을 위한 커스텀 훅
 * @returns {Object} 검색 관련 상태와 함수들
 */
export default function useDestinationSearchRTK() {
  const [destInputs, setDestInputs] = useState({})
  const [destSuggestions, setDestSuggestions] = useState({})
  const [showDestDropdown, setShowDestDropdown] = useState({})
  const [activeDateInput, setActiveDateInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const dispatch = useDispatch()
  const debounceTimers = useRef({})

  // RTK Query의 imperative 방식으로 검색 수행
  const searchDestinations = useCallback(
    async (date, query) => {
      if (!query || query.trim().length < 2) {
        setDestSuggestions((prev) => ({
          ...prev,
          [date]: [],
        }))
        setShowDestDropdown((prev) => ({
          ...prev,
          [date]: false,
        }))
        return
      }

      try {
        setIsSearching(true)
        setSearchError(null)

        // RTK Query의 initiate 메서드를 사용하여 수동으로 쿼리 실행
        const result = await dispatch(
          destinationsApi.endpoints.searchDestinations.initiate(query.trim()),
        ).unwrap()

        console.log('🔍 목적지 검색 결과:', { query: query.trim(), result })

        const suggestions = result?.suggestions || []
        console.log('📍 검색된 제안:', suggestions)

        setDestSuggestions((prev) => ({
          ...prev,
          [date]: suggestions,
        }))

        setShowDestDropdown((prev) => ({
          ...prev,
          [date]: suggestions.length > 0,
        }))
      } catch (error) {
        console.error('목적지 검색 오류:', error)
        setSearchError(error)
        setDestSuggestions((prev) => ({
          ...prev,
          [date]: [],
        }))
        setShowDestDropdown((prev) => ({
          ...prev,
          [date]: false,
        }))
      } finally {
        setIsSearching(false)
      }
    },
    [dispatch],
  )

  // 목적지 입력 업데이트 및 디바운스 검색
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
        debounceTimers.current[date] = setTimeout(() => {
          searchDestinations(date, value.trim())
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
      const { [date]: _removed, ...rest } = prev
      return rest
    })
    setDestSuggestions((prev) => {
      const { [date]: _removed, ...rest } = prev
      return rest
    })
    setShowDestDropdown((prev) => {
      const { [date]: _removed, ...rest } = prev
      return rest
    })

    // 타이머 클리어
    if (debounceTimers.current[date]) {
      clearTimeout(debounceTimers.current[date])
      delete debounceTimers.current[date]
    }
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
    setIsSearching(false)
    setSearchError(null)
  }, [])

  const setFinalDestinationValue = useCallback((date, value) => {
    // Update the input field state
    setDestInputs((prev) => ({
      ...prev,
      [date]: value,
    }))

    // Clear any pending search timer to prevent re-triggering a search
    if (debounceTimers.current[date]) {
      clearTimeout(debounceTimers.current[date])
    }

    // Clear suggestions and hide the dropdown
    setDestSuggestions((prev) => ({
      ...prev,
      [date]: [],
    }))
    setShowDestDropdown((prev) => ({
      ...prev,
      [date]: false,
    }))
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
      setFinalDestinationValue,
      isSearching, // RTK Query 로딩 상태
      searchError, // RTK Query 에러 상태
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
      setFinalDestinationValue,
      isSearching,
      searchError,
    ],
  )

  return memoizedReturn
}
