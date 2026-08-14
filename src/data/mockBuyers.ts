import { Buyer } from '../types'

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString()

// ── 태그 스키마 기본값 (dev_spec policy 2 v1.2 — SME 5카테고리, 2026-08-14 확정) ──
// 실서비스는 정제 파이프라인(LLM 배치)이 생성. 데모는 카테고리별 대표 태그로 시뮬레이션.
const SECTOR_TAGS: Record<string, { hs: string[]; certs: string[] }> = {
  화장품: { hs: ['3304.99 (기초화장품)', '3304.20 (아이 메이크업)'], certs: ['FDA MoCRA 등록', 'ISO 22716 (GMP)'] },
  플라스틱: { hs: ['3926.90 (기타 플라스틱 제품)', '3923.30 (플라스틱 용기)'], certs: ['FDA 식품접촉', 'UL'] },
  접착제: { hs: ['3506.91 (산업용 접착제)', '3506.10 (소매용 접착제)'], certs: ['ASTM', 'REACH'] },
  고무: { hs: ['4016.93 (가스켓·씰)', '4016.99 (기타 고무제품)'], certs: ['ASTM', 'FDA 식품접촉'] },
  공구: { hs: ['8207.50 (드릴링 공구)', '8207.70 (밀링 공구)'], certs: ['ANSI', 'ISO 9001'] },
}

type RawBuyer = Omit<Buyer, 'hsTags' | 'requiredCerts' | 'importHistory' | 'matchScore'> & {
  matchScore?: number
  importHistory?: boolean
}

// 매칭 점수: 등급·트래킹 상태 기반 데모값 (실서비스는 임베딩 유사도 + 태그 일치)
const scoreOf = (b: RawBuyer): number => {
  const base = { GOLD: 88, SILVER: 78, BRONZE: 68, COLD: 40, DEAD: 10 }[b.grade]
  return b.matchScore ?? base + ((b.id.charCodeAt(2) * 7) % 9)
}

const enrich = (b: RawBuyer): Buyer => ({
  ...b,
  hsTags: SECTOR_TAGS[b.industry]?.hs ?? [],
  requiredCerts: SECTOR_TAGS[b.industry]?.certs ?? [],
  importHistory: b.importHistory ?? (b.grade === 'GOLD' || b.grade === 'SILVER'),
  matchScore: scoreOf(b),
})

