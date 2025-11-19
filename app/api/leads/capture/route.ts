import { NextRequest, NextResponse } from 'next/server';
import { dbRun } from '@/lib/db';

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
    const lead = await dbRun('leads', {
      name,
      phone,
      email: email || null,
      address,
      town,
      trade_type,
      job_description,
      urgency,
      preferred_date: preferred_date || null,
    }, 'insert');

    // Log activity
    await dbRun('activity_logs', {
      lead_id: lead.id,
      action: 'lead_created',
      details: 'Lead captured from website form',
    }, 'insert');

    // TODO: Send notification email to admin
    // TODO: Send confirmation email/SMS to customer

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! We will contact you shortly.',
        lead_id: lead.id,
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
