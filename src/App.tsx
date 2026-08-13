import './theme.css'
import { useStore } from './store'
import { Logo, Toast } from './components/ui'
import { View } from './types'
import { Signup } from './screens/Signup'
import { ProfileSetup } from './screens/ProfileSetup'
import { PreviewHook } from './screens/PreviewHook'
import { Dashboard } from './screens/Dashboard'
import { Recommendations } from './screens/Recommendations'
import { ComposeMail } from './screens/ComposeMail'
import { Tracking } from './screens/Tracking'
import { Report } from './screens/Report'
import { MyPage } from './screens/MyPage'
import { ReplyModal } from './screens/ReplyInbox'
import { daysSince } from './store'
import { FOLLOWUP_DAYS } from './types'

// v0.2 — 월 N건 자동 추천 모델. 전체 바이어 리스트 브라우징/검색 화면 없음 (스크래핑 방지 정책).
const MENU: { key: View; label: string; icon: string }[] = [
  { key: 'dashboard', label: '대시보드', icon: '▦' },
  { key: 'recommend', label: '추천 바이어', icon: '★' },
  { key: 'tracking', label: '발송 현황', icon: '➤' },
  { key: 'report', label: '영업 보고서', icon: '▤' },
  { key: 'mypage', label: '마이페이지', icon: '⚙' },
]

export default function App() {
  const stage = useStore((s) => s.stage)
  if (stage === 'signup') return <><Signup /><Toast /><DemoReset /></>
  if (stage === 'profile') return <><ProfileSetup /><Toast /><DemoReset /></>
  if (stage === 'hook') return <><PreviewHook /><Toast /><DemoReset /></>
  return <Shell />
}

// 시연용 초기화 — persist된 상태를 비우고 처음부터
function DemoReset() {
  const resetDemo = useStore((s) => s.resetDemo)
  return (
    <button
      className="btn no-print"
      onClick={resetDemo}
      title="데모 상태를 초기화합니다"
      style={{ position: 'fixed', bottom: 14, right: 14, zIndex: 200, fontSize: 11, padding: '6px 12px', background: 'var(--bg-1)', color: 'var(--t3)', border: '1px solid var(--border)', borderRadius: 20 }}
    >
      ↺ 데모 초기화
    </button>
  )
}

function Shell() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const user = useStore((s) => s.user)
  const composeBuyerId = useStore((s) => s.composeBuyerId)
  const composeBuyer = useStore((s) => s.buyers.find((b) => b.id === s.composeBuyerId))
  const isFollowup = !!composeBuyer && composeBuyer.status !== 'none' && !composeBuyer.repliedAt && daysSince(composeBuyer.sentAt) >= FOLLOWUP_DAYS

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="no-print" style={{ width: 210, background: 'var(--bg-1)', borderRight: '1px solid var(--border)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '0 8px 18px' }}><Logo size={22} /></div>
        {MENU.map((m) => (
          <button
            key={m.key}
            className="btn"
            onClick={() => setView(m.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', fontSize: 13, textAlign: 'left',
              background: view === m.key ? 'var(--blue-dim)' : 'transparent',
              color: view === m.key ? 'var(--blue)' : 'var(--t2)',
              fontWeight: view === m.key ? 800 : 600, borderRadius: 8,
            }}
          >
            <span style={{ width: 16 }}>{m.icon}</span> {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', fontSize: 12 }}>
          <div style={{ fontWeight: 800 }}>{user?.managerName}</div>
          <div style={{ color: 'var(--t3)', marginTop: 2 }}>{user?.company}</div>
          <div style={{ marginTop: 6, display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: 'var(--blue-dim)', color: 'var(--blue)', fontWeight: 800, fontSize: 11 }}>
            {user?.plan} 플랜
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1100 }}>
        {view === 'dashboard' && <Dashboard />}
        {view === 'recommend' && <Recommendations />}
        {view === 'tracking' && <Tracking />}
        {view === 'report' && <Report />}
        {view === 'mypage' && <MyPage />}
      </main>

      {composeBuyerId && <ComposeMail followup={isFollowup} />}
      <ReplyModal />
      <Toast />
      <DemoReset />
    </div>
  )
}
