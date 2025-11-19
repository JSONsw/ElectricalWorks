# CRM MVP System Overview

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEAD GENERATION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. WEBSITE FORM
   └─> Customer fills contact form
       └─> POST /api/leads/capture
           └─> Lead created in CRM
               └─> Status: "new"
                   └─> Activity logged

2. ADMIN REVIEW
   └─> Admin logs into dashboard
       └─> Views new leads
           └─> Reviews lead details
               └─> Sets priority (low/medium/high)
                   └─> Assigns to trade
                       └─> Status: "assigned"
                           └─> Trade notified (email/SMS)

3. TRADE ACTION
   └─> Trade logs into portal
       └─> Sees assigned leads
           └─> Contacts customer
               └─> Updates status: "contacted"
                   └─> Completes job
                       └─> Updates status: "completed"

4. PAYMENT & CLOSURE
   └─> Admin records payment
       └─> Status: "paid"
           └─> Lead closed
               └─> Status: "closed"
```

## 📊 Data Model

```
USERS
├── Admin (you)
│   └── Full access to all features
├── Trade (tradespeople)
│   ├── View assigned leads only
│   ├── Update lead status
│   └── Add notes
└── Customer (future)
    └── View own lead status

LEADS
├── Customer Info (name, phone, email, location)
├── Job Details (trade_type, description, urgency)
├── Status Pipeline (new → contacted → assigned → completed → paid → closed)
├── Assignment (assigned_trade_id)
└── Tracking (priority, notes, dates)

PAYMENTS
├── Linked to lead
├── Amount & status
└── Invoice tracking

ACTIVITY LOGS
├── All actions tracked
├── User who performed action
└── Timestamp
```

## 🎯 Key Features

### Lead Management
- ✅ Capture from website forms
- ✅ Manual lead creation
- ✅ Status pipeline tracking
- ✅ Priority tagging
- ✅ Assignment to trades
- ✅ Notes and history

### Trade Management
- ✅ Add/edit tradespeople
- ✅ Track by trade type
- ✅ Location-based assignment
- ✅ Rating system (future)

### Reporting
- ✅ Total leads
- ✅ Conversion rates
- ✅ Revenue tracking
- ✅ Leads by trade type
- ✅ Top service areas
- ✅ Monthly filtering

### Security
- ✅ Role-based access control
- ✅ JWT authentication
- ✅ Secure password hashing
- ✅ API endpoint protection

## 🔌 Integration Points

### Website → CRM
```
Website Form → POST /api/leads/capture → CRM Database
```

### CRM → Trades
```
Lead Assigned → Email/SMS Notification → Trade Portal
```

### CRM → Admin
```
New Lead → Dashboard Update → Admin Notification
```

## 📱 User Interfaces

### Admin Dashboard
- Overview statistics
- Lead management
- Trade management
- Payment tracking
- Reports

### Trade Portal
- Assigned leads only
- Quick status updates
- Lead details view
- Contact information

### Public API
- Lead capture endpoint
- No authentication required
- Returns success confirmation

## 🚀 Deployment Architecture

```
┌─────────────┐
│   Website   │ (Static - Netlify/Vercel)
│  (Frontend) │
└──────┬──────┘
       │
       │ HTTP POST
       ▼
┌─────────────┐
│  CRM API    │ (Next.js - Vercel/Railway)
│  (Backend)  │
└──────┬──────┘
       │
       │ SQLite/PostgreSQL
       ▼
┌─────────────┐
│  Database   │ (SQLite MVP / PostgreSQL Production)
└─────────────┘
```

## 📈 Success Metrics

Track these KPIs:
- **Lead Response Time** - Time from capture to assignment
- **Conversion Rate** - Completed leads / Total leads
- **Revenue per Lead** - Total revenue / Total leads
- **Trade Performance** - Leads per trade, completion rate
- **Geographic Performance** - Leads by town/area

## 🔮 Future Enhancements

### Phase 2
- [ ] Email notifications (Nodemailer)
- [ ] SMS notifications (Twilio)
- [ ] WhatsApp integration
- [ ] Automated lead qualification

### Phase 3
- [ ] AI-powered lead scoring
- [ ] Customer portal
- [ ] Invoice generation
- [ ] Calendar integration

### Phase 4
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language
- [ ] API for third-party integrations

## 🎓 Usage Tips

1. **Create Trades First** - Before assigning leads, add your tradespeople
2. **Use Priority Tags** - Mark urgent leads as "high" priority
3. **Add Notes** - Document important details in lead notes
4. **Track Payments** - Record payments to calculate revenue
5. **Review Dashboard** - Check metrics regularly to optimize

## 🆘 Common Workflows

### New Lead Comes In
1. Lead appears in "New" status
2. Admin reviews and qualifies
3. Assign to appropriate trade
4. Trade contacts customer
5. Update status as work progresses
6. Record payment when complete

### Trade Completes Job
1. Trade marks lead as "completed"
2. Admin reviews and records payment
3. Status changes to "paid"
4. Lead can be closed

### Follow Up on Stale Leads
1. Filter leads by status
2. Check "contacted" leads older than X days
3. Follow up or reassign
4. Update notes with status

