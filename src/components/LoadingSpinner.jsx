import { memo } from 'react'

/**
 * 페이지 로딩 스피너 컴포넌트
 */
const LoadingSpinner = memo(() => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-muted-foreground text-sm">페이지를 불러오는 중...</p>
      </div>
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner
