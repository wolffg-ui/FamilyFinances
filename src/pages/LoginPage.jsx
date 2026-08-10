import { useState } from 'react'

export default function LoginPage({ onLogin, onGoToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      onLogin({ email, name: email.split('@')[0] })
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        padding: '32px 24px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#000'
        }}>Family Finances</h1>

        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '32px',
          margin: 0
        }}>Gérez vos finances en famille</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#000'
            }}>Email</label>
            <input
              type="email"
              placeholder="vous@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '16px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                backgroundColor: '#f8f8f8',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = '#fff'
                e.target.style.borderColor = '#000'
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f8f8f8'
                e.target.style.borderColor = '#e5e7eb'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#000'
            }}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '16px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                backgroundColor: '#f8f8f8',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = '#fff'
                e.target.style.borderColor = '#000'
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f8f8f8'
                e.target.style.borderColor = '#e5e7eb'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1a1a1a')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#000')}
          >
            {loading ? '⏳ Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px 0' }}>
            Pas de compte ?
          </p>
          <button
            onClick={onGoToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: '#000',
              textDecoration: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: '600'
            }}
          >
            Créer un compte →
          </button>
        </div>
      </div>
    </div>
  )
}
