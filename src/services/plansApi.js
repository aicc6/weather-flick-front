import { http } from '@/lib/http'

// 여행 플랜 생성
export const createTravelPlan = async (planData) => {
  try {
    const response = await http.post('/api/travel-plans', planData)
    return response.data
  } catch (error) {
    console.error('여행 플랜 생성 실패:', error)
    throw error
  }
}

// 사용자의 저장된 플랜 목록 조회
export const getUserPlans = async () => {
  try {
    const response = await http.get('/api/travel-plans/user')
    return response.data
  } catch (error) {
    console.error('사용자 플랜 조회 실패:', error)
    throw error
  }
}

// 특정 플랜 조회
export const getPlanById = async (planId) => {
  try {
    const response = await http.get(`/api/travel-plans/${planId}`)
    return response.data
  } catch (error) {
    console.error('플랜 조회 실패:', error)
    throw error
  }
}

// 플랜 수정
export const updatePlan = async (planId, planData) => {
  try {
    const response = await http.put(`/api/travel-plans/${planId}`, planData)
    return response.data
  } catch (error) {
    console.error('플랜 수정 실패:', error)
    throw error
  }
}

// 플랜 삭제
export const deletePlan = async (planId) => {
  try {
    const response = await http.delete(`/api/travel-plans/${planId}`)
    return response.data
  } catch (error) {
    console.error('플랜 삭제 실패:', error)
    throw error
  }
}

// 날씨 정보 조회 (여행지 기준)
export const getWeatherInfo = async (destination, startDate, endDate) => {
  try {
    const response = await http.get('/api/weather/forecast', {
      params: {
        destination,
        start_date: startDate,
        end_date: endDate,
      },
    })
    return response.data
  } catch (error) {
    console.error('날씨 정보 조회 실패:', error)
    throw error
  }
}

// 여행지 추천 (테마 기반)
export const getDestinationRecommendations = async (
  theme,
  weatherConditions = [],
) => {
  try {
    const response = await http.get('/api/destinations/recommend', {
      params: {
        theme,
        weather_conditions: weatherConditions.join(','),
      },
    })
    return response.data
  } catch (error) {
    console.error('여행지 추천 조회 실패:', error)
    throw error
  }
}

// 플랜 공유
export const sharePlan = async (planId, shareData) => {
  try {
    const response = await http.post(
      `/api/travel-plans/${planId}/share`,
      shareData,
    )
    return response.data
  } catch (error) {
    console.error('플랜 공유 실패:', error)
    throw error
  }
}
