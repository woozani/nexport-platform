import { useState } from 'react'
import { useStore, useSel, selectRecommended } from '../store'
import { GradeBadge, Modal, Pill, StatusBadge } from '../components/ui'
import { Buyer, ExcludeReason, PLAN_QUOTA, REFILL_LIMIT } from '../types'

// 화면 6. 추천 바이어 카드 ★핵심 — 월 N건 자동 추천, 연락처 비노출, AI 한줄요약
export function Recommendations() {
  const rec = useSel(selectRecommended)
  const user = useStore((s) => s.user)
  const refillUsed = useStore((s) => s.refillUsed)
  const openCompose = useStore((s) => s.openCompose)
  const excludeBuyer = useStore((s) => s.excludeBuyer)
  const [excludeTarget, setExcludeTarget] = useState<Buyer | null>(null)
  const quota = PLAN_QUOTA[user?.plan ?? 'Standard']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <h2 style={{ fontSize: 18 }}>이번 달 추천 바이어</h2>
        <span style={{ fontSize: 13, color: 'var(--t3)' }}>
          {rec.length}/{quota}건 · {user?.plan} 플랜 · 매월 1일 갱신 · 보충 추천 {refillUsed}/{REFILL_LIMIT} 사용
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>
        프로필 서술 기반으로 AI가 선별한 바이어입니다. 바이어 1명은 회원님께 독점 매칭됩니다. 연락처는 노출되지 않으며 발송은 플랫폼 안에서 이뤄집니다.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {rec.map((b) => (
          <div key={b.id} className="card fade-up" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{b.maskedName}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <GradeBadge grade={b.grade} />
                {b.status !== 'none' && <StatusBadge status={b.status} />}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.5 }}>{b.summary}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Pill>📍 {b.region}</Pill>
              <Pill>{b.industry}</Pill>
              <Pill>직원 {b.employees}</Pill>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', background: 'var(--blue-dim)', borderRadius: 8, padding: '8px 10px' }}>
              <b style={{ color: 'var(--blue)' }}>매칭 근거</b> · {b.matchReason}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => openCompose(b.id)}>
                ✉ 메일 보내기
              </button>
              <button className="btn btn-ghost" onClick={() => setExcludeTarget(b)}>제외</button>
            </div>
          </div>
        ))}
      </div>

      {excludeTarget && (
        <ExcludeModal
          buyer={excludeTarget}
          onClose={() => setExcludeTarget(null)}
          onConfirm={(reason) => { excludeBuyer(excludeTarget.id, reason); setExcludeTarget(null) }}
        />
      )}
    </div>
  )
}

function ExcludeModal({ buyer, onClose, onConfirm }: { buyer: Buyer; onClose: () => void; onConfirm: (r: ExcludeReason) => void }) {
  const [reason, setReason] = useState<ExcludeReason | null>(null)
  const REASONS: ExcludeReason[] = ['분야가 맞지 않음', '규모가 맞지 않음', '기타']
  return (
    <Modal onClose={onClose} width={400}>
      <h3 style={{ fontSize: 16, marginBottom: 6 }}>추천에서 제외</h3>
      <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>
        <b>{buyer.maskedName}</b>를 제외하는 이유를 선택해주세요. 사유는 다음 추천 개선에 사용됩니다.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {REASONS.map((r) => (
          <button
            key={r}
            className="btn"
            onClick={() => setReason(r)}
            style={{
              textAlign: 'left', padding: 12,
              background: reason === r ? 'var(--blue-dim)' : 'var(--bg-2)',
              color: reason === r ? 'var(--blue)' : 'var(--t2)',
              border: `1px solid ${reason === r ? 'var(--blue)' : 'var(--border)'}`,
              fontWeight: reason === r ? 700 : 500,
            }}
          >
            {r}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>취소</button>
        <button className="btn btn-danger" disabled={!reason} style={{ opacity: reason ? 1 : 0.5 }} onClick={() => reason && onConfirm(reason)}>
          제외하기
        </button>
      </div>
    </Modal>
  )
}
