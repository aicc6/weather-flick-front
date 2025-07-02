import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Save,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Check,
} from '@/components/icons'
import { authAPI } from '@/services/api'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

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

    // 성공 메시지 클리어
    if (success) {
      setSuccess(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // 현재 비밀번호 검증
    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.'
    }

    // 새 비밀번호 검증
    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.'
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다.'
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호를 다시 입력해주세요.'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다.'
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
      await authAPI.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      })

      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      // 2초 후 프로필 페이지로 이동
      setTimeout(() => {
        navigate('/profile')
      }, 2000)
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)

      if (error.status === 400 || error.status === 401) {
        setErrors({ currentPassword: '현재 비밀번호가 올바르지 않습니다.' })
      } else if (error.status === 422) {
        const errorData = error.data
        if (errorData?.detail) {
          if (Array.isArray(errorData.detail)) {
            // FastAPI validation error 형식
            const fieldErrors = {}
            errorData.detail.forEach((err) => {
              const field = err.loc?.[1] // 필드명
              if (field === 'current_password') {
                fieldErrors.currentPassword = err.msg
              } else if (field === 'new_password') {
                fieldErrors.newPassword = err.msg
              }
            })
            setErrors(fieldErrors)
          } else {
            setErrors({ submit: errorData.detail })
          }
        } else {
          setErrors({ submit: '입력 데이터가 올바르지 않습니다.' })
        }
      } else {
        setErrors({
          submit: '비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-md space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            비밀번호 변경
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            계정 보안을 위해 안전한 비밀번호로 변경해주세요
          </p>
        </div>

        {/* 성공 메시지 - 개선된 디자인 */}
        {success && (
          <Card className="overflow-hidden border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-green-800">
                  🎉 비밀번호 변경 성공!
                </h3>
                <p className="text-green-700">
                  잠시 후 프로필 페이지로 이동합니다.
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <div className="h-1 w-1 animate-bounce rounded-full bg-green-600 delay-0"></div>
                  <div className="mx-1 h-1 w-1 animate-bounce rounded-full bg-green-600 delay-150"></div>
                  <div className="h-1 w-1 animate-bounce rounded-full bg-green-600 delay-300"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 비밀번호 변경 폼 - 개선된 디자인 */}
        <Card className="overflow-hidden border-0 bg-white shadow-xl dark:bg-gray-800">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-md">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                비밀번호 변경
              </span>
            </CardTitle>
            <p className="ml-13 text-gray-600 dark:text-gray-400">
              현재 비밀번호를 입력한 후 새로운 비밀번호를 설정해주세요.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 현재 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호 *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange('currentPassword', e.target.value)
                    }
                    placeholder="현재 비밀번호를 입력하세요"
                    className={`pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading || success}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-500">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* 새 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호 *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange('newPassword', e.target.value)
                    }
                    placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                    className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading || success}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword}</p>
                )}
              </div>

              {/* 새 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인 *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading || success}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* 에러 메시지 - 개선된 디자인 */}
              {errors.submit && (
                <div className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                      <span className="text-xs text-red-600">⚠️</span>
                    </div>
                    <p className="text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* 안내 메시지 - 개선된 디자인 */}
              <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-3 font-semibold text-green-800">
                      🔒 안전한 비밀번호 가이드
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Check className="h-3 w-3 flex-shrink-0 text-green-600" />
                        <span>8자 이상의 길이</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Check className="h-3 w-3 flex-shrink-0 text-green-600" />
                        <span>영문 대소문자 포함</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Check className="h-3 w-3 flex-shrink-0 text-green-600" />
                        <span>숫자 및 특수문자 조합</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Check className="h-3 w-3 flex-shrink-0 text-green-600" />
                        <span>고유한 비밀번호 사용</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 버튼 - 개선된 디자인 */}
              <div className="flex flex-col gap-3 pt-6 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  disabled={loading || success}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="flex flex-1 items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 font-semibold shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>변경 중...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>비밀번호 변경</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
