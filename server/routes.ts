import { Router } from 'express'
import { db } from './db/index.js'
import { contracts, alerts, marketSnapshots } from './db/schema.js'
import { eq, desc, and, gte } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
const now = () => new Date().toISOString()

// ─── Contracts ────────────────────────────────────────────────────────────────
router.get('/contracts', (_req, res) => {
  const rows = db.select().from(contracts).orderBy(desc(contracts.createdAt)).all()
  res.json(rows)
})

router.post('/contracts', (req, res) => {
  const id = uuidv4()
  const ts = now()
  const row = { ...req.body, id, createdAt: ts, updatedAt: ts }
  db.insert(contracts).values(row).run()
  res.json(row)
})

router.put('/contracts/:id', (req, res) => {
  const { id } = req.params
  const updates = { ...req.body, updatedAt: now() }
  db.update(contracts).set(updates).where(eq(contracts.id, id)).run()
  const row = db.select().from(contracts).where(eq(contracts.id, id)).get()
  res.json(row)
})

router.delete('/contracts/:id', (req, res) => {
  db.delete(contracts).where(eq(contracts.id, req.params.id)).run()
  res.json({ ok: true })
})

// ─── Alerts ───────────────────────────────────────────────────────────────────
router.get('/alerts', (_req, res) => {
  const rows = db.select().from(alerts).orderBy(desc(alerts.createdAt)).all()
  res.json(rows)
})

router.post('/alerts', (req, res) => {
  const id = uuidv4()
  const row = { ...req.body, id, createdAt: now() }
  db.insert(alerts).values(row).run()
  res.json(row)
})

router.put('/alerts/:id', (req, res) => {
  db.update(alerts).set(req.body).where(eq(alerts.id, req.params.id)).run()
  const row = db.select().from(alerts).where(eq(alerts.id, req.params.id)).get()
  res.json(row)
})

router.delete('/alerts/:id', (req, res) => {
  db.delete(alerts).where(eq(alerts.id, req.params.id)).run()
  res.json({ ok: true })
})

// ─── Market Snapshots ─────────────────────────────────────────────────────────
router.get('/market/snapshot', (_req, res) => {
  // Return latest snapshot per crop
  const corn = db.select().from(marketSnapshots)
    .where(eq(marketSnapshots.crop, 'corn'))
    .orderBy(desc(marketSnapshots.snapshotAt))
    .limit(1).get()
  const beans = db.select().from(marketSnapshots)
    .where(eq(marketSnapshots.crop, 'soybeans'))
    .orderBy(desc(marketSnapshots.snapshotAt))
    .limit(1).get()
  res.json({ corn: corn || null, beans: beans || null })
})

router.post('/market/snapshot', (req, res) => {
  const entries = req.body as Array<{
    crop: string, futuresMonth: string, futuresPrice: number,
    cashPrice: number, basis: number, impliedVol?: number
  }>
  const rows = entries.map(e => ({
    id: uuidv4(),
    ...e,
    snapshotAt: now(),
  }))
  rows.forEach(r => db.insert(marketSnapshots).values(r).run())
  res.json(rows)
})

router.get('/market/history', (req, res) => {
  const crop = (req.query.crop as string) || 'corn'
  const days = parseInt((req.query.days as string) || '30', 10)
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const rows = db.select().from(marketSnapshots)
    .where(and(eq(marketSnapshots.crop, crop), gte(marketSnapshots.snapshotAt, since)))
    .orderBy(marketSnapshots.snapshotAt)
    .all()
  res.json(rows)
})

export default router
