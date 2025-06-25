import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useGoogleLogin } from '@react-oauth/google'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { GoogleIcon } from '@/components/icons'
import { signUpSchema } from '@/schemas'

/**
 * URL: /sign-up
 */
export function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationInput, setVerificationInput] = useState('')
  const [verificationMsg, setVerificationMsg] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const navigate = useNavigate()
  const { register: registerUser, googleLogin } = useAuth()
  const emailRef = useRef()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setSubmitError('')

    try {
      // AuthContext를 통한 회원가입
      const userData = {
        email: data.email,
        username: data.nickname,
        password: data.password,
      }

      await registerUser(userData)

      // 이메일 인증코드 발송
      try {
        const res = await fetch(
          'https://wf-api-dev.seongjunlee.dev/auth/send-verification',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email }),
          },
        )
        if (!res.ok) throw new Error('이메일 인증코드 발송에 실패했습니다.')
      } catch (e) {
        setSubmitError(
          '이메일 인증코드 발송에 실패했습니다. 이메일 주소를 확인해 주세요.',
        )
      }

      setIsSuccess(true)
      reset()

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      console.error('회원가입 오류:', error)
      let errorMessage = '회원가입 중 오류가 발생했습니다.'
      if (error.data?.detail) {
        errorMessage = error.data.detail
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      setSubmitError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // TODO: 백엔드로 access token 전송하여 사용자 정보 받고, 회원가입/로그인 처리
      // 예: const user = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      //   headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      // }).then(res => res.json());
      if (tokenResponse.access_token) {
        try {
          await googleLogin(tokenResponse.access_token)
          // 메인 페이지 등으로 이동
          navigate('/')
        } catch (err) {
          setSubmitError(err.response?.data?.detail || '구글 회원가입 실패')
        }
      }
    },
    onError: (error) => {
      setSubmitError('구글 회원가입 중 오류가 발생했습니다.')
    },
  })

  const sendVerificationCode = async () => {
    clearErrors('email')
    setVerificationMsg('')
    setVerificationSent(false)
    setIsEmailVerified(false)
    const email = emailRef.current.value
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setVerificationMsg('올바른 이메일 형식을 입력해주세요.')
      return
    }
    setIsSending(true)
    setVerificationMsg('인증번호 발송 중...')
    try {
      const res = await fetch(
        'https://wf-api-dev.seongjunlee.dev/auth/send-verification',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      )
      if (!res.ok) throw new Error('이메일 인증코드 발송에 실패했습니다.')
      setVerificationSent(true)
      setVerificationMsg('인증번호가 이메일로 발송되었습니다.')
    } catch (e) {
      setVerificationMsg(
        '이메일 인증코드 발송에 실패했습니다. 이메일 주소를 확인해 주세요.',
      )
    }
    setIsSending(false)
  }

  const verifyCode = async () => {
    setIsVerifying(true)
    setVerificationMsg('')
    try {
      const res = await fetch(
        'https://wf-api-dev.seongjunlee.dev/auth/verify-email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailRef.current.value,
            verification_code: verificationInput,
          }),
        },
      )
      if (!res.ok) {
        const data = await res.json()
        setVerificationMsg(
          data.detail || '인증에 실패했습니다. 인증번호를 확인해 주세요.',
        )
        setIsEmailVerified(false)
      } else {
        setVerificationMsg('이메일 인증이 완료되었습니다!')
        setIsEmailVerified(true)
      }
    } catch (e) {
      setVerificationMsg('인증에 실패했습니다. 네트워크 오류.')
      setIsEmailVerified(false)
    }
    setIsVerifying(false)
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">
              회원가입 완료!
            </CardTitle>
            <CardDescription>계정이 성공적으로 생성되었습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                이메일을 확인하여 계정을 활성화해주세요.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link to="/login">로그인하기</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">홈으로 돌아가기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            Weather Flick에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                {...register('nickname')}
                className={errors.nickname ? 'border-red-500' : ''}
              />
              {errors.nickname && (
                <p className="text-sm text-red-500">
                  {errors.nickname.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  ref={emailRef}
                  className={errors.email ? 'flex-1 border-red-500' : 'flex-1'}
                  disabled={isEmailVerified}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendVerificationCode}
                  disabled={isEmailVerified || isSending}
                >
                  {isSending ? '발송 중...' : '인증번호 발송'}
                </Button>
              </div>
              {verificationSent && (
                <div className="mt-2 flex gap-2">
                  <Input
                    type="text"
                    placeholder="인증번호 입력"
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={verifyCode}
                    disabled={isVerifying || isEmailVerified}
                  >
                    {isVerifying ? '인증 중...' : '인증하기'}
                  </Button>
                </div>
              )}
              {verificationMsg && (
                <p
                  className={`mt-1 text-sm ${isEmailVerified ? 'text-green-600' : 'text-red-500'}`}
                >
                  {verificationMsg}
                </p>
              )}
              {!verificationMsg && errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상, 대소문자, 숫자 포함"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !isEmailVerified}
            >
              {isLoading ? '가입 중...' : '회원가입하기'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                또는
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => googleLoginHandler()}
            disabled={isLoading}
          >
            <GoogleIcon />
            Google 계정으로 계속하기
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                로그인하기
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
