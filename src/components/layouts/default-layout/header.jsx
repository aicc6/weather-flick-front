/**
 * TODO
 * - [ ] Logo +
 * - [ ] Navigation Menu
 * - [ ] Login / Sign Up
 */
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sun, Moon, User, LogOut } from '@/components/icons'
import { navigationLinks } from '@/data'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  // 디버깅을 위한 로그
  console.log('Header 렌더링 - user:', user)
  console.log('Header 렌더링 - isLoggedIn:', isLoggedIn)
  console.log('Header 렌더링 - user?.nickname:', user?.nickname)
  console.log('Header 렌더링 - user?.email:', user?.email)

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

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/logo.jpg"
                alt="Weather Flick Logo"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Weather Flick
              </span>
            </Link>
          </div>

          <nav className="hidden items-center space-x-8 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium ${
                  link.isHighlighted
                    ? 'text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-400'
                    : 'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {user?.nickname || user?.email}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">로그인</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/sign-up">회원가입</Link>
                </Button>
              </>
            )}
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
          </div>
        </div>
      </div>
    </header>
  )
}