// 25건 mock — SME 5카테고리(화장품/플라스틱/접착제/고무/공구), 2026-08-14 스코프 확정
// 등급 분포: GOLD 4 / SILVER 5 / BRONZE 9 / COLD 4 / DEAD 3
// COLD/DEAD는 관리자 관점 데이터 — UI(추천 풀)에는 절대 노출되지 않음
const RAW: RawBuyer[] = [
  // ── GOLD (회신 이력 보유) ──
  { id: 'b01', maskedName: 'Glow*** Beauty Inc.', summary: '캘리포니아 소재 K-뷰티 전문 유통·브랜드사입니다.', region: '미국 · 캘리포니아', industry: '화장품', employees: '50~200명', matchReason: '스킨케어 키워드 유사도 + 한국 화장품 수입 이력', grade: 'GOLD', status: 'replied', sentAt: daysAgo(9), openedAt: daysAgo(8), attachOpenedAt: daysAgo(7), repliedAt: daysAgo(6), bounces: 0, offPlatform: false, matchCount: 1, contact: { company: 'Glowline Beauty Inc.', person: 'Rachel Kim', title: 'Head of Sourcing', email: 'r.kim@glowline-beauty.com', phone: '+1 (562) 555-0184', website: 'glowline-beauty.com' }, replyBody: `Hi,\n\nThanks for reaching out — your product line looks interesting. We are currently reviewing K-beauty suppliers for our skincare category for next season.\n\nCould you share your MOQ, lead time to the West Coast, and MoCRA/FDA registration documents?\n\nBest,\nSourcing Team\nGlow*** Beauty Inc.` },
  { id: 'b02', maskedName: 'Tool*** Supply Co.', summary: '중서부 제조업체에 산업용 공구를 공급하는 전문 디스트리뷰터입니다.', region: '미국 · 일리노이', industry: '공구', employees: '200~500명', matchReason: '절삭공구 카테고리 일치 + 아시아 공급사 수입 이력', grade: 'GOLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 2 },
  { id: 'b03', maskedName: 'Poly*** Products', summary: '산업·리테일용 플라스틱 완제품을 수입·유통하는 텍사스 업체입니다.', region: '미국 · 텍사스', industry: '플라스틱', employees: '50~200명', matchReason: '사출 완제품 키워드 유사도 + OEM 소싱 수요 시그널', grade: 'GOLD', status: 'attach_opened', sentAt: daysAgo(5), openedAt: daysAgo(4), attachOpenedAt: daysAgo(3), bounces: 0, offPlatform: true, matchCount: 1 },
  { id: 'b04', maskedName: 'Bond*** Group', summary: '건축·산업용 접착제와 실란트를 유통하는 미시간 소재 그룹사입니다.', region: '미국 · 미시간', industry: '접착제', employees: '500명 이상', matchReason: '실란트 카테고리 일치 + 신규 공급사 소싱 이력', grade: 'GOLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 1 },
  // ── SILVER (열람/첨부 신호) ──
  { id: 'b05', maskedName: 'Blu*** Cosmetics', summary: '플로리다에서 스킨케어·더마 제품을 취급하는 전문 수입상입니다.', region: '미국 · 플로리다', industry: '화장품', employees: '10~50명', matchReason: '더마 스킨케어 키워드 유사도 상위', grade: 'SILVER', status: 'opened', sentAt: daysAgo(4), openedAt: daysAgo(2), bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b06', maskedName: 'Seal*** Rubber', summary: '고무 씰·가스켓을 취급하는 뉴저지 산업재 유통사입니다.', region: '미국 · 뉴저지', industry: '고무', employees: '50~200명', matchReason: 'ASTM 규격 공급사 선호 + 카테고리 일치', grade: 'SILVER', status: 'none', bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b07', maskedName: 'Wes*** Tools', summary: '서부 지역 정비·산업 현장에 공구를 공급하는 캘리포니아 유통사입니다.', region: '미국 · 캘리포니아', industry: '공구', employees: '200~500명', matchReason: '절삭·드릴링 공구 소싱 수요', grade: 'SILVER', status: 'sent', sentAt: daysAgo(13), bounces: 0, offPlatform: false, matchCount: 2 },
  { id: 'b08', maskedName: 'Cle*** Packaging', summary: '식품·소비재용 플라스틱 용기를 조달하는 조지아 소재 업체입니다.', region: '미국 · 조지아', industry: '플라스틱', employees: '50~200명', matchReason: '용기·포장 조달 공고 이력', grade: 'SILVER', status: 'none', bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b09', maskedName: 'Dia*** Beauty Supply', summary: '뷰티 소모품을 수입하는 텍사스 소재 전문 업체입니다.', region: '미국 · 텍사스', industry: '화장품', employees: '10~50명', matchReason: 'MoCRA 등록 수입업체 + 뷰티 소모품 키워드 일치', grade: 'SILVER', status: 'none', bounces: 0, offPlatform: false, matchCount: 1 },
  // ── BRONZE (미검증 신규) ──
  { id: 'b10', maskedName: 'Ind*** Adhesives LLC', summary: '산업용 접착제·테이프를 취급하는 오하이오 종합 자재상입니다.', region: '미국 · 오하이오', industry: '접착제', employees: '50~200명', matchReason: '접착 소재 카테고리 인접 + 신규 소싱 시그널', grade: 'BRONZE', status: 'sent', sentAt: daysAgo(8), bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b11', maskedName: 'Nor*** Rubber Parts', summary: '산업용 고무 부품을 유통하는 노스캐롤라이나 업체입니다.', region: '미국 · 노스캐롤라이나', industry: '고무', employees: '10~50명', matchReason: '고무 성형품 카테고리 일치', grade: 'BRONZE', status: 'sent', sentAt: daysAgo(2), bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b12', maskedName: 'Hyd*** Tooling', summary: '정밀 공구·툴링을 취급하는 콜로라도 산업재 업체입니다.', region: '미국 · 콜로라도', industry: '공구', employees: '10~50명', matchReason: '정밀 공구 키워드 유사도', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b13', maskedName: 'Sur*** Skincare', summary: '클린뷰티 브랜드를 운영하는 펜실베이니아 소재 업체입니다.', region: '미국 · 펜실베이니아', industry: '화장품', employees: '50~200명', matchReason: 'ISO 22716(GMP) 공급사 선호 + 카테고리 일치', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b14', maskedName: 'Pac*** Trading', summary: '아시아 제조사 소싱 경험이 있는 워싱턴 무역회사입니다.', region: '미국 · 워싱턴', industry: '플라스틱', employees: '10~50명', matchReason: '한국 공급사 거래 이력', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b15', maskedName: 'Gre*** Polymer', summary: '고무·폴리머 부품을 유통하는 오리건 업체입니다.', region: '미국 · 오리건', industry: '고무', employees: '50~200명', matchReason: '폴리머 부품 카테고리 일치', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b16', maskedName: 'Mid*** Industrial Tools', summary: '중서부 제조 현장에 공구를 공급하는 인디애나 유통사입니다.', region: '미국 · 인디애나', industry: '공구', employees: '200~500명', matchReason: '산업용 공구 카테고리 일치', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b17', maskedName: 'Vit*** Beauty Products', summary: '온라인 채널로 뷰티 제품을 유통하는 애리조나 업체입니다.', region: '미국 · 애리조나', industry: '화장품', employees: '10~50명', matchReason: '이커머스 뷰티 카테고리 인접', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b18', maskedName: 'Fil*** Chemical Corp.', summary: '실란트·코팅 소재를 전문 취급하는 미네소타 업체입니다.', region: '미국 · 미네소타', industry: '접착제', employees: '10~50명', matchReason: '실란트 키워드 유사도 상위', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  // ── COLD (추천 제외 — UI 비노출, 관리자 데이터) ──
  { id: 'b19', maskedName: 'Sta*** Industrial', summary: '범용 산업재 유통사 — 3회 매칭 무반응.', region: '미국 · 켄터키', industry: '공구', employees: '50~200명', matchReason: '-', grade: 'COLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 3 },
  { id: 'b20', maskedName: 'Roc*** Rubber Co.', summary: '지역 고무 자재상 — 3회 매칭 무반응.', region: '미국 · 유타', industry: '고무', employees: '10~50명', matchReason: '-', grade: 'COLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 3 },
  { id: 'b21', maskedName: 'Bay*** Beauty Imports', summary: '소형 뷰티 수입상 — 4회 매칭 무반응.', region: '미국 · 메릴랜드', industry: '화장품', employees: '10~50명', matchReason: '-', grade: 'COLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 4 },
  { id: 'b22', maskedName: 'Pla*** Goods Co.', summary: '플라스틱 잡화 자재상 — 3회 매칭 무반응.', region: '미국 · 네바다', industry: '플라스틱', employees: '10~50명', matchReason: '-', grade: 'COLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 3 },
  // ── DEAD (폐기 — UI 비노출) ──
  { id: 'b23', maskedName: 'Del*** Trading', summary: '5회 매칭 전부 무반응 — 폐기.', region: '미국 · 델라웨어', industry: '접착제', employees: '10~50명', matchReason: '-', grade: 'DEAD', status: 'none', bounces: 0, offPlatform: false, matchCount: 5 },
  { id: 'b24', maskedName: 'Sun*** Supplies', summary: '반송 2회 누적 — 이메일 무효 폐기.', region: '미국 · 뉴멕시코', industry: '화장품', employees: '10~50명', matchReason: '-', grade: 'DEAD', status: 'none', bounces: 2, offPlatform: false, matchCount: 2 },
  { id: 'b25', maskedName: 'Old*** Plastics', summary: '5회 매칭 전부 무반응 — 폐기.', region: '미국 · 미주리', industry: '플라스틱', employees: '50~200명', matchReason: '-', grade: 'DEAD', status: 'none', bounces: 0, offPlatform: false, matchCount: 5 },
]

export const MOCK_BUYERS: Buyer[] = RAW.map(enrich)
