/**
 * TODO
 * - [ ] Logo +
 * - [ ] Navigation Menu
 * - [ ] Login / Sign Up
 */
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sun } from 'lucide-react'
import { Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Header() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // 초기 테마 적용
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const handleToggle = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Weather Flick
              </span>
            </Link>
          </div>

          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              to="/"
              className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              홈
            </Link>
            <Link
              to="/plans"
              className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              내 플랜
            </Link>
            <Link
              to="/destinations"
              className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              여행지
            </Link>
            <Link
              to="/recommend"
              className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-400"
            >
              추천여행지
            </Link>
            <Link
              to="/reviews"
              className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              여행 리뷰
            </Link>
            <Link
              to="/about"
              className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              소개
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              aria-label="다크모드 토글"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">로그인</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/sign-up">회원가입</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
