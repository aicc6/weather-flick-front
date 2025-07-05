import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useCreateTravelPlanMutation } from '@/store/api'

/**
 * 여행 플랜 제출을 위한 RTK Query 기반 커스텀 훅
 * @returns {Object} 제출 관련 상태와 함수들
 */
export default function usePlanSubmissionRTK() {
  const [plans, setPlans] = useState([])
  
  // RTK Query mutation hook
  const [createTravelPlan, { isLoading: isSubmitting, error }] = useCreateTravelPlanMutation()

  const submitPlan = useCallback(async (formData) => {
    const { origin, dateRange, destinationsByDate } = formData

    // 유효성 검증
    if (!origin || !dateRange?.from || !dateRange?.to) {
      toast.error('필수 정보를 모두 입력해주세요.')
      return false
    }

    // 목적지가 있는지 확인
    const hasDestinations = Object.keys(destinationsByDate).some(
      (date) => destinationsByDate[date] && destinationsByDate[date].length > 0,
    )

    if (!hasDestinations) {
      toast.error('최소 하나의 목적지를 입력해주세요.')
      return false
    }

    try {
      // 플랜 저장용 requestBody 구성
      const requestBody = {
        title: formData.title || '맞춤 여행 플랜',
        description: formData.description || '',
        start_date: dateRange.from.toISOString().slice(0, 10),
        end_date: dateRange.to.toISOString().slice(0, 10),
        budget: formData.budget || 0,
        itinerary: {
          origin,
          dateRange: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
          },
          destinationsByDate,
          ...(formData.weatherPreview && {
            weatherPreview: formData.weatherPreview,
          }),
        },
        participants: formData.participants || null,
        transportation: formData.transportation || null,
      }

      // RTK Query mutation 실행
      const result = await createTravelPlan(requestBody).unwrap()

      // 성공 처리
      toast.success('여행 플랜이 성공적으로 저장되었습니다!')
      setPlans([result])
      return true

    } catch (error) {
      console.error('플랜 제출 오류:', error)
      
      // RTK Query 에러 처리
      const errorMessage = error?.data?.message || 
                          error?.data?.detail || 
                          error?.message || 
                          '플랜 저장 중 오류가 발생했습니다.'
      
      toast.error(errorMessage)
      return false
    }
  }, [createTravelPlan])

  const clearPlans = useCallback(() => {
    setPlans([])
  }, [])

  const resetSubmissionState = useCallback(() => {
    setPlans([])
  }, [])

  return {
    isSubmitting,
    plans,
    submitPlan,
    clearPlans,
    resetSubmissionState,
    error // RTK Query 에러 상태 추가
  }
}