'use client';
import Link from 'next/link';

export default function OperatorHomePage() {
  return (
    <div>
      <header className="header">
        <Link href="/" className="logo">
          <div className="logo-icon">🌾</div>
          <span className="logo-text">Farm<span>Vest</span> <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--text-secondary)' }}>Operator</span></span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link active">Home</Link>
          <Link href="/onboard" className="nav-link">Submit Farm</Link>
          <Link href="/reports" className="nav-link">Reports</Link>
          <Link href="/status" className="nav-link">Status</Link>
        </nav>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #07100d, #0a1c12, #0d2316)', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--accent-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '24px' }}>
          🌾 Egypt Agricultural Investor Network
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px', lineHeight: '1.1' }}>
          Connect Your Farm<br />
          <span style={{ color: 'var(--accent-light)' }}>To Smart Investors</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 32px', fontSize: '16px', lineHeight: '1.7' }}>
          Submit your farm profile, attract fractional investors, and grow with the capital you need.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/onboard" className="btn btn-primary" style={{ fontSize: '15px', padding: '12px 24px' }}>
            🚀 Submit Your Farm
          </Link>
          <Link href="/status" className="btn btn-secondary" style={{ fontSize: '15px', padding: '12px 24px' }}>
            Track Submissions
          </Link>
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: '60px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', marginBottom: '36px' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: '📋', step: '01', title: 'Submit Your Farm', desc: 'Fill out our simple 3-step form with farm details, crop info, and capital needs.' },
            { icon: '🤖', step: '02', title: 'AI Profiles Your Farm', desc: 'Our system structures your profile, projects ROI, and prepares it for investors.' },
            { icon: '✅', step: '03', title: 'Admin Reviews', desc: 'Our team verifies your submission and activates your farm listing.' },
            { icon: '💰', step: '04', title: 'Get Funded', desc: 'Investors discover your farm, review the deal structure, and commit capital.' },
          ].map(f => (
            <div key={f.step} className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Step {f.step}</div>
              <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '15px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>My Farms</h2>
            <Link href="/onboard" className="btn btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }}>+ Add Farm</Link>
          </div>
          <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🌾</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Nile Delta Wheat Cooperative</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📍 Beheira, Delta • 45 hectares • Wheat</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--accent-dim)', color: 'var(--accent-light)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>✅ Active</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>2 investor matches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
