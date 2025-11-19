# Netlify Deployment Guide

## ⚠️ Important: SQLite on Netlify

**better-sqlite3 is a native module** that requires native binaries. Netlify's serverless/Edge functions may have runtime issues with SQLite.

### Option 1: Use Vercel (Recommended for Next.js)

Vercel has better support for Next.js with native modules:
1. Push to GitHub
2. Import on vercel.com
3. Deploy automatically

### Option 2: Use Railway/Render (Better for SQLite)

These platforms support persistent file systems and native modules:
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Deploy

### Option 3: Use External Database (Best for Production)

For production, consider:
- **PostgreSQL** (via Supabase, Neon, or Railway)
- **MySQL** (via PlanetScale or Railway)
- **MongoDB** (via MongoDB Atlas)

See `DATABASE_MIGRATION.md` for migration guide.

### Option 4: Netlify with Workarounds

If you must use Netlify:

1. **Use Netlify Functions (not Edge)**
   - Ensure API routes run as Node.js functions
   - Add `netlify.toml` configuration

2. **Consider SQLite Alternatives**
   - Use `sql.js` (pure JavaScript SQLite)
   - Or use a hosted database service

## 🔧 Fixed TypeScript Issues

The TypeScript build error has been fixed by:
1. Adding `@types/better-sqlite3` to devDependencies
2. Creating `types/better-sqlite3.d.ts` declaration file
3. Updating `tsconfig.json` to include types directory

## 📝 Next Steps

1. **Commit the fixes:**
   ```bash
   git add package.json types/better-sqlite3.d.ts tsconfig.json
   git commit -m "Fix TypeScript types for better-sqlite3"
   git push
   ```

2. **Try deploying again** - The TypeScript error should be resolved

3. **If you get runtime errors** about native modules:
   - Switch to Vercel/Railway, OR
   - Migrate to a hosted database (see migration guide)

## 🚀 Recommended Deployment

For this CRM, I recommend:
- **Vercel** (easiest, best Next.js support)
- **Railway** (good for SQLite, easy setup)
- **Render** (good alternative)

All three have free tiers and easy GitHub integration.

