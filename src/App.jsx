import DashboardPage from './pages/DashboardPage'

export default function App() {
  return <DashboardPage />
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
