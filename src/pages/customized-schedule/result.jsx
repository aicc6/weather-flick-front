import {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  lazy,
  Suspense,
} from 'react'
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
  RefreshCw,
} from '@/components/icons'
import { http } from '@/lib/http'
import { useGetCustomTravelRecommendationsMutation } from '@/store/api/customTravelApi'
import { useCreateTravelPlanMutation } from '@/store/api/travelPlansApi'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContextRTK'

// Lazy import for SaveTravelPlanModal
const SaveTravelPlanModal = lazy(
  () => import('@/components/SaveTravelPlanModal'),
)

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

// 로딩 진행률 컴포넌트
const LoadingProgress = memo(
  ({ step, totalSteps, currentStepLabel, estimatedTime, onCancel }) => {
    const progress = Math.round((step / totalSteps) * 100)
    const remainingTime = Math.max(
      0,
      estimatedTime - (step - 1) * (estimatedTime / totalSteps),
    )

    return (
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-block">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            맞춤 여행 일정을 생성하고 있어요
          </h2>
          <p className="mb-4 text-gray-600">{currentStepLabel}</p>
        </div>

        {/* 진행률 바 */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>진행률</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 단계 표시 */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>
              단계 {step} / {totalSteps}
            </span>
            <span>약 {Math.ceil(remainingTime)}초 남음</span>
          </div>
        </div>

        {/* 진행 단계들 */}
        <div className="mb-6 space-y-2">
          {[
            { label: '여행 정보 분석', icon: '🔍' },
            { label: '맞춤 장소 검색', icon: '📍' },
            { label: '최적 경로 계산', icon: '🗺️' },
            { label: '일정 최종 조정', icon: '✨' },
          ].map((stepInfo, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 rounded p-2 ${
                index < step
                  ? 'bg-green-50 text-green-800'
                  : index === step - 1
                    ? 'bg-blue-50 text-blue-800'
                    : 'bg-gray-50 text-gray-500'
              }`}
            >
              <span className="text-lg">{stepInfo.icon}</span>
              <span className="flex-1">{stepInfo.label}</span>
              {index < step && <span className="text-green-600">✓</span>}
              {index === step - 1 && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* 취소 버튼 */}
        {onCancel && (
          <div className="text-center">
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              취소
            </Button>
          </div>
        )}

        {/* 애니메이션 점들 */}
        <div className="mt-6 flex justify-center space-x-2">
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
    )
  },
)

LoadingProgress.displayName = 'LoadingProgress'

// 여행 일정 카드 컴포넌트
const ItineraryDayCard = memo(({ dayPlan }) => (
  <Card className="dark:border-gray-700 dark:bg-gray-800">
    <CardHeader>
      <CardTitle className="flex items-center justify-between dark:text-white">
        <span>Day {dayPlan.day}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {dayPlan.places.map((place, placeIndex) => (
          <div key={place.id}>
            <PlaceItem place={place} placeIndex={placeIndex} />
            {placeIndex < dayPlan.places.length - 1 && (
              <div className="my-4 border-t border-gray-200 dark:border-gray-600" />
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
))

ItineraryDayCard.displayName = 'ItineraryDayCard'

// 여행지 아이템 컴포넌트
const PlaceItem = memo(({ place, placeIndex }) => (
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
      {place.description && place.description.trim() && (
        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
          {place.description}
        </p>
      )}
      {place.address && (
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          📍 {place.address}
        </p>
      )}
      {place.tags && place.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {place.tags.map((tag, tagIndex) => (
            <Badge
              key={tagIndex}
              variant={
                tag === '반려동물동반가능' || tag === '펫프렌들리'
                  ? 'default'
                  : 'secondary'
              }
              className={`text-xs ${
                tag === '반려동물동반가능' || tag === '펫프렌들리'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {tag === '반려동물동반가능' ? '🐕 ' + tag : tag}
            </Badge>
          ))}
        </div>
      )}
      {place.pet_info && (
        <div className="mt-2 rounded-lg bg-green-50 p-2 text-xs dark:bg-green-900/20">
          <p className="font-medium text-green-800 dark:text-green-400">
            🐾 반려동물 동반 정보
          </p>
          {place.pet_info.pet_acpt_abl && (
            <p className="mt-1 text-green-700 dark:text-green-300">
              {place.pet_info.pet_acpt_abl}
            </p>
          )}
          {place.pet_info.pet_info && (
            <p className="mt-1 text-green-600 dark:text-green-300">
              {place.pet_info.pet_info}
            </p>
          )}
        </div>
      )}
    </div>
  </div>
))

PlaceItem.displayName = 'PlaceItem'

// 에러 처리 유틸리티 함수
const getErrorInfo = (error) => {
  // 네트워크 오류 확인
  if (!navigator.onLine) {
    return {
      type: 'network',
      title: '🌐 인터넷 연결 확인',
      message: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      canRetry: true,
      suggestedAction: '네트워크 연결 확인',
    }
  }

  // RTK Query 에러 구조 확인
  if (error?.status) {
    switch (error.status) {
      case 401:
        return {
          type: 'auth',
          title: '🔐 로그인이 필요합니다',
          message: '맞춤 일정을 생성하려면 로그인이 필요합니다.',
          canRetry: false,
          suggestedAction: '로그인하기',
        }
      case 403:
        return {
          type: 'forbidden',
          title: '🚫 접근 권한이 없습니다',
          message: '이 기능을 사용할 권한이 없습니다.',
          canRetry: false,
          suggestedAction: '권한 확인',
        }
      case 404:
        return {
          type: 'notFound',
          title: '🔍 요청한 정보를 찾을 수 없습니다',
          message: '선택하신 지역의 정보를 찾을 수 없습니다.',
          canRetry: true,
          suggestedAction: '다른 지역 선택',
        }
      case 429:
        return {
          type: 'rateLimit',
          title: '⏰ 요청이 너무 많습니다',
          message: '잠시 후 다시 시도해주세요.',
          canRetry: true,
          suggestedAction: '잠시 후 재시도',
        }
      case 500:
      case 502:
      case 503:
        return {
          type: 'server',
          title: '🔧 서버 오류가 발생했습니다',
          message: '일시적인 서버 문제입니다. 잠시 후 다시 시도해주세요.',
          canRetry: true,
          suggestedAction: '잠시 후 재시도',
        }
      default:
        return {
          type: 'unknown',
          title: '❓ 알 수 없는 오류',
          message: `오류가 발생했습니다. (코드: ${error.status})`,
          canRetry: true,
          suggestedAction: '다시 시도',
        }
    }
  }

  // 일반적인 네트워크 오류
  if (error?.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'network',
      title: '🌐 연결 오류',
      message: '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
      canRetry: true,
      suggestedAction: '연결 상태 확인',
    }
  }

  // 기타 오류
  return {
    type: 'unknown',
    title: '❓ 예상치 못한 오류',
    message: '알 수 없는 오류가 발생했습니다.',
    canRetry: true,
    suggestedAction: '다시 시도',
  }
}

