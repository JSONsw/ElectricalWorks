import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbGet, dbRun } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

// GET /api/trades - Get all tradespeople
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trades = await dbAll('users', { role: 'trade' }, 'id, name, email, phone, trade_type, location, rating, availability');

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

    const hashedPassword = hashPassword(password);

    // Check if email already exists
    const existing = await dbGet('users', { email });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Insert trade user
    const trade = await dbRun('users', {
      email,
      password: hashedPassword,
      name,
      role: 'trade',
      trade_type,
      location: location || null,
      phone: phone || null,
    }, 'insert');

    // Return without password
    const { password: _, ...tradeWithoutPassword } = trade;
    return NextResponse.json({ trade: tradeWithoutPassword }, { status: 201 });
  } catch (error: any) {
    console.error('Create trade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
