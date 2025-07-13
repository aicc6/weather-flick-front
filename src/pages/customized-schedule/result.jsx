import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearRegion } from '@/store/slices/customizedScheduleSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Clock,
  Star,
  Calendar,
  Users,
  Heart,
  Share2,
  RefreshCw,
} from '@/components/icons'
import { http } from '@/lib/http'
import { useGetCustomTravelRecommendationsMutation } from '@/store/api/customTravelApi'
import { useCreateTravelPlanMutation } from '@/store/api/travelPlansApi'
import { toast } from 'sonner'
import SaveTravelPlanModal from '@/components/SaveTravelPlanModal'
import { useAuth } from '@/contexts/AuthContextRTK'

// 여행 스타일 정의
const travelStyles = [
  {
    id: 'activity',
    label: '체험·액티비티',
    icon: '🎯',
  },
  {
    id: 'hotplace',
    label: 'SNS 핫플레이스',
    icon: '📸',
  },
  {
    id: 'nature',
    label: '자연과 함께',
    icon: '🌿',
  },
  {
    id: 'landmark',
    label: '유명 관광지는 필수',
    icon: '🏛️',
  },
  {
    id: 'healing',
    label: '여유롭게 힐링',
    icon: '🧘‍♀️',
  },
  {
    id: 'culture',
    label: '문화·예술·역사',
    icon: '🎨',
  },
  {
    id: 'local',
    label: '여행지 느낌 물씬',
    icon: '🏘️',
  },
  {
    id: 'shopping',
    label: '쇼핑은 열정적으로',
    icon: '🛍️',
  },
  {
    id: 'food',
    label: '관광보다 먹방',
    icon: '🍽️',
  },
  {
    id: 'pet',
    label: '애완동물과 함께',
    icon: '🐾',
  },
]

// 동행자 정보 정의
const companions = [
  {
    id: 'solo',
    label: '혼자',
    icon: '🧘‍♀️',
  },
  {
    id: 'couple',
    label: '연인',
    icon: '💕',
  },
  {
    id: 'family',
    label: '가족',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'friends',
    label: '친구들',
    icon: '👫',
  },
  {
    id: 'colleagues',
    label: '동료/회사',
    icon: '👔',
  },
  {
    id: 'group',
    label: '단체',
    icon: '👥',
  },
]

