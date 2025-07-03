import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI, tokenManager } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

export function GoogleCallbackPage() {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [error, setError] = useState('')
  const isProcessing = useRef(false) // 중복 요청 방지
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser, setIsAuthenticated } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      // 중복 요청 방지
      if (isProcessing.current) {
        console.log('이미 처리 중입니다. 중복 요청을 무시합니다.')
        return
      }
      
      isProcessing.current = true
      
      try {
        // URL 파라미터 확인
        const authCode = searchParams.get('auth_code') // 새로운 보안 방식
        const token = searchParams.get('token') // 기존 방식 (호환성)
        const userId = searchParams.get('user_id') // 기존 방식 (호환성)
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setError(
            error === 'oauth_failed'
              ? '구글 로그인 처리 중 오류가 발생했습니다.'
              : '구글 로그인이 취소되었습니다.',
          )
          return
        }

        if (authCode) {
          // 새로운 보안 방식: 임시 인증 코드를 JWT 토큰으로 교환
          console.log(
            '인증 코드로 토큰 교환 시작:',
            authCode.substring(0, 10) + '...',
          )

          try {
            const response = await authAPI.exchangeGoogleAuthCode(authCode)
            console.log('토큰 교환 성공:', response)

            // 토큰 저장
            tokenManager.setToken(response.access_token, response.user_info)
            setUser(response.user_info)
            setIsAuthenticated(true)

            setStatus('success')

            // 성공 후 메인 페이지로 이동
            setTimeout(() => {
              navigate('/', { replace: true })
            }, 1500)
          } catch (exchangeError) {
            console.error('토큰 교환 오류 상세:', exchangeError)
            console.error('오류 응답:', exchangeError.response?.data)
            console.error('오류 상태:', exchangeError.response?.status)
            setStatus('error')
            setError(
              exchangeError.response?.data?.detail ||
                exchangeError.data?.detail ||
                '인증 처리 중 오류가 발생했습니다.',
            )
          }
        } else if (token) {
          // 기존 방식: URL에서 직접 토큰 추출 (호환성을 위해 유지)
          console.warn(
            '기존 방식의 토큰 전달을 사용하고 있습니다. 보안을 위해 새로운 방식 사용을 권장합니다.',
          )

          tokenManager.setToken(token, null)

          // 사용자 정보 조회
          try {
            const userInfo = await authAPI.getMe()
            tokenManager.setToken(token, userInfo)
            setUser(userInfo)
            setIsAuthenticated(true)
          } catch (userError) {
            setIsAuthenticated(true)
          }

          setStatus('success')

          setTimeout(() => {
            navigate('/', { replace: true })
          }, 1500)
        } else {
          // 레거시: code, state 파라미터 처리 (완전 호환성)
          const code = searchParams.get('code')
          const state = searchParams.get('state')

          if (!code) {
            setStatus('error')
            setError('인증 정보가 없습니다.')
            return
          }

          console.warn('레거시 OAuth 콜백 방식을 사용하고 있습니다.')

          // 백엔드에 인증 코드 전송
          const response = await authAPI.googleCallback(code, state)

          if (response.redirect_url) {
            const url = new URL(response.redirect_url, window.location.origin)
            const token = url.searchParams.get('token')

            if (token) {
              tokenManager.setToken(token, null)

              try {
                const userInfo = await authAPI.getMe()
                tokenManager.setToken(token, userInfo)
                setUser(userInfo)
                setIsAuthenticated(true)
              } catch (userError) {
                setIsAuthenticated(true)
              }

              setStatus('success')

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
        }
      } catch (err) {
        console.error('구글 콜백 처리 오류:', err)
        setStatus('error')
        setError(err.data?.detail || '로그인 처리 중 오류가 발생했습니다.')
      } finally {
        isProcessing.current = false
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
