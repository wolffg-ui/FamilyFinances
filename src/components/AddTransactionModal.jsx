import { useState } from 'react'

export default function AddTransactionModal({ onClose, onAdd, accounts, categories: allCategories = [] }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Courses')
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [type, setType] = useState('debit')
  const [notes, setNotes] = useState('')
  const [isTransfer, setIsTransfer] = useState(false)
  const [transferToAccountId, setTransferToAccountId] = useState(accounts[1]?.id || '')

  const defaultExpenseCategories = [
    'Courses',
    'Loyer',
    'Transport',
    'Loisirs',
    'Santé',
    'Alimentation',
    'Électricité',
    'Internet',
    'Assurance',
    'Restaurants',
    'Transfert',
    'Autre'
  ]

  const defaultIncomeCategories = [
    'Travail',
    'Pôle emploi',
    'CAF',
    'Autre revenu'
  ]

  const expenseCategories = allCategories.length > 0 ? allCategories.filter(c => !defaultIncomeCategories.includes(c)) : defaultExpenseCategories
  const incomeCategories = allCategories.length > 0 ? allCategories.filter(c => defaultIncomeCategories.includes(c)) : defaultIncomeCategories

  const categories = type === 'debit' ? expenseCategories : incomeCategories

  const handleTypeChange = (newType) => {
    setType(newType)
    setIsTransfer(false)
    setCategory(newType === 'debit' ? 'Courses' : 'Travail')
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    if (newCategory === 'Transfert') {
      setIsTransfer(true)
    } else {
      setIsTransfer(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!amount || !category || !accountId || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Veuillez entrer un montant valide (> 0)')
      return
    }

    const today = new Date().toLocaleDateString('fr-FR')

    if (isTransfer && transferToAccountId) {
      onAdd({
        amount: parsedAmount,
        category: 'Transfert',
        accountId,
        type: 'debit',
        date: today,
        notes: `Transfert vers ${accounts.find(a => a.id == transferToAccountId)?.name || 'un compte'}`
      })
      onAdd({
        amount: parsedAmount,
        category: 'Transfert',
        accountId: parseInt(transferToAccountId),
        type: 'credit',
        date: today,
        notes: `Transfert depuis ${accounts.find(a => a.id == accountId)?.name || 'un compte'}`
      })
    } else {
      onAdd({
        amount: parsedAmount,
        category,
        accountId,
        type,
        date: today,
        notes
      })
    }

    setAmount('')
    setCategory('Courses')
    setType('debit')
    setNotes('')
    setIsTransfer(false)
  }

  return (
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
        animation: 'slideUp 0.3s ease-out'
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Ajouter une transaction</h2>
          <button
            onClick={onClose}
            style={{
              fontSize: '24px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Type */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Type
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['debit', 'credit'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: type === t ? '2px solid #000' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: type === t ? '#000' : '#fff',
                    color: type === t ? '#fff' : '#000',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  {t === 'debit' ? '💸 Dépense' : '💰 Revenu'}
                </button>
              ))}
            </div>
          </div>

          {/* Montant */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="999999.99"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                backgroundColor: '#fff'
              }}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Compte */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              {isTransfer ? 'Depuis le compte' : 'Compte'}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                backgroundColor: '#fff'
              }}
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Compte destinataire (pour transfert) */}
          {isTransfer && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
                Vers le compte
              </label>
              <select
                value={transferToAccountId}
                onChange={(e) => setTransferToAccountId(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff'
                }}
                required
              >
                {accounts.filter(acc => acc.id !== accountId).map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Notes (optionnel)
            </label>
            <textarea
              placeholder="Ajouter une note (ex: facture, motif...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                minHeight: '60px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
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
                fontSize: '16px',
                transition: 'all 0.2s'
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
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
