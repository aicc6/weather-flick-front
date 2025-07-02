import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, Sun, Umbrella } from '@/components/icons'

const weatherConditions = [
  {
    id: 'exclude-rain',
    label: '강수량 많으면 제외',
    description: '비나 눈이 많이 오는 날은 실내 활동 위주로 계획',
    icon: Umbrella,
  },
  {
    id: 'low-uv',
    label: '자외선 낮은 곳 추천',
    description: '자외선 지수가 낮은 시간대나 장소를 우선 추천',
    icon: Sun,
  },
  {
    id: 'indoor-focus',
    label: '실내 활동 위주',
    description: '날씨에 관계없이 실내에서 즐길 수 있는 활동',
    icon: Cloud,
  },
]

export default function WeatherConditionSelector({
  selectedConditions = [],
  onConditionChange,
}) {
  const handleConditionToggle = (conditionId) => {
    const newConditions = selectedConditions.includes(conditionId)
      ? selectedConditions.filter((id) => id !== conditionId)
      : [...selectedConditions, conditionId]
    onConditionChange(newConditions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cloud className="h-5 w-5" />
          날씨 고려 조건
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weatherConditions.map((condition) => {
            const IconComponent = condition.icon
            return (
              <div
                key={condition.id}
                className="flex items-start space-x-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <Checkbox
                  id={condition.id}
                  checked={selectedConditions.includes(condition.id)}
                  onCheckedChange={() => handleConditionToggle(condition.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={condition.id}
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                  >
                    <IconComponent className="h-4 w-4" />
                    {condition.label}
                  </Label>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {condition.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
