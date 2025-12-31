import type { Endpoint } from '../types.ts'

export const savingMovesEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/saving-moves',
    description: 'Lister les mouvements d’épargne',
    query: [
      { name: 'saving_id', type: 'number', description: 'Filtrer par identifiant d’épargne' },
      { name: 'direction', type: 'string', description: 'Filtrer par direction : "in" ou "out"' },
      { name: 'limit', type: 'number', description: 'Limiter le nombre de résultats' },
      { name: 'offset', type: 'number', description: 'Décalage pour la pagination' },
    ],
    responseExample: [
      {
        id: 1,
        saving_id: 1,
        direction: 'in',
        amount: 5000,
        note: 'Versement initial',
        occurred_at: 1704240000000,
        created_at: 1704240000000,
        updated_at: 1704240000000,
      },
    ],
  },
  {
    method: 'GET',
    path: '/api/saving-moves/:id',
    description: 'Récupérer un mouvement par son identifiant',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant du mouvement' },
    ],
    responseExample: {
      id: 1,
      saving_id: 1,
      direction: 'in',
      amount: 5000,
      note: 'Versement initial',
      occurred_at: 1704240000000,
      created_at: 1704240000000,
      updated_at: 1704240000000,
    },
  },
  {
    method: 'POST',
    path: '/api/saving-moves',
    description: 'Créer un mouvement pour une épargne',
    body: [
      { name: 'saving_id', type: 'number', required: true, description: 'Identifiant de l’épargne' },
      { name: 'direction', type: 'string', required: true, description: 'Direction du mouvement ("in" ou "out")' },
      { name: 'amount', type: 'number', required: true, description: 'Montant du mouvement (≥ 0)' },
      { name: 'note', type: 'string', required: false, description: 'Note facultative' },
      { name: 'occurred_at', type: 'number', required: false, description: 'Date du mouvement (timestamp)' },
    ],
    requestExample: { saving_id: 1, direction: 'out', amount: 2000, note: 'Retrait pour courses' },
    responseExample: {
      id: 2,
      saving_id: 1,
      direction: 'out',
      amount: 2000,
      note: 'Retrait pour courses',
      occurred_at: 1704326400000,
      created_at: 1704326400000,
      updated_at: 1704326400000,
    },
  },
  {
    method: 'PUT',
    path: '/api/saving-moves/:id',
    description: 'Mettre à jour un mouvement existant',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant du mouvement' },
    ],
    body: [
      { name: 'direction', type: 'string', required: false, description: 'Direction ("in" ou "out")' },
      { name: 'amount', type: 'number', required: false, description: 'Montant (≥ 0)' },
      { name: 'note', type: 'string', required: false, description: 'Note' },
      { name: 'occurred_at', type: 'number', required: false, description: 'Date du mouvement (timestamp)' },
    ],
    requestExample: { amount: 3000, note: 'Ajustement' },
    responseExample: {
      id: 1,
      saving_id: 1,
      direction: 'in',
      amount: 3000,
      note: 'Ajustement',
      occurred_at: 1704240000000,
      created_at: 1704240000000,
      updated_at: 1704412800000,
    },
  },
  {
    method: 'DELETE',
    path: '/api/saving-moves/:id',
    description: 'Supprimer un mouvement',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant du mouvement' },
    ],
    responseExample: null,
  },
]
