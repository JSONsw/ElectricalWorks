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
  created_at: string;
}

export default function TradePortalPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      // Trade users automatically see only their assigned leads via API
      const response = await fetch('/api/leads');
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

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchLeads();
        alert('Status updated!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
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
          <h1>Trades CRM - My Leads</h1>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
        </div>
      </header>

      <div className="container">
        <h2 style={{ marginBottom: '2rem' }}>My Assigned Leads</h2>

        {leads.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-light)' }}>No leads assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {leads.map((lead) => (
              <div key={lead.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{lead.name}</h3>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                      {lead.town || 'No location'}
                    </p>
                  </div>
                  <span className={`badge badge-${lead.status}`}>{lead.status}</span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong>Contact:</strong>
                  <div>
                    <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                  </div>
                  {lead.email && (
                    <div>
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong>Job:</strong>
                  <p style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: '0.375rem' }}>
                    {lead.job_description}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong>Priority:</strong> <span className={`badge badge-${lead.priority}`}>{lead.priority}</span>
                </div>

                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                  Created: {new Date(lead.created_at).toLocaleString()}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateLeadStatus(lead.id, 'contacted')}
                    className="btn btn-secondary btn-sm"
                    disabled={lead.status === 'contacted'}
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={() => updateLeadStatus(lead.id, 'completed')}
                    className="btn btn-success btn-sm"
                    disabled={lead.status === 'completed'}
                  >
                    Mark Completed
                  </button>
                  <Link href={`/leads/${lead.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

