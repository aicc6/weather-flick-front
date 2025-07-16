import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { toast } from 'sonner'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
  newPassword: z.string()
    .min(8, '새 비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다',
  path: ['confirmPassword']
})

export function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(changePasswordSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // TODO: API 호출로 비밀번호 변경 요청
      // const response = await changePassword({
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword
      // })

      // 임시로 성공 처리
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('비밀번호가 성공적으로 변경되었습니다')
      reset()
    } catch (error) {
      toast.error('비밀번호 변경에 실패했습니다. 다시 시도해주세요.')
      console.error('Password change error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">비밀번호 변경</CardTitle>
          <CardDescription>
            보안을 위해 새로운 비밀번호로 변경해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 현재 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="현재 비밀번호를 입력하세요"
                  {...register('currentPassword')}
                  className={errors.currentPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* 새 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 입력하세요"
                  {...register('newPassword')}
                  className={errors.newPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Alert>
              <AlertDescription>
                새 비밀번호는 최소 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangePasswordPage
