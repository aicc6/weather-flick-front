/**
 * TODO
 * - [ ] Logo +
 * - [ ] Navigation Menu
 * - [ ] Login / Sign Up
 */
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sun, Moon, User, LogOut, Settings, Menu, X } from '@/components/icons'
import { navigationLinks } from '@/data'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 950)

  const { user, isLoggedIn, isAuthenticated, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // 디버깅용 로그 (개발 중에만 사용)
  useEffect(() => {
    console.log('Header render - Auth state:', {
      user: !!user,
      isLoggedIn,
      isAuthenticated,
      loading,
      userExists: !!user,
    })
  }, [user, isLoggedIn, isAuthenticated, loading])

  // 현재 경로가 메뉴 항목과 일치하는지 확인하는 함수
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

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

  // 화면 크기 변화 감지
  useEffect(() => {
    const handleResize = () => {
      const largeScreen = window.innerWidth > 950
      setIsLargeScreen(largeScreen)

      // 화면이 커지면 사이드바 닫기
      if (largeScreen && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarOpen])

  // 사이드바가 열려있을 때 body 스크롤 막기
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

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
    setIsSidebarOpen(false)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              {/* 햄버거 메뉴 버튼 (950px 이하) */}
              {!isLargeScreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="mr-4"
                  aria-label="메뉴 열기"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              )}

              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/logo.jpg"
                  alt="Weather Flick Logo"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="hidden text-xl font-bold text-gray-900 sm:inline dark:text-white">
                  Weather Flick
                </span>
              </Link>
            </div>

            {/* 상단 네비게이션 (950px 이상) */}
            {isLargeScreen && (
              <nav className="flex items-center space-x-8">
                {navigationLinks.map((link) => {
                  const isActive = isActiveRoute(link.path)
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative font-medium transition-colors ${
                        isActive
                          ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                          : 'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-blue-600 dark:bg-blue-400" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            )}

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              ) : user ? (
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
                    <div className="px-2 py-1.5">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm leading-none font-medium">
                          {user.nickname || user.email || '사용자'}
                        </p>
                        <p className="text-muted-foreground text-xs leading-none">
                          {user.email || ''}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>프로필</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>설정</span>
                    </DropdownMenuItem>
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

      {/* 사이드바 오버레이 */}
      {isSidebarOpen && !isLargeScreen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-80 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isSidebarOpen && !isLargeScreen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* 사이드바 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <img
                src="/logo.jpg"
                alt="Weather Flick Logo"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="hidden text-xl font-bold text-gray-900 sm:inline dark:text-white">
                Weather Flick
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSidebar}
              aria-label="메뉴 닫기"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* 사이드바 네비게이션 */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-4">
              {navigationLinks.map((link) => {
                const isActive = isActiveRoute(link.path)
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={closeSidebar}
                      className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* 사이드바 하단 */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.nickname || user.email || '사용자'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email || ''}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/profile')
                      closeSidebar()
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    프로필
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/settings')
                      closeSidebar()
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate('/login')
                    closeSidebar()
                  }}
                >
                  로그인
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate('/sign-up')
                    closeSidebar()
                  }}
                >
                  회원가입
                </Button>
              </div>
            )}

            {/* 다크모드 토글 */}
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleToggle}
              >
                {isDark ? (
                  <Sun className="mr-2 h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {isDark ? '라이트 모드' : '다크 모드'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
