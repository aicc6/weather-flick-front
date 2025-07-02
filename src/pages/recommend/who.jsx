import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Users } from '@/components/icons'

export default function RecommendWhoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedCompanion, setSelectedCompanion] = useState(null)

  const region = searchParams.get('region')
  const period = searchParams.get('period')
  const days = searchParams.get('days')

  const companions = [
    {
      id: 'solo',
      label: '혼자',
      description: '나만의 시간, 자유로운 여행',
      icon: '🧘‍♀️',
      characteristics: ['자유로운 일정', '개인적 휴식', '새로운 경험'],
      recommendations: '카페, 박물관, 산책로, 관광명소',
    },
    {
      id: 'couple',
      label: '연인',
      description: '둘만의 로맨틱한 시간',
      icon: '💕',
      characteristics: ['로맨틱한 분위기', '커플 액티비티', '추억 만들기'],
      recommendations: '카페, 전망대, 해변, 야경 명소',
    },
    {
      id: 'family',
      label: '가족',
      description: '온 가족이 함께하는 즐거운 여행',
      icon: '👨‍👩‍👧‍👦',
      characteristics: ['안전한 코스', '다양한 연령대', '교육적 요소'],
      recommendations: '놀이공원, 공원, 체험관, 가족 레스토랑',
    },
    {
      id: 'friends',
      label: '친구들',
      description: '친구들과의 신나는 모험',
      icon: '👫',
      characteristics: ['액티비티 중심', '사진 스팟', '맛집 탐방'],
      recommendations: '액티비티, SNS 핫플, 맛집, 쇼핑몰',
    },
    {
      id: 'colleagues',
      label: '동료/회사',
      description: '동료들과의 워크샵이나 회식',
      icon: '👔',
      characteristics: ['팀빌딩', '네트워킹', '편의시설'],
      recommendations: '리조트, 컨벤션 센터, 단체 식당',
    },
    {
      id: 'group',
      label: '단체',
      description: '대규모 그룹 여행',
      icon: '👥',
      characteristics: ['단체 할인', '버스 이용', '단체 식사'],
      recommendations: '관광지, 단체 체험, 대형 식당',
    },
  ]

  const handleCompanionSelect = (companion) => {
    setSelectedCompanion(companion)
  }

  const handleNext = () => {
    if (selectedCompanion) {
      navigate(
        `/recommend/style?region=${region}&period=${period}&days=${days}&who=${selectedCompanion.id}`,
      )
    }
  }

  const handleBack = () => {
    navigate(`/recommend/period?region=${region}`)
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
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            3/5
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          누구와 함께 가시나요?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          동행자에 따라 맞춤형 여행 코스를 추천해드려요.
        </p>
      </div>

      {/* 선택된 정보 표시 */}
      <div className="mb-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex flex-wrap gap-3">
          {region && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                여행지
              </span>
              <Badge
                variant="outline"
                className="ml-2 dark:border-gray-600 dark:text-gray-300"
              >
                {region}
              </Badge>
            </div>
          )}
          {period && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                기간
              </span>
              <Badge
                variant="outline"
                className="ml-2 dark:border-gray-600 dark:text-gray-300"
              >
                {period}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* 동행자 선택 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companions.map((companion) => (
          <Card
            key={companion.id}
            className={`cursor-pointer transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
              selectedCompanion?.id === companion.id
                ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleCompanionSelect(companion)}
          >
            <CardContent className="p-6">
              <div className="mb-4 text-center">
                <div className="mb-3 text-4xl">{companion.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {companion.label}
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  {companion.description}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    특징
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {companion.characteristics.map((char, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    추천 장소
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {companion.recommendations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 동행자 표시 */}
      {selectedCompanion && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
            선택된 동행자
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedCompanion.icon}</span>
            <div>
              <Badge
                variant="secondary"
                className="mb-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
              >
                {selectedCompanion.label}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedCompanion.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 추천 팁 */}
      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <h4 className="mb-1 font-semibold text-green-800 dark:text-green-300">
              💡 동행자별 추천 팁
            </h4>
            <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
              <p>
                • <strong>혼자 여행</strong>: 자유로운 일정과 개인적 취향을
                반영한 코스
              </p>
              <p>
                • <strong>연인 여행</strong>: 로맨틱한 분위기와 추억을 만들 수
                있는 장소
              </p>
              <p>
                • <strong>가족 여행</strong>: 안전하고 교육적이며 모든 연령이
                즐길 수 있는 코스
              </p>
              <p>
                • <strong>친구 여행</strong>: 액티비티와 재미있는 체험 중심의
                활동적인 코스
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={handleNext}
          disabled={!selectedCompanion}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
