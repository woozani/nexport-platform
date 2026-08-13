// v0.2 도메인 타입 — docs/specs/NEXPORT_데이터그레이드_시나리오_v0.1.md 기준

export type Grade = 'GOLD' | 'SILVER' | 'BRONZE' | 'COLD' | 'DEAD'

export type TrackStatus = 'none' | 'sent' | 'opened' | 'attach_opened' | 'replied'

export type ExcludeReason = '분야가 맞지 않음' | '규모가 맞지 않음' | '기타'

export interface Buyer {
  id: string
  maskedName: string // 예: "Aqua*** Inc." — 하드 제약: 회사명 부분 마스킹
  summary: string // AI 한 줄 요약 (raw 키워드 나열 금지)
  region: string // 국가/주
  industry: string
  employees: string
  matchReason: string
  grade: Grade
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
  plan: 'Free' | 'Standard' | 'Premium'
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

// tier별 월 추천 건수 [제안값 — 스펙 v0.2]
export const PLAN_QUOTA: Record<UserAccount['plan'], number> = {
  Free: 3,
  Standard: 10,
  Premium: 20,
}

export const REFILL_LIMIT = 2 // 제외 시 보충 추천 한도 [제안값: 월 2건]
export const PREVIEW_REFRESH_LIMIT = 3 // 화면 4 새로고침 [제안값: 3회]
export const FOLLOWUP_DAYS = 7 // 무반응 팔로업 추천 [제안값: 7일]
export const RELEASE_DAYS = 14 // 매칭 해제 예정 [제안값: 2주]
