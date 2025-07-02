import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Heart } from '@/components/icons'

export default function RecommendStylePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedStyles, setSelectedStyles] = useState([])

  const region = searchParams.get('region')
  const period = searchParams.get('period')
  const days = searchParams.get('days')
  const who = searchParams.get('who')

  const travelStyles = [
    {
      id: 'activity',
      label: '체험·액티비티',
      description: '다양한 체험과 액티비티를 즐기고 싶어요',
      icon: '🎯',
      examples: '서핑, 패러글라이딩, 쿠킹클래스, 워터파크',
    },
    {
      id: 'hotplace',
      label: 'SNS 핫플레이스',
      description: '인스타 감성과 사진 찍기 좋은 곳을 찾아요',
      icon: '📸',
      examples: '카페, 전망대, 포토존, 감성 스팟',
    },
    {
      id: 'nature',
      label: '자연과 함께',
      description: '자연 속에서 힐링하고 여유를 만끽해요',
      icon: '🌿',
      examples: '산책로, 공원, 해변, 숲길',
    },
    {
      id: 'landmark',
      label: '유명 관광지는 필수',
      description: '대표 명소와 관광지는 꼭 가보고 싶어요',
      icon: '🏛️',
      examples: '랜드마크, 박물관, 궁궐, 유명 관광지',
    },
    {
      id: 'healing',
      label: '여유롭게 힐링',
      description: '바쁜 일상을 벗어나 편안하게 쉬고 싶어요',
      icon: '🧘‍♀️',
      examples: '스파, 온천, 조용한 카페, 휴양지',
    },
    {
      id: 'culture',
      label: '문화·예술·역사',
      description: '지역의 문화와 역사를 깊이 알고 싶어요',
      icon: '🎨',
      examples: '박물관, 미술관, 전통 마을, 문화재',
    },
    {
      id: 'local',
      label: '여행지 느낌 물씬',
      description: '현지인처럼 그 지역만의 매력을 느끼고 싶어요',
      icon: '🏘️',
      examples: '로컬 카페, 전통 시장, 골목길, 현지 맛집',
    },
    {
      id: 'shopping',
      label: '쇼핑은 열정적으로',
      description: '쇼핑과 구매하는 재미를 만끽하고 싶어요',
      icon: '🛍️',
      examples: '백화점, 아울렛, 전통 시장, 쇼핑몰',
    },
    {
      id: 'food',
      label: '관광보다 먹방',
      description: '맛집 탐방과 음식이 여행의 주목적이에요',
      icon: '🍽️',
      examples: '맛집, 로컬 푸드, 시장 음식, 특산물',
    },
  ]

  const handleStyleToggle = (styleId) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId],
    )
  }

  const handleNext = () => {
    if (selectedStyles.length > 0) {
      const styleParams = selectedStyles.join(',')
      navigate(
        `/recommend/schedule?region=${region}&period=${period}&days=${days}&who=${who}&styles=${styleParams}`,
      )
    }
  }

  const handleBack = () => {
    navigate(`/recommend/who?region=${region}&period=${period}&days=${days}`)
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
            4/5
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          내가 선호하는 여행 스타일은?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          다중 선택이 가능해요. 원하는 스타일을 모두 선택해주세요.
        </p>
      </div>

      {/* 선택된 정보 표시 */}
      <div className="mb-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex flex-wrap gap-3 text-sm">
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
          {who && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                동행자
              </span>
              <Badge
                variant="outline"
                className="ml-2 dark:border-gray-600 dark:text-gray-300"
              >
                {who}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* 여행 스타일 선택 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {travelStyles.map((style) => (
          <Card
            key={style.id}
            className={`cursor-pointer transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
              selectedStyles.includes(style.id)
                ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleStyleToggle(style.id)}
          >
            <CardContent className="p-5">
              <div className="mb-3 text-center">
                <div className="mb-2 text-3xl">{style.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {style.label}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {style.description}
                </p>
              </div>

              <div className="border-t pt-3 dark:border-gray-600">
                <h4 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  예시
                </h4>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {style.examples}
                </p>
              </div>

              {selectedStyles.includes(style.id) && (
                <div className="mt-3 text-center">
                  <Badge variant="default" className="bg-blue-600 text-white">
                    ✓ 선택됨
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 스타일 표시 */}
      {selectedStyles.length > 0 && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-3 text-sm text-blue-600 dark:text-blue-400">
            선택된 여행 스타일 ({selectedStyles.length}개)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedStyles.map((styleId) => {
              const style = travelStyles.find((s) => s.id === styleId)
              return (
                <Badge
                  key={styleId}
                  variant="secondary"
                  className="flex items-center gap-1 bg-blue-100 text-blue-800"
                >
                  <span>{style.icon}</span>
                  {style.label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* 추천 팁 */}
      <div className="mb-8 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
        <div className="flex items-start gap-3">
          <Heart className="mt-0.5 h-5 w-5 text-purple-600 dark:text-purple-400" />
          <div>
            <h4 className="mb-1 font-semibold text-purple-800 dark:text-purple-300">
              💡 스타일 선택 팁
            </h4>
            <div className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <p>
                • <strong>2-3개 선택</strong>: 적당한 개수로 선택하면 더 정확한
                추천을 받을 수 있어요
              </p>
              <p>
                • <strong>다양한 조합</strong>: 액티비티 + 먹방, 힐링 + 자연 등
                원하는 대로 조합하세요
              </p>
              <p>
                • <strong>동행자 고려</strong>: 함께 가는 사람들의 취향도
                고려해서 선택해보세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={handleNext}
          disabled={selectedStyles.length === 0}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
