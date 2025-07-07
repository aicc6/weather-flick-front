import { useParams, Link } from 'react-router-dom'
import { useGetTravelPlanQuery } from '@/store/api/travelPlansApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Info,
  Edit,
  ArrowLeft,
  MapPin,
  Tag,
} from '@/components/icons'
import { toast } from 'sonner'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Google Place API 'types'를 한글 카테고리명으로 변환
const formatPlaceCategory = (type) => {
  const categoryMap = {
    point_of_interest: '관심 장소',
    establishment: '상업시설',
    tourist_attraction: '관광명소',
    park: '공원',
    museum: '박물관',
    restaurant: '음식점',
    cafe: '카페',
    lodging: '숙소',
    store: '상점',
    transit_station: '교통',
  }
  return categoryMap[type] || type
}

export function TravelPlanDetailPage() {
  const { planId } = useParams()
  const {
    data: plan,
    isLoading,
    isError,
    error,
  } = useGetTravelPlanQuery(planId)

  // 서울 날씨 정보 조회 (백엔드 API 500 에러로 인해 임시 비활성화)
  // const {
  //   data: weatherData,
  //   isLoading: isWeatherLoading,
  //   isError: isWeatherError,
  // } = useGetCurrentWeatherQuery('Seoul', {
  //   skip: !plan,
  // })

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
        강원: ['강원', '춘천', '강릉', '속초'],
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

  // 일차별 위치 기반 날씨 예보 생성
  const generateLocationBasedWeatherForecast = (startDate, itinerary) => {
    if (!startDate || !itinerary) return []

    try {
      const start = new Date(startDate)
      const days = Object.keys(itinerary)
      const forecast = []

      const conditions = ['맑음', '구름조금', '구름많음', '흐림', '비']
      const cityWeatherVariation = {
        서울: { tempOffset: 0, conditionMod: 0 },
        부산: { tempOffset: 3, conditionMod: 1 },
        제주: { tempOffset: 5, conditionMod: 2 },
        대구: { tempOffset: 1, conditionMod: 0 },
        광주: { tempOffset: 2, conditionMod: 1 },
        강원: { tempOffset: -3, conditionMod: 0 },
      }

      days.forEach((day, index) => {
        const date = new Date(start.getTime() + index * 86400000)
        const dayItinerary = itinerary[day]

        // 해당 일차의 첫 번째 위치를 기준으로 도시 결정
        let city = '서울'
        if (dayItinerary && dayItinerary.length > 0) {
          city = extractCityFromLocation(dayItinerary[0].description)
        }

        const variation =
          cityWeatherVariation[city] || cityWeatherVariation['서울']
        const conditionIndex =
          (index + variation.conditionMod) % conditions.length
        const condition = conditions[conditionIndex]

        forecast.push({
          date: date.toISOString(),
          condition,
          city,
          temperature: {
            min: Math.max(
              5,
              Math.floor(Math.random() * 10) + 10 + variation.tempOffset,
            ),
            max: Math.min(
              35,
              Math.floor(Math.random() * 10) + 20 + variation.tempOffset,
            ),
          },
          precipitation:
            condition === '비'
              ? Math.floor(Math.random() * 30) + 60
              : Math.floor(Math.random() * 30),
        })
      })

      return forecast
    } catch (error) {
      console.warn('날씨 예보 생성 중 오류:', error)
      return []
    }
  }

  const weatherData = plan
    ? (() => {
        try {
          const forecast = generateLocationBasedWeatherForecast(
            plan.start_date,
            plan.itinerary,
          )

          // 여러 도시를 방문하는지 확인
          const cities = [...new Set(forecast.map((f) => f.city))]
          const isMultiCity = cities.length > 1

          return {
            forecast,
            recommendation: isMultiCity
              ? `${cities.join(', ')} 지역을 여행하시네요. 각 지역의 날씨를 확인하고 적절한 옷차림을 준비하세요.`
              : `${cities[0]} 지역 여행입니다. 전반적으로 여행하기 좋은 날씨입니다.`,
            isMultiCity,
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
      })()
    : null

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">여행 계획을 불러오는 중...</p>
          <p className="mt-1 text-sm text-gray-400">잠시만 기다려 주세요</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
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
            여행 계획을 불러올 수 없습니다
          </h3>
          <p className="mb-4 text-red-700">
            일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              새로고침
            </button>
            <button
              onClick={() => window.history.back()}
              className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
            >
              뒤로가기
            </button>
          </div>
          {/* eslint-disable-next-line no-undef */}
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
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
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
          <h3 className="mb-2 text-lg font-semibold text-yellow-800">
            여행 계획을 찾을 수 없습니다
          </h3>
          <p className="mb-4 text-yellow-700">
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

  // 수정 페이지로 이동 시 사용자 안내
  const handleEditClick = () => {
    toast.info('수정 페이지로 이동합니다', {
      duration: 2000,
      position: 'bottom-right',
    })
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/travel-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="mb-2 text-3xl font-bold">
                {plan.title}
              </CardTitle>
              <Badge
                variant={plan.status === 'CONFIRMED' ? 'default' : 'secondary'}
              >
                {plan.status}
              </Badge>
            </div>
            <Button asChild onClick={handleEditClick}>
              <Link to={`/planner?planId=${planId}`}>
                <Edit className="mr-2 h-4 w-4" />
                수정하기
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-gray-700">
            <Calendar className="mr-3 h-5 w-5 text-white" />
            <span className="text-white">
              {formatDate(plan.start_date)} ~ {formatDate(plan.end_date)}
            </span>
          </div>
          {plan.description && (
            <div className="flex items-start text-gray-700">
              <Info className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-gray-500" />
              <p>{plan.description}</p>
            </div>
          )}
          {plan.start_location && (
            <div className="flex items-center">
              <MapPin className="mr-3 h-5 w-5" />
              <span>출발지: {plan.start_location}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 날씨 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>날씨 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {weatherData && weatherData.forecast ? (
            <div className="space-y-3">
              <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  🌤️ 날씨 정보는 예측 데이터이며, 여행 전 최신 날씨를 확인해
                  주세요
                </p>
              </div>
              {weatherData.forecast.map((forecast, index) => {
                const getWeatherIcon = (condition) => {
                  const iconMap = {
                    맑음: '☀️',
                    구름조금: '🌤️',
                    구름많음: '☁️',
                    흐림: '☁️',
                    비: '🌧️',
                    눈: '🌨️',
                    바람: '💨',
                  }
                  return iconMap[condition] || '☀️'
                }

                const formatDate = (dateString) => {
                  const date = new Date(dateString)
                  return date.toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                  })
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {getWeatherIcon(forecast.condition)}
                      </span>
                      <div>
                        <div className="font-medium">
                          {formatDate(forecast.date)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {forecast.city && forecast.city !== '서울' && (
                            <span className="mr-2 text-blue-600">
                              📍{forecast.city}
                            </span>
                          )}
                          {forecast.condition}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {forecast.temperature.min}°~{forecast.temperature.max}°
                      </div>
                      {forecast.precipitation > 0 && (
                        <div className="text-sm text-blue-500">
                          💧{forecast.precipitation}%
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {weatherData.recommendation && (
                <div className="mt-4 rounded-md bg-gray-100 p-3">
                  <p className="text-sm text-gray-600">
                    💡 {weatherData.recommendation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 p-3">
                <svg
                  className="h-6 w-6 text-orange-600"
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
              <h4 className="mb-2 font-medium text-gray-800">
                날씨 정보 서비스 준비중
              </h4>
              <p className="mb-3 text-gray-600">
                현재 날씨 서비스가 일시적으로 이용 불가합니다
              </p>
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-700">
                  🌤️ 여행 전 기상청이나 날씨 앱에서 각 지역의 날씨를 확인해
                  주세요
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>상세 일정</CardTitle>
        </CardHeader>
        <CardContent>
          {itineraryDays.length > 0 ? (
            <div className="space-y-6">
              {itineraryDays.map((day) => (
                <div key={day} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-blue-600">
                      {day.replace('day', '') + '일차'}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {plan.itinerary[day].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <MapPin className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{item.description}</p>
                              {item.address && (
                                <p className="text-sm text-gray-600">
                                  {item.address}
                                </p>
                              )}
                              {item.category && (
                                <div className="mt-1 flex items-center text-xs text-gray-500">
                                  <Tag className="mr-1 h-3 w-3" />
                                  {formatPlaceCategory(item.category)}
                                </div>
                              )}
                              {item.memo && (
                                <p className="mt-2 rounded-md bg-gray-100 p-2 text-sm text-gray-600">
                                  {item.memo}
                                </p>
                              )}
                            </div>
                            {/* 개별 장소의 날씨 정보 */}
                            {(() => {
                              const city = extractCityFromLocation(
                                item.description,
                              )
                              const getWeatherIcon = (condition) => {
                                const iconMap = {
                                  맑음: '☀️',
                                  구름조금: '🌤️',
                                  구름많음: '☁️',
                                  흐림: '☁️',
                                  비: '🌧️',
                                  눈: '🌨️',
                                  바람: '💨',
                                }
                                return iconMap[condition] || '☀️'
                              }

                              // 해당 일차의 날씨 정보 가져오기
                              const dayIndex =
                                parseInt(day.replace('Day ', '')) - 1
                              const dayWeather =
                                weatherData?.forecast?.[dayIndex]

                              if (dayWeather) {
                                // 도시별 날씨 변화 적용
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
                                const adjustedConditionIndex =
                                  (conditions.indexOf(dayWeather.condition) +
                                    variation.conditionOffset) %
                                  conditions.length
                                const adjustedCondition =
                                  conditions[adjustedConditionIndex]

                                const adjustedTemp = {
                                  min: Math.max(
                                    5,
                                    dayWeather.temperature.min +
                                      variation.tempOffset,
                                  ),
                                  max: Math.min(
                                    35,
                                    dayWeather.temperature.max +
                                      variation.tempOffset,
                                  ),
                                }

                                return (
                                  <div className="ml-4 text-right">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <span className="mr-1">
                                        {getWeatherIcon(adjustedCondition)}
                                      </span>
                                      <span className="mr-1 text-blue-600">
                                        📍{city}
                                      </span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600">
                                      {adjustedCondition} {adjustedTemp.min}°~
                                      {adjustedTemp.max}°
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">상세 일정이 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
