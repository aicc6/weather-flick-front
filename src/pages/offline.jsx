import { WifiOff, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function OfflinePage() {
  const navigate = useNavigate()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-gray-200 p-8">
            <WifiOff className="h-16 w-16 text-gray-600" />
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          오프라인 상태입니다
        </h1>

        <p className="mb-8 text-lg text-gray-600">
          인터넷 연결이 끊어진 것 같습니다.
          <br />
          연결을 확인하고 다시 시도해주세요.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleRefresh}
            size="lg"
            className="w-full"
            variant="default"
          >
            <RefreshCcw className="mr-2 h-5 w-5" />
            새로고침
          </Button>

          <Button
            onClick={handleGoHome}
            size="lg"
            className="w-full"
            variant="outline"
          >
            <Home className="mr-2 h-5 w-5" />
            홈으로 이동
          </Button>
        </div>

        <div className="mt-12 rounded-lg bg-blue-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-blue-900">
            Weather Flick 오프라인 기능
          </h2>
          <p className="text-sm text-blue-800">
            이전에 저장한 여행 계획은 오프라인에서도 확인 가능합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
