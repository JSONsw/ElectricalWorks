import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, dbAll, dbGet, dbRun } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await dbAll(
      `SELECT p.*, l.name as lead_name, l.trade_type
       FROM payments p
       JOIN leads l ON p.lead_id = l.id
       ORDER BY p.created_at DESC`
    );

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create payment record
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lead_id, amount, status = 'pending', invoice_number } = await request.json();

    if (!lead_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert payment
    await dbRun(
      'INSERT INTO payments (lead_id, amount, status, invoice_number, payment_date) VALUES (?, ?, ?, ?, ?)',
      [
        lead_id,
        amount,
        status,
        invoice_number || null,
        status === 'paid' ? new Date().toISOString() : null
      ]
    );

    // Get the last inserted ID
    const lastIdResult = await dbGet('SELECT last_insert_rowid() as id');
    const paymentId = lastIdResult?.id;

    // Update lead status if paid
    if (status === 'paid') {
      await dbRun('UPDATE leads SET status = ? WHERE id = ?', ['paid', lead_id]);
    }

    // Log activity
    const db = await getDatabase();
    const stmt = db.prepare('INSERT INTO activity_logs (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)');
    stmt.bind([lead_id, user.id, 'payment_recorded', JSON.stringify({ amount, status })]);
    stmt.step();
    stmt.free();

    const payment = await dbGet('SELECT * FROM payments WHERE id = ?', [paymentId]);

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
