// Schéma de base de données adapté de l'application mobile
export const DbSchema = {
  version: 1,
  
  // Core
  tAccountings: 'accountings',
  tTransactions: 'transactions',
  tAppSettings: 'app_settings',
  
  // Finances
  tGoals: 'goals',
  tGoalContribs: 'goal_contribs',
  tDebts: 'debts',
  tDebtPayments: 'debt_payments',
  tSavings: 'savings',
  tSavingMoves: 'saving_moves',
  tAutoSaves: 'auto_saves',
  tFinanceEvents: 'finance_events',
} as const

export function createSchema(db: any) {
  const now = Date.now()
  
  // =========================================================
  // CORE: ACCOUNTINGS
  // =========================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tAccountings} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('linked','standalone','master')),
      parent_code TEXT NULL,
      currency TEXT NOT NULL DEFAULT 'XAF',
      opening_balance INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_accountings_parent
    ON ${DbSchema.tAccountings}(parent_code);
  `)

  db.exec(`ALTER TABLE ${DbSchema.tAccountings} ADD COLUMN deleted_at INTEGER;`);

  // Insérer le compte maître s'il n'existe pas
  const masterExists = db.prepare(`SELECT COUNT(*) as count FROM ${DbSchema.tAccountings} WHERE code = 'MASTER'`).get()
  if (masterExists.count === 0) {
    db.prepare(`
      INSERT INTO ${DbSchema.tAccountings} 
      (code, name, type, parent_code, currency, opening_balance, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('MASTER', 'Comptabilité principale', 'master', null, 'XAF', 0, now, now)
  }

  // =========================================================
  // CORE: TRANSACTIONS
  // =========================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tTransactions} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_code TEXT NOT NULL UNIQUE,
      accounting_code TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('income','expense','transfer')),
      amount INTEGER NOT NULL CHECK(amount >= 0),
      label TEXT NOT NULL,
      note TEXT NULL,
      category TEXT NULL,
      tx_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(accounting_code) REFERENCES ${DbSchema.tAccountings}(code)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tx_accounting_date
    ON ${DbSchema.tTransactions}(accounting_code, tx_date);
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tx_kind
    ON ${DbSchema.tTransactions}(kind);
  `)

  // =========================================================
  // SETTINGS
  // =========================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tAppSettings} (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  const settings = [
    { key: 'default_currency', value: 'XAF' },
    { key: 'language', value: 'fr' },
    { key: 'date_format', value: 'JJ/MM/AAAA' },
    { key: 'notif_general', value: '1' },
    { key: 'notif_reminders', value: '1' },
    { key: 'notif_debt_due', value: '1' },
    { key: 'notif_goal_progress', value: '0' },
    { key: 'auto_backup', value: '0' },
    { key: 'wifi_only_backup', value: '1' },
  ]

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO ${DbSchema.tAppSettings} (key, value, updated_at)
    VALUES (?, ?, ?)
  `)

  for (const setting of settings) {
    insertSetting.run(setting.key, setting.value, now)
  }

  // =========================================================
  // FINANCES: GOALS + CONTRIBUTIONS
  // =========================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tGoals} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      note TEXT NULL,
      start_amount INTEGER NOT NULL DEFAULT 0 CHECK(start_amount >= 0),
      target_amount INTEGER NOT NULL CHECK(target_amount >= 0),
      deadline INTEGER NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_goal_deadline
    ON ${DbSchema.tGoals}(deadline);
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tGoalContribs} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      amount INTEGER NOT NULL CHECK(amount >= 0),
      note TEXT NULL,
      occurred_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(goal_id) REFERENCES ${DbSchema.tGoals}(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_goal_contrib_goal
    ON ${DbSchema.tGoalContribs}(goal_id);
  `)

  // =========================================================
  // FINANCES: DEBTS / CREDITS + PAYMENTS
  // =========================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tDebts} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('debt','credit')) DEFAULT 'debt',
      name TEXT NOT NULL,
      lender TEXT NULL,
      note TEXT NULL,
      principal_amount INTEGER NOT NULL CHECK(principal_amount >= 0),
      remaining_amount INTEGER NOT NULL CHECK(remaining_amount >= 0),
      due_date INTEGER NULL,
      closed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_debt_due
    ON ${DbSchema.tDebts}(due_date);
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tDebtPayments} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      debt_id INTEGER NOT NULL,
      amount INTEGER NOT NULL CHECK(amount >= 0),
      note TEXT NULL,
      occurred_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(debt_id) REFERENCES ${DbSchema.tDebts}(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_debt_payment_debt
    ON ${DbSchema.tDebtPayments}(debt_id);
  `)

  // =========================================================
  // FINANCES: SAVINGS + MOVES
  // =========================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tSavings} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      note TEXT NULL,
      accounting_code TEXT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(accounting_code) REFERENCES ${DbSchema.tAccountings}(code)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_savings_accounting
    ON ${DbSchema.tSavings}(accounting_code);
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tSavingMoves} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saving_id INTEGER NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('in','out')),
      amount INTEGER NOT NULL CHECK(amount >= 0),
      note TEXT NULL,
      occurred_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(saving_id) REFERENCES ${DbSchema.tSavings}(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_saving_moves_saving
    ON ${DbSchema.tSavingMoves}(saving_id);
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_saving_moves_date
    ON ${DbSchema.tSavingMoves}(occurred_at);
  `)

  // =========================================================
  // FINANCES: AUTOSAVES
  // =========================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tAutoSaves} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      note TEXT NULL,
      amount INTEGER NOT NULL CHECK(amount >= 0),
      cadence TEXT NOT NULL CHECK(cadence IN ('daily','weekly','monthly')),
      enabled INTEGER NOT NULL DEFAULT 1,
      start_at INTEGER NULL,
      last_run_at INTEGER NULL,
      accounting_code TEXT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(accounting_code) REFERENCES ${DbSchema.tAccountings}(code)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_autosaves_accounting
    ON ${DbSchema.tAutoSaves}(accounting_code);
  `)

  // =========================================================
  // FINANCES: EVENTS
  // =========================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${DbSchema.tFinanceEvents} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      ref_id INTEGER NULL,
      title TEXT NOT NULL,
      amount INTEGER NULL,
      meta TEXT NULL,
      occurred_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_finance_events_date
    ON ${DbSchema.tFinanceEvents}(occurred_at);
  `)
}

