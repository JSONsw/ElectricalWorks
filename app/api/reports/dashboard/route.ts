// Force Next.js to treat this route as dynamic
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import supabase from '@/lib/db';

// GET /api/reports/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM format

    // Build date filter for month if provided
    let dateFilter: any = {};
    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      dateFilter = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Total leads
    let leadsQuery = supabase.from('leads').select('id', { count: 'exact', head: true });
    if (month) {
      leadsQuery = leadsQuery.gte('created_at', `${month}-01`).lte('created_at', `${month}-31`);
    }
    const { count: totalLeads } = await leadsQuery;

    // Leads by status
    let statusQuery = supabase.from('leads').select('status');
    if (month) {
      statusQuery = statusQuery.gte('created_at', `${month}-01`).lte('created_at', `${month}-31`);
    }
    const { data: allLeads } = await statusQuery;
    
    const leadsByStatusMap = new Map<string, number>();
    allLeads?.forEach((lead: any) => {
      const count = leadsByStatusMap.get(lead.status) || 0;
      leadsByStatusMap.set(lead.status, count + 1);
    });
    const leadsByStatus = Array.from(leadsByStatusMap.entries()).map(([status, count]) => ({ status, count }));

    // Leads by trade type
    const tradeTypeMap = new Map<string, number>();
    allLeads?.forEach((lead: any) => {
      const count = tradeTypeMap.get(lead.trade_type) || 0;
      tradeTypeMap.set(lead.trade_type, count + 1);
    });
    const leadsByTrade = Array.from(tradeTypeMap.entries()).map(([trade_type, count]) => ({ trade_type, count }));

    // Leads by town
    const townMap = new Map<string, number>();
    allLeads?.forEach((lead: any) => {
      if (lead.town) {
        const count = townMap.get(lead.town) || 0;
        townMap.set(lead.town, count + 1);
      }
    });
    const leadsByTown = Array.from(townMap.entries())
      .map(([town, count]) => ({ town, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Conversion rate
    const convertedCount = allLeads?.filter((lead: any) => 
      ['completed', 'paid', 'closed'].includes(lead.status)
    ).length || 0;
    const conversionRate = totalLeads && totalLeads > 0
      ? ((convertedCount / totalLeads) * 100).toFixed(1)
      : '0';

    // Revenue
    let revenueQuery = supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid');
    if (month) {
      revenueQuery = revenueQuery.gte('created_at', `${month}-01`).lte('created_at', `${month}-31`);
    }
    const { data: paidPayments } = await revenueQuery;
    
    const revenueTotal = paidPayments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
    const revenueCount = paidPayments?.length || 0;
    const revenuePerLead = totalLeads && totalLeads > 0
      ? (revenueTotal / totalLeads).toFixed(2)
      : '0';

    return NextResponse.json({
      totalLeads: totalLeads || 0,
      leadsByStatus,
      leadsByTrade,
      leadsByTown,
      conversionRate: parseFloat(conversionRate),
      revenue: {
        total: revenueTotal,
        count: revenueCount,
        perLead: parseFloat(revenuePerLead),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
