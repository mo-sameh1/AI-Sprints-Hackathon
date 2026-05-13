'use client';
import { useState } from 'react';
import Link from 'next/link';

const CROPS = ['wheat', 'corn', 'rice', 'cotton', 'citrus', 'mango', 'olive', 'tomato', 'potato', 'sugarcane', 'onion', 'grapes'];
const REGIONS = ['Delta', 'Upper Egypt', 'Fayoum', 'Sinai', 'Canal Zone', 'Western Desert', 'Eastern Delta'];
const GOVERNORATES = ['Cairo', 'Giza', 'Alexandria', 'Beheira', 'Gharbia', 'Dakahlia', 'Luxor', 'Aswan', 'Qena', 'Fayoum', 'Minya', 'Asyut', 'Sohag', 'North Sinai', 'South Sinai', 'Ismailia', 'Suez', 'Port Said'];
const WATER_SOURCES = [
  { value: 'nile', label: 'Nile River', desc: 'Direct access or nearby canal' },
  { value: 'irrigation_canal', label: 'Irrigation Canal', desc: 'Government canal system' },
  { value: 'groundwater', label: 'Groundwater', desc: 'Drilled well' },
  { value: 'rainwater', label: 'Rainwater', desc: 'Rain-fed farming' },
  { value: 'mixed', label: 'Mixed', desc: 'Multiple sources' },
];
const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Chalky', 'Peaty'];

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

type UploadKind = 'photo' | 'document' | 'voice';
type UploadStatus = 'processing' | 'ready' | 'error';

interface UploadedAsset {
  id: string;
  kind: UploadKind;
  name: string;
  size: number;
  type: string;
  /** Server URL returned after upload, e.g. /api/uploads/files/123.jpg */
  url: string;
  status: UploadStatus;
  error?: string;
}

