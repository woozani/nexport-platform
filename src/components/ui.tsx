import { CSSProperties, ReactNode, useEffect } from 'react'
import { Grade, TrackStatus } from '../types'
import { useStore } from '../store'

export const GRADE_COLOR: Record<Grade, string> = {
  GOLD: 'var(--gold)', SILVER: 'var(--silver)', BRONZE: 'var(--bronze)', COLD: 'var(--t3)', DEAD: 'var(--red)',
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 800, color: GRADE_COLOR[grade],
      background: 'var(--bg-2)', border: `1px solid ${GRADE_COLOR[grade]}33`,
    }}>
      ● {grade}
    </span>
  )
}

const STATUS_META: Record<TrackStatus, { label: string; color: string }> = {
  none: { label: '미발송', color: 'var(--t3)' },
  sent: { label: '발송됨', color: 'var(--blue)' },
  opened: { label: '열람됨', color: 'var(--violet)' },
  attach_opened: { label: '첨부 열람', color: 'var(--amber)' },
  replied: { label: '회신됨', color: 'var(--green)' },
}

export function StatusBadge({ status }: { status: TrackStatus }) {
  const m = STATUS_META[status]
  return (
    <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: m.color, background: 'var(--bg-2)' }}>
      {m.label}
    </span>
  )
}

export function Pill({ children, color = 'var(--t2)' }: { children: ReactNode; color?: string }) {
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color, background: 'var(--bg-2)' }}>
      {children}
    </span>
  )
}

export function Modal({ children, onClose, width = 480 }: { children: ReactNode; onClose?: () => void; width?: number }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="card fade-up" style={{ width, maxWidth: '92vw', maxHeight: '86vh', overflowY: 'auto', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="card" style={{ padding: '16px 20px', flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: accent ?? 'var(--t1)' }}>{value}</div>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export function Toast() {
  const toast = useStore((s) => s.toast)
  const setToast = useStore((s) => s.setToast)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast, setToast])
  if (!toast) return null
  const style: CSSProperties = {
    position: 'fixed', top: 20, right: 20, zIndex: 300, padding: '12px 20px', borderRadius: 10,
    background: 'var(--t1)', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: 'var(--card-shadow)',
  }
  return <div style={style} className="fade-up no-print">{toast}</div>
}

export function Logo({ size = 20 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <defs>
          <linearGradient id="nxG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0A2463" /><stop offset="1" stopColor="#3E92CC" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#nxG)" />
        <path d="M9 23V9l7 9V9h2.5v14l-7-9v9H9z" fill="#fff" transform="translate(2,0)" />
      </svg>
      <span style={{ fontWeight: 800, fontSize: size * 0.8, letterSpacing: 0.5, color: 'var(--t1)' }}>NEXPORT</span>
    </div>
  )
}
