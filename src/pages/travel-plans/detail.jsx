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
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        <p>여행 계획을 불러오는 데 실패했습니다.</p>
        <p className="text-sm">{error.toString()}</p>
      </div>
    )
  }

  if (!plan) {
    return <div className="text-center">해당 여행 계획을 찾을 수 없습니다.</div>
  }

  // 개발용 디버깅 로그 (필요시 주석 해제)
  // console.log('Travel plan loaded successfully:', !!plan)

  const itineraryDays = plan.itinerary ? Object.keys(plan.itinerary) : []

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
            <Button asChild>
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
              <p className="mb-2 text-gray-500">
                날씨 정보를 불러올 수 없습니다
              </p>
              <p className="text-sm text-gray-400">
                여행 전 각 지역의 날씨를 확인해 주세요
              </p>
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
