import { Express } from 'express';
import { db } from './db.js';
import { contracts, alerts, marketSnapshots, insertContractSchema, insertAlertSchema } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export function registerRoutes(app: Express) {
  // Contracts
  app.get('/api/contracts', async (_req, res) => {
    const rows = await db.select().from(contracts).orderBy(contracts.createdAt);
    res.json(rows);
  });

  app.post('/api/contracts', async (req, res) => {
    const data = insertContractSchema.parse(req.body);
    const now = new Date().toISOString();
    const row = await db.insert(contracts).values({ ...data, id: randomUUID(), createdAt: now, updatedAt: now }).returning();
    res.json(row[0]);
  });

  app.put('/api/contracts/:id', async (req, res) => {
    const data = insertContractSchema.partial().parse(req.body);
    const row = await db.update(contracts).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(contracts.id, req.params.id)).returning();
    res.json(row[0]);
  });

  app.delete('/api/contracts/:id', async (req, res) => {
    await db.delete(contracts).where(eq(contracts.id, req.params.id));
    res.json({ ok: true });
  });

  // Alerts
  app.get('/api/alerts', async (_req, res) => {
    const rows = await db.select().from(alerts).where(eq(alerts.active, 1));
    res.json(rows);
  });

  app.post('/api/alerts', async (req, res) => {
    const data = insertAlertSchema.parse(req.body);
    const row = await db.insert(alerts).values({ ...data, id: randomUUID(), createdAt: new Date().toISOString() }).returning();
    res.json(row[0]);
  });

  app.delete('/api/alerts/:id', async (req, res) => {
    await db.delete(alerts).where(eq(alerts.id, req.params.id));
    res.json({ ok: true });
  });

  // Market snapshots
  app.get('/api/market/latest', async (_req, res) => {
    const all = await db.select().from(marketSnapshots);
    const latest = all.sort((a, b) => b.snapshotAt.localeCompare(a.snapshotAt))[0] || null;
    res.json(latest);
  });

  app.get('/api/market/history', async (req, res) => {
    const days = parseInt(req.query.days as string || '30');
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const all = await db.select().from(marketSnapshots);
    const filtered = all.filter(s => s.snapshotAt >= since).sort((a, b) => a.snapshotAt.localeCompare(b.snapshotAt));
    res.json(filtered);
  });

  app.post('/api/market/snapshot', async (req, res) => {
    const { cornFutures, cornCash, cornBasis, soyFutures, soyCash, soyBasis } = req.body;
    const row = await db.insert(marketSnapshots).values({
      id: randomUUID(),
      cornFutures, cornCash, cornBasis,
      soyFutures, soyCash, soyBasis,
      snapshotAt: new Date().toISOString(),
    }).returning();
    res.json(row[0]);
  });
}
