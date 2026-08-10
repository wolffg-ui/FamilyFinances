import { useState } from 'react'

export default function EditTransactionModal({ transaction, onClose, onSave, accounts }) {
  const [amount, setAmount] = useState(transaction.amount)
  const [category, setCategory] = useState(transaction.category)
  const [accountId, setAccountId] = useState(transaction.accountId)
  const [type, setType] = useState(transaction.type)
  const [date, setDate] = useState(transaction.date)

  const expenseCategories = [
    'Courses', 'Loyer', 'Transport', 'Loisirs', 'Santé',
    'Alimentation', 'Électricité', 'Internet', 'Assurance', 'Restaurants', 'Autre'
  ]

  const incomeCategories = [
    'Travail', 'Pôle emploi', 'CAF', 'Autre revenu'
  ]

  const categories = type === 'debit' ? expenseCategories : incomeCategories

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || !category || !accountId) return

    onSave({
      ...transaction,
      amount: parseFloat(amount),
      category,
      accountId,
      type,
      date
    })
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
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Modifier la transaction</h2>
          <button onClick={onClose} style={{
            fontSize: '24px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Type
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['debit', 'credit'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
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
                    fontSize: '14px'
                  }}
                >
                  {t === 'debit' ? '💸 Dépense' : '💰 Revenu'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Compte
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
