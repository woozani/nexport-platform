import { useState } from 'react'
import { useStore } from '../store'
import { Field, Pill } from '../components/ui'
import { PLAN_QUOTA } from '../types'

// 화면 10. 마이페이지 — 프로필 수정 + 요금제 표시 (mock)
export function MyPage() {
  const user = useStore((s) => s.user)
  const profile = useStore((s) => s.profile)
  const updateProfile = useStore((s) => s.updateProfile)
  const setToast = useStore((s) => s.setToast)
  const [desc, setDesc] = useState(profile?.description ?? '')

  const PLANS: { name: 'Free' | 'Standard' | 'Premium'; price: string; note: string }[] = [
    { name: 'Free', price: '₩0', note: `월 ${PLAN_QUOTA.Free}건 추천 · 기본 트래킹` },
    { name: 'Standard', price: '가격 미정', note: `월 ${PLAN_QUOTA.Standard}건 추천 · 트래킹 · 월간 보고서` },
    { name: 'Premium', price: '가격 미정', note: `월 ${PLAN_QUOTA.Premium}건 추천 · GOLD 등급 위주 배정` },
  ]

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>마이페이지</h2>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>계정 정보</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
          <Pill>{user?.company}</Pill>
          <Pill>{user?.managerName} {user?.managerTitle}</Pill>
          <Pill>{user?.email}</Pill>
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>회사 프로필</h3>
        <Field label="회사·제품 서술 (매칭 입력값)" hint="수정 내용은 다음 추천 배치(매월 1일)부터 반영됩니다.">
          <textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
        <button
          className="btn btn-primary"
          style={{ fontSize: 12 }}
          onClick={() => { updateProfile({ description: desc }); setToast('프로필이 저장되었습니다. 다음 추천 배치부터 반영됩니다.') }}
        >
          저장
        </button>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>요금제</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          {PLANS.map((p) => (
            <div
              key={p.name}
              style={{
                flex: 1, padding: 14, borderRadius: 10,
                border: `2px solid ${user?.plan === p.name ? 'var(--blue)' : 'var(--border)'}`,
                background: user?.plan === p.name ? 'var(--blue-dim)' : 'var(--bg-1)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 14 }}>{p.name} {user?.plan === p.name && <span style={{ fontSize: 10, color: 'var(--blue)' }}>현재 플랜</span>}</div>
              <div style={{ fontSize: 16, fontWeight: 800, margin: '6px 0' }}>{p.price}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{p.note}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 10 }}>* 가격은 확정 전입니다. 결제 기능은 MVP 범위에 포함되지 않습니다.</p>
      </div>
    </div>
  )
}
