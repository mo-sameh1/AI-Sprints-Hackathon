'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const DEMO_STATS = { total: 3, pending: 3, approved: 0, rejected: 0, escalated: 0, criticalFlags: 1 };

const DEMO_QUEUE = [
  {
    id: 'review-001', itemType: 'farm_profile', targetId: 'farm-004', status: 'pending',
    aiSummary: 'New olive farm in North Sinai. No yield history. Capital request of $200K above average.',
    flags: [{ severity: 'medium', label: 'No Yield History' }, { severity: 'low', label: 'High Capital Request' }],
    createdAt: '2025-05-05T11:00:00Z',
  },
  {
    id: 'review-002', itemType: 'deal_recommendation', targetId: 'deal-farm-002', status: 'pending',
    aiSummary: 'Revenue share deal for Upper Egypt Citrus Estate. $96K investment, 17.1% projected ROI.',
    flags: [{ severity: 'low', label: 'Single Year History' }],
    createdAt: '2025-05-10T14:00:00Z',
  },
  {
    id: 'review-003', itemType: 'alert', targetId: 'alert-1', status: 'pending',
    aiSummary: 'Critical weather alert for Delta region. Heavy rainfall projected — 95mm over 3 days.',
    flags: [{ severity: 'high', label: 'Critical Weather Risk' }],
    createdAt: '2025-05-12T08:00:00Z',
  },
];

