# Buyer Credit Evaluation — Phase B Design Spec

**Date:** 2026-04-13  
**Feature:** Full Credit Report Card (탭 전환 + 풀 리포트 + K-SURE 추천 + 필터/정렬)  
**Builds on:** Phase A spec (`2026-04-13-buyer-credit-evaluation-design.md`)

---

## 1. Goal

Phase A에서 구현된 신용평가 배지(CreditBadge) + 요약 카드를 확장하여,
바이어 상세 패널에 **탭 기반 풀 리포트** (PAYDEX · 국가리스크 · 업종연체율 · 결제조건 · K-SURE 추천)를 제공한다.
또한 테이블에서 **신용등급 정렬**, 필터 패널에서 **신용등급 필터**를 지원한다.

---

## 2. Architecture & Component Structure

### 컴포넌트 변경 범위

```
App.jsx
├── mockCreditInfo(idx)           [수정] Phase B 필드 추가
├── CreditCard                   [신규] IIFE 대체 독립 컴포넌트
│   ├── state: activeTab ("요약" | "풀리포트")
│   ├── 요약 탭: 기존 3-metric 그리드 (Phase A 유지)
│   └── 풀리포트 탭:
│       ├── PaydexBar            인라인 서브컴포넌트
│       ├── RiskGrid             국가리스크 · 업종연체율
│       ├── PaymentConditionsRow 🟢🟡🔴 + 한줄 설명
│       └── KsureProductCards    K-SURE 추천 상품 카드
├── BuyerDetailPanel             [수정] IIFE → <CreditCard buyer={buyer}/>
├── BuyerTable 헤더              [수정] 신용등급 th에 sort 추가
├── sort 로직                    [수정] creditGrade 필드 sort 지원
├── FilterPanel                  [수정] 신용등급 FilterSection 추가
└── filters state                [수정] grades: [] 필드 추가
```

---

## 3. Data Schema — mockCreditInfo() 확장

### Phase A 유지 필드
```js
{ grade, payScore, riskLevel, gradeColor, gradeDim, riskColor, lastUpdated, source }
```

### Phase B 추가 필드
```js
{
  // PAYDEX 결제이력 점수 (0–100, D&B 기준)
  paydex: Number,           // 55 + (idx * 7) % 46  → 55–100

  // 국가 리스크
  countryRisk: String,      // "AAA" | "AA" | "A" | "BBB+" | "BB" | "B" | "CCC"
  countryRiskLabel: String, // "최우량" | "우량" | "안정" | "주의" | "위험"

  // 업종 평균 연체율
  industryDelinquency: Number, // 1.0 + (idx * 0.3) % 6.0  → 1.0–7.0

  // 결제 조건 평가 배열
  paymentConditions: [
    { label: String, status: "green"|"yellow"|"red", reason: String }
  ],

  // K-SURE 추천 상품 배열
  ksureProducts: [
    { name: String, coverage: String, fit: "high"|"medium", reason: String }
  ],
}
```

### 결정론적 생성 규칙

| 필드 | 공식 |
|------|------|
| `paydex` | `55 + (idx * 7) % 46` |
| `countryRisk` | gradeIdx 기준: 0-2→"A", 3-4→"BBB+", 5-6→"BB", 7-8→"B" |
| `countryRiskLabel` | "A"→"안정", "BBB+"→"주의", "BB"→"위험", "B"→"매우위험" |
| `industryDelinquency` | `parseFloat((1.0 + (idx * 0.3) % 6.0).toFixed(1))` |
| `paymentConditions` | grade + paydex 조합으로 status 결정 (아래 참고) |
| `ksureProducts` | riskLevel 기준 (아래 참고) |

**paymentConditions 생성 규칙 (항상 3개)**
```
gradeIdx <= 2 (A+이상):
  LC → green "AAA~A+ 등급 바이어에 적합"
  T/T선불 → green "리스크 최소화"
  DA/DP → yellow "업종 연체율 확인 권장"

gradeIdx 3-4 (A~BBB):
  LC → green "안정적 결제 이력 확인됨"
  T/T선불 → yellow "PAYDEX 80 미만 시 주의"
  DA/DP → red "BBB 등급 이하 지양 권장"

gradeIdx 5-6 (BB~B):
  LC → yellow "필수 아님, 협상 가능"
  T/T선불 → green "선불 조건 강력 권장"
  DA/DP → red "높은 미수채권 위험"

gradeIdx >= 7 (C~D):
  LC → red "발급 거절 가능성 높음"
  T/T선불 → green "유일한 안전 결제 수단"
  DA/DP → red "결제 불이행 위험 매우 높음"
```

**ksureProducts 생성 규칙**
```
riskLevel === "낮음":
  [] (빈 배열 — "현재 등급에서 보험 가입 불필요" 메시지 표시)

riskLevel === "중간":
  [{ name:"단기수출보험", coverage:"결제금액의 95%", fit:"medium",
     reason:"중간 등급 바이어 선택적 권장" }]

riskLevel === "높음" | "매우높음":
  [
    { name:"단기수출보험", coverage:"결제금액의 95%", fit:"high",
      reason:"BB 등급 이하 바이어 필수 권장" },
    { name:"중장기수출보험", coverage:"계약금액의 90%", fit:"medium",
      reason:"고위험 시장 장기 거래 보호" },
  ]
```

---

## 4. CreditCard 컴포넌트 설계

