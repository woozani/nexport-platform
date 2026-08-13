import { useStore, useSel, funnelCounts, selectRecommended } from '../store'
import { GradeBadge, StatusBadge } from '../components/ui'

const CHECK_ITEMS: { key: keyof ReturnType<typeof getChecks>; label: string }[] = [
  { key: 'separateEmail', label: '별도 이메일 진행 중' },
  { key: 'catalogSent', label: '카탈로그/견적 발송함' },
  { key: 'sampleDiscussion', label: '샘플 논의' },
  { key: 'videoMeeting', label: '화상미팅 진행' },
  { key: 'phoneCall', label: '전화 통화' },
]
const getChecks = () => useStore.getState().report.checks

// 화면 9. 영업 보고서 ★리텐션 장치 — funnel + 오프-플랫폼 활동 회수 체크 + PDF(인쇄)
export function Report() {
  const counts = useSel(funnelCounts)
  const rec = useSel(selectRecommended)
  const report = useStore((s) => s.report)
  const setReport = useStore((s) => s.setReport)
  const user = useStore((s) => s.user)
  const anyChecked = Object.values(report.checks).some(Boolean)
  const month = new Date().toISOString().slice(0, 7)

  return (
    <div className="print-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 18 }}>월간 영업 보고서 — {month}</h2>
        <button className="btn btn-primary no-print" onClick={() => window.print()}>⬇ PDF 다운로드</button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>
        {user?.company} · 매월 자동 생성 · 바이어 연락처는 보고서에도 노출되지 않습니다.
      </p>

      {/* funnel */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>이번 달 성과 Funnel</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--t3)', fontSize: 12 }}>
              {['추천', '발송', '열람', '회신'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontWeight: 800, fontSize: 18 }}>
              <td style={{ padding: '10px 8px' }}>{counts.recommended}건</td>
              <td style={{ padding: '10px 8px' }}>{counts.sent}건</td>
              <td style={{ padding: '10px 8px', color: 'var(--violet)' }}>{counts.opened}건</td>
              <td style={{ padding: '10px 8px', color: 'var(--green)' }}>{counts.replied}건</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 바이어별 상태 표 */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>바이어별 상태</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--t3)', fontSize: 12 }}>
              {['바이어', '지역', '등급', '상태'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rec.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--bg-2)' }}>
                <td style={{ padding: '8px', fontWeight: 700 }}>{b.maskedName}</td>
                <td style={{ padding: '8px', color: 'var(--t2)' }}>{b.region}</td>
                <td style={{ padding: '8px' }}><GradeBadge grade={b.grade} /></td>
                <td style={{ padding: '8px' }}><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 오프-플랫폼 활동 — 매칭 락 유지 판단 + 데이터 그레이딩 입력값 */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 4 }}>플랫폼 밖에서 진행된 활동이 있나요?</h3>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>
          체크해주시면 해당 바이어의 매칭이 유지되고, 보고서에 함께 기록됩니다.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {CHECK_ITEMS.map(({ key, label }) => (
            <label
              key={key}
              className="btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 14px',
                background: report.checks[key] ? 'var(--blue-dim)' : 'var(--bg-2)',
                color: report.checks[key] ? 'var(--blue)' : 'var(--t2)',
                border: `1px solid ${report.checks[key] ? 'var(--blue)' : 'var(--border)'}`,
              }}
            >
              <input
                type="checkbox"
                checked={report.checks[key]}
                onChange={(e) => setReport({ checks: { ...report.checks, [key]: e.target.checked } })}
                style={{ width: 'auto' }}
                className="no-print"
              />
              {report.checks[key] ? '✓ ' : ''}{label}
            </label>
          ))}
        </div>
        <textarea
          rows={3}
          placeholder="자유 메모 — 예: Aqua*** Inc. 담당자와 다음 주 화상미팅 예정, 샘플 3종 발송 준비 중"
          value={report.memo}
          onChange={(e) => setReport({ memo: e.target.value })}
        />
        {anyChecked && (
          <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 10, fontWeight: 700 }}>
            ✓ 오프-플랫폼 활동이 기록되었습니다 — 진행 중인 바이어의 매칭 락이 연장됩니다.
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center' }}>NEXPORT 월간 영업 보고서 · 생성일 {new Date().toLocaleDateString('ko-KR')}</div>
    </div>
  )
}
