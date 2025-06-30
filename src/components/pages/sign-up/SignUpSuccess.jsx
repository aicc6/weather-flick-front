import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function SignUpSuccess() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">
            회원가입 완료!
          </CardTitle>
          <CardDescription>계정이 성공적으로 생성되었습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              이메일을 확인하여 계정을 활성화해주세요.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/login">로그인하기</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">홈으로 돌아가기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
