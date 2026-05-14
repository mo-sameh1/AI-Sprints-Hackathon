'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { apiFetch } from '@/lib/api';
import { getInvestorProfileId } from '@/lib/investor';

// Demo data
interface FarmDetail {
  name: string; region: string; governorate: string; currentCrop: string;
  areaHectares: number; requestedCapitalUsd: number; waterSource: string;
  soilType: string; projectedRoiPercent: number; cropCycleDays: number;
  certifications: string[]; yieldHistory: { year: number; tonnesPerHectare: number; revenueUsd: number }[];
  aiProfileSummary?: string; status: string;
}

const FARMS: Record<string, FarmDetail> = {
  'farm-001': {
    name: 'Nile Delta Wheat Cooperative', region: 'Delta', governorate: 'Beheira',
    currentCrop: 'Wheat', areaHectares: 45, requestedCapitalUsd: 85000,
    waterSource: 'Nile River', soilType: 'Clay', projectedRoiPercent: 14,
    cropCycleDays: 120, certifications: ['GlobalG.A.P.'],
    yieldHistory: [{ year: 2023, tonnesPerHectare: 4.2, revenueUsd: 72000 }, { year: 2024, tonnesPerHectare: 4.5, revenueUsd: 78000 }],
    aiProfileSummary: 'Established wheat cooperative with 2-year yield history and Nile irrigation access. Consistent yield growth of 7% year-over-year. Low operational risk.',
    status: 'active',
  },
  'farm-002': {
    name: 'Upper Egypt Citrus Estate', region: 'Upper Egypt', governorate: 'Luxor',
    currentCrop: 'Citrus', areaHectares: 28, requestedCapitalUsd: 120000,
    waterSource: 'Groundwater', soilType: 'Sandy', projectedRoiPercent: 19,
    cropCycleDays: 270, certifications: ['Organic Egypt', 'Fair Trade'],
    yieldHistory: [{ year: 2024, tonnesPerHectare: 18, revenueUsd: 95000 }],
    aiProfileSummary: 'Premium citrus estate with dual organic certifications. High ROI driven by export-grade fruit quality.',
    status: 'active',
  },
  'farm-003': {
    name: 'Fayoum Tomato & Potato Farm', region: 'Fayoum', governorate: 'Fayoum',
    currentCrop: 'Tomato', areaHectares: 15, requestedCapitalUsd: 45000,
    waterSource: 'Irrigation Canal', soilType: 'Loamy', projectedRoiPercent: 22,
    cropCycleDays: 90, certifications: [],
    yieldHistory: [{ year: 2023, tonnesPerHectare: 35, revenueUsd: 42000 }, { year: 2024, tonnesPerHectare: 22, revenueUsd: 38000 }],
    aiProfileSummary: 'High-yield vegetable farm with short 90-day cycles and excellent capital velocity.',
    status: 'active',
  },
  'farm-005': {
    name: 'Aswan Sugarcane Plantation', region: 'Upper Egypt', governorate: 'Aswan',
    currentCrop: 'Sugarcane', areaHectares: 80, requestedCapitalUsd: 175000,
    waterSource: 'Nile River', soilType: 'Clay', projectedRoiPercent: 20,
    cropCycleDays: 365, certifications: ['GlobalG.A.P.', 'Rainforest Alliance'],
    yieldHistory: [
      { year: 2022, tonnesPerHectare: 75, revenueUsd: 130000 },
      { year: 2023, tonnesPerHectare: 80, revenueUsd: 142000 },
      { year: 2024, tonnesPerHectare: 82, revenueUsd: 148000 },
    ],
    aiProfileSummary: 'Mature sugarcane plantation with 3-year growth trend and dual certifications.',
    status: 'active',
  },
};