export default function CustomizedScheduleResultPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const [recommendations, setRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [attractionNames, setAttractionNames] = useState([])
  const [getCustomRecommendations] = useGetCustomTravelRecommendationsMutation()
  const [createTravelPlan] = useCreateTravelPlanMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const region = searchParams.get('region')
  const period = searchParams.get('period')
  const days = searchParams.get('days')
  const who = searchParams.get('who')
  const styles = searchParams.get('styles')
  const schedule = searchParams.get('schedule')

  const { regionName: displayedRegionName, regionCode } = useSelector(
    (state) => state.customizedSchedule,
  )

  // URL에서 region 정보를 사용하여 임시로 설정
  const finalRegionCode = regionCode || region
  const finalRegionName = displayedRegionName || '서울'

  useEffect(() => {
    if (!region) return
    // 관광지 이름 불러오기
    http
      .GET(`/attractions/by-region?region_code=${encodeURIComponent(region)}`)
      .then((res) => res.json())
      .then((data) => setAttractionNames(data))
      .catch(() => setAttractionNames([]))
  }, [region])

  const generateMockItinerary = useCallback(() => {
    const daysCount = parseInt(days)
    const itinerary = []

    for (let day = 1; day <= daysCount; day++) {
      // 랜덤 관광지 이름 선택
      const randomAttraction =
        attractionNames.length > 0
          ? attractionNames[Math.floor(Math.random() * attractionNames.length)]
          : `${region} 대표 명소 ${day}`

      itinerary.push({
        day: day,
        date: `2024-${String(day + 5).padStart(2, '0')}-${String(day + 14).padStart(2, '0')}`,
        places: [
          {
            id: `${day}-1`,
            name: randomAttraction,
            category: '관광지',
            time: '09:00 - 11:00',
            description: '아름다운 풍경과 포토존으로 유명한 곳',
            rating: 4.5,
            tags: ['사진', '관광', '인기'],
            address: `${finalRegionName} 주요 관광지`,
            latitude: 33.3785614 + (Math.random() * 0.2 - 0.1),
            longitude: 126.5661908 + (Math.random() * 0.2 - 0.1),
          },
          {
            id: `${day}-2`,
            name: `로컬 맛집 ${day}`,
            category: '맛집',
            time: '12:00 - 13:30',
            description: '현지인들이 추천하는 숨은 맛집',
            rating: 4.7,
            tags: ['맛집', '현지', '추천'],
            address: `${finalRegionName} 맛집거리`,
            latitude: 33.3785614 + (Math.random() * 0.2 - 0.1),
            longitude: 126.5661908 + (Math.random() * 0.2 - 0.1),
          },
          {
            id: `${day}-3`,
            name: `힐링 카페 ${day}`,
            category: '카페',
            time: '15:00 - 17:00',
            description: '여유로운 시간을 보내기 좋은 감성 카페',
            rating: 4.3,
            tags: ['카페', '힐링', '감성'],
            address: `${finalRegionName} 카페거리`,
            latitude: 33.3785614 + (Math.random() * 0.2 - 0.1),
            longitude: 126.5661908 + (Math.random() * 0.2 - 0.1),
          },
        ],
      })
    }

    return itinerary
  }, [days, region, attractionNames])

  // 추천 데이터 생성
  useEffect(() => {
    const generateRecommendations = async () => {
      if (!finalRegionCode) return

      setIsLoading(true)

      try {
        // RTK Query API 호출
        const result = await getCustomRecommendations({
          region_code: finalRegionCode,
          region_name: finalRegionName,
          period: period,
          days: parseInt(days),
          who: who,
          styles: styles?.split(',') || [],
          schedule: schedule,
        }).unwrap()

        // API 응답 데이터 형식 변환
        console.log('API Response:', result) // 디버깅용
        const formattedData = {
          summary: {
            region: finalRegionCode,
            regionName: finalRegionName,
            period: period,
            days: parseInt(days),
            who: who,
            styles: styles?.split(','),
            schedule: schedule,
          },
          itinerary: result.days,
          weather_info: result.weather_summary || {
            forecast: '맑음, 평균 기온 20°C',
            recommendation: '야외 활동하기 좋은 날씨입니다!',
          },
          tips: [
            '선택하신 스타일에 맞는 포토존이 많이 포함되어 있어요',
            '맛집 위주로 구성된 일정으로 미식 여행을 즐기실 수 있어요',
            schedule === 'relaxed'
              ? '널널한 일정으로 여유롭게 즐기실 수 있도록 구성했어요'
              : '알찬 일정으로 다양한 경험을 하실 수 있도록 구성했어요',
          ],
        }

        setRecommendations(formattedData)
        toast.success('맞춤 여행 일정이 생성되었습니다!')
      } catch (error) {
        console.error('API 호출 실패:', error)
        toast.error('추천 생성에 실패했습니다. 모의 데이터를 표시합니다.')

        // API 실패 시 모의 데이터 사용
        const mockData = {
          summary: {
            region: finalRegionCode,
            regionName: finalRegionName,
            period: period,
            days: parseInt(days),
            who: who,
            styles: styles?.split(','),
            schedule: schedule,
          },
          itinerary: generateMockItinerary(),
          weather_info: {
            forecast: '맑음, 평균 기온 20°C',
            recommendation: '야외 활동하기 좋은 날씨입니다!',
          },
          tips: [
            '선택하신 스타일에 맞는 포토존이 많이 포함되어 있어요',
            '맛집 위주로 구성된 일정으로 미식 여행을 즐기실 수 있어요',
            '널널한 일정으로 여유롭게 즐기실 수 있도록 구성했어요',
          ],
        }
        setRecommendations(mockData)
      }

      setIsLoading(false)
    }

    generateRecommendations()
  }, [
    finalRegionCode,
    finalRegionName,
    period,
    days,
    who,
    styles,
    schedule,
    generateMockItinerary,
    getCustomRecommendations,
  ])

  const handleBack = () => {
    navigate(
      `/recommend/schedule?region=${region}&period=${period}&days=${days}&who=${who}&styles=${styles}`,
    )
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '맞춤 여행 일정',
        text: `${region} ${period} 여행 일정을 확인해보세요!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  const handleSavePlans = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요한 기능입니다.')
      // 현재 URL을 저장하고 로그인 페이지로 이동
      const currentUrl = window.location.pathname + window.location.search
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }
    setIsModalOpen(true)
  }
  
  const handleModalSave = async (formData) => {
    setIsSaving(true)
    
    try {
      // 여행 일정 데이터 구성
      const itineraryData = {}
      
      // recommendations.itinerary의 데이터를 day1, day2, day3 형식으로 변환
      // 백엔드 스키마에 맞게 각 day의 값을 리스트로 변환
      recommendations.itinerary.forEach((dayPlan) => {
        itineraryData[`day${dayPlan.day}`] = dayPlan.places.map((place) => ({
          name: place.name,
          time: place.time,
          description: place.description,
          category: place.category,
          tags: place.tags,
          date: dayPlan.date || formData.startDate,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          rating: place.rating,
          image: place.image
        }))
      })
      
      const planData = {
        title: formData.title,
        description: `${recommendations.summary.who} 여행 - ${recommendations.summary.styles?.join(', ')}`,
        start_date: formData.startDate.toISOString().split('T')[0],
        end_date: formData.endDate.toISOString().split('T')[0],
        start_location: formData.origin,
        theme: recommendations.summary.styles?.[0] || '여행',
        status: 'PLANNING',
        itinerary: itineraryData,
        plan_type: 'custom',  // 맞춤 일정 표시
      }
      
      // API 호출하여 여행 플랜 저장
      const result = await createTravelPlan(planData).unwrap()
      
      // Redux 상태 초기화
      dispatch(clearRegion())
      
      // localStorage 초기화
      localStorage.removeItem('customizedSchedule')
      
      toast.success('여행 계획이 저장되었습니다!')
      
      // 내 여행 플랜 페이지로 이동
      navigate('/travel-plans')
      
    } catch (error) {
      console.error('저장 중 오류:', error)
      toast.error('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
      setIsModalOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <div className="mb-4 inline-block animate-spin">
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            맞춤 여행 일정을 생성하고 있어요
          </h2>
          <p className="mb-4 text-gray-600">
            선택해주신 정보를 바탕으로 최적의 여행 코스를 만들고 있습니다.
          </p>
          <div className="mb-8 flex justify-center space-x-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          추천 일정을 생성할 수 없습니다
        </h2>
        <p className="mb-4 text-gray-600">다시 시도해주세요.</p>
        <Button onClick={handleBack}>다시 시도하기</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            완료
          </Badge>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          🎉 맞춤 여행 일정이 완성되었어요!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          선택해주신 취향을 반영한 특별한 여행 코스입니다.
        </p>
      </div>

      {/* 여행 요약 정보 */}
      <Card className="mb-8 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Star className="h-5 w-5 text-yellow-500" />
            여행 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
              <MapPin className="mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">여행지</p>
              <p className="font-semibold dark:text-white">
                {displayedRegionName}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
              <Calendar className="mx-auto mb-1 h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">기간</p>
              <p className="font-semibold dark:text-white">
                {recommendations.summary.period}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center dark:bg-purple-900/20">
              <Users className="mx-auto mb-1 h-5 w-5 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">동행자</p>
              <div className="flex items-center justify-center gap-1">
                <span>
                  {
                    companions.find((c) => c.id === recommendations.summary.who)
                      ?.icon
                  }
                </span>
                <p className="font-semibold dark:text-white">
                  {companions.find((c) => c.id === recommendations.summary.who)
                    ?.label || recommendations.summary.who}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
              <Heart className="mx-auto mb-1 h-5 w-5 text-orange-600 dark:text-orange-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                선호 스타일
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {recommendations.summary.styles.map((styleId) => {
                  const style = travelStyles.find((s) => s.id === styleId)
                  return (
                    <Badge
                      key={styleId}
                      variant="outline"
                      className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300"
                    >
                      <span>{style?.icon}</span>
                      {style?.label || styleId}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 일정 상세 */}
      <div className="mb-8 space-y-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          상세 일정
        </h2>

        {recommendations.itinerary.map((dayPlan, _index) => (
          <Card
            key={dayPlan.day}
            className="dark:border-gray-700 dark:bg-gray-800"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between dark:text-white">
                <span>Day {dayPlan.day}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dayPlan.places.map((place, placeIndex) => (
                  <div key={place.id}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {placeIndex + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {place.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {place.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium dark:text-gray-300">
                              {place.rating}
                            </span>
                          </div>
                        </div>
                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                          {place.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {place.tags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant="secondary"
                              className="text-xs dark:bg-gray-700 dark:text-gray-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {placeIndex < dayPlan.places.length - 1 && (
                      <div className="my-4 border-t border-gray-200 dark:border-gray-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 여행 팁 */}
      <Card className="mb-8 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">💡 여행 팁</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-blue-500">•</span>
                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button
          onClick={handleSavePlans}
          className="bg-blue-600 text-white hover:bg-blue-700"
          size="lg"
        >
          여행 플랜으로 저장하기
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          size="lg"
          className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Share2 className="h-4 w-4" />
          공유하기
        </Button>
        <Button
          onClick={() => navigate('/recommend')}
          variant="outline"
          size="lg"
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          새로운 추천 받기
        </Button>
      </div>
      
      {/* 저장 모달 */}
      <SaveTravelPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        recommendedPlan={recommendations}
        isLoading={isSaving}
      />
    </div>
  )
}
