import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState({ email: 'demo@demo.com' })

  if (user) {
    return <DashboardPage user={user} onLogout={() => { setUser(null); setPage('login'); }} />
  }

  if (page === 'signup') {
    return <SignupPage onSignup={(userData) => { setUser(userData); }} onBackToLogin={() => setPage('login')} />
  }

  return <LoginPage onLogin={(userData) => { setUser(userData); }} onGoToSignup={() => setPage('signup')} />
}

// Global styles
if (!document.querySelector('style[data-global]')) {
  const style = document.createElement('style')
  style.setAttribute('data-global', 'true')
  style.textContent = `
    body {
      background: #ffffff;
      color: #1a1a1a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
    }
  `
  document.head.appendChild(style)
}
