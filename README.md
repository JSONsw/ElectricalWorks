# Trades CRM MVP

A complete CRM system for managing trades lead generation business. Built with Next.js, TypeScript, and SQLite.

## 🚀 Features

### Core Functionality
- ✅ **Lead Capture** - Public API endpoint for website forms
- ✅ **Lead Management** - Full CRUD with status pipeline (New → Contacted → Assigned → Completed → Paid)
- ✅ **Lead Assignment** - Assign leads to tradespeople by trade type and location
- ✅ **Trade Management** - Add and manage tradespeople
- ✅ **Dashboard** - Real-time statistics and reporting
- ✅ **Role-Based Access** - Admin, Trade, and Customer roles
- ✅ **Payment Tracking** - Track payments per lead
- ✅ **Activity Logs** - Complete audit trail

### User Roles
- **Admin** - Full access to all features
- **Trade** - View and update assigned leads only
- **Customer** - (Optional portal for future)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Windows/Mac/Linux

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd CRM
   npm install
   ```

2. **Build SQLite Database**
   The database will be automatically created on first run in the `data/` folder.

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open http://localhost:3000
   - Default login: `admin@crm.com` / `admin123`

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@crm.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the default password immediately in production!

## 📡 API Endpoints

### Public Endpoints (No Auth Required)

#### POST `/api/leads/capture`
Capture lead from website form.

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+353123456789",
  "email": "john@example.com",
  "location": "Athlone",
  "trade_type": "electrician",
  "job_description": "Need house rewiring",
  "urgent": false,
  "preferred_date": "2024-12-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you! We will contact you shortly.",
  "lead_id": 1
}
```

### Protected Endpoints (Require Auth)

#### GET `/api/leads`
Get all leads (with optional filters)
- Query params: `?status=new&trade_type=electrician&town=Athlone`

#### GET `/api/leads/[id]`
Get single lead with activities and payments

#### PATCH `/api/leads/[id]`
Update lead
```json
{
  "status": "assigned",
  "priority": "high",
  "assigned_trade_id": 1,
  "notes": "Customer prefers morning appointments"
}
```

#### POST `/api/trades`
Create new trade user (Admin only)

#### GET `/api/reports/dashboard`
Get dashboard statistics
- Query params: `?month=2024-12` (optional)

#### POST `/api/payments`
Create payment record (Admin only)

## 🔗 Integrating with Your Website

Update your electrician website's contact form to send leads to the CRM:

### Option 1: Update contact.html

In `Electrician/contact.html`, update the form submission:

```javascript
// In script.js or contact.html
const quoteForm = document.getElementById('quoteForm');
quoteForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    location: document.getElementById('location').value,
    trade_type: 'electrician', // or get from form
    job_description: document.getElementById('jobDescription').value,
    urgent: document.getElementById('urgent').checked,
    preferred_date: '' // optional
  };

  try {
    const response = await fetch('https://your-crm-domain.com/api/leads/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (result.success) {
      alert('Thank you! We will contact you shortly.');
      quoteForm.reset();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error submitting form. Please try again.');
  }
});
```

### Option 2: Use Zapier/Make.com

1. Set up webhook in Zapier/Make
2. Connect your website form (Formspree, etc.) to webhook
3. Webhook calls `/api/leads/capture`

## 🎨 Usage Guide

### Admin Workflow

1. **Login** → Dashboard
2. **View Leads** → See all leads with filters
3. **Assign Lead** → Click lead → Select trade → Update status
4. **Track Payments** → Add payment record when lead is paid
5. **View Reports** → Dashboard shows conversion rates, revenue, etc.

### Trade Workflow

1. **Login** → Trade Portal
2. **View Assigned Leads** → See only your leads
3. **Update Status** → Mark as contacted/completed
4. **View Details** → Click lead for full information

## 📊 Dashboard Metrics

- **Total Leads** - All leads in system
- **Conversion Rate** - (Completed + Paid) / Total
- **Revenue** - Total payments received
- **Revenue per Lead** - Average revenue per lead
- **Leads by Status** - Breakdown by pipeline stage
- **Leads by Trade Type** - Which trades are most requested
- **Top Service Areas** - Most active towns

## 🗄️ Database Schema

The SQLite database (`data/crm.db`) contains:

- **users** - Admin, Trade, and Customer accounts
- **leads** - All lead information
- **payments** - Payment records
- **activity_logs** - Audit trail

## 🚢 Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

**Note:** SQLite works on Vercel, but for production consider PostgreSQL.

### Option 2: Railway/Render

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Deploy

### Option 3: Self-Hosted

1. Build: `npm run build`
2. Start: `npm start`
3. Use PM2 or similar for process management

## 🔒 Security Notes

1. **Change Default Password** - Update admin password immediately
2. **Environment Variables** - Set `JWT_SECRET` in production
3. **HTTPS** - Always use HTTPS in production
4. **Database** - Consider PostgreSQL for production (SQLite is fine for MVP)
5. **Rate Limiting** - Add rate limiting to public endpoints

## 📧 Email/SMS Notifications (TODO)

Currently, notifications are logged but not sent. To enable:

1. **Email** - Set up Nodemailer with SMTP
2. **SMS** - Integrate Twilio or similar
3. **WhatsApp** - Use Twilio WhatsApp API

Example email notification code:
```typescript
// In app/api/leads/capture/route.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: 'noreply@yourdomain.com',
  to: 'admin@yourdomain.com',
  subject: 'New Lead Received',
  text: `New lead from ${name} - ${phone}`,
});
```

## 🎯 Next Steps / Enhancements

- [ ] Email notifications for new leads
- [ ] SMS notifications via Twilio
- [ ] WhatsApp integration
- [ ] AI-powered lead qualification
- [ ] Customer portal
- [ ] Invoice generation
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language support

## 🐛 Troubleshooting

**Database errors:**
- Ensure `data/` folder is writable
- Delete `data/crm.db` to reset database

**Login issues:**
- Clear browser cookies
- Check JWT_SECRET is set

**API errors:**
- Check browser console for errors
- Verify authentication token in cookies

## 📝 License

This is an MVP for internal use. Customize as needed.

## 🆘 Support

For issues or questions, check the code comments or modify as needed for your use case.

