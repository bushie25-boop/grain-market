import { pgTable, text, real, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const contracts = pgTable('contracts', {
  id: text('id').primaryKey(),
  crop: text('crop').notNull(),
  contractType: text('contract_type').notNull(),
  bushels: real('bushels').notNull(),
  price: real('price').notNull(),
  basis: real('basis'),
  futuresMonth: text('futures_month'),
  elevator: text('elevator').notNull(),
  deliveryStart: text('delivery_start'),
  deliveryEnd: text('delivery_end'),
  status: text('status').notNull().default('open'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  crop: text('crop').notNull(),
  alertType: text('alert_type').notNull(),
  targetValue: real('target_value').notNull(),
  futuresMonth: text('futures_month'),
  active: integer('active').notNull().default(1),
  createdAt: text('created_at').notNull(),
});

export const marketSnapshots = pgTable('market_snapshots', {
  id: text('id').primaryKey(),
  cornFutures: real('corn_futures'),
  cornCash: real('corn_cash'),
  cornBasis: real('corn_basis'),
  soyFutures: real('soy_futures'),
  soyCash: real('soy_cash'),
  soyBasis: real('soy_basis'),
  snapshotAt: text('snapshot_at').notNull(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertSnapshotSchema = createInsertSchema(marketSnapshots).omit({ id: true });

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Alert = typeof alerts.$inferSelect;
export type MarketSnapshot = typeof marketSnapshots.$inferSelect;
