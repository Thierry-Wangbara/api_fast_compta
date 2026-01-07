import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

type AnyRow = Record<string, any>

interface EntityDelta {
  created: AnyRow[]
  updated: AnyRow[]
  deleted: Array<{ id: string | number; deleted_at: number }>
}

interface SyncResult {
  accountings: EntityDelta
  transactions: EntityDelta
  goals: EntityDelta
  goalContribs: EntityDelta
  debts: EntityDelta
  debtPayments: EntityDelta
  savings: EntityDelta
  savingMoves: EntityDelta
  autoSaves: EntityDelta
  financeEvents: EntityDelta
  settings: EntityDelta
}

function parseSince(input: unknown): number | null {
  if (input == null) return null

  // express query peut être string | string[]
  const raw = Array.isArray(input) ? input[0] : input

  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  if (typeof raw !== 'string') return null

  // ISO string
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.getTime()

  // timestamp ms
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n) || Number.isNaN(n)) return null
  return n
}

function emptyResult(): SyncResult {
  const e = () => ({ created: [], updated: [], deleted: [] })
  return {
    accountings: e(),
    transactions: e(),
    goals: e(),
    goalContribs: e(),
    debts: e(),
    debtPayments: e(),
    savings: e(),
    savingMoves: e(),
    autoSaves: e(),
    financeEvents: e(),
    settings: e(),
  }
}

function tableColumns(table: string): Set<string> {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as AnyRow[]
  return new Set(cols.map((c) => String(c.name)))
}

function hasCol(cols: Set<string>, name: string) {
  return cols.has(name)
}


/**
 * Construit le delta d'une table avec soft delete.
 * - created: created_at >= since && (deleted_at IS NULL)
 * - updated: updated_at >= since && created_at < since && (deleted_at IS NULL)
 * - deleted: deleted_at >= since
 */
function buildTableDelta(params: {
  table: string
  idCol: string
  since: number
}): EntityDelta {
  const { table, idCol, since } = params
  const delta: EntityDelta = { created: [], updated: [], deleted: [] }

  const cols = tableColumns(table)

  const hasCreatedAt = hasCol(cols, 'created_at')
  const hasUpdatedAt = hasCol(cols, 'updated_at')
  const hasDeletedAt = hasCol(cols, 'deleted_at')

  // Sécurité minimale
  if (!hasCreatedAt && !hasUpdatedAt && !hasDeletedAt) {
    // table non syncable dans cet état
    return delta
  }

  // WHERE dynamique
  const whereParts: string[] = []
  const args: any[] = []

  if (hasCreatedAt) {
    whereParts.push('created_at >= ?')
    args.push(since)
  }

  if (hasUpdatedAt) {
    whereParts.push('updated_at >= ?')
    args.push(since)
  }

  if (hasDeletedAt) {
    whereParts.push('(deleted_at IS NOT NULL AND deleted_at >= ?)')
    args.push(since)
  }

  const where = whereParts.length ? whereParts.join(' OR ') : '1=0'

  const rows = db
    .prepare(`SELECT * FROM ${table} WHERE ${where}`)
    .all(...args) as AnyRow[]

  for (const r of rows) {
    const deletedAt = hasDeletedAt ? (r.deleted_at as number | null) : null
    const createdAt = hasCreatedAt ? Number(r.created_at ?? 0) : 0
    const updatedAt = hasUpdatedAt ? Number(r.updated_at ?? 0) : 0

    // 1) Deleted
    if (hasDeletedAt && deletedAt != null && deletedAt >= since) {
      delta.deleted.push({ id: r[idCol], deleted_at: deletedAt })
      continue
    }

    // 2) Exclure soft-deleted
    if (hasDeletedAt && deletedAt != null) continue

    // 3) Created vs Updated
    if (hasCreatedAt && createdAt >= since) {
      delta.created.push(r)
      continue
    }

    // Si pas created_at mais updated_at existe: tout est "updated"
    if (hasUpdatedAt && updatedAt >= since) {
      delta.updated.push(r)
      continue
    }
  }

  return delta
}


