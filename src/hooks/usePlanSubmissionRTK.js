import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useCreateTravelPlanMutation,
  useUpdateTravelPlanMutation,
} from '@/store/api'

/**
 * 여행 플랜 제출을 위한 RTK Query 기반 커스텀 훅
 * @returns {Object} 제출 관련 상태와 함수들
 */
export default function usePlanSubmissionRTK() {
  const [plans, setPlans] = useState([])
  const navigate = useNavigate()

  // RTK Query mutation hooks
  const [createTravelPlan, { isLoading: isCreating, error: createError }] =
    useCreateTravelPlanMutation()
  const [updateTravelPlan, { isLoading: isUpdating, error: updateError }] =
    useUpdateTravelPlanMutation()

  // 통합 로딩 상태
  const isSubmitting = isCreating || isUpdating
  const error = createError || updateError

  const submitPlan = useCallback(
    async (formData, editPlanId = null) => {
      const { origin, dateRange, destinationsByDate } = formData
      const isEditMode = !!editPlanId

      // 유효성 검증
      if (!origin || !dateRange?.from || !dateRange?.to) {
        toast.error('필수 정보를 모두 입력해주세요.')
        return false
      }

      // 목적지가 있는지 확인
      const hasDestinations = Object.keys(destinationsByDate).some(
        (date) =>
          destinationsByDate[date] && destinationsByDate[date].length > 0,
      )

      if (!hasDestinations) {
        toast.error('최소 하나의 목적지를 입력해주세요.')
        return false
      }

      try {
        // 날짜 키를 정렬하여 "Day 1", "Day 2" 순서 보장
        const sortedDates = Object.keys(destinationsByDate).sort()

        const sanitizedItinerary = sortedDates.reduce((acc, dateKey, index) => {
          const dayKey = `Day ${index + 1}`
          const destinations = destinationsByDate[dateKey]

          // 목적지 데이터가 있고, 배열인지 확인
          if (Array.isArray(destinations) && destinations.length > 0) {
            acc[dayKey] = destinations.map((dest) => ({
              description: dest.description,
              place_id: dest.place_id,
            }))
          }
          return acc
        }, {})

        // 플랜 저장용 requestBody 구성
        const requestBody = {
          title: formData.title || `${formData.origin} 여행`,
          description: formData.description || '',
          start_date: dateRange.from.toISOString().slice(0, 10),
          end_date: dateRange.to.toISOString().slice(0, 10),
          budget: formData.budget || 0,
          itinerary: sanitizedItinerary, // 정제된 itinerary 전달
          participants: formData.participants || 1,
          transportation: formData.transportation || '대중교용',
          start_location: origin,
        }

        // RTK Query mutation 실행 (편집 모드에 따라 분기)
        let result
        if (isEditMode) {
          result = await updateTravelPlan({
            planId: editPlanId,
            planData: requestBody,
          }).unwrap()
        } else {
          result = await createTravelPlan(requestBody).unwrap()
        }

        // 성공 처리
        const successMessage = isEditMode
          ? '여행 플랜이 성공적으로 수정되었습니다!'
          : '여행 플랜이 성공적으로 저장되었습니다!'

        toast.success(successMessage, {
          duration: 2000,
          position: 'top-center',
        })
        setPlans([result])

        // 페이지 이동 (편집 모드일 때는 상세 페이지로, 생성 모드일 때는 목록으로)
        setTimeout(() => {
          if (isEditMode) {
            navigate(`/travel-plans/${editPlanId}`)
          } else {
            navigate('/travel-plans')
          }
        }, 1500) // 토스트 메시지를 잠깐 보여준 후 이동

        return true
      } catch (error) {
        console.error('플랜 제출 오류:', error)

        // RTK Query 에러 처리
        const defaultErrorMessage = isEditMode
          ? '플랜 수정 중 오류가 발생했습니다.'
          : '플랜 저장 중 오류가 발생했습니다.'

        const errorMessage =
          error?.data?.message ||
          error?.data?.detail ||
          error?.message ||
          defaultErrorMessage

        toast.error(errorMessage)
        return false
      }
    },
    [createTravelPlan, updateTravelPlan, navigate],
  )

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
    error, // RTK Query 에러 상태 추가
  }
}
