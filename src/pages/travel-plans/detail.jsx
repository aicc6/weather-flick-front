import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  useGetTravelPlanQuery,
  useGetTravelPlanRoutesQuery,
  useAutoGenerateRoutesMutation,
  useGetTimemachineRouteInfoQuery,
} from '@/store/api/travelPlansApi'

import {
  WEATHER_ICONS,
  CITY_WEATHER_DEFAULTS,
  weatherCacheUtils,
} from '@/constants/weather'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  Info,
  Edit,
  ArrowLeft,
  MapPin,
  Navigation,
  Zap,
  Route,
  Share2,
} from '@/components/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import EnhancedTransportCard from '@/components/transport/EnhancedTransportCard'
import { CompactDayItinerary } from '@/components/travel'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import SharePlanModal from '@/components/SharePlanModal'

// 안전한 key 생성 유틸리티 함수
const generateSafeKey = (item, prefix = '', index = 0) => {
  const safeId = item?.id || item?.route_id || item?.guide_id || index
  const safePrefix = prefix ? `${prefix}-` : ''
  return `${safePrefix}${safeId}`
}

const formatDate = (dateString) => {
  if (!dateString) return '날짜 정보 없음'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function TravelPlanDetailPage() {
  const { planId } = useParams()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const {
    data: plan,
    isLoading,
    isError,
    error,
  } = useGetTravelPlanQuery(planId)

  // 경로 정보 조회
  const {
    data: routes,
    isLoading: routesLoading,
    error: routesError,
  } = useGetTravelPlanRoutesQuery(planId, {
    skip: !planId,
  })

  // 디버깅을 위한 로그
  console.log('Routes Loading:', routesLoading)
  console.log('Routes Length:', routes?.length || 0)
  console.log('Routes Error:', routesError)
  console.log('Plan ID:', planId)
  console.log('Plan Data:', plan)
  if (plan) {
    console.log('Plan Start Location:', plan.start_location)
    console.log('Plan Destination:', plan.destination)
  }
  if (routes && routes.length > 0) {
    console.log('First Route Sample:', routes[0])
    console.log('Route Fields:', Object.keys(routes[0]))
    console.log('Sample Coordinates:', {
      departure_lat: routes[0].departure_lat,
      departure_lng: routes[0].departure_lng,
      destination_lat: routes[0].destination_lat,
      destination_lng: routes[0].destination_lng,
    })

    // route_data 상세 분석
    if (routes[0]?.route_data) {
      console.log('🛤️ Route Data Analysis:', routes[0].route_data)
      if (routes[0].route_data.sub_paths) {
        console.log(
          '🛤️ Sub Paths Count:',
          routes[0].route_data.sub_paths.length,
        )
        routes[0].route_data.sub_paths.forEach((path, idx) => {
          console.log(`🛤️ Path ${idx + 1}:`, {
            type: path.type,
            stations_count: path.stations?.length || 0,
            line_name: path.lane?.name || path.lane?.busNo,
            start_station: path.start_station,
            end_station: path.end_station,
          })
          if (path.type === 'subway' && path.stations) {
            console.log(
              `🚇 Subway stations for path ${idx + 1}:`,
              path.stations.map((s) => s.station_name || s.stationName),
            )
          }
        })
      }
    }
    console.log('Day Info:', {
      day: routes[0].day,
      sequence: routes[0].sequence,
      route_order: routes[0].route_order,
    })
    console.log(
      'All Routes Day Info:',
      routes.map((r) => ({
        route_order: r.route_order,
        day: r.day,
        sequence: r.sequence,
      })),
    )
  }

  // 자동 경로 생성
  const [autoGenerateRoutes, { isLoading: isGeneratingRoutes }] =
    useAutoGenerateRoutesMutation()

  // 상세 경로 정보 모달 상태
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [isRouteDetailOpen, setIsRouteDetailOpen] = useState(false)

  // 타임머신 경로 정보 조회
  const {
    data: timemachineRouteInfo,
    isLoading: isTimemachineLoading,
    isError: isTimemachineError,
    error: timemachineError,
  } = useGetTimemachineRouteInfoQuery(
    {
      routeId: selectedRoute?.route_id,
      departureTime: null, // 여행 계획 시작일 기준으로 자동 계산
      includeComparison: true, // 여러 경로 옵션 비교
    },
    {
      skip: !selectedRoute?.route_id || !isRouteDetailOpen,
    },
  )

  // 서울 날씨 정보 조회 (백엔드 API 500 에러로 인해 임시 비활성화)
  // const {
  //   data: weatherData,
  //   isLoading: isWeatherLoading,
  //   isError: isWeatherError,
  // } = useGetCurrentWeatherQuery('Seoul', {
  //   skip: !plan,
  // })

  // 한글 도시명을 영어로 변환하는 매핑
  const cityKoreanToEnglish = {
    서울: 'Seoul',
    부산: 'Busan',
    대구: 'Daegu',
    인천: 'Incheon',
    광주: 'Gwangju',
    대전: 'Daejeon',
    울산: 'Ulsan',
    제주: 'Jeju',
    경기: 'Seoul', // 경기도는 서울 날씨로 대체
    강원: 'Gangneung', // 강원도는 강릉 날씨로 대표
    충북: 'Cheongju',
    충남: 'Daejeon', // 충남은 대전 날씨로 대체
    전북: 'Jeonju',
    전남: 'Gwangju', // 전남은 광주 날씨로 대체
    경북: 'Daegu', // 경북은 대구 날씨로 대체
    경남: 'Busan', // 경남은 부산 날씨로 대체
    세종: 'Daejeon', // 세종은 대전 날씨로 대체
  }

  // 위치 정보에서 도시명 추출
  const extractCityFromLocation = (description) => {
    if (!description) return '서울'

    try {
      // 한국 주요 도시명 매핑
      const cityMap = {
        서울: [
          '서울',
          'Seoul',
          '강남',
          '홍대',
          '명동',
          '종로',
          '구로',
          '신도림',
          '영등포',
        ],
        부산: ['부산', 'Busan', '해운대', '광안리', '서면'],
        대구: ['대구', 'Daegu'],
        인천: ['인천', 'Incheon'],
        광주: ['광주', 'Gwangju'],
        대전: ['대전', 'Daejeon'],
        울산: ['울산', 'Ulsan'],
        제주: ['제주', 'Jeju'],
        경기: ['경기', '수원', '성남', '고양', '용인'],
        강원: ['강원', '춘천', '강릉', '속초', '평창', '정선'],
        충북: ['충북', '청주', '제천'],
        충남: ['충남', '천안', '아산'],
        전북: ['전북', '전주', '군산'],
        전남: ['전남', '목포', '순천', '여수'],
        경북: ['경북', '포항', '경주', '안동'],
        경남: ['경남', '창원', '진주', '통영'],
        세종: ['세종'],
      }

      // 설명에서 도시명 찾기
      for (const [city, keywords] of Object.entries(cityMap)) {
        if (keywords.some((keyword) => description.includes(keyword))) {
          return city
        }
      }

      return '서울' // 기본값
    } catch (error) {
      console.warn('도시명 추출 중 오류:', error)
      return '서울'
    }
  }

  // 실제 API를 사용한 날씨 데이터 생성
  const generateApiBasedWeatherForecast = (startDate, itinerary) => {
    if (!startDate || !itinerary) return []

    try {
      const start = new Date(startDate)
      const days = Object.keys(itinerary)
      const forecast = []

      days.forEach((day, index) => {
        const date = new Date(start.getTime() + index * 86400000)
        const dayItinerary = itinerary[day]

        // 해당 일차의 첫 번째 위치를 기준으로 도시 결정
        let city = '서울'
        if (dayItinerary && dayItinerary.length > 0) {
          city = extractCityFromLocation(dayItinerary[0].description)
        }

        forecast.push({
          date: date.toISOString(),
          city,
          day: index + 1,
          // 기본값 설정 (API 호출 실패 시 사용)
          temperature: { min: 15, max: 25 },
          condition: '맑음',
          icon: '☀️',
          humidity: 60,
          precipitation: 0,
        })
      })

      return forecast
    } catch (error) {
      console.error('Failed to generate weather forecast:', error)
      return []
    }
  }

  // 백업용 날씨 데이터 생성 (API 실패 시 사용)
  const _generateFallbackWeatherForecast = (startDate, itinerary) => {
    if (!startDate || !itinerary) return []

    try {
      const start = new Date(startDate)
      const days = Object.keys(itinerary)
      const forecast = []

      // 상수에서 가져온 기본 데이터
      const defaultWeatherData = CITY_WEATHER_DEFAULTS

      days.forEach((day, index) => {
        const date = new Date(start.getTime() + index * 86400000)
        const dayItinerary = itinerary[day]

        // 해당 일차의 첫 번째 위치를 기준으로 도시 결정
        let city = '서울'
        if (dayItinerary && dayItinerary.length > 0) {
          city = extractCityFromLocation(dayItinerary[0].description)
        }

        const weatherData =
          defaultWeatherData[city] || defaultWeatherData['서울']
        const tempVariation = Math.sin(index * 0.5) * 3 // 온도 변화 패턴
        const minTemp = Math.round(
          weatherData.baseTemp + weatherData.offset + tempVariation - 8,
        )
        const maxTemp = Math.round(
          weatherData.baseTemp + weatherData.offset + tempVariation,
        )

        forecast.push({
          date: date.toISOString(),
          condition: weatherData.condition,
          city,
          temperature: {
            min: minTemp,
            max: maxTemp,
          },
          precipitation:
            weatherData.precipitation + Math.floor(Math.random() * 10) - 5,
        })
      })

      return forecast
    } catch (error) {
      console.warn('날씨 예보 생성 중 오류:', error)
      return []
    }
  }

  // 실제 API 기반 날씨 데이터 생성
  const generateWeatherDataWithAPI = async (startDate, itinerary) => {
    if (!startDate || !itinerary)
      return { forecast: [], recommendation: '', isMultiCity: false }

    try {
      const baseForecast = generateApiBasedWeatherForecast(startDate, itinerary)

      // 여러 도시를 방문하는지 확인
      const cities = [...new Set(baseForecast.map((f) => f.city))]
      const isMultiCity = cities.length > 1

      // 실제 API 호출로 날씨 데이터 가져오기 (캐시 활용)
      const forecast = await Promise.all(
        baseForecast.map(async (dayForecast) => {
          try {
            // 한글 도시명을 영어로 변환 (캐시와 API 호출에 사용)
            const englishCityNameForCache = cityKoreanToEnglish[dayForecast.city] || 'Seoul'
            
            // 캐시 키 생성
            const cacheKey = weatherCacheUtils.generateCacheKey(
              englishCityNameForCache,
              dayForecast.date,
            )

            // 캐시에서 데이터 확인
            const cachedData = weatherCacheUtils.get(cacheKey)
            if (cachedData) {
              return {
                ...dayForecast,
                ...cachedData,
                isFromAPI: true,
                isCached: true,
              }
            }

            // 캐시에 없으면 실제 API 호출 - 예보 API 사용
            const forecastDate = new Date(dayForecast.date)
              .toISOString()
              .split('T')[0]
            // 오늘 날짜와 비교하여 현재 날씨 또는 예보 API 선택
            const today = new Date().toISOString().split('T')[0]
            const isToday = forecastDate === today

            // 한글 도시명을 영어로 변환
            const englishCityName = cityKoreanToEnglish[dayForecast.city] || 'Seoul'

            // 현재 날씨와 예보 정보를 모두 가져오기
            const weatherResponse = await fetch(
              `/api/weather/forecast/${englishCityName}?country=KR&days=7`,
            )

            // 현재 날씨 정보도 함께 가져오기 (오늘 날짜인 경우)
            let currentWeatherResponse = null
            if (isToday) {
              try {
                currentWeatherResponse = await fetch(
                  `/api/weather/current/${englishCityName}?country=KR`,
                )
              } catch (error) {
                console.warn('현재 날씨 정보 조회 실패:', error)
              }
            }

            if (weatherResponse.ok) {
              const forecastData = await weatherResponse.json()

              // 현재 날씨 데이터 처리
              let currentWeatherData = null
              if (currentWeatherResponse && currentWeatherResponse.ok) {
                try {
                  currentWeatherData = await currentWeatherResponse.json()
                } catch (error) {
                  console.warn('현재 날씨 데이터 파싱 실패:', error)
                }
              }

              // 해당 날짜의 예보 찾기
              const dayForecastData = forecastData.forecast?.find(
                (f) => f.date === forecastDate,
              )

              let apiData
              if (dayForecastData || currentWeatherData) {
                // 현재 날씨 정보가 있으면 우선 사용, 없으면 예보 정보 사용
                const weatherInfo =
                  currentWeatherData?.current || dayForecastData
                const baseData = dayForecastData || {}

                // API 응답 데이터 구조화 (상세 정보 포함)
                apiData = {
                  condition:
                    weatherInfo?.description ||
                    baseData.description ||
                    dayForecast.condition,
                  icon:
                    getWeatherIconFromDescription(
                      weatherInfo?.description || baseData.description,
                    ) || dayForecast.icon,
                  temperature: {
                    min: baseData.temperature_min
                      ? Math.round(baseData.temperature_min)
                      : dayForecast.temperature?.min,
                    max: baseData.temperature_max
                      ? Math.round(baseData.temperature_max)
                      : dayForecast.temperature?.max,
                    current: weatherInfo?.temperature
                      ? Math.round(weatherInfo.temperature)
                      : null,
                  },
                  feels_like:
                    weatherInfo?.feels_like || baseData.feels_like || null,
                  humidity:
                    weatherInfo?.humidity ||
                    baseData.humidity ||
                    dayForecast.humidity,
                  precipitation: baseData.precipitation_chance || 0,
                  precipitation_chance: baseData.precipitation_chance || 0,
                  wind_speed:
                    weatherInfo?.wind_speed || baseData.wind_speed || null,
                  wind_direction:
                    weatherInfo?.wind_direction ||
                    baseData.wind_direction ||
                    null,
                  pressure: weatherInfo?.pressure || baseData.pressure || null,
                  visibility:
                    weatherInfo?.visibility || baseData.visibility || null,
                  uv_index: weatherInfo?.uv_index || baseData.uv_index || null,
                  // 오늘 날짜 여부 표시
                  isToday: isToday,
                  // 현재 날씨 데이터 사용 여부
                  isCurrentWeather: isToday && currentWeatherData,
                  // 날씨 조건별 추천 메시지 생성
                  recommendation: generateWeatherRecommendation(
                    weatherInfo || baseData,
                  ),
                }
              } else {
                // 해당 날짜의 예보가 없으면 기본값 사용
                apiData = {
                  condition: dayForecast.condition,
                  icon: dayForecast.icon,
                  temperature: dayForecast.temperature || { min: 15, max: 25 },
                  humidity: dayForecast.humidity || 60,
                  precipitation: 0,
                }
              }

              // 캐시에 저장
              weatherCacheUtils.set(cacheKey, apiData)

              return {
                ...dayForecast,
                ...apiData,
                isFromAPI: true,
                isCached: false,
              }
            } else {
              // API 호출 실패 시 fallback 데이터 사용
              return {
                ...dayForecast,
                isFromAPI: false,
                isCached: false,
              }
            }
          } catch (error) {
            console.warn(`날씨 API 호출 실패 (${dayForecast.city}):`, error)
            // 에러 시 fallback 데이터 사용
            return {
              ...dayForecast,
              isFromAPI: false,
              isCached: false,
            }
          }
        }),
      )

      // 실제 방문하는 도시들만 추출 (출발지 제외)
      const visitingCities = []
      const cityVisitCount = {}
      
      // 각 날짜별로 방문하는 도시 파악
      Object.keys(itinerary).forEach((day) => {
        const dayItinerary = itinerary[day]
        if (dayItinerary && dayItinerary.length > 0) {
          dayItinerary.forEach((place) => {
            const city = extractCityFromLocation(place.description)
            if (city) {
              if (!cityVisitCount[city]) {
                cityVisitCount[city] = 0
              }
              cityVisitCount[city]++
            }
          })
        }
      })
      
      // 방문 횟수가 많은 순으로 정렬하여 주요 도시 추출
      const sortedCities = Object.entries(cityVisitCount)
        .sort((a, b) => b[1] - a[1])
        .map(([city]) => city)
      
      // 중복 제거하여 실제 방문 도시 목록 만들기
      const uniqueVisitingCities = [...new Set(sortedCities)]
      const isMultiCityTrip = uniqueVisitingCities.length > 1
      
      let recommendation = ''
      if (isMultiCityTrip) {
        recommendation = `${uniqueVisitingCities.join(', ')} 지역을 여행하시네요. 각 지역의 날씨를 확인하고 적절한 옷차림을 준비하세요.`
      } else if (uniqueVisitingCities.length > 0) {
        recommendation = `${uniqueVisitingCities[0]} 지역 여행입니다. 전반적으로 여행하기 좋은 날씨입니다.`
      } else {
        recommendation = '여행 계획에 따라 날씨를 확인하고 적절한 옷차림을 준비하세요.'
      }
      
      return {
        forecast,
        recommendation,
        isMultiCity: isMultiCityTrip,
      }
    } catch (error) {
      console.warn('날씨 데이터 생성 중 오류:', error)
      // 오류 발생 시 기본 날씨 데이터 반환
      return {
        forecast: [],
        recommendation:
          '날씨 정보를 불러올 수 없습니다. 여행 전 날씨를 확인해 주세요.',
        isMultiCity: false,
      }
    }
  }

  // 날씨 조건별 추천 메시지 생성
  const generateWeatherRecommendation = (weatherData) => {
    if (!weatherData) return null

    const {
      temperature_min,
      temperature_max,
      precipitation_chance,
      humidity,
      wind_speed,
      uv_index,
      description,
    } = weatherData

    const recommendations = []

    // 온도 기반 추천
    if (temperature_max >= 30) {
      recommendations.push(
        '매우 더운 날씨입니다. 충분한 수분 섭취와 그늘에서 휴식을 취하세요.',
      )
    } else if (temperature_max >= 25) {
      recommendations.push('따뜻한 날씨입니다. 가벼운 옷차림을 추천합니다.')
    } else if (temperature_min <= 5) {
      recommendations.push('추운 날씨입니다. 따뜻한 옷과 겉옷을 준비하세요.')
    } else if (temperature_min <= 10) {
      recommendations.push('쌀쌀한 날씨입니다. 가벼운 겉옷을 준비하세요.')
    }

    // 강수 확률 기반 추천
    if (precipitation_chance >= 70) {
      recommendations.push('비 올 확률이 높습니다. 우산을 꼭 챙기세요.')
    } else if (precipitation_chance >= 30) {
      recommendations.push(
        '비 올 가능성이 있습니다. 우산을 준비하는 것이 좋겠습니다.',
      )
    }

    // UV 지수 기반 추천
    if (uv_index >= 8) {
      recommendations.push(
        'UV 지수가 매우 높습니다. 선크림과 모자를 착용하세요.',
      )
    } else if (uv_index >= 6) {
      recommendations.push('UV 지수가 높습니다. 자외선 차단제를 사용하세요.')
    }

    // 풍속 기반 추천
    if (wind_speed >= 20) {
      recommendations.push('바람이 강합니다. 외출 시 주의하세요.')
    }

    // 습도 기반 추천
    if (humidity >= 80) {
      recommendations.push('습도가 높습니다. 통풍이 잘 되는 옷을 입으세요.')
    } else if (humidity <= 30) {
      recommendations.push('습도가 낮습니다. 수분 보충과 보습에 신경 쓰세요.')
    }

    // 날씨 조건별 추천
    if (description && description.includes('눈')) {
      recommendations.push('눈이 예상됩니다. 미끄럼 방지 신발을 신으세요.')
    }

    return recommendations.length > 0 ? recommendations[0] : null
  }

  // 날씨 설명으로부터 아이콘 가져오기
  const getWeatherIconFromDescription = (description) => {
    if (!description) return null

    const iconMap = {
      맑음: '☀️',
      구름조금: '🌤️',
      구름많음: '☁️',
      흐림: '☁️',
      비: '🌧️',
      소나기: '🌦️',
      눈: '🌨️',
      천둥번개: '⛈️',
      안개: '🌫️',
      바람: '💨',
    }

    // 한국어 설명에서 키워드 찾기
    for (const [key, icon] of Object.entries(iconMap)) {
      if (description.includes(key)) {
        return icon
      }
    }

    return '🌤️' // 기본 아이콘
  }

  // 날씨 데이터 상태 관리
  const [weatherData, setWeatherData] = useState({
    forecast: [],
    recommendation: '여행 계획을 불러오는 중입니다...',
    isMultiCity: false,
    lastUpdated: null,
  })
  const [isWeatherLoading, setIsWeatherLoading] = useState(false)

  // 날씨 데이터 로드 함수
  const loadWeatherData = async () => {
    if (!plan?.start_date) return

    setIsWeatherLoading(true)
    try {
      // itinerary가 없는 경우 기본 날씨 데이터 생성
      if (!plan.itinerary || Object.keys(plan.itinerary).length === 0) {
        // 여행 기간만큼 날씨 정보 생성
        const days = tripDuration
        const forecast = []
        const start = new Date(plan.start_date)
        
        // 제목에서 도시 추출 시도 (예: "부산 1박 2일 여행" → "부산")
        let city = '서울'
        if (plan.title) {
          const cityMatch = plan.title.match(/^(서울|부산|대구|인천|광주|대전|울산|제주|강원|충북|충남|전북|전남|경북|경남|세종)/);
          if (cityMatch) {
            city = cityMatch[1];
          }
        }
        
        for (let i = 0; i < days; i++) {
          const date = new Date(start.getTime() + i * 86400000)
          forecast.push({
            date: date.toISOString(),
            city,
            day: i + 1,
            temperature: { min: 15, max: 25 },
            condition: '맑음',
            icon: '☀️',
            humidity: 60,
            precipitation: 0,
          })
        }
        
        setWeatherData({
          forecast,
          recommendation: `${city} 지역 ${days}일간의 날씨 정보입니다. 여행 전 실시간 날씨를 확인해 주세요.`,
          isMultiCity: false,
          lastUpdated: new Date(),
        })
      } else {
        // itinerary가 있는 경우 기존 로직 사용
        const data = await generateWeatherDataWithAPI(
          plan.start_date,
          plan.itinerary,
        )
        setWeatherData({
          ...data,
          lastUpdated: new Date(),
        })
      }
    } catch (error) {
      console.error('날씨 데이터 로드 실패:', error)
      setWeatherData({
        forecast: [],
        recommendation:
          '날씨 정보를 불러올 수 없습니다. 여행 전 날씨를 확인해 주세요.',
        isMultiCity: false,
        lastUpdated: new Date(),
      })
    } finally {
      setIsWeatherLoading(false)
    }
  }

  // 날씨 데이터 로드
  useEffect(() => {
    if (plan) {
      loadWeatherData()
    }
  }, [plan?.start_date, plan?.end_date, plan?.title])

  // 즐겨찾기 상태 확인
  useEffect(() => {
    if (planId) {
      checkBookmarkStatus()
    }
  }, [planId])

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(`/api/travel-plans/${planId}/bookmark/status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      const result = await response.json()
      if (result.success) {
        setIsBookmarked(result.data.bookmarked)
      }
    } catch (error) {
      console.error('즐겨찾기 상태 확인 실패:', error)
    }
  }

  const toggleBookmark = async () => {
    try {
      const response = await fetch(`/api/travel-plans/${planId}/bookmark`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      const result = await response.json()
      if (result.success) {
        setIsBookmarked(result.data.bookmarked)
        toast.success(result.data.message, {
          duration: 2000,
          position: 'bottom-right',
        })
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error)
      toast.error('즐겨찾기 처리 중 오류가 발생했습니다', {
        duration: 3000,
        position: 'bottom-right',
      })
    }
  }

  // 자동 새로고침 기능 (10분마다)
  useEffect(() => {
    if (!plan?.start_date) return

    const interval = setInterval(
      () => {
        console.log('자동 날씨 데이터 새로고침')
        loadWeatherData()
      },
      10 * 60 * 1000,
    ) // 10분마다 새로고침

    return () => clearInterval(interval)
  }, [plan?.start_date, plan?.itinerary])

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (plan?.start_date) {
        console.log('페이지 포커스 시 날씨 데이터 새로고침')
        loadWeatherData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [plan?.start_date, plan?.itinerary])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            여행 계획을 불러오는 중...
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            잠시만 기다려 주세요
          </p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
            여행 계획을 불러올 수 없습니다
          </h3>
          <p className="mb-4 text-red-700 dark:text-red-300">
            일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              새로고침
            </button>
            <button
              onClick={() => window.history.back()}
              className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              뒤로가기
            </button>
          </div>
          {}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-red-600">
                개발자 정보
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-800">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 p-3">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            여행 계획을 찾을 수 없습니다
          </h3>
          <p className="mb-4 text-yellow-700 dark:text-yellow-300">
            요청하신 여행 계획이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <Link
            to="/travel-plans"
            className="inline-flex items-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            여행 계획 목록으로
          </Link>
        </div>
      </div>
    )
  }

  // 개발용 디버깅 로그 (필요시 주석 해제)
  // console.log('Travel plan loaded successfully:', !!plan)

  const itineraryDays = plan.itinerary ? Object.keys(plan.itinerary) : []
  
  // 실제 여행 기간 계산 (start_date와 end_date 기반)
  const calculateTripDuration = () => {
    if (!plan.start_date || !plan.end_date) return 0
    const start = new Date(plan.start_date)
    const end = new Date(plan.end_date)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // 1박 2일인 경우 2일로 계산
    return diffDays
  }
  
  const tripDuration = calculateTripDuration()

  // 수정 페이지로 이동 시 사용자 안내
  const handleEditClick = () => {
    toast.info('수정 페이지로 이동합니다', {
      duration: 2000,
      position: 'bottom-right',
    })
  }

  // 자동 경로 생성 핸들러
  const handleAutoGenerateRoutes = async () => {
    try {
      const result = await autoGenerateRoutes(planId).unwrap()
      toast.success(
        `${result.routes?.length || 0}개의 경로가 생성되었습니다!`,
        {
          duration: 3000,
          position: 'bottom-right',
        },
      )
    } catch {
      toast.error('경로 생성에 실패했습니다', {
        duration: 3000,
        position: 'bottom-right',
      })
    }
  }

  // 시간을 시:분 형태로 변환
  const formatDuration = (minutes) => {
    if (!minutes) return '0분'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins}분`
    }
    return `${mins}분`
  }

  // 거리 형태로 변환
  const formatDistance = (distance) => {
    if (!distance) return '0km'
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  // 비용 형태로 변환
  const formatCost = (cost) => {
    if (!cost) return '무료'
    return `${Math.round(cost).toLocaleString()}원`
  }

  // 대중교통 상세 정보 렌더링
  const renderTransitDetails = (routeData) => {
    if (!routeData) return null

    // ODsay API 응답 (sub_paths)
    if (routeData.sub_paths) {
      const subPaths = routeData.sub_paths
      const transitPaths = subPaths.filter(
        (path) => path.type === 'subway' || path.type === 'bus',
      )

      if (transitPaths.length === 0) return null

      return (
        <div className="mt-2 space-y-1">
          {transitPaths.map((path, index) => (
            <div
              key={generateSafeKey(path, 'transit', index)}
              className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300"
            >
              {path.type === 'subway' && (
                <>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    🚇 {path.lane?.name || path.lane?.busNo || '지하철'}
                  </span>
                  <span>
                    {path.start_station} → {path.end_station}
                  </span>
                  {path.station_count > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      ({path.station_count}개 역)
                    </span>
                  )}
                  {path.section_time > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {path.section_time}분
                    </span>
                  )}
                </>
              )}
              {path.type === 'bus' && (
                <>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    🚌 {path.lane?.busNo || '버스'}
                  </span>
                  <span>
                    {path.start_station} → {path.end_station}
                  </span>
                  {path.station_count > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      ({path.station_count}개 정류장)
                    </span>
                  )}
                  {path.section_time > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {path.section_time}분
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
          {routeData.summary && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {routeData.summary.bus_transit_count > 0 && (
                <span className="mr-3">
                  🚌 버스 환승 {routeData.summary.bus_transit_count}회
                </span>
              )}
              {routeData.summary.subway_transit_count > 0 && (
                <span>
                  🚇 지하철 환승 {routeData.summary.subway_transit_count}회
                </span>
              )}
            </div>
          )}
        </div>
      )
    }

    // Google API 응답 (steps) - 대중교통 단계 분석
    if (routeData.steps) {
      const transitSteps = routeData.steps.filter(
        (step) =>
          step.travel_mode === 'TRANSIT' || step.travel_mode === 'SUBWAY',
      )

      if (transitSteps.length === 0) return null

      return (
        <div className="mt-2 space-y-1">
          {transitSteps.map((step, index) => {
            const transitDetails = step.transit_details || {}
            const line = transitDetails.line || {}
            const vehicle = line.vehicle || {}

            return (
              <div
                key={generateSafeKey(step, 'step', index)}
                className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300"
              >
                {vehicle.type === 'SUBWAY' && (
                  <>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      🚇 {line.short_name || line.name || '지하철'}
                    </span>
                    <span>
                      {transitDetails.departure_stop?.name} →{' '}
                      {transitDetails.arrival_stop?.name}
                    </span>
                    {transitDetails.num_stops > 0 && (
                      <span className="text-gray-600 dark:text-gray-400">
                        ({transitDetails.num_stops}개 역)
                      </span>
                    )}
                  </>
                )}
                {vehicle.type === 'BUS' && (
                  <>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      🚌 {line.short_name || line.name || '버스'}
                    </span>
                    <span>
                      {transitDetails.departure_stop?.name} →{' '}
                      {transitDetails.arrival_stop?.name}
                    </span>
                    {transitDetails.num_stops > 0 && (
                      <span className="text-gray-600 dark:text-gray-400">
                        ({transitDetails.num_stops}개 정류장)
                      </span>
                    )}
                  </>
                )}
              </div>
            )
          })}
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            🗺️ Google Maps 기반 대중교통 경로
          </div>
        </div>
      )
    }

    // 기타 API 응답 - 간단한 정보만 표시
    if (routeData.method) {
      return (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          📊{' '}
          {routeData.method === 'estimated_calculation'
            ? '추정 계산'
            : '기본 계산'}{' '}
          기반
        </div>
      )
    }

    return null
  }

  // 상세 경로 정보 렌더링
  const renderDetailedRouteInfo = (route) => {
    if (!route?.route_data) return null

    const routeData = route.route_data

    return (
      <div className="space-y-4">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatDuration(route.duration)}
            </div>
            <div className="text-sm text-gray-700">소요시간</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatDistance(route.distance)}
            </div>
            <div className="text-sm text-gray-700">이동거리</div>
          </div>
          {route.cost !== undefined && (
            <div className="col-span-2 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCost(route.cost)}
              </div>
              <div className="text-sm text-gray-700">예상 비용</div>
            </div>
          )}
        </div>

        {/* 상세 안내 */}
        {routeData.detailed_guides && routeData.detailed_guides.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center font-semibold text-gray-800">
              <Route className="mr-2 h-4 w-4" />
              상세 경로 안내
            </h4>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {routeData.detailed_guides.map((guide, index) => (
                <div
                  key={generateSafeKey(guide, 'guide', index)}
                  className="flex items-start space-x-3 rounded border bg-white p-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                    {guide.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {guide.description}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-700">
                      <span>📍 {guide.distance}</span>
                      <span>⏱️ {guide.time}</span>
                      {guide.instruction && (
                        <Badge variant="secondary" className="text-xs">
                          {guide.instruction}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 기본 안내점 (detailed_guides가 없을 때) */}
        {(!routeData.detailed_guides ||
          routeData.detailed_guides.length === 0) &&
          routeData.guide_points &&
          routeData.guide_points.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center font-semibold text-gray-800">
                <Navigation className="mr-2 h-4 w-4" />
                경로 안내
              </h4>
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {routeData.guide_points.slice(0, 10).map((point, index) => (
                  <div
                    key={generateSafeKey(point, 'point', index)}
                    className="flex items-start space-x-3 rounded border bg-white p-3"
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {point.description}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-700">
                        {point.distance > 0 && (
                          <span>
                            {point.distance >= 1000
                              ? `${(point.distance / 1000).toFixed(1)}km`
                              : `${point.distance}m`}
                          </span>
                        )}
                        {point.turn_instruction && (
                          <Badge variant="outline" className="text-xs">
                            {point.turn_instruction}
                          </Badge>
                        )}
                        {point.road_name && (
                          <span className="text-gray-600 dark:text-gray-400">
                            • {point.road_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 추가 정보 */}
        {routeData.route_summary && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h4 className="mb-2 font-semibold text-gray-800">경로 요약</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>총 안내점: {routeData.route_summary.total_steps}개</div>
              <div>주요 구간: {routeData.route_summary.major_steps}개</div>
              {routeData.route_summary.estimated_fuel_cost && (
                <div>
                  예상 연료비:{' '}
                  {routeData.route_summary.estimated_fuel_cost.toLocaleString()}
                  원
                </div>
              )}
              {routeData.route_summary.total_cost_estimate && (
                <div>
                  총 예상비용:{' '}
                  {routeData.route_summary.total_cost_estimate.toLocaleString()}
                  원
                </div>
              )}
            </div>
          </div>
        )}

        {/* 데이터 소스 */}
        <div className="flex items-center justify-between rounded bg-gray-100 p-3">
          <div className="text-sm text-gray-600">
            데이터 소스: {routeData.source || '기본'}
          </div>
          {routeData.source === 'TMAP' && (
            <Badge variant="outline">🚌 대중교통정보</Badge>
          )}
        </div>
      </div>
    )
  }

  // 일차별 경로 정보 그룹화
  const groupRoutesByDay = (routes) => {
    if (!routes || !Array.isArray(routes)) return {}

    const grouped = {}
    routes.forEach((route) => {
      const dayKey = `day${route.day}`
      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      grouped[dayKey].push(route)
    })

    // 각 일차별로 sequence 순서로 정렬
    Object.keys(grouped).forEach((day) => {
      grouped[day].sort((a, b) => a.sequence - b.sequence)
    })

    return grouped
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        {/* 상단 네비게이션 및 액션 버튼 */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            asChild
            className="rounded-xl border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <Link to="/travel-plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Link>
          </Button>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* AI 추천 플랜(custom)이 아닌 경우에만 수정하기 버튼 표시 */}
            {plan?.plan_type !== 'custom' && (
              <Button
                asChild
                onClick={handleEditClick}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:from-indigo-600 hover:to-purple-700"
              >
                <Link to={`/planner?planId=${planId}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  수정하기
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* 여행 제목 및 기본 정보 헤더 */}
        <Card className="mb-8 rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="mb-4 text-3xl leading-tight font-bold text-gray-900 dark:text-gray-100">
                  {plan.title}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
                      plan.status === 'CONFIRMED'
                        ? 'border border-green-200 bg-green-100 text-green-700'
                        : plan.status === 'PLANNING'
                          ? 'border border-blue-200 bg-blue-100 text-blue-700'
                          : plan.status === 'IN_PROGRESS'
                            ? 'border border-purple-200 bg-purple-100 text-purple-700'
                            : plan.status === 'COMPLETED'
                              ? 'border border-gray-200 bg-gray-100 text-gray-700'
                              : 'border border-red-200 bg-red-100 text-red-700'
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        plan.status === 'CONFIRMED'
                          ? 'bg-green-500'
                          : plan.status === 'PLANNING'
                            ? 'bg-blue-500'
                            : plan.status === 'IN_PROGRESS'
                              ? 'bg-purple-500'
                              : plan.status === 'COMPLETED'
                                ? 'bg-gray-500'
                                : 'bg-red-500'
                      }`}
                    ></div>
                    {plan.status === 'CONFIRMED'
                      ? '확정'
                      : plan.status === 'PLANNING'
                        ? '계획중'
                        : plan.status === 'IN_PROGRESS'
                          ? '여행중'
                          : plan.status === 'COMPLETED'
                            ? '완료'
                            : '취소'}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-400">
                    <Calendar className="mr-2 inline h-4 w-4" />
                    {formatDate(plan.start_date)} ~ {formatDate(plan.end_date)}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 탭 기반 컨텐츠 */}
        <Tabs defaultValue="itinerary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 rounded-xl bg-gray-100 p-1 dark:bg-gray-700">
            <TabsTrigger
              value="itinerary"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
            >
              <MapPin className="mr-2 h-4 w-4" />
              상세 일정
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
            >
              <span className="mr-2">📊</span>
              요약
            </TabsTrigger>
            <TabsTrigger
              value="transport"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
            >
              <Navigation className="mr-2 h-4 w-4" />
              지하철/버스
            </TabsTrigger>
            <TabsTrigger
              value="weather"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
            >
              <span className="mr-2">☀️</span>
              날씨
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
            >
              <Info className="mr-2 h-4 w-4" />
              정보
            </TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 여행 정보 요약 */}
              <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-100">
                    <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    여행 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.description && (
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {plan.description}
                      </p>
                    </div>
                  )}
                  {plan.start_location && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4 text-green-500 dark:text-green-400" />
                      <span>출발지: {plan.start_location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <span>기간: {tripDuration}일</span>
                  </div>
                </CardContent>
              </Card>

              {/* 여행 통계 */}
              <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-100">
                    <span>📊</span>
                    여행 통계
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {tripDuration}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        여행 일수
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {plan.itinerary
                          ? Object.values(plan.itinerary).flat().length
                          : 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        방문 장소
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {routes ? routes.length : 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        생성된 경로
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {weatherData?.forecast?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        날씨 예보
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 빠른 액션 */}
            <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-100">
                  <Zap className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                  빠른 작업
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {itineraryDays.length > 0 && (
                    <Button
                      onClick={handleAutoGenerateRoutes}
                      disabled={isGeneratingRoutes}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isGeneratingRoutes ? (
                        <Zap className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                      {routes && routes.length > 0
                        ? '경로 재생성'
                        : '자동 경로 생성'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    <Share2 className="h-4 w-4" />
                    공유하기
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={toggleBookmark}
                  >
                    <span>{isBookmarked ? '⭐' : '☆'}</span>
                    {isBookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 일정 탭 - 메인 컨텐츠 */}
          <TabsContent value="itinerary" className="space-y-6">
            {/* 여행 요약 정보 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-400">
                        여행 기간
                      </div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">
                        {tripDuration}일
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-400">
                        방문 장소
                      </div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">
                        {plan.itinerary
                          ? Object.values(plan.itinerary).flat().length
                          : 0}
                        개
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Navigation className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-400">
                        생성된 경로
                      </div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">
                        {routes ? routes.length : 0}개
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 빠른 액션 */}
            <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    빠른 작업
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {itineraryDays.length > 0 && (
                      <Button
                        onClick={handleAutoGenerateRoutes}
                        disabled={isGeneratingRoutes}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700"
                      >
                        {isGeneratingRoutes ? (
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Navigation className="mr-2 h-4 w-4" />
                        )}
                        {routes && routes.length > 0
                          ? '경로 재생성'
                          : '자동 경로 생성'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setIsShareModalOpen(true)}
                    >
                      <Share2 className="h-4 w-4" />
                      공유
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={toggleBookmark}
                    >
                      <span>{isBookmarked ? '⭐' : '☆'}</span>
                      {isBookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 일정 */}
            <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xl text-gray-800 dark:text-gray-100">
                    <MapPin className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    상세 일정
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      날씨 예보 포함
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      대중교통/도보 정보 연결
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itineraryDays.length > 0 ? (
                  <div className="space-y-4">
                    {/* 출발지 정보 표시 */}
                    {plan?.start_location && (
                      <div className="rounded-lg border-2 border-dashed border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                            <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-green-800 dark:text-green-200">
                                🏠 출발지
                              </h4>
                              <Badge
                                variant="outline"
                                className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-400"
                              >
                                여행 시작점
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                              {plan.start_location}
                            </p>
                            {plan.start_date && (
                              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                출발일:{' '}
                                {new Date(plan.start_date).toLocaleDateString(
                                  'ko-KR',
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'short',
                                  },
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 출발지에서 첫 번째 목적지로의 연결선 */}
                    {plan?.start_location && itineraryDays.length > 0 && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="h-px w-8 bg-gray-300"></div>
                          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                            <svg
                              className="h-4 w-4 text-blue-600 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          </div>
                          <div className="h-px w-8 bg-gray-300"></div>
                        </div>
                      </div>
                    )}

                    {itineraryDays.map((day) => {
                      const dayNumber = parseInt(day.replace(/\D/g, ''))
                      const places = plan.itinerary[day] || []

                      const dayIndex = dayNumber - 1
                      const dayWeather = weatherData?.forecast?.[dayIndex]
                      const weatherForPlaces = {}

                      if (dayWeather) {
                        places.forEach((place) => {
                          const city = extractCityFromLocation(
                            place.description,
                          )
                          const cityWeatherVariation = {
                            서울: { tempOffset: 0, conditionOffset: 0 },
                            부산: { tempOffset: 3, conditionOffset: 1 },
                            제주: { tempOffset: 5, conditionOffset: 2 },
                            대구: { tempOffset: 1, conditionOffset: 0 },
                            광주: { tempOffset: 2, conditionOffset: 1 },
                            강원: { tempOffset: -3, conditionOffset: 0 },
                          }

                          const variation =
                            cityWeatherVariation[city] ||
                            cityWeatherVariation['서울']
                          const conditions = [
                            '맑음',
                            '구름조금',
                            '구름많음',
                            '흐림',
                            '비',
                          ]
                          const adjustedConditionIndex = Math.max(
                            0,
                            (conditions.indexOf(dayWeather.condition) +
                              variation.conditionOffset) %
                              conditions.length,
                          )
                          const adjustedCondition =
                            conditions[adjustedConditionIndex]

                          weatherForPlaces[place.description] = {
                            condition: adjustedCondition,
                            temperature: {
                              min: Math.round(
                                (dayWeather.temperature?.min || 15) +
                                  variation.tempOffset -
                                  2,
                              ),
                              max: Math.round(
                                (dayWeather.temperature?.max || 25) +
                                  variation.tempOffset +
                                  2,
                              ),
                              current: dayWeather.isCurrentWeather
                                ? Math.round(
                                    (dayWeather.temperature?.current ||
                                      dayWeather.temperature?.max ||
                                      20) + variation.tempOffset,
                                  )
                                : null,
                            },
                            feels_like: dayWeather.feels_like
                              ? Math.round(
                                  dayWeather.feels_like + variation.tempOffset,
                                )
                              : null,
                            humidity: dayWeather.humidity || 60,
                            precipitation:
                              dayWeather.precipitation ||
                              dayWeather.precipitation_chance ||
                              0,
                            wind_speed: dayWeather.wind_speed || null,
                            uv_index: dayWeather.uv_index || null,
                            isToday: dayWeather.isToday || false,
                            isCurrentWeather:
                              dayWeather.isCurrentWeather || false,
                            isFromAPI: dayWeather.isFromAPI || false,
                            recommendation: dayWeather.recommendation || null,
                          }
                        })
                      } else {
                        places.forEach((place) => {
                          weatherForPlaces[place.description] = {
                            condition: '맑음',
                            temperature: {
                              min: 18,
                              max: 24,
                              current: null,
                            },
                            feels_like: null,
                            humidity: 60,
                            precipitation: 0,
                            wind_speed: null,
                            uv_index: null,
                            isToday: false,
                            isCurrentWeather: false,
                            isFromAPI: false,
                            recommendation: null,
                          }
                        })
                      }

                      return (
                        <CompactDayItinerary
                          key={day}
                          day={day}
                          places={places}
                          dayNumber={dayNumber}
                          weatherData={weatherForPlaces}
                          showWeather={true}
                        />
                      )
                    })}

                    {/* 최종 목적지 정보 표시 */}
                    {plan?.destination && itineraryDays.length > 0 && (
                      <>
                        {/* 마지막 일정에서 목적지로의 연결선 */}
                        <div className="flex items-center justify-center py-2">
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="h-px w-8 bg-gray-300"></div>
                            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                              <svg
                                className="h-4 w-4 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                              </svg>
                            </div>
                            <div className="h-px w-8 bg-gray-300"></div>
                          </div>
                        </div>

                        {/* 최종 목적지 */}
                        <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                              <svg
                                className="h-5 w-5 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-red-800 dark:text-red-200">
                                  🏁 최종 목적지
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="border-red-300 text-red-700 dark:border-red-600 dark:text-red-400"
                                >
                                  여행 종료점
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                {plan.destination}
                              </p>
                              {plan.end_date && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                  도착일:{' '}
                                  {new Date(plan.end_date).toLocaleDateString(
                                    'ko-KR',
                                    {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      weekday: 'short',
                                    },
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                      <MapPin className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      상세 일정이 없습니다.
                    </p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                      여행 계획을 추가해보세요!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 요약 탭 */}
          <TabsContent value="summary" className="space-y-6">
            {/* 여행 전체 요약 */}
            <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800 dark:text-gray-100">
                  <span className="text-xl">📊</span>
                  여행 요약
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
                  {/* 기본 통계 */}
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {tripDuration}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      여행 일수
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {plan.itinerary
                        ? Object.values(plan.itinerary).flat().length
                        : 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      방문 장소
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Navigation className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {routes ? routes.length : 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      생성된 경로
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <span className="text-2xl">☀️</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {weatherData?.forecast?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      날씨 예보
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 일차별 하이라이트 */}
            <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-100">
                  <span className="text-xl">🗓️</span>
                  일차별 하이라이트
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itineraryDays.length > 0 ? (
                  <div className="space-y-4">
                    {itineraryDays.map((day, index) => {
                      const dayNumber = parseInt(day.replace(/\D/g, ''))
                      const places = plan.itinerary[day] || []
                      const dayWeather = weatherData?.forecast?.[index]

                      // 일차별 총 이동 거리/시간 계산
                      const dayRoutes =
                        routes?.filter((route) => route.day === dayNumber) || []
                      const totalDistance = dayRoutes.reduce(
                        (sum, route) => sum + (route.distance || 0),
                        0,
                      )
                      const totalDuration = dayRoutes.reduce(
                        (sum, route) => sum + (route.duration || 0),
                        0,
                      )

                      return (
                        <div
                          key={day}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                {dayNumber}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                  {dayNumber}일차
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {places.length}개 장소 방문
                                </p>
                              </div>
                            </div>
                            {dayWeather && (
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <span className="text-lg">
                                    {dayWeather.condition === '맑음'
                                      ? '☀️'
                                      : dayWeather.condition === '구름조금'
                                        ? '🌤️'
                                        : dayWeather.condition === '구름많음'
                                          ? '☁️'
                                          : dayWeather.condition === '흐림'
                                            ? '☁️'
                                            : dayWeather.condition === '비'
                                              ? '🌧️'
                                              : '☀️'}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {dayWeather.condition}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {dayWeather.isCurrentWeather &&
                                  dayWeather.temperature?.current ? (
                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                      현재 {dayWeather.temperature.current}°
                                    </span>
                                  ) : null}
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {dayWeather.temperature?.min || '--'}°~
                                    {dayWeather.temperature?.max || '--'}°
                                  </span>
                                  {dayWeather.precipitation > 0 && (
                                    <span className="text-blue-500 dark:text-blue-400">
                                      💧{dayWeather.precipitation}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* 주요 장소 */}
                            <div>
                              <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                주요 장소
                              </h5>
                              {places.length > 0 ? (
                                <div className="space-y-1">
                                  {places.slice(0, 3).map((place, idx) => (
                                    <div
                                      key={idx}
                                      className="text-sm text-gray-600 dark:text-gray-400"
                                    >
                                      📍{' '}
                                      {place.name ||
                                        place.description?.split(',')[0] ||
                                        `장소 ${idx + 1}`}
                                    </div>
                                  ))}
                                  {places.length > 3 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                      외 {places.length - 3}개 더
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-500">
                                  일정이 없습니다
                                </div>
                              )}
                            </div>

                            {/* 이동 정보 */}
                            <div>
                              <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                이동 정보
                              </h5>
                              {dayRoutes.length > 0 ? (
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  <div>
                                    🚌 총 거리: {formatDistance(totalDistance)}
                                  </div>
                                  <div>
                                    ⏱️ 총 시간: {formatDuration(totalDuration)}
                                  </div>
                                  <div>📍 경로: {dayRoutes.length}개</div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-500">
                                  경로 정보가 없습니다
                                </div>
                              )}
                            </div>

                            {/* 날씨 상세 */}
                            <div>
                              <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                날씨 상세
                              </h5>
                              {dayWeather ? (
                                <div className="space-y-2">
                                  {/* 기본 날씨 정보 */}
                                  <div className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-3 dark:from-blue-900/20 dark:to-cyan-900/20">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl">
                                          {dayWeather.condition === '맑음'
                                            ? '☀️'
                                            : dayWeather.condition ===
                                                '구름조금'
                                              ? '🌤️'
                                              : dayWeather.condition ===
                                                  '구름많음'
                                                ? '☁️'
                                                : dayWeather.condition ===
                                                    '흐림'
                                                  ? '☁️'
                                                  : dayWeather.condition ===
                                                      '비'
                                                    ? '🌧️'
                                                    : '☀️'}
                                        </span>
                                        <div>
                                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {dayWeather.condition}
                                          </div>
                                          {dayWeather.isToday && (
                                            <div className="text-xs text-green-600 dark:text-green-400">
                                              📅 오늘
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        {dayWeather.isCurrentWeather &&
                                        dayWeather.temperature?.current ? (
                                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            현재{' '}
                                            {dayWeather.temperature.current}°
                                          </div>
                                        ) : null}
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {dayWeather.temperature?.min || '--'}
                                          °~
                                          {dayWeather.temperature?.max || '--'}°
                                        </div>
                                        {dayWeather.feels_like && (
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            체감 {dayWeather.feels_like}°
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 상세 날씨 정보 그리드 */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {/* 강수 확률 */}
                                    {(dayWeather.precipitation > 0 ||
                                      dayWeather.precipitation_chance > 0) && (
                                      <div className="flex items-center justify-between rounded bg-white/70 px-2 py-1 dark:bg-gray-700/50">
                                        <span className="text-blue-600 dark:text-blue-400">
                                          💧 강수
                                        </span>
                                        <span className="font-medium">
                                          {dayWeather.precipitation_chance ||
                                            dayWeather.precipitation}
                                          %
                                        </span>
                                      </div>
                                    )}

                                    {/* 습도 */}
                                    {dayWeather.humidity && (
                                      <div className="flex items-center justify-between rounded bg-white/70 px-2 py-1 dark:bg-gray-700/50">
                                        <span className="text-cyan-600 dark:text-cyan-400">
                                          💨 습도
                                        </span>
                                        <span className="font-medium">
                                          {dayWeather.humidity}%
                                        </span>
                                      </div>
                                    )}

                                    {/* 풍속 */}
                                    {dayWeather.wind_speed && (
                                      <div className="flex items-center justify-between rounded bg-white/70 px-2 py-1 dark:bg-gray-700/50">
                                        <span className="text-gray-600 dark:text-gray-400">
                                          🌬️ 풍속
                                        </span>
                                        <span className="font-medium">
                                          {dayWeather.wind_speed}km/h
                                        </span>
                                      </div>
                                    )}

                                    {/* UV 지수 */}
                                    {dayWeather.uv_index && (
                                      <div className="flex items-center justify-between rounded bg-white/70 px-2 py-1 dark:bg-gray-700/50">
                                        <span className="text-orange-600 dark:text-orange-400">
                                          ☀️ UV
                                        </span>
                                        <span className="font-medium">
                                          {dayWeather.uv_index}
                                          {dayWeather.uv_index <= 2 &&
                                            ' (낮음)'}
                                          {dayWeather.uv_index > 2 &&
                                            dayWeather.uv_index <= 5 &&
                                            ' (보통)'}
                                          {dayWeather.uv_index > 5 &&
                                            dayWeather.uv_index <= 7 &&
                                            ' (높음)'}
                                          {dayWeather.uv_index > 7 && ' (위험)'}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* 날씨 추천 */}
                                  {dayWeather.recommendation && (
                                    <div className="rounded bg-yellow-50 p-2 text-xs dark:bg-yellow-900/20">
                                      <span className="text-yellow-700 dark:text-yellow-300">
                                        💡 {dayWeather.recommendation}
                                      </span>
                                    </div>
                                  )}

                                  {/* API 데이터 표시 */}
                                  {dayWeather.isFromAPI && (
                                    <div className="text-xs text-green-500 dark:text-green-400">
                                      📡{' '}
                                      {dayWeather.isCached
                                        ? '캐시된 데이터'
                                        : '실시간 데이터'}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-500">
                                  날씨 정보가 없습니다
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                      <Calendar className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      일정 정보가 없습니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 여행 팁 및 추천사항 */}
            {(weatherData?.recommendation || routes?.length > 0) && (
              <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-100">
                    <span className="text-xl">💡</span>
                    여행 팁 & 추천사항
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weatherData?.recommendation && (
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🌤️</span>
                        <div>
                          <h4 className="mb-1 font-medium text-green-800 dark:text-green-300">
                            날씨 기반 추천
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            {weatherData.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {routes && routes.length > 0 && (
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🚌</span>
                        <div>
                          <h4 className="mb-1 font-medium text-blue-800 dark:text-blue-300">
                            대중교통/도보 정보
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-400">
                            총 {routes.length}개의 경로가 생성되어 있습니다.
                            타임머신 기능으로 교통상황을 분석할 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {itineraryDays.length > 3 && (
                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">⏰</span>
                        <div>
                          <h4 className="mb-1 font-medium text-purple-800 dark:text-purple-300">
                            장기 여행 팁
                          </h4>
                          <p className="text-sm text-purple-700 dark:text-purple-400">
                            {itineraryDays.length}일 여행입니다. 충분한 휴식
                            시간을 확보하고 짐을 가볍게 준비하세요.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 대중교통 탭 */}
          <TabsContent value="transport" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                지하철/버스/도보 정보
              </h3>
              {itineraryDays.length > 0 && (
                <Button
                  onClick={handleAutoGenerateRoutes}
                  disabled={isGeneratingRoutes}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-blue-700"
                  size="lg"
                >
                  {isGeneratingRoutes ? (
                    <>
                      <Zap className="mr-2 h-5 w-5 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      {routes && routes.length > 0
                        ? '경로 재생성'
                        : '자동 경로 생성'}
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {routesLoading ? (
                <Card className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm dark:border-blue-700 dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400"></div>
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-blue-800 dark:text-blue-300">
                      대중교통/도보 정보 로딩 중
                    </h4>
                    <p className="text-center text-gray-600 dark:text-gray-300">
                      최적의 경로를 찾고 있습니다...
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                      <span>대중교통/도보 정보 분석</span>
                    </div>
                  </CardContent>
                </Card>
              ) : routes && routes.length > 0 ? (
                (() => {
                  const groupedRoutes = groupRoutesByDay(routes)
                  return Object.keys(groupedRoutes)
                    .sort(
                      (a, b) =>
                        parseInt(a.replace('day', '')) -
                        parseInt(b.replace('day', '')),
                    )
                    .map((dayKey) => (
                      <div key={dayKey} className="space-y-4">
                        <h4 className="flex items-center text-lg font-semibold text-blue-800 dark:text-blue-400">
                          {dayKey.replace('day', '') + '일차 이동 정보'}
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            🕐 타임머신 예측 지원
                          </span>
                        </h4>

                        {groupedRoutes[dayKey].map((route, index) => {
                          const isStartRoute =
                            route.sequence === 0 && dayKey === 'day1'
                          const isInterDayRoute =
                            route.sequence === 0 && dayKey !== 'day1'

                          return (
                            <div key={route.route_id || index}>
                              {isStartRoute && (
                                <div className="mb-2 inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  🏠 출발지에서 첫 번째 목적지로
                                </div>
                              )}
                              {isInterDayRoute && (
                                <div className="mb-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  🏨 전일 마지막 장소에서 오늘 첫 번째 목적지로
                                </div>
                              )}

                              {/* 향상된 교통수단 카드 - 지하철/버스 분리 UI 포함 */}
                              <EnhancedTransportCard
                                route={{
                                  from: route.departure_name,
                                  to: route.destination_name,
                                  departure_lat: route.departure_lat,
                                  departure_lng: route.departure_lng,
                                  destination_lat: route.destination_lat,
                                  destination_lng: route.destination_lng,
                                  duration: route.duration,
                                  distance: route.distance,
                                  cost: route.cost,
                                  transport_type: route.transport_type,
                                  route_data: route.route_data,
                                  isInterDay: route.sequence === 0,
                                }}
                                key={`${route.route_id}-enhanced-transport`}
                                travelDate={plan?.start_date}
                                onRouteDetailClick={() => {
                                  setSelectedRoute(route)
                                  setIsRouteDetailOpen(true)
                                }}
                                showAdvancedTransportOptions={true}
                              />
                            </div>
                          )
                        })}
                      </div>
                    ))
                })()
              ) : (
                <Card className="rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-lg dark:border-blue-500 dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-gray-800 dark:to-indigo-900/40">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 p-4 shadow-lg dark:from-blue-700 dark:to-indigo-700">
                      <Navigation className="h-12 w-12 text-blue-700 dark:text-blue-200" />
                    </div>
                    <h4 className="mb-4 text-2xl font-bold text-blue-900 dark:text-blue-100">
                      경로 정보가 없습니다
                    </h4>
                    <p className="mb-6 text-lg text-gray-700 dark:text-gray-200">
                      여행 일정이 있는 경우 자동으로 경로를 생성할 수 있습니다
                    </p>
                    <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-blue-100 px-6 py-3 text-base font-medium text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
                      <span>일정 추가 후 경로 생성 가능</span>
                    </div>
                    {import.meta.env.DEV && (
                      <div className="mb-4 rounded bg-gray-100 p-3 text-left text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <div>디버그 정보:</div>
                        <div>경로 로딩 중: {routesLoading.toString()}</div>
                        <div>경로 개수: {routes?.length || 0}</div>
                        <div>
                          경로 에러:{' '}
                          {routesError ? JSON.stringify(routesError) : '없음'}
                        </div>
                        <div>플랜 ID: {planId}</div>
                        <div>일정 일수: {itineraryDays.length}</div>
                      </div>
                    )}
                    {itineraryDays.length > 0 && (
                      <Button
                        onClick={handleAutoGenerateRoutes}
                        disabled={isGeneratingRoutes}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl"
                        size="lg"
                      >
                        {isGeneratingRoutes ? (
                          <>
                            <Zap className="mr-2 h-5 w-5 animate-spin" />
                            생성 중...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-5 w-5" />
                            자동 경로 생성
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 날씨 탭 */}
          <TabsContent value="weather" className="space-y-6">
            <Card className="rounded-xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-100">
                  <span className="text-xl">☀️</span>
                  날씨 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isWeatherLoading ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                      <svg
                        className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-25"
                        />
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                          className="opacity-75"
                        />
                      </svg>
                    </div>
                    <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-100">
                      날씨 정보 로딩 중...
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      실시간 날씨 데이터를 가져오고 있습니다
                    </p>
                  </div>
                ) : weatherData &&
                  weatherData.forecast &&
                  weatherData.forecast.length > 0 ? (
                  <div className="space-y-3">
                    <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        🌤️ 날씨 정보는 예측 데이터이며, 여행 전 최신 날씨를
                        확인해 주세요
                      </p>
                      {weatherData.lastUpdated && (
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                          마지막 업데이트:{' '}
                          {weatherData.lastUpdated.toLocaleString('ko-KR')}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {weatherData.forecast.map((forecast, index) => {
                        const getWeatherIcon = (condition) => {
                          return (
                            WEATHER_ICONS[condition] || WEATHER_ICONS.default
                          )
                        }

                        const formatWeatherDate = (dateString) => {
                          const date = new Date(dateString)
                          return date.toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short',
                          })
                        }

                        return (
                          <Card
                            key={index}
                            className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-gray-600 dark:from-blue-900/20 dark:to-cyan-900/20"
                          >
                            {/* 기본 날씨 정보 */}
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">
                                  {getWeatherIcon(forecast.condition)}
                                </span>
                                <div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-100">
                                    {formatWeatherDate(forecast.date)}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {forecast.city &&
                                      forecast.city !== '서울' && (
                                        <span className="mr-2 text-blue-600 dark:text-blue-400">
                                          📍{forecast.city}
                                        </span>
                                      )}
                                    {forecast.condition}
                                    {forecast.isFromAPI && (
                                      <span className="ml-2 text-xs text-green-500 dark:text-green-400">
                                        •{' '}
                                        {forecast.isCached
                                          ? '캐시됨'
                                          : '실시간'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                  {forecast.isCurrentWeather &&
                                  forecast.temperature?.current ? (
                                    <>
                                      <span className="text-blue-600 dark:text-blue-400">
                                        현재 {forecast.temperature.current}°
                                      </span>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {forecast.temperature?.min || '--'}°~
                                        {forecast.temperature?.max || '--'}°
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {forecast.temperature?.min || '--'}°~
                                      {forecast.temperature?.max || '--'}°
                                    </>
                                  )}
                                </div>
                                {forecast.feels_like && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    체감 {forecast.feels_like}°
                                  </div>
                                )}
                                {forecast.isToday && (
                                  <div className="text-xs text-green-600 dark:text-green-400">
                                    📅 오늘
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 상세 날씨 정보 그리드 */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {/* 강수 확률 */}
                              {(forecast.precipitation > 0 ||
                                forecast.precipitation_chance > 0) && (
                                <div className="flex items-center justify-between rounded bg-white/50 px-2 py-1 dark:bg-gray-700/50">
                                  <span className="text-blue-600 dark:text-blue-400">
                                    💧 강수확률
                                  </span>
                                  <span className="font-medium">
                                    {forecast.precipitation_chance ||
                                      forecast.precipitation}
                                    %
                                  </span>
                                </div>
                              )}

                              {/* 습도 */}
                              {forecast.humidity && (
                                <div className="flex items-center justify-between rounded bg-white/50 px-2 py-1 dark:bg-gray-700/50">
                                  <span className="text-cyan-600 dark:text-cyan-400">
                                    💨 습도
                                  </span>
                                  <span className="font-medium">
                                    {forecast.humidity}%
                                  </span>
                                </div>
                              )}

                              {/* 풍속 */}
                              {forecast.wind_speed && (
                                <div className="flex items-center justify-between rounded bg-white/50 px-2 py-1 dark:bg-gray-700/50">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    🌬️ 풍속
                                  </span>
                                  <span className="font-medium">
                                    {forecast.wind_speed}km/h
                                  </span>
                                </div>
                              )}

                              {/* UV 지수 */}
                              {forecast.uv_index && (
                                <div className="flex items-center justify-between rounded bg-white/50 px-2 py-1 dark:bg-gray-700/50">
                                  <span className="text-orange-600 dark:text-orange-400">
                                    ☀️ UV지수
                                  </span>
                                  <span className="font-medium">
                                    {forecast.uv_index}
                                    {forecast.uv_index <= 2 && ' (낮음)'}
                                    {forecast.uv_index > 2 &&
                                      forecast.uv_index <= 5 &&
                                      ' (보통)'}
                                    {forecast.uv_index > 5 &&
                                      forecast.uv_index <= 7 &&
                                      ' (높음)'}
                                    {forecast.uv_index > 7 &&
                                      forecast.uv_index <= 10 &&
                                      ' (매우높음)'}
                                    {forecast.uv_index > 10 && ' (위험)'}
                                  </span>
                                </div>
                              )}

                              {/* 기압 */}
                              {forecast.pressure && (
                                <div className="flex items-center justify-between rounded bg-white/50 px-2 py-1 dark:bg-gray-700/50">
                                  <span className="text-purple-600 dark:text-purple-400">
                                    📊 기압
                                  </span>
                                  <span className="font-medium">
                                    {forecast.pressure}hPa
                                  </span>
                                </div>
                              )}

                              {/* 가시거리 */}
                              {forecast.visibility && (
                                <div className="flex items-center justify-between rounded bg-white/50 px-2 py-1 dark:bg-gray-700/50">
                                  <span className="text-green-600 dark:text-green-400">
                                    👁️ 가시거리
                                  </span>
                                  <span className="font-medium">
                                    {forecast.visibility}km
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* 날씨 조건별 추천 */}
                            {forecast.recommendation && (
                              <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs dark:border-yellow-800 dark:bg-yellow-900/20">
                                <span className="text-yellow-700 dark:text-yellow-300">
                                  💡 {forecast.recommendation}
                                </span>
                              </div>
                            )}
                          </Card>
                        )
                      })}
                    </div>

                    {weatherData.recommendation && (
                      <Card className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <div>
                            <h4 className="mb-1 font-medium text-green-800 dark:text-green-300">
                              여행 팁
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-400">
                              {weatherData.recommendation}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* 데이터 새로고침 버튼 */}
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => {
                          setIsWeatherLoading(true)
                          loadWeatherData()
                        }}
                        className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        날씨 정보 새로고침
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                      <svg
                        className="h-6 w-6 text-orange-600 dark:text-orange-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                        />
                      </svg>
                    </div>
                    <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-100">
                      날씨 정보 서비스 준비중
                    </h4>
                    <p className="mb-3 text-gray-600 dark:text-gray-300">
                      현재 날씨 서비스가 일시적으로 이용 불가합니다
                    </p>
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        🌤️ 여행 전 기상청이나 날씨 앱에서 각 지역의 날씨를
                        확인해 주세요
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 상세 경로 정보 모달 */}
        <Dialog open={isRouteDetailOpen} onOpenChange={setIsRouteDetailOpen}>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                🕐 타임머신 경로 예측
              </DialogTitle>
              <DialogDescription>
                {selectedRoute && (
                  <>
                    {selectedRoute.departure_name} →{' '}
                    {selectedRoute.destination_name}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedRoute && (
              <div className="px-6 pb-2">
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                  ⏰ 여행 계획 일정 기준으로 교통상황 예측
                </div>
              </div>
            )}

            {/* 타임머신 API 응답 렌더링 */}
            {isTimemachineLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">
                  타임머신 경로 예측을 생성하는 중...
                </span>
              </div>
            ) : isTimemachineError ? (
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-red-800">
                  타임머신 예측을 불러올 수 없습니다
                </h3>
                <p className="mb-4 text-red-700">
                  {timemachineError?.data?.message ||
                    timemachineError?.message ||
                    '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
                </p>
                <div className="space-y-4">
                  <div className="rounded border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
                      기본 경로 정보
                    </h4>
                    {selectedRoute && renderDetailedRouteInfo(selectedRoute)}
                  </div>
                </div>
              </div>
            ) : timemachineRouteInfo ? (
              <div className="space-y-6">
                {/* 타임머신 상태 표시 */}
                <div className="flex items-center justify-between rounded border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      🕐 TMAP 타임머신 예측
                    </span>
                  </div>
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    {timemachineRouteInfo.prediction_info?.departure_time
                      ? new Date(
                          timemachineRouteInfo.prediction_info.departure_time,
                        ).toLocaleString('ko-KR')
                      : '여행 일정 기준'}
                  </div>
                </div>

                {/* 대중교통 정보 */}
                {timemachineRouteInfo.timemachine_info?.message && (
                  <div className="rounded border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      ℹ️ {timemachineRouteInfo.timemachine_info.message}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatDuration(
                            timemachineRouteInfo.timemachine_info.fallback
                              ?.duration,
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          소요시간
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatDistance(
                            timemachineRouteInfo.timemachine_info.fallback
                              ?.distance,
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          이동거리
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {formatCost(
                            timemachineRouteInfo.timemachine_info.fallback
                              ?.cost,
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          예상 비용
                        </div>
                      </div>
                    </div>

                    {/* 대중교통 상세 정보 렌더링 추가 */}
                    {selectedRoute?.transport_type === 'transit' &&
                      selectedRoute?.route_data &&
                      renderTransitDetails(selectedRoute.route_data)}
                  </div>
                )}

                {/* 경로 비교 결과 (대중교통인 경우) */}
                {timemachineRouteInfo.timemachine_info?.comparison?.routes && (
                  <div>
                    <h4 className="mb-3 flex items-center font-semibold text-gray-800">
                      <Route className="mr-2 h-4 w-4" />
                      🕐 타임머신 경로 옵션 비교
                    </h4>
                    <div className="grid gap-3">
                      {timemachineRouteInfo.timemachine_info.comparison.routes.map(
                        (route, index) => (
                          <div
                            key={generateSafeKey(route, 'comparison', index)}
                            className={`rounded-lg border p-4 ${
                              route.is_recommended
                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                            }`}
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`h-3 w-3 rounded-full ${
                                    route.is_recommended
                                      ? 'bg-green-500'
                                      : 'bg-gray-300'
                                  }`}
                                ></div>
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {route.name}
                                    {route.is_recommended && (
                                      <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                        🚌 추천
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    타임머신 예측 기준
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-800">
                                  {formatDuration(route.duration)} •{' '}
                                  {formatDistance(route.distance)}
                                </div>
                                <div className="text-sm text-gray-700">
                                  {formatCost(route.cost + route.toll_fee)}
                                  {route.toll_fee > 0 && (
                                    <span className="ml-1 text-xs text-blue-800">
                                      (통행료 {route.toll_fee.toLocaleString()}
                                      원)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 교통 예측 정보 */}
                            {route.route_data?.route_summary && (
                              <div className="mt-3 rounded border bg-blue-50 p-3 dark:bg-blue-900/20">
                                <div className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                                  🚦 교통 예측
                                </div>
                                {route.route_data.route_summary
                                  .traffic_prediction && (
                                  <div className="mb-2 text-sm text-blue-800 dark:text-blue-200">
                                    전체 교통량:{' '}
                                    <span className="font-medium">
                                      {
                                        route.route_data.route_summary
                                          .traffic_prediction
                                      }
                                    </span>
                                  </div>
                                )}
                                {route.route_data.route_summary
                                  .expected_congestion && (
                                  <div className="space-y-1">
                                    {route.route_data.route_summary.expected_congestion.map(
                                      (congestion, idx) => (
                                        <div
                                          key={idx}
                                          className="flex justify-between text-xs text-blue-600"
                                        >
                                          <span>{congestion.location}</span>
                                          <span
                                            className={`font-medium ${
                                              congestion.level === '원활'
                                                ? 'text-green-600'
                                                : congestion.level === '보통'
                                                  ? 'text-yellow-600'
                                                  : 'text-red-600'
                                            }`}
                                          >
                                            {congestion.level}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 상세 안내 (추천 경로의 경우) */}
                            {route.is_recommended &&
                              route.route_data?.detailed_guides && (
                                <div className="mt-3 rounded border bg-gray-50 p-3 dark:bg-gray-800">
                                  <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    🗺️ 상세 경로 안내
                                  </div>
                                  <div className="space-y-2">
                                    {route.route_data.detailed_guides
                                      .slice(0, 3)
                                      .map((guide, idx) => (
                                        <div
                                          key={generateSafeKey(
                                            guide,
                                            'guide',
                                            idx,
                                          )}
                                          className="flex items-start space-x-2 text-xs"
                                        >
                                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                            {guide.step}
                                          </span>
                                          <div className="flex-1">
                                            <div className="text-gray-700">
                                              {guide.description}
                                            </div>
                                            <div className="mt-1 text-gray-500">
                                              {guide.distance} • {guide.time} •{' '}
                                              {guide.instruction}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ),
                      )}
                    </div>

                    {/* 비교 요약 */}
                    {timemachineRouteInfo.timemachine_info.comparison
                      .comparison_summary && (
                      <div className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            소요시간 범위:{' '}
                            {formatDuration(
                              timemachineRouteInfo.timemachine_info.comparison
                                .comparison_summary.time_range.min,
                            )}{' '}
                            ~{' '}
                            {formatDuration(
                              timemachineRouteInfo.timemachine_info.comparison
                                .comparison_summary.time_range.max,
                            )}
                          </div>
                          <div>
                            거리 범위:{' '}
                            {formatDistance(
                              timemachineRouteInfo.timemachine_info.comparison
                                .comparison_summary.distance_range.min,
                            )}{' '}
                            ~{' '}
                            {formatDistance(
                              timemachineRouteInfo.timemachine_info.comparison
                                .comparison_summary.distance_range.max,
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 단일 경로 예측 결과 */}
                {timemachineRouteInfo.timemachine_info?.predicted_route &&
                  !timemachineRouteInfo.timemachine_info?.comparison && (
                    <div>
                      <h4 className="mb-3 flex items-center font-semibold text-gray-800 dark:text-gray-200">
                        <Navigation className="mr-2 h-4 w-4" />
                        🕐 타임머신 경로 예측
                      </h4>
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="mb-4 grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatDuration(
                                timemachineRouteInfo.timemachine_info
                                  .predicted_route.duration,
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              소요시간
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {formatDistance(
                                timemachineRouteInfo.timemachine_info
                                  .predicted_route.distance,
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              이동거리
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {formatCost(
                                timemachineRouteInfo.timemachine_info
                                  .predicted_route.cost +
                                  timemachineRouteInfo.timemachine_info
                                    .predicted_route.toll_fee,
                              )}
                            </div>
                            <div className="text-xs text-gray-600">총 비용</div>
                          </div>
                        </div>

                        {/* 교통 예측 정보 */}
                        {timemachineRouteInfo.timemachine_info.predicted_route
                          .route_data?.route_summary && (
                          <div className="mb-4 rounded border bg-white p-3">
                            <div className="mb-2 text-sm font-medium text-gray-800">
                              🚦 실시간 교통 예측
                            </div>
                            {timemachineRouteInfo.timemachine_info
                              .predicted_route.route_data.route_summary
                              .traffic_prediction && (
                              <div className="mb-2 text-sm text-blue-700">
                                전체 교통량:{' '}
                                <span className="font-medium">
                                  {
                                    timemachineRouteInfo.timemachine_info
                                      .predicted_route.route_data.route_summary
                                      .traffic_prediction
                                  }
                                </span>
                              </div>
                            )}
                            {timemachineRouteInfo.timemachine_info
                              .predicted_route.route_data.route_summary
                              .expected_congestion && (
                              <div className="grid grid-cols-1 gap-1">
                                {timemachineRouteInfo.timemachine_info.predicted_route.route_data.route_summary.expected_congestion.map(
                                  (congestion, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between text-xs text-blue-600"
                                    >
                                      <span>{congestion.location}</span>
                                      <span
                                        className={`font-medium ${
                                          congestion.level === '원활'
                                            ? 'text-green-600'
                                            : congestion.level === '보통'
                                              ? 'text-yellow-600'
                                              : 'text-red-600'
                                        }`}
                                      >
                                        {congestion.level}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 상세 경로 안내 */}
                        {timemachineRouteInfo.timemachine_info.predicted_route
                          .route_data?.detailed_guides && (
                          <div className="rounded border bg-white p-3">
                            <div className="mb-2 text-sm font-medium text-gray-700">
                              🗺️ 상세 경로 안내
                            </div>
                            <div className="max-h-48 space-y-2 overflow-y-auto">
                              {timemachineRouteInfo.timemachine_info.predicted_route.route_data.detailed_guides.map(
                                (guide, idx) => (
                                  <div
                                    key={generateSafeKey(guide, 'guide', idx)}
                                    className="flex items-start space-x-2 text-xs"
                                  >
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                      {guide.step}
                                    </span>
                                    <div className="flex-1">
                                      <div className="text-gray-700">
                                        {guide.description}
                                      </div>
                                      <div className="mt-1 text-gray-500">
                                        {guide.distance} • {guide.time} •{' '}
                                        {guide.instruction}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* 추천 경로 상세 안내 */}
                {timemachineRouteInfo.timemachine_info?.comparison?.recommended
                  ?.route_data?.detailed_guides && (
                  <div>
                    <h4 className="mb-3 flex items-center font-semibold text-gray-800">
                      <Navigation className="mr-2 h-4 w-4" />
                      🏆 추천 경로 상세 안내
                    </h4>
                    <div className="max-h-64 space-y-3 overflow-y-auto">
                      {timemachineRouteInfo.timemachine_info.comparison.recommended.route_data.detailed_guides.map(
                        (guide, index) => (
                          <div
                            key={generateSafeKey(guide, 'guide', index)}
                            className="flex items-start space-x-3 rounded border bg-white p-3"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                              {guide.step}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {guide.description}
                              </div>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-700">
                                {guide.distance && (
                                  <span>📍 {guide.distance}</span>
                                )}
                                {guide.time && <span>⏱️ {guide.time}</span>}
                                {guide.instruction && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {guide.instruction}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* 예측 정확도 정보 */}
                <div className="rounded border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️{' '}
                    {timemachineRouteInfo.prediction_info?.accuracy_note ||
                      'TMAP 타임머신 API 기반 예측으로 실제 교통상황과 다를 수 있습니다.'}
                  </div>
                </div>

                {/* 데이터 소스 */}
                <div className="flex items-center justify-between rounded bg-blue-100 p-3 dark:bg-blue-900/30">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    📡 예측 데이터:{' '}
                    {timemachineRouteInfo.data_sources?.timemachine_data ||
                      'TMAP API'}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    🕐 타임머신 예측
                  </Badge>
                </div>
              </div>
            ) : selectedRoute ? (
              <div className="space-y-4">
                <div className="rounded border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
                    기본 경로 정보
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    타임머신 데이터를 불러올 수 없어 기본 정보를 표시합니다.
                  </p>
                </div>
                {renderDetailedRouteInfo(selectedRoute)}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* 공유 모달 */}
        <SharePlanModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          planId={planId}
          planTitle={plan?.title || ''}
        />
      </div>
    </div>
  )
}

export default TravelPlanDetailPage
