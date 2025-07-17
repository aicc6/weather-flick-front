import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { DefaultLayout } from './layouts/default-layout'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/common/ErrorBoundary'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import NotificationPermission from './components/common/NotificationPermission'
import ProtectedRoute from './components/common/ProtectedRoute'
import { initializeApiMonitoring } from '@/utils/apiKeyMonitoring'
import { useNotification } from '@/hooks/useNotification'
import '@/App.css'

// 핵심 페이지는 즉시 로드
import { MainPage } from './pages/main'
import { LoginPage } from './pages/login'

// 필수 페이지들
const NotFoundPage = lazy(() => import('./pages/404'))
const PrivacyPolicyPage = lazy(() => import('./pages/privacy'))
const OfflinePage = lazy(() => import('./pages/offline'))

// 나머지 페이지들은 지연 로딩
const SignUpPage = lazy(() =>
  import('./pages/sign-up').then((module) => ({ default: module.SignUpPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/forgot-password').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)
const CustomizedSchedulePage = lazy(
  () => import('./pages/customized-schedule/customized-schedule'),
)
const CustomizedScheduleRegionPage = lazy(
  () => import('./pages/customized-schedule/region'),
)
const CustomizedSchedulePeriodPage = lazy(
  () => import('./pages/customized-schedule/period'),
)
const CustomizedScheduleWhoPage = lazy(
  () => import('./pages/customized-schedule/who'),
)
const CustomizedScheduleStylePage = lazy(
  () => import('./pages/customized-schedule/style'),
)
const CustomizedScheduleSchedulePage = lazy(
  () => import('./pages/customized-schedule/schedule'),
)
const CustomizedScheduleResultPage = lazy(
  () => import('./pages/customized-schedule/result'),
)
const VerifyEmailPage = lazy(() =>
  import('./pages/auth/verify-email').then((module) => ({
    default: module.VerifyEmailPage,
  })),
)
const GoogleCallbackPage = lazy(() =>
  import('./pages/auth/GoogleCallback').then((module) => ({
    default: module.GoogleCallbackPage,
  })),
)
const ProfilePage = lazy(() => import('./pages/profile/index.jsx'))
const ProfileEditPage = lazy(() => import('./pages/profile/edit.jsx'))
const ChangePasswordPage = lazy(() =>
  import('./pages/profile/change-password').then((module) => ({
    default: module.ChangePasswordPage,
  })),
)
const SettingsPage = lazy(() =>
  import('./pages/settings').then((module) => ({
    default: module.SettingsPage,
  })),
)
const PlannerPage = lazy(() => import('./pages/planner'))
const TravelCoursePage = lazy(() => import('@/pages/recommend'))
const TravelCourseDetailPage = lazy(() => import('@/pages/recommend/detail'))
const TravelPlansPage = lazy(() =>
  import('./pages/travel-plans').then((module) => ({
    default: module.TravelPlansPage,
  })),
)
const TravelPlanDetailPage = lazy(() => import('./pages/travel-plans/detail'))
const HelpPage = lazy(() => import('./pages/help/help'))
const ContactPage = lazy(() => import('./pages/contact'))
const TermsPage = lazy(() => import('./pages/terms'))

// 내부 컴포넌트 - BrowserRouter 내부에서 실행
function AppContent() {
  // 알림 시스템 초기화
  useNotification()

  return (
    <DefaultLayout>
      <PWAInstallPrompt />
      <NotificationPermission />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/recommend" element={<TravelCoursePage />} />
          <Route
            path="/recommend/detail/:id"
            element={<TravelCourseDetailPage />}
          />
          <Route
            path="/customized-schedule"
            element={
              <ProtectedRoute>
                <CustomizedSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customized-schedule/region"
            element={
              <ProtectedRoute>
                <CustomizedScheduleRegionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customized-schedule/period"
            element={
              <ProtectedRoute>
                <CustomizedSchedulePeriodPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customized-schedule/who"
            element={
              <ProtectedRoute>
                <CustomizedScheduleWhoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customized-schedule/style"
            element={
              <ProtectedRoute>
                <CustomizedScheduleStylePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customized-schedule/schedule"
            element={
              <ProtectedRoute>
                <CustomizedScheduleSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customized-schedule/result"
            element={
              <ProtectedRoute>
                <CustomizedScheduleResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <PlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/travel-plans"
            element={
              <ProtectedRoute>
                <TravelPlansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/travel-plans/:planId"
            element={
              <ProtectedRoute>
                <TravelPlanDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/auth/google/callback"
            element={<GoogleCallbackPage />}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/offline" element={<OfflinePage />} />
          {/* 404 페이지 - 모든 라우트의 마지막에 위치 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </DefaultLayout>
  )
}

// 메인 App 컴포넌트
function App() {
  // API 모니터링 시스템 초기화
  useEffect(() => {
    initializeApiMonitoring()
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
