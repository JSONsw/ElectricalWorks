'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Lead {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  town?: string;
  trade_type: string;
  job_description: string;
  status: string;
  priority: string;
  urgency: string;
  assigned_trade_id?: number;
  assigned_trade_name?: string;
  preferred_date?: string;
  notes?: string;
  created_at: string;
}

interface Trade {
  id: number;
  name: string;
  trade_type: string;
  location?: string;
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    assigned_trade_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchLead();
    fetchTrades();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`);
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setLead(data.lead);
      setFormData({
        status: data.lead.status,
        priority: data.lead.priority,
        assigned_trade_id: data.lead.assigned_trade_id || '',
        notes: data.lead.notes || '',
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades');
      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData: any = {
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes,
      };

      if (formData.assigned_trade_id) {
        updateData.assigned_trade_id = parseInt(formData.assigned_trade_id);
      }

      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        fetchLead();
        alert('Lead updated successfully!');
      } else {
        alert('Error updating lead');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Error updating lead');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!lead) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Lead not found</div>;
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
            <Link href="/leads" className="btn btn-secondary btn-sm">Leads</Link>
            <Link href="/trades" className="btn btn-secondary btn-sm">Trades</Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
          </nav>
        </div>
      </header>

      <div className="container">
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/leads" className="btn btn-secondary btn-sm">← Back to Leads</Link>
        </div>

        <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
          {/* Lead Info */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Lead Information</h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Name:</strong> {lead.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Phone:</strong> <a href={`tel:${lead.phone}`}>{lead.phone}</a>
            </div>
            {lead.email && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Email:</strong> <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <strong>Location:</strong> {lead.town || lead.address || '-'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Trade Type:</strong> {lead.trade_type}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Job Description:</strong>
              <p style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: '0.375rem' }}>
                {lead.job_description}
              </p>
            </div>
            {lead.preferred_date && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Preferred Date:</strong> {lead.preferred_date}
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <strong>Created:</strong> {new Date(lead.created_at).toLocaleString()}
            </div>
          </div>

          {/* Update Form */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Update Lead</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="assigned">Assigned</option>
                  <option value="completed">Completed</option>
                  <option value="paid">Paid</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign to Trade</label>
                <select
                  value={formData.assigned_trade_id}
                  onChange={(e) => setFormData({ ...formData, assigned_trade_id: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {trades
                    .filter(t => t.trade_type === lead.trade_type || !lead.trade_type)
                    .map((trade) => (
                      <option key={trade.id} value={trade.id}>
                        {trade.name} {trade.location ? `(${trade.location})` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={updating} style={{ width: '100%' }}>
                {updating ? 'Updating...' : 'Update Lead'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

