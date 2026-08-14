import { Buyer } from '../types'

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString()

// ── 태그 스키마 기본값 (dev_spec policy 2 — HS 6자리 품목 태그 + 요구 인증) ──
// 실서비스는 정제 파이프라인(LLM 배치)이 생성. 데모는 섹터별 대표 태그로 시뮬레이션.
const SECTOR_TAGS: Record<string, { hs: string[]; certs: string[] }> = {
  기계요소: { hs: ['8481.80 (산업용 밸브)', '8413.70 (원심 펌프)', '7318.15 (볼트·스크류)'], certs: ['API 6D', 'ASME B16.34', 'ISO 9001'] },
  의료기기: { hs: ['9018.90 (의료기기 부품)', '9019.20 (치료용 호흡기기)'], certs: ['FDA 510(k)', 'ISO 13485', 'CE MDR'] },
  자동차부품: { hs: ['8708.99 (차량 부품)', '8708.30 (제동장치)'], certs: ['IATF 16949', 'PPAP'] },
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

// 25건 mock — 자동차부품/의료기기/산업 기계요소(밸브·펌프·파스너) 3섹터 (2026-08-14 스코프 확정)
// 등급 분포: GOLD 4 / SILVER 5 / BRONZE 9 / COLD 4 / DEAD 3
// COLD/DEAD는 관리자 관점 데이터 — UI(추천 풀)에는 절대 노출되지 않음
const RAW: RawBuyer[] = [
  // ── GOLD (회신 이력 보유) ──
  { id: 'b01', maskedName: 'Aqua*** Inc.', summary: '캘리포니아 소재 산업용 밸브·배관자재 유통사입니다.', region: '미국 · 캘리포니아', industry: '기계요소', employees: '50~200명', matchReason: '산업 밸브 키워드 유사도 + API 인증 수입 이력', grade: 'GOLD', status: 'replied', sentAt: daysAgo(9), openedAt: daysAgo(8), attachOpenedAt: daysAgo(7), repliedAt: daysAgo(6), bounces: 0, offPlatform: false, matchCount: 1, contact: { company: 'AquaPure Industrial Inc.', person: 'Michael Torres', title: 'Procurement Manager', email: 'm.torres@aquapure-ind.com', phone: '+1 (562) 555-0184', website: 'aquapure-ind.com' }, replyBody: `Hi,\n\nThanks for reaching out — your catalog looks interesting. We are currently reviewing suppliers for our industrial valve line for next quarter.\n\nCould you share your MOQ, lead time to the West Coast, and API/ISO certification documents?\n\nBest,\nProcurement Team\nAqua*** Inc.` },
  { id: 'b02', maskedName: 'Med*** Supply Co.', summary: '중서부 병원 체인에 의료 소모품을 공급하는 전문 디스트리뷰터입니다.', region: '미국 · 일리노이', industry: '의료기기', employees: '200~500명', matchReason: 'FDA 등록 수입업체 + 의료 소모품 카테고리 일치', grade: 'GOLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 2 },
  { id: 'b03', maskedName: 'Pur*** Water Systems', summary: '상업용 유체설비 시스템을 설계·시공하는 텍사스 엔지니어링 업체입니다.', region: '미국 · 텍사스', industry: '기계요소', employees: '50~200명', matchReason: '펌프·밸브 OEM 소싱 수요 시그널', grade: 'GOLD', status: 'attach_opened', sentAt: daysAgo(5), openedAt: daysAgo(4), attachOpenedAt: daysAgo(3), bounces: 0, offPlatform: true, matchCount: 1 },
  { id: 'b04', maskedName: 'Auto*** Parts Group', summary: '북미 애프터마켓에 자동차 부품을 유통하는 미시간 소재 그룹사입니다.', region: '미국 · 미시간', industry: '자동차부품', employees: '500명 이상', matchReason: 'IATF 16949 공급사 소싱 이력 + 카테고리 일치', grade: 'GOLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 1 },
  // ── SILVER (열람/첨부 신호) ──
  { id: 'b05', maskedName: 'Blu*** Filtration', summary: '플로리다에서 산업용 펌프·부품을 취급하는 전문 수입상입니다.', region: '미국 · 플로리다', industry: '기계요소', employees: '10~50명', matchReason: '산업 펌프 키워드 유사도 상위', grade: 'SILVER', status: 'opened', sentAt: daysAgo(4), openedAt: daysAgo(2), bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b06', maskedName: 'Ortho*** Devices', summary: '정형외과용 기기를 취급하는 동부 연안 의료기기 유통사입니다.', region: '미국 · 뉴저지', industry: '의료기기', employees: '50~200명', matchReason: 'ISO 13485 공급사 선호 + 카테고리 일치', grade: 'SILVER', status: 'none', bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b07', maskedName: 'Wes*** Automotive', summary: '서부 지역 정비 체인에 부품을 공급하는 캘리포니아 유통사입니다.', region: '미국 · 캘리포니아', industry: '자동차부품', employees: '200~500명', matchReason: '브레이크/샤시 카테고리 소싱 수요', grade: 'SILVER', status: 'sent', sentAt: daysAgo(13), bounces: 0, offPlatform: false, matchCount: 2 },
  { id: 'b08', maskedName: 'Cle*** Water Tech', summary: '지자체 인프라 배관 프로젝트를 수행하는 조지아 소재 엔지니어링사입니다.', region: '미국 · 조지아', industry: '기계요소', employees: '50~200명', matchReason: '배관 자재 조달 공고 이력', grade: 'SILVER', status: 'none', bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b09', maskedName: 'Dia*** Medical', summary: '진단기기 소모품을 수입하는 텍사스 소재 전문 업체입니다.', region: '미국 · 텍사스', industry: '의료기기', employees: '10~50명', matchReason: 'FDA 등록 + 진단 소모품 키워드 일치', grade: 'SILVER', status: 'none', bounces: 0, offPlatform: false, matchCount: 1 },
  // ── BRONZE (미검증 신규) ──
  { id: 'b10', maskedName: 'Ind*** Supply LLC', summary: '산업용 배관·밸브 자재를 취급하는 오하이오 종합 자재상입니다.', region: '미국 · 오하이오', industry: '기계요소', employees: '50~200명', matchReason: '배관 자재 카테고리 인접 + 신규 소싱 시그널', grade: 'BRONZE', status: 'sent', sentAt: daysAgo(8), bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b11', maskedName: 'Nor*** Components', summary: '자동차 전장 부품을 유통하는 노스캐롤라이나 업체입니다.', region: '미국 · 노스캐롤라이나', industry: '자동차부품', employees: '10~50명', matchReason: '전장 부품 카테고리 일치', grade: 'BRONZE', status: 'sent', sentAt: daysAgo(2), bounces: 0, offPlatform: false, matchCount: 1 },
  { id: 'b12', maskedName: 'Hyd*** Solutions', summary: '펌프·수압 설비를 취급하는 콜로라도 산업 설비사입니다.', region: '미국 · 콜로라도', industry: '기계요소', employees: '10~50명', matchReason: '펌프 설비 키워드 유사도', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b13', maskedName: 'Sur*** Instruments', summary: '수술용 기구를 수입·판매하는 펜실베이니아 의료기기사입니다.', region: '미국 · 펜실베이니아', industry: '의료기기', employees: '50~200명', matchReason: 'ISO 13485 카테고리 일치', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b14', maskedName: 'Pac*** Trading', summary: '아시아 제조사 소싱 경험이 있는 워싱턴 무역회사입니다.', region: '미국 · 워싱턴', industry: '자동차부품', employees: '10~50명', matchReason: '한국 공급사 거래 이력', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b15', maskedName: 'Gre*** Environmental', summary: '산업 설비 MRO 자재를 유통하는 오리건 업체입니다.', region: '미국 · 오리건', industry: '기계요소', employees: '50~200명', matchReason: 'MRO 자재 카테고리 일치', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b16', maskedName: 'Mid*** Motors Supply', summary: '중서부 딜러망에 부품을 공급하는 인디애나 유통사입니다.', region: '미국 · 인디애나', industry: '자동차부품', employees: '200~500명', matchReason: '애프터마켓 카테고리 일치', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b17', maskedName: 'Vit*** Health Products', summary: '홈케어 의료용품을 온라인 유통하는 애리조나 업체입니다.', region: '미국 · 애리조나', industry: '의료기기', employees: '10~50명', matchReason: '홈케어 카테고리 인접', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  { id: 'b18', maskedName: 'Fil*** Media Corp.', summary: '파스너·체결부품을 전문 취급하는 미네소타 업체입니다.', region: '미국 · 미네소타', industry: '기계요소', employees: '10~50명', matchReason: '파스너 키워드 유사도 상위', grade: 'BRONZE', status: 'none', bounces: 0, offPlatform: false, matchCount: 0 },
  // ── COLD (추천 제외 — UI 비노출, 관리자 데이터) ──
  { id: 'b19', maskedName: 'Sta*** Industrial', summary: '범용 산업재 유통사 — 3회 매칭 무반응.', region: '미국 · 켄터키', industry: '기계요소', employees: '50~200명', matchReason: '-', grade: 'COLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 3 },
  { id: 'b20', maskedName: 'Roc*** Auto Center', summary: '지역 정비 체인 — 3회 매칭 무반응.', region: '미국 · 유타', industry: '자동차부품', employees: '10~50명', matchReason: '-', grade: 'COLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 3 },
  { id: 'b21', maskedName: 'Bay*** Med Imports', summary: '소형 의료 수입상 — 4회 매칭 무반응.', region: '미국 · 메릴랜드', industry: '의료기기', employees: '10~50명', matchReason: '-', grade: 'COLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 4 },
  { id: 'b22', maskedName: 'Pla*** Water Co.', summary: '배관 자재상 — 3회 매칭 무반응.', region: '미국 · 네바다', industry: '기계요소', employees: '10~50명', matchReason: '-', grade: 'COLD', status: 'none', bounces: 0, offPlatform: false, matchCount: 3 },
  // ── DEAD (폐기 — UI 비노출) ──
  { id: 'b23', maskedName: 'Del*** Trading', summary: '5회 매칭 전부 무반응 — 폐기.', region: '미국 · 델라웨어', industry: '자동차부품', employees: '10~50명', matchReason: '-', grade: 'DEAD', status: 'none', bounces: 0, offPlatform: false, matchCount: 5 },
  { id: 'b24', maskedName: 'Sun*** Supplies', summary: '반송 2회 누적 — 이메일 무효 폐기.', region: '미국 · 뉴멕시코', industry: '의료기기', employees: '10~50명', matchReason: '-', grade: 'DEAD', status: 'none', bounces: 2, offPlatform: false, matchCount: 2 },
  { id: 'b25', maskedName: 'Old*** Waterworks', summary: '5회 매칭 전부 무반응 — 폐기.', region: '미국 · 미주리', industry: '기계요소', employees: '50~200명', matchReason: '-', grade: 'DEAD', status: 'none', bounces: 0, offPlatform: false, matchCount: 5 },
]

export const MOCK_BUYERS: Buyer[] = RAW.map(enrich)
