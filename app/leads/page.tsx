'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lead {
  id: number;
  name: string;
  phone: string;
  email?: string;
  town?: string;
  trade_type: string;
  job_description: string;
  status: string;
  priority: string;
  urgency: string;
  assigned_trade_name?: string;
  created_at: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', trade_type: '' });

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.trade_type) params.append('trade_type', filter.trade_type);

      const response = await fetch(`/api/leads?${params.toString()}`);
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
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
            <Link href="/leads" className="btn btn-primary btn-sm">Leads</Link>
            <Link href="/trades" className="btn btn-secondary btn-sm">Trades</Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
          </nav>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Leads</h2>
          <Link href="/leads/new" className="btn btn-primary">New Lead</Link>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Status</label>
              <select 
                value={filter.status} 
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Trade Type</label>
              <select 
                value={filter.trade_type} 
                onChange={(e) => setFilter({ ...filter, trade_type: e.target.value })}
              >
                <option value="">All Trades</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="painter">Painter</option>
                <option value="roofer">Roofer</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Trade</th>
                <th>Location</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td><strong>{lead.name}</strong></td>
                    <td>
                      <div>{lead.phone}</div>
                      {lead.email && <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>{lead.email}</div>}
                    </td>
                    <td>{lead.trade_type}</td>
                    <td>{lead.town || '-'}</td>
                    <td><span className={`badge badge-${lead.status}`}>{lead.status}</span></td>
                    <td><span className={`badge badge-${lead.priority}`}>{lead.priority}</span></td>
                    <td>{lead.assigned_trade_name || '-'}</td>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/leads/${lead.id}`} className="btn btn-primary btn-sm">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

