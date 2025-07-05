import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextRTK'

export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    // 로딩 중일 때는 스피너나 로딩 화면을 보여줄 수 있습니다
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
