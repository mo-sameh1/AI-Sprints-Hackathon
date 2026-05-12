'use client';
import { useState } from 'react';
import Link from 'next/link';

const CROPS = ['wheat', 'corn', 'rice', 'cotton', 'citrus', 'mango', 'olive', 'tomato', 'potato', 'sugarcane', 'onion', 'grapes'];
const REGIONS = ['Delta', 'Upper Egypt', 'Fayoum', 'Sinai', 'Canal Zone', 'Western Desert', 'Eastern Delta'];
const GOVERNORATES = ['Cairo', 'Giza', 'Alexandria', 'Beheira', 'Gharbia', 'Dakahlia', 'Luxor', 'Aswan', 'Qena', 'Fayoum', 'Minya', 'Asyut', 'Sohag', 'North Sinai', 'South Sinai', 'Ismailia', 'Suez', 'Port Said'];
const WATER_SOURCES = [
  { value: 'nile', label: '🌊 Nile River', desc: 'Direct access or nearby canal' },
  { value: 'irrigation_canal', label: '💧 Irrigation Canal', desc: 'Government canal system' },
  { value: 'groundwater', label: '⛏️ Groundwater', desc: 'Drilled well' },
  { value: 'rainwater', label: '🌧️ Rainwater', desc: 'Rain-fed farming' },
  { value: 'mixed', label: '🔄 Mixed', desc: 'Multiple sources' },
];
const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Chalky', 'Peaty'];

export default function OperatorOnboardPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [farm, setFarm] = useState({
    name: '', region: '', governorate: '', currentCrop: '', areaHectares: '',
    requestedCapitalUsd: '', waterSource: '', soilType: '', notes: '',
    operatorId: 'op-new', country: 'Egypt',
  });

  const update = (key: string, val: string) => setFarm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:4000/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...farm, areaHectares: Number(farm.areaHectares), requestedCapitalUsd: Number(farm.requestedCapitalUsd) }),
      });
    } catch { /* demo */ }
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div>
        <header className="header">
          <Link href="/" className="logo">
            <div className="logo-icon">🌾</div>
            <span className="logo-text">Farm<span>Vest</span> <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--text-secondary)' }}>Operator</span></span>
          </Link>
        </header>
        <div className="container">
          <div className="success-banner">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Farm Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your farm profile has been submitted for review. Our AI will build your farm profile and match it with investors.
            </p>
            <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '8px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>What happens next:</div>
              {['AI builds your structured farm profile', 'Admin reviews and verifies the submission', 'Farm is listed and matched to investors', 'You get notified via WhatsApp when matched'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--accent-light)' }}>→</span> {s}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setStep(1); setFarm({ name: '', region: '', governorate: '', currentCrop: '', areaHectares: '', requestedCapitalUsd: '', waterSource: '', soilType: '', notes: '', operatorId: 'op-new', country: 'Egypt' }); }}>
                Submit Another Farm
              </button>
              <Link href="/status" className="btn btn-primary">Track Submission →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <Link href="/" className="logo">
          <div className="logo-icon">🌾</div>
          <span className="logo-text">Farm<span>Vest</span> <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--text-secondary)' }}>Operator</span></span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/onboard" className="nav-link active">Submit Farm</Link>
          <Link href="/reports" className="nav-link">Reports</Link>
          <Link href="/status" className="nav-link">Status</Link>
        </nav>
      </header>

      <div className="container">
        {/* Step Indicator */}
        <div className="step-indicator">
          {[1, 2, 3].map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'initial' }}>
              <div className={`step-dot ${step > n ? 'done' : step === n ? 'active' : 'pending'}`}>
                {step > n ? '✓' : n}
              </div>
              {i < 2 && <div className={`step-line ${step > n ? 'done' : ''}`} />}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Step {step} of 3</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>
          {step === 1 && 'Farm Location & Basics'}
          {step === 2 && 'Crop & Land Details'}
          {step === 3 && 'Investment Requirements'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>
          {step === 1 && 'Tell us where your farm is and who you are.'}
          {step === 2 && 'Describe your crop, soil, and water access.'}
          {step === 3 && 'How much capital do you need and what will it fund?'}
        </p>

        {/* Step 1 */}
        {step === 1 && (
          <div className="card">
            <div className="form-group">
              <label className="form-label">Farm Name *</label>
              <input id="farm-name" className="form-input" placeholder="e.g. Nile Delta Wheat Farm" value={farm.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Region</label>
                <select id="farm-region" className="form-select" value={farm.region} onChange={e => update('region', e.target.value)}>
                  <option value="">Select region</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Governorate</label>
                <select id="farm-governorate" className="form-select" value={farm.governorate} onChange={e => update('governorate', e.target.value)}>
                  <option value="">Select governorate</option>
                  {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Current Crop</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CROPS.map(c => (
                    <button key={c} id={`crop-${c}`} className={`select-option ${farm.currentCrop === c ? 'selected' : ''}`} onClick={() => update('currentCrop', c)}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Farm Area (Hectares)</label>
                  <input id="farm-area" type="number" className="form-input" placeholder="e.g. 25" value={farm.areaHectares} onChange={e => update('areaHectares', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Soil Type</label>
                  <select id="farm-soil" className="form-select" value={farm.soilType} onChange={e => update('soilType', e.target.value)}>
                    <option value="">Select soil type</option>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="card">
              <label className="form-label" style={{ marginBottom: '12px' }}>Water Source</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {WATER_SOURCES.map(w => (
                  <button key={w.value} id={`water-${w.value}`} onClick={() => update('waterSource', w.value)}
                    style={{
                      padding: '12px 14px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                      background: farm.waterSource === w.value ? 'var(--accent-dim)' : 'var(--surface)',
                      border: farm.waterSource === w.value ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: farm.waterSource === w.value ? 'var(--accent-light)' : 'var(--text)' }}>{w.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{w.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Capital Needed (USD) *</label>
                <input id="farm-capital" type="number" className="form-input" placeholder="e.g. 50000" value={farm.requestedCapitalUsd} onChange={e => update('requestedCapitalUsd', e.target.value)} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>This is the total investment you are seeking from investors.</div>
              </div>
            </div>
            <div className="card">
              <label className="form-label">How will you use the capital?</label>
              <textarea id="farm-notes" className="form-textarea" placeholder="e.g. Purchase seeds and fertilizer for next season, irrigation system upgrade..." value={farm.notes} onChange={e => update('notes', e.target.value)} />
            </div>

            {/* Review Summary */}
            <div className="card" style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '14px' }}>📋 Submission Summary</div>
              {[
                { label: 'Farm Name', value: farm.name || '—' },
                { label: 'Location', value: farm.governorate ? `${farm.governorate}, ${farm.region}` : '—' },
                { label: 'Crop', value: farm.currentCrop || '—' },
                { label: 'Area', value: farm.areaHectares ? `${farm.areaHectares} hectares` : '—' },
                { label: 'Water Source', value: farm.waterSource || '—' },
                { label: 'Capital Needed', value: farm.requestedCapitalUsd ? `$${Number(farm.requestedCapitalUsd).toLocaleString()}` : '—' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
          ) : <div />}
          {step < 3 ? (
            <button id="next-btn" className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Continue →</button>
          ) : (
            <button id="submit-btn" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? '⏳ Submitting...' : '🚀 Submit Farm Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
