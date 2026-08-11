import { useState, useEffect } from 'react'
import AddTransactionModal from '../components/AddTransactionModal'
import EditTransactionModal from '../components/EditTransactionModal'

export default function DashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showEditTransaction, setShowEditTransaction] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([
    'Courses', 'Loyer', 'Transport', 'Loisirs', 'Santé',
    'Alimentation', 'Électricité', 'Internet', 'Assurance', 'Restaurants',
    'Travail', 'Pôle emploi', 'CAF', 'Autre revenu'
  ])
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Hatice Toklu', balance: 0, initialBalance: 0 },
    { id: 2, name: 'Geoffrey Wolff', balance: 0, initialBalance: 0 },
    { id: 3, name: 'Compte joint', balance: 0, initialBalance: 0 }
  ])
  const [notification, setNotification] = useState(null)

  // Charger les données
  useEffect(() => {
    const saved = localStorage.getItem('familyFinances')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.transactions) setTransactions(data.transactions)
        if (data.categories) setCategories(data.categories)
      } catch (e) {
        console.error('Erreur:', e)
      }
    }
  }, [])

  // Sauvegarder les données
  useEffect(() => {
    localStorage.setItem('familyFinances', JSON.stringify({
      transactions,
      categories
    }))
  }, [transactions, categories])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth.getMonth() &&
           date.getFullYear() === currentMonth.getFullYear()
  })

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  const totalIncome = monthTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = monthTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)

  const handleAddTransaction = (data) => {
    setTransactions([...transactions, { id: Math.random(), ...data }])
    setShowAddTransaction(false)
    showNotification('✅ Transaction ajoutée')
  }

  const handleEditTransaction = (data) => {
    setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...data, id: editingTransaction.id } : t))
    setEditingTransaction(null)
    setShowEditTransaction(false)
    showNotification('✅ Transaction modifiée')
  }

  const handleDeleteTransaction = (id) => {
    if (confirm('Supprimer?')) {
      setTransactions(transactions.filter(t => t.id !== id))
      showNotification('✅ Supprimée')
    }
  }

  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      paddingBottom: '80px',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: notification.type === 'success' ? '#059669' : '#d32f2f',
          color: '#fff',
          borderRadius: '8px',
          zIndex: 2000,
          fontSize: '13px',
          fontWeight: '600'
        }}>
          {notification.message}
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Header avec solde */}
          <div style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '24px 16px 32px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Family Finances</h1>
              <button onClick={onLogout} style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Déco
              </button>
            </div>

            {/* Solde principal */}
            <div>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '13px', marginBottom: '8px' }}>Patrimoine Net</p>
              <h2 style={{ margin: 0, fontSize: '48px', fontWeight: '700' }}>
                €{totalBalance.toLocaleString('fr-FR')}
              </h2>
            </div>
          </div>

          {/* Buttons d'action */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#fff'
          }}>
            <button onClick={() => setShowAddTransaction(true)} style={{
              background: '#000',
              color: '#fff',
              border: 'none',
              padding: '14px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px'
            }}>
              ➕ Ajouter
            </button>
            <button style={{
              background: '#f0f0f0',
              color: '#000',
              border: 'none',
              padding: '14px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px'
            }}>
              💸 Virement
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '16px'
          }}>
            <div style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', marginBottom: '8px' }}>Revenus</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                €{totalIncome.toFixed(2)}
              </p>
            </div>
            <div style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', marginBottom: '8px' }}>Dépenses</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#d32f2f' }}>
                €{totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Transactions */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Transactions</h3>
              <button onClick={() => {
                const prev = currentMonth
                prev.setMonth(prev.getMonth() - 1)
                setCurrentMonth(new Date(prev))
              }} style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                color: '#666',
                cursor: 'pointer',
                padding: '4px 8px'
              }}>
                ← {monthName}
              </button>
            </div>

            {monthTransactions.length === 0 ? (
              <div style={{
                background: '#fff',
                padding: '24px 16px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#999',
                fontSize: '13px'
              }}>
                Aucune transaction ce mois
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {monthTransactions.map(tx => (
                  <div key={tx.id} style={{
                    background: '#fff',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }} onClick={() => {
                    setEditingTransaction(tx)
                    setShowEditTransaction(true)
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{tx.category}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>
                        {new Date(tx.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '700',
                      color: tx.type === 'credit' ? '#059669' : '#000'
                    }}>
                      {tx.type === 'credit' ? '+' : '-'}€{tx.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACCOUNTS TAB */}
      {activeTab === 'accounts' && (
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Comptes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{
                background: '#fff',
                padding: '16px',
                borderRadius: '12px'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{acc.name}</p>
                <p style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: '700' }}>
                  €{(acc.balance || 0).toLocaleString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Analyses</h2>
          <div style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#999'
          }}>
            Bientôt disponible
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Paramètres</h2>
          <div style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#999'
          }}>
            Bientôt disponible
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        zIndex: 999
      }}>
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

      {/* Modals */}
      {showAddTransaction && (
        <AddTransactionModal
          onClose={() => setShowAddTransaction(false)}
          onAdd={handleAddTransaction}
          categories={categories}
          accounts={accounts}
        />
      )}

      {showEditTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setEditingTransaction(null)
            setShowEditTransaction(false)
          }}
          onSave={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          categories={categories}
          accounts={accounts}
        />
      )}
    </div>
  )
}
