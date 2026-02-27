import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const contracts = sqliteTable('contracts', {
  id: text('id').primaryKey(),
  companyId: text('company_id').default('root-risk'),
  crop: text('crop').notNull(), // 'corn' | 'soybeans'
  contractType: text('contract_type').notNull(), // 'cash' | 'basis' | 'htc' | 'futures_only' | 'dp' | 'option'
  bushels: real('bushels').notNull(),
  price: real('price').notNull(),
  basis: real('basis'),
  futuresMonth: text('futures_month'),
  elevator: text('elevator').notNull(),
  deliveryStart: text('delivery_start'),
  deliveryEnd: text('delivery_end'),
  status: text('status').default('open').notNull(), // 'open' | 'delivered' | 'cancelled'
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  crop: text('crop').notNull(),
  alertType: text('alert_type').notNull(), // 'price_above' | 'price_below' | 'basis_above' | 'basis_below'
  targetValue: real('target_value').notNull(),
  futuresMonth: text('futures_month'),
  active: integer('active').default(1).notNull(),
  notified: integer('notified').default(0).notNull(),
  createdAt: text('created_at').notNull(),
})

export const marketSnapshots = sqliteTable('market_snapshots', {
  id: text('id').primaryKey(),
  crop: text('crop').notNull(),
  futuresMonth: text('futures_month').notNull(),
  futuresPrice: real('futures_price').notNull(),
  cashPrice: real('cash_price').notNull(),
  basis: real('basis').notNull(),
  impliedVol: real('implied_vol'),
  snapshotAt: text('snapshot_at').notNull(),
})
