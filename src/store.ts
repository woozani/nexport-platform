import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import {
  Buyer, CompanyProfile, DealStage, ExcludeReason, Grade, ReportInput, Stage, UserAccount, View,
  PLAN_QUOTA, PREVIEW_REFRESH_LIMIT, REFILL_LIMIT,
} from './types'
import { MOCK_BUYERS } from './data/mockBuyers'

export const daysSince = (iso?: string): number =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 864e5) : 0

// engagement score — 데이터그레이드 시나리오 v0.1 §3 (등급 내 정렬용, 카드 정렬에 실사용)
export const engagementScore = (b: Buyer): number => {
  let s = 0
  if (b.repliedAt) s += 10
  if (b.attachOpenedAt) s += 5
  if (b.openedAt) s += 1
  if (b.offPlatform) s += 15
  if (b.sentAt && !b.repliedAt && daysSince(b.sentAt) >= 14) s -= 2
  s -= b.bounces * 10
  return s
}

const GRADE_ORDER: Record<Grade, number> = { GOLD: 0, SILVER: 1, BRONZE: 2, COLD: 3, DEAD: 4 }
const RECOMMENDABLE: Grade[] = ['GOLD', 'SILVER', 'BRONZE'] // COLD/DEAD는 추천 풀 진입 금지

