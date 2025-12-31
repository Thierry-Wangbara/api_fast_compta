import type { Endpoint } from '../types.ts'

export const settingsEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/settings',
    description: 'Récupérer la liste de tous les paramètres (paires clé/valeur)',
    responseExample: {
      theme: 'dark',
      locale: 'fr',
      currency: 'XAF',
    },
  },
  {
    method: 'GET',
    path: '/api/settings/:key',
    description: 'Récupérer la valeur d’un paramètre spécifique',
    params: [
      { name: 'key', type: 'string', required: true, description: 'Nom de la clé à interroger' },
    ],
    responseExample: { key: 'theme', value: 'dark' },
  },
  {
    method: 'POST',
    path: '/api/settings',
    description: 'Créer un nouveau paramètre',
    body: [
      { name: 'key', type: 'string', required: true, description: 'Nom unique de la clé' },
      { name: 'value', type: 'string', required: true, description: 'Valeur associée à la clé' },
    ],
    requestExample: { key: 'theme', value: 'light' },
    responseExample: { key: 'theme', value: 'light' },
  },
  {
    method: 'PUT',
    path: '/api/settings/:key',
    description: 'Mettre à jour ou créer un paramètre',
    params: [
      { name: 'key', type: 'string', required: true, description: 'Nom de la clé à mettre à jour' },
    ],
    body: [
      { name: 'value', type: 'string', required: true, description: 'Nouvelle valeur de la clé' },
    ],
    requestExample: { value: 'light' },
    responseExample: { key: 'theme', value: 'light' },
  },
  {
    method: 'DELETE',
    path: '/api/settings/:key',
    description: 'Supprimer un paramètre',
    params: [
      { name: 'key', type: 'string', required: true, description: 'Nom de la clé à supprimer' },
    ],
    responseExample: null,
  },
]
