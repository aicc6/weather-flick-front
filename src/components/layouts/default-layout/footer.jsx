import { Link } from 'react-router-dom'
import { Sun, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Weather Flick</span>
            </div>
            <p className="text-sm text-gray-400">
              날씨 기반 맞춤형 여행 추천 서비스로 완벽한 여행을 계획해보세요.
            </p>
          </div>

          {/* 서비스 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">서비스</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  to="/plans"
                  className="transition-colors hover:text-white"
                >
                  여행 플랜
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="transition-colors hover:text-white"
                >
                  여행지 추천
                </Link>
              </li>
              <li>
                <Link
                  to="/weather"
                  className="transition-colors hover:text-white"
                >
                  날씨 정보
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="transition-colors hover:text-white"
                >
                  서비스 소개
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">고객 지원</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/help" className="transition-colors hover:text-white">
                  도움말
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-white">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="transition-colors hover:text-white"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="transition-colors hover:text-white"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">연락처</h3>
            <div className="space-y-2 text-sm text-gray-400">
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

        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2024 Weather Flick. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
