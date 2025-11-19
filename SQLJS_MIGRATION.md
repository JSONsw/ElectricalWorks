# Migration to sql.js

The CRM has been migrated from `better-sqlite3` to `sql.js` for better compatibility with serverless platforms like Netlify.

## Changes Made

1. **Package Updates**
   - Removed `better-sqlite3`
   - Added `sql.js` and `@types/sql.js`
   - Removed `@types/better-sqlite3`

2. **Database Layer (`lib/db.ts`)**
   - Rewritten to use sql.js async API
   - Database is loaded from file on each request (serverless-friendly)
   - Auto-saves after mutations

3. **API Routes**
   - All routes updated to use async database functions
   - `dbGet()` - Get single row
   - `dbAll()` - Get multiple rows
   - `dbRun()` - Execute INSERT/UPDATE/DELETE

## Key Differences

### better-sqlite3 (Old)
```typescript
const db = new Database('path/to/db');
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1);
db.prepare('INSERT INTO users ...').run(...);
```

### sql.js (New)
```typescript
const db = await getDatabase();
const user = await dbGet('SELECT * FROM users WHERE id = ?', [1]);
await dbRun('INSERT INTO users ...', [...]);
```

## Benefits

✅ **Works on Netlify** - Pure JavaScript, no native binaries
✅ **Serverless-friendly** - Stateless database loading
✅ **Same SQL syntax** - No query changes needed
✅ **File-based persistence** - Database saved to `data/crm.db`

## Notes

- Database is loaded fresh on each API request (acceptable for MVP)
- For high-traffic production, consider migrating to PostgreSQL
- File I/O happens synchronously but is fast for small databases
- Database file is automatically created in `data/` directory

## Deployment

The CRM should now deploy successfully on:
- ✅ Netlify
- ✅ Vercel
- ✅ Railway
- ✅ Render
- ✅ Any Node.js hosting

No special configuration needed - sql.js works everywhere!

