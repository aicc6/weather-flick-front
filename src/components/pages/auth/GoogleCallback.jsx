import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI, tokenManager } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

export function GoogleCallbackPage() {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser, setIsAuthenticated } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setError('구글 로그인이 취소되었습니다.')
          return
        }

        if (!code) {
          setStatus('error')
          setError('인증 코드가 없습니다.')
          return
        }

        // 백엔드에 인증 코드 전송
        const response = await authAPI.googleCallback(code, state)

        if (response.redirect_url) {
          // redirect_url에서 토큰과 사용자 ID 추출
          const url = new URL(response.redirect_url, window.location.origin)
          const token = url.searchParams.get('token')
          const userId = url.searchParams.get('user_id')

          if (token) {
            // 토큰 저장 (사용자 정보는 별도로 조회해야 할 수 있음)
            tokenManager.setToken(token, null)

            // 사용자 정보 조회
            try {
              const userInfo = await authAPI.getMe()
              tokenManager.setToken(token, userInfo)
              setUser(userInfo)
              setIsAuthenticated(true)
            } catch (userError) {
              // 사용자 정보 조회 실패 시에도 토큰은 저장된 상태로 진행
              setIsAuthenticated(true)
            }

            setStatus('success')

            // 성공 후 메인 페이지로 이동
            setTimeout(() => {
              navigate('/', { replace: true })
            }, 1500)
          } else {
            setStatus('error')
            setError('인증 토큰을 받지 못했습니다.')
          }
        } else {
          setStatus('error')
          setError('로그인 처리 중 오류가 발생했습니다.')
        }
      } catch (err) {
        console.error('구글 콜백 처리 오류:', err)
        setStatus('error')
        setError(err.data?.detail || '로그인 처리 중 오류가 발생했습니다.')
      }
    }

    handleCallback()
  }, [searchParams, navigate, setUser, setIsAuthenticated])

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <h2 className="mb-2 text-xl font-semibold">로그인 처리 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </div>
        )
      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-green-600">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-green-600">
              로그인 성공!
            </h2>
            <p className="text-gray-600">메인 페이지로 이동합니다...</p>
          </div>
        )
      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-red-600">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-red-600">
              로그인 실패
            </h2>
            <p className="mb-4 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        {renderContent()}
      </div>
    </div>
  )
}