// URL 파라미터 검증 함수
const validateUrlParams = (params) => {
  const errors = []
  const { region, period, days, who, styles, schedule } = params

  // 필수 파라미터 검증
  if (!region) {
    errors.push({ field: 'region', message: '여행지 정보가 누락되었습니다.' })
  } else if (!/^\d+$/.test(region)) {
    errors.push({ field: 'region', message: '올바르지 않은 지역 코드입니다.' })
  }

  if (!period) {
    errors.push({ field: 'period', message: '여행 기간이 누락되었습니다.' })
  }

  if (!days) {
    errors.push({ field: 'days', message: '여행 일수가 누락되었습니다.' })
  } else {
    const daysNum = parseInt(days)
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
      errors.push({
        field: 'days',
        message: '여행 일수는 1일에서 30일 사이여야 합니다.',
      })
    }
  }

  if (!who) {
    errors.push({ field: 'who', message: '동행자 정보가 누락되었습니다.' })
  } else if (!companions.find((c) => c.id === who)) {
    errors.push({ field: 'who', message: '올바르지 않은 동행자 정보입니다.' })
  }

  if (!styles) {
    errors.push({
      field: 'styles',
      message: '여행 스타일 정보가 누락되었습니다.',
    })
  } else {
    const styleList = styles.split(',')
    const validStyles = travelStyles.map((s) => s.id)
    const invalidStyles = styleList.filter(
      (style) => !validStyles.includes(style),
    )
    if (invalidStyles.length > 0) {
      errors.push({
        field: 'styles',
        message: `올바르지 않은 여행 스타일입니다: ${invalidStyles.join(', ')}`,
      })
    }
  }

  if (!schedule) {
    errors.push({
      field: 'schedule',
      message: '일정 스타일 정보가 누락되었습니다.',
    })
  } else if (!['relaxed', 'packed'].includes(schedule)) {
    errors.push({
      field: 'schedule',
      message: '일정 스타일은 relaxed 또는 packed여야 합니다.',
    })
  }

  return errors
}

