import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from '@/components/icons'

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

        <div className="mt-8 border-t border-gray-300 pt-8 text-center dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 Weather Flick. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
