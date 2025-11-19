import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, dbGet, dbAll, dbRun } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/leads/[id] - Get single lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lead = await dbGet(
      `SELECT l.*, u.name as assigned_trade_name, u.phone as assigned_trade_phone, u.email as assigned_trade_email
       FROM leads l
       LEFT JOIN users u ON l.assigned_trade_id = u.id
       WHERE l.id = ?`,
      [params.id]
    ) as any;

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Trade users can only see their assigned leads
    if (user.role === 'trade' && lead.assigned_trade_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get activity logs
    const activities = await dbAll(
      'SELECT * FROM activity_logs WHERE lead_id = ? ORDER BY created_at DESC',
      [params.id]
    );

    // Get payments
    const payments = await dbAll(
      'SELECT * FROM payments WHERE lead_id = ? ORDER BY created_at DESC',
      [params.id]
    );

    return NextResponse.json({
      lead,
      activities,
      payments,
    });
  } catch (error) {
    console.error('Get lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id] - Update lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const allowedFields = [
      'status',
      'priority',
      'assigned_trade_id',
      'notes',
      'urgency',
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(params.id);

    const query = `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`;
    await dbRun(query, values);

    // Log activity
    const action = data.assigned_trade_id ? 'lead_assigned' : 'lead_updated';
    const details = JSON.stringify(data);
    await dbRun(
      'INSERT INTO activity_logs (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [params.id, user.id, action, details]
    );

    const lead = await dbGet('SELECT * FROM leads WHERE id = ?', [params.id]);

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
