import type { Endpoint } from '../types.ts'

export const savingsEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/savings',
    description: 'Lister les épargnes',
    query: [
      { name: 'archived', type: 'boolean', description: 'Filtrer par statut archivé (true/false)' },
      { name: 'accounting_code', type: 'string', description: 'Filtrer par code de comptabilité' },
      { name: 'limit', type: 'number', description: 'Limiter le nombre de résultats' },
      { name: 'offset', type: 'number', description: 'Décalage pour la pagination' },
    ],
    responseExample: [
      {
        id: 1,
        title: 'Épargne maison',
        note: 'Prévoir un apport pour la maison',
        accounting_code: 'MASTER',
        archived: false,
        created_at: 1704240000000,
        updated_at: 1704240000000,
      },
    ],
  },
  {
    method: 'GET',
    path: '/api/savings/:id',
    description: 'Récupérer une épargne par son identifiant',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant de l’épargne' },
    ],
    responseExample: {
      id: 1,
      title: 'Épargne maison',
      note: 'Prévoir un apport pour la maison',
      accounting_code: 'MASTER',
      archived: false,
      created_at: 1704240000000,
      updated_at: 1704240000000,
    },
  },
  {
    method: 'POST',
    path: '/api/savings',
    description: 'Créer une nouvelle épargne',
    body: [
      { name: 'title', type: 'string', required: true, description: 'Titre de l’épargne' },
      { name: 'note', type: 'string', required: false, description: 'Note facultative' },
      { name: 'accounting_code', type: 'string', required: false, description: 'Comptabilité associée (code)' },
    ],
    requestExample: { title: 'Épargne maison', note: 'Prévoir un apport' },
    responseExample: {
      id: 1,
      title: 'Épargne maison',
      note: 'Prévoir un apport',
      accounting_code: 'MASTER',
      archived: false,
      created_at: 1704240000000,
      updated_at: 1704240000000,
    },
  },
  {
    method: 'PUT',
    path: '/api/savings/:id',
    description: 'Mettre à jour une épargne',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant de l’épargne' },
    ],
    body: [
      { name: 'title', type: 'string', required: false, description: 'Titre' },
      { name: 'note', type: 'string', required: false, description: 'Note' },
      { name: 'accounting_code', type: 'string', required: false, description: 'Comptabilité associée' },
      { name: 'archived', type: 'boolean', required: false, description: 'Archiver ou désarchiver l’épargne' },
    ],
    requestExample: { archived: true },
    responseExample: {
      id: 1,
      title: 'Épargne maison',
      note: 'Prévoir un apport',
      accounting_code: 'MASTER',
      archived: true,
      created_at: 1704240000000,
      updated_at: 1704326400000,
    },
  },
  {
    method: 'DELETE',
    path: '/api/savings/:id',
    description: 'Supprimer une épargne',
    params: [
      { name: 'id', type: 'number', required: true, description: 'Identifiant de l’épargne' },
    ],
    responseExample: null,
  },
]
