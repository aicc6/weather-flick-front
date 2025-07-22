import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContextRTK'
import { useUpdateProfileMutation } from '@/store/api/authApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, User, Save, X } from '@/components/icons'
import { toast } from 'sonner'

const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다')
    .max(20, '닉네임은 최대 20자까지 가능합니다'),
  bio: z.string().max(200, '소개는 최대 200자까지 가능합니다').optional(),
  preferred_region: z.string().optional(),
  preferred_theme: z.string().optional(),
})

const regions = [
  { value: 'none', label: '선택 안함' },
  { value: '서울', label: '서울' },
  { value: '부산', label: '부산' },
  { value: '대구', label: '대구' },
  { value: '인천', label: '인천' },
  { value: '광주', label: '광주' },
  { value: '대전', label: '대전' },
  { value: '울산', label: '울산' },
  { value: '경기', label: '경기' },
  { value: '강원', label: '강원' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '전북', label: '전북' },
  { value: '전남', label: '전남' },
  { value: '경북', label: '경북' },
  { value: '경남', label: '경남' },
  { value: '제주', label: '제주' },
]

const themes = [
  { value: 'none', label: '선택 안함' },
  { value: '자연', label: '자연' },
  { value: '문화', label: '문화' },
  { value: '역사', label: '역사' },
  { value: '음식', label: '음식' },
  { value: '쇼핑', label: '쇼핑' },
  { value: '휴양', label: '휴양' },
  { value: '액티비티', label: '액티비티' },
  { value: '도시', label: '도시' },
  { value: '바다', label: '바다' },
  { value: '산', label: '산' },
]

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [updateProfile, { isLoading: updateLoading }] =
    useUpdateProfileMutation()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
      bio: user?.bio || '',
      preferred_region: user?.preferred_region || 'none',
      preferred_theme: user?.preferred_theme || 'none',
    },
  })

  useEffect(() => {
    if (user) {
      const formData = {
        nickname: user.nickname || '',
        bio: user.bio || '',
        preferred_region: user.preferred_region || 'none',
        preferred_theme: user.preferred_theme || 'none',
      }
      reset(formData)
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    setError('')

    try {
      // RTK Query mutation 사용
      await updateProfile({
        nickname: data.nickname,
        bio: data.bio || null,
        preferred_region:
          data.preferred_region === 'none' ? null : data.preferred_region,
        preferred_theme:
          data.preferred_theme === 'none' ? null : data.preferred_theme,
      }).unwrap()

      toast.success('프로필이 성공적으로 수정되었습니다')
      navigate('/profile')
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMessage =
        error?.data?.detail ||
        error?.message ||
        '프로필 수정 중 오류가 발생했습니다'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        '변경사항이 저장되지 않았습니다. 정말로 취소하시겠습니까?',
      )
      if (!confirmed) return
    }
    navigate('/profile')
  }

  if (authLoading || !user) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="weather-card animate-pulse">
              <div className="p-8">
                <div className="mb-4 h-8 w-48 rounded bg-gray-300"></div>
                <div className="space-y-4">
                  <div className="h-4 w-full rounded bg-gray-300"></div>
                  <div className="h-4 w-3/4 rounded bg-gray-300"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="weather-card alert-error p-8 text-center">
              <h2 className="mb-2 text-xl font-bold">로그인이 필요합니다</h2>
              <p className="mb-4 text-red-600">
                프로필을 편집하려면 로그인해주세요.
              </p>
              <Button onClick={() => navigate('/login')}>
                로그인하러 가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="weather-card">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    프로필 편집
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 닉네임 */}
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

                {/* 소개 */}
                <div className="space-y-2">
                  <Label htmlFor="bio">소개</Label>
                  <Textarea
                    id="bio"
                    placeholder="자신을 소개해주세요"
                    rows={4}
                    {...register('bio')}
                    className={errors.bio ? 'border-red-500' : ''}
                  />
                  <p className="text-sm text-gray-500">
                    {watch('bio')?.length || 0}/200자
                  </p>
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </div>

                {/* 선호 지역 */}
                <div className="space-y-2">
                  <Label htmlFor="preferred_region">선호 지역</Label>
                  <Select
                    key={`region-${user?.preferred_region || 'none'}`}
                    value={watch('preferred_region')}
                    onValueChange={(value) => {
                      setValue('preferred_region', value, { shouldDirty: true })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선호하는 지역을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 선호 테마 */}
                <div className="space-y-2">
                  <Label htmlFor="preferred_theme">선호 테마</Label>
                  <Select
                    key={`theme-${user?.preferred_theme || 'none'}`}
                    value={watch('preferred_theme')}
                    onValueChange={(value) => {
                      setValue('preferred_theme', value, { shouldDirty: true })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선호하는 테마를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 버튼 */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={updateLoading || !isDirty}
                    className="flex-1"
                  >
                    {updateLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        저장
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateLoading}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
