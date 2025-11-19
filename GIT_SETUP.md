# Git Repository Setup Guide

## Current Issue
You're trying to push to `JSONsw/ElectricalWorks` but don't have permission.

## Solutions

### Option 1: Create Your Own Repository (Recommended)

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it (e.g., `trades-crm` or `crm-system`)
   - Make it **Private** or **Public** (your choice)
   - Don't initialize with README
   - Click "Create repository"

2. **Update the remote:**
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

3. **Push:**
   ```bash
   git push -u origin main
   ```

### Option 2: Use SSH Instead of HTTPS

If you have SSH keys set up:

1. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:JSONsw/ElectricalWorks.git
   ```

2. **Push:**
   ```bash
   git push -u origin main
   ```

### Option 3: Update GitHub Credentials

If you need to authenticate:

1. **Use GitHub Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` permissions
   - Use token as password when pushing

2. **Or use GitHub CLI:**
   ```bash
   gh auth login
   ```

### Option 4: Remove and Re-add Remote

If you want to start fresh:

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Quick Fix Commands

**For new repository:**
```bash
# Replace YOUR_USERNAME and YOUR_REPO_NAME
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**Check current remote:**
```bash
git remote -v
```

