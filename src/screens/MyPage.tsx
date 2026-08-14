import { useState } from 'react'
import { useStore, useSel } from '../store'
import { Field, Pill } from '../components/ui'
import { PLAN_CONFIG } from '../types'

// 화면 10. 마이페이지 — 프로필 수정 + Founding Member 플랜 + 크레딧 잔액·열람 이력 (dev_spec policy 1·4)
export function MyPage() {
  const user = useStore((s) => s.user)
  const profile = useStore((s) => s.profile)
  const updateProfile = useStore((s) => s.updateProfile)
  const setToast = useStore((s) => s.setToast)
  const credits = useStore((s) => s.credits)
  const revealLog = useSel((s) => s.revealLog)
  const [desc, setDesc] = useState(profile?.description ?? '')
  const plan = PLAN_CONFIG[user?.plan ?? 'Founding']

  return (
    <div style={{ maxWidth: 680 }}>
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

      {/* 플랜 — BEP 전 단일 무료 (dev_spec policy 4). 플랜 정의는 PLAN_CONFIG 테이블에서만 온다 (req 4-1) */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>플랜</h3>
        <div style={{ borderRadius: 10, border: '2px solid var(--blue)', background: 'var(--blue-dim)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{plan.label}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--blue)' }}>{plan.price}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8, lineHeight: 1.7 }}>{plan.note}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Pill>월 발송 한도 {plan.sendQuota}건</Pill>
            <Pill>월 기본 크레딧 {plan.monthlyCredits}개</Pill>
            <Pill color="var(--blue)">잔여 크레딧 {credits}개</Pill>
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 10 }}>
          * 발송 한도·크레딧 수치는 기획 확정 전 데모값(TBD)입니다. 유료 플랜은 BEP 도달 후 설계됩니다.
          데이터 일괄 내보내기(bulk export)는 정책상 제공되지 않습니다.
        </p>
      </div>

      {/* 열람 이력 — append-only 로그 (dev_spec policy 1-3: 과금의 계약적 근거) */}
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 14, marginBottom: 4 }}>연락처 열람 이력</h3>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12 }}>모든 열람은 기록되며 수정·삭제되지 않습니다.</p>
        {revealLog.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--t3)', padding: '10px 0' }}>아직 열람 이력이 없습니다. 응답한 바이어의 연락처를 열람하면 여기에 기록됩니다.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ color: 'var(--t3)' }}>
                {['바이어', '열람 일시', '차감'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {revealLog.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--bg-2)' }}>
                  <td style={{ padding: '7px 8px', fontWeight: 700 }}>{r.maskedName}</td>
                  <td style={{ padding: '7px 8px', color: 'var(--t2)' }}>{new Date(r.ts).toLocaleString('ko-KR')}</td>
                  <td style={{ padding: '7px 8px' }}>크레딧 {r.creditsSpent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
