import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { checkTmapApiStatus } from '@/services/tmapService'

/**
 * Tmap API 상태 확인 컴포넌트 (개발/관리자용)
 */
export default function TmapApiStatus() {
  const [apiStatus, setApiStatus] = useState({
    isAvailable: false,
    isChecking: false,
    lastChecked: null,
    error: null,
  })

  const checkStatus = async () => {
    setApiStatus((prev) => ({ ...prev, isChecking: true, error: null }))

    try {
      const isAvailable = await checkTmapApiStatus()
      setApiStatus({
        isAvailable,
        isChecking: false,
        lastChecked: new Date(),
        error: null,
      })
    } catch (error) {
      setApiStatus((prev) => ({
        ...prev,
        isChecking: false,
        error: error.message,
      }))
    }
  }

  useEffect(() => {
    // 컴포넌트 마운트 시 자동 체크
    checkStatus()
  }, [])

  const formatTime = (date) => {
    if (!date) return 'N/A'
    return date.toLocaleTimeString('ko-KR')
  }

  if (!import.meta.env.DEV) {
    return null // 개발 환경에서만 표시
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Tmap API 상태
          <Badge variant={apiStatus.isAvailable ? 'default' : 'destructive'}>
            {apiStatus.isAvailable ? '사용 가능' : '사용 불가'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">API 키:</span>
            <div className="text-muted-foreground">
              {import.meta.env.VITE_TMAP_APP_KEY ? '설정됨' : '미설정'}
            </div>
          </div>
          <div>
            <span className="font-medium">마지막 확인:</span>
            <div className="text-muted-foreground">
              {formatTime(apiStatus.lastChecked)}
            </div>
          </div>
        </div>

        {apiStatus.error && (
          <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
            <p className="text-destructive text-sm">오류: {apiStatus.error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={checkStatus}
            disabled={apiStatus.isChecking}
            className="w-full"
            size="sm"
          >
            {apiStatus.isChecking ? '확인 중...' : '상태 재확인'}
          </Button>

          {!import.meta.env.VITE_TMAP_APP_KEY && (
            <div className="bg-warning/10 border-warning/20 rounded-md border p-3">
              <p className="text-warning-foreground text-sm">
                Tmap API 키가 설정되지 않았습니다.
                <code className="bg-muted mx-1 rounded p-1 text-xs">
                  VITE_TMAP_APP_KEY
                </code>
                환경변수를 설정하세요.
              </p>
            </div>
          )}
        </div>

        <div className="text-muted-foreground text-xs">
          <p>• API 사용 가능 시: 매핑되지 않은 지역에 Tmap 기반 이미지 제공</p>
          <p>• API 사용 불가 시: 정적 fallback 이미지 사용</p>
        </div>
      </CardContent>
    </Card>
  )
}