export default function CustomizedScheduleResultPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const [recommendations, setRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [attractionNames, setAttractionNames] = useState([])
  const [getCustomRecommendations] = useGetCustomTravelRecommendationsMutation()
  const [createTravelPlan] = useCreateTravelPlanMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [loadingStep, setLoadingStep] = useState(1)
  const [loadingStepLabel, setLoadingStepLabel] = useState(
    '여행 정보를 분석하고 있습니다...',
  )
  const [isCancelled, setIsCancelled] = useState(false)

  const region = searchParams.get('region')
  const period = searchParams.get('period')
  const days = searchParams.get('days')
  const who = searchParams.get('who')
  const styles = searchParams.get('styles')
  const schedule = searchParams.get('schedule')

  const { regionName: displayedRegionName, regionCode } = useSelector(
    (state) => state.customizedSchedule,
  )

  // URL에서 region 정보를 사용하여 임시로 설정 (메모이제이션 적용)
  const finalRegionCode = useMemo(
    () => regionCode || region,
    [regionCode, region],
  )
  const finalRegionName = useMemo(
    () => displayedRegionName || '서울',
    [displayedRegionName],
  )

  // URL 파라미터 검증 결과 메모이제이션
  const urlParams = useMemo(
    () => ({ region, period, days, who, styles, schedule }),
    [region, period, days, who, styles, schedule],
  )

  // 동행자 정보 찾기 메모이제이션
  const companionInfo = useMemo(() => {
    return companions.find((c) => c.id === who)
  }, [who])

  // 여행 스타일 처리 메모이제이션
  const selectedStyles = useMemo(() => {
    if (!styles) return []
    return styles
      .split(',')
      .map((styleId) => travelStyles.find((s) => s.id === styleId))
      .filter(Boolean)
  }, [styles])

  // URL 파라미터 검증
  useEffect(() => {
    const errors = validateUrlParams(urlParams)

    if (errors.length > 0) {
      setValidationErrors(errors)
      setIsLoading(false)
      return
    } else {
      setValidationErrors([])
    }
  }, [urlParams])

  useEffect(() => {
    if (!region) return

    let isCancelled = false

    // 관광지 이름 불러오기
    http
      .GET(`/attractions/by-region?region_code=${encodeURIComponent(region)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setAttractionNames(data)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setAttractionNames([])
        }
      })

    return () => {
      isCancelled = true
    }
  }, [region])

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      // 진행 중인 로딩 취소
      setIsCancelled(true)

      // 메모리 누수 방지를 위해 타이머 정리
      // (simulateLoadingSteps에서 사용되는 setTimeout들은 Promise 기반이므로 자동으로 정리됨)
    }
  }, [])

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
  }, [days, region, attractionNames, finalRegionName])

  // navigate 함수 메모이제이션
  const navigateCallback = useCallback((path) => navigate(path), [navigate])

  // 로딩 단계 시뮬레이션 함수
  const simulateLoadingSteps = useCallback(() => {
    return new Promise((resolve) => {
      const steps = [
        { step: 1, label: '여행 정보를 분석하고 있습니다...', duration: 1000 },
        { step: 2, label: '맞춤 장소를 검색하고 있습니다...', duration: 1500 },
        { step: 3, label: '최적 경로를 계산하고 있습니다...', duration: 1200 },
        { step: 4, label: '일정을 최종 조정하고 있습니다...', duration: 800 },
      ]

      let currentStep = 0
      const executeStep = () => {
        if (currentStep >= steps.length || isCancelled) {
          resolve()
          return
        }

        const step = steps[currentStep]
        setLoadingStep(step.step)
        setLoadingStepLabel(step.label)

        setTimeout(() => {
          currentStep++
          executeStep()
        }, step.duration)
      }

      executeStep()
    })
  }, [isCancelled])

  // 로딩 취소 함수
  const handleCancelLoading = () => {
    setIsCancelled(true)
    setIsLoading(false)
    navigateCallback('/customized-schedule/region')
  }

  // 추천 데이터 생성
  useEffect(() => {
    const generateRecommendations = async () => {
      if (!finalRegionCode || validationErrors.length > 0 || isCancelled) return

      setIsLoading(true)
      setLoadingStep(1)
      setLoadingStepLabel('여행 정보를 분석하고 있습니다...')
      setIsCancelled(false)

      try {
        // 로딩 단계 시뮬레이션과 API 호출을 병렬 처리
        const [apiResult] = await Promise.all([
          getCustomRecommendations({
            region_code: finalRegionCode,
            region_name: finalRegionName,
            period: period,
            days: parseInt(days),
            who: who,
            styles: styles?.split(',') || [],
            schedule: schedule,
          }).unwrap(),
          simulateLoadingSteps(), // 로딩 단계 시뮬레이션
        ])

        if (isCancelled) return // 취소된 경우 중단

        // API 응답 데이터 형식 변환
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
          itinerary: apiResult.days,
          weather_info: apiResult.weather_summary || {
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

        if (isCancelled) return // 취소된 경우 중단

        // 로딩 단계 시뮬레이션 실행 (API 실패 시에도)
        await simulateLoadingSteps()

        if (isCancelled) return // 시뮬레이션 후 다시 취소 확인

        const errorInfo = getErrorInfo(error)

        // 에러 타입에 따른 사용자 친화적 안내
        if (errorInfo.type === 'auth') {
          toast.error(errorInfo.title + '\n로그인 후 다시 시도해주세요.')
          navigateCallback('/login')
          return
        } else if (errorInfo.type === 'network') {
          toast.error(errorInfo.title + '\n인터넷 연결을 확인해주세요.')
        } else if (errorInfo.type === 'rate_limit') {
          toast.error(errorInfo.title + '\n잠시 후 다시 시도해주세요.')
        } else {
          toast.error('추천 생성에 실패했습니다. 모의 데이터를 표시합니다.')
        }

        // 일부 에러의 경우 mock 데이터라도 제공
        if (errorInfo.type !== 'auth' && errorInfo.type !== 'forbidden') {
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
    validationErrors.length,
    isCancelled,
    simulateLoadingSteps,
    navigateCallback,
  ])

  const handleBack = useCallback(() => {
    navigateCallback(
      `/recommend/schedule?region=${region}&period=${period}&days=${days}&who=${who}&styles=${styles}`,
    )
  }, [navigateCallback, region, period, days, who, styles])

  const handleSavePlans = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요한 기능입니다.')
      // 현재 URL을 저장하고 로그인 페이지로 이동
      const currentUrl = window.location.pathname + window.location.search
      navigateCallback(`/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }
    setIsModalOpen(true)
  }, [isAuthenticated, navigateCallback])

  const handleModalSave = useCallback(
    async (formData) => {
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
            image: place.image,
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
          plan_type: 'custom', // 맞춤 일정 표시
        }

        // API 호출하여 여행 플랜 저장
        console.log('저장할 플랜 데이터:', planData) // 디버깅용
        const result = await createTravelPlan(planData).unwrap()
        console.log('저장 결과:', result) // 디버깅용

        // Redux 상태 초기화
        dispatch(clearRegion())

        // localStorage 초기화
        localStorage.removeItem('customizedSchedule')

        toast.success('여행 계획이 저장되었습니다!')

        // 내 여행 플랜 페이지로 이동
        navigateCallback('/travel-plans')
      } catch (error) {
        console.error('저장 중 오류:', error)

        // 상세한 에러 메시지 제공
        if (error?.data?.error?.code === 'UNAUTHORIZED') {
          toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.')
          navigateCallback('/login')
        } else if (error?.data?.error?.message) {
          toast.error(`저장 실패: ${error.data.error.message}`)
        } else {
          toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
      } finally {
        setIsSaving(false)
        setIsModalOpen(false)
      }
    },
    [recommendations, createTravelPlan, dispatch, navigateCallback],
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <LoadingProgress
          step={loadingStep}
          totalSteps={4}
          currentStepLabel={loadingStepLabel}
          estimatedTime={20} // 총 예상 시간 (초)
          onCancel={handleCancelLoading}
        />
      </div>
    )
  }

  // 검증 오류가 있는 경우
  if (validationErrors.length > 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            ⚠️ 잘못된 요청 정보
          </h2>
          <p className="mb-6 text-gray-600">
            요청하신 정보에 문제가 있습니다. 아래 내용을 확인해주세요.
          </p>
        </div>

        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">발견된 문제점</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-red-500">•</span>
                  <span className="text-red-700">{error.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4 text-center">
          <p className="text-gray-600">
            맞춤 일정 만들기를 다시 시작하시거나, 추천 페이지로 이동해주세요.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => navigateCallback('/customized-schedule/region')}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              맞춤 일정 다시 만들기
            </Button>
            <Button
              onClick={() => navigateCallback('/recommend')}
              variant="outline"
            >
              추천 페이지로 이동
            </Button>
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
                <span>{companionInfo?.icon}</span>
                <p className="font-semibold dark:text-white">
                  {companionInfo?.label || recommendations.summary.who}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
              <Heart className="mx-auto mb-1 h-5 w-5 text-orange-600 dark:text-orange-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                선호 스타일
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedStyles.map((style, index) => (
                  <Badge
                    key={style?.id || index}
                    variant="outline"
                    className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300"
                  >
                    <span>{style?.icon}</span>
                    {style?.label}
                  </Badge>
                ))}
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

        {recommendations.itinerary && recommendations.itinerary.length > 0 ? (
          recommendations.itinerary.map((dayPlan) => (
            <ItineraryDayCard key={dayPlan.day} dayPlan={dayPlan} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            일정 데이터가 없습니다.
          </div>
        )}
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
      <div className="flex justify-center">
        <Button
          onClick={handleSavePlans}
          className="bg-blue-600 text-white hover:bg-blue-700"
          size="lg"
        >
          여행 플랜으로 저장하기
        </Button>
      </div>

      {/* 저장 모달 */}
      <Suspense fallback={<div>모달 로딩 중...</div>}>
        <SaveTravelPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          recommendedPlan={recommendations}
          isLoading={isSaving}
        />
      </Suspense>
    </div>
  )
}
