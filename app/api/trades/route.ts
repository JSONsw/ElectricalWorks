import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, dbAll, dbGet, dbRun } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/trades - Get all tradespeople
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trades = await dbAll(
      'SELECT id, name, email, phone, trade_type, location, rating, availability FROM users WHERE role = ?',
      ['trade']
    );

    return NextResponse.json({ trades });
  } catch (error) {
    console.error('Get trades error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/trades - Create new trade user
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password, name, trade_type, location, phone } = await request.json();

    if (!email || !password || !name || !trade_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { hashPassword } = require('@/lib/auth');
    const hashedPassword = hashPassword(password);

    // Check if email already exists
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Insert trade user
    await dbRun(
      'INSERT INTO users (email, password, name, role, trade_type, location, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, 'trade', trade_type, location || null, phone || null]
    );

    // Get the last inserted ID
    const lastIdResult = await dbGet('SELECT last_insert_rowid() as id');
    const tradeId = lastIdResult?.id;

    if (!tradeId) {
      throw new Error('Failed to get trade ID');
    }

    const trade = await dbGet(
      'SELECT id, name, email, trade_type, location FROM users WHERE id = ?',
      [tradeId]
    );

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error: any) {
    console.error('Create trade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
