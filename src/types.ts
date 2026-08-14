// v0.2 도메인 타입 — docs/specs/NEXPORT_데이터그레이드_시나리오_v0.1.md 기준

export type Grade = 'GOLD' | 'SILVER' | 'BRONZE' | 'COLD' | 'DEAD'

export type TrackStatus = 'none' | 'sent' | 'opened' | 'attach_opened' | 'replied'

export type ExcludeReason = '분야가 맞지 않음' | '규모가 맞지 않음' | '기타'

// 거래 단계 — 고객여정 기획서 v0.2 화면 10 (수수료 연결 지점)
export type DealStage = 'none' | 'meeting' | 'sample' | 'quote' | 'contract'
export const DEAL_STAGE_LABEL: Record<DealStage, string> = {
  none: '미진행', meeting: '미팅', sample: '샘플', quote: '견적', contract: '계약',
}

// 크레딧 해제 시 공개되는 연락처 필드 (dev_spec policy 4 revealed_state)
export interface BuyerContact {
  company: string
  person: string
  title: string
  email: string
  phone: string
  website: string
}

export interface Buyer {
  id: string
  maskedName: string // 마스킹 표시명 — 회사명은 크레딧 해제 전 비공개 (policy 1-1 필드 단위 마스킹)
  summary: string // AI 한 줄 요약 (raw 키워드 나열 금지)
  region: string // 국가/주
  industry: string
  employees: string
  matchReason: string
  grade: Grade
  // ── 마스킹 상태 공개 필드 (dev_spec policy 4 masked_state) ──
  hsTags: string[] // 품목 태그 — HS 6자리 정규화 (policy 2)
  requiredCerts: string[] // 요구 인증
  importHistory: boolean // 수입 이력 유무
  matchScore: number // 매칭 점수 (0~100)
  contact?: BuyerContact // 크레딧 해제 대상 — 응답 확인된 바이어만 열람 가능
  status: TrackStatus
  sentAt?: string // ISO
  secondSentAt?: string
  openedAt?: string
  attachOpenedAt?: string
  repliedAt?: string
  bounces: number
  offPlatform: boolean // 영업보고서 오프-플랫폼 체크 반영
  matchCount: number // 누적 매칭 횟수 (COLD/DEAD 판정 입력)
  excludedReason?: ExcludeReason
  replyBody?: string // 플랫폼 수신함에서 보여줄 회신 본문 (mock)
  dealStage?: DealStage
}

export interface CompanyProfile {
  description: string
  country: 'US'
  industry: string
  certs: string[]
  certEtc: string
}

export interface UserAccount {
  email: string
  company: string
  bizNumber: string
  managerName: string
  managerTitle: string
  plan: PlanId
}

// 열람 이벤트 로그 — append-only (policy 1-3: 과금의 계약적 근거)
export interface RevealLogEntry {
  buyerId: string
  maskedName: string
  ts: string // ISO
  creditsSpent: number
}

export interface ReportInput {
  // 오프-플랫폼 활동 회수 장치 (화면 9)
  checks: {
    separateEmail: boolean
    catalogSent: boolean
    sampleDiscussion: boolean
    videoMeeting: boolean
    phoneCall: boolean
  }
  memo: string
}

export type Stage = 'signup' | 'profile' | 'hook' | 'app'
export type View = 'dashboard' | 'recommend' | 'tracking' | 'report' | 'mypage'

// ── 플랜 설정 테이블 (dev_spec requirement 4-1: 하드코딩 금지, 설정값 분리) ──
// 유료 전환 시 이 테이블에 행 추가만으로 플랜이 확장되어야 한다.
export type PlanId = 'Founding'
export interface PlanConfig {
  label: string
  price: string
  sendQuota: number // 월 아웃리치 발송 한도 [TBD — 기획 확정 전 데모값]
  monthlyCredits: number // 월 기본 크레딧 [TBD — 기획 확정 전 데모값]
  note: string
}
export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  Founding: {
    label: 'Founding Member',
    price: '무료 (BEP 전)',
    sendQuota: 10,
    monthlyCredits: 5,
    note: '마스킹 프로필 열람 무제한 · 연락처 열람은 응답 확인된 바이어만 크레딧 1개 차감 · 매칭 성사 시 성사비',
  },
}
export const PLAN_QUOTA: Record<PlanId, number> = { Founding: PLAN_CONFIG.Founding.sendQuota }

export const REFILL_LIMIT = 2 // 제외 시 보충 추천 한도 [제안값: 월 2건]
export const PREVIEW_REFRESH_LIMIT = 3 // 화면 4 새로고침 [제안값: 3회]
export const FOLLOWUP_DAYS = 7 // 무반응 팔로업 추천 [제안값: 7일]
export const RELEASE_DAYS = 14 // 매칭 해제 예정 [제안값: 2주]
