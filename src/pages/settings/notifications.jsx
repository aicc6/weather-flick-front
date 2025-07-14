import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getNotificationSettings, updateNotificationSettings } from '@/services/notificationService'
import { toast } from 'sonner'

export default function NotificationSettings() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    push_enabled: false,
    travel_plan_updates: true,
    weather_alerts: true,
    recommendation_updates: true,
    marketing_messages: false,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getNotificationSettings()
      setSettings(data)
    } catch (error) {
      console.error('알림 설정 로드 실패:', error)
      // 백엔드 API가 없는 경우 기본값 사용
    }
  }

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateNotificationSettings(settings)
      toast.success('알림 설정이 저장되었습니다.')
    } catch (error) {
      console.error('알림 설정 저장 실패:', error)
      toast.error('설정 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
          <CardDescription>
            Weather Flick의 알림을 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-enabled" className="text-base">
                푸시 알림
              </Label>
              <p className="text-sm text-muted-foreground">
                모든 알림을 받습니다
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={settings.push_enabled}
              onCheckedChange={() => handleToggle('push_enabled')}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">알림 유형</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="travel-updates" className="text-base">
                  여행 계획 업데이트
                </Label>
                <p className="text-sm text-muted-foreground">
                  여행 계획 변경사항 알림
                </p>
              </div>
              <Switch
                id="travel-updates"
                checked={settings.travel_plan_updates}
                onCheckedChange={() => handleToggle('travel_plan_updates')}
                disabled={!settings.push_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weather-alerts" className="text-base">
                  날씨 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  여행지 날씨 변화 알림
                </p>
              </div>
              <Switch
                id="weather-alerts"
                checked={settings.weather_alerts}
                onCheckedChange={() => handleToggle('weather_alerts')}
                disabled={!settings.push_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="recommendations" className="text-base">
                  추천 업데이트
                </Label>
                <p className="text-sm text-muted-foreground">
                  새로운 여행지 추천 알림
                </p>
              </div>
              <Switch
                id="recommendations"
                checked={settings.recommendation_updates}
                onCheckedChange={() => handleToggle('recommendation_updates')}
                disabled={!settings.push_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing" className="text-base">
                  마케팅 메시지
                </Label>
                <p className="text-sm text-muted-foreground">
                  프로모션 및 이벤트 알림
                </p>
              </div>
              <Switch
                id="marketing"
                checked={settings.marketing_messages}
                onCheckedChange={() => handleToggle('marketing_messages')}
                disabled={!settings.push_enabled}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="quiet-hours" className="text-base">
                  방해 금지 시간
                </Label>
                <p className="text-sm text-muted-foreground">
                  설정한 시간에는 알림을 받지 않습니다
                </p>
              </div>
              <Switch
                id="quiet-hours"
                checked={settings.quiet_hours_enabled}
                onCheckedChange={() => handleToggle('quiet_hours_enabled')}
                disabled={!settings.push_enabled}
              />
            </div>

            {settings.quiet_hours_enabled && (
              <div className="flex gap-4 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">시작 시간</Label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => setSettings(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={!settings.push_enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">종료 시간</Label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => setSettings(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={!settings.push_enabled}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? '저장 중...' : '설정 저장'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}