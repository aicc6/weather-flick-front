import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { DefaultLayout } from './layouts/default-layout'
import LoadingSpinner from './components/LoadingSpinner'
import '@/App.css'

// 핵심 페이지는 즉시 로드
import { MainPage } from './pages/main'
import { LoginPage } from './pages/login'

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
const ProfileEditPage = lazy(() =>
  import('./pages/profile/edit').then((module) => ({
    default: module.ProfileEditPage,
  })),
)
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
const TravelCoursePage = lazy(() => import('@/pages/destinations'))
const TravelCourseDetailPage = lazy(() => import('@/pages/destinations/detail'))
const TravelPlansPage = lazy(() =>
  import('./pages/travel-plans').then((module) => ({
    default: module.TravelPlansPage,
  })),
)
const TravelPlanDetailPage = lazy(() =>
  import('./pages/travel-plans/detail').then((module) => ({
    default: module.TravelPlanDetailPage,
  })),
)
const HelpPage = lazy(() => import('./pages/help/help'))
const ContactPage = lazy(() => import('./pages/contact'))
const TermsPage = lazy(() => import('./pages/terms'))

function App() {
  return (
    <BrowserRouter>
      <DefaultLayout>
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
              element={<CustomizedSchedulePage />}
            />
            <Route
              path="/customized-schedule/region"
              element={<CustomizedScheduleRegionPage />}
            />
            <Route
              path="/customized-schedule/period"
              element={<CustomizedSchedulePeriodPage />}
            />
            <Route
              path="/customized-schedule/who"
              element={<CustomizedScheduleWhoPage />}
            />
            <Route
              path="/customized-schedule/style"
              element={<CustomizedScheduleStylePage />}
            />
            <Route
              path="/customized-schedule/schedule"
              element={<CustomizedScheduleSchedulePage />}
            />
            <Route
              path="/customized-schedule/result"
              element={<CustomizedScheduleResultPage />}
            />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/travel-plans" element={<TravelPlansPage />} />
            <Route
              path="/travel-plans/:planId"
              element={<TravelPlanDetailPage />}
            />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route
              path="/auth/google/callback"
              element={<GoogleCallbackPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </Suspense>
      </DefaultLayout>
    </BrowserRouter>
  )
}

export default App
