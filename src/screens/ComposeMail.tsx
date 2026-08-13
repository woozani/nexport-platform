import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { GradeBadge, Modal, Pill } from '../components/ui'

// 화면 7. AI 메일 작성 — 초안 pre-fill(mock), 편집, 첨부 UI, 플랫폼 내부 발송 (mailto 금지)
export function ComposeMail({ followup = false }: { followup?: boolean }) {
  const buyerId = useStore((s) => s.composeBuyerId)
  const buyer = useStore((s) => s.buyers.find((b) => b.id === buyerId))
  const profile = useStore((s) => s.profile)
  const user = useStore((s) => s.user)
  const closeCompose = useStore((s) => s.closeCompose)
  const sendMail = useStore((s) => s.sendMail)

  const draft = useMemo(() => {
    if (!buyer) return { subject: '', body: '' }
    const certs = profile?.certs.length ? profile.certs.join(', ') : 'ISO-certified'
    return followup
      ? {
          subject: `Re: Partnership opportunity — ${user?.company ?? 'Korean manufacturer'}`,
          body: `Hi,\n\nI wanted to follow up on my previous note. We remain very interested in supporting ${buyer.summary.replace(/입니다\.$/, '')} with our products.\n\nWould a brief 15-minute call next week work for you?\n\nBest regards,\n${user?.managerName ?? ''}\n${user?.company ?? ''}`,
        }
      : {
          subject: `Introduction: ${user?.company ?? 'Korean manufacturer'} — ${certs} certified supplier`,
          body: `Hi,\n\nMy name is ${user?.managerName ?? ''} from ${user?.company ?? ''}, a Korean manufacturer (${certs}).\n\n${profile?.description ?? ''}\n\nI noticed your company profile — ${buyer.summary} We believe there is a strong fit between your sourcing needs and our product line.\n\nI've attached our catalog for your review. Would you be open to a short call?\n\nBest regards,\n${user?.managerName ?? ''}\n${user?.company ?? ''}`,
        }
  }, [buyer, profile, user, followup])

  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.body)
  const [attachCatalog, setAttachCatalog] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [tone, setTone] = useState<'기본' | '격식' | '간결'>('기본')

  if (!buyer) return null

  // [AI 다시 쓰기] — 톤 변형 mock 로테이션 (실서비스는 LLM 재생성)
  const rewrite = () => {
    const next = tone === '기본' ? '격식' : tone === '격식' ? '간결' : '기본'
    setTone(next)
    const certs = profile?.certs.length ? profile.certs.join(', ') : 'ISO-certified'
    const who = `${user?.managerName ?? ''}, ${user?.company ?? ''}`
    if (next === '격식') {
      setSubject(`Partnership Inquiry from ${user?.company ?? 'a Korean manufacturer'} (${certs})`)
      setBody(`Dear Procurement Team,\n\nI hope this message finds you well. I am writing on behalf of ${user?.company ?? ''}, a certified Korean manufacturer (${certs}).\n\n${profile?.description ?? ''}\n\nGiven that ${buyer.summary} we believe a partnership could bring mutual value. Please find our catalog attached for your kind review.\n\nWe would be honored to schedule a brief introductory call at your convenience.\n\nSincerely,\n${who}`)
    } else if (next === '간결') {
      setSubject(`${certs} Korean supplier — quick intro`)
      setBody(`Hi,\n\n${user?.company ?? ''} here — Korean manufacturer, ${certs}.\n\n${buyer.summary} That's exactly who we supply.\n\nCatalog attached. Open to a 15-min call this week?\n\n${user?.managerName ?? ''}`)
    } else {
      setSubject(draft.subject)
      setBody(draft.body)
    }
  }

  return (
    <Modal onClose={closeCompose} width={640}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ fontSize: 16 }}>{followup ? '2차 팔로업 메일' : 'AI 메일 작성'}</h3>
        <GradeBadge grade={buyer.grade} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{buyer.maskedName}</span>
        <Pill>📍 {buyer.region}</Pill>
        <Pill>연락처 비노출 · 플랫폼 발송</Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, fontSize: 11, color: 'var(--t3)', background: 'var(--bg-2)', borderRadius: 8, padding: '8px 10px' }}>
          ✨ 회사 프로필과 바이어 정보 기반 AI 초안입니다. 자유롭게 수정 후 발송하세요.
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12, whiteSpace: 'nowrap' }} onClick={rewrite} title="톤을 바꿔 다시 작성합니다">
          ✨ AI 다시 쓰기 <span style={{ color: 'var(--blue)', fontWeight: 800 }}>({tone})</span>
        </button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} style={{ fontWeight: 700 }} />
      </div>
      <textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} style={{ lineHeight: 1.6, fontSize: 13 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 18px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--t2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={attachCatalog} onChange={(e) => setAttachCatalog(e.target.checked)} style={{ width: 'auto' }} />
          📎 catalog_2026.pdf 첨부 <span style={{ fontSize: 11, color: 'var(--t3)' }}>(첨부 열람이 트래킹됩니다)</span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={closeCompose}>취소</button>
        <button className="btn btn-primary" onClick={() => setConfirming(true)}>발송</button>
      </div>

      {confirming && (
        <Modal onClose={() => setConfirming(false)} width={380}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>메일을 발송할까요?</h3>
          <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 18 }}>
            <b>{buyer.maskedName}</b>에게 플랫폼을 통해 발송됩니다.<br />
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>발송 후에는 회수할 수 없습니다.</span>
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)}>다시 확인</button>
            <button className="btn btn-primary" onClick={() => sendMail(buyer.id, followup)}>발송 확정</button>
          </div>
        </Modal>
      )}
    </Modal>
  )
}
