import { useStore, useSel, selectSent, daysSince } from '../store'
import { GradeBadge, Pill } from '../components/ui'
import { Buyer, FOLLOWUP_DAYS, RELEASE_DAYS } from '../types'

// 화면 8. 발송 현황 / 트래킹 — 타임라인 + D+7 팔로업 / D+14 매칭 해제 예정 뱃지
export function Tracking() {
  const sent = useSel(selectSent)
  const openCompose = useStore((s) => s.openCompose)
  const openReply = useStore((s) => s.openReply)

  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 4 }}>발송 현황</h2>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>
        열람은 메일 내 리소스 로드 기준으로 기록됩니다. 무반응 {FOLLOWUP_DAYS}일 경과 시 팔로업을 추천하고, {RELEASE_DAYS}일 경과 시 매칭이 해제되어 신규 추천으로 충전됩니다.
      </p>
      {sent.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
          아직 발송한 메일이 없습니다. 추천 바이어에서 첫 메일을 보내보세요.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sent.map((b) => <TrackCard key={b.id} buyer={b} onFollowup={() => openCompose(b.id)} onViewReply={() => openReply(b.id)} />)}
      </div>
    </div>
  )
}

function TrackCard({ buyer: b, onFollowup, onViewReply }: { buyer: Buyer; onFollowup: () => void; onViewReply: () => void }) {
  const d = daysSince(b.sentAt)
  const noResponse = !b.repliedAt
  const followupDue = noResponse && d >= FOLLOWUP_DAYS && d < RELEASE_DAYS
  const releaseSoon = noResponse && d >= RELEASE_DAYS - 2

  const steps = [
    { label: '발송됨', at: b.sentAt, done: !!b.sentAt },
    { label: '열람됨', at: b.openedAt, done: !!b.openedAt },
    { label: '첨부 열람', at: b.attachOpenedAt, done: !!b.attachOpenedAt },
    { label: '회신됨', at: b.repliedAt, done: !!b.repliedAt },
  ]

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{b.maskedName}</span>
        <GradeBadge grade={b.grade} />
        <Pill>발송 D+{d}</Pill>
        {b.secondSentAt && <Pill color="var(--blue)">2차 발송 완료</Pill>}
        <span style={{ flex: 1 }} />
        {releaseSoon && (
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', background: '#fff2f2', padding: '3px 10px', borderRadius: 20 }}>
            ⚠ 매칭 해제 예정 (D+{RELEASE_DAYS})
          </span>
        )}
        {followupDue && !releaseSoon && !b.secondSentAt && (
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber)', background: '#fff8e8', padding: '3px 10px', borderRadius: 20 }}>
            ⏰ 팔로업 추천
          </span>
        )}
      </div>

      {/* 타임라인 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: followupDue && !b.secondSentAt ? 14 : 0 }}>
        {steps.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ textAlign: 'center', minWidth: 76 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', margin: '0 auto 4px',
                background: s.done ? 'var(--green)' : 'var(--bg-3)',
                color: s.done ? '#fff' : 'var(--t3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800,
              }}>
                {s.done ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.done ? 'var(--t1)' : 'var(--t3)' }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)' }}>{s.at ? (daysSince(s.at) === 0 ? '오늘' : `${daysSince(s.at)}일 전`) : '—'}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: steps[i + 1].done ? 'var(--green)' : 'var(--bg-3)', margin: '0 4px 28px' }} />
            )}
          </div>
        ))}
      </div>

      {(followupDue && !b.secondSentAt) || b.repliedAt ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {followupDue && !b.secondSentAt && (
            <button className="btn btn-primary" style={{ fontSize: 12, padding: '8px 16px' }} onClick={onFollowup}>
              ✉ 2차 메일 보내기
            </button>
          )}
          {b.repliedAt && (
            <button className="btn btn-primary" style={{ fontSize: 12, padding: '8px 16px', background: 'var(--green)' }} onClick={onViewReply}>
              📩 회신 확인하기
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