const DEMO_ALERTS = [
  { id: 'alert-1', severity: 'critical', title: '🚨 Critical: Extreme Weather in Delta', summary: 'Heavy Thunderstorms expected — 95mm rainfall. Risk to active wheat crops.', actionRequired: true },
  { id: 'alert-2', severity: 'warning', title: '⚠️ Weather Watch: Fayoum', summary: 'Extreme Heat forecast. Monitor crop hydration levels.', actionRequired: false },
  { id: 'alert-3', severity: 'info', title: 'Egypt raises wheat import tariffs', summary: 'Policy signal: Positive market movement for domestic wheat producers.', actionRequired: false },
  { id: 'alert-4', severity: 'warning', title: 'Tomato prices drop 18%', summary: 'Market signal: Oversupply in Fayoum region. Check operator impact.', actionRequired: true },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  farm_profile: { icon: '🏡', color: 'var(--accent-green-dim)', label: 'Farm Profile' },
  deal_recommendation: { icon: '💰', color: 'var(--accent-blue-dim)', label: 'Deal' },
  alert: { icon: '🔔', color: 'var(--accent-amber-dim)', label: 'Alert' },
  match_result: { icon: '🎯', color: 'var(--accent-purple-dim)', label: 'Match' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(DEMO_STATS);
  const [queue, setQueue] = useState(DEMO_QUEUE);
  const [activeTab, setActiveTab] = useState('all');
  const [alerts] = useState(DEMO_ALERTS);

  useEffect(() => {
    fetch('http://localhost:4000/api/admin/stats')
      .then(r => r.json()).then(d => setStats(d)).catch(() => {});
    fetch('http://localhost:4000/api/admin/queue')
      .then(r => r.json()).then(d => Array.isArray(d) && d.length ? setQueue(d) : null).catch(() => {});
  }, []);

  const filtered = activeTab === 'all' ? queue : queue.filter(i => i.itemType === activeTab || i.status === activeTab);

  const handleReview = async (id: string, action: string) => {
    try {
      await fetch(`http://localhost:4000/api/admin/queue/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminId: 'admin-001', note: `Action: ${action}` }),
      });
    } catch { /* offline demo */ }
    setQueue(q => q.map(item => item.id === id ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'escalated' } : item));
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🛡️</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Admin</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FarmVest Control</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {[
            { icon: '📊', label: 'Dashboard', href: '/', active: true },
            { icon: '📋', label: 'Review Queue', href: '/', badge: stats.pending, active: false },
            { icon: '🔔', label: 'Alerts', href: '/', active: false },
            { icon: '📜', label: 'Audit Log', href: '/', active: false },
            { icon: '🏡', label: 'Farms', href: '/', active: false },
            { icon: '👥', label: 'Investors', href: '/', active: false },
            { icon: '🔧', label: 'Settings', href: '/', active: false },
          ].map(item => (
            <div key={item.label} className={`nav-item ${item.active ? 'active' : ''}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>A</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Platform Admin</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>admin@farmvest.io</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="topbar">
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Admin Dashboard</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Trust & control layer — review, triage, and audit</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        <div className="page-content">
          {/* Stats */}
          <div className="stat-grid">
            {[
              { icon: '⏳', label: 'Pending Reviews', value: stats.pending, color: 'amber' },
              { icon: '✅', label: 'Approved Today', value: stats.approved, color: 'green' },
              { icon: '🚨', label: 'Critical Flags', value: stats.criticalFlags, color: 'red' },
              { icon: '📋', label: 'Total Items', value: stats.total, color: 'blue' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
            {/* Review Queue */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Review Queue</h2>
              </div>
              <div className="tab-bar">
                {[
                  { key: 'all', label: `All (${queue.length})` },
                  { key: 'farm_profile', label: 'Farms' },
                  { key: 'deal_recommendation', label: 'Deals' },
                  { key: 'alert', label: 'Alerts' },
                  { key: 'pending', label: 'Pending' },
                ].map(t => (
                  <button key={t.key} id={`tab-${t.key}`} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
                ))}
              </div>
              <div className="review-list">
                {filtered.map(item => {
                  const cfg = TYPE_CONFIG[item.itemType] ?? { icon: '📄', color: 'var(--bg-card)', label: item.itemType };
                  return (
                    <div key={item.id} className="review-item">
                      <div className="review-item-icon" style={{ background: cfg.color }}>{cfg.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cfg.label}</span>
                          <span className={`status-badge ${item.status}`}>{item.status}</span>
                          {item.flags.filter(f => f.severity === 'high').map((f, i) => (
                            <span key={i} className="flag-badge high">🚨 {f.label}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.5' }}>{item.aiSummary}</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {item.flags.filter(f => f.severity !== 'high').map((f, i) => (
                            <span key={i} className={`flag-badge ${f.severity}`}>{f.label}</span>
                          ))}
                        </div>
                      </div>
                      {item.status === 'pending' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                          <button id={`approve-${item.id}`} className="btn btn-approve" onClick={() => handleReview(item.id, 'approve')}>✓ Approve</button>
                          <button id={`reject-${item.id}`} className="btn btn-reject" onClick={() => handleReview(item.id, 'reject')}>✗ Reject</button>
                          <button id={`escalate-${item.id}`} className="btn btn-escalate" onClick={() => handleReview(item.id, 'escalate')}>↑ Escalate</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alerts Sidebar */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Active Alerts</h2>
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.severity}`}>
                  <div style={{ fontSize: '16px', flexShrink: 0 }}>
                    {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{alert.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{alert.summary}</div>
                    {alert.actionRequired && (
                      <div style={{ marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, background: 'var(--accent-red)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>ACTION REQUIRED</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Audit Log */}
              <div style={{ marginTop: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Recent Activity</h2>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  {[
                    { time: '08:12', action: 'Alert created', target: 'Delta weather alert' },
                    { time: '07:45', action: 'Farm submitted', target: 'Sinai Olive Grove' },
                    { time: 'Yesterday', action: 'Deal reviewed', target: 'Citrus Estate deal' },
                    { time: 'Yesterday', action: 'Farm approved', target: 'Aswan Sugarcane' },
                  ].map((entry, i) => (
                    <div key={i} className="audit-row">
                      <div className="audit-time">{entry.time}</div>
                      <div>
                        <div className="audit-action">{entry.action}</div>
                        <div className="audit-target">{entry.target}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
