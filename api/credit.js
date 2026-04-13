/**
 * Vercel Serverless Function — 바이어 신용평가 프록시
 *
 * DNB_API_KEY 환경변수가 없으면 Mock 데이터 반환.
 * 있으면 D&B Direct+ API 실제 호출 (Phase B 구현 예정).
 *
 * Query params:
 *   company  {string}  회사명
 *   country  {string}  국가명 (옵션)
 *   idx      {number}  Mock 인덱스 (Mock 모드 전용)
 */

// SYNC: grade/risk 매핑은 src/App.jsx의 CREDIT_GRADE_COLOR와 동기화 유지 필요
const CREDIT_GRADES = ["AAA","AA","A+","A","BBB","BB","B","C","D"];
const CREDIT_GRADE_COLOR = {
  "AAA":"#34C759","AA":"#34C759","A+":"#34C759",
  "A":"#0A84FF","BBB":"#0A84FF",
  "BB":"#FF9F0A","B":"#FF9F0A",
  "C":"#FF453A","D":"#FF453A",
};
const CREDIT_GRADE_DIM = {
  "AAA":"rgba(52,199,89,0.15)","AA":"rgba(52,199,89,0.15)","A+":"rgba(52,199,89,0.15)",
  "A":"rgba(10,132,255,0.15)","BBB":"rgba(10,132,255,0.15)",
  "BB":"rgba(255,159,10,0.15)","B":"rgba(255,159,10,0.15)",
  "C":"rgba(255,69,58,0.15)","D":"rgba(255,69,58,0.15)",
};
const CREDIT_RISK = ["낮음","낮음","낮음","중간","중간","높음","높음","매우높음","매우높음"];
const CREDIT_RISK_COLOR = {
  "낮음":"#34C759","중간":"#FF9F0A","높음":"#FF453A","매우높음":"#FF453A",
};

function mockCredit(idx) {
  const i = Math.abs(parseInt(idx, 10) || 0) % CREDIT_GRADES.length;
  const grade = CREDIT_GRADES[i];
  const payScore = 95 - i * 9;
  const riskLevel = CREDIT_RISK[i];
  return {
    grade,
    payScore,
    riskLevel,
    gradeColor: CREDIT_GRADE_COLOR[grade],
    gradeDim: CREDIT_GRADE_DIM[grade],
    riskColor: CREDIT_RISK_COLOR[riskLevel],
    lastUpdated: "2025-03",
    source: "mock",
  };
}

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const requestOrigin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader("Content-Type", "application/json");

  const { company, country, idx } = req.query || {};

  // Mock 모드 (DNB_API_KEY 미설정)
  if (!process.env.DNB_API_KEY) {
    return res.status(200).json(mockCredit(idx));
  }

  // TODO (Phase B): D&B Direct+ 실제 연동
  // 1. POST https://plus.dnb.com/v2/token  (OAuth2 Client Credentials)
  // 2. GET  https://plus.dnb.com/v1/data/duns  (company entity search)
  // 3. GET  https://plus.dnb.com/v1/financialdata/duns  (credit & financial)
  // Phase B 구현 전까지 Mock fallback (위 D&B 호출 구현 후 try/catch로 감쌀 것)
  return res.status(200).json({ ...mockCredit(idx), source: "mock_until_phase_b" });
}
