import Link from 'next/link';

const roleCards = [
  {
    key: 'investor',
    label: 'Investor',
    mark: 'IV',
    href: '/login',
    secondaryHref: '/investor',
    secondaryLabel: 'View investor home',
    tone: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.28)',
    email: 'investor@example.com',
    password: 'password123',
    title: 'Find matched farms and review deal recommendations',
  },
  {
    key: 'operator',
    label: 'Operator',
    mark: 'OP',
    href: '/operator',
    secondaryHref: '/operator/onboard',
    secondaryLabel: 'Submit a farm',
    tone: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.28)',
    email: 'mohamed@operator.com',
    password: 'No login needed',
    title: 'Submit farms, upload evidence, and track review status',
  },
  {
    key: 'admin',
    label: 'Admin',
    mark: 'AD',
    href: '/admin/login',
    secondaryHref: '/admin',
    secondaryLabel: 'Open dashboard',
    tone: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.28)',
    email: 'admin@aisprints.com',
    password: 'password123',
    title: 'Review submissions, monitor alerts, and audit actions',
  },
];

export default function PlatformEntryPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgba(8,12,20,0.94), rgba(8,12,20,1)), linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.14))',
        color: 'var(--text-primary)',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <header
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg,#22c55e,#2563eb)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              FV
            </span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Farm<span style={{ color: 'var(--accent-green)' }}>Vest</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href="/investor" className="btn btn-ghost btn-sm">
              Investor
            </Link>
            <Link href="/operator" className="btn btn-ghost btn-sm">
              Operator
            </Link>
            <Link href="/admin/login" className="btn btn-ghost btn-sm">
              Admin
            </Link>
          </div>
        </header>

        <section className="platform-entry-layout">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(34,197,94,0.28)',
                background: 'rgba(34,197,94,0.1)',
                color: 'var(--accent-green)',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '22px',
              }}
            >
              Single demo entry
            </div>
            <h1
              style={{
                fontSize: 'clamp(38px, 6vw, 74px)',
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: '0',
                maxWidth: '720px',
                marginBottom: '22px',
              }}
            >
              One platform for farm capital, operators, and review.
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '18px',
                lineHeight: 1.7,
                maxWidth: '620px',
                marginBottom: '28px',
              }}
            >
              Start from one URL, then choose the role you want to test. Each path uses the same API and seeded demo data.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn btn-primary btn-lg">
                Start as investor
              </Link>
              <Link href="/operator" className="btn btn-secondary btn-lg">
                Open operator
              </Link>
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.045)',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
            }}
          >
            <div className="platform-role-strip">
              {roleCards.map((role) => (
                <Link
                  key={role.key}
                  href={role.href}
                  style={{
                    minHeight: '104px',
                    borderRadius: '8px',
                    border: `1px solid ${role.border}`,
                    background: role.bg,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: role.tone,
                      color: '#06110b',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 900,
                    }}
                  >
                    {role.mark}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 800 }}>{role.label}</span>
                </Link>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              {roleCards.map((role) => (
                <div
                  key={role.key}
                  style={{
                    border: '1px solid var(--border)',
                    background: 'rgba(8,12,20,0.58)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: role.tone, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                        {role.label}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{role.email}</span>
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700 }}>
                      {role.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                      Password: {role.password}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link href={role.href} className="btn btn-primary btn-sm">
                      Open
                    </Link>
                    <Link href={role.secondaryHref} className="btn btn-ghost btn-sm">
                      {role.secondaryLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
