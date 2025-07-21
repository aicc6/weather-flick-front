import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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
import { useAuth } from '@/contexts/AuthContextRTK'
import { GoogleIcon } from '@/components/icons'
import { loginSchema } from '@/schemas'
import { useGetGoogleAuthUrlQuery } from '@/store/api'

/**
 * URL: '/login'
 */
export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  // RTK Query 훅들
  const { data: googleAuthData } = useGetGoogleAuthUrlQuery()

  // 리다이렉트된 페이지 정보 가져오기
  const from = location.state?.from?.pathname || '/'

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setSubmitError('')

    try {
      // AuthContext를 통한 로그인
      const credentials = {
        email: data.email,
        password: data.password,
      }

      await login(credentials)

      // 로그인 성공 시 즉시 리다이렉트 (useEffect가 처리하므로 따로 navigate 불필요)
    } catch (error) {
      console.error('Login error:', error)

      // RTK Query 에러 처리
      if (error?.data?.detail) {
        const errorMessage = error.data.detail
        if (errorMessage.includes('Incorrect email or password')) {
          setSubmitError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else {
          setSubmitError(errorMessage)
        }
      } else if (error?.status === 401) {
        setSubmitError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else if (error?.message) {
        setSubmitError(error.message)
      } else {
        setSubmitError(
          '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      if (googleAuthData?.auth_url) {
        window.location.href = googleAuthData.auth_url
      } else {
        setSubmitError('구글 로그인 URL을 가져오는데 실패했습니다.')
      }
    } catch {
      setSubmitError('구글 로그인 URL을 가져오는데 실패했습니다.')
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            Weather Flick에 다시 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                {...register('email')}
                className={`login-form-field ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'focus:border-blue-500 focus:ring-blue-200'}`}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호를 입력해주세요"
                {...register('password')}
                className={`login-form-field ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'focus:border-blue-500 focus:ring-blue-200'}`}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[16px] min-h-[16px]"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  로그인 상태 유지
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="login-link text-sm text-blue-600 hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
              >
                비밀번호 찾기
              </Link>
            </div>

            <Button
              type="submit"
              className="login-button w-full py-3 px-4 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? '로그인 중...' : '로그인'}
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
            className="login-button w-full py-3 px-4"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            size="lg"
          >
            <GoogleIcon />
            Google 계정으로 계속하기
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link 
                to="/sign-up" 
                className="login-link text-blue-600 hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
              >
                회원가입하기
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
