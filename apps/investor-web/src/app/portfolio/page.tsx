'use client';
import Link from 'next/link';

const WATCHLIST_FARMS = [
  { id: 'farm-001', name: 'Nile Delta Wheat Cooperative', region: 'Delta', crop: 'Wheat', roi: 14, score: 74, emoji: '🌾' },
  { id: 'farm-003', name: 'Fayoum Tomato & Potato Farm', region: 'Fayoum', crop: 'Tomato', roi: 22, score: 89, emoji: '🍅' },
];

export default function PortfolioPage() {
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
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>My Portfolio</span>
        </div>
        <Link href="/opportunities" className="btn btn-primary btn-sm">Browse More Farms</Link>
      </div>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Stats */}
        <div className="card-grid card-grid-3" style={{ marginBottom: '32px', gap: '16px' }}>
          {[
            { icon: '💼', label: 'Watchlisted Farms', value: '2', color: 'blue' },
            { icon: '📈', label: 'Avg. Projected ROI', value: '18%', color: 'green' },
            { icon: '💰', label: 'Total Capital Opportunity', value: '$130K', color: 'amber' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Watchlist */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Watchlist</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {WATCHLIST_FARMS.map(farm => (
              <Link key={farm.id} href={`/opportunities/${farm.id}?investorId=inv-001`}
                style={{ textDecoration: 'none', display: 'block' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '28px' }}>{farm.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{farm.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {farm.region} • {farm.crop}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-green)' }}>{farm.roi}%</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ROI</div>
                  </div>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'var(--accent-green-dim)', border: '1px solid rgba(34,197,94,0.3)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-green)', lineHeight: '1' }}>{farm.score}</div>
                    <div style={{ fontSize: '9px', color: 'var(--accent-green)' }}>MATCH</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '40px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚀</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Find more opportunities</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
            Update your preferences or browse all active farms to expand your watchlist.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/preferences" className="btn btn-secondary">⚙️ Update Preferences</Link>
            <Link href="/opportunities" className="btn btn-primary">Explore Farms →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
