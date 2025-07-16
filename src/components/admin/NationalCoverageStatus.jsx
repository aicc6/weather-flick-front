import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { getAllRegionsFlat, PROVINCES } from '@/data/koreaRegions'
import {
  checkRegionSupport,
  generateRegionCourse,
  getGenerationStats,
  clearExpiredCache,
  clearAllCache,
} from '@/services/dynamicRegionService'

/**
 * 전국 244개 지역 커버리지 상태 모니터링 컴포넌트
 */
export default function NationalCoverageStatus() {
  const [stats, setStats] = useState({
    totalSupportedRegions: 0,
    cachedCourses: 0,
    cacheHitRate: '0%',
    cacheStatus: 'empty',
  })

  const [testResults, setTestResults] = useState([])
  const [testRegion, setTestRegion] = useState('')
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [testProgress, setTestProgress] = useState(0)

  // 통계 업데이트
  const updateStats = () => {
    const newStats = getGenerationStats()
    setStats(newStats)
  }

  useEffect(() => {
    updateStats()
    // 30초마다 통계 업데이트
    const interval = setInterval(updateStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // 특정 지역 테스트
  const testSpecificRegion = async () => {
    if (!testRegion.trim()) return

    try {
      const startTime = performance.now()

      // 지역 지원 여부 확인
      const supportInfo = checkRegionSupport(testRegion)

      if (!supportInfo.isSupported) {
        setTestResults((prev) => [
          {
            region: testRegion,
            status: 'unsupported',
            message: '지원하지 않는 지역입니다',
            suggestions: supportInfo.suggestions,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 9),
        ])
        return
      }

      // 코스 생성 테스트
      const result = await generateRegionCourse(testRegion)
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      if (result.success) {
        setTestResults((prev) => [
          {
            region: testRegion,
            status: 'success',
            course: result.course,
            fromCache: result.fromCache,
            exact: result.regionInfo?.exact,
            apiUsed: result.apiUsed,
            duration: `${duration}ms`,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 9),
        ])
      } else {
        setTestResults((prev) => [
          {
            region: testRegion,
            status: 'failed',
            error: result.error,
            message: result.message,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 9),
        ])
      }

      updateStats()
    } catch (error) {
      setTestResults((prev) => [
        {
          region: testRegion,
          status: 'error',
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9),
      ])
    }
  }

  // 전국 랜덤 지역 테스트
  const testRandomRegions = async () => {
    setIsTestingAll(true)
    setTestProgress(0)

    try {
      const allRegions = getAllRegionsFlat().filter((r) => r.type === 'city')
      const testCount = 10 // 랜덤 10개 지역 테스트
      const randomRegions = [...allRegions]
        .sort(() => Math.random() - 0.5)
        .slice(0, testCount)

      const newResults = []

      for (let i = 0; i < randomRegions.length; i++) {
        const region = randomRegions[i]
        setTestProgress(((i + 1) / testCount) * 100)

        try {
          const startTime = performance.now()
          const result = await generateRegionCourse(region.code)
          const endTime = performance.now()
          const duration = Math.round(endTime - startTime)

          newResults.push({
            region: region.name,
            status: result.success ? 'success' : 'failed',
            course: result.course,
            fromCache: result.fromCache,
            exact: result.regionInfo?.exact,
            apiUsed: result.apiUsed,
            duration: `${duration}ms`,
            timestamp: new Date().toLocaleTimeString(),
          })
        } catch (error) {
          newResults.push({
            region: region.name,
            status: 'error',
            error: error.message,
            timestamp: new Date().toLocaleTimeString(),
          })
        }

        // 너무 빠른 요청 방지
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setTestResults((prev) => [...newResults, ...prev.slice(0, 10)])
      updateStats()
    } finally {
      setIsTestingAll(false)
      setTestProgress(0)
    }
  }

  if (!import.meta.env.DEV) {
    return null
  }

  const successRate =
    testResults.length > 0
      ? Math.round(
          (testResults.filter((r) => r.status === 'success').length /
            testResults.length) *
            100,
        )
      : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          전국 지역 커버리지 상태
          <Badge variant="outline">244개 지역 지원</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="test">테스트</TabsTrigger>
            <TabsTrigger value="regions">지역 목록</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">지원 지역</div>
                <div className="text-2xl font-bold">
                  {stats.totalSupportedRegions}개
                </div>
                <div className="text-muted-foreground text-xs">
                  17개 광역시도 + 227개 시군구
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">캐시 현황</div>
                <div className="text-2xl font-bold">
                  {stats.cachedCourses}개
                </div>
                <div className="text-muted-foreground text-xs">
                  적중률: {stats.cacheHitRate}
                </div>
              </div>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">최근 테스트 성공률</div>
                <div className="flex items-center space-x-2">
                  <Progress value={successRate} className="flex-1" />
                  <span className="text-sm font-medium">{successRate}%</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => clearExpiredCache()}
                variant="outline"
                size="sm"
              >
                만료 캐시 정리
              </Button>
              <Button
                onClick={() => clearAllCache()}
                variant="outline"
                size="sm"
              >
                전체 캐시 초기화
              </Button>
            </div>
          </TabsContent>

          {/* 테스트 탭 */}
          <TabsContent value="test" className="space-y-4">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="지역명 입력 (예: 세종, 충주, 태백)"
                  value={testRegion}
                  onChange={(e) => setTestRegion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && testSpecificRegion()}
                />
                <Button
                  onClick={testSpecificRegion}
                  disabled={!testRegion.trim()}
                >
                  테스트
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={testRandomRegions}
                  disabled={isTestingAll}
                  className="flex-1"
                >
                  {isTestingAll ? '테스트 중...' : '랜덤 10개 지역 테스트'}
                </Button>
              </div>

              {isTestingAll && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>진행률</span>
                    <span>{Math.round(testProgress)}%</span>
                  </div>
                  <Progress value={testProgress} />
                </div>
              )}

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">테스트 결과</div>
                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="rounded-lg border p-3 text-sm"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-medium">{result.region}</span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                result.status === 'success'
                                  ? 'default'
                                  : result.status === 'failed'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {result.status}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {result.timestamp}
                            </span>
                          </div>
                        </div>

                        {result.status === 'success' && result.course && (
                          <div className="text-muted-foreground space-y-1 text-xs">
                            <div>제목: {result.course.title}</div>
                            <div className="flex space-x-4">
                              <span>소요: {result.duration}</span>
                              <span>
                                캐시: {result.fromCache ? 'HIT' : 'MISS'}
                              </span>
                              <span>
                                정확도: {result.exact ? '정확' : '유사'}
                              </span>
                              <span>
                                API: {result.apiUsed ? '사용' : '미사용'}
                              </span>
                            </div>
                          </div>
                        )}

                        {result.status !== 'success' && (
                          <div className="text-muted-foreground text-xs">
                            {result.message || result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 지역 목록 탭 */}
          <TabsContent value="regions" className="space-y-4">
            <div className="space-y-4">
              {PROVINCES.map((province) => (
                <div key={province.code} className="space-y-2">
                  <div className="font-medium">{province.name}</div>
                  <div className="text-muted-foreground text-sm">
                    광역시도 레벨 지원 + 하위 시군구 모두 지원
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
