import ReactDOM from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import './index.css'
import { Toaster } from './components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <Toaster />
    <AuthProvider>
      <App />
    </AuthProvider>
  </>,
)
