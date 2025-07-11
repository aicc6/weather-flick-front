import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from '@/components/icons'
import { Badge } from '@/components/ui/badge'

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="/newicon.jpg"
                alt="Weather Flick Logo"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold">Weather Flick</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              날씨 기반 맞춤형 여행 추천 서비스로 완벽한 여행을 계획해보세요.
            </p>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                🚧 개발 중
              </Badge>
              <span className="text-xs text-gray-500">v1.0.0</span>
            </div>
          </div>

          {/* 서비스 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">서비스</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  to="/recommend"
                  className="transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  여행지추천
                </Link>
              </li>
              <li>
                <Link
                  to="/customized-schedule"
                  className="transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  맞춤 일정
                </Link>
              </li>
              <li>
                <Link
                  to="/planner"
                  className="transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  여행 플래너
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">고객 지원</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  to="/help"
                  className="transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  도움말
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">연락처</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@weatherflick.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>02-1234-5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>서울특별시 강남구</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-8 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 Weather Flick. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              현재 개발 중인 서비스입니다. 피드백을 환영합니다!
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
