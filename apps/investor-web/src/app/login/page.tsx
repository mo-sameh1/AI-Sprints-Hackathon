'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('investor@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/investor');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/investor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
          }}>🌾</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Farm<span style={{ color: '#22c55e' }}>Vest</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Sign in to your investor account
          </p>
        </div>

        {/* Demo hint */}
        <div style={{
          background: 'var(--accent-green-dim)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '24px',
          fontSize: '13px', color: 'var(--text-secondary)',
        }}>
          <strong style={{ color: 'var(--accent-green)' }}>Demo credentials pre-filled</strong>
          {' '}— password is <code style={{ background: 'var(--bg-card)', padding: '1px 4px', borderRadius: '3px' }}>password123</code>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input
                id="email-input"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <input
                id="password-input"
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '13px', color: '#f87171',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
              disabled={submitting}
            >
              {submitting ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </div>
        </form>

        {/* Other demo accounts */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
            Other demo accounts
          </div>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            {[
              { label: 'Operator', email: 'mohamed@operator.com', href: '/operator' },
              { label: 'Admin', email: 'admin@aisprints.com', href: '/admin/login' },
            ].map(a => (
              <a key={a.email} href={a.href} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '10px 14px', textDecoration: 'none',
                fontSize: '13px', color: 'var(--text-secondary)',
              }}>
                <span>{a.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{a.email}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
