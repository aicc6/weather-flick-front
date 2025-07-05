import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from './contexts/AuthContextRTK'
import App from './App.jsx'
import './index.css'
import { Toaster } from './components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <Toaster />
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </>,
)
