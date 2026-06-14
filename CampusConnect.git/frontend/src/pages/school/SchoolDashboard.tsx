import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import api from '../../api/axios';
import { RFQ } from '../../types';

export default function SchoolDashboard() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', uniformType: '', quantity: '',
    sizes: '', budget: '', deadline: '', deliveryAddress: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isVerified = user?.verified;

  useEffect(() => { fetchRFQs(); }, []);

  const fetchRFQs = async () => {
    try {
      const res = await api.get('/rfq/my');
      setRfqs(res.data);
    } catch (err: any) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await api.post('/rfq', { ...form, quantity: parseInt(form.quantity), budget: parseFloat(form.budget) });
      setShowForm(false);
      setForm({ title: '', description: '', uniformType: '', quantity: '', sizes: '', budget: '', deadline: '', deliveryAddress: '' });
      fetchRFQs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create RFQ. Please create a school profile first.');
    } finally { setSubmitting(false); }
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm";

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <style>{`
        .cc-nav { background: rgba(15,23,42,0.95); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
        .cc-logo { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; color: white; }
        .cc-logo-mark { width: 32px; height: 32px; background: #10B981; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .cc-nav-btn { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .cc-nav-btn:hover { border-color: rgba(255,255,255,0.3); color: white; }
        .cc-logout-btn { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #F87171; padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .cc-logout-btn:hover { background: rgba(239,68,68,0.2); }
        .cc-badge-pending { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .cc-badge-verified { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .cc-primary-btn { background: #10B981; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .cc-primary-btn:hover { background: #059669; transform: translateY(-1px); }
        .cc-primary-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .cc-rfq-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 24px; margin-bottom: 12px; transition: border-color 0.2s; }
        .cc-rfq-card:hover { border-color: rgba(16,185,129,0.3); }
        .cc-form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 28px; margin-bottom: 24px; }
        .cc-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 16px 20px; }
        .badge-open { background: rgba(16,185,129,0.15); color: #34D399; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .badge-awarded { background: rgba(96,165,250,0.15); color: #93C5FD; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .badge-closed { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .cc-view-btn { background: transparent; border: none; color: #10B981; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; }
        .cc-view-btn:hover { color: #34D399; }
        .cc-cancel-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .cc-cancel-btn:hover { background: rgba(255,255,255,0.1); }
        .cc-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #F87171; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        label { display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
      `}</style>

      {/* Navbar */}
      <nav className="cc-nav">
        <div className="cc-logo">
          <div className="cc-logo-mark">
            <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.2)"/>
            </svg>
          </div>
          Campus Connect
          <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#34D399', padding: '2px 8px', borderRadius: 100, marginLeft: 4 }}>School</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="cc-nav-btn" onClick={() => navigate('/school/profile')}>Profile</button>
          <button className="cc-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Verification Banner */}
        {!isVerified && (
          <div className="cc-badge-pending">
            <span style={{ fontSize: 20 }}>⏳</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#FCD34D', fontSize: 14, marginBottom: 2 }}>Account Pending Approval</p>
              <p style={{ color: 'rgba(245,158,11,0.7)', fontSize: 13 }}>Complete your profile and wait for admin verification before posting RFQs.</p>
            </div>
            <button className="cc-primary-btn" onClick={() => navigate('/school/profile')}>Complete Profile →</button>
          </div>
        )}

        {isVerified && (
          <div className="cc-badge-verified">
            <span style={{ fontSize: 20 }}>✅</span>
            <p style={{ color: '#34D399', fontWeight: 600, fontSize: 14 }}>Account verified — you can post RFQs!</p>
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          <div className="cc-stat">
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total RFQs</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1 }}>{rfqs.length}</p>
          </div>
          <div className="cc-stat">
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Open</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#34D399', lineHeight: 1 }}>{rfqs.filter(r => r.status === 'OPEN').length}</p>
          </div>
          <div className="cc-stat">
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Awarded</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#93C5FD', lineHeight: 1 }}>{rfqs.filter(r => r.status === 'AWARDED').length}</p>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>My RFQs</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Manage your uniform procurement requests</p>
          </div>
          <button className="cc-primary-btn" onClick={() => { setShowForm(!showForm); setError(''); }}>
            + New RFQ
          </button>
        </div>

        {/* RFQ Form */}
        {showForm && (
          <div className="cc-form-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 20 }}>Create New RFQ</h3>
            {error && <div className="cc-error">{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Title</label>
                <input className={inputCls} type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Annual Uniform Requirement 2025" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description of your requirement" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label>Uniform Type</label>
                <input className={inputCls} type="text" value={form.uniformType} onChange={(e) => setForm({ ...form, uniformType: e.target.value })} placeholder="e.g. Shirt, Trouser" required />
              </div>
              <div>
                <label>Quantity</label>
                <input className={inputCls} type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="500" required />
              </div>
              <div>
                <label>Sizes</label>
                <input className={inputCls} type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
              </div>
              <div>
                <label>Budget (₹)</label>
                <input className={inputCls} type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="150000" />
              </div>
              <div>
                <label>Deadline</label>
                <input className={inputCls} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div>
                <label>Delivery Address</label>
                <input className={inputCls} type="text" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} placeholder="School address" />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                <button type="submit" className="cc-primary-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit RFQ'}
                </button>
                <button type="button" className="cc-cancel-btn" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* RFQ List */}
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '60px 0' }}>Loading...</p>
        ) : rfqs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, marginBottom: 16 }}>No RFQs yet. Create your first one!</p>
            <button className="cc-primary-btn" onClick={() => setShowForm(true)}>+ New RFQ</button>
          </div>
        ) : (
          <div>
            {rfqs.map((rfq) => (
              <div key={rfq.id} className="cc-rfq-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{rfq.title}</h3>
                      <span className={rfq.status === 'OPEN' ? 'badge-open' : rfq.status === 'AWARDED' ? 'badge-awarded' : 'badge-closed'}>
                        {rfq.status}
                      </span>
                    </div>
                    {rfq.description && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>{rfq.description}</p>}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>📦 <span style={{ color: 'rgba(255,255,255,0.7)' }}>{rfq.uniformType}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Qty: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{rfq.quantity}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Budget: <span style={{ color: '#34D399', fontWeight: 600 }}>₹{rfq.budget?.toLocaleString()}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Deadline: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{rfq.deadline}</span></span>
                    </div>
                  </div>
                  <button className="cc-view-btn" onClick={() => navigate(`/school/rfq/${rfq.id}/quotations`)}>
                    View Quotations →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
