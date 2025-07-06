import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Calendar } from '@/components/icons'
import { useGetActiveRegionsQuery } from '@/store/api/regionsApi'

export default function RecommendPeriodPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedPeriod, setSelectedPeriod] = useState(null)

  const regionCode = searchParams.get('region')

  // 지역 정보 가져오기
  const { data: regions = [] } = useGetActiveRegionsQuery()

  // 지역 코드로 지역명 찾기
  const selectedRegion = regions.find((r) => r.region_code === regionCode)
  const regionName = selectedRegion?.region_name || regionCode

  const periods = [
    {
      id: 'day',
      label: '당일치기',
      days: 1,
      description: '하루 만에 즐기는 알찬 여행',
      icon: '⚡',
    },
    {
      id: 'short1',
      label: '1박 2일',
      days: 2,
      description: '주말을 활용한 짧은 휴식',
      icon: '🌅',
    },
    {
      id: 'short2',
      label: '2박 3일',
      days: 3,
      description: '가장 인기 있는 여행 기간',
      icon: '⭐',
    },
    {
      id: 'medium1',
      label: '3박 4일',
      days: 4,
      description: '여유로운 일정으로 충분한 휴식',
      icon: '🏖️',
    },
    {
      id: 'medium2',
      label: '4박 5일',
      days: 5,
      description: '깊이 있는 여행과 다양한 체험',
      icon: '🎒',
    },
    {
      id: 'long',
      label: '5박 6일',
      days: 6,
      description: '여행지를 완전히 만끽하는 시간',
      icon: '🌟',
    },
    {
      id: 'extended',
      label: '일주일 이상',
      days: 7,
      description: '장기 여행과 특별한 경험',
      icon: '🌍',
    },
  ]

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period)
  }

  const handleNext = () => {
    if (selectedPeriod) {
      navigate(
        `/customized-schedule/who?region=${regionCode}&period=${selectedPeriod.id}&days=${selectedPeriod.days}`,
      )
    }
  }

  const handleBack = () => {
    navigate('/customized-schedule/region')
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
            2/5
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          여행 기간은?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          원하는 기간을 선택해 주세요.
        </p>
      </div>

      {/* 선택된 지역 표시 */}
      {regionCode && (
        <div className="mb-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            선택된 여행지
          </p>
          <Badge
            variant="outline"
            className="text-gray-700 dark:border-gray-600 dark:text-gray-300"
          >
            {regionName}
          </Badge>
        </div>
      )}

      {/* 기간 선택 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {periods.map((period) => (
          <Card
            key={period.id}
            className={`cursor-pointer transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
              selectedPeriod?.id === period.id
                ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => handlePeriodSelect(period)}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-3 text-3xl">{period.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                {period.label}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {period.description}
              </p>
              {period.days > 1 && (
                <div className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                  {period.days}일 일정
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 기간 표시 */}
      {selectedPeriod && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
            선택된 여행 기간
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedPeriod.icon}</span>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
            >
              {selectedPeriod.label}
            </Badge>
          </div>
        </div>
      )}

      {/* 추천 팁 */}
      <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h4 className="mb-1 font-semibold text-yellow-800 dark:text-yellow-300">
              💡 추천 팁
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              • <strong>2박 3일</strong>: 가장 인기 있는 기간으로 주요 명소를
              둘러볼 수 있어요
              <br />• <strong>3박 4일 이상</strong>: 여유로운 일정으로 현지
              문화를 깊이 체험할 수 있어요
              <br />• <strong>당일치기</strong>: 근거리 여행지에 적합하며 간단한
              휴식에 좋아요
            </p>
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={handleNext}
          disabled={!selectedPeriod}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
