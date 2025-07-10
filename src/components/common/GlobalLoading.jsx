import { Card, CardContent } from '@/components/ui/card'

const GlobalLoading = ({
  message = '데이터를 불러오는 중...',
  fullScreen = true,
}) => {
  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* 날씨 테마 로딩 애니메이션 */}
      <div className="relative">
        {/* 구름 */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-200 opacity-60"></div>
          <div className="absolute inset-1 animate-pulse rounded-full bg-blue-300 opacity-70 delay-75"></div>
          <div className="absolute inset-2 animate-pulse rounded-full bg-blue-400 opacity-80 delay-150"></div>
        </div>

        {/* 회전하는 날씨 아이콘 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <div className="animate-spin text-2xl">🌤️</div>
        </div>
      </div>

      {/* 메시지 */}
      <div className="space-y-2 text-center">
        <h3 className="font-semibold text-gray-800">{message}</h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 delay-75"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 delay-150"></div>
        </div>
        <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <LoadingContent />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <LoadingContent />
    </div>
  )
}

// 페이지 로딩용 컴포넌트
export const PageLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <GlobalLoading message="페이지를 로드하는 중..." fullScreen={false} />
  </div>
)

// 섹션 로딩용 컴포넌트
export const SectionLoading = ({ message }) => (
  <div className="flex items-center justify-center py-12">
    <div className="space-y-4 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">{message || '로딩 중...'}</p>
    </div>
  </div>
)

// 버튼 로딩용 컴포넌트
export const ButtonLoading = () => (
  <div className="flex items-center space-x-2">
    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
    <span>처리 중...</span>
  </div>
)

export default GlobalLoading
