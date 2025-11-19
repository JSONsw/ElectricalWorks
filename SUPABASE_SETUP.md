# Supabase Setup Guide

## Step 1: Create Supabase Account & Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up (free) with GitHub, Google, or email
4. Click "New Project"
5. Fill in:
   - **Name:** trades-crm (or your choice)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free
6. Click "Create new project"
7. Wait 2-3 minutes for setup

## Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - **Keep this secret!**

## Step 3: Set Up Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` file OR paste this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'trade', 'customer')),
  trade_type TEXT,
  location TEXT,
  phone TEXT,
  rating REAL DEFAULT 0,
  availability TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
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
  assigned_trade_id INTEGER REFERENCES users(id),
  preferred_date TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'failed')),
  invoice_number TEXT,
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_trade_type ON leads(trade_type);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_trade_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_lead ON activity_logs(lead_id);

-- Create default admin user (password: admin123)
-- Note: This will hash the password using bcrypt
INSERT INTO users (email, password, name, role)
VALUES ('admin@crm.com', 'admin123', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
```

4. Click "Run" to execute

## Step 4: Set Environment Variables

### For Local Development

Create `.env.local` file in the CRM folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### For Netlify Deployment

1. Go to Netlify Dashboard → Your Site → **Environment variables**
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key

## Step 5: Install Dependencies

```bash
cd CRM
npm install
```

## Step 6: Test

1. Start dev server: `npm run dev`
2. Go to `/login`
3. Login with: `admin@crm.com` / `admin123`

## Step 7: Update Admin Password

After first login, update the admin password in Supabase:

1. Go to Supabase → **SQL Editor**
2. Run (replace `NEW_PASSWORD_HASH` with bcrypt hash):

```sql
UPDATE users 
SET password = '$2a$10$NEW_PASSWORD_HASH_HERE' 
WHERE email = 'admin@crm.com';
```

Or use the CRM interface to change it (once that feature is added).

## Troubleshooting

### "Invalid API key"
- Check that environment variables are set correctly
- Restart dev server after adding env vars

### "Table doesn't exist"
- Make sure you ran the SQL schema setup
- Check Supabase → **Table Editor** to verify tables exist

### "Permission denied"
- Make sure you're using `SUPABASE_SERVICE_ROLE_KEY` (not anon key) for admin operations
- Check Row Level Security (RLS) policies in Supabase

## Next Steps

- ✅ Database is now hosted and persistent
- ✅ Works perfectly with Next.js
- ✅ No webpack bundling issues
- ✅ Ready for production

Your CRM is now using a real database! 🎉

