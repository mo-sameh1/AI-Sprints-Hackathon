'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';

export default function InvestorHomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  return (
    <div>
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(8,12,20,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>🌾</div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
            Farm<span style={{ color: '#22c55e' }}>Vest</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/opportunities" className="btn btn-ghost btn-sm">Browse Farms</Link>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); router.push('/login'); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/preferences" className="btn btn-primary btn-sm">Get Matched →</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="hero" style={{ paddingTop: '120px' }}>
        <div className="hero-badge pulse">
          <span>🌱</span> AI-Powered Agricultural Investing in Egypt
        </div>
        <h1 className="hero-title fade-up">
          Invest in Egypt&apos;s<br />
          <span className="highlight">Agricultural Future</span>
        </h1>
        <p className="hero-subtitle fade-up" style={{ animationDelay: '0.1s' }}>
          Fractional farm investments matched to your preferences by AI. 
          Transparent ROI projections, structured deals, and real-time monitoring.
        </p>
        <div className="hero-actions fade-up" style={{ animationDelay: '0.2s' }}>
          <Link href="/preferences" className="btn btn-primary btn-lg">
            🎯 Find My Matches
          </Link>
          <Link href="/opportunities" className="btn btn-secondary btn-lg">
            Explore Farms
          </Link>
        </div>
        <div className="hero-stats fade-up" style={{ animationDelay: '0.3s' }}>
          {[
            { value: '5+', label: 'Active Farms' },
            { value: '18%', label: 'Avg. ROI' },
            { value: '4', label: 'Regions' },
            { value: '3', label: 'Crop Types' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="hero-stat-value">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-secondary)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="section-header">
            <div className="section-eyebrow">How It Works</div>
            <h2 className="section-title">From preferences to profit in 3 steps</h2>
            <p className="section-desc">Our AI matches your capital and risk profile to Egypt&apos;s best farms.</p>
          </div>
          <div className="card-grid card-grid-3">
            {[
              { icon: '🎛️', step: '01', title: 'Set Your Preferences', desc: 'Tell us your risk tolerance, budget, investment horizon, and preferred crops or regions.' },
              { icon: '🤖', step: '02', title: 'AI Ranks Your Matches', desc: 'Our multi-factor model scores every farm against your profile with transparent reasoning.' },
              { icon: '📋', step: '03', title: 'Get Deal Recommendations', desc: 'Receive structured deal proposals (revenue share, equity, loan) optimized for your goals.' },
            ].map(f => (
              <div key={f.step} className="card" style={{ padding: '32px 28px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'var(--accent-green-dim)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '26px',
                  marginBottom: '20px',
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Step {f.step}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', textAlign: 'center', background: 'var(--bg-primary)' }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.08))',
          border: '1px solid rgba(34,197,94,0.2)', borderRadius: '24px', padding: '56px',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Ready to invest in Egypt&apos;s soil?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '15px' }}>
            Set your preferences and get AI-ranked farm matches in seconds.
          </p>
          <Link href="/preferences" className="btn btn-primary btn-lg">
            Start Matching →
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{
        padding: '28px 40px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'var(--text-muted)', fontSize: '13px',
      }}>
        <span>© 2026 FarmVest — AI Sprints Hackathon</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/opportunities" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Browse Farms</Link>
          <Link href="/preferences" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Set Preferences</Link>
          <Link href="/portfolio" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Portfolio</Link>
        </div>
      </footer>
    </div>
  );
}
