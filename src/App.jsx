import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DefaultLayout } from './components/layouts/default-layout'
import { MainPage } from './components/pages/main'
import { LoginPage } from './components/pages/login'
import { SignUpPage } from './components/pages/sign-up'
import { ReviewsPage } from './components/pages/reviews'
import { ReviewWritePage } from './components/pages/reviews/write'
import RecommendPage from './components/pages/recommend'
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
        </Routes>
      </DefaultLayout>
    </BrowserRouter>
  )
}

export default App
