import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextRTK'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, X, User, MapPin, Palette } from '@/components/icons'

export function ProfileEditPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    preferredRegion: 'none',
    preferredTheme: 'none',
    bio: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        preferredRegion: user.preferred_region || 'none',
        preferredTheme: user.preferred_theme || 'none',
        bio: user.bio || '',
      })
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // 에러 클리어
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.'
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다.'
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = '닉네임은 20자 이하여야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // 백엔드 API와 필드명 맞춤
      const updateData = {
        nickname: formData.nickname,
        preferred_region:
          formData.preferredRegion === 'none' ? null : formData.preferredRegion,
        preferred_theme:
          formData.preferredTheme === 'none' ? null : formData.preferredTheme,
        bio: formData.bio,
      }
      await updateUser(updateData)
      navigate('/profile')
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
      setErrors({ submit: '프로필 업데이트에 실패했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const regions = [
    '서울',
    '부산',
    '대구',
    '인천',
    '광주',
    '대전',
    '울산',
    '세종',
    '경기도',
    '강원도',
    '충청북도',
    '충청남도',
    '전라북도',
    '전라남도',
    '경상북도',
    '경상남도',
    '제주도',
  ]

  const themes = [
    '해변',
    '산',
    '도시',
    '문화',
    '맛집',
    '캠핑',
    '휴양',
    '액티비티',
    '힐링',
    '쇼핑',
    '역사',
    '자연',
    '테마파크',
    '온천',
    '스키',
    '골프',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            프로필 편집
          </h1>
          <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
        </div>

        <form onSubmit={handleSubmit}>
          {/* 기본 정보 */}
          <Card className="bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 프로필 사진 */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profile_image} alt={user?.nickname} />
                  <AvatarFallback className="text-lg">
                    {user?.nickname?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    프로필 사진은 소셜 로그인 계정에서 자동으로 연동됩니다.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 닉네임 */}
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임 *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) =>
                    handleInputChange('nickname', e.target.value)
                  }
                  placeholder="닉네임을 입력하세요"
                  className={errors.nickname ? 'border-red-500' : ''}
                />
                {errors.nickname && (
                  <p className="text-sm text-red-500">{errors.nickname}</p>
                )}
              </div>

              {/* 자기소개 */}
              <div className="space-y-2">
                <Label htmlFor="bio">자기소개</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="자기소개를 입력하세요 (선택사항)"
                  className="min-h-[100px] w-full rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  maxLength={200}
                />
                <p className="text-right text-sm text-gray-500">
                  {formData.bio.length}/200
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 선호 설정 */}
          <Card className="bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                선호 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 선호 지역 */}
              <div className="space-y-2">
                <Label htmlFor="preferredRegion">선호 지역</Label>
                <Select
                  value={formData.preferredRegion}
                  onValueChange={(value) =>
                    handleInputChange('preferredRegion', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선호하는 지역을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택하지 않음</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 선호 테마 */}
              <div className="space-y-2">
                <Label htmlFor="preferredTheme">선호 테마</Label>
                <Select
                  value={formData.preferredTheme}
                  onValueChange={(value) =>
                    handleInputChange('preferredTheme', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선호하는 테마를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택하지 않음</SelectItem>
                    {themes.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 선택된 항목 표시 */}
              {(formData.preferredRegion !== 'none' ||
                formData.preferredTheme !== 'none') && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.preferredRegion !== 'none' && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" />
                      {formData.preferredRegion}
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange('preferredRegion', 'none')
                        }
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {formData.preferredTheme !== 'none' && (
                    <Badge variant="secondary">
                      {formData.preferredTheme}
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange('preferredTheme', 'none')
                        }
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
