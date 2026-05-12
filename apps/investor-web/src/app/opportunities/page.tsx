'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ── Demo data fallback ────────────────────────────────────────────────────────
const DEMO_MATCHES = [
  {
    farmId: 'farm-003', score: 89, confidence: 'high', estimatedRoiPercent: 22, horizonFitMonths: 3,
    reasons: [
      { label: 'ROI Exceeds Target', positive: true }, { label: 'Within Budget', positive: true },
      { label: 'Short Cycle', positive: true }, { label: 'Preferred Crop', positive: true },
    ],
    riskFlags: [],
  },
  {
    farmId: 'farm-001', score: 74, confidence: 'high', estimatedRoiPercent: 14, horizonFitMonths: 4,
    reasons: [
      { label: 'Risk Profile Match', positive: true }, { label: 'Preferred Region', positive: true },
      { label: 'Within Budget', positive: true },
    ],
    riskFlags: [],
  },
  {
    farmId: 'farm-002', score: 62, confidence: 'medium', estimatedRoiPercent: 19, horizonFitMonths: 9,
    reasons: [
      { label: 'ROI Exceeds Target', positive: true }, { label: 'Certified Farm', positive: true },
      { label: 'Longer Than Horizon', positive: false },
    ],
    riskFlags: [{ severity: 'low', label: 'Single Year History' }],
  },
  {
    farmId: 'farm-005', score: 55, confidence: 'medium', estimatedRoiPercent: 20, horizonFitMonths: 12,
    reasons: [
      { label: 'ROI Exceeds Target', positive: true }, { label: 'Certified Farm', positive: true },
      { label: 'Longer Than Horizon', positive: false },
    ],
    riskFlags: [],
  },
];

const FARM_DETAILS: Record<string, { name: string; region: string; governorate: string; currentCrop: string; areaHectares: number; requestedCapitalUsd: number; waterSource: string; status: string }> = {
  'farm-001': { name: 'Nile Delta Wheat Cooperative', region: 'Delta', governorate: 'Beheira', currentCrop: 'Wheat', areaHectares: 45, requestedCapitalUsd: 85000, waterSource: 'Nile', status: 'active' },
  'farm-002': { name: 'Upper Egypt Citrus Estate', region: 'Upper Egypt', governorate: 'Luxor', currentCrop: 'Citrus', areaHectares: 28, requestedCapitalUsd: 120000, waterSource: 'Groundwater', status: 'active' },
  'farm-003': { name: 'Fayoum Tomato & Potato Farm', region: 'Fayoum', governorate: 'Fayoum', currentCrop: 'Tomato', areaHectares: 15, requestedCapitalUsd: 45000, waterSource: 'Canal', status: 'active' },
  'farm-004': { name: 'Sinai Olive Grove Project', region: 'Sinai', governorate: 'North Sinai', currentCrop: 'Olive', areaHectares: 60, requestedCapitalUsd: 200000, waterSource: 'Groundwater', status: 'pending_review' },
  'farm-005': { name: 'Aswan Sugarcane Plantation', region: 'Upper Egypt', governorate: 'Aswan', currentCrop: 'Sugarcane', areaHectares: 80, requestedCapitalUsd: 175000, waterSource: 'Nile', status: 'active' },
};

