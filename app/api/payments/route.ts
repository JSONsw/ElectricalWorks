import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbRun } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import supabase from '@/lib/db';

// GET /api/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payments
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get lead info for payments
    const leadIds = [...new Set(payments?.map((p: any) => p.lead_id) || [])];
    const leadMap = new Map();
    
    if (leadIds.length > 0) {
      const { data: leads } = await supabase
        .from('leads')
        .select('id, name, trade_type')
        .in('id', leadIds);
      
      leads?.forEach((lead: any) => {
        leadMap.set(lead.id, { name: lead.name, trade_type: lead.trade_type });
      });
    }

    // Transform to match expected format
    const transformedPayments = payments?.map((payment: any) => {
      const lead = leadMap.get(payment.lead_id);
      return {
        ...payment,
        lead_name: lead?.name || null,
        trade_type: lead?.trade_type || null,
      };
    }) || [];

    return NextResponse.json({ payments: transformedPayments });
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
    const payment = await dbRun('payments', {
      lead_id,
      amount,
      status,
      invoice_number: invoice_number || null,
      payment_date: status === 'paid' ? new Date().toISOString() : null,
    }, 'insert');

    // Update lead status if paid
    if (status === 'paid') {
      await dbRun('leads', { status: 'paid' }, 'update', { id: lead_id });
    }

    // Log activity
    await dbRun('activity_logs', {
      lead_id,
      user_id: user.id,
      action: 'payment_recorded',
      details: JSON.stringify({ amount, status }),
    }, 'insert');

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
