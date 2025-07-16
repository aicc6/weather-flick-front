import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextRTK'
import LoadingSpinner from '@/components/LoadingSpinner'

/**
 * 보호된 라우트 컴포넌트
 * 로그인이 필요한 페이지에 접근할 때 인증 상태를 확인하고
 * 미인증 사용자는 로그인 페이지로 리다이렉트합니다.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // 로딩 중일 때는 로딩 스피너 표시
  if (loading) {
    return <LoadingSpinner />
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  // 현재 경로를 state로 전달하여 로그인 후 원래 페이지로 돌아갈 수 있도록 함
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 인증된 사용자는 자식 컴포넌트 렌더링
  return children
}

export default ProtectedRoute