function buildSyncResult(since: number): SyncResult {
  const r = emptyResult()

  r.accountings = buildTableDelta({
    table: DbSchema.tAccountings,
    idCol: 'code',
    since,
  })

  r.transactions = buildTableDelta({
    table: DbSchema.tTransactions,
    idCol: 'tx_code',
    since,
  })

  r.goals = buildTableDelta({
    table: DbSchema.tGoals,
    idCol: 'id',
    since,
  })

  r.goalContribs = buildTableDelta({
    table: DbSchema.tGoalContribs,
    idCol: 'id',
    since,
  })

  r.debts = buildTableDelta({
    table: DbSchema.tDebts,
    idCol: 'id',
    since,
  })

  r.debtPayments = buildTableDelta({
    table: DbSchema.tDebtPayments,
    idCol: 'id',
    since,
  })

  r.savings = buildTableDelta({
    table: DbSchema.tSavings,
    idCol: 'id',
    since,
  })

  r.savingMoves = buildTableDelta({
    table: DbSchema.tSavingMoves,
    idCol: 'id',
    since,
  })

  r.autoSaves = buildTableDelta({
    table: DbSchema.tAutoSaves,
    idCol: 'id',
    since,
  })

  r.financeEvents = buildTableDelta({
    table: DbSchema.tFinanceEvents,
    idCol: 'id',
    since,
  })

  // settings: on suppose clé = "key"
  r.settings = buildTableDelta({
    table: DbSchema.tAppSettings,
    idCol: 'key',
    since,
  })

  return r
}

function summarize(data: SyncResult) {
  const totals = { created: 0, updated: 0, deleted: 0 }
  for (const k of Object.keys(data) as Array<keyof SyncResult>) {
    totals.created += data[k].created.length
    totals.updated += data[k].updated.length
    totals.deleted += data[k].deleted.length
  }
  return totals
}

/**
 * GET /api/sync?since=...
 * Pull deltas serveur
 */
export const sync = (req: Request, res: Response) => {
  try {
    const sinceTimestamp = parseSince(req.query.since)
    if (sinceTimestamp == null) {
      return res.status(400).json({
        error:
          'Le paramètre "since" est requis. Format: YYYY-MM-DDTHH:MM:SS ou timestamp en millisecondes',
      })
    }

    const now = Date.now()
    const data = buildSyncResult(sinceTimestamp)

    return res.json({
      since: sinceTimestamp,
      server_time: now,
      data,
      summary: summarize(data),
    })
  } catch (error: any) {
    console.error('Error syncing:', error?.message ?? error)
    console.error(error)
    return res.status(500).json({ error: 'Erreur lors de la synchronisation' })
  }
  
}

/* =========================================================
   PUSH + PULL (POST /api/sync)
   - applique changes (upserts + deletes) en transaction
   - gère conflits (existing.updated_at > since)
   - soft delete (deleted_at)
   - renvoie ensuite les deltas serveur depuis since
   ========================================================= */

type ChangeSet = {
  upserts?: AnyRow[]
  deletes?: AnyRow[] // attend au minimum { idCol: value } ou { key: value } etc.
}

type ChangesPayload = Partial<Record<keyof SyncResult, ChangeSet>>

