import type { Endpoint } from '../types.ts'

export const systemEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/health',
    description: "Vérifier l'état de l'API",
    responseExample: {
      status: 'ok',
      message: 'API Fast Compta is running',
    },
  },
  {
    method: 'POST',
    path: '/api/uid',
    description: 'Générer un UID unique pour identifier un utilisateur',
    responseExample: {
      uid: '550e8400-e29b-41d4-a716-446655440000',
    },
  },
]
