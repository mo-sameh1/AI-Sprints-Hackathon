'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API_BASE = 'http://localhost:4000/api';
const OPERATOR_ID = 'op-new';

interface FarmOption {
  id: string;
  name: string;
  operatorId: string;
  currentCrop: string;
  status: string;
}

interface OperatorReport {
  id: string;
  farmId: string;
  operatorId: string;
  reportType: 'yield' | 'status' | 'incident' | 'financial';
  period: string;
  content: Record<string, unknown>;
  notes: string;
  submittedAt: string;
}

export default function OperatorReportsPage() {
  const [farms, setFarms] = useState<FarmOption[]>([]);
  const [reports, setReports] = useState<OperatorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    farmId: '',
    reportType: 'status',
    period: new Date().toISOString().slice(0, 7),
    cropHealth: 'stable',
    yieldTonnes: '',
    revenueUsd: '',
    waterStatus: 'normal',
    notes: '',
  });

  const operatorFarms = useMemo(() => {
    const mine = farms.filter(farm => farm.operatorId === OPERATOR_ID);
    return mine.length ? mine : farms;
  }, [farms]);

  const selectedFarm = operatorFarms.find(farm => farm.id === form.farmId);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [farmResponse, reportResponse] = await Promise.all([
          fetch(`${API_BASE}/farms`),
          fetch(`${API_BASE}/reports/operator/${OPERATOR_ID}`),
        ]);
        const farmData = await farmResponse.json();
        const reportData = await reportResponse.json();
        setFarms(Array.isArray(farmData) ? farmData : []);
        setReports(Array.isArray(reportData) ? reportData : []);
        if (Array.isArray(farmData) && farmData.length) {
          const firstMine = farmData.find((farm: FarmOption) => farm.operatorId === OPERATOR_ID) ?? farmData[0];
          setForm(current => ({ ...current, farmId: firstMine.id }));
        }
      } catch {
        setMessage('Could not reach the API. Start the API server and try again.');
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));

  const submitReport = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId: form.farmId,
          operatorId: OPERATOR_ID,
          reportType: form.reportType,
          period: form.period,
          notes: form.notes,
          content: {
            cropHealth: form.cropHealth,
            waterStatus: form.waterStatus,
            yieldTonnes: form.yieldTonnes ? Number(form.yieldTonnes) : undefined,
            revenueUsd: form.revenueUsd ? Number(form.revenueUsd) : undefined,
          },
        }),
      });
      const saved = await response.json();
      setReports(current => [saved, ...current]);
      setMessage('Report submitted for operator review history.');
      setForm(current => ({ ...current, notes: '', yieldTonnes: '', revenueUsd: '' }));
    } catch {
      setMessage('Report could not be submitted. Check that the API is running.');
    } finally {
      setSaving(false);
    }
  };

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
          <Link href="/reports" className="nav-link active">Reports</Link>
          <Link href="/status" className="nav-link">Status</Link>
        </nav>
      </header>

      <div className="container">
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Operator Reporting</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Yield & Status Update</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Send structured farm updates that investors and admins can review.</p>
        </div>

        {message && (
          <div className="card" style={{ borderColor: message.startsWith('Could') || message.startsWith('Report could') ? 'rgba(239,68,68,0.28)' : 'rgba(34,197,94,0.25)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{message}</div>
          </div>
        )}

        <div className="card">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Farm</label>
              <select className="form-select" value={form.farmId} onChange={event => update('farmId', event.target.value)} disabled={loading}>
                <option value="">{loading ? 'Loading farms' : 'Select farm'}</option>
                {operatorFarms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select className="form-select" value={form.reportType} onChange={event => update('reportType', event.target.value)}>
                <option value="status">Status</option>
                <option value="yield">Yield</option>
                <option value="incident">Incident</option>
                <option value="financial">Financial</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Period</label>
              <input className="form-input" type="month" value={form.period} onChange={event => update('period', event.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Crop Health</label>
              <select className="form-select" value={form.cropHealth} onChange={event => update('cropHealth', event.target.value)}>
                <option value="strong">Strong</option>
                <option value="stable">Stable</option>
                <option value="watch">Watch</option>
                <option value="at_risk">At Risk</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Yield Tonnes</label>
              <input className="form-input" type="number" placeholder="e.g. 42" value={form.yieldTonnes} onChange={event => update('yieldTonnes', event.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Revenue USD</label>
              <input className="form-input" type="number" placeholder="e.g. 28000" value={form.revenueUsd} onChange={event => update('revenueUsd', event.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Water Status</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['normal', 'low_pressure', 'maintenance', 'shortage'].map(status => (
                <button key={status} className={`select-option ${form.waterStatus === status ? 'selected' : ''}`} onClick={() => update('waterStatus', status)}>
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Add field observations, supply needs, or investor-relevant details..." value={form.notes} onChange={event => update('notes', event.target.value)} />
          </div>

          <button className="btn btn-primary" onClick={submitReport} disabled={saving || !form.farmId}>
            {saving ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>

        {selectedFarm && (
          <div className="card" style={{ background: 'rgba(22,163,74,0.05)' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>{selectedFarm.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              Current crop: {selectedFarm.currentCrop} - Status: {selectedFarm.status.replace('_', ' ')}
            </div>
          </div>
        )}

        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>Recent Reports</h2>
          {reports.length ? reports.map(report => (
            <div key={report.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{report.reportType} report</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(report.submittedAt).toLocaleString()}</div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Period {report.period} - Farm {report.farmId}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)' }}>{report.notes || 'No notes added.'}</div>
            </div>
          )) : (
            <div className="card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No reports submitted yet.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
