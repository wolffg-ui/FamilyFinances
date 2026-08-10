import { useState } from 'react'

export default function CustomCategoriesModal({ categories, onClose, onSave }) {
  const [customCategories, setCustomCategories] = useState(categories)
  const [newCategory, setNewCategory] = useState('')

  const handleAdd = () => {
    if (newCategory && !customCategories.includes(newCategory)) {
      setCustomCategories([...customCategories, newCategory])
      setNewCategory('')
    }
  }

  const handleRemove = (cat) => {
    setCustomCategories(customCategories.filter(c => c !== cat))
  }

  const handleSave = () => {
    onSave(customCategories)
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
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Gérer les catégories</h2>
          <button onClick={onClose} style={{
            fontSize: '24px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}>✕</button>
        </div>

        {/* Catégories actuelles */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>Catégories</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {customCategories.map(cat => (
              <div
                key={cat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f8f8f8',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{cat}</span>
                <button
                  onClick={() => handleRemove(cat)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#d32f2f',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ajouter une catégorie */}
        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>Ajouter une catégorie</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nouvelle catégorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: '#f8f8f8'
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              +
            </button>
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
