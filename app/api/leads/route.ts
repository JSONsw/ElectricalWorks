import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, dbAll, dbRun, dbGet } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/leads - Get all leads (with filters)
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tradeType = searchParams.get('trade_type');
    const assignedTo = searchParams.get('assigned_to');
    const town = searchParams.get('town');

    let query = 'SELECT l.*, u.name as assigned_trade_name FROM leads l LEFT JOIN users u ON l.assigned_trade_id = u.id WHERE 1=1';
    const params: any[] = [];

    // Trade users can only see their assigned leads
    if (user.role === 'trade') {
      query += ' AND l.assigned_trade_id = ?';
      params.push(user.id);
    }

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    if (tradeType) {
      query += ' AND l.trade_type = ?';
      params.push(tradeType);
    }

    if (assignedTo) {
      query += ' AND l.assigned_trade_id = ?';
      params.push(assignedTo);
    }

    if (town) {
      query += ' AND l.town = ?';
      params.push(town);
    }

    query += ' ORDER BY l.created_at DESC';

    const leads = await dbAll(query, params);

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create new lead
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      name,
      phone,
      email,
      address,
      town,
      trade_type,
      job_description,
      urgency = 'medium',
      preferred_date,
    } = data;

    if (!name || !phone || !trade_type || !job_description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert lead
    await dbRun(
      'INSERT INTO leads (name, phone, email, address, town, trade_type, job_description, urgency, preferred_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, phone, email || null, address || null, town || null, trade_type, job_description, urgency, preferred_date || null]
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
    stmt.bind([leadId, 'lead_created', `Lead created from ${data.source || 'website'}`]);
    stmt.step();
    stmt.free();

    // Get the created lead
    const lead = await dbGet('SELECT * FROM leads WHERE id = ?', [leadId]);

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
