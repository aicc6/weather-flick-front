import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { generateTravelCourse } from '@/services/tmapCourseService'
import { checkTmapApiStatus } from '@/services/tmapService'

/**
 * Tmap 기반 여행 코스 생성 상태 모니터링 컴포넌트 (개발/관리자용)
 */
export default function TmapCourseStatus() {
  const [status, setStatus] = useState({
    apiAvailable: false,
    isGenerating: false,
    generatedCourses: [],
    lastGenerated: null,
    error: null,
    progress: 0,
  })

  const testRegions = ['세종', '충주', '태백', '속초', '통영'] // 테스트용 지역들

  const checkApiAvailability = async () => {
    try {
      const isAvailable = await checkTmapApiStatus()
      setStatus((prev) => ({ ...prev, apiAvailable: isAvailable }))
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        apiAvailable: false,
        error: error.message,
      }))
    }
  }

  const generateTestCourse = async (regionName) => {
    setStatus((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
      progress: 0,
    }))

    try {
      setStatus((prev) => ({ ...prev, progress: 30 }))

      const course = await generateTravelCourse(regionName, {
        theme: 'all',
        duration: '2박 3일',
      })

      setStatus((prev) => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        generatedCourses: [course],
        lastGenerated: new Date(),
      }))

      if (import.meta.env.DEV) {
        console.log('테스트 코스 생성 완료:', course)
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isGenerating: false,
        progress: 0,
        error: error.message,
      }))
    }
  }

  const generateMultipleTestCourses = async () => {
    setStatus((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
      progress: 0,
    }))

    try {
      const totalRegions = testRegions.length
      let completedCount = 0

      const courses = []

      for (const region of testRegions) {
        try {
          setStatus((prev) => ({
            ...prev,
            progress: (completedCount / totalRegions) * 100,
          }))

          const course = await generateTravelCourse(region, { theme: 'all' })
          if (course) {
            courses.push(course)
          }

          completedCount++
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(`${region} 코스 생성 실패:`, error)
          }
          completedCount++
        }
      }

      setStatus((prev) => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        generatedCourses: courses,
        lastGenerated: new Date(),
      }))
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isGenerating: false,
        progress: 0,
        error: error.message,
      }))
    }
  }

  useEffect(() => {
    checkApiAvailability()
  }, [])

  const formatTime = (date) => {
    if (!date) return 'N/A'
    return date.toLocaleTimeString('ko-KR')
  }

  if (!import.meta.env.DEV) {
    return null // 개발 환경에서만 표시
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Tmap 여행 코스 생성 상태
          <Badge variant={status.apiAvailable ? 'default' : 'destructive'}>
            {status.apiAvailable ? 'API 사용 가능' : 'API 사용 불가'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API 상태 정보 */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Tmap API:</span>
            <div className="text-muted-foreground">
              {import.meta.env.VITE_TMAP_APP_KEY ? '설정됨' : '미설정'}
            </div>
          </div>
          <div>
            <span className="font-medium">생성된 코스:</span>
            <div className="text-muted-foreground">
              {status.generatedCourses.length}개
            </div>
          </div>
          <div>
            <span className="font-medium">마지막 생성:</span>
            <div className="text-muted-foreground">
              {formatTime(status.lastGenerated)}
            </div>
          </div>
        </div>

        {/* 진행률 표시 */}
        {status.isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>코스 생성 중...</span>
              <span>{Math.round(status.progress)}%</span>
            </div>
            <Progress value={status.progress} className="w-full" />
          </div>
        )}

        {/* 에러 메시지 */}
        {status.error && (
          <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
            <p className="text-destructive text-sm">오류: {status.error}</p>
          </div>
        )}

        {/* 생성된 코스 목록 */}
        {status.generatedCourses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">생성된 코스:</h4>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {status.generatedCourses.map((course, index) => (
                <div key={index} className="bg-muted rounded p-2 text-sm">
                  <div className="font-medium">{course.title}</div>
                  <div className="text-muted-foreground">
                    {course.region} • {course.duration} •{' '}
                    {course.itinerary?.length || 0}일 일정
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    POI:{' '}
                    {course.itinerary?.reduce(
                      (sum, day) => sum + (day.places?.length || 0),
                      0,
                    ) || 0}
                    개 | 평점: {course.rating} | 테마:{' '}
                    {course.theme?.join(', ') || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 테스트 버튼들 */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => generateTestCourse('세종')}
              disabled={status.isGenerating || !status.apiAvailable}
              size="sm"
              variant="outline"
            >
              단일 코스 테스트
            </Button>
            <Button
              onClick={generateMultipleTestCourses}
              disabled={status.isGenerating || !status.apiAvailable}
              size="sm"
              variant="outline"
            >
              다중 코스 테스트
            </Button>
          </div>

          <Button
            onClick={checkApiAvailability}
            disabled={status.isGenerating}
            className="w-full"
            size="sm"
          >
            API 상태 재확인
          </Button>
        </div>

        {/* 안내 정보 */}
        <div className="text-muted-foreground space-y-1 text-xs">
          <p>• API 사용 가능 시: 실제 관광지 POI 기반 코스 생성</p>
          <p>• API 사용 불가 시: fallback 데이터로 기본 코스 생성</p>
          <p>• 생성된 코스는 기존 API 응답에 자동으로 포함됩니다</p>
          <p>• 테스트 지역: {testRegions.join(', ')}</p>
        </div>

        {/* 성능 정보 */}
        {status.generatedCourses.length > 0 && (
          <div className="bg-primary/5 border-primary/20 rounded-md border p-3">
            <h5 className="mb-2 text-sm font-medium">생성 통계</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                평균 POI 수:{' '}
                {Math.round(
                  status.generatedCourses.reduce(
                    (sum, course) =>
                      sum +
                      (course.itinerary?.reduce(
                        (daySum, day) => daySum + (day.places?.length || 0),
                        0,
                      ) || 0),
                    0,
                  ) / status.generatedCourses.length,
                ) || 0}
                개
              </div>
              <div>
                평균 평점:{' '}
                {(
                  status.generatedCourses.reduce(
                    (sum, course) => sum + (course.rating || 0),
                    0,
                  ) / status.generatedCourses.length
                ).toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
