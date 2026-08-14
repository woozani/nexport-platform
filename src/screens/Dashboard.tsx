import { useStore, useSel, funnelCounts, selectRecommended } from '../store'
import { GradeBadge, Pill, Stat, StatusBadge } from '../components/ui'
import { PLAN_QUOTA } from '../types'

// 화면 5. 대시보드 — 이번 달 추천 n/N, 발송/열람/회신 카운트 + 추천 카드 진입점
export function Dashboard() {
  const counts = useSel(funnelCounts)
  const rec = useSel(selectRecommended)
  const user = useStore((s) => s.user)
  const setView = useStore((s) => s.setView)
  const openCompose = useStore((s) => s.openCompose)
  const quota = PLAN_QUOTA[user?.plan ?? 'Founding']
  const unsent = rec.filter((b) => b.status === 'none')

  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 14 }}>대시보드</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Stat label="이번 달 추천 바이어" value={`${counts.recommended}/${quota}건`} accent="var(--blue)" />
        <Stat label="발송" value={`${counts.sent}건`} />
        <Stat label="열람" value={`${counts.opened}건`} accent="var(--violet)" />
        <Stat label="회신" value={`${counts.replied}건`} accent="var(--green)" />
      </div>

      {unsent.length > 0 && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--blue-dim)', border: '1px solid var(--blue)' }}>
          <span style={{ fontSize: 13, color: 'var(--t1)', flex: 1 }}>
            ✉ 아직 발송하지 않은 추천 바이어가 <b>{unsent.length}건</b> 있습니다. 추천 후 4주간 미발송 시 매칭이 해제됩니다.
          </span>
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => setView('recommend')}>
            추천 바이어 보기
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <h3 style={{ fontSize: 15 }}>이번 달 추천 바이어</h3>
        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setView('recommend')}>전체 보기 →</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rec.slice(0, 5).map((b) => (
          <div key={b.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{b.maskedName}</span>
                <GradeBadge grade={b.grade} />
                <StatusBadge status={b.status} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 3 }}>{b.summary}</div>
            </div>
            <Pill>📍 {b.region}</Pill>
            {b.status === 'none' && (
              <button className="btn btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => openCompose(b.id)}>메일 보내기</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
