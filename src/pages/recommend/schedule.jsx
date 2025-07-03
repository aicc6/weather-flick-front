import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Clock } from '@/components/icons'

export default function RecommendSchedulePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  const region = searchParams.get('region')
  const period = searchParams.get('period')
  const days = searchParams.get('days')
  const who = searchParams.get('who')
  const styles = searchParams.get('styles')

  const scheduleTypes = [
    {
      id: 'packed',
      label: '빼곡한 일정 선호',
      description: '많은 곳을 보고 다양한 경험을 하고 싶어요',
      icon: '⚡',
      characteristics: [
        '하루에 3-4개 이상의 장소 방문',
        '이동 시간을 최소화한 효율적 일정',
        '다양한 액티비티와 체험',
        '시간 단위로 세밀한 계획',
      ],
      pros: [
        '많은 곳을 경험할 수 있음',
        '알찬 여행이 가능',
        '시간 활용도가 높음',
      ],
      cons: [
        '피로할 수 있음',
        '여유시간이 적음',
        '예상치 못한 상황에 대응이 어려움',
      ],
    },
    {
      id: 'relaxed',
      label: '널널한 일정 선호',
      description: '여유롭게 즐기며 휴식도 충분히 취하고 싶어요',
      icon: '🏖️',
      characteristics: [
        '하루에 1-2개 정도의 주요 장소 방문',
        '충분한 휴식 시간과 여유',
        '현지에서의 자유로운 시간',
        '예상치 못한 발견을 위한 여백',
      ],
      pros: ['스트레스 없는 여행', '깊이 있는 경험 가능', '유연한 일정 조정'],
      cons: [
        '상대적으로 적은 장소 방문',
        '계획성이 부족할 수 있음',
        '시간이 남을 수 있음',
      ],
    },
  ]

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule)
  }

  const handleNext = () => {
    if (selectedSchedule) {
      const params = new URLSearchParams({
        region: region || '',
        period: period || '',
        days: days || '',
        who: who || '',
        styles: styles || '',
        schedule: selectedSchedule.id,
      }).toString()

      navigate(`/customized-schedule/result?${params}`)
    }
  }

  const handleBack = () => {
    navigate(
      `/customized-schedule/style?region=${region}&period=${period}&days=${days}&who=${who}`,
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
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            5/5
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          선호하는 여행 일정은?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          선택해주신 스타일로 일정을 만들어드려요.
        </p>
      </div>

      {/* 선택된 정보 표시 */}
      <div className="mb-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <h3 className="mb-3 font-semibold text-gray-800 dark:text-white">
          선택하신 정보
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {region && (
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                여행지
              </span>
              <Badge
                variant="outline"
                className="mt-1 dark:border-gray-600 dark:text-gray-300"
              >
                {region}
              </Badge>
            </div>
          )}
          {period && (
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                기간
              </span>
              <Badge
                variant="outline"
                className="mt-1 dark:border-gray-600 dark:text-gray-300"
              >
                {period}
              </Badge>
            </div>
          )}
          {who && (
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                동행자
              </span>
              <Badge
                variant="outline"
                className="mt-1 dark:border-gray-600 dark:text-gray-300"
              >
                {who}
              </Badge>
            </div>
          )}
          {styles && (
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                스타일
              </span>
              <Badge
                variant="outline"
                className="mt-1 dark:border-gray-600 dark:text-gray-300"
              >
                {styles.split(',').length}개 선택
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* 일정 타입 선택 */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {scheduleTypes.map((schedule) => (
          <Card
            key={schedule.id}
            className={`cursor-pointer transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
              selectedSchedule?.id === schedule.id
                ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleScheduleSelect(schedule)}
          >
            <CardContent className="p-6">
              <div className="mb-4 text-center">
                <div className="mb-3 text-4xl">{schedule.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {schedule.label}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {schedule.description}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    특징
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {schedule.characteristics.map((char, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 text-blue-500">•</span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <h4 className="mb-1 text-xs font-semibold text-green-700 dark:text-green-400">
                      장점
                    </h4>
                    <ul className="space-y-1 text-xs text-green-600 dark:text-green-400">
                      {schedule.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span>+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-1 text-xs font-semibold text-orange-700 dark:text-orange-400">
                      고려사항
                    </h4>
                    <ul className="space-y-1 text-xs text-orange-600 dark:text-orange-400">
                      {schedule.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span>-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {selectedSchedule?.id === schedule.id && (
                <div className="mt-4 text-center">
                  <Badge variant="default" className="bg-blue-600 text-white">
                    ✓ 선택됨
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 일정 타입 표시 */}
      {selectedSchedule && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
            선택된 일정 스타일
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedSchedule.icon}</span>
            <div>
              <Badge
                variant="secondary"
                className="mb-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
              >
                {selectedSchedule.label}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedSchedule.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 마지막 단계 안내 */}
      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <h4 className="mb-1 font-semibold text-green-800 dark:text-green-300">
              🎉 마지막 단계예요!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              선택해주신 정보를 바탕으로 맞춤형 여행 일정을 생성해드릴게요. 날씨
              정보와 현지 상황을 고려하여 최적의 여행 코스를 추천해드립니다.
            </p>
          </div>
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={handleNext}
          disabled={!selectedSchedule}
          className="rounded-lg bg-blue-600 px-12 py-4 text-lg text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          맞춤 여행 일정 생성하기 🚀
        </Button>
      </div>
    </div>
  )
}
