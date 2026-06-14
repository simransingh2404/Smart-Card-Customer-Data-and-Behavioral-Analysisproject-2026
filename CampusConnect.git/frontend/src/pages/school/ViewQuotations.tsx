import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Quotation } from '../../types';

interface RecommendResult {
  quotationId: number;
  companyName: string;
  totalPrice: number;
  deliveryDays: number;
  yearsOfExperience: number;
  acceptedQuotations: number;
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  performanceScore: number;
  finalScore: number;
}

export default function ViewQuotations() {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [showSmartChoice, setShowSmartChoice] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendResult[]>([]);
  const [weights, setWeights] = useState({
    priceWeight: 40,
    qualityWeight: 25,
    deliveryWeight: 20,
    performanceWeight: 15,
  });
  const [weightError, setWeightError] = useState('');

  useEffect(() => { fetchQuotations(); }, []);

  const fetchQuotations = async () => {
    try {
      const res = await api.get(`/quotation/rfq/${rfqId}`);
      setQuotations(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAccept = async (quotationId: number) => {
    setAccepting(quotationId);
    try {
      await api.patch(`/quotation/${quotationId}/accept`);
      fetchQuotations();
      setRecommendations([]);
    } catch (err) { console.error(err); }
    finally { setAccepting(null); }
  };

  const totalWeight = weights.priceWeight + weights.qualityWeight + weights.deliveryWeight + weights.performanceWeight;

  const handleRecommend = async () => {
    if (Math.abs(totalWeight - 100) > 0.01) {
      setWeightError(`Weights must sum to 100. Current total: ${totalWeight}`);
      return;
    }
    setWeightError('');
    setRecommending(true);
    try {
      const res = await api.post(`/recommend/rfq/${rfqId}`, weights);
      setRecommendations(res.data);
    } catch (err) { console.error(err); }
    finally { setRecommending(false); }
  };

  const scoreBar = (score: number, color: string) => (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, width: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <style>{`
        .cc-nav { background: rgba(15,23,42,0.95); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
        .cc-logo { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; color: white; }
        .cc-logo-mark { width: 32px; height: 32px; background: #10B981; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .cc-back-btn { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); padding: 7px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; }
        .cc-back-btn:hover { color: white; border-color: rgba(255,255,255,0.3); }
        .cc-smart-btn { background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 0 20px rgba(16,185,129,0.3); }
        .cc-smart-btn:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(16,185,129,0.5); }
        .cc-quotation-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 22px; margin-bottom: 10px; transition: border-color 0.2s; }
        .cc-quotation-card:hover { border-color: rgba(16,185,129,0.2); }
        .cc-accept-btn { background: #10B981; color: white; border: none; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .cc-accept-btn:hover { background: #059669; }
        .cc-accept-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .smart-panel { background: rgba(16,185,129,0.04); border: 1px solid rgba(16,185,129,0.2); border-radius: 16px; padding: 28px; margin-bottom: 24px; }
        .weight-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .weight-label { width: 220px; font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500; flex-shrink: 0; }
        .weight-slider { flex: 1; -webkit-appearance: none; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; cursor: pointer; }
        .weight-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #10B981; cursor: pointer; }
        .weight-value { width: 48px; text-align: center; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 8px; color: white; font-size: 13px; font-weight: 700; }
        .total-indicator { font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
        .rec-card { border-radius: 12px; padding: 22px; margin-bottom: 10px; border: 1px solid; }
        .rec-card-1 { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.35); }
        .rec-card-2 { background: rgba(96,165,250,0.06); border-color: rgba(96,165,250,0.25); }
        .rec-card-3 { background: rgba(167,139,250,0.06); border-color: rgba(167,139,250,0.25); }
        .rec-card-rest { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); }
        .rank-badge { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; }
        .score-circle { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; flex-shrink: 0; }
        .cc-run-btn { background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 12px 32px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .cc-run-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(16,185,129,0.4); }
        .cc-run-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        badge-accepted { background: rgba(16,185,129,0.15); color: #34D399; }
        .badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .badge-submitted { background: rgba(96,165,250,0.15); color: #93C5FD; }
        .badge-accepted-cls { background: rgba(16,185,129,0.15); color: #34D399; }
        .badge-rejected { background: rgba(239,68,68,0.12); color: #F87171; }
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
        </div>
        <button className="cc-back-btn" onClick={() => navigate('/school/dashboard')}>← Back to Dashboard</button>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>Quotations Received</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Compare and accept the best quotation for your RFQ</p>
          </div>
          {quotations.some(q => q.status === 'SUBMITTED') && (
            <button className="cc-smart-btn" onClick={() => { setShowSmartChoice(!showSmartChoice); setRecommendations([]); }}>
              <span>✨</span> Smart Choice
            </button>
          )}
        </div>

        {/* Smart Choice Panel */}
        {showSmartChoice && (
          <div className="smart-panel">
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 4 }}>✨ Smart Choice — AI Recommendation</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Adjust the weights below to match your priorities. Weights must add up to 100.</p>
            </div>

            {/* Weight Sliders */}
            <div style={{ marginBottom: 20 }}>
              {[
                { key: 'priceWeight', label: '💰 Price Competitiveness', color: '#10B981', desc: 'Lower price = higher score' },
                { key: 'qualityWeight', label: '⭐ Quality (Years of Experience)', color: '#60A5FA', desc: 'More experience = higher score' },
                { key: 'deliveryWeight', label: '🚚 Delivery Timeline', color: '#A78BFA', desc: 'Faster delivery = higher score' },
                { key: 'performanceWeight', label: '📈 Past Performance', color: '#F59E0B', desc: 'More accepted quotations = higher score' },
              ].map(({ key, label, color, desc }) => (
                <div key={key} className="weight-row">
                  <div className="weight-label">
                    <div style={{ marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{desc}</div>
                  </div>
                  <input
                    type="range" min={0} max={100} step={1}
                    value={weights[key as keyof typeof weights]}
                    className="weight-slider"
                    style={{ '--thumb-color': color } as any}
                    onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                  />
                  <div className="weight-value" style={{ color }}>{weights[key as keyof typeof weights]}%</div>
                </div>
              ))}
            </div>

            {/* Total indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Total:</span>
              <span className="total-indicator" style={{
                background: Math.abs(totalWeight - 100) < 0.01 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: Math.abs(totalWeight - 100) < 0.01 ? '#34D399' : '#F87171',
              }}>
                {totalWeight}%
              </span>
              {Math.abs(totalWeight - 100) < 0.01
                ? <span style={{ fontSize: 12, color: '#34D399' }}>✓ Ready to run</span>
                : <span style={{ fontSize: 12, color: '#F87171' }}>Adjust weights to reach 100%</span>
              }
            </div>

            {weightError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {weightError}
              </div>
            )}

            <button className="cc-run-btn" onClick={handleRecommend} disabled={recommending || Math.abs(totalWeight - 100) > 0.01}>
              {recommending ? '⏳ Analysing...' : '🚀 Get Recommendations'}
            </button>

            {/* Recommendation Results */}
            {recommendations.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 16 }}>
                  📊 Results — Ranked by Score
                </h4>
                {recommendations.map((r, i) => (
                  <div key={r.quotationId} className={`rec-card ${i === 0 ? 'rec-card-1' : i === 1 ? 'rec-card-2' : i === 2 ? 'rec-card-3' : 'rec-card-rest'}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div className="rank-badge" style={{
                        background: i === 0 ? '#10B981' : i === 1 ? '#60A5FA' : i === 2 ? '#A78BFA' : 'rgba(255,255,255,0.08)',
                        color: i < 3 ? 'white' : 'rgba(255,255,255,0.4)',
                      }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>{r.companyName}</h4>
                          {i === 0 && <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.2)', color: '#34D399', padding: '2px 8px', borderRadius: 100 }}>RECOMMENDED</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                          <span>₹{r.totalPrice?.toLocaleString()}</span>
                          <span>{r.deliveryDays} days</span>
                          <span>{r.yearsOfExperience} yrs exp.</span>
                          <span>{r.acceptedQuotations} past wins</span>
                        </div>
                      </div>
                      <div className="score-circle" style={{
                        background: i === 0 ? 'rgba(16,185,129,0.15)' : i === 1 ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.06)',
                        color: i === 0 ? '#10B981' : i === 1 ? '#60A5FA' : 'rgba(255,255,255,0.6)',
                        border: `2px solid ${i === 0 ? '#10B981' : i === 1 ? '#60A5FA' : 'rgba(255,255,255,0.1)'}`,
                      }}>
                        {r.finalScore}
                      </div>
                    </div>

                    {/* Score breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                      {[
                        { label: 'Price', score: r.priceScore, color: '#10B981' },
                        { label: 'Quality', score: r.qualityScore, color: '#60A5FA' },
                        { label: 'Delivery', score: r.deliveryScore, color: '#A78BFA' },
                        { label: 'Performance', score: r.performanceScore, color: '#F59E0B' },
                      ].map(({ label, score, color }) => (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color }}>{score}</span>
                          </div>
                          {scoreBar(score, color)}
                        </div>
                      ))}
                    </div>

                    {/* Accept button for top recommendation */}
                    {i === 0 && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(16,185,129,0.15)' }}>
                        <button
                          className="cc-accept-btn"
                          onClick={() => handleAccept(r.quotationId)}
                          disabled={accepting === r.quotationId}
                          style={{ width: '100%' }}>
                          {accepting === r.quotationId ? 'Accepting...' : '✓ Accept Top Recommendation'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Quotations */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            All Quotations ({quotations.length})
          </h3>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '60px 0' }}>Loading...</p>
        ) : quotations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No quotations received yet.</p>
          </div>
        ) : (
          <div>
            {quotations.map((q) => (
              <div key={q.id} className="cc-quotation-card" style={{
                borderLeft: `3px solid ${q.status === 'ACCEPTED' ? '#10B981' : q.status === 'REJECTED' ? '#EF4444' : '#60A5FA'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{q.companyName}</h3>
                      <span className={`badge ${q.status === 'ACCEPTED' ? 'badge-accepted-cls' : q.status === 'REJECTED' ? 'badge-rejected' : 'badge-submitted'}`}>
                        {q.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px' }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Price: <span style={{ color: '#34D399', fontWeight: 700 }}>₹{q.totalPrice?.toLocaleString()}</span></span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Delivery: <span style={{ color: 'white' }}>{q.deliveryDays} days</span></span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Sample: <span style={{ color: 'white' }}>{q.sampleAvailable}</span></span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Terms: <span style={{ color: 'white' }}>{q.termsAndConditions}</span></span>
                    </div>
                    {q.additionalNotes && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>📝 {q.additionalNotes}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, marginLeft: 16 }}>
                    {q.status === 'SUBMITTED' && (
                      <button
                        className="cc-accept-btn"
                        onClick={() => handleAccept(q.id)}
                        disabled={accepting === q.id}>
                        {accepting === q.id ? 'Accepting...' : '✓ Accept'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}