const sortForRecommend = (list: Buyer[]) =>
  [...list].sort(
    (a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || engagementScore(b) - engagementScore(a),
  )

interface AppState {
  stage: Stage
  view: View
  user: UserAccount | null
  profile: CompanyProfile | null
  buyers: Buyer[]
  recommendedIds: string[]
  previewPage: number
  previewRefreshLeft: number
  refillUsed: number
  composeBuyerId: string | null
  replyViewBuyerId: string | null
  report: ReportInput
  toast: string | null

  signup: (u: Omit<UserAccount, 'plan'>) => void
  saveProfile: (p: CompanyProfile) => void
  refreshPreview: () => void
  enterApp: () => void
  setView: (v: View) => void
  openCompose: (buyerId: string) => void
  closeCompose: () => void
  sendMail: (buyerId: string, followup?: boolean) => void
  excludeBuyer: (buyerId: string, reason: ExcludeReason) => void
  setReport: (r: Partial<ReportInput>) => void
  setToast: (t: string | null) => void
  updateProfile: (p: Partial<CompanyProfile>) => void
  openReply: (buyerId: string | null) => void
  setDealStage: (buyerId: string, stage: DealStage) => void
  resetDemo: () => void
}

const initialState = {
  stage: 'signup' as Stage,
  view: 'dashboard' as View,
  user: null,
  profile: null,
  buyers: MOCK_BUYERS,
  recommendedIds: [] as string[],
  previewPage: 0,
  previewRefreshLeft: PREVIEW_REFRESH_LIMIT,
  refillUsed: 0,
  composeBuyerId: null,
  replyViewBuyerId: null,
  report: {
    checks: { separateEmail: false, catalogSent: false, sampleDiscussion: false, videoMeeting: false, phoneCall: false },
    memo: '',
  },
  toast: null,
}

export const useStore = create<AppState>()(persist((set, get) => ({
  ...initialState,

  signup: (u) => set({ user: { ...u, plan: 'Standard' }, stage: 'profile' }),

  saveProfile: (p) => {
    const { buyers, user } = get()
    const quota = PLAN_QUOTA[user?.plan ?? 'Standard']
    const pool = sortForRecommend(buyers.filter((b) => RECOMMENDABLE.includes(b.grade)))
    set({ profile: p, stage: 'hook', recommendedIds: pool.slice(0, quota).map((b) => b.id) })
  },

  refreshPreview: () => {
    const { previewRefreshLeft, previewPage } = get()
    if (previewRefreshLeft <= 0) return
    set({ previewRefreshLeft: previewRefreshLeft - 1, previewPage: (previewPage + 1) % 3 })
  },

  enterApp: () => set({ stage: 'app', view: 'dashboard' }),
  setView: (v) => set({ view: v, composeBuyerId: null }),
  openCompose: (buyerId) => set({ composeBuyerId: buyerId }),
  closeCompose: () => set({ composeBuyerId: null }),

  sendMail: (buyerId, followup = false) => {
    set((st) => ({
      buyers: st.buyers.map((b) =>
        b.id === buyerId
          ? followup
            ? { ...b, secondSentAt: new Date().toISOString() }
            : { ...b, status: b.status === 'none' ? 'sent' : b.status, sentAt: b.sentAt ?? new Date().toISOString() }
          : b,
      ),
      composeBuyerId: null,
      view: 'tracking',
      toast: followup ? '2차 팔로업 메일이 발송되었습니다.' : '메일이 발송되었습니다. 발송 현황에서 추적할 수 있습니다.',
    }))
  },

  excludeBuyer: (buyerId, reason) => {
    const st = get()
    const buyers = st.buyers.map((b) => (b.id === buyerId ? { ...b, excludedReason: reason } : b))
    let recommendedIds = st.recommendedIds.filter((id) => id !== buyerId)
    let refillUsed = st.refillUsed
    let toast = '추천에서 제외되었습니다. (제외 사유는 추천 개선에 사용됩니다)'
    if (refillUsed < REFILL_LIMIT) {
      const candidate = sortForRecommend(
        buyers.filter(
          (b) => RECOMMENDABLE.includes(b.grade) && !b.excludedReason && !recommendedIds.includes(b.id),
        ),
      )[0]
      if (candidate) {
        recommendedIds = [...recommendedIds, candidate.id]
        refillUsed += 1
        toast = `제외 완료 — 신규 바이어 1건이 보충 추천되었습니다. (이번 달 보충 ${refillUsed}/${REFILL_LIMIT})`
      }
    }
    set({ buyers, recommendedIds, refillUsed, toast })
  },

  setReport: (r) =>
    set((st) => ({
      report: { checks: { ...st.report.checks, ...(r.checks ?? {}) }, memo: r.memo ?? st.report.memo },
    })),
  setToast: (t) => set({ toast: t }),
  updateProfile: (p) => set((st) => ({ profile: st.profile ? { ...st.profile, ...p } : st.profile })),
  openReply: (buyerId) => set({ replyViewBuyerId: buyerId }),
  setDealStage: (buyerId, stage) =>
    set((st) => ({
      buyers: st.buyers.map((b) => (b.id === buyerId ? { ...b, dealStage: stage } : b)),
      toast:
        stage === 'contract'
          ? '🎉 계약 단계로 업데이트되었습니다. 성사 수수료 프로세스 안내 메일이 발송됩니다. (mock)'
          : '거래 단계가 업데이트되었습니다. 해당 바이어의 매칭이 유지됩니다.',
    })),
  resetDemo: () => {
    set({ ...initialState, buyers: MOCK_BUYERS })
    try { localStorage.removeItem('nexport-v02-demo') } catch { /* noop */ }
  },
}), {
  name: 'nexport-v02-demo', // F5 새로고침에도 시연 상태 유지
  partialize: (st) => ({ ...st, toast: null, composeBuyerId: null, replyViewBuyerId: null }),
}))

// 파생 셀렉터용 훅 — 새 배열/객체를 반환하는 셀렉터는 반드시 이걸로 구독 (무한 루프 방지)
export const useSel = <T,>(sel: (s: AppState) => T): T => useStore(useShallow(sel))

// ── 파생 셀렉터 ──
export const selectRecommended = (st: AppState): Buyer[] => {
  const map = new Map(st.buyers.map((b) => [b.id, b]))
  return sortForRecommend(st.recommendedIds.map((id) => map.get(id)!).filter(Boolean))
}

export const selectSent = (st: AppState): Buyer[] =>
  st.buyers.filter((b) => b.status !== 'none' && st.recommendedIds.includes(b.id))

export const selectPreviewBuyers = (st: AppState): Buyer[] => {
  const pool = st.buyers.filter((b) => RECOMMENDABLE.includes(b.grade))
  const start = st.previewPage * 5
  return pool.slice(start, start + 5).length >= 5 ? pool.slice(start, start + 5) : pool.slice(0, 5)
}

export const funnelCounts = (st: AppState) => {
  const rec = selectRecommended(st)
  const sent = rec.filter((b) => b.status !== 'none')
  const opened = rec.filter((b) => b.openedAt || b.attachOpenedAt || b.repliedAt)
  const replied = rec.filter((b) => b.repliedAt)
  return { recommended: rec.length, sent: sent.length, opened: opened.length, replied: replied.length }
}
