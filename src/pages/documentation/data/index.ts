import type { Endpoint } from '../types.ts'
import { systemEndpoints } from './system.endpoints'
import { accountingsEndpoints } from './accountings.endpoints'
import { transactionsEndpoints } from './transactions.endpoints'
import { settingsEndpoints } from './settings.endpoints'
import { goalsEndpoints } from './goals.endpoints'
import { goalContribsEndpoints } from './goal-contribs.endpoints'
import { debtsEndpoints } from './debts.endpoints'
import { debtPaymentsEndpoints } from './debt-payments.endpoints'
import { savingsEndpoints } from './savings.endpoints'
import { savingMovesEndpoints } from './saving-moves.endpoints'
import { autoSavesEndpoints } from './auto-saves.endpoints'
import { financeEventsEndpoints } from './finance-events.endpoints'
import { syncEndpoints } from './sync.endpoints'

export const endpointsBySection: Record<string, Endpoint[]> = {
  'Système': systemEndpoints,
  'Synchronisation': syncEndpoints,
  'Comptabilités (Accountings)': accountingsEndpoints,
  'Transactions': transactionsEndpoints,
  'Paramètres (Settings)': settingsEndpoints,
  'Objectifs (Goals)': goalsEndpoints,
  'Contributions aux Objectifs': goalContribsEndpoints,
  'Dettes (Debts)': debtsEndpoints,
  'Paiements de Dettes': debtPaymentsEndpoints,
  'Épargnes (Savings)': savingsEndpoints,
  'Mouvements d\'Épargne': savingMovesEndpoints,
  'Épargnes Automatiques': autoSavesEndpoints,
  'Événements Financiers': financeEventsEndpoints,
}
