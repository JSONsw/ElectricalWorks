# Netlify Troubleshooting Guide

## Common Issues and Solutions

### 1. Network Error on Login

**Problem:** Getting network error when trying to login on Netlify.

**Possible Causes:**
- sql.js WASM file not loading correctly
- Database initialization failing
- Serverless function timeout
- File system permissions

**Solutions:**

#### Check Netlify Function Logs
1. Go to Netlify Dashboard → Your Site → Functions
2. Click on the function that's failing (usually `/api/auth/login`)
3. Check the logs for error messages

#### Verify sql.js Loading
The database now uses `/tmp` for serverless environments. If you see errors about:
- "Cannot find module sql.js" → Make sure `sql.js` is in `package.json` dependencies
- "WASM file not found" → The code tries to load from CDN as fallback

#### Database Persistence Note
⚠️ **Important:** In serverless environments (Netlify), the database file in `/tmp` is **ephemeral** - it gets cleared between function invocations. This means:
- Data persists only during a single function execution
- Each new request might start with a fresh database
- The admin user is recreated on each initialization

**For Production:** Consider migrating to a hosted database:
- Supabase (PostgreSQL) - Free tier available
- PlanetScale (MySQL) - Free tier available  
- Railway (PostgreSQL) - Free tier available

### 2. Function Timeout

**Problem:** Functions timing out (Netlify default is 10 seconds).

**Solution:**
- Increase timeout in `netlify.toml`:
```toml
[functions]
  included_files = ["data/**"]
  node_bundler = "esbuild"

[[functions]]
  path = "/api/*"
  timeout = 30
```

### 3. Database Not Persisting

**Problem:** Data disappears after function execution.

**This is expected behavior** in serverless. Solutions:
1. Use a hosted database (recommended for production)
2. Use Netlify's KV store (limited, not ideal for SQL)
3. Use external storage (S3, etc.)

### 4. Debugging Steps

1. **Check Function Logs:**
   ```bash
   # In Netlify dashboard, go to Functions → View logs
   ```

2. **Test Locally:**
   ```bash
   npm run dev
   # Try logging in locally first
   ```

3. **Check Environment Variables:**
   - Go to Netlify → Site settings → Environment variables
   - Ensure `JWT_SECRET` is set (if using custom auth)

4. **Verify Build:**
   - Check Netlify build logs
   - Ensure `npm install` completes successfully
   - Verify `npm run build` succeeds

### 5. Quick Fix: Use In-Memory Database

If you just need to test, the database will work in-memory even if file saving fails. The admin user will be created on each request.

### 6. Production Recommendation

For a production CRM, **strongly consider** migrating to a hosted database:

**Option A: Supabase (Recommended)**
- Free PostgreSQL database
- Easy to set up
- Good Next.js integration
- See `DATABASE_MIGRATION.md` for guide

**Option B: PlanetScale**
- Free MySQL database
- Serverless-friendly
- Good performance

**Option C: Railway**
- Full control
- PostgreSQL or MySQL
- Easy deployment

## Getting Help

If issues persist:
1. Check Netlify function logs (most important!)
2. Share the error message from logs
3. Verify `package.json` has all dependencies
4. Check that build completes successfully

## Current Status

The CRM is configured to:
- ✅ Use `/tmp` for database file (serverless-compatible)
- ✅ Load sql.js from CDN if needed
- ✅ Handle file system errors gracefully
- ✅ Create admin user on initialization
- ⚠️ Database is ephemeral (cleared between invocations)

For persistent data, migrate to a hosted database.

