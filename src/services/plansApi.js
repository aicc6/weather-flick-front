import { http } from '@/lib/http'

// 응답 처리 헬퍼
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = new Error(`HTTP Error: ${response.status}`)
    error.status = response.status
    error.statusText = response.statusText

    try {
      const errorData = await response.json()
      error.data = errorData
    } catch {
      // JSON 파싱 실패 시 기본 에러 메시지 사용
    }

    throw error
  }

  // 응답이 비어있을 수 있으므로 체크
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

// 여행 플랜 생성
export const createTravelPlan = async (planData) => {
  try {
    const response = await http.POST('/api/travel-plans', { body: planData })
    return handleResponse(response)
  } catch (error) {
    console.error('여행 플랜 생성 실패:', error)
    throw error
  }
}

// 사용자의 저장된 플랜 목록 조회
export const getUserPlans = async () => {
  try {
    const response = await http.GET('/api/travel-plans/user')
    return handleResponse(response)
  } catch (error) {
    console.error('사용자 플랜 조회 실패:', error)
    throw error
  }
}

// 특정 플랜 조회
export const getPlanById = async (planId) => {
  try {
    const response = await http.GET(`/api/travel-plans/${planId}`)
    return handleResponse(response)
  } catch (error) {
    console.error('플랜 조회 실패:', error)
    throw error
  }
}

// 플랜 수정
export const updatePlan = async (planId, planData) => {
  try {
    const response = await http.PUT(`/api/travel-plans/${planId}`, {
      body: planData,
    })
    return handleResponse(response)
  } catch (error) {
    console.error('플랜 수정 실패:', error)
    throw error
  }
}

// 플랜 삭제
export const deletePlan = async (planId) => {
  try {
    const response = await http.DELETE(`/api/travel-plans/${planId}`)
    return handleResponse(response)
  } catch (error) {
    console.error('플랜 삭제 실패:', error)
    throw error
  }
}

// 날씨 정보 조회 (여행지 기준)
export const getWeatherInfo = async (destination, startDate, endDate) => {
  try {
    const response = await http.GET('/api/weather/forecast', {
      params: {
        query: {
          destination,
          start_date: startDate,
          end_date: endDate,
        },
      },
    })
    return handleResponse(response)
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
    const response = await http.GET('/api/destinations/recommend', {
      params: {
        query: {
          theme,
          weather_conditions: weatherConditions.join(','),
        },
      },
    })
    return handleResponse(response)
  } catch (error) {
    console.error('여행지 추천 조회 실패:', error)
    throw error
  }
}

// 플랜 공유
export const sharePlan = async (planId, shareData) => {
  try {
    const response = await http.POST(`/api/travel-plans/${planId}/share`, {
      body: shareData,
    })
    return handleResponse(response)
  } catch (error) {
    console.error('플랜 공유 실패:', error)
    throw error
  }
}
