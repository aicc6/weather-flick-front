import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, BellOff, Send, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { getFCMToken, requestNotificationPermission } from '@/lib/firebase'
import { saveReceivedNotification } from '@/utils/receivedNotifications'
import { toast } from 'sonner'

export default function NotificationTestPage() {
  const [permission, setPermission] = useState('default')
  const [fcmToken, setFcmToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('🌤️ 오늘의 날씨 알림')
  const [notificationBody, setNotificationBody] = useState('서울의 현재 날씨는 맑음이며, 여행하기 좋은 날씨입니다!')
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState('checking')

  // 예시 알림 메시지
  const exampleNotifications = [
    {
      title: '🌤️ 오늘의 날씨 알림',
      body: '서울의 현재 날씨는 맑음이며, 여행하기 좋은 날씨입니다!'
    },
    {
      title: '☔ 비 소식 알림',
      body: '내일 오후부터 비가 예상됩니다. 우산을 준비하세요!'
    },
    {
      title: '🎯 맞춤 여행지 추천',
      body: '날씨가 좋은 제주도로 떠나보는 건 어떠세요?'
    },
    {
      title: '📅 여행 일정 알림',
      body: '내일은 부산 여행 첫째 날입니다. 준비는 완료하셨나요?'
    },
    {
      title: '🌡️ 날씨 변화 알림',
      body: '기온이 급격히 떨어질 예정입니다. 따뜻한 옷을 준비하세요.'
    }
  ]

  useEffect(() => {
    // 알림 권한 상태 확인
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // 서비스 워커 상태 확인
    checkServiceWorker()
  }, [])

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          setServiceWorkerStatus('registered')
          console.log('서비스 워커 등록 확인:', registration)
        } else {
          setServiceWorkerStatus('not-registered')
          console.log('서비스 워커가 등록되지 않음')
        }
      } catch (error) {
        setServiceWorkerStatus('error')
        console.error('서비스 워커 확인 오류:', error)
      }
    } else {
      setServiceWorkerStatus('not-supported')
    }
  }

  const handleRequestPermission = async () => {
    setIsLoading(true)
    try {
      const perm = await requestNotificationPermission()
      setPermission(perm)
      
      if (perm === 'granted') {
        toast.success('알림 권한이 허용되었습니다.')
        // 권한 허용 후 자동으로 토큰 가져오기
        await handleGetToken()
      } else if (perm === 'denied') {
        toast.error('알림 권한이 거부되었습니다.')
      }
    } catch (error) {
      console.error('권한 요청 오류:', error)
      toast.error('권한 요청 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetToken = async () => {
    setIsLoading(true)
    try {
      const token = await getFCMToken()
      if (token) {
        setFcmToken(token)
        toast.success('FCM 토큰을 성공적으로 가져왔습니다.')
      } else {
        toast.error('FCM 토큰을 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('토큰 가져오기 오류:', error)
      toast.error('토큰을 가져오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken)
      toast.success('토큰이 클립보드에 복사되었습니다.')
    }
  }

  const sendTestNotification = async () => {
    setIsLoading(true)
    try {
      // 알림 권한과 관계없이 헤더 알림 아이콘에 표시
      const savedNotification = saveReceivedNotification({
        title: notificationTitle,
        body: notificationBody,
        type: 'system',
        data: {
          source: 'notification-test',
          timestamp: new Date().toISOString()
        }
      })
      
      if (savedNotification) {
        toast.success('알림이 헤더의 알림 아이콘에 추가되었습니다!')
        
        // 권한이 허용된 경우에만 브라우저 알림 표시
        if (permission === 'granted') {
          sendLocalNotification()
        }
      }
      
      // FCM 토큰이 있으면 콘솔에 출력 (백엔드 구현 시 사용)
      if (fcmToken) {
        console.log('FCM 토큰으로 푸시 알림을 발송하려면 백엔드 API가 필요합니다.')
        console.log('FCM 토큰:', fcmToken)
        console.log('제목:', notificationTitle)
        console.log('내용:', notificationBody)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sendLocalNotification = () => {
    // 브라우저 알림 표시
    new Notification(notificationTitle, {
      body: notificationBody,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      requireInteraction: true,
    })
  }

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getPermissionText = () => {
    switch (permission) {
      case 'granted':
        return '허용됨'
      case 'denied':
        return '거부됨'
      default:
        return '대기중'
    }
  }

  const getServiceWorkerStatusText = () => {
    switch (serviceWorkerStatus) {
      case 'registered':
        return { text: '등록됨', color: 'text-green-600' }
      case 'not-registered':
        return { text: '미등록', color: 'text-red-600' }
      case 'error':
        return { text: '오류', color: 'text-red-600' }
      case 'not-supported':
        return { text: '지원 안됨', color: 'text-gray-600' }
      default:
        return { text: '확인 중...', color: 'text-gray-600' }
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">알림 테스트 페이지</h1>

      <div className="space-y-6">
        {/* 상태 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
            <CardDescription>알림 시스템의 현재 상태를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">알림 권한:</span>
              <div className="flex items-center gap-2">
                {getPermissionIcon()}
                <span>{getPermissionText()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">서비스 워커:</span>
              <span className={getServiceWorkerStatusText().color}>
                {getServiceWorkerStatusText().text}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">FCM 토큰:</span>
              <span>{fcmToken ? '생성됨' : '미생성'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 권한 요청 */}
        <Card>
          <CardHeader>
            <CardTitle>1단계: 알림 권한 요청</CardTitle>
            <CardDescription>
              브라우저 알림을 받기 위해서는 먼저 권한을 허용해야 합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRequestPermission}
              disabled={permission === 'granted' || isLoading}
              className="w-full"
            >
              {permission === 'granted' ? (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  이미 권한이 허용됨
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  알림 권한 요청
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* FCM 토큰 */}
        <Card>
          <CardHeader>
            <CardTitle>2단계: FCM 토큰 가져오기</CardTitle>
            <CardDescription>
              Firebase Cloud Messaging 토큰을 생성합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGetToken}
              disabled={permission !== 'granted' || isLoading || !!fcmToken}
              className="w-full"
            >
              {fcmToken ? 'FCM 토큰 생성됨' : 'FCM 토큰 가져오기'}
            </Button>
            
            {fcmToken && (
              <div className="space-y-2">
                <Label>FCM 토큰:</Label>
                <div className="flex gap-2">
                  <Input 
                    value={fcmToken} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyToken}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 테스트 알림 발송 */}
        <Card>
          <CardHeader>
            <CardTitle>3단계: 테스트 알림 발송</CardTitle>
            <CardDescription>
              실제 푸시 알림을 테스트해볼 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>예시 알림 선택</Label>
              <div className="flex flex-wrap gap-2">
                {exampleNotifications.map((example, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNotificationTitle(example.title)
                      setNotificationBody(example.body)
                    }}
                  >
                    {example.title.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">알림 제목</Label>
              <Input
                id="title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="예: 🌤️ 오늘의 날씨 알림"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">알림 내용</Label>
              <Textarea
                id="body"
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                placeholder="예: 서울의 현재 날씨는 맑음이며, 여행하기 좋은 날씨입니다!"
                rows={3}
              />
            </div>

            <Button
              onClick={sendTestNotification}
              disabled={isLoading}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              테스트 알림 발송
            </Button>
          </CardContent>
        </Card>

        {/* 안내 사항 */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>참고사항:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>알림은 브라우저가 활성화된 상태에서만 표시됩니다.</li>
              <li>브라우저나 OS 설정에서 알림이 차단되어 있지 않은지 확인하세요.</li>
              <li>서비스 워커가 제대로 등록되어 있어야 백그라운드 알림이 작동합니다.</li>
              <li>FCM 토큰은 기기별로 고유하며, 주기적으로 갱신될 수 있습니다.</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}