import { useState, useEffect } from 'react'

export default function DashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ amount: '', category: 'Courses', type: 'debit' })
  const [transactions, setTransactions] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const categories = ['Courses', 'Loyer', 'Transport', 'Loisirs', 'Santé', 'Restaurant', 'Salaire', 'CAF']

  // Charger les données
  useEffect(() => {
    const saved = localStorage.getItem('familyFinances')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.transactions) setTransactions(data.transactions)
      } catch (e) {
        console.error('Erreur:', e)
      }
    }
  }, [])

  // Sauvegarder les données
  useEffect(() => {
    localStorage.setItem('familyFinances', JSON.stringify({ transactions }))
  }, [transactions])

  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear()
  })

  const totalBalance = 0
  const totalIncome = monthTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = monthTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)

  const handleAddTransaction = (e) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (!amount || amount <= 0) {
      alert('Montant invalide!')
      return
    }

    const newTx = {
      id: Math.random(),
      amount,
      category: formData.category,
      type: formData.type,
      date: new Date().toLocaleDateString('fr-FR')
    }

    setTransactions([...transactions, newTx])
    setFormData({ amount: '', category: 'Courses', type: 'debit' })
    setShowForm(false)
  }

  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '80px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Header noir */}
          <div style={{ backgroundColor: '#000', color: '#fff', padding: '24px 16px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Family Finances</h1>
              <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                Déco
              </button>
            </div>
            <div>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '13px', marginBottom: '8px' }}>Patrimoine Net</p>
              <h2 style={{ margin: 0, fontSize: '48px', fontWeight: '700' }}>€0</h2>
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', backgroundColor: '#fff' }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                background: showForm ? '#333' : '#000',
                color: '#fff',
                border: 'none',
                padding: '14px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              ➕ {showForm ? 'Annuler' : 'Ajouter'}
            </button>
            <button style={{ background: '#f0f0f0', color: '#000', border: 'none', padding: '14px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', minHeight: '44px' }}>
              💸 Virement
            </button>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Montant"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', minHeight: '44px' }}
                  autoFocus
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', minHeight: '44px' }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', minHeight: '44px' }}
                >
                  <option value="debit">Dépense</option>
                  <option value="credit">Revenu</option>
                </select>
                <button
                  type="submit"
                  style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', minHeight: '44px' }}
                >
                  ✓ Ajouter
                </button>
              </form>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px' }}>
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', marginBottom: '8px' }}>Revenus</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#059669' }}>€{totalIncome.toFixed(2)}</p>
            </div>
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', marginBottom: '8px' }}>Dépenses</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#d32f2f' }}>€{totalExpenses.toFixed(2)}</p>
            </div>
          </div>

          {/* Transactions */}
          <div style={{ padding: '16px 16px 0' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '600' }}>Transactions</h3>
            {monthTransactions.length === 0 ? (
              <div style={{ background: '#fff', padding: '24px 16px', borderRadius: '12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                Aucune transaction
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {monthTransactions.map(tx => (
                  <div key={tx.id} style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{tx.category}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>{tx.date}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: tx.type === 'credit' ? '#059669' : '#000' }}>
                      {tx.type === 'credit' ? '+' : '-'}€{tx.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPTES */}
      {activeTab === 'accounts' && (
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Comptes</h2>
          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>Compte joint</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>€0</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', zIndex: 999 }}>
        {[
          { id: 'dashboard', icon: '📊', label: 'Accueil' },
          { id: 'accounts', icon: '💳', label: 'Comptes' },
          { id: 'analytics', icon: '📈', label: 'Analytics' },
          { id: 'settings', icon: '⚙️', label: 'Paramètres' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderTop: activeTab === tab.id ? '3px solid #000' : '3px solid transparent',
              color: activeTab === tab.id ? '#000' : '#999',
              fontSize: '10px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              gap: '4px',
              minHeight: '70px'
            }}
          >
            <span style={{ fontSize: '24px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
