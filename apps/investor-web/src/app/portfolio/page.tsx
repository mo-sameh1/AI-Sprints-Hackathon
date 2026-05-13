'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { apiFetch } from '@/lib/api';
import { getInvestorProfileId } from '@/lib/investor';

interface WatchlistFarm {
  id: string;
  name: string;
  region: string;
  currentCrop: string;
  projectedRoiPercent: number;
  score?: number;
  emoji?: string;
}

const CROP_EMOJI: Record<string, string> = {
  wheat: '🌾', citrus: '🍊', tomato: '🍅', potato: '🥔',
  sugarcane: '🌿', olive: '🫒', mango: '🥭', corn: '🌽',
};

const STATIC_WATCHLIST: WatchlistFarm[] = [
  { id: 'farm-001', name: 'Nile Delta Wheat Cooperative', region: 'Delta', currentCrop: 'wheat', projectedRoiPercent: 14, score: 74 },
  { id: 'farm-003', name: 'Fayoum Tomato & Potato Farm', region: 'Fayoum', currentCrop: 'tomato', projectedRoiPercent: 22, score: 89 },
];

export default function PortfolioPage() {
  const { user, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistFarm[]>(STATIC_WATCHLIST);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const loadPortfolio = async () => {
      setLoading(true);
      try {
        // Fetch investor profile to get portfolio farm IDs
        const investorId = getInvestorProfileId(user);
        const investor = await apiFetch<{ portfolio?: string[]; preferences?: { investorId: string } }>(
          `/api/investors/${investorId}`
        );
        const farmIds: string[] = investor.portfolio ?? [];
        if (farmIds.length === 0) {
          setWatchlist(STATIC_WATCHLIST);
          setLoading(false);
          return;
        }
        // Fetch each farm
        const farms = await Promise.all(
          farmIds.map(id =>
            apiFetch<WatchlistFarm & { status?: string }>(`/api/farms/${id}`).catch(() => null)
          )
        );
        const valid = farms.filter(Boolean) as WatchlistFarm[];
        setWatchlist(valid.length ? valid : STATIC_WATCHLIST);
      } catch {
        setWatchlist(STATIC_WATCHLIST);
      }
      setLoading(false);
    };

    loadPortfolio();
  }, [isAuthenticated, user]);

  const avgRoi = watchlist.length
    ? Math.round(watchlist.reduce((s, f) => s + f.projectedRoiPercent, 0) / watchlist.length)
    : 0;

  const investorId = getInvestorProfileId(user);

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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {user && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.name}</span>}
          <Link href="/opportunities" className="btn btn-primary btn-sm">Browse More Farms</Link>
        </div>
      </div>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Stats */}
        <div className="card-grid card-grid-3" style={{ marginBottom: '32px', gap: '16px' }}>
          {[
            { icon: '💼', label: 'Watchlisted Farms', value: loading ? '…' : String(watchlist.length), color: 'blue' },
            { icon: '📈', label: 'Avg. Projected ROI', value: loading ? '…' : `${avgRoi}%`, color: 'green' },
            { icon: '💰', label: 'Total Capital Opportunity', value: loading ? '…' : `$${Math.round(watchlist.reduce((s, f) => s + ((f as { requestedCapitalUsd?: number }).requestedCapitalUsd ?? 0), 0) / 1000)}K`, color: 'amber' },
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
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map(i => (
                <div key={i} className="card" style={{ height: '72px' }}>
                  <div className="skeleton" style={{ height: '100%', borderRadius: '8px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {watchlist.map(farm => {
                const emoji = CROP_EMOJI[farm.currentCrop?.toLowerCase()] ?? '🌱';
                return (
                  <Link key={farm.id} href={`/opportunities/${farm.id}?investorId=${investorId}`}
                    style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                      <div style={{ fontSize: '28px' }}>{emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>{farm.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {farm.region} • {farm.currentCrop}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-green)' }}>{farm.projectedRoiPercent}%</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ROI</div>
                      </div>
                      {farm.score != null && (
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          background: 'var(--accent-green-dim)', border: '1px solid rgba(34,197,94,0.3)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-green)', lineHeight: '1' }}>{farm.score}</div>
                          <div style={{ fontSize: '9px', color: 'var(--accent-green)' }}>MATCH</div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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