async function uploadToServer(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const data = await res.json() as { url: string };
  return data.url;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OperatorOnboardPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<UploadedAsset[]>([]);
  const [farm, setFarm] = useState({
    name: '',
    region: '',
    governorate: '',
    currentCrop: '',
    areaHectares: '',
    requestedCapitalUsd: '',
    waterSource: '',
    soilType: '',
    notes: '',
    operatorId: 'op-new',
    country: 'Egypt',
  });

  const update = (key: string, val: string) => setFarm(f => ({ ...f, [key]: val }));

  const handleFiles = async (kind: UploadKind, files: FileList | null) => {
    if (!files?.length) return;

    const selected = Array.from(files);
    const placeholders: UploadedAsset[] = selected.map((file, index) => ({
      id: `${kind}-${Date.now()}-${index}`,
      kind,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: '',
      status: 'processing' as UploadStatus,
    }));

    setUploads(current => [...current, ...placeholders]);

    await Promise.all(placeholders.map(async (asset, index) => {
      try {
        const url = await uploadToServer(selected[index]);
        setUploads(current => current.map(item => item.id === asset.id ? { ...item, url, status: 'ready' } : item));
      } catch {
        setUploads(current => current.map(item => item.id === asset.id ? { ...item, status: 'error', error: 'Upload failed' } : item));
      }
    }));
  };

  const removeUpload = (id: string) => {
    setUploads(current => current.filter(item => item.id !== id));
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setUploads([]);
    setFarm({
      name: '',
      region: '',
      governorate: '',
      currentCrop: '',
      areaHectares: '',
      requestedCapitalUsd: '',
      waterSource: '',
      soilType: '',
      notes: '',
      operatorId: 'op-new',
      country: 'Egypt',
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const readyUploads = uploads.filter(asset => asset.status === 'ready');
    const imageUrls = readyUploads.filter(asset => asset.kind === 'photo').map(asset => asset.url);
    const documentUrls = readyUploads.filter(asset => asset.kind !== 'photo').map(asset => asset.url);

    const payload = {
      ...farm,
      areaHectares: Number(farm.areaHectares),
      requestedCapitalUsd: Number(farm.requestedCapitalUsd),
      imageUrls,
      documentUrls,
      mediaSummary: readyUploads.map(asset => ({ kind: asset.kind, name: asset.name, size: asset.size, type: asset.type, url: asset.url })),
    };

    console.log('[FarmSubmit] Submitting payload:', payload);
    console.log('[FarmSubmit] API endpoint:', `${API_BASE}/api/farms`);

    try {
      const res = await fetch(`${API_BASE}/api/farms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[FarmSubmit] Response status:', res.status, res.statusText);

      if (!res.ok) {
        const errText = await res.text();
        console.error('[FarmSubmit] Server error response:', errText);
        alert(`Farm submission failed (${res.status}): ${errText}`);
        setLoading(false);
        return;
      }

      const result = await res.json();
      console.log('[FarmSubmit] Success! Farm created:', result);
    } catch (err) {
      console.error('[FarmSubmit] Network/fetch error:', err);
      alert(`Farm submission failed: ${(err as Error).message}`);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div>
        <header className="header">
          <Link href="/" className="logo">
            <div className="logo-icon">FV</div>
            <span className="logo-text">Farm<span>Vest</span> <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--text-secondary)' }}>Operator</span></span>
          </Link>
        </header>
        <div className="container">
          <div className="success-banner">
            <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }}>OK</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Farm Submitted</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your farm profile and attached evidence have been submitted for review.
            </p>
            <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '8px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>What happens next:</div>
              {['AI builds your structured farm profile', 'Admin reviews uploaded evidence', 'Farm is listed and matched to investors', 'You get notified via WhatsApp when matched'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--accent-light)' }}>-</span> {s}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={resetForm}>
                Submit Another Farm
              </button>
              <Link href="/status" className="btn btn-primary">Track Submission</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <Link href="/" className="logo">
          <div className="logo-icon">FV</div>
          <span className="logo-text">Farm<span>Vest</span> <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--text-secondary)' }}>Operator</span></span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/onboard" className="nav-link active">Submit Farm</Link>
          <Link href="/reports" className="nav-link">Reports</Link>
          <Link href="/status" className="nav-link">Status</Link>
        </nav>
      </header>

      <div className="container">
        <div className="step-indicator">
          {[1, 2, 3].map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'initial' }}>
              <div className={`step-dot ${step > n ? 'done' : step === n ? 'active' : 'pending'}`}>
                {step > n ? 'OK' : n}
              </div>
              {i < 2 && <div className={`step-line ${step > n ? 'done' : ''}`} />}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Step {step} of 3</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>
          {step === 1 && 'Farm Location & Basics'}
          {step === 2 && 'Crop & Land Details'}
          {step === 3 && 'Investment Requirements'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>
          {step === 1 && 'Tell us where your farm is and who you are.'}
          {step === 2 && 'Describe your crop, soil, and water access.'}
          {step === 3 && 'How much capital do you need and what will it fund?'}
        </p>

        {step === 1 && (
          <div className="card">
            <div className="form-group">
              <label className="form-label">Farm Name *</label>
              <input id="farm-name" className="form-input" placeholder="e.g. Nile Delta Wheat Farm" value={farm.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Region</label>
                <select id="farm-region" className="form-select" value={farm.region} onChange={e => update('region', e.target.value)}>
                  <option value="">Select region</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Governorate</label>
                <select id="farm-governorate" className="form-select" value={farm.governorate} onChange={e => update('governorate', e.target.value)}>
                  <option value="">Select governorate</option>
                  {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Current Crop</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CROPS.map(c => (
                    <button key={c} id={`crop-${c}`} className={`select-option ${farm.currentCrop === c ? 'selected' : ''}`} onClick={() => update('currentCrop', c)}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Farm Area (Hectares)</label>
                  <input id="farm-area" type="number" className="form-input" placeholder="e.g. 25" value={farm.areaHectares} onChange={e => update('areaHectares', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Soil Type</label>
                  <select id="farm-soil" className="form-select" value={farm.soilType} onChange={e => update('soilType', e.target.value)}>
                    <option value="">Select soil type</option>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="card">
              <label className="form-label" style={{ marginBottom: '12px' }}>Water Source</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {WATER_SOURCES.map(w => (
                  <button key={w.value} id={`water-${w.value}`} onClick={() => update('waterSource', w.value)}
                    style={{
                      padding: '12px 14px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                      background: farm.waterSource === w.value ? 'var(--accent-dim)' : 'var(--surface)',
                      border: farm.waterSource === w.value ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: farm.waterSource === w.value ? 'var(--accent-light)' : 'var(--text)' }}>{w.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{w.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Capital Needed (USD) *</label>
                <input id="farm-capital" type="number" className="form-input" placeholder="e.g. 50000" value={farm.requestedCapitalUsd} onChange={e => update('requestedCapitalUsd', e.target.value)} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>This is the total investment you are seeking from investors.</div>
              </div>
            </div>
            <div className="card">
              <label className="form-label">How will you use the capital?</label>
              <textarea id="farm-notes" className="form-textarea" placeholder="e.g. Purchase seeds and fertilizer for next season, irrigation system upgrade..." value={farm.notes} onChange={e => update('notes', e.target.value)} />
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Evidence Uploads</label>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Add photos, documents, and voice notes for admin review and profile enrichment.
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent-light)', fontWeight: 700 }}>
                  {uploads.filter(asset => asset.status === 'ready').length} ready
                </div>
              </div>

              <div className="upload-grid">
                {[
                  { kind: 'photo' as UploadKind, title: 'Farm Photos', accept: 'image/*', helper: 'Fields, irrigation, crops' },
                  { kind: 'document' as UploadKind, title: 'Documents', accept: '.pdf,.png,.jpg,.jpeg,.doc,.docx', helper: 'Land, licenses, receipts' },
                  { kind: 'voice' as UploadKind, title: 'Voice Notes', accept: 'audio/*', helper: 'Spoken field updates' },
                ].map(item => (
                  <label key={item.kind} className="upload-zone">
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{item.title}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.helper}</span>
                    <span className="upload-action">Choose files</span>
                    <input type="file" accept={item.accept} multiple onChange={event => handleFiles(item.kind, event.target.files)} />
                  </label>
                ))}
              </div>

              {uploads.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  {uploads.map(asset => (
                    <div key={asset.id} className="upload-row">
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{asset.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {asset.kind} - {formatFileSize(asset.size)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`upload-status ${asset.status}`}>{asset.error ?? asset.status}</span>
                        <button type="button" className="icon-button" onClick={() => removeUpload(asset.id)} aria-label={`Remove ${asset.name}`}>x</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '14px' }}>Submission Summary</div>
              {[
                { label: 'Farm Name', value: farm.name || '-' },
                { label: 'Location', value: farm.governorate ? `${farm.governorate}, ${farm.region}` : '-' },
                { label: 'Crop', value: farm.currentCrop || '-' },
                { label: 'Area', value: farm.areaHectares ? `${farm.areaHectares} hectares` : '-' },
                { label: 'Water Source', value: farm.waterSource || '-' },
                { label: 'Capital Needed', value: farm.requestedCapitalUsd ? `$${Number(farm.requestedCapitalUsd).toLocaleString()}` : '-' },
                { label: 'Uploads', value: uploads.length ? `${uploads.filter(asset => asset.kind === 'photo').length} photos, ${uploads.filter(asset => asset.kind === 'document').length} docs, ${uploads.filter(asset => asset.kind === 'voice').length} voice` : '-' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize', textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>
          ) : <div />}
          {step < 3 ? (
            <button id="next-btn" className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Continue</button>
          ) : (
            <button id="submit-btn" className="btn btn-primary" onClick={handleSubmit} disabled={loading || uploads.some(asset => asset.status === 'processing')}>
              {loading ? 'Submitting...' : 'Submit Farm Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
