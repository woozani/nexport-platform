import { useStore, useSel, selectPreviewBuyers } from '../store'
import { Logo, Pill } from '../components/ui'

// 화면 4. 가입 훅 — 유사 바이어 5개 한 줄 요약 미리보기 (회사명·연락처 비노출)
// 목적: 가입 직후 "여기 진짜 내 바이어가 있다" 증명 (8/13 회의 개발자 제안)
export function PreviewHook() {
  const previews = useSel(selectPreviewBuyers)
  const refreshLeft = useStore((s) => s.previewRefreshLeft)
  const refreshPreview = useStore((s) => s.refreshPreview)
  const enterApp = useStore((s) => s.enterApp)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-up" style={{ width: 560, padding: 32 }}>
        <Logo />
        <h1 style={{ fontSize: 20, margin: '20px 0 4px' }}>프로필과 유사한 바이어를 찾았습니다</h1>
        <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
          입력하신 서술을 기반으로 AI가 매칭한 미리보기입니다. 회사명·연락처는 추천 확정 후에도 정책상 마스킹됩니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {previews.map((b, i) => (
            <div key={b.id} className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue)', width: 18 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.summary}</div>
                <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                  <Pill>{b.region}</Pill>
                  <Pill>직원 {b.employees}</Pill>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" disabled={refreshLeft <= 0} onClick={refreshPreview} style={{ flex: 1 }}>
            ↻ 다른 바이어 보기 {refreshLeft > 0 ? `(${refreshLeft}회 남음)` : '(소진)'}
          </button>
          <button className="btn btn-primary" style={{ flex: 2, padding: 12 }} onClick={enterApp}>
            이 바이어들에게 메일 보내기 시작 →
          </button>
        </div>
      </div>
    </div>
  )
}