const CROP_EMOJIS: Record<string, string> = {
  Wheat: '🌾', Citrus: '🍊', Tomato: '🍅', Potato: '🥔', Sugarcane: '🌿', Olive: '🫒',
};

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const investorId = searchParams.get('investorId') ?? 'inv-001';
  const [matches, setMatches] = useState<typeof DEMO_MATCHES>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'roi'>('score');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/matches/${investorId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMatches(data);
          } else throw new Error('empty');
        } else throw new Error('api');
      } catch {
        setMatches(DEMO_MATCHES);
      }
      setLoading(false);
    };
    loadMatches();
  }, [investorId]);

  const sorted = [...matches]
    .filter(m => filterConfidence === 'all' || m.confidence === filterConfidence)
    .sort((a, b) => sortBy === 'score' ? b.score - a.score : b.estimatedRoiPercent - a.estimatedRoiPercent);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Topbar */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🌾</div>
            <span style={{ fontWeight: 800, color: '#f1f5f9' }}>Farm<span style={{ color: '#22c55e' }}>Vest</span></span>
          </Link>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Matched Opportunities</span>
        </div>
        <Link href="/preferences" className="btn btn-primary btn-sm">⚙️ Update Preferences</Link>
      </div>

      <div style={{ padding: '32px 40px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Your Farm Matches
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {matches.length} farms ranked by AI against your investment profile
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sort:</span>
            {[{ val: 'score', label: '🏆 Match Score' }, { val: 'roi', label: '📈 ROI' }].map(s => (
              <button key={s.val} id={`sort-${s.val}`} className={`toggle-option ${sortBy === s.val ? 'selected' : ''}`} onClick={() => setSortBy(s.val as never)} style={{ fontSize: '12px', padding: '6px 12px' }}>{s.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter:</span>
            {['all', 'high', 'medium', 'low'].map(f => (
              <button key={f} id={`filter-${f}`} className={`toggle-option ${filterConfidence === f ? 'selected' : ''}`} onClick={() => setFilterConfidence(f)} style={{ fontSize: '12px', padding: '6px 12px' }}>{f === 'all' ? 'All' : f + ' confidence'}</button>
            ))}
          </div>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="card-grid card-grid-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card" style={{ height: '200px' }}>
                <div className="skeleton" style={{ height: '100%', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-grid card-grid-2" style={{ gap: '16px' }}>
            {sorted.map((match, i) => {
              const farm = FARM_DETAILS[match.farmId];
              if (!farm) return null;
              return (
                <Link key={match.farmId} href={`/opportunities/${match.farmId}?investorId=${investorId}`} className="farm-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="farm-card-header">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px' }}>{CROP_EMOJIS[farm.currentCrop] ?? '🌱'}</span>
                        <div className="farm-name">{farm.name}</div>
                      </div>
                      <div className="farm-location">📍 {farm.governorate}, {farm.region}</div>
                    </div>
                    <div className="farm-score-badge">
                      <div className="farm-score-number">{match.score}</div>
                      <div className="farm-score-label">Match</div>
                    </div>
                  </div>

                  <div className="farm-card-body">
                    <div className="farm-meta">
                      <div className="farm-meta-item">
                        <div className="farm-meta-label">Projected ROI</div>
                        <div className="farm-meta-value" style={{ color: 'var(--accent-green)' }}>{match.estimatedRoiPercent}%</div>
                      </div>
                      <div className="farm-meta-item">
                        <div className="farm-meta-label">Capital Needed</div>
                        <div className="farm-meta-value">${farm.requestedCapitalUsd.toLocaleString()}</div>
                      </div>
                      <div className="farm-meta-item">
                        <div className="farm-meta-label">Area</div>
                        <div className="farm-meta-value">{farm.areaHectares} ha</div>
                      </div>
                      <div className="farm-meta-item">
                        <div className="farm-meta-label">Cycle Fit</div>
                        <div className="farm-meta-value">{match.horizonFitMonths} mo.</div>
                      </div>
                    </div>

                    <div className="reason-pills">
                      {match.reasons.slice(0, 3).map((r, j) => (
                        <span key={j} className={`reason-pill ${r.positive ? 'positive' : 'negative'}`}>
                          {r.positive ? '✓' : '✗'} {r.label}
                        </span>
                      ))}
                      {match.riskFlags.slice(0, 1).map((flag, j) => (
                        <span key={`flag-${j}`} className={`risk-badge ${flag.severity}`}>{flag.severity === 'high' ? '🚨' : '⚠️'} {flag.label}</span>
                      ))}
                    </div>
                  </div>

                  <div className="farm-card-footer">
                    <span className={`confidence-badge ${match.confidence}`}>
                      {match.confidence} confidence
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 600 }}>View Deal →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>No matches found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Try broadening your filters</p>
            <button className="btn btn-secondary" onClick={() => setFilterConfidence('all')}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
