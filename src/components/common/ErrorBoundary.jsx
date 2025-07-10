import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from '@/components/icons'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })

    // 에러 로깅 (개발 중에는 콘솔에만)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-lg shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                <span>문제가 발생했습니다</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="mb-4 text-6xl">⚠️</div>
                <h2 className="mb-2 text-lg font-semibold">
                  예상치 못한 오류가 발생했습니다
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  페이지를 새로고침하거나 홈으로 이동해주세요.
                  <br />
                  문제가 지속되면 고객센터로 문의해주세요.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={this.handleRefresh} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  페이지 새로고침
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  홈으로 이동
                </Button>
              </div>

              {/* 개발 환경에서만 에러 정보 표시 */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-red-800">
                    개발자 정보:
                  </h3>
                  <details className="text-xs text-red-700">
                    <summary className="cursor-pointer hover:text-red-900">
                      에러 세부사항 보기
                    </summary>
                    <div className="mt-2 rounded bg-red-100 p-2 font-mono text-xs whitespace-pre-wrap">
                      {this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </div>
                  </details>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  지속적인 문제 발생 시:{' '}
                  <a
                    href="mailto:support@weatherflick.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@weatherflick.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