### Props
```jsx
function CreditCard({ buyer }) {
  // buyer.creditInfo: Phase A + Phase B 필드 포함
}
```

### 탭 구조
```
[요약] [풀 리포트]   ← 탭 바
```
- activeTab state: `"요약"` (기본값)
- 탭 전환: 즉시 (애니메이션 없음)
- 활성 탭: `borderBottom: "2px solid var(--blue)"`, `color: "var(--t1)"`
- 비활성 탭: `color: "var(--t3)"`

### 요약 탭 (Phase A 그대로)
기존 3-metric 그리드: 신용등급 / 결제이력점수 / 미수채권리스크

### 풀 리포트 탭

**① PAYDEX 바**
```
레이블: "PAYDEX 결제이력"
값: ci.paydex / 100
색상: paydex >= 80 → var(--green), >= 60 → var(--amber), < 60 → var(--red)
바 구현: 기존 ScoreBar 컴포넌트 재사용 (width: `${ci.paydex}%`)
```

**② 리스크 그리드 (2열)**
```
좌: 국가 리스크    ci.countryRisk + " " + ci.countryRiskLabel
우: 업종 연체율    ci.industryDelinquency + "%"
```

**③ 결제 조건 (3행)**
```
각 행: {icon} {label}   {reason}
icon: 🟢 = green, 🟡 = yellow, 🔴 = red
```

**④ K-SURE 추천 상품**
```
ksureProducts.length === 0:
  → "현재 등급에서 별도 보험 가입 불필요합니다." (회색 텍스트)

ksureProducts.length > 0:
  각 카드:
    배경: fit==="high" → var(--red-dim), fit==="medium" → var(--blue-dim)
    왼쪽 border: fit==="high" → 3px solid var(--red), fit==="medium" → 3px solid var(--blue)
    내용: name (bold) · coverage · reason
    배지: fit==="high" → "필수" (red), fit==="medium" → "선택" (blue)
```

---

## 5. BuyerTable — 신용등급 정렬

### sort.field 추가 값: `"creditGrade"`

정렬 로직: `CREDIT_GRADES` 배열의 index 순서 (`"AAA"`=0, `"D"`=8)
```js
// sort 로직 내 추가
if (sort.field === "creditGrade") {
  const ai = CREDIT_GRADES.indexOf(a.creditInfo?.grade ?? "D");
  const bi = CREDIT_GRADES.indexOf(b.creditInfo?.grade ?? "D");
  return sort.asc ? ai - bi : bi - ai;
}
```

### 신용등급 `<th>` 변경
현재: 정적 `<th>신용등급</th>`
변경: `onClick={() => toggleSort("creditGrade")}` + `<SortIcon field="creditGrade"/>`

---

## 6. FilterPanel — 신용등급 필터

### filters state 확장
```js
// 기존
{ industries:[], regions:[], sizes:[], certs:[], intents:[], regulations:[], scoreMin:0, scoreMax:100 }

// 추가
{ ...기존, grades: [] }
```

### FilterSection 추가 (신용등급 아이콘: Ic.Shield)
```
체크박스 목록: CREDIT_GRADES 전체 (AAA, AA, A+, A, BBB, BB, B, C, D)
```

### 필터 로직 추가
```js
if (filters.grades.length) {
  d = d.filter(b => filters.grades.includes(b.creditInfo?.grade));
}
```

### 활성 필터 칩 (기존 activeFilters 배열에 추가)
```js
...filters.grades.map(g => ({
  label: g,
  clear: () => setFilters(p => ({ ...p, grades: p.grades.filter(x => x !== g) }))
})),
```

---

## 7. 테스트 전략

이 프로젝트는 테스트 인프라 없는 단일 SPA이므로, 각 태스크 완료 후 **수동 시각 검증**:

| 체크 항목 | 방법 |
|-----------|------|
| 탭 전환 동작 | BuyerDetailPanel 열기 → 탭 클릭 |
| PAYDEX 바 색상 | paydex 55(red), 72(amber), 90(green) 바이어 비교 |
| 결제 조건 3행 | AAA vs D 등급 바이어 비교 |
| K-SURE 카드 | LOW/MEDIUM/HIGH riskLevel 각각 확인 |
| 신용등급 정렬 | 테이블 헤더 클릭 → ASC/DESC 확인 |
| 신용등급 필터 | "B" 선택 → B 등급 바이어만 표시 |
| 빌드 성공 | `npm run build` 0 오류 |

---

## 8. 파일 변경 요약

| 파일 | 변경 종류 | 예상 줄 수 |
|------|----------|-----------|
| `src/App.jsx` | mockCreditInfo 확장 +25줄, CreditCard 신규 +130줄, IIFE 제거 -35줄, th sort +5줄, sort 로직 +5줄, FilterSection +25줄, filters state +1줄, 필터 로직 +3줄, 활성칩 +3줄 | 순증 +~162줄 |

---

## 9. 완료 기준

- [ ] `npm run build` 성공
- [ ] 요약 ↔ 풀리포트 탭 전환 동작
- [ ] 풀리포트 4개 섹션 (PAYDEX, 리스크그리드, 결제조건, K-SURE) 렌더
- [ ] 신용등급 `<th>` 클릭 시 ASC/DESC 정렬
- [ ] 필터 패널에서 신용등급 체크 시 바이어 필터링
- [ ] mock 데이터 — 새로고침 시 동일한 값 유지 (결정론적)
