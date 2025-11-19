import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET /api/reports/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM format

    let dateFilter = '';
    const params: any[] = [];

    if (month) {
      dateFilter = "WHERE strftime('%Y-%m', created_at) = ?";
      params.push(month);
    }

    // Total leads
    const totalLeadsResult = await dbGet(
      `SELECT COUNT(*) as count FROM leads ${dateFilter}`,
      params
    ) as any;
    const totalLeads = totalLeadsResult?.count || 0;

    // Leads by status
    const leadsByStatus = await dbAll(
      `SELECT status, COUNT(*) as count
       FROM leads
       ${dateFilter}
       GROUP BY status`,
      params
    );

    // Leads by trade type
    const leadsByTrade = await dbAll(
      `SELECT trade_type, COUNT(*) as count
       FROM leads
       ${dateFilter}
       GROUP BY trade_type`,
      params
    );

    // Leads by town
    const leadsByTown = await dbAll(
      `SELECT town, COUNT(*) as count
       FROM leads
       WHERE town IS NOT NULL AND town != ''
       ${month ? "AND strftime('%Y-%m', created_at) = ?" : ''}
       GROUP BY town
       ORDER BY count DESC
       LIMIT 10`,
      month ? [month] : []
    );

    // Conversion rate (completed + paid / total)
    const conversionStats = await dbGet(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status IN ('completed', 'paid', 'closed') THEN 1 ELSE 0 END) as converted
       FROM leads
       ${dateFilter}`,
      params
    ) as any;

    const conversionRate = conversionStats?.total > 0
      ? ((conversionStats.converted / conversionStats.total) * 100).toFixed(1)
      : '0';

    // Revenue
    const revenue = await dbGet(
      `SELECT 
         COALESCE(SUM(amount), 0) as total,
         COUNT(*) as count
       FROM payments
       WHERE status = 'paid'
       ${month ? "AND strftime('%Y-%m', created_at) = ?" : ''}`,
      month ? [month] : []
    ) as any;

    // Revenue per lead
    const revenuePerLead = conversionStats?.total > 0
      ? (revenue?.total / conversionStats.total).toFixed(2)
      : '0';

    return NextResponse.json({
      totalLeads,
      leadsByStatus,
      leadsByTrade,
      leadsByTown,
      conversionRate: parseFloat(conversionRate),
      revenue: {
        total: revenue?.total || 0,
        count: revenue?.count || 0,
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
