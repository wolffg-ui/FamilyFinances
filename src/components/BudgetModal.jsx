import { useState } from 'react'

export default function BudgetModal({ currentBudgets, onClose, onSave }) {
  const [budgets, setBudgets] = useState(currentBudgets)
  const [newCategory, setNewCategory] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const defaultCategories = [
    'Courses', 'Loyer', 'Transport', 'Loisirs', 'Santé',
    'Alimentation', 'Électricité', 'Internet', 'Assurance', 'Restaurants',
    'Travail', 'Pôle emploi', 'CAF'
  ]

  const handleAddCategory = () => {
    if (newCategory && newAmount) {
      setBudgets({
        ...budgets,
        [newCategory]: parseFloat(newAmount)
      })
      setNewCategory('')
      setNewAmount('')
    }
  }

  const handleRemove = (category) => {
    const { [category]: _, ...rest } = budgets
    setBudgets(rest)
  }

  const handleSave = () => {
    onSave(budgets)
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
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Gérer les budgets</h2>
          <button onClick={onClose} style={{
            fontSize: '24px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}>✕</button>
        </div>

        {/* Budgets existants */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>Budgets actuels</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(budgets).map(([category, amount]) => (
              <div key={category} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#f8f8f8',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{category}</p>
                  <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>€{amount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRemove(category)}
                  style={{
                    backgroundColor: '#fff5f5',
                    border: '1px solid #fcc',
                    color: '#d32f2f',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ajouter un budget */}
        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>Ajouter une catégorie</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                backgroundColor: '#f8f8f8'
              }}
            >
              <option value="">Sélectionner une catégorie</option>
              {defaultCategories.map(cat => (
                <option key={cat} value={cat} disabled={Object.keys(budgets).includes(cat)}>
                  {cat}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Montant (€)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  backgroundColor: '#f8f8f8'
                }}
              />
              <button
                onClick={handleAddCategory}
                style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
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
            onClick={handleSave}
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
      </div>
    </div>
  )
}
