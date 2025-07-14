import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function PWAInstallPrompt() {
  const { canInstall, isInstalled, installPWA } = usePWAInstall()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 로컬스토리지에서 프롬프트 닫기 상태 확인
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    // 3초 후에 프롬프트 표시
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled && !dismissed) {
        setShowPrompt(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    const result = await installPWA()
    if (result.outcome === 'accepted') {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || isInstalled || !canInstall || isDismissed) {
    return null
  }

  return (
    <div className="animate-in slide-in-from-bottom-5 fixed right-4 bottom-4 left-4 z-50 md:right-8 md:bottom-8 md:left-auto md:max-w-sm">
      <div className="ring-opacity-5 relative rounded-lg bg-white p-4 shadow-lg ring-1 ring-black">
        <Button
          onClick={handleDismiss}
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="pr-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Weather Flick 앱 설치
            </h3>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            홈 화면에 추가하여 더 빠르고 편리하게 이용하세요. 오프라인에서도
            일부 기능을 사용할 수 있습니다.
          </p>

          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              설치하기
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              나중에
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
