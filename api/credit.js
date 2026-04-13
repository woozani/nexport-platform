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

const CREDIT_GRADES = ["AAA","AA","A+","A","BBB","BB","B","C","D"];
const CREDIT_GRADE_COLOR = {
  "AAA":"#34C759","AA":"#34C759","A+":"#34C759",
  "A":"#0A84FF","BBB":"#0A84FF",
  "BB":"#FF9F0A","B":"#FF9F0A",
  "C":"#FF453A","D":"#FF453A",
};
const CREDIT_RISK = ["낮음","낮음","낮음","중간","중간","높음","높음","매우높음","매우높음"];
const CREDIT_RISK_COLOR = {
  "낮음":"#34C759","중간":"#FF9F0A","높음":"#FF453A","매우높음":"#FF453A",
};

function mockCredit(idx) {
  const i = Math.abs(parseInt(idx) || 0) % CREDIT_GRADES.length;
  const grade = CREDIT_GRADES[i];
  const payScore = 95 - i * 9;
  const riskLevel = CREDIT_RISK[i];
  return {
    grade,
    payScore,
    riskLevel,
    gradeColor: CREDIT_GRADE_COLOR[grade],
    riskColor: CREDIT_RISK_COLOR[riskLevel],
    lastUpdated: "2025-03",
    source: "mock",
  };
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { company, country, idx } = req.query || {};

  // Mock 모드 (DNB_API_KEY 미설정)
  if (!process.env.DNB_API_KEY) {
    return res.status(200).json(mockCredit(idx));
  }

  // TODO (Phase B): D&B Direct+ 실제 연동
  // 1. POST https://plus.dnb.com/v2/token  (OAuth2 Client Credentials)
  // 2. GET  https://plus.dnb.com/v1/data/duns  (company entity search)
  // 3. GET  https://plus.dnb.com/v1/financialdata/duns  (credit & financial)
  try {
    // Phase B 구현 전까지 Mock fallback
    return res.status(200).json({ ...mockCredit(idx), source: "mock_until_phase_b" });
  } catch (e) {
    return res.status(500).json({ error: "D&B API 연결 오류: " + e.message });
  }
}
