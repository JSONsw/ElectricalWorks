'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalLeads: number;
  leadsByStatus: Array<{ status: string; count: number }>;
  leadsByTrade: Array<{ trade_type: string; count: number }>;
  leadsByTown: Array<{ town: string; count: number }>;
  conversionRate: number;
  revenue: {
    total: number;
    count: number;
    perLead: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reports/dashboard');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid var(--border)',
        padding: '1rem 0',
        marginBottom: '2rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Trades CRM</h1>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
            <Link href="/leads" className="btn btn-secondary btn-sm">Leads</Link>
            <Link href="/trades" className="btn btn-secondary btn-sm">Trades</Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
          </nav>
        </div>
      </header>

      <div className="container">
        <h2 style={{ marginBottom: '2rem' }}>Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Total Leads</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalLeads || 0}</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Conversion Rate</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.conversionRate || 0}%</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>€{stats?.revenue.total.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Revenue/Lead</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>€{stats?.revenue.perLead.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Leads by Status */}
        <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Leads by Status</h3>
            <div>
              {stats?.leadsByStatus.map((item) => (
                <div key={item.status} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Leads by Trade Type</h3>
            <div>
              {stats?.leadsByTrade.map((item) => (
                <div key={item.trade_type} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <span>{item.trade_type}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Towns */}
        {stats?.leadsByTown && stats.leadsByTown.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Top Service Areas</h3>
            <div>
              {stats.leadsByTown.map((item) => (
                <div key={item.town} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <span>{item.town}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

