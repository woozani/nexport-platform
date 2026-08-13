import { useStore } from '../store'
import { GradeBadge, Modal, Pill } from '../components/ui'
import { DEAL_STAGE_LABEL, DealStage } from '../types'

// 플랫폼 내 회신 수신함 (고객여정 v0.2 화면 8 — MVP 범위: 회신 열람까지, 스레드 대화는 후순위)
// + 거래 단계 업데이트 진입점 (화면 10 — 수수료 연결)
export function ReplyModal() {
  const buyerId = useStore((s) => s.replyViewBuyerId)
  const buyer = useStore((s) => s.buyers.find((b) => b.id === s.replyViewBuyerId))
  const openReply = useStore((s) => s.openReply)
  const setDealStage = useStore((s) => s.setDealStage)
  if (!buyerId || !buyer) return null

  const stage: DealStage = buyer.dealStage ?? 'none'
  const STAGES: DealStage[] = ['none', 'meeting', 'sample', 'quote', 'contract']

  return (
    <Modal onClose={() => openReply(null)} width={560}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ fontSize: 16 }}>📩 회신 수신함</h3>
        <GradeBadge grade={buyer.grade} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{buyer.maskedName}</span>
        <Pill>📍 {buyer.region}</Pill>
        {buyer.repliedAt && <Pill color="var(--green)">회신 수신</Pill>}
      </div>

      <div style={{ background: 'var(--bg-2)', borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 8 }}>
        {buyer.replyBody ?? '(회신 본문 mock 없음)'}
      </div>
      <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 18 }}>
        * MVP는 회신 열람까지 지원합니다. 답장·스레드 대화는 후순위 기능입니다.
      </p>

      {/* 거래 단계 업데이트 — 수수료 프로세스 연결 */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>거래가 진행되고 있나요?</div>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>
          단계를 업데이트하면 이 바이어의 매칭이 계속 유지됩니다.
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {STAGES.map((s) => (
            <button
              key={s}
              className="btn"
              onClick={() => setDealStage(buyer.id, s)}
              style={{
                flex: 1, padding: '8px 4px', fontSize: 12,
                background: stage === s ? 'var(--blue)' : 'var(--bg-2)',
                color: stage === s ? '#fff' : 'var(--t2)',
                fontWeight: stage === s ? 800 : 600,
              }}
            >
              {DEAL_STAGE_LABEL[s]}
            </button>
          ))}
        </div>
        {stage === 'contract' && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--green)', fontWeight: 700, background: '#ecfdf5', borderRadius: 8, padding: '10px 12px' }}>
            🎉 계약 단계입니다 — 성사 수수료 프로세스가 안내됩니다. (수수료율·증빙 방식은 정책 확정 예정)
          </div>
        )}
      </div>
    </Modal>
  )
}
