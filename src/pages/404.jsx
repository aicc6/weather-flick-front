import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft, Search } from '@/components/icons'

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardContent className="p-8">
          <div className="mb-8">
            <div className="mb-4 text-8xl font-bold text-blue-600">404</div>
            <div className="mb-4 text-6xl">🌤️</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              페이지를 찾을 수 없습니다
            </h1>
            <p className="mb-6 text-gray-600">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
              <br />
              날씨처럼 예측하기 어려운 일이 발생했네요! 🌦️
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  홈으로 돌아가기
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link to="/planner">
                  <Search className="mr-2 h-4 w-4" />
                  여행 플래너
                </Link>
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전 페이지로
            </Button>
          </div>

          <div className="mt-8 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-800">
              이런 기능들을 찾고 계셨나요?
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/planner" className="text-blue-600 hover:underline">
                🗓️ 여행 계획
              </Link>
              <Link to="/recommend" className="text-blue-600 hover:underline">
                🤖 AI 추천
              </Link>
              <Link to="/main" className="text-blue-600 hover:underline">
                🌤️ 날씨 정보
              </Link>
              <Link to="/contact" className="text-blue-600 hover:underline">
                📞 문의하기
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFoundPage
