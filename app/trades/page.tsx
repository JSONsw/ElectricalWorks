'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Trade {
  id: number;
  name: string;
  email: string;
  phone?: string;
  trade_type: string;
  location?: string;
  rating: number;
  availability: string;
}

export default function TradesPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    trade_type: '',
    location: '',
  });

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setTrades(data.trades || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchTrades();
        setShowForm(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          trade_type: '',
          location: '',
        });
        alert('Trade created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Error creating trade');
      }
    } catch (error) {
      console.error('Error creating trade:', error);
      alert('Error creating trade');
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
            <Link href="/leads" className="btn btn-secondary btn-sm">Leads</Link>
            <Link href="/trades" className="btn btn-primary btn-sm">Trades</Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
          </nav>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Tradespeople</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Add Trade'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Add New Trade</h3>
            <form onSubmit={handleCreateTrade}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Trade Type *</label>
                <select
                  value={formData.trade_type}
                  onChange={(e) => setFormData({ ...formData, trade_type: e.target.value })}
                  required
                >
                  <option value="">Select trade type</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="painter">Painter</option>
                  <option value="roofer">Roofer</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary">Create Trade</button>
            </form>
          </div>
        )}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Trade Type</th>
                <th>Location</th>
                <th>Rating</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    No tradespeople found
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id}>
                    <td><strong>{trade.name}</strong></td>
                    <td>{trade.email}</td>
                    <td>{trade.phone || '-'}</td>
                    <td>{trade.trade_type}</td>
                    <td>{trade.location || '-'}</td>
                    <td>{trade.rating.toFixed(1)} ⭐</td>
                    <td>
                      <span className={`badge ${trade.availability === 'available' ? 'badge-success' : 'badge-warning'}`}>
                        {trade.availability}
                      </span>
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