const DEMO_DEAL = {
  structureType: 'revenue_share',
  recommendedInvestmentUsd: 44000,
  projectedRoiPercent: 19.8,
  durationMonths: 3,
  aiConfidence: 'high',
  rationale: 'A Revenue share partnership is recommended for this opportunity. Fayoum Tomato & Potato Farm in Fayoum is cultivating tomato across 15 hectares with a projected ROI of 19.8%. Given your medium risk tolerance and 12-month horizon, this structure optimizes your return while preserving appropriate downside protection. Historical yield data from 2 season(s) supports this projection.',
  riskSummary: 'No major risk factors identified. Standard agricultural and market risks apply.',
  terms: [
    { label: 'Investment Amount', value: '$44,000 USD' },
    { label: 'Duration', value: '3 months' },
    { label: 'Projected ROI', value: '19.8%' },
    { label: 'Revenue Share', value: '40% of gross revenue' },
    { label: 'Distribution', value: 'End of crop cycle' },
    { label: 'Exit Right', value: 'Transferable after 6 months' },
  ],
};

const STRUCTURE_LABELS: Record<string, string> = {
  revenue_share: 'Revenue Share Partnership',
  equity: 'Equity Stake',
  loan: 'Fixed-Return Loan',
  convertible_note: 'Convertible Note',
  hybrid: 'Hybrid Structure',
};

const CROP_EMOJI: Record<string, string> = { Wheat: '🌾', Citrus: '🍊', Tomato: '🍅', Sugarcane: '🌿', Olive: '🫒' };

function FarmDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const farmId = params.id as string;
  const investorId = searchParams.get('investorId') ?? getInvestorProfileId(user);
  const [farm, setFarm] = useState<FarmDetail | null>(FARMS[farmId] ?? null);
  const [deal, setDeal] = useState<typeof DEMO_DEAL | null>(null);
  const [loadingDeal, setLoadingDeal] = useState(true);
  const [added, setAdded] = useState(false);
  const [investmentFraction, setInvestmentFraction] = useState<number>(25);

  useEffect(() => {
    setFarm(FARMS[farmId] ?? null);
    apiFetch<FarmDetail & { error?: string }>(`/api/farms/${farmId}`)
      .then(data => {
        if (!('error' in data)) setFarm(data);
      })
      .catch(() => {});
  }, [farmId]);

  useEffect(() => {
    const loadDeal = async () => {
      setLoadingDeal(true);
      try {
        const data = await apiFetch<typeof DEMO_DEAL>('/api/deals/recommend', {
          method: 'POST',
          body: JSON.stringify({ farmId, investorId }),
        });
        setDeal(data);
      } catch {
        setDeal({ ...DEMO_DEAL, rationale: DEMO_DEAL.rationale.replace('Fayoum Tomato & Potato Farm', farm?.name ?? farmId) });
      }
      setLoadingDeal(false);
    };
    loadDeal();
  }, [farmId, investorId, farm]);

  const handleAddToPortfolio = async () => {
    try {
      await apiFetch(`/api/investors/${investorId}/portfolio`, {
        method: 'POST',
        body: JSON.stringify({ farmId }),
      });
    } finally {
      setAdded(true);
    }
  };

  if (!farm) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ marginBottom: '12px' }}>Farm not found</h2>
          <Link href="/opportunities" className="btn btn-primary">← Back to Opportunities</Link>
        </div>
      </div>
    );
  }

  const totalCapital = farm.requestedCapitalUsd;
  const roiPercent = farm.projectedRoiPercent;
  const fractionalInvestment = Math.round((investmentFraction / 100) * totalCapital);
  const projectedGain = Math.round(fractionalInvestment * (roiPercent / 100));
  const totalEstimatedPayout = fractionalInvestment + projectedGain;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Topbar */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href={`/opportunities?investorId=${investorId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ← Opportunities
        </Link>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{farm.name}</span>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Farm Header */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.2))',
            border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
          }}>
            {CROP_EMOJI[farm.currentCrop] ?? '🌱'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>{farm.name}</h1>
              <span className={`confidence-badge ${farm.status === 'active' ? 'high' : 'medium'}`}>
                {farm.status === 'active' ? '✅ Active' : '🔄 Pending'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>
              📍 {farm.governorate}, {farm.region}, Egypt
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {farm.certifications.map(c => (
                <span key={c} className="tag">🏅 {c}</span>
              ))}
              <span className="tag">🌾 {farm.currentCrop}</span>
              <span className="tag">💧 {farm.waterSource}</span>
              <span className="tag">🌍 {farm.soilType} soil</span>
            </div>
          </div>
          <button
            id="add-to-portfolio-btn"
            className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleAddToPortfolio}
          >
            {added ? '✓ Watchlisted' : '+ Add to Watchlist'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AI Summary */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px' }}>🤖</span>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>AI Farm Summary</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {farm.aiProfileSummary}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="card">
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Farm Metrics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Area', value: `${farm.areaHectares} hectares` },
                  { label: 'Crop Cycle', value: `${farm.cropCycleDays} days` },
                  { label: 'Projected ROI', value: `${farm.projectedRoiPercent}%`, green: true },
                  { label: 'Capital Needed', value: `$${farm.requestedCapitalUsd.toLocaleString()}` },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{m.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: m.green ? 'var(--accent-green)' : 'var(--text-primary)' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yield History */}
            {farm.yieldHistory.length > 0 && (
              <div className="card">
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>📊 Yield History</div>
                {farm.yieldHistory.map(y => (
                  <div key={y.year} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{y.year}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{y.tonnesPerHectare} t/ha</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>${y.revenueUsd.toLocaleString()}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column — Deal Panel */}
          <div>
            {loadingDeal ? (
              <div className="card" style={{ height: '400px' }}>
                <div className="skeleton" style={{ height: '100%', borderRadius: '8px' }} />
              </div>
            ) : deal ? (
              <div className="deal-panel">
                <div className="deal-header">
                  <div className="deal-icon">💰</div>
                  <div>
                    <div className="deal-title">{STRUCTURE_LABELS[deal.structureType] ?? deal.structureType}</div>
                    <div className="deal-subtitle">AI Confidence: {deal.aiConfidence} &nbsp;|&nbsp; {deal.durationMonths} months</div>
                  </div>
                </div>

                {/* ROI Highlight */}
                <div style={{
                  background: 'var(--accent-green-dim)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: '12px', padding: '16px', marginBottom: '16px',
                  display: 'flex', justifyContent: 'space-around', textAlign: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Projected ROI</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent-green)' }}>{deal.projectedRoiPercent}%</div>
                  </div>
                  <div style={{ width: '1px', background: 'rgba(34,197,94,0.2)' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Investment</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>${totalCapital.toLocaleString()}</div>
                  </div>
                </div>

                {/* Fractional Investment Calculator */}
                <div style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '20px', marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🍰</span> Fractional Investment Calculator
                    </div>
                    <span style={{ fontSize: '12px', background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      Flexible Share
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
                    You don't need the full land price. Choose a fraction of the capital to invest and instantly see your projected gains.
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                      <span>Investment Share:</span>
                      <span style={{ color: 'var(--accent-green)' }}>{investmentFraction}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={investmentFraction}
                      onChange={e => setInvestmentFraction(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[10, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setInvestmentFraction(pct)}
                        style={{
                          flex: 1, padding: '6px', fontSize: '12px', fontWeight: 600,
                          borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer',
                          background: investmentFraction === pct ? 'var(--accent-green)' : 'var(--bg-primary)',
                          color: investmentFraction === pct ? '#000' : 'var(--text-primary)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Your Fraction</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>${fractionalInvestment.toLocaleString()}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Net Gain</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-green)' }}>+${projectedGain.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Payout</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>${totalEstimatedPayout.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="deal-terms">
                  {deal.terms.map(t => (
                    <div key={t.label} className="deal-term">
                      <div className="deal-term-label">{t.label}</div>
                      <div className="deal-term-value">{t.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>AI Rationale</div>
                <div className="deal-rationale">{deal.rationale}</div>

                {deal.riskSummary && (
                  <div style={{ background: 'var(--accent-amber-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    ⚠️ {deal.riskSummary}
                  </div>
                )}

                <button
                  id="express-interest-btn"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => alert(`🤝 Interest submitted for a ${investmentFraction}% fractional share ($${fractionalInvestment.toLocaleString()})!\n\nProjected Gain: $${projectedGain.toLocaleString()}\nTotal Payout: $${totalEstimatedPayout.toLocaleString()}\n\nThe platform team will contact you to finalize.`)}
                >
                  🤝 Express Interest ({investmentFraction}% Share)
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FarmDetailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
      <FarmDetailContent />
    </Suspense>
  );
}
