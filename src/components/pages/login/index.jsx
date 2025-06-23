import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useGoogleLogin } from '@react-oauth/google'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

// Google 아이콘 컴포넌트
const GoogleIcon = (props) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    className="mr-2 h-4 w-4"
  >
    <title>Google</title>
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.2-2.27h-11.3v4.51h6.47c-.28 1.48-1.1 2.75-2.4 3.58v2.96h3.8c2.21-2.04 3.48-5.11 3.48-8.78z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.8-2.96c-1.07.72-2.45 1.15-4.13 1.15-3.18 0-5.87-2.13-6.83-5.01H1.37v3.06C3.32 21.43 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.17 14.35c-.21-.63-.33-1.3-.33-2s.12-1.37.33-2V7.29H1.37A11.953 11.953 0 000 12c0 1.92.45 3.73 1.25 5.36l3.92-3.01z"
    />
    <path
      fill="#EA4335"
      d="M12 4.85c1.77 0 3.35.61 4.6 1.8l3.38-3.38C17.95 1.34 15.24 0 12 0 7.34 0 3.32 2.57 1.37 6.29l3.8 3.06c.96-2.88 3.65-5.01 6.83-5.01z"
    />
  </svg>
)

// 로그인 폼 스키마 정의
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
/**
 * URL: '/login'
 */
export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
      // TODO: 실제 API 호출로 교체
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // TODO: 로그인 성공 후 리다이렉트
      console.log('로그인 데이터:', data)
    } catch (error) {
      console.error('로그인 오류:', error)
      setSubmitError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google 로그인 성공:', tokenResponse)
      // TODO: 백엔드로 access token 전송하여 사용자 정보 받고, 로그인 처리
    },
    onError: (error) => {
      console.error('Google 로그인 오류:', error)
      setSubmitError('Google 로그인 중 오류가 발생했습니다.')
    },
  })

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card text-muted-foreground px-2">또는</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleGoogleLogin()}
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
