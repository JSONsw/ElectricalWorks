import initSqlJs, { Database } from 'sql.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Use /tmp for serverless environments (Netlify, Vercel, etc.)
// This is the only writable directory in serverless functions
const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const dataDir = isServerless ? '/tmp' : join(process.cwd(), 'data');
const dbPath = join(dataDir, 'crm.db');

let db: Database | null = null;
let dbInitialized = false;
let initPromise: Promise<Database> | null = null;

// Initialize database
export async function getDatabase(): Promise<Database> {
  // If already initialized, return it
  if (db && dbInitialized) {
    return db;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      // Ensure data directory exists (only needed for non-serverless)
      if (!isServerless && !existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
      }

      // Initialize sql.js
      // In serverless, we need to load from CDN or use bundled version
      const SQL = await initSqlJs({
        locateFile: (file: string) => {
          // Try to load from CDN
          if (file.endsWith('.wasm')) {
            return `https://sql.js.org/dist/${file}`;
          }
          return file;
        },
        // Fallback: use node module if CDN fails
        wasmBinary: undefined,
      });

      // Try to load existing database
      let database: Database;
      if (existsSync(dbPath)) {
        try {
          const buffer = readFileSync(dbPath);
          database = new SQL.Database(buffer);
        } catch (error) {
          console.error('Error loading database, creating new one:', error);
          database = new SQL.Database();
        }
      } else {
        database = new SQL.Database();
      }

      // Initialize schema
      await initDatabaseSchema(database);

      // Save database (silently fail if can't write)
      try {
        saveDatabase(database);
      } catch (error) {
        console.warn('Could not save database to file (this is OK in serverless):', error);
      }

      db = database;
      dbInitialized = true;
      return database;
    } catch (error) {
      console.error('Database initialization error:', error);
      // Return a fresh database even if initialization fails
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
      db = new SQL.Database();
      await initDatabaseSchema(db);
      dbInitialized = true;
      return db;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

// Save database to file
function saveDatabase(database: Database) {
  try {
    const data = database.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  } catch (error) {
    // Silently fail - this is expected in some serverless environments
    // The database will still work in-memory for the current request
  }
}

// Initialize database schema
async function initDatabaseSchema(database: Database) {
  try {
    // Enable foreign keys
    database.run('PRAGMA foreign_keys = ON;');

    // Users table
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'trade', 'customer')),
        trade_type TEXT,
        location TEXT,
        phone TEXT,
        rating REAL DEFAULT 0,
        availability TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Leads table
    database.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        town TEXT,
        trade_type TEXT NOT NULL,
        job_description TEXT NOT NULL,
        urgency TEXT DEFAULT 'medium' CHECK(urgency IN ('low', 'medium', 'high')),
        status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'assigned', 'completed', 'paid', 'closed')),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
        assigned_trade_id INTEGER,
        preferred_date TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_trade_id) REFERENCES users(id)
      )
    `);

    // Payments table
    database.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'failed')),
        invoice_number TEXT,
        payment_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      )
    `);

    // Activity logs table
    database.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create indexes
    try {
      database.run(`
        CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
        CREATE INDEX IF NOT EXISTS idx_leads_trade_type ON leads(trade_type);
        CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_trade_id);
        CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
        CREATE INDEX IF NOT EXISTS idx_activity_lead ON activity_logs(lead_id);
      `);
    } catch (error) {
      // Indexes might already exist, ignore error
    }

    // Create default admin user
    try {
      const stmt = database.prepare("SELECT id FROM users WHERE email = ?");
      stmt.bind(['admin@crm.com']);
      const result = stmt.getAsObject();
      stmt.free();

      if (!result || !result.id) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        const insertStmt = database.prepare(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
        );
        insertStmt.bind(['admin@crm.com', hashedPassword, 'Admin User', 'admin']);
        insertStmt.step();
        insertStmt.free();
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      // Try again with a simpler approach
      try {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        database.run(
          'INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          ['admin@crm.com', hashedPassword, 'Admin User', 'admin']
        );
      } catch (e) {
        console.error('Failed to create admin user:', e);
      }
    }
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

// Helper function to convert SQL.js result to array of objects
export function resultToArray(result: any[]): any[] {
  if (!result || result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, index: number) => {
      // Handle different data types
      let value = row[index];
      if (value === null || value === undefined) {
        obj[col] = null;
      } else {
        obj[col] = value;
      }
    });
    return obj;
  });
}

// Helper function to get single row
export function resultToObject(result: any[]): any | null {
  const arr = resultToArray(result);
  return arr.length > 0 ? arr[0] : null;
}

// Wrapper for database operations that auto-saves
export async function dbRun(sql: string, params: any[] = []): Promise<void> {
  const database = await getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  try {
    saveDatabase(database);
  } catch (error) {
    // Silently fail - OK in serverless
  }
}

export async function dbGet(sql: string, params: any[] = []): Promise<any> {
  const database = await getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const result = stmt.getAsObject({});
  stmt.free();
  return result && Object.keys(result).length > 0 ? result : null;
}

export async function dbAll(sql: string, params: any[] = []): Promise<any[]> {
  const database = await getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Export database instance getter for direct access (use with caution)
export default getDatabase;
