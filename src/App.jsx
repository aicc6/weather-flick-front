import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DefaultLayout } from './components/layouts/default-layout'
import { MainPage } from './components/pages/main'
import { LoginPage } from './components/pages/login'
import { SignUpPage } from './components/pages/sign-up'
import { ReviewsPage } from './components/pages/reviews'
import { ReviewWritePage } from './components/pages/reviews/write'
import RecommendPage from './components/pages/recommend'
import { VerifyEmailPage } from './components/pages/auth/verify-email'
import { ProfilePage } from './components/pages/profile'
import { ProfileEditPage } from './components/pages/profile/edit'
import PlansPage from './components/pages/plans'
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Routes>
      </DefaultLayout>
    </BrowserRouter>
  )
}

export default App
