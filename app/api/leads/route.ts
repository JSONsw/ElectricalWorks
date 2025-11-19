import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbRun } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import supabase from '@/lib/db';

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

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (tradeType) filters.trade_type = tradeType;
    if (assignedTo) filters.assigned_trade_id = parseInt(assignedTo);
    if (town) filters.town = town;

    // Trade users can only see their assigned leads
    if (user.role === 'trade') {
      filters.assigned_trade_id = user.id;
    }

    // Get leads
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }

    const { data: leads, error } = await query;

    if (error) {
      throw error;
    }

    // Get assigned trade names for leads that have assignments
    const assignedTradeIds = [...new Set(leads?.filter((l: any) => l.assigned_trade_id).map((l: any) => l.assigned_trade_id) || [])];
    const tradeMap = new Map();
    
    if (assignedTradeIds.length > 0) {
      const { data: trades } = await supabase
        .from('users')
        .select('id, name')
        .in('id', assignedTradeIds);
      
      trades?.forEach((trade: any) => {
        tradeMap.set(trade.id, trade.name);
      });
    }

    // Transform the data to match expected format
    const transformedLeads = leads?.map((lead: any) => ({
      ...lead,
      assigned_trade_name: lead.assigned_trade_id ? tradeMap.get(lead.assigned_trade_id) || null : null,
    })) || [];

    return NextResponse.json({ leads: transformedLeads });
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
    const lead = await dbRun('leads', {
      name,
      phone,
      email: email || null,
      address: address || null,
      town: town || null,
      trade_type,
      job_description,
      urgency,
      preferred_date: preferred_date || null,
    }, 'insert');

    // Log activity
    await dbRun('activity_logs', {
      lead_id: lead.id,
      action: 'lead_created',
      details: `Lead created from ${data.source || 'website'}`,
    }, 'insert');

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
