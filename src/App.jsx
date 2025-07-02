import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DefaultLayout } from './layouts/default-layout'
import { MainPage } from './pages/main'
import { LoginPage } from './pages/login'
import { SignUpPage } from './pages/sign-up'
import { ReviewsPage } from './pages/reviews'
import { ReviewWritePage } from './pages/reviews/write'
import RecommendPage from './pages/recommend'
import { VerifyEmailPage } from './pages/auth/verify-email'
import { GoogleCallbackPage } from './pages/auth/GoogleCallback'
import { ProfilePage } from './pages/profile'
import { ProfileEditPage } from './pages/profile/edit'
import PlansPage from './pages/plans'
import '@/App.css'

function App() {
  return (
    <BrowserRouter>
      <DefaultLayout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/reviews/write" element={<ReviewWritePage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/auth/google/callback"
            element={<GoogleCallbackPage />}
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Routes>
      </DefaultLayout>
    </BrowserRouter>
  )
}

export default App
