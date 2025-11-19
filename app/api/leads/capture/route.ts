import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, dbGet, dbRun } from '@/lib/db';

// POST /api/leads/capture - Public endpoint for lead capture (from website forms)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      name,
      phone,
      email,
      location,
      trade_type,
      job_description,
      urgent,
      preferred_date,
    } = data;

    if (!name || !phone || !trade_type || !job_description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, trade_type, job_description' },
        { status: 400 }
      );
    }

    // Parse location into address/town if provided
    const address = location || '';
    const town = location || '';

    const urgency = urgent ? 'high' : 'medium';

    // Insert lead
    await dbRun(
      'INSERT INTO leads (name, phone, email, address, town, trade_type, job_description, urgency, preferred_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, phone, email || null, address, town, trade_type, job_description, urgency, preferred_date || null]
    );

    // Get the last inserted ID
    const lastIdResult = await dbGet('SELECT last_insert_rowid() as id');
    const leadId = lastIdResult?.id;

    if (!leadId) {
      throw new Error('Failed to get lead ID');
    }

    // Log activity
    const db = await getDatabase();
    const stmt = db.prepare('INSERT INTO activity_logs (lead_id, action, details) VALUES (?, ?, ?)');
    stmt.bind([leadId, 'lead_created', 'Lead captured from website form']);
    stmt.step();
    stmt.free();

    // TODO: Send notification email to admin
    // TODO: Send confirmation email/SMS to customer

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! We will contact you shortly.',
        lead_id: leadId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
