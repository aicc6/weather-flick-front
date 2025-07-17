import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, X } from 'lucide-react'

export default function PWAUpdatePrompt() {
  const [isVisible, setIsVisible] = useState(false)
  
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker 등록됨:', r)
    },
    onRegisterError(error) {
      console.error('Service Worker 등록 실패:', error)
    },
    onOfflineReady() {
      console.log('앱이 오프라인에서 사용 가능합니다')
      setIsVisible(true)
    },
    onNeedRefresh() {
      console.log('새 업데이트가 있습니다')
      setIsVisible(true)
    },
  })

  const handleUpdate = async () => {
    setIsVisible(false)
    await updateServiceWorker(true)
  }

  const handleClose = () => {
    setIsVisible(false)
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  useEffect(() => {
    if (offlineReady || needRefresh) {
      setIsVisible(true)
    }
  }, [offlineReady, needRefresh])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {needRefresh ? '새 업데이트 사용 가능' : '오프라인 준비 완료'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            {needRefresh 
              ? 'Weather Flick의 새 버전이 사용 가능합니다. 업데이트하시겠습니까?'
              : 'Weather Flick을 이제 오프라인에서도 사용할 수 있습니다!'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            {needRefresh && (
              <Button 
                onClick={handleUpdate} 
                size="sm" 
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                업데이트
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleClose} 
              size="sm"
              className={needRefresh ? "flex-1" : "w-full"}
            >
              {needRefresh ? '나중에' : '확인'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}