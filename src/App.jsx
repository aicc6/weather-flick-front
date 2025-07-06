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
const ReviewsPage = lazy(() =>
  import('./pages/reviews').then((module) => ({ default: module.ReviewsPage })),
)
const ReviewWritePage = lazy(() =>
  import('./pages/reviews/write').then((module) => ({
    default: module.ReviewWritePage,
  })),
)
const RecommendPage = lazy(() => import('./pages/recommend'))
const RecommendRegionPage = lazy(() => import('./pages/recommend/region'))
const RecommendPeriodPage = lazy(() => import('./pages/recommend/period'))
const RecommendWhoPage = lazy(() => import('./pages/recommend/who'))
const RecommendStylePage = lazy(() => import('./pages/recommend/style'))
const RecommendSchedulePage = lazy(() => import('./pages/recommend/schedule'))
const RecommendResultPage = lazy(() => import('./pages/recommend/result'))
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
const ProfilePage = lazy(() =>
  import('./pages/profile').then((module) => ({ default: module.ProfilePage })),
)
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
const PlannerPage = lazy(() => import('./pages/planner'))
const TravelCoursePage = lazy(() => import('@/pages/destinations'))
const TravelCourseDetailPage = lazy(() => import('@/pages/destinations/detail'))
const TravelPlansPage = lazy(() =>
  import('./pages/travel-plans').then((module) => ({
    default: module.TravelPlansPage,
  })),
)

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
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/reviews/write" element={<ReviewWritePage />} />
            <Route path="/customized-schedule" element={<RecommendPage />} />
            <Route
              path="/customized-schedule/region"
              element={<RecommendRegionPage />}
            />
            <Route
              path="/customized-schedule/period"
              element={<RecommendPeriodPage />}
            />
            <Route
              path="/customized-schedule/who"
              element={<RecommendWhoPage />}
            />
            <Route
              path="/customized-schedule/style"
              element={<RecommendStylePage />}
            />
            <Route
              path="/customized-schedule/schedule"
              element={<RecommendSchedulePage />}
            />
            <Route
              path="/customized-schedule/result"
              element={<RecommendResultPage />}
            />
            <Route path="/recommend/:id" element={<TravelCourseDetailPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/travel-plans" element={<TravelPlansPage />} />
            <Route path="/travel-plans/:planId" element={<PlannerPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route
              path="/auth/google/callback"
              element={<GoogleCallbackPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Routes>
        </Suspense>
      </DefaultLayout>
    </BrowserRouter>
  )
}

export default App
