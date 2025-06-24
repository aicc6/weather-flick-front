import { useState } from 'react'
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
import { authAPI } from '../../../services/api'
import { STORAGE_KEYS } from '@/data'

/**
 * URL: /sign-up
 */
export function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
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
        username: data.name,
        password: data.password,
      }

      await registerUser(userData)

      setIsSuccess(true)
      reset()

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      console.error('회원가입 오류:', error)
      console.error('오류 응답:', error.response)

      // 백엔드에서 오는 에러 메시지 처리
      if (error.response?.data?.detail) {
        const errorMessage = error.response.data.detail

        // 이메일 중복 에러
        if (errorMessage.includes('Email already registered')) {
          setSubmitError('이미 등록된 이메일입니다.')
        }
        // 사용자명 중복 에러
        else if (errorMessage.includes('Username already taken')) {
          setSubmitError('이미 사용 중인 사용자명입니다.')
        }
        // 비밀번호 강도 에러
        else if (errorMessage.includes('Password is too weak')) {
          setSubmitError(
            '비밀번호가 너무 약합니다. 대문자, 소문자, 숫자를 포함해주세요.',
          )
        } else {
          setSubmitError(errorMessage)
        }
      } else if (error.code === 'ERR_NETWORK') {
        setSubmitError(
          '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.',
        )
      } else if (error.response?.status === 422) {
        setSubmitError(
          '입력 데이터가 올바르지 않습니다. 모든 필드를 확인해주세요.',
        )
      } else {
        setSubmitError(`회원가입 중 오류가 발생했습니다: ${error.message}`)
      }
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
          const res = await authAPI.googleLogin(tokenResponse.access_token)

          localStorage.setItem(
            STORAGE_KEYS.USER_INFO,
            JSON.stringify(res.user_info),
          )
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
          // 인증 상태 갱신 함수 호출 (예: setAuth)
          // ...
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

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
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
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

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

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '가입 중...' : '회원가입하기'}
            </button>
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
