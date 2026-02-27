#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");

// server/db.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  alerts: () => alerts,
  contracts: () => contracts,
  insertAlertSchema: () => insertAlertSchema,
  insertContractSchema: () => insertContractSchema,
  insertSnapshotSchema: () => insertSnapshotSchema,
  marketSnapshots: () => marketSnapshots
});
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var contracts = (0, import_pg_core.pgTable)("contracts", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  crop: (0, import_pg_core.text)("crop").notNull(),
  contractType: (0, import_pg_core.text)("contract_type").notNull(),
  bushels: (0, import_pg_core.real)("bushels").notNull(),
  price: (0, import_pg_core.real)("price").notNull(),
  basis: (0, import_pg_core.real)("basis"),
  futuresMonth: (0, import_pg_core.text)("futures_month"),
  elevator: (0, import_pg_core.text)("elevator").notNull(),
  deliveryStart: (0, import_pg_core.text)("delivery_start"),
  deliveryEnd: (0, import_pg_core.text)("delivery_end"),
  status: (0, import_pg_core.text)("status").notNull().default("open"),
  notes: (0, import_pg_core.text)("notes"),
  createdAt: (0, import_pg_core.text)("created_at").notNull(),
  updatedAt: (0, import_pg_core.text)("updated_at").notNull()
});
var alerts = (0, import_pg_core.pgTable)("alerts", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  crop: (0, import_pg_core.text)("crop").notNull(),
  alertType: (0, import_pg_core.text)("alert_type").notNull(),
  targetValue: (0, import_pg_core.real)("target_value").notNull(),
  futuresMonth: (0, import_pg_core.text)("futures_month"),
  active: (0, import_pg_core.integer)("active").notNull().default(1),
  createdAt: (0, import_pg_core.text)("created_at").notNull()
});
var marketSnapshots = (0, import_pg_core.pgTable)("market_snapshots", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  cornFutures: (0, import_pg_core.real)("corn_futures"),
  cornCash: (0, import_pg_core.real)("corn_cash"),
  cornBasis: (0, import_pg_core.real)("corn_basis"),
  soyFutures: (0, import_pg_core.real)("soy_futures"),
  soyCash: (0, import_pg_core.real)("soy_cash"),
  soyBasis: (0, import_pg_core.real)("soy_basis"),
  snapshotAt: (0, import_pg_core.text)("snapshot_at").notNull()
});
var insertContractSchema = (0, import_drizzle_zod.createInsertSchema)(contracts).omit({ id: true, createdAt: true, updatedAt: true });
var insertAlertSchema = (0, import_drizzle_zod.createInsertSchema)(alerts).omit({ id: true, createdAt: true });
var insertSnapshotSchema = (0, import_drizzle_zod.createInsertSchema)(marketSnapshots).omit({ id: true });

// server/db.ts
var pool = new import_pg.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// server/routes.ts
var import_drizzle_orm = require("drizzle-orm");
var import_crypto = require("crypto");
function registerRoutes(app2) {
  app2.get("/api/contracts", async (_req, res) => {
    const rows = await db.select().from(contracts).orderBy(contracts.createdAt);
    res.json(rows);
  });
  app2.post("/api/contracts", async (req, res) => {
    const data = insertContractSchema.parse(req.body);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const row = await db.insert(contracts).values({ ...data, id: (0, import_crypto.randomUUID)(), createdAt: now, updatedAt: now }).returning();
    res.json(row[0]);
  });
  app2.put("/api/contracts/:id", async (req, res) => {
    const data = insertContractSchema.partial().parse(req.body);
    const row = await db.update(contracts).set({ ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where((0, import_drizzle_orm.eq)(contracts.id, req.params.id)).returning();
    res.json(row[0]);
  });
  app2.delete("/api/contracts/:id", async (req, res) => {
    await db.delete(contracts).where((0, import_drizzle_orm.eq)(contracts.id, req.params.id));
    res.json({ ok: true });
  });
  app2.get("/api/alerts", async (_req, res) => {
    const rows = await db.select().from(alerts).where((0, import_drizzle_orm.eq)(alerts.active, 1));
    res.json(rows);
  });
  app2.post("/api/alerts", async (req, res) => {
    const data = insertAlertSchema.parse(req.body);
    const row = await db.insert(alerts).values({ ...data, id: (0, import_crypto.randomUUID)(), createdAt: (/* @__PURE__ */ new Date()).toISOString() }).returning();
    res.json(row[0]);
  });
  app2.delete("/api/alerts/:id", async (req, res) => {
    await db.delete(alerts).where((0, import_drizzle_orm.eq)(alerts.id, req.params.id));
    res.json({ ok: true });
  });
  app2.get("/api/market/latest", async (_req, res) => {
    const all = await db.select().from(marketSnapshots);
    const latest = all.sort((a, b) => b.snapshotAt.localeCompare(a.snapshotAt))[0] || null;
    res.json(latest);
  });
  app2.get("/api/market/history", async (req, res) => {
    const days = parseInt(req.query.days || "30");
    const since = new Date(Date.now() - days * 864e5).toISOString();
    const all = await db.select().from(marketSnapshots);
    const filtered = all.filter((s) => s.snapshotAt >= since).sort((a, b) => a.snapshotAt.localeCompare(b.snapshotAt));
    res.json(filtered);
  });
  app2.post("/api/market/snapshot", async (req, res) => {
    const { cornFutures, cornCash, cornBasis, soyFutures, soyCash, soyBasis } = req.body;
    const row = await db.insert(marketSnapshots).values({
      id: (0, import_crypto.randomUUID)(),
      cornFutures,
      cornCash,
      cornBasis,
      soyFutures,
      soyCash,
      soyBasis,
      snapshotAt: (/* @__PURE__ */ new Date()).toISOString()
    }).returning();
    res.json(row[0]);
  });
}

// server/index.ts
var import_meta = {};
var __dirname = import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
var app = (0, import_express.default)();
var PORT = parseInt(process.env.PORT || "3000");
app.use(import_express.default.json());
registerRoutes(app);
if (process.env.NODE_ENV === "production") {
  app.use(import_express.default.static(import_path.default.resolve(__dirname, "../dist/public")));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(import_path.default.resolve(__dirname, "../dist/public/index.html"));
  });
}
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\u{1F33D} Grain Market running on port ${PORT}`);
});
