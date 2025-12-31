// src/pages/api-docs/data/goals.endpoints.ts
import { Endpoint } from '../types'

export const goalsEndpoints: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/goals',
    description: 'Créer un nouvel objectif',
    body: [
      { name: 'title', type: 'string', required: true, description: "Titre de l'objectif" },
      { name: 'target_amount', type: 'number', required: true, description: 'Montant cible' },
      { name: 'start_amount', type: 'number', required: false, description: 'Montant de départ (défaut: 0)' },
      { name: 'deadline', type: 'number', required: false, description: 'Date limite (timestamp)' },
    ],
    requestExample: { title: 'Épargne vacances', target_amount: 500000, start_amount: 0, deadline: 1735689600000 },
    responseExample: {
      id: 1,
      title: 'Épargne vacances',
      note: null,
      start_amount: 0,
      target_amount: 500000,
      deadline: 1735689600000,
      archived: 0,
      created_at: 1704240000000,
      updated_at: 1704240000000,
    },
  },
]
