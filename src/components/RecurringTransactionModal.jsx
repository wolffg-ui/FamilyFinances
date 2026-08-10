import { useState } from 'react'

export default function RecurringTransactionModal({ onClose, onAdd, accounts }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Loyer')
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [type, setType] = useState('debit')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [endDate, setEndDate] = useState('')

  const categories = ['Loyer', 'Travail', 'CAF', 'Pôle emploi', 'Électricité', 'Internet', 'Assurance']

  const handleSubmit = (e) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!name || !amount || !dayOfMonth || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Veuillez entrer un montant valide (> 0)')
      return
    }

    onAdd({
      name,
      amount: parsedAmount,
      category,
      accountId: parseInt(accountId),
      type,
      dayOfMonth: parseInt(dayOfMonth),
      endDate: endDate || null
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
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Ajouter une transaction récurrente</h2>
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
              Nom
            </label>
            <input
              type="text"
              placeholder="Ex: Loyer mensuel"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              Jour du mois
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
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
              Date de fin (optionnel)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
            />
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
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
