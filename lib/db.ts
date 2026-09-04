import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// SQLite store. A single file lives at <repoRoot>/data/motiongrid.db. It's only
// ever touched by server code (Server Actions / Server Components), so the
// native addon is never shipped to the browser.
//
// The database is opened lazily on first use, not at module evaluation, so
// importing this module is side-effect free. That keeps non-database server
// actions (e.g. admin sign-in) working on hosts with read-only filesystems
// (Vercel, Netlify, etc.) where a local SQLite file cannot be opened at all.
// ---------------------------------------------------------------------------

const dbPath = join(process.cwd(), "data", "motiongrid.db");

let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  try {
    mkdirSync(dirname(dbPath), { recursive: true });
    dbInstance = new Database(dbPath);
  } catch (err) {
    throw new Error(
      `Cannot open the local SQLite store at ${dbPath}. ` +
        `If this is running on a serverless host (Vercel, Netlify, …), the ` +
        `filesystem is read-only and SQLite cannot persist data there — ` +
        `migrate demo request storage to Supabase or another hosted database. ` +
        `Original error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  dbInstance.pragma("journal_mode = WAL");

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS demo_requests (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      company       TEXT    NOT NULL DEFAULT '',
      email         TEXT    NOT NULL,
      phone         TEXT    NOT NULL DEFAULT '',
      message       TEXT    NOT NULL DEFAULT '',
      status        TEXT    NOT NULL DEFAULT 'new', -- new | contacted | archived
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payfast_payments (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      pf_payment_id   TEXT    NOT NULL DEFAULT '',
      item_name       TEXT    NOT NULL DEFAULT '',
      name_first      TEXT    NOT NULL DEFAULT '',
      name_last       TEXT    NOT NULL DEFAULT '',
      email_address   TEXT    NOT NULL DEFAULT '',
      amount_gross    REAL    NOT NULL DEFAULT 0,
      amount_fee      REAL    NOT NULL DEFAULT 0,
      amount_net      REAL    NOT NULL DEFAULT 0,
      currency        TEXT    NOT NULL DEFAULT 'ZAR',
      status          TEXT    NOT NULL DEFAULT 'pending', -- pending | complete | failed | cancelled
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return dbInstance;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DemoRequestStatus = "new" | "contacted" | "archived";

export type DemoRequest = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  status: DemoRequestStatus;
  created_at: string;
};

export type PayFastPaymentStatus =
  | "pending"
  | "complete"
  | "failed"
  | "cancelled";

export type PayFastPayment = {
  id: number;
  pf_payment_id: string;
  item_name: string;
  name_first: string;
  name_last: string;
  email_address: string;
  amount_gross: number;
  amount_fee: number;
  amount_net: number;
  currency: string;
  status: PayFastPaymentStatus;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Demo requests
// ---------------------------------------------------------------------------
export function insertDemoRequest(input: {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}): void {
  getDb()
    .prepare(
      `INSERT INTO demo_requests (name, company, email, phone, message)
       VALUES (@name, @company, @email, @phone, @message)`
    )
    .run(input);
}

export function listDemoRequests(): DemoRequest[] {
  return getDb()
    .prepare(`SELECT * FROM demo_requests ORDER BY id DESC`)
    .all() as DemoRequest[];
}

export function updateDemoRequestStatus(
  id: number,
  status: DemoRequestStatus
): void {
  getDb()
    .prepare(`UPDATE demo_requests SET status = ? WHERE id = ?`)
    .run(status, id);
}

export function deleteDemoRequest(id: number): void {
  getDb().prepare(`DELETE FROM demo_requests WHERE id = ?`).run(id);
}

// ---------------------------------------------------------------------------
// PayFast payments — read-only for now (no ITN webhook wired up yet).
// Rows are expected to be written by a future /api/payfast/itn route handler.
// ---------------------------------------------------------------------------
export function listPayFastPayments(): PayFastPayment[] {
  return getDb()
    .prepare(`SELECT * FROM payfast_payments ORDER BY id DESC`)
    .all() as PayFastPayment[];
}
