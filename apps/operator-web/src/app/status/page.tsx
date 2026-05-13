'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const OPERATOR_ID = 'op-new';

interface FarmProfile {
  id: string;
  operatorId: string;
  name: string;
  region: string;
  governorate: string;
  areaHectares: number;
  currentCrop: string;
  requestedCapitalUsd: number;
  projectedRoiPercent: number;
  documentUrls: string[];
  imageUrls: string[];
  status: string;
  aiProfileSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OperatorStatusPage() {
  const [farms, setFarms] = useState<FarmProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFarms() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/farms`);
        const data = await response.json();
        setFarms(Array.isArray(data) ? data : []);
      } catch {
        setError('Could not reach the API. Start the API server to load submissions.');
      } finally {
        setLoading(false);
      }
    }

    void loadFarms();
  }, []);

  const visibleFarms = useMemo(() => {
    const mine = farms.filter(farm => farm.operatorId === OPERATOR_ID);
    return mine.length ? mine : farms;
  }, [farms]);

  const metrics = useMemo(() => {
    return {
      total: visibleFarms.length,
      review: visibleFarms.filter(farm => farm.status === 'pending_review').length,
      active: visibleFarms.filter(farm => farm.status === 'active').length,
    };
  }, [visibleFarms]);

  return (
    <div>
      <header className="header">
        <Link href="/" className="logo">
          <div className="logo-icon">FV</div>
          <span className="logo-text">Farm<span>Vest</span> <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--text-secondary)' }}>Operator</span></span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/onboard" className="nav-link">Submit Farm</Link>
          <Link href="/reports" className="nav-link">Reports</Link>
          <Link href="/status" className="nav-link active">Status</Link>
        </nav>
      </header>

      <div className="container">
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Submission Tracking</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Farm Review Status</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Track admin review, profile enrichment, uploads, and investor readiness.</p>
        </div>

        <div className="metric-grid" style={{ marginBottom: '18px' }}>
          <div className="metric-card">
            <div style={{ fontSize: '22px', fontWeight: 800 }}>{metrics.total}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total farms</div>
          </div>
          <div className="metric-card">
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-amber)' }}>{metrics.review}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>In review</div>
          </div>
          <div className="metric-card">
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-light)' }}>{metrics.active}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active listings</div>
          </div>
        </div>

        {error && (
          <div className="card" style={{ borderColor: 'rgba(239,68,68,0.28)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{error}</div>
          </div>
        )}

        {loading && (
          <div className="card">
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading submissions...</div>
          </div>
        )}

        {!loading && !visibleFarms.length && (
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>No farm submissions yet</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Submit a farm profile to start the review process.</div>
            <Link href="/onboard" className="btn btn-primary">Submit Farm</Link>
          </div>
        )}

        {!loading && visibleFarms.map(farm => (
          <div key={farm.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px' }}>{farm.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{farm.governorate}, {farm.region} - {farm.areaHectares} hectares - {farm.currentCrop}</div>
              </div>
              <span className={`status-pill ${farm.status}`}>{farm.status.replace('_', ' ')}</span>
            </div>

            <div className="status-item">
              <div className="status-icon" style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)' }}>1</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Profile captured</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Requested ${farm.requestedCapitalUsd.toLocaleString()} with projected ROI of {farm.projectedRoiPercent}%.</div>
              </div>
            </div>

            <div className="status-item">
              <div className="status-icon" style={{ background: farm.status === 'pending_review' ? 'var(--accent-amber-dim)' : 'var(--accent-dim)', color: farm.status === 'pending_review' ? 'var(--accent-amber)' : 'var(--accent-light)' }}>2</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Admin review</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {farm.status === 'pending_review' ? 'Review is pending. Evidence and profile summary are ready for admin checks.' : 'Review completed or listing is already active.'}
                </div>
              </div>
            </div>

            <div className="status-item">
              <div className="status-icon" style={{ background: 'rgba(59,130,246,0.13)', color: '#93c5fd' }}>3</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Evidence attached</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {farm.imageUrls.length} photos and {farm.documentUrls.length} documents or voice notes stored with the profile.
                </div>
              </div>
            </div>

            {farm.aiProfileSummary && (
              <div style={{ marginTop: '14px', padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {farm.aiProfileSummary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
