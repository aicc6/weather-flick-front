// 로그인 상태 확인 유틸리티
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token')
  const userId = localStorage.getItem('user_id')
  return !!(token && userId)
}

// 토큰 유효성 확인 (선택적)
export const isTokenValid = () => {
  const token = localStorage.getItem('access_token')
  if (!token) return false

  try {
    // JWT 토큰의 페이로드 추출 (간단한 검증)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp

    // 만료 시간 확인
    if (exp) {
      const currentTime = Math.floor(Date.now() / 1000)
      return currentTime < exp
    }

    return true
  } catch (error) {
    console.error('토큰 검증 오류:', error)
    return false
  }
}
