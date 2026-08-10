# 🚨 CORRECTIONS CRITIQUES - CHECKLIST

## 1. DARK MODE COMPLET
**Status**: 60% (toggle existe, manque application globale)
**Approche rapide**: 
- Utiliser CSS variables pour tous les styles
- Une feuille CSS globale `style.css` qui change avec data-theme="dark"
- Moins d'édition de code React

## 2. RESPONSIVE DESIGN  
**Status**: 0% (non implémenté)
**Approche rapide**:
- Media queries mobiles (< 768px): 
  - Grid passe de 3 colonnes à 1 colonne
  - Padding/fontSize réduits
  - Buttons width: 100% sur mobile
  - Modals: fullscreen sur mobile

## 3. UNDO/REDO
**Status**: 0% (non implémenté)
**Approche rapide**:
- Stack d'undo pour [transactions, budgets, recurringTransactions]
- 2 boutons: ← Annuler / Rétablir →
- localStorage pour persister l'undo

## 4. VALIDATION CSV ROBUSTE
**Status**: 30% (import basique existe)
**Améliorations**:
- Vérifier colonnes requises
- Format date: DD/MM/YYYY
- Montants > 0
- Afficher nombre d'erreurs/importées

## 5. PAGINATION
**Status**: 0% (non implémenté)
**Approche rapide**:
- Show 20 transactions par page
- Boutons Précédent/Suivant
- "Page X/Y"
- Garder filtre/tri actifs

---

## ESTIMATION
- Dark mode complet: 2 heures (refonte CSS)
- Responsive: 1.5 heures (media queries)
- Undo/Redo: 1 heure (état management)
- CSV validation: 30 min
- Pagination: 1 heure

**Total**: ~6 heures de travail

