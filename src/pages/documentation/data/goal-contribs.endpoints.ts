import type { Endpoint } from '../types.ts'

export const goalContribsEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/goal-contribs',
    description: 'Lister les contributions aux objectifs',
    query: [
      { name: 'goal_id', type: 'number', description: "Filtrer par identifiant d'objectif" },
      { name: 'limit', type: 'number', description: 'Limiter le nombre de résultats' },
      { name: 'offset', type: 'number', description: 'Décalage pour la pagination' },
    ],
    responseExample: [
      {
        id: 1,
        goal_id: 1,
        amount: 25000,
        note: 'Premier versement',
        occurred_at: 1704240000000,
        created_at: 1704240000000,
        updated_at: 1704240000000,
      },
    ],
  },
  {
    method: 'GET',
    path: '/api/goal-contribs/:id',
    description: 'Récupérer une contribution par son identifiant',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant de la contribution' },
    ],
    responseExample: {
      id: 1,
      goal_id: 1,
      amount: 25000,
      note: 'Premier versement',
      occurred_at: 1704240000000,
      created_at: 1704240000000,
      updated_at: 1704240000000,
    },
  },
  {
    method: 'POST',
    path: '/api/goal-contribs',
    description: 'Créer une nouvelle contribution pour un objectif',
    body: [
      { name: 'goal_id', type: 'number', required: true, description: "Identifiant de l'objectif" },
      { name: 'amount', type: 'number', required: true, description: 'Montant de la contribution (≥ 0)' },
      { name: 'note', type: 'string', required: false, description: 'Note facultative' },
      { name: 'occurred_at', type: 'number', required: false, description: 'Date du versement (timestamp)' },
    ],
    requestExample: { goal_id: 1, amount: 25000, note: 'Premier versement' },
    responseExample: {
      id: 1,
      goal_id: 1,
      amount: 25000,
      note: 'Premier versement',
      occurred_at: 1704240000000,
      created_at: 1704240000000,
      updated_at: 1704240000000,
    },
  },
  {
    method: 'PUT',
    path: '/api/goal-contribs/:id',
    description: 'Mettre à jour une contribution',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant de la contribution' },
    ],
    body: [
      { name: 'amount', type: 'number', required: false, description: 'Nouveau montant (≥ 0)' },
      { name: 'note', type: 'string', required: false, description: 'Note' },
      { name: 'occurred_at', type: 'number', required: false, description: 'Nouvelle date (timestamp)' },
    ],
    requestExample: { amount: 30000, note: 'Ajustement' },
    responseExample: {
      id: 1,
      goal_id: 1,
      amount: 30000,
      note: 'Ajustement',
      occurred_at: 1704240000000,
      created_at: 1704240000000,
      updated_at: 1704326400000,
    },
  },
  {
    method: 'DELETE',
    path: '/api/goal-contribs/:id',
    description: 'Supprimer une contribution',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant de la contribution' },
    ],
    responseExample: null,
  },
]