function isObj(v: any) {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

function requireBodyFields(req: Request, res: Response) {
  const { device_id, client_time, since, changes } = req.body || {}
  if (!device_id || !client_time || since == null || !changes) {
    res.status(400).json({
      error: 'device_id, client_time, since et changes sont requis',
    })
    return null
  }
  return { device_id, client_time, since, changes }
}

function conflictIfNewer(existing: AnyRow | undefined, sinceTs: number): boolean {
  if (!existing) return false
  const up = Number(existing.updated_at ?? 0)
  return up > sinceTs
}

function softDeleteById(table: string, idCol: string, idVal: any, now: number) {
  db.prepare(
    `
    UPDATE ${table}
    SET deleted_at = ?, updated_at = ?
    WHERE ${idCol} = ?
  `
  ).run(now, now, idVal)
}

function undeleteOnUpsertRow(row: AnyRow) {
  // si le client renvoie deleted_at, on ignore et on remet null (on upsert = entité active)
  row.deleted_at = null
}

/**
 * Applique un upsert générique (select + conflict check + update/insert)
 * NOTE: pour les tables avec id auto-increment, on recommande que le mobile envoie un id stable.
 */
function applyUpsert(params: {
  table: string
  idCol: string
  row: AnyRow
  sinceTs: number
  now: number
  // SQL fragments spécifiques à chaque table:
  selectSql: string
  insertSql: string
  insertArgs: (row: AnyRow, now: number) => any[]
  updateSql: string
  updateArgs: (row: AnyRow, now: number) => any[]
}) {
  const { selectSql, insertSql, insertArgs, updateSql, updateArgs, row, sinceTs, now } = params
  const idVal = row[params.idCol]

  const existing = db.prepare(selectSql).get(idVal) as AnyRow | undefined
  if (conflictIfNewer(existing, sinceTs)) return { ok: false, conflict: true }

  undeleteOnUpsertRow(row)

  if (existing) {
    db.prepare(updateSql).run(...updateArgs(row, now))
  } else {
    db.prepare(insertSql).run(...insertArgs(row, now))
  }
  return { ok: true, conflict: false }
}

/**
 * POST /api/sync
 * Body:
 * {
 *   device_id: string,
 *   client_time: number,
 *   since: number | string(ISO|ts),
 *   changes: { transactions:{upserts:[],deletes:[]}, ... }
 * }
 */
export const pushSync = (req: Request, res: Response) => {
  try {
    const required = requireBodyFields(req, res)
    if (!required) return

    const { device_id, client_time, changes } = required
    const sinceTs = parseSince(required.since)
    if (sinceTs == null) {
      return res.status(400).json({ error: 'since invalide (ISO ou timestamp ms)' })
    }
    if (!isObj(changes)) {
      return res.status(400).json({ error: 'changes doit être un objet' })
    }

    const now = Date.now()

    const results = {
      applied: {
        accountings: { upserted: 0, deleted: 0 },
        transactions: { upserted: 0, deleted: 0 },
        goals: { upserted: 0, deleted: 0 },
        goalContribs: { upserted: 0, deleted: 0 },
        debts: { upserted: 0, deleted: 0 },
        debtPayments: { upserted: 0, deleted: 0 },
        savings: { upserted: 0, deleted: 0 },
        savingMoves: { upserted: 0, deleted: 0 },
        autoSaves: { upserted: 0, deleted: 0 },
        financeEvents: { upserted: 0, deleted: 0 },
        settings: { upserted: 0, deleted: 0 },
      },
      conflicts: [] as Array<{ entity: string; id: string | number; reason: string }>,
      errors: [] as Array<{ entity: string; id: string | number; error: string }>,
    }

    const txn = (db as any).transaction((fn: () => void) => fn())

    txn(() => {
      const c = changes as ChangesPayload

      /* ----------------- TRANSACTIONS ----------------- */
      if (c.transactions?.upserts) {
        for (const row of c.transactions.upserts) {
          try {
            const r = applyUpsert({
              table: DbSchema.tTransactions,
              idCol: 'tx_code',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tTransactions} WHERE tx_code = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tTransactions}
                (tx_code, accounting_code, kind, amount, label, note, category, tx_date, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (tx, t) => [
                tx.tx_code,
                tx.accounting_code,
                tx.kind,
                tx.amount,
                tx.label,
                tx.note ?? null,
                tx.category ?? null,
                tx.tx_date ?? t,
                tx.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tTransactions}
                SET accounting_code=?, kind=?, amount=?, label=?, note=?, category=?, tx_date=?, updated_at=?, deleted_at=NULL
                WHERE tx_code=?
              `,
              updateArgs: (tx, t) => [
                tx.accounting_code,
                tx.kind,
                tx.amount,
                tx.label,
                tx.note ?? null,
                tx.category ?? null,
                tx.tx_date ?? t,
                t,
                tx.tx_code,
              ],
            })

            if (!r.ok && r.conflict) {
              results.conflicts.push({
                entity: 'transaction',
                id: row.tx_code,
                reason: 'Entité modifiée côté serveur après la dernière synchronisation',
              })
            } else if (r.ok) {
              results.applied.transactions.upserted++
            }
          } catch (e: any) {
            results.errors.push({ entity: 'transaction', id: row.tx_code ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.transactions?.deletes) {
        for (const del of c.transactions.deletes) {
          try {
            const tx_code = del.tx_code
            if (!tx_code) continue

            const existing = db.prepare(`SELECT * FROM ${DbSchema.tTransactions} WHERE tx_code = ?`).get(tx_code) as AnyRow | undefined
            if (!existing) continue

            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({
                entity: 'transaction',
                id: tx_code,
                reason: 'Entité modifiée côté serveur après la dernière synchronisation',
              })
              continue
            }

            softDeleteById(DbSchema.tTransactions, 'tx_code', tx_code, now)
            results.applied.transactions.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'transaction', id: del.tx_code ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- ACCOUNTINGS ----------------- */
      if (c.accountings?.upserts) {
        for (const row of c.accountings.upserts) {
          try {
            const r = applyUpsert({
              table: DbSchema.tAccountings,
              idCol: 'code',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tAccountings} WHERE code = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tAccountings}
                (code, name, type, parent_code, currency, opening_balance, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (acc, t) => [
                acc.code,
                acc.name,
                acc.type,
                acc.parent_code ?? null,
                acc.currency ?? 'XAF',
                acc.opening_balance ?? 0,
                acc.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tAccountings}
                SET name=?, type=?, parent_code=?, currency=?, opening_balance=?, updated_at=?, deleted_at=NULL
                WHERE code=?
              `,
              updateArgs: (acc, t) => [
                acc.name,
                acc.type,
                acc.parent_code ?? null,
                acc.currency ?? 'XAF',
                acc.opening_balance ?? 0,
                t,
                acc.code,
              ],
            })

            if (!r.ok && r.conflict) {
              results.conflicts.push({
                entity: 'accounting',
                id: row.code,
                reason: 'Entité modifiée côté serveur après la dernière synchronisation',
              })
            } else if (r.ok) {
              results.applied.accountings.upserted++
            }
          } catch (e: any) {
            results.errors.push({ entity: 'accounting', id: row.code ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.accountings?.deletes) {
        for (const del of c.accountings.deletes) {
          try {
            const code = del.code
            if (!code) continue
            if (code === 'MASTER') {
              results.errors.push({ entity: 'accounting', id: code, error: 'Impossible de supprimer le compte MASTER' })
              continue
            }

            const existing = db.prepare(`SELECT * FROM ${DbSchema.tAccountings} WHERE code = ?`).get(code) as AnyRow | undefined
            if (!existing) continue

            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({
                entity: 'accounting',
                id: code,
                reason: 'Entité modifiée côté serveur après la dernière synchronisation',
              })
              continue
            }

            softDeleteById(DbSchema.tAccountings, 'code', code, now)
            results.applied.accountings.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'accounting', id: del.code ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- GOALS ----------------- */
      if (c.goals?.upserts) {
        for (const row of c.goals.upserts) {
          try {
            // IMPORTANT: id doit être stable si vous voulez une vraie sync offline
            const r = applyUpsert({
              table: DbSchema.tGoals,
              idCol: 'id',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tGoals} WHERE id = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tGoals}
                (id, title, note, start_amount, target_amount, deadline, archived, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (g, t) => [
                g.id,
                g.title,
                g.note ?? null,
                g.start_amount ?? 0,
                g.target_amount,
                g.deadline ?? null,
                g.archived ?? 0,
                g.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tGoals}
                SET title=?, note=?, start_amount=?, target_amount=?, deadline=?, archived=?, updated_at=?, deleted_at=NULL
                WHERE id=?
              `,
              updateArgs: (g, t) => [
                g.title,
                g.note ?? null,
                g.start_amount ?? 0,
                g.target_amount,
                g.deadline ?? null,
                g.archived ?? 0,
                t,
                g.id,
              ],
            })

            if (!r.ok && r.conflict) {
              results.conflicts.push({ entity: 'goal', id: row.id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
            } else if (r.ok) {
              results.applied.goals.upserted++
            }
          } catch (e: any) {
            results.errors.push({ entity: 'goal', id: row.id ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.goals?.deletes) {
        for (const del of c.goals.deletes) {
          try {
            const id = del.id
            if (id == null) continue

            const existing = db.prepare(`SELECT * FROM ${DbSchema.tGoals} WHERE id = ?`).get(id) as AnyRow | undefined
            if (!existing) continue

            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'goal', id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }

            softDeleteById(DbSchema.tGoals, 'id', id, now)
            results.applied.goals.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'goal', id: del.id ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- GOAL CONTRIBUTIONS ----------------- */
      if (c.goalContribs?.upserts) {
        for (const row of c.goalContribs.upserts) {
          try {
            const r = applyUpsert({
              table: DbSchema.tGoalContribs,
              idCol: 'id',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tGoalContribs} WHERE id = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tGoalContribs}
                (id, goal_id, amount, note, occurred_at, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (x, t) => [
                x.id,
                x.goal_id,
                x.amount,
                x.note ?? null,
                x.occurred_at ?? t,
                x.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tGoalContribs}
                SET goal_id=?, amount=?, note=?, occurred_at=?, updated_at=?, deleted_at=NULL
                WHERE id=?
              `,
              updateArgs: (x, t) => [
                x.goal_id,
                x.amount,
                x.note ?? null,
                x.occurred_at ?? t,
                t,
                x.id,
              ],
            })

            if (!r.ok && r.conflict) {
              results.conflicts.push({ entity: 'goalContrib', id: row.id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
            } else if (r.ok) {
              results.applied.goalContribs.upserted++
            }
          } catch (e: any) {
            results.errors.push({ entity: 'goalContrib', id: row.id ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.goalContribs?.deletes) {
        for (const del of c.goalContribs.deletes) {
          try {
            const id = del.id
            if (id == null) continue

            const existing = db.prepare(`SELECT * FROM ${DbSchema.tGoalContribs} WHERE id = ?`).get(id) as AnyRow | undefined
            if (!existing) continue

            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'goalContrib', id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }

            softDeleteById(DbSchema.tGoalContribs, 'id', id, now)
            results.applied.goalContribs.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'goalContrib', id: del.id ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- DEBTS ----------------- */
      if (c.debts?.upserts) {
        for (const row of c.debts.upserts) {
          try {
            const r = applyUpsert({
              table: DbSchema.tDebts,
              idCol: 'id',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tDebts} WHERE id = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tDebts}
                (id, name, principal_amount, remaining_amount, type, lender, note, due_date, closed, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (x, t) => [
                x.id,
                x.name,
                x.principal_amount,
                x.remaining_amount,
                x.type,
                x.lender ?? null,
                x.note ?? null,
                x.due_date ?? null,
                x.closed ?? 0,
                x.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tDebts}
                SET name=?, principal_amount=?, remaining_amount=?, type=?, lender=?, note=?, due_date=?, closed=?, updated_at=?, deleted_at=NULL
                WHERE id=?
              `,
              updateArgs: (x, t) => [
                x.name,
                x.principal_amount,
                x.remaining_amount,
                x.type,
                x.lender ?? null,
                x.note ?? null,
                x.due_date ?? null,
                x.closed ?? 0,
                t,
                x.id,
              ],
            })

            if (!r.ok && r.conflict) results.conflicts.push({ entity: 'debt', id: row.id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
            else if (r.ok) results.applied.debts.upserted++
          } catch (e: any) {
            results.errors.push({ entity: 'debt', id: row.id ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.debts?.deletes) {
        for (const del of c.debts.deletes) {
          try {
            const id = del.id
            if (id == null) continue
            const existing = db.prepare(`SELECT * FROM ${DbSchema.tDebts} WHERE id = ?`).get(id) as AnyRow | undefined
            if (!existing) continue
            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'debt', id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }
            softDeleteById(DbSchema.tDebts, 'id', id, now)
            results.applied.debts.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'debt', id: del.id ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- DEBT PAYMENTS ----------------- */
      if (c.debtPayments?.upserts) {
        for (const row of c.debtPayments.upserts) {
          try {
            const r = applyUpsert({
              table: DbSchema.tDebtPayments,
              idCol: 'id',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tDebtPayments} WHERE id = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tDebtPayments}
                (id, debt_id, amount, note, occurred_at, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (x, t) => [
                x.id,
                x.debt_id,
                x.amount,
                x.note ?? null,
                x.occurred_at ?? t,
                x.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tDebtPayments}
                SET debt_id=?, amount=?, note=?, occurred_at=?, updated_at=?, deleted_at=NULL
                WHERE id=?
              `,
              updateArgs: (x, t) => [
                x.debt_id,
                x.amount,
                x.note ?? null,
                x.occurred_at ?? t,
                t,
                x.id,
              ],
            })

            if (!r.ok && r.conflict) results.conflicts.push({ entity: 'debtPayment', id: row.id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
            else if (r.ok) results.applied.debtPayments.upserted++
          } catch (e: any) {
            results.errors.push({ entity: 'debtPayment', id: row.id ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.debtPayments?.deletes) {
        for (const del of c.debtPayments.deletes) {
          try {
            const id = del.id
            if (id == null) continue
            const existing = db.prepare(`SELECT * FROM ${DbSchema.tDebtPayments} WHERE id = ?`).get(id) as AnyRow | undefined
            if (!existing) continue
            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'debtPayment', id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }
            softDeleteById(DbSchema.tDebtPayments, 'id', id, now)
            results.applied.debtPayments.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'debtPayment', id: del.id ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- SAVINGS ----------------- */
      if (c.savings?.upserts) {
        for (const row of c.savings.upserts) {
          try {
            const r = applyUpsert({
              table: DbSchema.tSavings,
              idCol: 'id',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tSavings} WHERE id = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tSavings}
                (id, title, note, accounting_code, archived, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (x, t) => [
                x.id,
                x.title,
                x.note ?? null,
                x.accounting_code ?? null,
                x.archived ?? 0,
                x.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tSavings}
                SET title=?, note=?, accounting_code=?, archived=?, updated_at=?, deleted_at=NULL
                WHERE id=?
              `,
              updateArgs: (x, t) => [
                x.title,
                x.note ?? null,
                x.accounting_code ?? null,
                x.archived ?? 0,
                t,
                x.id,
              ],
            })

            if (!r.ok && r.conflict) results.conflicts.push({ entity: 'saving', id: row.id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
            else if (r.ok) results.applied.savings.upserted++
          } catch (e: any) {
            results.errors.push({ entity: 'saving', id: row.id ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.savings?.deletes) {
        for (const del of c.savings.deletes) {
          try {
            const id = del.id
            if (id == null) continue
            const existing = db.prepare(`SELECT * FROM ${DbSchema.tSavings} WHERE id = ?`).get(id) as AnyRow | undefined
            if (!existing) continue
            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'saving', id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }
            softDeleteById(DbSchema.tSavings, 'id', id, now)
            results.applied.savings.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'saving', id: del.id ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- SAVING MOVES ----------------- */
      if (c.savingMoves?.upserts) {
        for (const row of c.savingMoves.upserts) {
          try {
            const r = applyUpsert({
              table: DbSchema.tSavingMoves,
              idCol: 'id',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tSavingMoves} WHERE id = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tSavingMoves}
                (id, saving_id, direction, amount, note, occurred_at, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (x, t) => [
                x.id,
                x.saving_id,
                x.direction,
                x.amount,
                x.note ?? null,
                x.occurred_at ?? t,
                x.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tSavingMoves}
                SET saving_id=?, direction=?, amount=?, note=?, occurred_at=?, updated_at=?, deleted_at=NULL
                WHERE id=?
              `,
              updateArgs: (x, t) => [
                x.saving_id,
                x.direction,
                x.amount,
                x.note ?? null,
                x.occurred_at ?? t,
                t,
                x.id,
              ],
            })

            if (!r.ok && r.conflict) results.conflicts.push({ entity: 'savingMove', id: row.id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
            else if (r.ok) results.applied.savingMoves.upserted++
          } catch (e: any) {
            results.errors.push({ entity: 'savingMove', id: row.id ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.savingMoves?.deletes) {
        for (const del of c.savingMoves.deletes) {
          try {
            const id = del.id
            if (id == null) continue
            const existing = db.prepare(`SELECT * FROM ${DbSchema.tSavingMoves} WHERE id = ?`).get(id) as AnyRow | undefined
            if (!existing) continue
            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'savingMove', id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }
            softDeleteById(DbSchema.tSavingMoves, 'id', id, now)
            results.applied.savingMoves.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'savingMove', id: del.id ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- AUTO SAVES ----------------- */
      if (c.autoSaves?.upserts) {
        for (const row of c.autoSaves.upserts) {
          try {
            const r = applyUpsert({
              table: DbSchema.tAutoSaves,
              idCol: 'id',
              row,
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tAutoSaves} WHERE id = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tAutoSaves}
                (id, title, note, amount, cadence, enabled, start_at, last_run_at, accounting_code, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (x, t) => [
                x.id,
                x.title,
                x.note ?? null,
                x.amount,
                x.cadence,
                x.enabled ?? 1,
                x.start_at ?? t,
                x.last_run_at ?? null,
                x.accounting_code ?? null,
                x.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tAutoSaves}
                SET title=?, note=?, amount=?, cadence=?, enabled=?, start_at=?, last_run_at=?, accounting_code=?, updated_at=?, deleted_at=NULL
                WHERE id=?
              `,
              updateArgs: (x, t) => [
                x.title,
                x.note ?? null,
                x.amount,
                x.cadence,
                x.enabled ?? 1,
                x.start_at ?? t,
                x.last_run_at ?? null,
                x.accounting_code ?? null,
                t,
                x.id,
              ],
            })

            if (!r.ok && r.conflict) results.conflicts.push({ entity: 'autoSave', id: row.id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
            else if (r.ok) results.applied.autoSaves.upserted++
          } catch (e: any) {
            results.errors.push({ entity: 'autoSave', id: row.id ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.autoSaves?.deletes) {
        for (const del of c.autoSaves.deletes) {
          try {
            const id = del.id
            if (id == null) continue
            const existing = db.prepare(`SELECT * FROM ${DbSchema.tAutoSaves} WHERE id = ?`).get(id) as AnyRow | undefined
            if (!existing) continue
            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'autoSave', id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }
            softDeleteById(DbSchema.tAutoSaves, 'id', id, now)
            results.applied.autoSaves.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'autoSave', id: del.id ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- FINANCE EVENTS ----------------- */
      if (c.financeEvents?.upserts) {
        for (const row of c.financeEvents.upserts) {
          try {
            const metaStr = row.meta != null && typeof row.meta !== 'string' ? JSON.stringify(row.meta) : row.meta

            const r = applyUpsert({
              table: DbSchema.tFinanceEvents,
              idCol: 'id',
              row: { ...row, meta: metaStr },
              sinceTs,
              now,
              selectSql: `SELECT * FROM ${DbSchema.tFinanceEvents} WHERE id = ?`,
              insertSql: `
                INSERT INTO ${DbSchema.tFinanceEvents}
                (id, type, title, ref_id, amount, meta, occurred_at, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
              `,
              insertArgs: (x, t) => [
                x.id,
                x.type,
                x.title,
                x.ref_id ?? null,
                x.amount ?? null,
                x.meta ?? null,
                x.occurred_at ?? t,
                x.created_at ?? t,
                t,
              ],
              updateSql: `
                UPDATE ${DbSchema.tFinanceEvents}
                SET type=?, title=?, ref_id=?, amount=?, meta=?, occurred_at=?, updated_at=?, deleted_at=NULL
                WHERE id=?
              `,
              updateArgs: (x, t) => [
                x.type,
                x.title,
                x.ref_id ?? null,
                x.amount ?? null,
                x.meta ?? null,
                x.occurred_at ?? t,
                t,
                x.id,
              ],
            })

            if (!r.ok && r.conflict) results.conflicts.push({ entity: 'financeEvent', id: row.id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
            else if (r.ok) results.applied.financeEvents.upserted++
          } catch (e: any) {
            results.errors.push({ entity: 'financeEvent', id: row.id ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.financeEvents?.deletes) {
        for (const del of c.financeEvents.deletes) {
          try {
            const id = del.id
            if (id == null) continue
            const existing = db.prepare(`SELECT * FROM ${DbSchema.tFinanceEvents} WHERE id = ?`).get(id) as AnyRow | undefined
            if (!existing) continue
            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'financeEvent', id, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }
            softDeleteById(DbSchema.tFinanceEvents, 'id', id, now)
            results.applied.financeEvents.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'financeEvent', id: del.id ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }

      /* ----------------- SETTINGS ----------------- */
      if (c.settings?.upserts) {
        for (const row of c.settings.upserts) {
          try {
            const key = row.key
            if (!key) continue

            const existing = db.prepare(`SELECT * FROM ${DbSchema.tAppSettings} WHERE key = ?`).get(key) as AnyRow | undefined
            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'setting', id: key, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }

            // upsert simple
            db.prepare(`
              INSERT INTO ${DbSchema.tAppSettings} (key, value, created_at, updated_at, deleted_at)
              VALUES (?, ?, ?, ?, NULL)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, deleted_at = NULL
            `).run(key, row.value ?? null, row.created_at ?? now, now)

            results.applied.settings.upserted++
          } catch (e: any) {
            results.errors.push({ entity: 'setting', id: row.key ?? 'unknown', error: e.message ?? 'Erreur upsert' })
          }
        }
      }

      if (c.settings?.deletes) {
        for (const del of c.settings.deletes) {
          try {
            const key = del.key
            if (!key) continue

            const existing = db.prepare(`SELECT * FROM ${DbSchema.tAppSettings} WHERE key = ?`).get(key) as AnyRow | undefined
            if (!existing) continue
            if (conflictIfNewer(existing, sinceTs)) {
              results.conflicts.push({ entity: 'setting', id: key, reason: 'Entité modifiée côté serveur après la dernière synchronisation' })
              continue
            }

            softDeleteById(DbSchema.tAppSettings, 'key', key, now)
            results.applied.settings.deleted++
          } catch (e: any) {
            results.errors.push({ entity: 'setting', id: del.key ?? 'unknown', error: e.message ?? 'Erreur delete' })
          }
        }
      }
    })

    // PUSH + PULL: retourner aussi les deltas serveur depuis since
    const data = buildSyncResult(sinceTs)

    return res.json({
      device_id,
      client_time,
      since: sinceTs,
      server_time: now,
      results,
      data,
      summary: {
        ...summarize(data),
        conflictsCount: results.conflicts.length,
        errorsCount: results.errors.length,
      },
    })
  } catch (error) {
    console.error('Error pushing sync:', error)
    return res.status(500).json({ error: 'Erreur lors de la synchronisation push' })
  }
}
