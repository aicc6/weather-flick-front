import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, X, Heart, Lock, Shield } from '@/components/icons'
import { toast } from 'sonner'

export function WithdrawModal({ open, onOpenChange, onWithdrawSuccess }) {
  const { user, logout } = useAuth()
  const [formData, setFormData] = useState({
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: 확인, 2: 비밀번호 입력

  // 소셜 로그인 사용자인지 확인 (auth_provider가 'google' 등인 경우에만 소셜 사용자)
  const isSocialUser = user?.auth_provider && user.auth_provider !== 'local'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleNextStep = () => {
    setStep(2)
  }

  const handleCancel = () => {
    setFormData({ password: '' })
    setError('')
    setStep(1)
    onOpenChange(false)
  }

  const handleWithdraw = async () => {
    if (!isSocialUser && !formData.password) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const withdrawData = {}

      // 일반 로그인 사용자는 비밀번호 포함
      if (!isSocialUser) {
        withdrawData.password = formData.password
      }

      const response = await authAPI.withdraw(withdrawData)

      if (response.success) {
        // 모달 먼저 닫기
        handleCancel()

        // 토스트 표시
        toast.success('회원탈퇴가 완료되었습니다. 그동안 서비스를 이용해주셔서 감사합니다.', {
          duration: 5000,
          position: 'top-center',
        })

        // 약간의 딜레이 후 로그아웃 처리
        setTimeout(async () => {
          // 로그아웃 처리
          await logout()

          // 성공 콜백 호출
          if (onWithdrawSuccess) {
            onWithdrawSuccess()
          }
        }, 1000)
      } else {
        setError(response.message || '회원탈퇴 처리 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('회원탈퇴 오류:', err)
      
      if (err.status === 400) {
        setError(err.data?.detail || '입력 정보를 다시 확인해주세요.')
      } else if (err.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.')
      } else {
        setError('회원탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            회원탈퇴
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {step === 1
              ? '정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
              : '탈퇴를 완료하려면 추가 정보를 입력해주세요.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="py-6 space-y-4">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-800 dark:text-red-200">탈퇴 시 삭제되는 정보</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                      <Heart className="h-4 w-4" />
                      <span>저장된 모든 여행 계획</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                      <Heart className="h-4 w-4" />
                      <span>즐겨찾기한 여행지 정보</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                      <Heart className="h-4 w-4" />
                      <span>작성한 리뷰와 평점</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                      <Lock className="h-4 w-4" />
                      <span>계정 복구 불가능</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  정말 떠나시는 건가요? 언제든지 다시 돌아오실 수 있어요! 🌟
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-6">
            {!isSocialUser && (
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-medium text-gray-700 dark:text-gray-300">
                  비밀번호 확인 *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="현재 비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`pl-10 h-12 bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-red-500/20 ${
                      error && !formData.password 
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-red-400'
                    }`}
                  />
                </div>
              </div>
            )}

            {isSocialUser && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    소셜 로그인 계정이므로 비밀번호 확인이 필요하지 않습니다.
                  </p>
                </div>
              </div>
            )}


            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleNextStep} disabled={loading}>
                계속 진행
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                이전
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                취소
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleWithdraw} 
                disabled={loading || (!isSocialUser && !formData.password)}
              >
                {loading ? '처리중...' : '탈퇴하기'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}