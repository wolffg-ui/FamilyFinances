import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import AddTransactionModal from '../components/AddTransactionModal'
import EditTransactionModal from '../components/EditTransactionModal'
import BudgetModal from '../components/BudgetModal'
import TransactionFilters from '../components/TransactionFilters'
import RecurringTransactionModal from '../components/RecurringTransactionModal'
import CustomCategoriesModal from '../components/CustomCategoriesModal'
import { exportTransactionsToPDF } from '../components/ExportPDF'

export default function DashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showEditTransaction, setShowEditTransaction] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [filterCategory, setFilterCategory] = useState('')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState('date-desc') // date-asc, date-desc, amount-asc, amount-desc, category
  const [searchText, setSearchText] = useState('')

  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState({})
  const [recurringTransactions, setRecurringTransactions] = useState([])
  const [savingsGoal, setSavingsGoal] = useState(null)
  const [showSavingsGoalModal, setShowSavingsGoalModal] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false)
  const [selectedAccountForBalance, setSelectedAccountForBalance] = useState(null)
  const [initialBalanceInput, setInitialBalanceInput] = useState('')
  const [showRecurringListModal, setShowRecurringListModal] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState(null)
  const [editingRecurringForm, setEditingRecurringForm] = useState({})
  const [notification, setNotification] = useState(null)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true')
  const [categories, setCategories] = useState([
    'Courses', 'Loyer', 'Transport', 'Loisirs', 'Santé',
    'Alimentation', 'Électricité', 'Internet', 'Assurance', 'Restaurants',
    'Travail', 'Pôle emploi', 'CAF', 'Autre revenu'
  ])
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Compte Hatice Toklu', balance: 0, initialBalance: 0 },
    { id: 2, name: 'Compte Geoffrey Wolff', balance: 0, initialBalance: 0 },
    { id: 3, name: 'Compte joint', balance: 0, initialBalance: 0 }
  ])
  const [investments] = useState([
    { id: 1, name: 'PEA - Trade Republic', value: 0 },
    { id: 2, name: 'Ethereum', value: 0 }
  ])

  // Charger les données du localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('familyFinances')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.transactions) setTransactions(data.transactions)
        if (data.budgets) setBudgets(data.budgets)
        if (data.categories) setCategories(data.categories)
        if (data.recurringTransactions) setRecurringTransactions(data.recurringTransactions)
        if (data.savingsGoal) setSavingsGoal(data.savingsGoal)
      } catch (e) {
        console.error('Erreur chargement localStorage:', e)
      }
    }
  }, [])

  // Générer les transactions récurrentes automatiquement
  useEffect(() => {
    if (recurringTransactions.length === 0) return

    const today = new Date()
    const todayDay = today.getDate()

    recurringTransactions.forEach(recurring => {
      if (todayDay === recurring.dayOfMonth) {
        // Vérifier si on n'a pas dépassé la date de fin
        if (recurring.endDate && new Date(recurring.endDate) < today) {
          return
        }

        const txDate = today.toLocaleDateString('fr-FR')
        const existingTx = transactions.find(t =>
          t.date === txDate &&
          t.category === recurring.category &&
          t.accountId === recurring.accountId
        )

        if (!existingTx) {
          setTransactions(prev => [...prev, {
            id: Math.random(),
            amount: recurring.amount,
            category: recurring.category,
            accountId: recurring.accountId,
            type: recurring.type,
            date: txDate,
            notes: `[Automatique] ${recurring.name}`
          }])
        }
      }
    })
  }, [recurringTransactions])

  // Sauvegarder dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // Sauvegarder les données dans localStorage quand elles changent
  useEffect(() => {
    const data = {
      transactions,
      budgets,
      categories,
      recurringTransactions,
      savingsGoal
    }
    localStorage.setItem('familyFinances', JSON.stringify(data))
  }, [transactions, budgets, categories, recurringTransactions, savingsGoal])

  // Helper pour les notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Helper pour l'import CSV
  const handleImportCSV = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target?.result
        const lines = csv.split('\n')
        const header = lines[0].split(',')
        let imported = 0

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          const values = lines[i].split(',')
          const tx = {
            date: values[0]?.trim(),
            category: values[1]?.trim(),
            amount: parseFloat(values[2]),
            type: values[3]?.trim() === 'revenu' ? 'credit' : 'debit',
            accountId: parseInt(values[4]) || 1,
            notes: values[5]?.trim() || ''
          }
          if (tx.date && tx.category && !isNaN(tx.amount)) {
            setTransactions(prev => [...prev, { id: Math.random(), ...tx }])
            imported++
          }
        }
        showNotification(`✅ ${imported} transaction(s) importée(s)`, 'success')
      } catch (err) {
        showNotification('❌ Erreur lors de l\'import', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Clôture mensuelle
  const handleCloseMonth = () => {
    if (!confirm(`Clôturer le mois de ${monthName} ? (Archive les données)`)) return
    const monthKey = `archive-${currentMonth.getFullYear()}-${currentMonth.getMonth()}`
    const archive = {
      month: monthName,
      transactions: monthTransactions,
      summary: { income: totalIncome, expenses: totalExpenses, savings }
    }
    const archives = JSON.parse(localStorage.getItem('archives') || '{}')
    archives[monthKey] = archive
    localStorage.setItem('archives', JSON.stringify(archives))
    showNotification('✅ Mois clôturé et archivé', 'success')
  }

  // Récupérer les transactions du mois courant
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth.getMonth() &&
           date.getFullYear() === currentMonth.getFullYear()
  })

  // Appliquer les filtres et recherche
  let filteredTransactions = monthTransactions.filter(t => {
    if (filterCategory && t.category !== filterCategory) return false
    if (filterAccount && t.accountId !== parseInt(filterAccount)) return false
    if (filterType && t.type !== filterType) return false
    if (searchText) {
      const search = searchText.toLowerCase()
      const matchesCategory = t.category.toLowerCase().includes(search)
      const matchesNotes = t.notes && t.notes.toLowerCase().includes(search)
      const matchesAmount = t.amount.toString().includes(search)
      if (!matchesCategory && !matchesNotes && !matchesAmount) return false
    }
    return true
  })

  // Appliquer le tri
  filteredTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.date) - new Date(b.date)
      case 'date-desc':
        return new Date(b.date) - new Date(a.date)
      case 'amount-asc':
        return a.amount - b.amount
      case 'amount-desc':
        return b.amount - a.amount
      case 'category':
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  // Statistiques
  const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0) +
                   investments.reduce((sum, inv) => sum + inv.value, 0)

  const totalIncome = monthTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0

  // Données pour graphiques
  const expensesByCategory = {}
  monthTransactions.forEach(t => {
    if (t.type === 'debit') {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    }
  })

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100
  }))

  const colors = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#e5e5e5']

  // Gestion des transactions
  const handleAddTransaction = (transaction) => {
    const newTx = {
      id: Math.max(...transactions.map(t => t.id), 0) + 1,
      ...transaction,
      notes: transaction.notes || ''
    }
    setTransactions([newTx, ...transactions])
    setShowAddTransaction(false)
    showNotification('✅ Transaction ajoutée', 'success')
  }

  const handleEditTransaction = (updatedTransaction) => {
    const oldTx = transactions.find(t => t.id === updatedTransaction.id)

    if (oldTx.category === 'Transfert') {
      const counterpartTx = transactions.find(t =>
        t.category === 'Transfert' &&
        t.id !== oldTx.id &&
        t.accountId !== oldTx.accountId &&
        Math.abs(t.amount - oldTx.amount) < 0.01 &&
        t.date === oldTx.date
      )

      if (counterpartTx) {
        setTransactions(transactions.map(t => {
          if (t.id === updatedTransaction.id) return updatedTransaction
          if (t.id === counterpartTx.id) {
            return { ...counterpartTx, amount: updatedTransaction.amount }
          }
          return t
        }))
      } else {
        setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t))
      }
    } else {
      setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t))
    }

    setShowEditTransaction(false)
  }

  const handleDeleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id)

    if (tx.category === 'Transfert') {
      const counterpartTx = transactions.find(t =>
        t.category === 'Transfert' &&
        t.id !== tx.id &&
        t.accountId !== tx.accountId &&
        Math.abs(t.amount - tx.amount) < 0.01 &&
        t.date === tx.date
      )
      if (counterpartTx) {
        setTransactions(transactions.filter(t => t.id !== id && t.id !== counterpartTx.id))
      } else {
        setTransactions(transactions.filter(t => t.id !== id))
      }
    } else {
      setTransactions(transactions.filter(t => t.id !== id))
    }
  }

  const handleAddBudget = (budgetData) => {
    setBudgets(budgetData)
    setShowBudgetModal(false)
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'category') setFilterCategory(value)
    if (filterType === 'account') setFilterAccount(value)
    if (filterType === 'type') setFilterType(value)
  }

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1))
  }

  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Récurrences - créer les transactions auto
  const handleAddRecurring = (recurring) => {
    setRecurringTransactions([...recurringTransactions, { ...recurring, id: Math.random() }])
    setShowRecurringModal(false)
    showNotification('✅ Récurrence créée', 'success')
  }

  // Catégories personnalisées
  const handleSaveCategories = (newCategories) => {
    setCategories(newCategories)
    setShowCategoriesModal(false)
  }

  // Graphique comparatif des 3 derniers mois
  const getMonthlyComparison = () => {
    const months = []
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1)
      const monthTx = transactions.filter(t => {
        const txDate = new Date(t.date)
        return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear()
      })
      const income = monthTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
      const expenses = monthTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      months.push({
        name: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenus: income,
        dépenses: expenses
      })
    }
    return months
  }

  // Solde net par compte
  const getAccountNetBalance = (accountId) => {
    const accountTx = monthTransactions.filter(t => t.accountId === accountId)
    const income = accountTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
    const expenses = accountTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
    return { income, expenses, net: income - expenses }
  }

  // Édition des récurrences
  const handleSaveRecurringEdit = () => {
    if (!editingRecurring) return
    setRecurringTransactions(recurringTransactions.map(r =>
      r.id === editingRecurring.id ? { ...r, ...editingRecurringForm } : r
    ))
    setEditingRecurring(null)
    setEditingRecurringForm({})
  }

  // Gestion des objectifs d'épargne
  const handleAddSavingsGoal = () => {
    if (!goalName || !goalAmount || !goalDeadline) return
    setSavingsGoal({
      id: Math.random(),
      name: goalName,
      targetAmount: parseFloat(goalAmount),
      deadline: goalDeadline,
      createdAt: new Date().toISOString()
    })
    setGoalName('')
    setGoalAmount('')
    setGoalDeadline('')
    setShowSavingsGoalModal(false)
  }

  const savingsGoalProgress = savingsGoal ? (savings / savingsGoal.targetAmount) * 100 : 0

  // Gérer le solde initial des comptes
  const handleSetInitialBalance = () => {
    if (!selectedAccountForBalance || !initialBalanceInput) return
    setAccounts(accounts.map(acc =>
      acc.id === selectedAccountForBalance
        ? { ...acc, initialBalance: parseFloat(initialBalanceInput) }
        : acc
    ))
    setSelectedAccountForBalance(null)
    setInitialBalanceInput('')
    setShowInitialBalanceModal(false)
  }

  // Calculer le solde cumulé correctement (initial + toutes les transactions)
  const getAccountBalance = (accountId) => {
    const account = accounts.find(a => a.id === accountId)
    const totalDelta = transactions
      .filter(t => t.accountId === accountId)
      .reduce((sum, t) => {
        return sum + (t.type === 'credit' ? t.amount : -t.amount)
      }, 0)
    return (account?.initialBalance || 0) + totalDelta
  }

  // Vérifier les dépassements de budget
  const getBudgetStatus = (category) => {
    const budget = budgets[category]
    if (!budget) return null
    const spent = monthTransactions
      .filter(t => t.category === category && t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)
    return { budget, spent, exceeded: spent > budget }
  }

  // Obtenir toutes les catégories en dépassement
  const exceededBudgets = Object.keys(budgets)
    .map(cat => ({ ...getBudgetStatus(cat), category: cat }))
    .filter(b => b.exceeded)

  const commonStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    },
    header: {
      backgroundColor: '#000000',
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#fff',
      borderBottom: '1px solid #e5e7eb'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      margin: 0
    },
    logoutBtn: {
      backgroundColor: 'transparent',
      color: '#fff',
      border: '1px solid #666',
      borderRadius: '8px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      fontFamily: 'inherit',
      fontWeight: '500'
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px'
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '32px',
      paddingBottom: '0',
      overflowX: 'auto'
    },
    tab: (isActive) => ({
      padding: '16px 24px',
      border: 'none',
      backgroundColor: 'transparent',
      borderBottom: isActive ? '2px solid #000' : 'transparent',
      color: isActive ? '#000' : '#888',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: isActive ? '600' : '500',
      fontFamily: 'inherit'
    }),
    heading: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '24px',
      color: '#000'
    },
    card: {
      backgroundColor: '#f8f8f8',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      border: '1px solid #e5e7eb'
    },
    button: {
      backgroundColor: '#000',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '12px 24px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      fontFamily: 'inherit'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    }
  }

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'accounts', label: 'Comptes', icon: '💳' },
    { id: 'analytics', label: 'Analyses', icon: '📈' },
    { id: 'budgets', label: 'Budgets', icon: '💰' },
    { id: 'investments', label: 'Investir', icon: '📈' }
  ]

  return (
    <div style={{...commonStyles.container, paddingBottom: '100px'}}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: notification.type === 'success' ? '#059669' : '#d32f2f',
          color: '#fff',
          borderRadius: '6px',
          zIndex: 2000,
          fontSize: '13px',
          fontWeight: '600'
        }}>
          {notification.message}
        </div>
      )}

      {/* Compact Header */}
      <div style={{...commonStyles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px'}}>
        <h1 style={{...commonStyles.title, margin: 0, fontSize: '20px'}}>Family Finances</h1>
        <button onClick={onLogout} style={{...commonStyles.logoutBtn, padding: '6px 12px', fontSize: '12px'}}>
          Déco
        </button>
      </div>

      {/* Content */}
      <div style={commonStyles.content}>
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={commonStyles.heading}>Vue d'ensemble</h2>

            {/* KPIs */}
            <div style={commonStyles.grid}>
              <div style={{...commonStyles.card, backgroundColor: '#000', color: '#fff'}}>
                <p style={{fontSize: '14px', opacity: 0.8, margin: 0}}>Patrimoine Net</p>
                <p style={{fontSize: '36px', fontWeight: '700', margin: '8px 0 0 0'}}>€{netWorth.toLocaleString('fr-FR')}</p>
              </div>
              <div style={{...commonStyles.card, backgroundColor: '#f0f9f0'}}>
                <p style={{fontSize: '14px', color: '#333', margin: 0}}>Revenus (ce mois)</p>
                <p style={{fontSize: '36px', fontWeight: '700', margin: '8px 0 0 0', color: '#059669'}}>€{totalIncome.toFixed(2)}</p>
              </div>
              <div style={{...commonStyles.card, backgroundColor: '#fff5f5'}}>
                <p style={{fontSize: '14px', color: '#333', margin: 0}}>Dépenses (ce mois)</p>
                <p style={{fontSize: '36px', fontWeight: '700', margin: '8px 0 0 0', color: '#d32f2f'}}>€{totalExpenses.toFixed(2)}</p>
              </div>
              <div style={{...commonStyles.card, backgroundColor: '#f5f5ff'}}>
                <p style={{fontSize: '14px', color: '#333', margin: 0}}>💰 Épargne</p>
                <p style={{fontSize: '36px', fontWeight: '700', margin: '8px 0 0 0', color: '#2563eb'}}>€{savings.toFixed(2)}</p>
                <p style={{fontSize: '12px', color: '#666', margin: '8px 0 0 0'}}>Taux: {savingsRate}%</p>
              </div>
            </div>

            {/* Accounts */}
            <h3 style={{fontSize: '18px', fontWeight: '700', marginTop: '32px', marginBottom: '16px'}}>Comptes</h3>
            <div style={commonStyles.grid}>
              {accounts.map(account => (
                <div key={account.id} style={commonStyles.card}>
                  <p style={{fontSize: '14px', color: '#666', margin: 0}}>{account.name}</p>
                  <p style={{fontSize: '28px', fontWeight: '700', margin: '8px 0 0 0'}}>€{getAccountBalance(account.id).toLocaleString('fr-FR')}</p>
                </div>
              ))}
            </div>

            {/* Investments */}
            <h3 style={{fontSize: '18px', fontWeight: '700', marginTop: '32px', marginBottom: '16px'}}>Investissements</h3>
            <div style={commonStyles.grid}>
              {investments.map(inv => (
                <div key={inv.id} style={commonStyles.card}>
                  <p style={{fontSize: '14px', color: '#666', margin: 0}}>{inv.name}</p>
                  <p style={{fontSize: '28px', fontWeight: '700', margin: '8px 0 0 0'}}>€{inv.value.toLocaleString('fr-FR')}</p>
                </div>
              ))}
            </div>

            {/* Objectifs d'épargne */}
            <div style={{marginTop: '32px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h3 style={{fontSize: '18px', fontWeight: '700', margin: 0}}>🎯 Objectifs d'épargne</h3>
                <button onClick={() => setShowSavingsGoalModal(true)} style={{...commonStyles.button, padding: '8px 12px', fontSize: '14px'}}>
                  + Ajouter
                </button>
              </div>
              {savingsGoal ? (
                <div style={commonStyles.card}>
                  <p style={{fontSize: '16px', fontWeight: '600', margin: 0}}>{savingsGoal.name}</p>
                  <div style={{marginTop: '12px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#666'}}>
                      <span>Progression</span>
                      <span>{Math.round(savingsGoalProgress)}%</span>
                    </div>
                    <div style={{width: '100%', height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden'}}>
                      <div style={{width: `${Math.min(savingsGoalProgress, 100)}%`, height: '100%', backgroundColor: '#000'}}></div>
                    </div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', fontSize: '12px'}}>
                    <div>
                      <p style={{color: '#666', margin: 0}}>Épargne actuelle</p>
                      <p style={{fontSize: '18px', fontWeight: '700', margin: '4px 0 0 0', color: '#059669'}}>€{savings.toFixed(2)}</p>
                    </div>
                    <div>
                      <p style={{color: '#666', margin: 0}}>Objectif</p>
                      <p style={{fontSize: '18px', fontWeight: '700', margin: '4px 0 0 0'}}>€{savingsGoal.targetAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSavingsGoal(null)}
                    style={{width: '100%', marginTop: '12px', padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'}}
                  >
                    Supprimer l'objectif
                  </button>
                </div>
              ) : (
                <div style={{...commonStyles.card, textAlign: 'center', color: '#999'}}>
                  <p style={{margin: 0}}>Aucun objectif d'épargne défini</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <div>
                <h2 style={commonStyles.heading}>Comptes</h2>
                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                  <button onClick={() => changeMonth(-1)} style={{...commonStyles.button, padding: '8px 12px', fontSize: '14px'}}>←</button>
                  <span style={{fontSize: '16px', fontWeight: '600', minWidth: '150px', textAlign: 'center'}}>{monthName}</span>
                  <button onClick={() => changeMonth(1)} style={{...commonStyles.button, padding: '8px 12px', fontSize: '14px'}}>→</button>
                </div>
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                <button onClick={() => setShowAddTransaction(true)} style={commonStyles.button}>
                  + Ajouter une transaction
                </button>
                <button onClick={() => setShowRecurringModal(true)} style={{...commonStyles.button, backgroundColor: '#1a1a1a', border: '1px solid #e5e7eb'}}>
                  🔄 Ajouter récurrente
                </button>
                {recurringTransactions.length > 0 && (
                  <button onClick={() => setShowRecurringListModal(true)} style={{...commonStyles.button, backgroundColor: '#1a1a1a', border: '1px solid #e5e7eb'}}>
                    📋 Gérer ({recurringTransactions.length})
                  </button>
                )}
                <button onClick={() => exportTransactionsToPDF(monthTransactions, currentMonth.getMonth(), currentMonth.getFullYear(), budgets)} style={{...commonStyles.button, backgroundColor: '#2a2a2a', border: '1px solid #e5e7eb'}}>
                  📥 PDF
                </button>
                <button onClick={() => setShowCategoriesModal(true)} style={{...commonStyles.button, backgroundColor: '#404040', border: '1px solid #e5e7eb'}}>
                  🏷️ Catégories
                </button>
                <label style={{...commonStyles.button, padding: '8px 16px', fontSize: '14px', cursor: 'pointer', backgroundColor: '#333', border: '1px solid #e5e7eb'}}>
                  📥 Import CSV
                  <input type="file" accept=".csv" onChange={handleImportCSV} style={{display: 'none'}} />
                </label>
                <button onClick={handleCloseMonth} style={{...commonStyles.button, backgroundColor: '#666', border: '1px solid #e5e7eb'}}>
                  🔒 Clôturer mois
                </button>
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{fontSize: '16px', fontWeight: '600', margin: 0}}>Soldes</h3>
              <button onClick={() => setShowInitialBalanceModal(true)} style={{...commonStyles.button, padding: '8px 12px', fontSize: '12px'}}>
                ⚙️ Solde initial
              </button>
            </div>
            <div style={commonStyles.grid}>
              {accounts.map(account => (
                <div key={account.id} style={commonStyles.card}>
                  <p style={{fontSize: '16px', fontWeight: '600', margin: 0}}>{account.name}</p>
                  <p style={{fontSize: '32px', fontWeight: '700', margin: '12px 0 0 0'}}>€{getAccountBalance(account.id).toLocaleString('fr-FR')}</p>
                  {account.initialBalance > 0 && (
                    <p style={{fontSize: '12px', color: '#999', margin: '8px 0 0 0'}}>Initial: €{account.initialBalance.toLocaleString('fr-FR')}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Recherche */}
            <div style={{marginBottom: '16px'}}>
              <input
                type="text"
                placeholder="🔍 Rechercher (catégorie, notes, montant...)"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  backgroundColor: '#f8f8f8'
                }}
              />
            </div>

            {/* Filtres et Tri */}
            <h3 style={{fontSize: '18px', fontWeight: '700', marginBottom: '16px'}}>Filtrer et trier</h3>
            <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
              <div style={{flex: 1}}>
                <TransactionFilters onFilterChange={handleFilterChange} accounts={accounts} />
              </div>
              <div style={{flex: 0.4}}>
                <label style={{fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px'}}>Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="date-desc">📅 Date (récent)</option>
                  <option value="date-asc">📅 Date (ancien)</option>
                  <option value="amount-desc">💰 Montant (↓)</option>
                  <option value="amount-asc">💰 Montant (↑)</option>
                  <option value="category">🏷️ Catégorie</option>
                </select>
              </div>
            </div>

            {/* Transactions */}
            {filteredTransactions.length > 0 && (
              <div>
                <h3 style={{fontSize: '18px', fontWeight: '700', marginBottom: '16px'}}>Transactions ({filteredTransactions.length})</h3>
                {filteredTransactions.map(tx => (
                  <div key={tx.id} style={{...commonStyles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <p style={{fontSize: '16px', fontWeight: '600', margin: 0}}>{tx.category}</p>
                      <p style={{fontSize: '12px', color: '#666', margin: '4px 0 0 0'}}>{tx.date}</p>
                      {tx.notes && <p style={{fontSize: '12px', color: '#888', margin: '4px 0 0 0', fontStyle: 'italic'}}>📝 {tx.notes}</p>}
                    </div>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '16px'}}>
                      <p style={{fontSize: '20px', fontWeight: '700', margin: 0, color: tx.type === 'debit' ? '#d32f2f' : '#059669', minWidth: '100px', textAlign: 'right'}}>
                        {tx.type === 'debit' ? '-' : '+'}€{tx.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => { setEditingTransaction(tx); setShowEditTransaction(true); }}
                        style={{...commonStyles.button, padding: '8px 12px', fontSize: '12px'}}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        style={{...commonStyles.button, backgroundColor: '#d32f2f', padding: '8px 12px', fontSize: '12px'}}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredTransactions.length === 0 && monthTransactions.length > 0 && (
              <div style={commonStyles.card}>
                <p style={{color: '#666', textAlign: 'center', margin: 0}}>Aucune transaction ne correspond aux filtres</p>
              </div>
            )}

            {monthTransactions.length === 0 && (
              <div style={commonStyles.card}>
                <p style={{color: '#666', textAlign: 'center', margin: 0}}>Aucune transaction pour ce mois</p>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={commonStyles.heading}>Analyses - {monthName}</h2>

            {pieData.length > 0 && (
              <div style={{...commonStyles.card, backgroundColor: '#fff'}}>
                <h3 style={{fontSize: '18px', fontWeight: '700', margin: '0 0 24px 0'}}>Dépenses par catégorie</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({name, value}) => `${name}: €${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Résumé */}
            <div style={{...commonStyles.card, marginTop: '24px'}}>
              <h3 style={{fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0'}}>Résumé mensuel</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'}}>
                <div>
                  <p style={{fontSize: '12px', color: '#666', margin: 0}}>Total revenus</p>
                  <p style={{fontSize: '24px', fontWeight: '700', color: '#059669', margin: '8px 0 0 0'}}>€{totalIncome.toFixed(2)}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: '#666', margin: 0}}>Total dépenses</p>
                  <p style={{fontSize: '24px', fontWeight: '700', color: '#d32f2f', margin: '8px 0 0 0'}}>€{totalExpenses.toFixed(2)}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: '#666', margin: 0}}>Épargne</p>
                  <p style={{fontSize: '24px', fontWeight: '700', color: '#2563eb', margin: '8px 0 0 0'}}>€{savings.toFixed(2)}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: '#666', margin: 0}}>Taux d'épargne</p>
                  <p style={{fontSize: '24px', fontWeight: '700', color: '#2563eb', margin: '8px 0 0 0'}}>{savingsRate}%</p>
                </div>
              </div>
            </div>

            {/* Comparaison des 3 derniers mois */}
            {getMonthlyComparison().length > 0 && (
              <div style={{...commonStyles.card, marginTop: '24px', backgroundColor: '#fff'}}>
                <h3 style={{fontSize: '18px', fontWeight: '700', margin: '0 0 24px 0'}}>Tendance des 3 derniers mois</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getMonthlyComparison()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenus" stroke="#059669" strokeWidth={2} />
                    <Line type="monotone" dataKey="dépenses" stroke="#d32f2f" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Solde net par compte */}
            <div style={{...commonStyles.card, marginTop: '24px'}}>
              <h3 style={{fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0'}}>Solde net par compte</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'}}>
                {accounts.map(account => {
                  const balance = getAccountNetBalance(account.id)
                  return (
                    <div key={account.id} style={{
                      padding: '16px',
                      backgroundColor: '#f8f8f8',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{fontSize: '13px', color: '#666', margin: '0 0 8px 0'}}>{account.name}</p>
                      <p style={{fontSize: '14px', fontWeight: '600', color: '#059669', margin: '4px 0'}}>Revenus: €{balance.income.toFixed(2)}</p>
                      <p style={{fontSize: '14px', fontWeight: '600', color: '#d32f2f', margin: '4px 0'}}>Dépenses: €{balance.expenses.toFixed(2)}</p>
                      <p style={{fontSize: '16px', fontWeight: '700', color: '#2563eb', margin: '8px 0 0 0'}}>Solde: €{balance.net.toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* BUDGETS TAB */}
        {activeTab === 'budgets' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <h2 style={commonStyles.heading}>Budgets - {monthName}</h2>
              <button onClick={() => setShowBudgetModal(true)} style={commonStyles.button}>
                ⚙️ Gérer les budgets
              </button>
            </div>

            {/* Alertes budgétaires */}
            {exceededBudgets.length > 0 && (
              <div style={{...commonStyles.card, backgroundColor: '#fff5f5', borderLeft: '4px solid #d32f2f', marginBottom: '24px'}}>
                <p style={{fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0', color: '#d32f2f'}}>⚠️ Budgets dépassés</p>
                {exceededBudgets.map(item => (
                  <div key={item.category} style={{fontSize: '14px', margin: '8px 0', color: '#333'}}>
                    <strong>{item.category}</strong>: €{item.spent.toFixed(2)} dépensé(s) pour €{item.budget.toFixed(2)} budgété
                    <span style={{color: '#d32f2f', fontWeight: '600'}}> (+€{(item.spent - item.budget).toFixed(2)} en dépassement)</span>
                  </div>
                ))}
              </div>
            )}

            {Object.keys(budgets).length > 0 ? (
              <div style={commonStyles.grid}>
                {Object.entries(budgets).map(([category, budget]) => {
                  const spent = Object.entries(expensesByCategory).find(([cat]) => cat === category)?.[1] || 0
                  const percentage = Math.min((spent / budget) * 100, 100)
                  const isOverBudget = spent > budget

                  return (
                    <div key={category} style={commonStyles.card}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                        <p style={{fontSize: '16px', fontWeight: '600', margin: 0}}>{category}</p>
                        <p style={{fontSize: '12px', color: isOverBudget ? '#d32f2f' : '#666', margin: 0}}>
                          €{spent.toFixed(2)} / €{budget.toFixed(2)}
                        </p>
                      </div>
                      <div style={{width: '100%', height: '8px', backgroundColor: '#e5e5e5', borderRadius: '4px', overflow: 'hidden'}}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: isOverBudget ? '#d32f2f' : '#059669',
                            transition: 'width 0.3s'
                          }}
                        />
                      </div>
                      {isOverBudget && (
                        <p style={{fontSize: '12px', color: '#d32f2f', margin: '8px 0 0 0'}}>
                          ⚠️ Dépassement: €{(spent - budget).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={commonStyles.card}>
                <p style={{color: '#666', textAlign: 'center', margin: 0}}>Aucun budget défini. Cliquez sur "⚙️ Gérer les budgets" pour en ajouter.</p>
              </div>
            )}
          </div>
        )}

        {/* INVESTMENTS TAB */}
        {activeTab === 'investments' && (
          <div>
            <h2 style={commonStyles.heading}>Investissements</h2>
            <div style={commonStyles.grid}>
              {investments.map(inv => (
                <div key={inv.id} style={commonStyles.card}>
                  <p style={{fontSize: '14px', color: '#666', margin: 0}}>{inv.name}</p>
                  <p style={{fontSize: '32px', fontWeight: '700', margin: '12px 0 0 0'}}>€{inv.value.toLocaleString('fr-FR')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddTransaction && (
        <AddTransactionModal
          onClose={() => setShowAddTransaction(false)}
          onAdd={handleAddTransaction}
          accounts={accounts}
          categories={categories}
        />
      )}

      {showEditTransaction && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setShowEditTransaction(false)}
          onSave={handleEditTransaction}
          accounts={accounts}
        />
      )}

      {showBudgetModal && (
        <BudgetModal
          currentBudgets={budgets}
          onClose={() => setShowBudgetModal(false)}
          onSave={handleAddBudget}
        />
      )}

      {showRecurringModal && (
        <RecurringTransactionModal
          onClose={() => setShowRecurringModal(false)}
          onAdd={handleAddRecurring}
          accounts={accounts}
        />
      )}

      {showCategoriesModal && (
        <CustomCategoriesModal
          categories={categories}
          onClose={() => setShowCategoriesModal(false)}
          onSave={handleSaveCategories}
        />
      )}

      {showSavingsGoalModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            width: '100%',
            backgroundColor: '#fff',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Nouvel objectif d'épargne</h2>
              <button onClick={() => setShowSavingsGoalModal(false)} style={{
                fontSize: '24px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#666'
              }}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddSavingsGoal(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
                  Nom de l'objectif
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vacances, Économies..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f8f8'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
                  Montant cible (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f8f8'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
                  Date limite
                </label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f8f8'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowSavingsGoalModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f8f8f8',
                    color: '#000',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '16px'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#000',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '16px'
                  }}
                >
                  Créer l'objectif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInitialBalanceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            width: '100%',
            backgroundColor: '#fff',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Définir solde initial</h2>
              <button onClick={() => setShowInitialBalanceModal(false)} style={{
                fontSize: '24px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#666'
              }}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSetInitialBalance(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
                  Sélectionner un compte
                </label>
                <select
                  value={selectedAccountForBalance || ''}
                  onChange={(e) => setSelectedAccountForBalance(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f8f8'
                  }}
                  required
                >
                  <option value="">Choisir un compte...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
                  Montant initial (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={initialBalanceInput}
                  onChange={(e) => setInitialBalanceInput(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f8f8'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowInitialBalanceModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f8f8f8',
                    color: '#000',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '16px'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#000',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '16px'
                  }}
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecurringListModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            width: '100%',
            backgroundColor: '#fff',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Transactions récurrentes</h2>
              <button onClick={() => setShowRecurringListModal(false)} style={{
                fontSize: '24px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#666'
              }}>✕</button>
            </div>

            {!editingRecurring ? (
              recurringTransactions.map(recurring => (
                <div key={recurring.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>{recurring.name}</p>
                      <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
                        {recurring.type === 'credit' ? '+' : '-'}€{recurring.amount.toFixed(2)} • Jour {recurring.dayOfMonth}
                      </p>
                      <p style={{ fontSize: '12px', color: '#999', margin: '4px 0' }}>
                        {accounts.find(a => a.id === recurring.accountId)?.name}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setEditingRecurring(recurring)
                          setEditingRecurringForm(recurring)
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        ✏️ Éditer
                      </button>
                      <button
                        onClick={() => {
                          setRecurringTransactions(recurringTransactions.filter(r => r.id !== recurring.id))
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#d32f2f',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f8f8',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>Éditer la récurrence</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Nom"
                    value={editingRecurringForm.name || ''}
                    onChange={(e) => setEditingRecurringForm({ ...editingRecurringForm, name: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Montant"
                    value={editingRecurringForm.amount || ''}
                    onChange={(e) => setEditingRecurringForm({ ...editingRecurringForm, amount: parseFloat(e.target.value) })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Jour du mois"
                    value={editingRecurringForm.dayOfMonth || ''}
                    onChange={(e) => setEditingRecurringForm({ ...editingRecurringForm, dayOfMonth: parseInt(e.target.value) })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingRecurring(null)
                        setEditingRecurringForm({})
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveRecurringEdit}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        zIndex: 999,
        height: '70px',
        paddingBottom: '8px'
      }}>
        {navTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '10px',
              color: activeTab === tab.id ? '#000' : '#999',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'color 0.2s'
            }}
          >
            <span style={{fontSize: '24px'}}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
