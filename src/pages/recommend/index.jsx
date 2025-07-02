import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, Users, Heart, Star } from '@/components/icons'

export default function RecommendPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-500" />,
      title: '맞춤형 여행지 추천',
      description: '취향과 조건에 맞는 완벽한 여행지를 찾아드려요',
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-500" />,
      title: '일정 최적화',
      description: '여행 기간에 맞춘 효율적인 일정을 제안해드려요',
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: '동행자별 맞춤',
      description: '혼자, 연인, 가족, 친구와의 여행에 최적화된 추천',
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: '개인 취향 반영',
      description: '선호하는 여행 스타일을 반영한 개인화 추천',
    },
  ]

  const handleStartRecommendation = () => {
    navigate('/recommend/region')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* 헤더 섹션 */}
      <div className="mb-12 text-center">
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Star className="h-4 w-4" />
            AI 기반 맞춤 추천
          </span>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          취향에 맞게 일정을 추천해 드려요!
        </h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
          몇 가지 질문에 답하시면 여러분만을 위한 완벽한 여행 계획을
          만들어드려요
        </p>
        <Button
          onClick={handleStartRecommendation}
          className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
          size="lg"
        >
          바로 추천받기
        </Button>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          📋 순식간에 여행 준비 끝
        </p>
      </div>

      {/* 특징 섹션 */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="border-0 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 프로세스 안내 */}
      <div className="rounded-lg bg-gray-50 p-8 dark:bg-gray-800">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
          간단한 5단계로 완성!
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[
            {
              step: '1',
              title: '지역 선택',
              desc: '가고 싶은 여행지를 선택해주세요',
            },
            { step: '2', title: '여행 기간', desc: '여행 일정을 알려주세요' },
            { step: '3', title: '동행자', desc: '누구와 함께 가시나요?' },
            {
              step: '4',
              title: '여행 스타일',
              desc: '선호하는 여행 스타일을 선택해주세요',
            },
            {
              step: '5',
              title: '일정 완성',
              desc: '맞춤형 여행 일정을 받아보세요',
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="mt-12 text-center">
        <Button
          onClick={handleStartRecommendation}
          className="rounded-lg bg-blue-600 px-12 py-4 text-xl font-semibold text-white hover:bg-blue-700"
          size="lg"
        >
          지금 시작하기 →
        </Button>
      </div>
    </div>
  )
}
