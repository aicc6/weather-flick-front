import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DefaultLayout } from './layouts/default-layout'
import { MainPage } from './pages/main'
import { LoginPage } from './pages/login'
import { SignUpPage } from './pages/sign-up'
import { ReviewsPage } from './pages/reviews'
import { ReviewWritePage } from './pages/reviews/write'
import RecommendPage from './pages/recommend'
import RecommendRegionPage from './pages/recommend/region'
import RecommendPeriodPage from './pages/recommend/period'
import RecommendWhoPage from './pages/recommend/who'
import RecommendStylePage from './pages/recommend/style'
import RecommendSchedulePage from './pages/recommend/schedule'
import RecommendResultPage from './pages/recommend/result'
import { VerifyEmailPage } from './pages/auth/verify-email'
import { GoogleCallbackPage } from './pages/auth/GoogleCallback'
import { ProfilePage } from './pages/profile'
import { ProfileEditPage } from './pages/profile/edit'
import { ChangePasswordPage } from './pages/profile/change-password'
import PlannerPage from './pages/planner'
import TravelCoursePage from '@/pages/destinations'
import TravelCourseDetailPage from '@/pages/destinations/detail'
import '@/App.css'

function App() {
  return (
    <BrowserRouter>
      <DefaultLayout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
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
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/auth/google/callback"
            element={<GoogleCallbackPage />}
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Routes>
      </DefaultLayout>
    </BrowserRouter>
  )
}

export default App
