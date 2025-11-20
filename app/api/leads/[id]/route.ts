import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import supabase from '@/lib/db';

function isTrade(x: any): x is { name?: string | null; phone?: string | null; email?: string | null } {
    return (
      x &&
      typeof x === "object" &&
      ("name" in x || "phone" in x || "email" in x)
    );
  }

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

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Trade users can only see their assigned leads
    if (user.role === 'trade' && lead.assigned_trade_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get assigned trade info if exists
    let assignedTrade = null;
    if (lead.assigned_trade_id) {
      assignedTrade = await dbGet('users', { id: lead.assigned_trade_id }, 'name, phone, email');
    }

    // Transform to match expected format
    const transformedLead = {
        ...lead,
        assigned_trade_name: isTrade(assignedTrade) ? assignedTrade.name ?? null : null,
        assigned_trade_phone: isTrade(assignedTrade) ? assignedTrade.phone ?? null : null,
        assigned_trade_email: isTrade(assignedTrade) ? assignedTrade.email ?? null : null,
      };
      

    // Get activity logs
    const activities = await dbAll('activity_logs', { lead_id: parseInt(params.id) }, '*', 'created_at DESC');

    // Get payments
    const payments = await dbAll('payments', { lead_id: parseInt(params.id) }, '*', 'created_at DESC');

    return NextResponse.json({
      lead: transformedLead,
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

    const updates: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    // Update lead
    const lead = await dbRun('leads', updates, 'update', { id: parseInt(params.id) });

    // Log activity
    const action = data.assigned_trade_id ? 'lead_assigned' : 'lead_updated';
    await dbRun('activity_logs', {
      lead_id: parseInt(params.id),
      user_id: user.id,
      action,
      details: JSON.stringify(data),
    }, 'insert');

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
