import { useState } from 'react'
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
import { useAuth } from '@/contexts/AuthContext'
import { GoogleIcon } from '@/components/icons'
import { loginSchema } from '@/schemas'
import { useGoogleLogin } from '@react-oauth/google'

/**
 * URL: '/login'
 */
export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, googleLogin } = useAuth()

  // 리다이렉트된 페이지 정보 가져오기
  const from = location.state?.from?.pathname || '/'

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
        username: data.email, // FastAPI OAuth2PasswordRequestForm은 username 필드를 사용
        password: data.password,
      }

      await login(credentials)

      // 로그인 성공 후 상태 업데이트를 위해 약간의 지연 후 페이지 이동
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 100)
    } catch (error) {
      console.error('로그인 오류:', error)

      // 백엔드에서 오는 에러 메시지 처리
      if (error.response?.data?.detail) {
        const errorMessage = error.response.data.detail

        if (errorMessage.includes('Incorrect email or password')) {
          setSubmitError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else {
          setSubmitError(errorMessage)
        }
      } else {
        setSubmitError(
          '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (accessToken) => {
    try {
      await googleLogin(accessToken)
      // 메인 페이지 등으로 이동
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 100)
    } catch (err) {
      setSubmitError(err.response?.data?.detail || '구글 로그인 실패')
    }
  }

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // console.log('성공', tokenResponse)
      if (tokenResponse.access_token) {
        await handleGoogleLogin(tokenResponse.access_token)
      }
    },
    onError: (_error) => {
      setSubmitError('구글 로그인 중 오류가 발생했습니다.')
    },
  })

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            Weather Flick에 다시 오신 것을 환영합니다
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
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력해주세요"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  로그인 상태 유지
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
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
              계정이 없으신가요?{' '}
              <Link to="/sign-up" className="text-blue-600 hover:underline">
                회원가입하기
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
