import type { Endpoint } from '../types.ts'

export const debtPaymentsEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/debt-payments',
    description: 'Lister les paiements de dettes',
    query: [
      { name: 'debt_id', type: 'number', description: 'Filtrer par identifiant de dette' },
      { name: 'limit', type: 'number', description: 'Limiter le nombre de résultats' },
      { name: 'offset', type: 'number', description: 'Décalage pour la pagination' },
    ],
    responseExample: [
      {
        id: 1,
        debt_id: 1,
        amount: 50000,
        note: 'Paiement mensuel',
        occurred_at: 1704326400000,
        created_at: 1704326400000,
        updated_at: 1704326400000,
      },
    ],
  },
  {
    method: 'GET',
    path: '/api/debt-payments/:id',
    description: 'Récupérer un paiement de dette par son identifiant',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant du paiement' },
    ],
    responseExample: {
      id: 1,
      debt_id: 1,
      amount: 50000,
      note: 'Paiement mensuel',
      occurred_at: 1704326400000,
      created_at: 1704326400000,
      updated_at: 1704326400000,
    },
  },
  {
    method: 'POST',
    path: '/api/debt-payments',
    description: 'Créer un paiement pour une dette',
    body: [
      { name: 'debt_id', type: 'number', required: true, description: 'Identifiant de la dette' },
      { name: 'amount', type: 'number', required: true, description: 'Montant du paiement (≥ 0)' },
      { name: 'note', type: 'string', required: false, description: 'Note facultative' },
      { name: 'occurred_at', type: 'number', required: false, description: 'Date du paiement (timestamp)' },
    ],
    requestExample: { debt_id: 1, amount: 50000, note: 'Paiement mensuel' },
    responseExample: {
      id: 1,
      debt_id: 1,
      amount: 50000,
      note: 'Paiement mensuel',
      occurred_at: 1704326400000,
      created_at: 1704326400000,
      updated_at: 1704326400000,
    },
  },
  {
    method: 'PUT',
    path: '/api/debt-payments/:id',
    description: 'Mettre à jour un paiement',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant du paiement' },
    ],
    body: [
      { name: 'amount', type: 'number', required: false, description: 'Montant du paiement (≥ 0)' },
      { name: 'note', type: 'string', required: false, description: 'Note' },
      { name: 'occurred_at', type: 'number', required: false, description: 'Date (timestamp)' },
    ],
    requestExample: { amount: 60000, note: 'Ajustement' },
    responseExample: {
      id: 1,
      debt_id: 1,
      amount: 60000,
      note: 'Ajustement',
      occurred_at: 1704326400000,
      created_at: 1704326400000,
      updated_at: 1704412800000,
    },
  },
  {
    method: 'DELETE',
    path: '/api/debt-payments/:id',
    description: 'Supprimer un paiement',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant du paiement' },
    ],
    responseExample: null,
  },
]
