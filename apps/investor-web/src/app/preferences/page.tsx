'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { apiFetch } from '@/lib/api';
import { getInvestorProfileId } from '@/lib/investor';

const CROPS = ['wheat', 'corn', 'rice', 'cotton', 'citrus', 'mango', 'olive', 'tomato', 'potato', 'sugarcane'];
const REGIONS = ['Delta', 'Upper Egypt', 'Fayoum', 'Sinai', 'Canal Zone'];

export default function PreferencesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState({
    investorId: 'inv-001',
    name: 'Ahmed Mansour',
    riskTolerance: 'medium',
    investmentHorizonMonths: 12,
    capitalBudgetUsd: 80000,
    liquidityPreference: 'medium',
    preferredCrops: [] as string[],
    preferredRegions: [] as string[],
    expectedRoiPercent: 15,
    sustainabilityFocus: false,
  });

  // Sync investorId + name from auth once loaded
  useEffect(() => {
    if (!authLoading && user) {
      setPrefs(p => ({ ...p, investorId: getInvestorProfileId(user), name: user.name }));
    }
  }, [authLoading, user]);

  const toggleCrop = (crop: string) => {
    setPrefs(p => ({
      ...p,
      preferredCrops: p.preferredCrops.includes(crop)
        ? p.preferredCrops.filter(c => c !== crop)
        : [...p.preferredCrops, crop],
    }));
  };

  const toggleRegion = (region: string) => {
    setPrefs(p => ({
      ...p,
      preferredRegions: p.preferredRegions.includes(region)
        ? p.preferredRegions.filter(r => r !== region)
        : [...p.preferredRegions, region],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiFetch('/api/investors/preferences', {
        method: 'POST',
        body: JSON.stringify({ ...prefs, userId: user?.id, email: user?.email }),
      });
      await apiFetch('/api/matches/rank', {
        method: 'POST',
        body: JSON.stringify({ ...prefs, userId: user?.id, email: user?.email }),
      });
      router.push('/opportunities?investorId=' + prefs.investorId);
    } catch {
      // Navigate anyway — opportunities page has demo fallback
      router.push('/opportunities?investorId=' + prefs.investorId);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🌾</div>
          <span style={{ fontWeight: 800, color: '#f1f5f9' }}>Farm<span style={{ color: '#22c55e' }}>Vest</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700,
                background: step >= n ? 'var(--accent-green)' : 'var(--bg-card)',
                color: step >= n ? '#000' : 'var(--text-muted)',
                border: step >= n ? 'none' : '1px solid var(--border)',
              }}>{n}</div>
              {n < 3 && <div style={{ width: '32px', height: '1px', background: step > n ? 'var(--accent-green)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Step Labels */}
        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Step {step} of 3
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
          {step === 1 && 'Your Investment Profile'}
          {step === 2 && 'Crop & Region Preferences'}
          {step === 3 && 'Review & Get Matched'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
          {step === 1 && 'Help us understand your risk appetite and financial goals.'}
          {step === 2 && 'Filter by crops or regions you want to invest in (optional).'}
          {step === 3 && 'Confirm your settings and let AI find your best farm matches.'}
        </p>

        {/* Step 1: Core preferences */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">Risk Tolerance</label>
                <div className="toggle-group">
                  {(['low', 'medium', 'high'] as const).map(r => (
                    <button
                      key={r}
                      id={`risk-${r}`}
                      className={`toggle-option ${prefs.riskTolerance === r ? 'selected' : ''}`}
                      onClick={() => setPrefs(p => ({ ...p, riskTolerance: r }))}
                    >
                      {r === 'low' && '🛡️'} {r === 'medium' && '⚖️'} {r === 'high' && '🚀'}{' '}
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <label className="form-label">Investment Budget (USD)</label>
              <div className="range-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Budget</span>
                  <span className="range-value">${prefs.capitalBudgetUsd.toLocaleString()}</span>
                </div>
                <input
                  id="budget-range"
                  type="range" className="range-input"
                  min="10000" max="500000" step="5000"
                  value={prefs.capitalBudgetUsd}
                  onChange={e => setPrefs(p => ({ ...p, capitalBudgetUsd: Number(e.target.value) }))}
                />
                <div className="range-labels"><span>$10K</span><span>$500K</span></div>
              </div>
            </div>

            <div className="card">
              <label className="form-label">Investment Horizon</label>
              <div className="range-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Duration</span>
                  <span className="range-value">{prefs.investmentHorizonMonths} months</span>
                </div>
                <input
                  id="horizon-range"
                  type="range" className="range-input"
                  min="3" max="60" step="3"
                  value={prefs.investmentHorizonMonths}
                  onChange={e => setPrefs(p => ({ ...p, investmentHorizonMonths: Number(e.target.value) }))}
                />
                <div className="range-labels"><span>3 months</span><span>5 years</span></div>
              </div>
            </div>

            <div className="card">
              <label className="form-label">Expected ROI</label>
              <div className="range-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Target Return</span>
                  <span className="range-value">{prefs.expectedRoiPercent}%</span>
                </div>
                <input
                  id="roi-range"
                  type="range" className="range-input"
                  min="5" max="35" step="1"
                  value={prefs.expectedRoiPercent}
                  onChange={e => setPrefs(p => ({ ...p, expectedRoiPercent: Number(e.target.value) }))}
                />
                <div className="range-labels"><span>5%</span><span>35%</span></div>
              </div>
            </div>

            <div className="card">
              <label className="form-label">Liquidity Preference</label>
              <div className="toggle-group">
                {(['low', 'medium', 'high'] as const).map(l => (
                  <button
                    key={l}
                    id={`liquidity-${l}`}
                    className={`toggle-option ${prefs.liquidityPreference === l ? 'selected' : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, liquidityPreference: l }))}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)} Liquidity
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Crop & region filters */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <label className="form-label">Preferred Crops <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave empty for all)</span></label>
              <div className="toggle-group">
                {CROPS.map(crop => (
                  <button
                    key={crop}
                    id={`crop-${crop}`}
                    className={`toggle-option ${prefs.preferredCrops.includes(crop) ? 'selected' : ''}`}
                    onClick={() => toggleCrop(crop)}
                  >
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <label className="form-label">Preferred Regions <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave empty for all)</span></label>
              <div className="toggle-group">
                {REGIONS.map(region => (
                  <button
                    key={region}
                    id={`region-${region}`}
                    className={`toggle-option ${prefs.preferredRegions.includes(region) ? 'selected' : ''}`}
                    onClick={() => toggleRegion(region)}
                  >
                    📍 {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Sustainability Focus 🌿</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Prioritize certified and eco-friendly farms</div>
              </div>
              <button
                id="sustainability-toggle"
                onClick={() => setPrefs(p => ({ ...p, sustainabilityFocus: !p.sustainabilityFocus }))}
                style={{
                  width: '48px', height: '28px', borderRadius: '14px',
                  background: prefs.sustainabilityFocus ? 'var(--accent-green)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border)', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: '4px',
                  left: prefs.sustainabilityFocus ? '22px' : '4px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Your Investment Profile</h3>
              {[
                { label: 'Risk Tolerance', value: prefs.riskTolerance },
                { label: 'Budget', value: `$${prefs.capitalBudgetUsd.toLocaleString()}` },
                { label: 'Horizon', value: `${prefs.investmentHorizonMonths} months` },
                { label: 'Target ROI', value: `${prefs.expectedRoiPercent}%` },
                { label: 'Liquidity', value: prefs.liquidityPreference },
                { label: 'Sustainability', value: prefs.sustainabilityFocus ? 'Yes ✅' : 'No' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.value}</span>
                </div>
              ))}
              {prefs.preferredCrops.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Crops</span>
                  <span style={{ fontWeight: 600 }}>{prefs.preferredCrops.join(', ')}</span>
                </div>
              )}
              {prefs.preferredRegions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Regions</span>
                  <span style={{ fontWeight: 600 }}>{prefs.preferredRegions.join(', ')}</span>
                </div>
              )}
            </div>

            <div style={{
              background: 'var(--accent-green-dim)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '12px', padding: '16px',
              display: 'flex', gap: '12px', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>AI Matching Ready</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Our model will rank all available farms against your profile, explain each match, and suggest the best deal structure.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
          ) : <div />}
          {step < 3 ? (
            <button className="btn btn-primary" id="next-step-btn" onClick={() => setStep(s => s + 1)}>
              Continue →
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              id="find-matches-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '⏳ Finding matches...' : '🎯 Find My Farm Matches'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
