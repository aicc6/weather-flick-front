import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextRTK'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { WithdrawModal } from '@/components/WithdrawModal'
import { Switch } from '@/components/ui/switch'
import {
  Settings,
  LogOut,
  Trash2,
  Bell,
  Shield,
  User,
  ArrowLeft,
  Mail,
  Lock,
} from '@/components/icons'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // 알림 설정 상태 관리
  const [weatherAlert, setWeatherAlert] = useState(true)
  const [emailAlert, setEmailAlert] = useState(false)
  const [marketingAlert, setMarketingAlert] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleDeleteAccount = () => {
    setShowWithdrawModal(true)
  }

  const handleWithdrawSuccess = () => {
    // 회원탈퇴 성공 후 홈으로 이동
    navigate('/')
  }

  return (
    <div className="bg-gray-50/50 px-4 py-6 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              마이페이지로 돌아가기
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              설정
            </h1>
          </div>
        </div>

        {/* 계정 정보 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                계정 정보
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">이메일</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {user?.email}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">닉네임</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {user?.nickname || '설정되지 않음'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">계정 상태</span>
                </div>
                <Badge variant="default">활성</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 보안 설정 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="timeline-circle-green flex h-10 w-10 items-center justify-center rounded-full shadow-md">
                <span className="text-lg font-bold text-white">🔒</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                보안 설정
              </h2>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl"
                onClick={() => navigate('/profile/change-password')}
              >
                <Lock className="h-4 w-4" />
                비밀번호 변경
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl"
                onClick={() => navigate('/profile/edit')}
              >
                <User className="h-4 w-4" />
                프로필 정보 수정
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-600 shadow-md">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                알림 설정
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">날씨 변화 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    비 예보 시 대체 플랜 자동 알림
                  </p>
                </div>
                <Switch
                  checked={weatherAlert}
                  onCheckedChange={setWeatherAlert}
                  aria-label="날씨 변화 알림 토글"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">이메일 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    여행 관련 업데이트 및 추천
                  </p>
                </div>
                <Switch
                  checked={emailAlert}
                  onCheckedChange={setEmailAlert}
                  aria-label="이메일 알림 토글"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">마케팅 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    새로운 기능 및 이벤트 안내
                  </p>
                </div>
                <Switch
                  checked={marketingAlert}
                  onCheckedChange={setMarketingAlert}
                  aria-label="마케팅 알림 토글"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계정 관리 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-md">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                계정 관리
              </h2>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2 rounded-xl"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4" />
                회원탈퇴
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 앱 정보 */}
        <Card className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
                <span className="text-sm font-bold text-white">ℹ️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                앱 정보
              </h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>버전: 1.0.0</p>
              <p>© 2025 Weather Flick. All rights reserved.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 회원탈퇴 모달 */}
      <WithdrawModal
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
        onWithdrawSuccess={handleWithdrawSuccess}
      />
    </div>
  )
}
