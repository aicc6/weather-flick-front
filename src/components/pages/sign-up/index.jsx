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
import { useEmailVerification } from '@/hooks/useEmailVerification'
import { EmailVerification } from './EmailVerification'
import { SignUpSuccess } from './SignUpSuccess'

/**
 * URL: /sign-up
 */
export function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const { register: registerUser, googleLogin } = useAuth()
  const emailRef = useRef()

  const {
    isEmailVerified,
    verificationSent,
    verificationInput,
    setVerificationInput,
    verificationMsg,
    isVerifying,
    isSending,
    sendVerificationCode,
    verifyCode,
  } = useEmailVerification()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    setValue,
    getValues,
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
      const userData = {
        email: data.email,
        username: data.nickname,
        password: data.password,
      }

      await registerUser(userData)
      setIsSuccess(true)
      reset()

      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      const errorMessage =
        error.data?.detail ||
        error.response?.data?.detail ||
        error.message ||
        '회원가입 중 오류가 발생했습니다.'
      setSubmitError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (tokenResponse.access_token) {
        try {
          await googleLogin(tokenResponse.access_token)
          navigate('/')
        } catch (err) {
          setSubmitError(err.response?.data?.detail || '구글 회원가입 실패')
        }
      }
    },
    onError: () => {
      setSubmitError('구글 회원가입 중 오류가 발생했습니다.')
    },
  })

  const handleSendVerification = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    clearErrors('email')
    const email = emailRef.current.value
    const nickname = getValues('nickname')
    await sendVerificationCode(email, nickname)
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const email = emailRef.current.value
    const success = await verifyCode(email, verificationInput)
    if (success) {
      setValue('email', email)
      clearErrors('email')
    }
  }

  if (isSuccess) {
    return <SignUpSuccess />
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

            <EmailVerification
              register={register}
              errors={errors}
              isEmailVerified={isEmailVerified}
              verificationSent={verificationSent}
              verificationInput={verificationInput}
              setVerificationInput={setVerificationInput}
              verificationMsg={verificationMsg}
              isVerifying={isVerifying}
              isSending={isSending}
              onSendVerification={handleSendVerification}
              onVerifyCode={handleVerifyCode}
              ref={emailRef}
            />

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
