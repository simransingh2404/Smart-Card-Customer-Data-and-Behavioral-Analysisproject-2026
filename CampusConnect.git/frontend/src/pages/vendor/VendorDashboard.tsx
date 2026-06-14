import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import api from '../../api/axios';
import { RFQ, Quotation } from '../../types';

export default function VendorDashboard() {
  const [openRFQs, setOpenRFQs] = useState<RFQ[]>([]);
  const [myQuotations, setMyQuotations] = useState<Quotation[]>([]);
  const [activeTab, setActiveTab] = useState<'rfqs' | 'quotations'>('rfqs');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [form, setForm] = useState({
    totalPrice: '', deliveryDays: '', sampleAvailable: 'Yes', additionalNotes: '', termsAndConditions: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isVerified = user?.verified;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const r = await api.get('/rfq/open'); setOpenRFQs(r.data); } catch (e) { console.error(e); }
    try { const r = await api.get('/quotation/my'); setMyQuotations(r.data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQ) return;
    try {
      await api.post(`/quotation/rfq/${selectedRFQ.id}`, {
        ...form, totalPrice: parseFloat(form.totalPrice), deliveryDays: parseInt(form.deliveryDays),
      });
      setShowForm(false); setSelectedRFQ(null);
      setForm({ totalPrice: '', deliveryDays: '', sampleAvailable: 'Yes', additionalNotes: '', termsAndConditions: '' });
      fetchData(); setActiveTab('quotations');
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to submit quotation'); }
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
        .cc-logout-btn { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #F87171; padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
        .cc-logout-btn:hover { background: rgba(239,68,68,0.2); }
        .cc-tab { padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
        .cc-tab-active { background: #10B981; color: white; border-color: #10B981; }
        .cc-tab-inactive { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.08); }
        .cc-tab-inactive:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
        .cc-rfq-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 22px; margin-bottom: 10px; transition: border-color 0.2s; }
        .cc-rfq-card:hover { border-color: rgba(16,185,129,0.3); }
        .cc-quotation-card { border-radius: 12px; padding: 22px; margin-bottom: 10px; border: 1px solid; }
        .cc-primary-btn { background: #10B981; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .cc-primary-btn:hover { background: #059669; transform: translateY(-1px); }
        .cc-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 16px 20px; }
        .badge-open { background: rgba(16,185,129,0.15); color: #34D399; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .badge-accepted { background: rgba(16,185,129,0.15); color: #34D399; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .badge-rejected { background: rgba(239,68,68,0.12); color: #F87171; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .badge-submitted { background: rgba(96,165,250,0.15); color: #93C5FD; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .cc-badge-pending { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .cc-badge-verified { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; backdrop-filter: blur(4px); }
        .modal-box { background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; width: 100%; max-width: 500px; }
        .cc-cancel-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        label { display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        select option { background: #1E293B; color: white; }
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
          <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#34D399', padding: '2px 8px', borderRadius: 100, marginLeft: 4 }}>Vendor</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="cc-nav-btn" onClick={() => navigate('/vendor/profile')}>Profile</button>
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
              <p style={{ color: 'rgba(245,158,11,0.7)', fontSize: 13 }}>Complete your profile and wait for admin verification before submitting quotations.</p>
            </div>
            <button className="cc-primary-btn" onClick={() => navigate('/vendor/profile')}>Complete Profile →</button>
          </div>
        )}

        {isVerified && (
          <div className="cc-badge-verified">
            <span style={{ fontSize: 20 }}>✅</span>
            <p style={{ color: '#34D399', fontWeight: 600, fontSize: 14 }}>Account verified — you can submit quotations!</p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          <div className="cc-stat">
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Open RFQs</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1 }}>{openRFQs.length}</p>
          </div>
          <div className="cc-stat">
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>My Quotes</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#34D399', lineHeight: 1 }}>{myQuotations.length}</p>
          </div>
          <div className="cc-stat">
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Accepted</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#93C5FD', lineHeight: 1 }}>{myQuotations.filter(q => q.status === 'ACCEPTED').length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button className={`cc-tab ${activeTab === 'rfqs' ? 'cc-tab-active' : 'cc-tab-inactive'}`} onClick={() => setActiveTab('rfqs')}>
            Open RFQs ({openRFQs.length})
          </button>
          <button className={`cc-tab ${activeTab === 'quotations' ? 'cc-tab-active' : 'cc-tab-inactive'}`} onClick={() => setActiveTab('quotations')}>
            My Quotations ({myQuotations.length})
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '60px 0' }}>Loading...</p>
        ) : activeTab === 'rfqs' ? (
          <div>
            {openRFQs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No open RFQs at the moment.</p>
              </div>
            ) : openRFQs.map((rfq) => (
              <div key={rfq.id} className="cc-rfq-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{rfq.title}</h3>
                      <span className="badge-open">OPEN</span>
                    </div>
                    {rfq.description && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>{rfq.description}</p>}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>🏫 <span style={{ color: 'rgba(255,255,255,0.7)' }}>{rfq.schoolName}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>📍 <span style={{ color: 'rgba(255,255,255,0.7)' }}>{rfq.schoolCity}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>📦 <span style={{ color: 'rgba(255,255,255,0.7)' }}>{rfq.uniformType}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Qty: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{rfq.quantity}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Budget: <span style={{ color: '#34D399', fontWeight: 600 }}>₹{rfq.budget?.toLocaleString()}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Deadline: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{rfq.deadline}</span></span>
                    </div>
                  </div>
                  <button className="cc-primary-btn" style={{ marginLeft: 16, flexShrink: 0 }}
                    onClick={() => { setSelectedRFQ(rfq); setShowForm(true); }}>
                    Submit Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {myQuotations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No quotations submitted yet.</p>
              </div>
            ) : myQuotations.map((q) => (
              <div key={q.id} className="cc-quotation-card" style={{
                background: q.status === 'ACCEPTED' ? 'rgba(16,185,129,0.05)' : q.status === 'REJECTED' ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.03)',
                borderColor: q.status === 'ACCEPTED' ? 'rgba(16,185,129,0.25)' : q.status === 'REJECTED' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{q.rfqTitle}</h3>
                      <span className={q.status === 'ACCEPTED' ? 'badge-accepted' : q.status === 'REJECTED' ? 'badge-rejected' : 'badge-submitted'}>
                        {q.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>🏫 {q.schoolName}</p>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Price: <span style={{ color: '#34D399', fontWeight: 700 }}>₹{q.totalPrice?.toLocaleString()}</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Delivery: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{q.deliveryDays} days</span></span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Sample: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{q.sampleAvailable}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Quotation Modal */}
      {showForm && selectedRFQ && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setSelectedRFQ(null); } }}>
          <div className="modal-box">
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>Submit Quotation</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>For: {selectedRFQ.title}</p>
            <form onSubmit={handleSubmitQuotation} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label>Total Price (₹)</label>
                <input className={inputCls} type="number" value={form.totalPrice} onChange={(e) => setForm({ ...form, totalPrice: e.target.value })} placeholder="125000" required />
              </div>
              <div>
                <label>Delivery Days</label>
                <input className={inputCls} type="number" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })} placeholder="21" required />
              </div>
              <div>
                <label>Sample Available</label>
                <select className={inputCls} value={form.sampleAvailable} onChange={(e) => setForm({ ...form, sampleAvailable: e.target.value })}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label>Terms & Conditions</label>
                <input className={inputCls} type="text" value={form.termsAndConditions} onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })} placeholder="50% advance, 50% on delivery" />
              </div>
              <div>
                <label>Additional Notes</label>
                <textarea className={inputCls} value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} rows={2} placeholder="Any additional information..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="cc-primary-btn" style={{ flex: 1 }}>Submit Quotation</button>
                <button type="button" className="cc-cancel-btn" style={{ flex: 1 }} onClick={() => { setShowForm(false); setSelectedRFQ(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
