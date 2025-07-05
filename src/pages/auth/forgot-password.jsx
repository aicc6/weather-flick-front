import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '@/schemas/auth'
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
import { authAPI } from '@/services/api'


/**
 * URL: '/forgot-password'
 */
export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: '',
      email: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      await authAPI.forgotPassword(data)
      setSuccessMessage(
        '임시 비밀번호가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
      )
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      console.error('비밀번호 찾기 에러:', error)
      
      if (error.response?.data?.detail) {
        const errorMessage = error.response.data.detail
        console.error('백엔드 에러 메시지:', errorMessage)
        
        if (errorMessage.includes('해당 이메일로 등록된 계정을 찾을 수 없습니다')) {
          setSubmitError('해당 이메일로 등록된 계정을 찾을 수 없습니다.')
        } else if (errorMessage.includes('비활성화된 계정입니다')) {
          setSubmitError('비활성화된 계정입니다. 고객센터에 문의하세요.')
        } else if (errorMessage.includes('소셜 로그인 계정입니다')) {
          setSubmitError('소셜 로그인 계정입니다. 해당 서비스를 통해 로그인해주세요.')
        } else {
          setSubmitError(errorMessage)
        }
      } else {
        console.error('요청 실패:', error.message)
        setSubmitError('임시 비밀번호 발급에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">비밀번호 찾기</CardTitle>
          <CardDescription>
            가입 시 사용한 닉네임과 이메일을 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  잠시 후 로그인 페이지로 이동됩니다...
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                  variant="outline"
                >
                  로그인 페이지로 이동
                </Button>
              </div>
            </div>
          ) : (
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
                  placeholder="닉네임을 입력해주세요"
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
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '전송 중...' : '임시 비밀번호 발급'}
              </Button>
            </form>
          )}

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