// src/pages/api-docs/data/index.ts
import { Endpoint } from '../types'
import { systemEndpoints } from './system.endpoints'
import { accountingsEndpoints } from './accountings.endpoints'
import { transactionsEndpoints } from './transactions.endpoints'
import { goalsEndpoints } from './goals.endpoints'

export const endpointsBySection: Record<string, Endpoint[]> = {
  'Système': systemEndpoints,
  'Comptabilités (Accountings)': accountingsEndpoints,
  'Transactions': transactionsEndpoints,
  'Objectifs (Goals)': goalsEndpoints,
}
