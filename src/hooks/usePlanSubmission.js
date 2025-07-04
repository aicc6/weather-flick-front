import { useState, useCallback } from 'react'
import { toast } from 'sonner'

/**
 * 여행 플랜 제출을 위한 커스텀 훅
 * @returns {Object} 제출 관련 상태와 함수들
 */
export default function usePlanSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [plans, setPlans] = useState([])

  const submitPlan = useCallback(async (formData) => {
    const { origin, dateRange, destinationsByDate } = formData

    // 유효성 검증
    if (!origin || !dateRange?.from || !dateRange?.to) {
      toast.error('필수 정보를 모두 입력해주세요.')
      return false
    }

    // 목적지가 있는지 확인
    const hasDestinations = Object.keys(destinationsByDate).some(date => 
      destinationsByDate[date] && destinationsByDate[date].length > 0
    )

    if (!hasDestinations) {
      toast.error('최소 하나의 목적지를 입력해주세요.')
      return false
    }

    setIsSubmitting(true)

    try {
      const requestBody = {
        origin,
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        },
        destinationsByDate,
      }

      const response = await fetch('/api/plan-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.plans) {
        setPlans(result.plans)
        toast.success('맞춤 여행 플랜이 생성되었습니다!')
        return true
      } else {
        throw new Error(result.error || '플랜 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('플랜 제출 오류:', error)
      toast.error(error.message || '플랜 생성 중 오류가 발생했습니다.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const clearPlans = useCallback(() => {
    setPlans([])
  }, [])

  const resetSubmissionState = useCallback(() => {
    setIsSubmitting(false)
    setPlans([])
  }, [])

  return {
    isSubmitting,
    plans,
    submitPlan,
    clearPlans,
    resetSubmissionState,
  }
}