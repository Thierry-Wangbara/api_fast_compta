import { Router } from 'express'
import { generateUID } from '../utils/uid.js'

// Controllers
import * as accountingsController from '../controllers/accountings.controller.js'
import * as transactionsController from '../controllers/transactions.controller.js'
import * as settingsController from '../controllers/settings.controller.js'
import * as goalsController from '../controllers/goals.controller.js'
import * as goalContribsController from '../controllers/goal-contribs.controller.js'
import * as debtsController from '../controllers/debts.controller.js'
import * as debtPaymentsController from '../controllers/debt-payments.controller.js'
import * as savingsController from '../controllers/savings.controller.js'
import * as savingMovesController from '../controllers/saving-moves.controller.js'
import * as autoSavesController from '../controllers/auto-saves.controller.js'
import * as financeEventsController from '../controllers/finance-events.controller.js'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Fast Compta is running' })
})

// UID
router.post('/uid', (req, res) => {
  const uid = generateUID()
  res.json({ uid })
})

// Accountings
router.get('/accountings', accountingsController.getAccountings)
router.get('/accountings/:code', accountingsController.getAccounting)
router.post('/accountings', accountingsController.createAccounting)
router.put('/accountings/:code', accountingsController.updateAccounting)
router.delete('/accountings/:code', accountingsController.deleteAccounting)

// Transactions
router.get('/transactions', transactionsController.getTransactions)
router.get('/transactions/:tx_code', transactionsController.getTransaction)
router.post('/transactions', transactionsController.createTransaction)
router.put('/transactions/:tx_code', transactionsController.updateTransaction)
router.delete('/transactions/:tx_code', transactionsController.deleteTransaction)

// Settings
router.get('/settings', settingsController.getSettings)
router.get('/settings/:key', settingsController.getSetting)
router.post('/settings', settingsController.createSetting)
router.put('/settings/:key', settingsController.updateSetting)
router.delete('/settings/:key', settingsController.deleteSetting)

// Goals
router.get('/goals', goalsController.getGoals)
router.get('/goals/:id', goalsController.getGoal)
router.post('/goals', goalsController.createGoal)
router.put('/goals/:id', goalsController.updateGoal)
router.delete('/goals/:id', goalsController.deleteGoal)

// Goal Contributions
router.get('/goal-contribs', goalContribsController.getGoalContribs)
router.get('/goal-contribs/:id', goalContribsController.getGoalContrib)
router.post('/goal-contribs', goalContribsController.createGoalContrib)
router.put('/goal-contribs/:id', goalContribsController.updateGoalContrib)
router.delete('/goal-contribs/:id', goalContribsController.deleteGoalContrib)

// Debts
router.get('/debts', debtsController.getDebts)
router.get('/debts/:id', debtsController.getDebt)
router.post('/debts', debtsController.createDebt)
router.put('/debts/:id', debtsController.updateDebt)
router.delete('/debts/:id', debtsController.deleteDebt)

// Debt Payments
router.get('/debt-payments', debtPaymentsController.getDebtPayments)
router.get('/debt-payments/:id', debtPaymentsController.getDebtPayment)
router.post('/debt-payments', debtPaymentsController.createDebtPayment)
router.put('/debt-payments/:id', debtPaymentsController.updateDebtPayment)
router.delete('/debt-payments/:id', debtPaymentsController.deleteDebtPayment)

// Savings
router.get('/savings', savingsController.getSavings)
router.get('/savings/:id', savingsController.getSaving)
router.post('/savings', savingsController.createSaving)
router.put('/savings/:id', savingsController.updateSaving)
router.delete('/savings/:id', savingsController.deleteSaving)

// Saving Moves
router.get('/saving-moves', savingMovesController.getSavingMoves)
router.get('/saving-moves/:id', savingMovesController.getSavingMove)
router.post('/saving-moves', savingMovesController.createSavingMove)
router.put('/saving-moves/:id', savingMovesController.updateSavingMove)
router.delete('/saving-moves/:id', savingMovesController.deleteSavingMove)

// Auto Saves
router.get('/auto-saves', autoSavesController.getAutoSaves)
router.get('/auto-saves/:id', autoSavesController.getAutoSave)
router.post('/auto-saves', autoSavesController.createAutoSave)
router.put('/auto-saves/:id', autoSavesController.updateAutoSave)
router.delete('/auto-saves/:id', autoSavesController.deleteAutoSave)

// Finance Events
router.get('/finance-events', financeEventsController.getFinanceEvents)
router.get('/finance-events/:id', financeEventsController.getFinanceEvent)
router.post('/finance-events', financeEventsController.createFinanceEvent)
router.put('/finance-events/:id', financeEventsController.updateFinanceEvent)
router.delete('/finance-events/:id', financeEventsController.deleteFinanceEvent)

export default router

