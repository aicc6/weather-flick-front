import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, BellOff, CheckCircle, XCircle } from '@/components/icons'
import { toast } from 'sonner'
import {
  requestNotificationPermission,
  getFCMToken,
  onMessageListener,
} from '@/lib/firebase'
import { initializeFCMToken } from '@/services/notificationService'

export default function TestFCMPage() {
  const [permission, setPermission] = useState(Notification.permission)
  const [fcmToken, setFcmToken] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // FCM 토큰 가져오기
    const loadToken = async () => {
      if (permission === 'granted') {
        const token = await getFCMToken()
        setFcmToken(token)
      }
    }
    loadToken()

    // 포그라운드 메시지 리스너 설정
    if (permission === 'granted') {
      const setupMessageListener = async () => {
        try {
          onMessageListener()
            .then((payload) => {
              console.log('포그라운드 메시지 수신:', payload)

              const newMessage = {
                id: Date.now(),
                title: payload.notification?.title || '새로운 알림',
                body: payload.notification?.body || '알림 내용이 없습니다.',
                data: payload.data,
                timestamp: new Date().toLocaleTimeString(),
              }

              setMessages((prev) => [newMessage, ...prev])

              toast.info(newMessage.title, {
                description: newMessage.body,
                duration: 5000,
              })
            })
            .catch(console.error)
        } catch (error) {
          console.error('메시지 리스너 설정 실패:', error)
        }
      }

      setupMessageListener()
    }
  }, [permission])

  const handleRequestPermission = async () => {
    setIsLoading(true)

    try {
      const newPermission = await requestNotificationPermission()
      setPermission(newPermission)

      if (newPermission === 'granted') {
        const token = await getFCMToken()
        setFcmToken(token)

        // 백엔드에 토큰 저장
        if (token) {
          await initializeFCMToken()
        }

        toast.success('알림 권한이 허용되었습니다!')
      } else {
        toast.error('알림 권한이 거부되었습니다.')
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      toast.error('알림 권한 요청에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    if (!fcmToken) {
      toast.error('FCM 토큰이 없습니다.')
      return
    }

    try {
      // 테스트 알림 요청
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('테스트 알림이 전송되었습니다!')
        console.log('테스트 알림 응답:', result)
      } else {
        const error = await response.json()
        toast.error(
          `테스트 알림 전송 실패: ${error.detail || '알 수 없는 오류'}`,
        )
      }
    } catch (error) {
      console.error('테스트 알림 전송 실패:', error)
      toast.error('테스트 알림 전송에 실패했습니다.')
    }
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: '허용됨',
          color: 'text-green-600',
        }
      case 'denied':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: '거부됨',
          color: 'text-red-600',
        }
      default:
        return {
          icon: <Bell className="h-5 w-5 text-yellow-500" />,
          text: '미결정',
          color: 'text-yellow-600',
        }
    }
  }

  const status = getPermissionStatus()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="mb-8 text-center text-3xl font-bold">
          FCM 푸시 알림 테스트
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림 권한 상태
            </CardTitle>
            <CardDescription>
              FCM 푸시 알림을 받으려면 알림 권한이 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                {status.icon}
                <span className={status.color}>현재 상태: {status.text}</span>
              </AlertDescription>
            </Alert>

            {fcmToken && (
              <Alert>
                <AlertDescription>
                  <span className="font-medium">FCM 토큰:</span>
                  <br />
                  <span className="font-mono text-xs break-all">
                    {fcmToken}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {permission !== 'granted' && (
                <Button
                  onClick={handleRequestPermission}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      요청 중...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      알림 권한 요청
                    </>
                  )}
                </Button>
              )}

              {permission === 'granted' && fcmToken && (
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  className="flex-1"
                >
                  <BellOff className="mr-2 h-4 w-4" />
                  테스트 알림 전송
                </Button>
              )}
            </div>

            {permission === 'denied' && (
              <Alert variant="destructive">
                <AlertDescription>
                  알림 권한이 거부되었습니다. 브라우저 설정에서 알림 권한을
                  허용해주세요.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {messages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>수신된 메시지</CardTitle>
              <CardDescription>
                포그라운드에서 수신된 FCM 메시지 목록
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.map((msg) => (
                  <Alert key={msg.id}>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{msg.title}</span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{msg.body}</p>
                      {msg.data && (
                        <pre className="mt-2 rounded bg-gray-100 p-2 text-xs">
                          {JSON.stringify(msg.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
