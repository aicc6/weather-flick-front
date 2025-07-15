import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import DestinationAutocomplete from '@/components/planner/DestinationAutocomplete'
import useDestinationSearchRTK from '@/hooks/useDestinationSearchRTK'
import useGeolocation from '@/hooks/useGeolocation'
import { toast } from 'sonner'

export default function SaveTravelPlanModal({
  isOpen,
  onClose,
  onSave,
  recommendedPlan,
  isLoading = false,
}) {
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [origin, setOrigin] = useState('')
  const [isValid, setIsValid] = useState(false)

  const { getCurrentLocation, isLocating } = useGeolocation()
  const {
    destInputs,
    destSuggestions,
    showDestDropdown,
    updateDestInput,
    hideDropdown,
    showDropdown,
    setFinalDestinationValue,
  } = useDestinationSearchRTK()

  // 기본 제목 설정
  useEffect(() => {
    if (isOpen && recommendedPlan && !title) {
      const { regionName, days, who } = recommendedPlan.summary
      const companionLabel =
        {
          solo: '혼자',
          couple: '연인과',
          family: '가족과',
          friends: '친구와',
          colleagues: '동료와',
          group: '단체로',
        }[who] || ''

      setTitle(`${regionName} ${days}일 ${companionLabel} 여행`)
    }
  }, [isOpen, recommendedPlan, title])

  // 유효성 검사
  useEffect(() => {
    const isFormValid =
      title.trim() && startDate && (origin.trim() || destInputs.origin?.trim())
    setIsValid(isFormValid)
  }, [title, startDate, origin, destInputs.origin])

  const handleAutoLocation = async () => {
    try {
      const address = await getCurrentLocation()
      updateDestInput('origin', address)
      setOrigin(address)
      toast.success('현재 위치가 설정되었습니다')
    } catch (_error) {
      toast.error('위치를 가져올 수 없습니다. 직접 입력해 주세요')
    }
  }

  const handleOriginSelect = (suggestion) => {
    const value =
      typeof suggestion === 'string' ? suggestion : suggestion.description
    setFinalDestinationValue('origin', value)
    setOrigin(value)
  }

  const handleSave = () => {
    if (!isValid) return

    // 종료일 계산
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + recommendedPlan.summary.days - 1)

    onSave({
      title,
      startDate,
      endDate,
      origin: origin || destInputs.origin,
    })
  }

  const handleClose = () => {
    // 상태 초기화
    setTitle('')
    setStartDate(null)
    setOrigin('')
    updateDestInput('origin', '')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>여행 플랜 저장하기</DialogTitle>
          <DialogDescription>
            여행 플랜을 저장하기 위해 필요한 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 여행 제목 */}
          <div className="grid gap-2">
            <Label htmlFor="title">여행 제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 제주도 3박 4일 가족 여행"
              className="w-full"
            />
          </div>

          {/* 시작일 */}
          <div className="grid gap-2">
            <Label htmlFor="startDate">여행 시작일 *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate
                    ? format(startDate, 'PPP', { locale: ko })
                    : '날짜를 선택하세요'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-muted-foreground text-sm">
              종료일은 {recommendedPlan?.summary.days}일 일정에 맞춰 자동으로
              설정됩니다.
            </p>
          </div>

          {/* 출발지 */}
          <div className="grid gap-2">
            <Label htmlFor="origin">출발지 *</Label>
            <div className="relative flex gap-2">
              <Input
                id="origin"
                value={destInputs.origin || ''}
                onChange={(e) => updateDestInput('origin', e.target.value)}
                onFocus={() => showDropdown('origin')}
                onBlur={() => setTimeout(() => hideDropdown('origin'), 150)}
                placeholder="출발 도시를 입력하세요"
                className="flex-1"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAutoLocation}
                disabled={isLocating}
                className="shrink-0"
              >
                {isLocating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </Button>
            </div>
            <DestinationAutocomplete
              isVisible={showDestDropdown.origin}
              suggestions={destSuggestions.origin}
              onSelect={handleOriginSelect}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                저장 중...
              </>
            ) : (
              '저장하기'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
