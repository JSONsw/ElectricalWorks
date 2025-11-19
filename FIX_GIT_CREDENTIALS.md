# Fix Git Credentials in Cursor/Windows

## Current Issue
Git is using cached credentials for the wrong GitHub account.

## Solution Steps

### Step 1: Clear Cached Credentials

**Windows Credential Manager:**
1. Press `Win + R`
2. Type: `control /name Microsoft.CredentialManager`
3. Click "Windows Credentials"
4. Find entries for `git:https://github.com`
5. Delete them

**Or use command line:**
```powershell
# Clear GitHub credentials from Windows Credential Manager
cmdkey /list | Select-String "git:https://github.com" | ForEach-Object { cmdkey /delete $_.Line.Split()[3] }
```

### Step 2: Update Git Config (if needed)

If you need to change your git user:

```bash
git config --global user.name "YourCorrectUsername"
git config --global user.email "your-correct-email@example.com"
```

### Step 3: Update Remote URL

If you're pushing to your own repository:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Step 4: Push with New Credentials

When you push, Windows will prompt for credentials:
```bash
git push -u origin main
```

Enter:
- **Username:** Your GitHub username
- **Password:** Your GitHub Personal Access Token (not your password)

### Step 5: Generate Personal Access Token (if needed)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it (e.g., "Cursor Git")
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your password when pushing

## Quick Fix Commands

```bash
# 1. Clear credentials
cmdkey /delete:git:https://github.com

# 2. Update remote (if needed)
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 3. Push (will prompt for credentials)
git push -u origin main
```

## Alternative: Use SSH Instead

If you prefer SSH (no password prompts):

1. **Generate SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. **Add to GitHub:**
   - Copy: `cat ~/.ssh/id_ed25519.pub`
   - GitHub → Settings → SSH and GPG keys → New SSH key

3. **Update remote:**
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
   ```

4. **Push:**
   ```bash
   git push -u origin main
   ```

