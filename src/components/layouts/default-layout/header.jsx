/**
 * TODO
 * - [ ] Logo +
 * - [ ] Navigation Menu
 * - [ ] Login / Sign Up
 */
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sun } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Weather Flick
              </span>
            </Link>
          </div>

          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              to="/"
              className="font-medium text-gray-700 hover:text-gray-900"
            >
              홈
            </Link>
            <Link
              to="/plans"
              className="font-medium text-gray-700 hover:text-gray-900"
            >
              내 플랜
            </Link>
            <Link
              to="/destinations"
              className="font-medium text-gray-700 hover:text-gray-900"
            >
              여행지
            </Link>
            <Link
              to="/about"
              className="font-medium text-gray-700 hover:text-gray-900"
            >
              소개
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/plans">내 플랜</Link>
            </Button>
            <Button asChild>
              <Link to="/login">로그인</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
