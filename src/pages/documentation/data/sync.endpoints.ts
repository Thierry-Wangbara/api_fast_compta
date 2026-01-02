import type { Endpoint } from '../types.ts'

export const syncEndpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/sync',
    description:
      'Synchronisation PULL: retourne les deltas (created/updated/deleted) de toutes les entités depuis la date "since". Supporte le soft-delete via deleted_at.',
    query: [
      {
        name: 'since',
        type: 'string | number',
        description:
          'Date de référence au format ISO (YYYY-MM-DDTHH:MM:SS) ou timestamp en millisecondes. REQUIS.',
      },
    ],
    responseExample: {
      since: 1704240000000,
      server_time: 1704326400000,
      data: {
        accountings: {
          created: [
            {
              code: 'COMPTA1',
              name: 'Nouvelle comptabilité',
              type: 'standalone',
              parent_code: null,
              currency: 'XAF',
              opening_balance: 100000,
              created_at: 1704240000000,
              updated_at: 1704240000000,
              deleted_at: null,
            },
          ],
          updated: [],
          deleted: [
            // Tombstone minimal: id + deleted_at
            { id: 'COMPTA_OLD', deleted_at: 1704310000000 },
          ],
        },
        transactions: {
          created: [
            {
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
              deleted_at: null,
            },
          ],
          updated: [
            {
              tx_code: 'TX-1704153600000-DEF456UVW',
              accounting_code: 'MASTER',
              kind: 'expense',
              amount: 20000,
              label: 'Courses',
              note: null,
              category: 'Alimentation',
              tx_date: 1704153600000,
              created_at: 1704153600000,
              updated_at: 1704240000000,
              deleted_at: null,
            },
          ],
          deleted: [{ id: 'TX-1704000000000-OLD999', deleted_at: 1704305000000 }],
        },
        goals: { created: [], updated: [], deleted: [] },
        goalContribs: { created: [], updated: [], deleted: [] },
        debts: { created: [], updated: [], deleted: [] },
        debtPayments: { created: [], updated: [], deleted: [] },
        savings: { created: [], updated: [], deleted: [] },
        savingMoves: { created: [], updated: [], deleted: [] },
        autoSaves: { created: [], updated: [], deleted: [] },
        financeEvents: { created: [], updated: [], deleted: [] },
        settings: {
          created: [],
          updated: [
            {
              key: 'default_currency',
              value: 'XAF',
              created_at: 1704000000000,
              updated_at: 1704240000000,
              deleted_at: null,
            },
          ],
          deleted: [{ id: 'legacy_setting_key', deleted_at: 1704311000000 }],
        },
      },
      summary: {
        created: 2,
        updated: 2,
        deleted: 3,
      },
    },
    errorExample: {
      error:
        'Le paramètre "since" est requis. Format: YYYY-MM-DDTHH:MM:SS ou timestamp en millisecondes',
    },
  },

  {
    method: 'POST',
    path: '/api/sync',
    description:
      'Synchronisation PUSH + PULL: applique les changements locaux (upserts/deletes) puis retourne les deltas serveur depuis "since". Gère les conflits (server.updated_at > since). Les deletes sont des soft-deletes (deleted_at).',
    body: [
      {
        name: 'device_id',
        type: 'string',
        required: true,
        description: 'Identifiant unique du dispositif client',
      },
      {
        name: 'client_time',
        type: 'number',
        required: true,
        description: 'Timestamp du client au moment de la synchronisation',
      },
      {
        name: 'since',
        type: 'string | number',
        required: true,
        description:
          'Dernier curseur de synchronisation (ISO ou timestamp ms). Sert aussi à détecter les conflits.',
      },
      {
        name: 'changes',
        type: 'object',
        required: true,
        description:
          "Changements par entité. Chaque entité peut contenir { upserts: [], deletes: [] }. Les deletes doivent inclure l'identifiant de l'entité (tx_code, code, id, key...).",
      },
    ],
    requestExample: {
      device_id: 'abc123',
      client_time: 1704326400000,
      since: 1704240000000,
      changes: {
        transactions: {
          upserts: [
            {
              tx_code: 'TX-1704326400000-XYZ789',
              accounting_code: 'MASTER',
              kind: 'expense',
              amount: 15000,
              label: 'Achat en ligne',
              note: 'Achat effectué depuis le mobile',
              category: 'Shopping',
              tx_date: 1704326400000,
              created_at: 1704326400000,
              updated_at: 1704326400000,
            },
          ],
          deletes: [
            // IMPORTANT: delete = identifiant; le serveur fera soft-delete (deleted_at)
            { tx_code: 'TX-1704153600000-OLD123' },
          ],
        },
        goals: {
          upserts: [
            {
              id: 1,
              title: 'Nouvel objectif mobile',
              target_amount: 200000,
              start_amount: 0,
              created_at: 1704326400000,
              updated_at: 1704326400000,
            },
          ],
          deletes: [],
        },
        settings: {
          upserts: [{ key: 'language', value: 'fr' }],
          deletes: [],
        },
      },
    },
    responseExample: {
      device_id: 'abc123',
      client_time: 1704326400000,
      since: 1704240000000,
      server_time: 1704326500000,
      results: {
        applied: {
          transactions: { upserted: 1, deleted: 1 },
          accountings: { upserted: 0, deleted: 0 },
          goals: { upserted: 1, deleted: 0 },
          goalContribs: { upserted: 0, deleted: 0 },
          debts: { upserted: 0, deleted: 0 },
          debtPayments: { upserted: 0, deleted: 0 },
          savings: { upserted: 0, deleted: 0 },
          savingMoves: { upserted: 0, deleted: 0 },
          autoSaves: { upserted: 0, deleted: 0 },
          financeEvents: { upserted: 0, deleted: 0 },
          settings: { upserted: 1, deleted: 0 },
        },
        conflicts: [
          {
            entity: 'transaction',
            id: 'TX-1704240000000-CONFLICT',
            reason: 'Entité modifiée côté serveur après la dernière synchronisation',
          },
        ],
        errors: [],
      },

      // PUSH + PULL: deltas serveur après application
      data: {
        accountings: { created: [], updated: [], deleted: [] },
        transactions: {
          created: [],
          updated: [
            {
              tx_code: 'TX-1704000000000-SERVER-EDIT',
              accounting_code: 'MASTER',
              kind: 'expense',
              amount: 9000,
              label: 'Serveur update',
              note: null,
              category: 'Autre',
              tx_date: 1704000000000,
              created_at: 1704000000000,
              updated_at: 1704326490000,
              deleted_at: null,
            },
          ],
          deleted: [{ id: 'TX-1704153600000-OLD123', deleted_at: 1704326500000 }],
        },
        goals: { created: [], updated: [], deleted: [] },
        goalContribs: { created: [], updated: [], deleted: [] },
        debts: { created: [], updated: [], deleted: [] },
        debtPayments: { created: [], updated: [], deleted: [] },
        savings: { created: [], updated: [], deleted: [] },
        savingMoves: { created: [], updated: [], deleted: [] },
        autoSaves: { created: [], updated: [], deleted: [] },
        financeEvents: { created: [], updated: [], deleted: [] },
        settings: { created: [], updated: [], deleted: [] },
      },

      summary: {
        created: 0,
        updated: 1,
        deleted: 1,
        conflictsCount: 1,
        errorsCount: 0,
      },
    },
    errorExample: {
      error: 'device_id, client_time, since et changes sont requis',
    },
  },
]
