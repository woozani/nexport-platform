# 바이어 신용평가 기능 설계 (Phase A)

**날짜**: 2026-04-13  
**작성자**: Jay (woozani) + Claude  
**상태**: 승인됨

---

## 배경 및 목적

NEXPORT 평가 피드백 중 **차별성** 항목에서 제안된 기능.  
해외 바이어의 신용평가 점수를 플랫폼 내에서 한눈에 확인할 수 있도록 하여,  
국내 제조사가 수출 전 미수채권 리스크를 사전에 인지하고 안전한 거래처를 선별할 수 있게 한다.

> K-SURE는 외부 공개 API 미제공 → D&B Direct+ API를 실제 연동 대상으로 설정.  
> Phase A에서는 Mock 데이터로 UI 완성 + D&B 프록시 엔드포인트 뼈대 구현.

---

## 범위 (Phase A)

### 포함
- 바이어 리스트 행에 신용등급 배지 인라인 표시
- `BuyerDetailPanel` 상단 신용평가 요약 카드 (3개 지표)
- `CreditBadge` 유틸 컴포넌트
- `generateBuyers()`에 Mock `creditInfo` 데이터 주입
- `api/credit.js` D&B 프록시 엔드포인트 뼈대
- `vite.config.js` 로컬 프록시 경로 추가

### 제외 (Phase B 이후)
- 실제 D&B API 키 발급 및 실제 호출
- 신용등급 기반 사이드바 필터
- 신용등급 기반 정렬
- 풀 리포트 (PAYDEX + 국가 리스크 + 업종 연체율 + 결제 조건 추천 + 보험 상품 안내)

---

## 데이터 구조

### creditInfo 스키마 (바이어 1명당)
```js
creditInfo: {
  grade: "A+",        // AAA | AA | A+ | A | BBB | BB | B | C | D
  payScore: 82,       // 0~100 (결제 이력 점수, PAYDEX 스타일)
  riskLevel: "낮음",  // 낮음 | 중간 | 높음 | 매우높음
  riskColor: "var(--green)",
  lastUpdated: "2025-03",
  source: "mock"      // "mock" | "dnb" — 실제 API 연동 시 "dnb"로 전환
}
```

### 등급 → 색상 매핑
| 등급 | 색상 변수 | 의미 |
|------|----------|------|
| AAA / AA / A+ | `var(--green)` | 우량 |
| A / BBB | `var(--blue)` | 양호 |
| BB / B | `var(--amber)` | 주의 |
| C / D | `var(--red)` | 위험 |

---

## UI 설계

### ① 바이어 리스트 행 — 신용등급 배지
- 위치: 매칭 스코어 컬럼 우측
- 형태: `CreditBadge` 컴포넌트 (등급 텍스트 + 배경색)
- 인터랙션: 마우스 오버 시 툴팁 → `"결제점수 {payScore} · 리스크 {riskLevel}"`

### ② BuyerDetailPanel 상단 — 신용평가 카드
- 위치: 바이어 기본 정보(회사명·국가·산업) 바로 아래, 기존 탭 위
- 레이아웃: 3컬럼 그리드 (신용등급 | 결제이력점수 | 미수채권 리스크)
- 스타일: `var(--bg-2)` 배경 + 등급 색상 좌측 3px border accent
- Mock 배지: `source === "mock"` 일 때 우상단에 "Mock 데이터" 레이블 표시
- 카드 접기/펼치기: 불필요 — 항상 노출 (3개 지표만으로 공간 최소)

---

## 파일 변경 계획

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `src/App.jsx` | 수정 | `generateBuyers()`에 `creditInfo` 추가 |
| `src/App.jsx` | 수정 | `CreditBadge` 컴포넌트 추가 |
| `src/App.jsx` | 수정 | 바이어 리스트 행에 배지 렌더링 |
| `src/App.jsx` | 수정 | `BuyerDetailPanel` 상단 신용평가 카드 삽입 |
| `api/credit.js` | 신규 생성 | D&B 프록시 엔드포인트 뼈대 |
| `vite.config.js` | 수정 | `/api/credit` 로컬 프록시 경로 추가 |

---

## D&B 프록시 엔드포인트 설계 (`api/credit.js`)

```js
// D&B API 키 있으면 실제 호출, 없으면 Mock 반환
export default async function handler(req, res) {
  const { company, country } = req.query;
  if (!process.env.DNB_API_KEY) {
    return res.json({ source: "mock", ...mockCredit(company, country) });
  }
  // TODO (Phase B): D&B Direct+ OAuth2 + entity search + credit score 실제 호출
}
```

- 환경 변수: `DNB_API_KEY` (없으면 자동 Mock fallback)
- Mock 함수: 회사명 해시 기반으로 결정론적 등급 생성 (새로고침해도 같은 값)

---

## 성공 기준

- [ ] 바이어 리스트에서 신용등급 배지가 각 행에 표시됨
- [ ] 배지 색상이 등급에 따라 정확히 구분됨
- [ ] BuyerDetailPanel 열면 상단에 신용평가 카드 표시됨
- [ ] 3개 지표(등급·점수·리스크) 모두 정상 렌더링
- [ ] `npm run build` 빌드 성공
- [ ] Mock 배지 표시됨 (source === "mock")
- [ ] `api/credit.js` 존재하고 DNB_API_KEY 없으면 Mock 반환

---

## Phase B 확장 포인트

- `creditInfo.source` 값으로 Mock/실제 데이터 자동 분기
- 신용평가 카드를 펼치면 풀 리포트 (PAYDEX, 국가 리스크, 업종 연체율, 추천 결제 조건, K-SURE 보험 안내)
- 사이드바 필터에 "신용등급" 항목 추가
- 신용등급 기준 정렬 옵션 추가
