import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextRTK'
import { useExchangeGoogleAuthCodeMutation } from '@/store/api'

export function GoogleCallbackPage() {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [error, setError] = useState('')
  const isProcessing = useRef(false) // 중복 요청 방지
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleGoogleAuthSuccess } = useAuth()

  // RTK Query hook
  const [exchangeGoogleAuthCode] = useExchangeGoogleAuthCodeMutation()

  useEffect(() => {
    const handleCallback = async () => {
      // 중복 요청 방지
      if (isProcessing.current) {
        return
      }

      isProcessing.current = true

      try {
        // URL 파라미터 확인
        const authCode = searchParams.get('auth_code')
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
          // 임시 인증 코드를 JWT 토큰으로 교환
          try {
            const response = await exchangeGoogleAuthCode(authCode).unwrap()
            console.log('Exchange response:', response)

            // AuthContext의 Google 인증 성공 처리 함수 사용
            try {
              handleGoogleAuthSuccess(response.user_info, response.access_token)
            } catch (authError) {
              console.warn('Auth context update error:', authError)
              // 토큰은 이미 저장되었으므로 계속 진행
            }

            setStatus('success')

            // 성공 후 메인 페이지로 이동
            setTimeout(() => {
              navigate('/', { replace: true })
            }, 1500)
          } catch (exchangeError) {
            console.error('Exchange error:', exchangeError)
            // RTK Query의 에러 구조 확인
            const errorMessage = exchangeError?.data?.detail || 
                               exchangeError?.error?.data?.detail || 
                               exchangeError?.message || 
                               '인증 처리 중 오류가 발생했습니다.'
            
            setStatus('error')
            setError(errorMessage)
          }
        } else {
          // authCode가 없는 경우 오류 처리
          setStatus('error')
          setError('인증 정보가 없습니다.')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
        setError(err.data?.detail || err.message || '로그인 처리 중 오류가 발생했습니다.')
      } finally {
        isProcessing.current = false
      }
    }

    handleCallback()
  }, [searchParams, navigate, handleGoogleAuthSuccess, exchangeGoogleAuthCode])

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
            <p className="text-gray-600">메인 페이지로 이동하고 있습니다...</p>
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
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {renderContent()}
      </div>
    </div>
  )
}
