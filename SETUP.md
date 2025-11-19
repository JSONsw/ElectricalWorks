# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd CRM
npm install
```

### Step 2: Start the Server
```bash
npm run dev
```

### Step 3: Access the CRM
1. Open http://localhost:3000
2. Login with:
   - Email: `admin@crm.com`
   - Password: `admin123`

### Step 4: Create Your First Trade
1. Go to "Trades" in the navigation
2. Click "+ Add Trade"
3. Fill in the form and create a tradesperson account

### Step 5: Test Lead Capture
1. Go to "Leads" → "New Lead"
2. Create a test lead
3. Assign it to a trade
4. View it in the dashboard

## 🔗 Connect Your Website

Update your electrician website's contact form to send leads to the CRM:

**In `Electrician/contact.html` or `Electrician/script.js`:**

```javascript
// Replace the form submission handler
const form = document.getElementById('quoteForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    location: document.getElementById('location').value,
    trade_type: 'electrician', // or get from form
    job_description: document.getElementById('jobDescription').value,
    urgent: document.getElementById('urgent').checked
  };

  // Update this URL to your CRM deployment
  const response = await fetch('http://localhost:3000/api/leads/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (result.success) {
    alert('Thank you! We will contact you shortly.');
    form.reset();
  }
});
```

## 📦 Production Deployment

### Deploy to Vercel (Easiest)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to vercel.com
   - Import your GitHub repository
   - Deploy automatically

3. **Update Website Integration:**
   - Change API URL from `localhost:3000` to your Vercel URL
   - Example: `https://your-crm.vercel.app/api/leads/capture`

### Environment Variables

Set these in Vercel (or your hosting):
- `JWT_SECRET` - Random string for JWT tokens
- `SMTP_*` - For email notifications (optional)

## ✅ You're Ready!

Your CRM is now ready to capture and manage leads from your website!

