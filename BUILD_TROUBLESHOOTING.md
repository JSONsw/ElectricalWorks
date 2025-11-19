# Build Troubleshooting Guide

## Quick Fixes to Try

### 1. Test Build Locally First

```bash
cd CRM
npm install
npm run build
```

If this fails locally, fix those errors first before deploying.

### 2. Common Netlify Build Issues

#### Issue: "Module not found" or "Cannot find module"
**Fix:** Ensure all dependencies are in `package.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

#### Issue: Node version mismatch
**Fix:** We've added `.nvmrc` and `engines` in `package.json`. Netlify should use Node 18.

#### Issue: sql.js WASM loading errors
**Fix:** The webpack config has been updated to handle sql.js correctly.

#### Issue: Build timeout
**Fix:** Function timeout is set to 30 seconds in `netlify.toml`.

### 3. Netlify Build Command

Make sure Netlify is using:
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18 (set in `.nvmrc` and `package.json`)

### 4. Check Netlify Settings

In Netlify Dashboard:
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Verify:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: Should auto-detect from `.nvmrc`

### 5. Environment Variables

If you have any environment variables needed for build:
1. Go to **Site settings** → **Environment variables**
2. Add any required variables (e.g., `JWT_SECRET`)

### 6. Clear Build Cache

If build keeps failing:
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Click **Clear cache and deploy site**

## Getting Build Logs

### Method 1: Netlify Dashboard
1. Go to your site on Netlify
2. Click **Deploys** tab
3. Click on the failed deploy
4. Click **Live deploy log** or scroll to see the error
5. Copy the error lines (especially the last 50-100 lines)

### Method 2: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --build
```

## What to Share for Help

If build still fails, share:
1. **Last 50-100 lines of build log** (especially error stack traces)
2. **Local build output** (run `npm run build` locally and share errors)
3. **Node version** (run `node -v` and `npm -v`)
4. **package.json** (already in repo)
5. **netlify.toml** (already in repo)

## Expected Build Output

A successful build should show:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

## Common Error Patterns

### "Cannot find module 'sql.js'"
- **Fix:** Run `npm install` and commit `package-lock.json`

### "Type error: Could not find declaration file"
- **Fix:** Already fixed - `@types/sql.js` is in devDependencies

### "Webpack error" or "Module build failed"
- **Fix:** Check `next.config.js` webpack config

### "Function timeout"
- **Fix:** Already set to 30 seconds in `netlify.toml`

### "ENOENT: no such file or directory"
- **Fix:** Check that all files are committed to git

## Next Steps

1. **Test locally first:**
   ```bash
   npm install
   npm run build
   ```

2. **If local build works, deploy:**
   - Push to git
   - Netlify will auto-deploy
   - Check deploy logs if it fails

3. **If local build fails:**
   - Fix the errors locally
   - Then deploy

## Still Having Issues?

Share the build log output and we can diagnose the specific issue!

