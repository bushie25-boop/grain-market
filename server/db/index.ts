import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../../grain-market.db')

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

// Create tables if not exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    company_id TEXT DEFAULT 'root-risk',
    crop TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    bushels REAL NOT NULL,
    price REAL NOT NULL,
    basis REAL,
    futures_month TEXT,
    elevator TEXT NOT NULL,
    delivery_start TEXT,
    delivery_end TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    crop TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    target_value REAL NOT NULL,
    futures_month TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    notified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS market_snapshots (
    id TEXT PRIMARY KEY,
    crop TEXT NOT NULL,
    futures_month TEXT NOT NULL,
    futures_price REAL NOT NULL,
    cash_price REAL NOT NULL,
    basis REAL NOT NULL,
    implied_vol REAL,
    snapshot_at TEXT NOT NULL
  );
`)

export default db
