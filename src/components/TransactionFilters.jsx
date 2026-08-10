export default function TransactionFilters({ onFilterChange, accounts }) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    }}>
      <select
        onChange={(e) => onFilterChange('category', e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'inherit',
          backgroundColor: '#f8f8f8',
          cursor: 'pointer'
        }}
      >
        <option value="">Toutes les catégories</option>
        <option value="Courses">Courses</option>
        <option value="Loyer">Loyer</option>
        <option value="Transport">Transport</option>
        <option value="Loisirs">Loisirs</option>
        <option value="Santé">Santé</option>
        <option value="Travail">Travail</option>
        <option value="Pôle emploi">Pôle emploi</option>
        <option value="CAF">CAF</option>
      </select>

      <select
        onChange={(e) => onFilterChange('account', e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'inherit',
          backgroundColor: '#f8f8f8',
          cursor: 'pointer'
        }}
      >
        <option value="">Tous les comptes</option>
        {accounts.map(acc => (
          <option key={acc.id} value={acc.id}>{acc.name}</option>
        ))}
      </select>

      <select
        onChange={(e) => onFilterChange('type', e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'inherit',
          backgroundColor: '#f8f8f8',
          cursor: 'pointer'
        }}
      >
        <option value="">Tous les types</option>
        <option value="debit">Dépenses</option>
        <option value="credit">Revenus</option>
      </select>
    </div>
  )
}
