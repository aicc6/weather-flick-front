import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('pending') // pending | success | error
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('인증 토큰이 유효하지 않습니다.')
      return
    }
    // 이메일 인증 API 요청
    fetch('https://wf-api-dev.seongjunlee.dev/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success')
          setMessage('이메일 인증이 완료되었습니다! 이제 로그인할 수 있습니다.')
        } else {
          const data = await res.json()
          setStatus('error')
          setMessage(data.detail || '이메일 인증에 실패했습니다.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('네트워크 오류로 인증에 실패했습니다.')
      })
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">이메일 인증</CardTitle>
          <CardDescription>Weather Flick 이메일 인증 결과</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {status === 'pending' && (
            <p className="text-blue-600">인증 중입니다...</p>
          )}
          {status === 'success' && (
            <>
              <p className="font-semibold text-green-600">{message}</p>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate('/login')}
              >
                로그인하러 가기
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="font-semibold text-red-600">{message}</p>
              <Button className="mt-4 w-full" onClick={() => navigate('/')}>
                홈으로 가기
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
