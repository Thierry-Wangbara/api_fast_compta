// src/pages/api-docs/data/transactions.endpoints.ts
import { Endpoint } from '../types'

export const transactionsEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/transactions',
    description: 'Récupérer la liste des transactions',
    query: [
      { name: 'accounting_code', type: 'string', description: 'Filtrer par comptabilité' },
      { name: 'kind', type: 'string', description: 'Filtrer par type: "income", "expense" ou "transfer"' },
      { name: 'limit', type: 'number', description: 'Limiter le nombre de résultats' },
      { name: 'offset', type: 'number', description: 'Décalage pour la pagination' },
    ],
    responseExample: [
      {
        id: 1,
        tx_code: 'TX-1704240000000-ABC123XYZ',
        accounting_code: 'MASTER',
        kind: 'income',
        amount: 50000,
        label: 'Salaire',
        note: 'Salaire du mois',
        category: 'Salaire',
        tx_date: 1704240000000,
        created_at: 1704240000000,
        updated_at: 1704240000000,
      },
    ],
  },
  {
    method: 'GET',
    path: '/api/transactions/:tx_code',
    description: 'Récupérer une transaction par son code',
    params: [{ name: 'tx_code', type: 'string', required: true, description: 'Code unique de la transaction' }],
    responseExample: {
      id: 1,
      tx_code: 'TX-1704240000000-ABC123XYZ',
      accounting_code: 'MASTER',
      kind: 'income',
      amount: 50000,
      label: 'Salaire',
      note: 'Salaire du mois',
      category: 'Salaire',
      tx_date: 1704240000000,
      created_at: 1704240000000,
      updated_at: 1704240000000,
    },
  },
]
