import jsPDF from 'jspdf'

export function exportTransactionsToPDF(transactions, month, year, budgets) {
  const doc = new jsPDF()

  // Titre
  doc.setFontSize(16)
  doc.text('Family Finances - Relevé Mensuel', 10, 10)

  // Période
  doc.setFontSize(12)
  doc.text(`${new Date(year, month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`, 10, 20)

  // Totaux
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  const savings = totalIncome - totalExpenses

  doc.setFontSize(11)
  doc.text(`Revenus: €${totalIncome.toFixed(2)}`, 10, 30)
  doc.text(`Dépenses: €${totalExpenses.toFixed(2)}`, 10, 37)
  doc.text(`Épargne: €${savings.toFixed(2)}`, 10, 44)

  // Transactions
  let yPosition = 55
  doc.setFontSize(10)

  transactions.forEach(tx => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 10
    }

    const symbol = tx.type === 'debit' ? '-' : '+'
    const color = tx.type === 'debit' ? [211, 47, 47] : [5, 150, 105]

    doc.setTextColor(0, 0, 0)
    doc.text(`${tx.date} | ${tx.category}`, 10, yPosition)

    doc.setTextColor(...color)
    doc.text(`${symbol}€${tx.amount.toFixed(2)}`, 150, yPosition)

    if (tx.notes) {
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(8)
      doc.text(`${tx.notes}`, 10, yPosition + 4)
      doc.setFontSize(10)
    }

    yPosition += 7
  })

  // Budgets
  if (Object.keys(budgets).length > 0) {
    doc.addPage()
    doc.setFontSize(12)
    doc.text('Budgets', 10, 10)

    let budgetY = 20
    doc.setFontSize(10)

    Object.entries(budgets).forEach(([category, budget]) => {
      doc.text(`${category}: €${budget.toFixed(2)}`, 10, budgetY)
      budgetY += 7
    })
  }

  // Télécharger
  doc.save(`Family-Finances-${new Date(year, month).toISOString().split('T')[0]}.pdf`)
}
