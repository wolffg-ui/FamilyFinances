import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Logo from '../components/Logo'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('home')
  const [transactions, setTransactions] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Comptes
  const accounts = [
    { id: 'joint', name: 'Compte Joint', icon: '💑' },
    { id: 'hatice', name: 'Compte Hatice Toklu', icon: '👩' },
    { id: 'geoffrey', name: 'Compte Geoffrey', icon: '👨' },
    { id: 'lep', name: 'Livret D\'épargne (LEP) Geoffrey', icon: '🏦' },
    { id: 'crypto', name: 'Trade Republic - Crypto', icon: '🪙' },
    { id: 'pea', name: 'Trade Republic - PEA', icon: '📈' },
    { id: 'bourse', name: 'Trade Republic - Bourse', icon: '💼' }
  ]
  const [activeAccount, setActiveAccount] = useState(() => {
    try {
      const saved = localStorage.getItem('familyFinances_activeAccount')
      return saved || 'joint'
    } catch {
      return 'joint'
    }
  })

  // Formulaire
  const [showForm, setShowForm] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showInternalTransfer, setShowInternalTransfer] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Courses')
  const [customCategory, setCustomCategory] = useState('')
  const [type, setType] = useState('debit')
  const [transferAmount, setTransferAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [internalTransferAmount, setInternalTransferAmount] = useState('')
  const [targetAccount, setTargetAccount] = useState('')

  // Édition
  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editCustomCategory, setEditCustomCategory] = useState('')
  const [editType, setEditType] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')

  const categories = ['Courses', 'Loyer', 'Transport', 'Loisirs', 'Restaurant', 'Santé', 'Salaire', 'CAF', 'Virement interne', 'Autre']

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('familyFinances_transactions')
    if (saved) {
      try {
        setTransactions(JSON.parse(saved))
        console.log('✅ Transactions chargées du localStorage')
      } catch (e) {
        console.error('Erreur chargement transactions:', e)
      }
    } else {
      console.log('ℹ️ Aucune transaction sauvegardée')
    }
  }, [])

  // Sauvegarder les transactions dans localStorage
  useEffect(() => {
    localStorage.setItem('familyFinances_transactions', JSON.stringify(transactions))
    console.log('✅ Transactions sauvegardées dans localStorage')
  }, [transactions])

  // Sauvegarder le compte actif dans localStorage
  useEffect(() => {
    localStorage.setItem('familyFinances_activeAccount', activeAccount)
    console.log('✅ Compte actif sauvegardé:', activeAccount)
  }, [activeAccount])

  // Ajouter une transaction
  const handleAddTransaction = (e) => {
    e.preventDefault()

    const parsedAmount = parseFloat(amount)

    if (!amount || amount.trim() === '') {
      alert('❌ Veuillez entrer un montant')
      return
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('❌ Montant invalide (doit être > 0)')
      return
    }

    // Utiliser la catégorie personnalisée si "Autre" est sélectionné
    const finalCategory = category === 'Autre' ? (customCategory.trim() || 'Autre') : category

    if (category === 'Autre' && !customCategory.trim()) {
      alert('❌ Veuillez entrer un nom de dépense personnalisé')
      return
    }

    // Convertir la date de YYYY-MM-DD à DD/MM/YYYY
    const [year, month, day] = date.split('-')
    const formattedDate = `${day}/${month}/${year}`

    const newTransaction = {
      id: Date.now(),
      amount: parsedAmount,
      category: finalCategory,
      description: description.trim() || '',
      type,
      date: formattedDate,
      timestamp: Date.now(),
      account: activeAccount
    }

    setTransactions([...transactions, newTransaction])

    setAmount('')
    setCategory('Courses')
    setCustomCategory('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setType('debit')
    setShowForm(false)

    alert('✅ Transaction ajoutée!')
  }

  // Ouvrir l'édition
  const handleEditTransaction = (tx) => {
    setEditingId(tx.id)
    setEditAmount(tx.amount.toString())
    setEditCategory(tx.category === 'Virement' ? 'Courses' : tx.category)
    setEditType(tx.type)
    setEditDescription(tx.description || '')

    // Convertir la date de DD/MM/YYYY à YYYY-MM-DD
    const [day, month, year] = tx.date.split('/')
    setEditDate(`${year}-${month}-${day}`)

    // Si la catégorie est personnalisée, la mettre dans customCategory
    const isCustom = !categories.includes(tx.category) && tx.category !== 'Virement'
    if (isCustom) {
      setEditCustomCategory(tx.category)
      setEditCategory('Autre')
    } else {
      setEditCustomCategory('')
    }
  }

  // Sauvegarder l'édition
  const handleSaveEdit = () => {
    const parsedAmount = parseFloat(editAmount)

    if (!editAmount || editAmount.trim() === '') {
      alert('❌ Veuillez entrer un montant')
      return
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('❌ Montant invalide (doit être > 0)')
      return
    }

    const finalCategory = editCategory === 'Autre' ? (editCustomCategory.trim() || 'Autre') : editCategory

    if (editCategory === 'Autre' && !editCustomCategory.trim()) {
      alert('❌ Veuillez entrer un nom de dépense personnalisé')
      return
    }

    // Convertir la date de YYYY-MM-DD à DD/MM/YYYY
    const [year, month, day] = editDate.split('-')
    const formattedDate = `${day}/${month}/${year}`

    setTransactions(transactions.map(t =>
      t.id === editingId
        ? { ...t, amount: parsedAmount, category: finalCategory, type: editType, description: editDescription.trim() || '', date: formattedDate }
        : t
    ))

    setEditingId(null)
    setEditAmount('')
    setEditCategory('')
    setEditCustomCategory('')
    setEditType('')
    setEditDescription('')
    setEditDate('')
    alert('✅ Transaction modifiée!')
  }

  // Supprimer une transaction
  const handleDeleteTransaction = (id) => {
    if (confirm('Supprimer cette transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id))
    }
  }

  // Virement (transfert d'argent)
  const handleTransfer = (e) => {
    e.preventDefault()

    const parsedAmount = parseFloat(transferAmount)

    if (!transferAmount || transferAmount.trim() === '') {
      alert('❌ Veuillez entrer un montant')
      return
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('❌ Montant invalide (doit être > 0)')
      return
    }

    const newTransaction = {
      id: Date.now(),
      amount: parsedAmount,
      category: 'Virement',
      type: 'debit',
      date: new Date().toLocaleDateString('fr-FR'),
      timestamp: Date.now(),
      account: activeAccount
    }

    setTransactions([...transactions, newTransaction])
    setTransferAmount('')
    setShowTransfer(false)
    alert('✅ Virement effectué!')
  }

  // Virement interne entre comptes
  const handleInternalTransfer = (e) => {
    e.preventDefault()

    if (!targetAccount) {
      alert('❌ Veuillez sélectionner un compte destinataire')
      return
    }

    if (targetAccount === activeAccount) {
      alert('❌ Le compte destinataire doit être différent du compte source')
      return
    }

    const parsedAmount = parseFloat(internalTransferAmount)

    if (!internalTransferAmount || internalTransferAmount.trim() === '') {
      alert('❌ Veuillez entrer un montant')
      return
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('❌ Montant invalide (doit être > 0)')
      return
    }

    const now = new Date().toLocaleDateString('fr-FR')
    const timestamp = Date.now()

    // Transaction de débit du compte source
    const debitTransaction = {
      id: timestamp,
      amount: parsedAmount,
      category: 'Virement interne',
      description: `Virement vers ${accounts.find(a => a.id === targetAccount)?.name}`,
      type: 'debit',
      date: now,
      timestamp,
      account: activeAccount
    }

    // Transaction de crédit du compte destinataire
    const creditTransaction = {
      id: timestamp + 1,
      amount: parsedAmount,
      category: 'Virement interne',
      description: `Virement depuis ${accounts.find(a => a.id === activeAccount)?.name}`,
      type: 'credit',
      date: now,
      timestamp,
      account: targetAccount
    }

    setTransactions([...transactions, debitTransaction, creditTransaction])
    setInternalTransferAmount('')
    setTargetAccount('')
    setShowInternalTransfer(false)
    alert('✅ Virement interne effectué!')
  }

  // Transactions du mois courant pour le compte actif
  const monthTransactions = transactions.filter(t => {
    const [day, month, year] = t.date.split('/')
    const tDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return tDate.getMonth() === currentMonth.getMonth() &&
           tDate.getFullYear() === currentMonth.getFullYear() &&
           t.account === activeAccount
  })

  // Calculs
  const totalIncome = monthTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Solde total de tous les comptes
  const getTotalBalance = () => {
    const accountBalances = accounts.map(acc => {
      const accTransactions = transactions.filter(t => t.account === acc.id)
      const income = accTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
      const expenses = accTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      return income - expenses
    })
    return accountBalances.reduce((sum, b) => sum + b, 0)
  }

  const totalBalance = getTotalBalance()

  // Calcul des soldes par personne
  const getHaticeBalance = () => {
    const accTransactions = transactions.filter(t => t.account === 'hatice')
    const income = accTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
    const expenses = accTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
    return income - expenses
  }

  const getGeoffreyBalance = () => {
    // Geoffrey: geoffrey + lep + crypto + pea + bourse (SANS joint et SANS hatice)
    const geoffreyAccounts = ['geoffrey', 'lep', 'crypto', 'pea', 'bourse']
    const accTransactions = transactions.filter(t => geoffreyAccounts.includes(t.account))
    const income = accTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
    const expenses = accTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
    return income - expenses
  }

  const haticeBalance = getHaticeBalance()
  const geoffreyBalance = getGeoffreyBalance()

  // Données pour les graphiques
  const categoryData = {}
  monthTransactions.forEach(t => {
    if (t.type === 'debit') {
      categoryData[t.category] = (categoryData[t.category] || 0) + t.amount
    }
  })

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }))

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']

  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // ===== RENDER CONTENT BASED ON ACTIVE TAB =====
  let content = null

  // ===== HOME TAB =====
  if (activeTab === 'home') {
    content = (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f3ff', paddingBottom: '100px' }}>
        {/* Header Premium */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
          padding: '32px 20px',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2)'
        }}>
          <Logo />

          {/* Soldes par Personne */}
          <div style={{ marginTop: '20px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Solde Hatice */}
            <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>👩 Hatice Toklu</p>
              <p style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: '900' }}>
                €{haticeBalance.toFixed(2)}
              </p>
            </div>

            {/* Solde Geoffrey */}
            <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>👨 Geoffrey Wolff</p>
              <p style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: '900' }}>
                €{geoffreyBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Sélecteur de Compte */}
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Compte</p>
            <select
              value={activeAccount}
              onChange={(e) => setActiveAccount(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.icon} {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Balance Hero */}
          <div style={{ marginTop: '32px' }}>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Solde Actuel</p>
            <h2 style={{
              margin: 0,
              fontSize: '56px',
              fontWeight: '900',
              color: balance >= 0 ? '#fff' : '#fecaca'
            }}>
              €{balance.toFixed(2)}
            </h2>
            <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: '13px' }}>
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '20px', marginTop: '-20px', position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              border: 'none',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              minHeight: '56px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s'
            }}
          >
            {showForm ? '✕ Fermer' : '➕ Ajouter'}
          </button>
          <button
            onClick={() => setShowTransfer(!showTransfer)}
            style={{
              background: showTransfer ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : '#fff',
              color: showTransfer ? '#fff' : '#6366f1',
              border: '2px solid #6366f1',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              minHeight: '56px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s'
            }}
          >
            {showTransfer ? '✕ Fermer' : '💸 Virement'}
          </button>
          <button
            onClick={() => setShowInternalTransfer(!showInternalTransfer)}
            style={{
              background: showInternalTransfer ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : '#fff',
              color: showInternalTransfer ? '#fff' : '#6366f1',
              border: '2px solid #6366f1',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              minHeight: '56px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s'
            }}
          >
            {showInternalTransfer ? '✕ Fermer' : '🔄 Vir. Interne'}
          </button>
        </div>

        {/* Formulaire Ajout Transaction */}
        {showForm && (
          <div style={{ backgroundColor: '#fff', padding: '24px', margin: '0 16px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Nouvelle Transaction</h3>

            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Montant */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  autoFocus
                />
              </div>

              {/* Type */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  <option value="debit">Dépense</option>
                  <option value="credit">Revenu</option>
                </select>
              </div>

              {/* Catégorie */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Catégorie personnalisée si "Autre" */}
              {category === 'Autre' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cadeaux, Vacances, Mariage..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      minHeight: '48px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    autoFocus
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Nom de la dépense
                </label>
                <input
                  type="text"
                  placeholder="Ex: Restaurant Pizza, Boulangerie..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Bouton soumettre */}
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  minHeight: '52px',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                ✓ Ajouter la transaction
              </button>
            </form>
          </div>
        )}

        {/* Formulaire Édition */}
        {editingId !== null && (
          <div style={{ backgroundColor: '#fff', padding: '24px', margin: '0 16px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Modifier la Transaction</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Montant */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Type */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Type
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  <option value="debit">Dépense</option>
                  <option value="credit">Revenu</option>
                </select>
              </div>

              {/* Catégorie */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Catégorie
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Catégorie personnalisée si "Autre" */}
              {editCategory === 'Autre' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cadeaux, Vacances, Mariage..."
                    value={editCustomCategory}
                    onChange={(e) => setEditCustomCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      minHeight: '48px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    autoFocus
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Nom de la dépense
                </label>
                <input
                  type="text"
                  placeholder="Ex: Restaurant Pizza, Boulangerie..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minHeight: '52px',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.3s'
                  }}
                >
                  ✓ Sauvegarder
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{
                    flex: 1,
                    background: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minHeight: '52px',
                    transition: 'all 0.3s'
                  }}
                >
                  ✕ Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire Virement */}
        {showTransfer && (
          <div style={{ backgroundColor: '#fff', padding: '24px', margin: '0 16px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Effectuer un Virement</h3>

            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Montant */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  autoFocus
                />
              </div>

              {/* Bouton soumettre */}
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  minHeight: '52px',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                💸 Effectuer le virement
              </button>
            </form>
          </div>
        )}

        {/* Formulaire Virement Interne */}
        {showInternalTransfer && (
          <div style={{ backgroundColor: '#fff', padding: '24px', margin: '0 16px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Virement Interne</h3>

            <form onSubmit={handleInternalTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Compte source */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  De (Compte source)
                </label>
                <div style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', backgroundColor: '#f3f4f6', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                  {accounts.find(a => a.id === activeAccount)?.name}
                </div>
              </div>

              {/* Montant */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={internalTransferAmount}
                  onChange={(e) => setInternalTransferAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  autoFocus
                />
              </div>

              {/* Compte destinataire */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Vers (Compte destinataire)
                </label>
                <select
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Sélectionner un compte --</option>
                  {accounts.map(acc => (
                    acc.id !== activeAccount && (
                      <option key={acc.id} value={acc.id}>
                        {acc.icon} {acc.name}
                      </option>
                    )
                  ))}
                </select>
              </div>

              {/* Bouton soumettre */}
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  minHeight: '52px',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                🔄 Effectuer le virement interne
              </button>
            </form>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px 16px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Revenus</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#10b981' }}>
              €{totalIncome.toFixed(2)}
            </p>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Dépenses</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>
              €{totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Graphiques */}
        {monthTransactions.length > 0 && (
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Répartition par Catégorie</h3>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', overflowX: 'auto' }}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="45%"
                    cy="50%"
                    labelLine={false}
                    label={({ value }) => `€${value}`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '12px', fontWeight: '600' }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Légende:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {chartData.map((entry, index) => (
                    <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1f2937' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: COLORS[index % COLORS.length], borderRadius: '2px' }}></div>
                      <span><strong>{entry.name}:</strong> €{entry.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        <div style={{ padding: '16px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Transactions - {monthName}</h3>

          {monthTransactions.length === 0 ? (
            <div style={{
              background: '#fff',
              padding: '32px 16px',
              borderRadius: '14px',
              textAlign: 'center',
              color: '#d1d5db',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              Aucune transaction ce mois
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {monthTransactions.map(tx => (
                <div
                  key={tx.id}
                  style={{
                    background: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                      {tx.description ? tx.description : tx.category}
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                      {tx.category}{tx.description && ` • ${tx.date}`}{!tx.description && tx.date}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '800',
                      color: tx.type === 'credit' ? '#10b981' : '#1f2937'
                    }}>
                      {tx.type === 'credit' ? '+' : '-'}€{tx.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleEditTransaction(tx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6366f1',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '4px 8px',
                        transition: 'all 0.2s'
                      }}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '4px 8px',
                        transition: 'all 0.2s'
                      }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } else if (activeTab === 'accounts') {
    // Calculer les soldes pour chaque compte
    const getAccountBalance = (accountId) => {
      const accountTransactions = transactions.filter(t => t.account === accountId)
      const income = accountTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
      const expenses = accountTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      return income - expenses
    }

    content = (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f3ff', paddingBottom: '100px', padding: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Mes Comptes</h2>

        {/* Tous les comptes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {accounts.map(acc => {
            const accBalance = getAccountBalance(acc.id)
            return (
              <div key={acc.id} style={{ background: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', borderLeft: `4px solid ${activeAccount === acc.id ? '#6366f1' : '#e5e7eb'}` }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', fontWeight: '600' }}>{acc.icon} {acc.name}</p>
                <p style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: '800', color: accBalance >= 0 ? '#6366f1' : '#ef4444' }}>€{accBalance.toFixed(2)}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  } else if (activeTab === 'analytics') {
    content = (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f3ff', paddingBottom: '100px', padding: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Statistiques</h2>

        {monthTransactions.length > 0 ? (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Répartition des dépenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{
            background: '#fff',
            padding: '32px 16px',
            borderRadius: '14px',
            textAlign: 'center',
            color: '#d1d5db',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            Aucune donnée pour ce mois
          </div>
        )}
      </div>
    )
  } else if (activeTab === 'settings') {
    content = (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f3ff', paddingBottom: '100px', padding: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Paramètres</h2>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>À propos</h3>
          <p style={{ margin: '0 0 16px', color: '#6b7280', lineHeight: '1.6' }}>
            Family Finances est votre assistant budgétaire personnel. Gérez vos finances familiales avec facilité et style.
          </p>

          <h3 style={{ margin: '24px 0 16px', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Données</h3>
          <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '13px' }}>
            Total des transactions: <strong>{transactions.length}</strong>
          </p>

          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr? Cela supprimera toutes les données.')) {
                localStorage.clear()
                setTransactions([])
                alert('✅ Toutes les données ont été supprimées')
              }
            }}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            🗑️ Effacer toutes les données
          </button>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', marginTop: '16px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
            Family Finances v1.0 • Gratuit & Open Source
          </p>
        </div>
      </div>
    )
  }

  // ===== BOTTOM NAVIGATION =====
  const navTabs = [
    { id: 'home', icon: '📊', label: 'Accueil' },
    { id: 'accounts', icon: '💳', label: 'Comptes' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Paramètres' }
  ]

  // ===== RETURN CONTENT WITH NAVIGATION =====
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {content}

      {/* Fixed Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#f8f9fa',
        borderTop: '2px solid #e5e7eb',
        zIndex: 999,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
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
              padding: '12px 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderTop: activeTab === tab.id ? '4px solid #6366f1' : '4px solid transparent',
              color: activeTab === tab.id ? '#6366f1' : '#6b7280',
              fontSize: '11px',
              fontWeight: activeTab === tab.id ? '700' : '600',
              gap: '4px',
              minHeight: '70px',
              transition: 'all 0.3s'
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
