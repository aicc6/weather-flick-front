import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  MapPin,
  Clock,
  Star,
  Calendar,
  Users,
  Heart,
  Share2,
  RefreshCw,
} from '@/components/icons'

export default function RecommendResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState(null)

  const region = searchParams.get('region')
  const period = searchParams.get('period')
  const days = searchParams.get('days')
  const who = searchParams.get('who')
  const styles = searchParams.get('styles')
  const schedule = searchParams.get('schedule')

  // 모의 추천 데이터 생성
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true)

      try {
        // 백엔드 API 호출
        const response = await fetch('/api/travel-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            region: region || '서울',
            period: period || '2박 3일',
            days: days || '3',
            who: who || '연인',
            styles: styles || 'hotplace,food',
            schedule: schedule || 'relaxed',
          }),
        })

        if (!response.ok) {
          throw new Error('추천 생성 실패')
        }

        const result = await response.json()

        if (result.success) {
          setRecommendations(result.data)
        } else {
          throw new Error(result.message || '추천 생성 실패')
        }
      } catch (error) {
        console.error('API 호출 실패:', error)

        // API 실패 시 모의 데이터 사용
        const mockData = {
          summary: {
            region: region || '서울',
            period: period || '2박 3일',
            days: parseInt(days) || 3,
            who: who || '연인',
            styles: styles?.split(',') || ['hotplace', 'food'],
            schedule: schedule || 'relaxed',
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
  }, [region, period, days, who, styles, schedule])

  const generateMockItinerary = () => {
    const daysCount = parseInt(days) || 3
    const itinerary = []

    for (let day = 1; day <= daysCount; day++) {
      itinerary.push({
        day: day,
        date: `2024-${String(day + 5).padStart(2, '0')}-${String(day + 14).padStart(2, '0')}`,
        places: [
          {
            id: `${day}-1`,
            name: `${region || '서울'} 대표 명소 ${day}`,
            category: '관광지',
            time: '09:00 - 11:00',
            description: '아름다운 풍경과 포토존으로 유명한 곳',
            rating: 4.5,
            tags: ['사진', '관광', '인기'],
          },
          {
            id: `${day}-2`,
            name: `로컬 맛집 ${day}`,
            category: '맛집',
            time: '12:00 - 13:30',
            description: '현지인들이 추천하는 숨은 맛집',
            rating: 4.7,
            tags: ['맛집', '현지', '추천'],
          },
          {
            id: `${day}-3`,
            name: `힐링 카페 ${day}`,
            category: '카페',
            time: '15:00 - 17:00',
            description: '여유로운 시간을 보내기 좋은 감성 카페',
            rating: 4.3,
            tags: ['카페', '힐링', '감성'],
          },
        ],
      })
    }

    return itinerary
  }

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
    navigate('/plans', {
      state: {
        recommendedPlan: recommendations,
      },
    })
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            완료
          </Badge>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          🎉 맞춤 여행 일정이 완성되었어요!
        </h1>
        <p className="text-gray-600">
          선택해주신 취향을 반영한 특별한 여행 코스입니다.
        </p>
      </div>

      {/* 여행 요약 정보 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            여행 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <MapPin className="mx-auto mb-1 h-5 w-5 text-blue-600" />
              <p className="text-xs text-gray-600">여행지</p>
              <p className="font-semibold">{recommendations.summary.region}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <Calendar className="mx-auto mb-1 h-5 w-5 text-green-600" />
              <p className="text-xs text-gray-600">기간</p>
              <p className="font-semibold">{recommendations.summary.period}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <Users className="mx-auto mb-1 h-5 w-5 text-purple-600" />
              <p className="text-xs text-gray-600">동행자</p>
              <p className="font-semibold">{recommendations.summary.who}</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-center">
              <Heart className="mx-auto mb-1 h-5 w-5 text-orange-600" />
              <p className="text-xs text-gray-600">스타일</p>
              <p className="font-semibold">
                {recommendations.summary.styles.length}개
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 일정 상세 */}
      <div className="mb-8 space-y-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Clock className="h-6 w-6 text-blue-600" />
          상세 일정
        </h2>

        {recommendations.itinerary.map((dayPlan, index) => (
          <Card key={dayPlan.day}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Day {dayPlan.day}</span>
                <Badge variant="outline">{dayPlan.date}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dayPlan.places.map((place, placeIndex) => (
                  <div key={place.id}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <span className="font-semibold text-blue-600">
                          {placeIndex + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {place.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {place.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {place.rating}
                            </span>
                          </div>
                        </div>
                        <p className="mb-2 text-sm text-gray-700">
                          {place.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {place.tags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {placeIndex < dayPlan.places.length - 1 && (
                      <div className="my-4 border-t border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 날씨 정보 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🌤️ 날씨 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-gray-700">
            {recommendations.weather_info.forecast}
          </p>
          <p className="text-sm text-green-600">
            {recommendations.weather_info.recommendation}
          </p>
        </CardContent>
      </Card>

      {/* 여행 팁 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>💡 여행 팁</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-blue-500">•</span>
                <span className="text-gray-700">{tip}</span>
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
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          공유하기
        </Button>
        <Button
          onClick={() => navigate('/recommend')}
          variant="outline"
          size="lg"
        >
          새로운 추천 받기
        </Button>
      </div>
    </div>
  )
}
