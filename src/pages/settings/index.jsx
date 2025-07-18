import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextRTK'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { WithdrawModal } from '@/components/WithdrawModal'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  getNotificationSettings,
  updateNotificationSettings,
  saveFCMToken,
} from '@/services/notificationService'
import { requestNotificationPermission, getFCMToken } from '@/lib/firebase'
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
  const [loading, setLoading] = useState(false)

  // 알림 설정 상태 관리
  const [notificationSettings, setNotificationSettings] = useState({
    push_enabled: false,
    travel_plan_updates: true,
    weather_alerts: true,
    recommendation_updates: true,
    marketing_messages: false,
    email_enabled: false,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  })
  const [permission, setPermission] = useState(Notification.permission)
  const [fcmLoading, setFcmLoading] = useState(false)

  // 알림 설정 로드
  const loadNotificationSettings = async () => {
    try {
      setLoading(true)
      const settings = await getNotificationSettings()
      setNotificationSettings(settings)
    } catch (error) {
      console.error('알림 설정 로드 실패:', error)
      // 백엔드 API가 없는 경우 기본값 사용
    } finally {
      setLoading(false)
    }
  }

  // 알림 설정 업데이트
  const updateNotificationSetting = async (settingKey, value) => {
    const previousSettings = { ...notificationSettings }
    
    // 즉시 UI 업데이트
    setNotificationSettings(prev => ({
      ...prev,
      [settingKey]: value
    }))

    try {
      const newSettings = {
        ...notificationSettings,
        [settingKey]: value
      }
      
      await updateNotificationSettings(newSettings)
      toast.success('알림 설정이 저장되었습니다.')
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error)
      toast.error('설정 저장에 실패했습니다.')
      
      // 실패 시 이전 상태로 되돌리기
      setNotificationSettings(previousSettings)
    }
  }

  // 브라우저 알림 권한 요청
  const handleEnableNotifications = async () => {
    if (permission === 'granted') {
      // 이미 권한이 있는 경우 FCM 토큰만 생성
      await setupFCMToken()
      return
    }

    setFcmLoading(true)
    try {
      const result = await requestNotificationPermission()
      setPermission(result)

      if (result === 'granted') {
        await setupFCMToken()
        updateNotificationSetting('push_enabled', true)
        toast.success('알림이 활성화되었습니다.')
      } else if (result === 'denied') {
        toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 변경할 수 있습니다.')
      }
    } catch (error) {
      console.error('알림 활성화 오류:', error)
      toast.error('알림 활성화 중 오류가 발생했습니다.')
    } finally {
      setFcmLoading(false)
    }
  }

  // FCM 토큰 설정
  const setupFCMToken = async () => {
    try {
      const fcmToken = await getFCMToken()
      if (fcmToken) {
        await saveFCMToken(fcmToken)
        localStorage.setItem('fcm_token', fcmToken)
      } else {
        toast.error('알림 토큰을 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('FCM 토큰 설정 실패:', error)
      // 백엔드 API가 아직 구현되지 않은 경우에도 프론트엔드는 정상 작동
    }
  }

  // 알림 설정 핸들러
  const handleToggle = (key) => {
    updateNotificationSetting(key, !notificationSettings[key])
  }

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    if (user) {
      loadNotificationSettings()
    }
  }, [user])

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
            
            <div className="space-y-6">
              {/* 푸시 알림 메인 설정 */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium text-base">푸시 알림</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {permission === 'granted' 
                      ? '브라우저 알림이 활성화되었습니다' 
                      : '브라우저 알림 권한이 필요합니다'
                    }
                  </p>
                </div>
                {permission === 'granted' ? (
                  <Switch
                    checked={notificationSettings.push_enabled}
                    onCheckedChange={() => handleToggle('push_enabled')}
                    disabled={loading}
                    aria-label="푸시 알림 토글"
                  />
                ) : (
                  <Button
                    onClick={handleEnableNotifications}
                    disabled={fcmLoading || permission === 'denied'}
                    size="sm"
                    className="min-w-20"
                  >
                    {fcmLoading ? '처리 중...' : '활성화'}
                  </Button>
                )}
              </div>

              {permission === 'denied' && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    알림 권한이 차단되었습니다. 브라우저 설정에서 권한을 허용해주세요.
                  </p>
                </div>
              )}

              <Separator />

              {/* 알림 유형 설정 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">알림 유형</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">여행 계획 업데이트</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      여행 계획 변경사항 알림
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.travel_plan_updates}
                    onCheckedChange={() => handleToggle('travel_plan_updates')}
                    disabled={loading || !notificationSettings.push_enabled}
                    aria-label="여행 계획 업데이트 알림 토글"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">날씨 알림</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      여행지 날씨 변화 알림
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weather_alerts}
                    onCheckedChange={() => handleToggle('weather_alerts')}
                    disabled={loading || !notificationSettings.push_enabled}
                    aria-label="날씨 알림 토글"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">추천 업데이트</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      새로운 여행지 추천 알림
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.recommendation_updates}
                    onCheckedChange={() => handleToggle('recommendation_updates')}
                    disabled={loading || !notificationSettings.push_enabled}
                    aria-label="추천 업데이트 알림 토글"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">이메일 알림</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      이메일로 여행 정보 수신
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_enabled}
                    onCheckedChange={() => handleToggle('email_enabled')}
                    disabled={loading}
                    aria-label="이메일 알림 토글"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">마케팅 메시지</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      프로모션 및 이벤트 알림
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketing_messages}
                    onCheckedChange={() => handleToggle('marketing_messages')}
                    disabled={loading}
                    aria-label="마케팅 메시지 토글"
                  />
                </div>
              </div>

              <Separator />

              {/* 방해 금지 시간 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-base">방해 금지 시간</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      설정한 시간에는 알림을 받지 않습니다
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.quiet_hours_enabled}
                    onCheckedChange={() => handleToggle('quiet_hours_enabled')}
                    disabled={loading || !notificationSettings.push_enabled}
                    aria-label="방해 금지 시간 토글"
                  />
                </div>

                {notificationSettings.quiet_hours_enabled && (
                  <div className="flex gap-4 pl-4">
                    <div className="space-y-2 flex-1">
                      <label htmlFor="quiet-start" className="text-sm font-medium">시작 시간</label>
                      <input
                        id="quiet-start"
                        type="time"
                        value={notificationSettings.quiet_hours_start}
                        onChange={(e) => updateNotificationSetting('quiet_hours_start', e.target.value)}
                        className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                        disabled={loading || !notificationSettings.push_enabled}
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <label htmlFor="quiet-end" className="text-sm font-medium">종료 시간</label>
                      <input
                        id="quiet-end"
                        type="time"
                        value={notificationSettings.quiet_hours_end}
                        onChange={(e) => updateNotificationSetting('quiet_hours_end', e.target.value)}
                        className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                        disabled={loading || !notificationSettings.push_enabled}
                      />
                    </div>
                  </div>
                )}
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
            {/* 개발자 전용 FCM 테스트 링크 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/test-fcm')}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  FCM 푸시 알림 테스트
                </Button>
              </div>
            )}
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
