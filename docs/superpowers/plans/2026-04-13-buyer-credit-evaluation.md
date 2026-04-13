# 바이어 신용평가 기능 구현 플랜 (Phase A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 바이어 리스트 행에 신용등급 배지를 추가하고, BuyerDetailPanel 상단에 신용평가 요약 카드(신용등급·결제이력점수·미수채권리스크)를 삽입한다. Mock 데이터 기반으로 UI를 완성하고, D&B Direct+ API 연동을 위한 Serverless 프록시 엔드포인트 뼈대를 함께 세팅한다.

**Architecture:** App.jsx 단일 파일에 `mockCreditInfo()` 헬퍼와 `CreditBadge` 컴포넌트를 추가하고, `generateBuyers()`가 각 바이어에 `creditInfo` 객체를 포함하도록 수정한다. Vercel Serverless 함수 `api/credit.js`는 `DNB_API_KEY` 환경변수가 없으면 Mock을 반환하고, 있으면 D&B Direct+ REST API를 호출하는 뼈대 구조로 작성한다.

**Tech Stack:** React 18 + Vite 5, 인라인 CSS-in-JS (CSS 변수), Vercel Serverless Functions, D&B Direct+ API (뼈대만)

---

## 파일 변경 목록

| 파일 | 유형 | 변경 내용 |
|------|------|----------|
| `src/App.jsx` | 수정 | `mockCreditInfo()` 헬퍼 추가 (line ~207) |
| `src/App.jsx` | 수정 | `generateBuyers()`에 `creditInfo` 필드 추가 (line ~258) |
| `src/App.jsx` | 수정 | `CreditBadge` 컴포넌트 추가 (line ~338, Badge 컴포넌트 아래) |
| `src/App.jsx` | 수정 | 바이어 리스트 행 ScoreBar 다음 열에 CreditBadge 추가 (line ~4237) |
| `src/App.jsx` | 수정 | BuyerDetailPanel AI 매칭 점수 카드 아래에 신용평가 카드 삽입 (line ~526) |
| `api/credit.js` | 신규 | D&B 프록시 엔드포인트 뼈대 |
| `vite.config.js` | 수정 | `/api/credit` 로컬 미들웨어 추가 |

---

## Task 1: mockCreditInfo 헬퍼 함수 추가

**Files:**
- Modify: `src/App.jsx` — line 207 (generateBuyers 함수 바로 위)

- [ ] **Step 1: generateBuyers 위치 확인**

```bash
grep -n "function generateBuyers" src/App.jsx
```

Expected output: `209:function generateBuyers(n) {`

- [ ] **Step 2: mockCreditInfo 헬퍼를 generateBuyers 바로 위(line 208)에 삽입**

`src/App.jsx`의 `function generateBuyers(n) {` 바로 위에 다음 코드를 삽입:

```jsx
// ─────────── 신용평가 Mock 헬퍼 ───────────
const CREDIT_GRADES = ["AAA","AA","A+","A","BBB","BB","B","C","D"];
const CREDIT_GRADE_COLOR = {
  "AAA":"var(--green)","AA":"var(--green)","A+":"var(--green)",
  "A":"var(--blue)","BBB":"var(--blue)",
  "BB":"var(--amber)","B":"var(--amber)",
  "C":"var(--red)","D":"var(--red)",
};
const CREDIT_RISK = ["낮음","낮음","낮음","중간","중간","높음","높음","매우높음","매우높음"];
const CREDIT_RISK_COLOR = {
  "낮음":"var(--green)","중간":"var(--amber)","높음":"var(--red)","매우높음":"var(--red)",
};

function mockCreditInfo(idx) {
  // 인덱스 기반 결정론적 생성 — 새로고침해도 동일한 값 유지
  const gradeIdx = idx % CREDIT_GRADES.length;
  const grade = CREDIT_GRADES[gradeIdx];
  const payScore = 95 - gradeIdx * 9;  // AAA=95 … D=23
  const riskLevel = CREDIT_RISK[gradeIdx];
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
```

- [ ] **Step 3: 저장 후 파일 확인**

```bash
grep -n "mockCreditInfo\|CREDIT_GRADES" src/App.jsx | head -10
```

Expected: `mockCreditInfo` 함수와 `CREDIT_GRADES` 상수가 출력됨

---

## Task 2: generateBuyers에 creditInfo 필드 추가

**Files:**
- Modify: `src/App.jsx` — generateBuyers 함수 내 buyers.push() 블록

- [ ] **Step 1: buyers.push 마지막 필드 위치 확인**

```bash
grep -n "lastActive\|starred.*Math.random" src/App.jsx
```

Expected: `259:      lastActive: \`${Math.floor(Math.random()*30)+1}일 전\`,`

- [ ] **Step 2: `lastActive` 필드 다음 줄에 `creditInfo` 추가**

`src/App.jsx`의 `lastActive: ...` 라인을 찾아 다음과 같이 수정:

변경 전:
```jsx
      lastActive: `${Math.floor(Math.random()*30)+1}일 전`,
    });
```

변경 후:
```jsx
      lastActive: `${Math.floor(Math.random()*30)+1}일 전`,
      creditInfo: mockCreditInfo(i),
    });
```

- [ ] **Step 3: 저장 후 확인**

```bash
grep -n "creditInfo" src/App.jsx | head -5
```

Expected: `creditInfo: mockCreditInfo(i),` 라인 출력됨

---

## Task 3: CreditBadge 컴포넌트 추가

**Files:**
- Modify: `src/App.jsx` — line ~338 (기존 Badge 컴포넌트 바로 아래)

- [ ] **Step 1: Badge 컴포넌트 위치 확인**

```bash
grep -n "^const Badge" src/App.jsx
```

Expected: `335:const Badge = ({children, color="var(--blue)", bg}) => (`

- [ ] **Step 2: Badge 컴포넌트 블록 끝 위치 확인**

```bash
sed -n '335,338p' src/App.jsx
```

Expected:
```
335: const Badge = ({children, color="var(--blue)", bg}) => (
336:   <span style={{...}}>{children}</span>
337: );
338: (빈줄 또는 다음 컴포넌트)
```

- [ ] **Step 3: CreditBadge 컴포넌트를 Badge 바로 아래(line 338)에 삽입**

`src/App.jsx`의 `const Badge = ...` 블록(`;` 포함) 바로 다음에 삽입:

```jsx
const CreditBadge = ({ grade, gradeColor, payScore, riskLevel }) => (
  <div
    title={`결제점수 ${payScore} · 리스크 ${riskLevel}`}
    style={{
      display:"inline-flex", alignItems:"center", gap:3,
      padding:"2px 7px", borderRadius:4,
      background:`${gradeColor}18`,
      border:`1px solid ${gradeColor}40`,
      cursor:"default",
    }}
  >
    <span style={{fontSize:10, fontWeight:700, color:gradeColor, letterSpacing:".02em"}}>{grade}</span>
  </div>
);
```

- [ ] **Step 4: 저장 후 확인**

```bash
grep -n "CreditBadge" src/App.jsx | head -5
```

Expected: `const CreditBadge` 정의 라인 출력됨

---

## Task 4: 바이어 리스트 행에 CreditBadge 열 추가

**Files:**
- Modify: `src/App.jsx` — line ~4237 (ScoreBar 렌더링 위치)

- [ ] **Step 1: ScoreBar 렌더링 위치 확인**

```bash
grep -n "ScoreBar score={b.score}" src/App.jsx
```

Expected: `4237:                      <td style={{padding:"8px 10px"}}><ScoreBar score={b.score}/></td>`

- [ ] **Step 2: 테이블 헤더에 "신용등급" 컬럼 추가**

테이블 `<th>` 헤더 행에서 `매칭 점수` 헤더 다음에 신용등급 헤더를 추가.

먼저 헤더 위치 확인:
```bash
grep -n "매칭 점수\|th.*padding" src/App.jsx | head -20
```

"매칭 점수" `<th>` 셀을 찾아 바로 다음에 추가:

변경 전 (해당 `<th>` 셀):
```jsx
<th style={{...}}>매칭 점수</th>
```

변경 후:
```jsx
<th style={{...}}>매칭 점수</th>
<th style={{padding:"10px",fontSize:11,fontWeight:600,color:"var(--t3)",whiteSpace:"nowrap",textAlign:"left"}}>신용등급</th>
```

- [ ] **Step 3: 테이블 바디 행에 CreditBadge td 추가**

`<ScoreBar score={b.score}/>` `<td>` 다음에 삽입:

변경 전:
```jsx
<td style={{padding:"8px 10px"}}><ScoreBar score={b.score}/></td>
<td style={{padding:"8px 10px",fontSize:12,color:"var(--t2)"}}>{b.demand}</td>
```

변경 후:
```jsx
<td style={{padding:"8px 10px"}}><ScoreBar score={b.score}/></td>
<td style={{padding:"8px 10px"}}>
  {b.creditInfo && (
    <CreditBadge
      grade={b.creditInfo.grade}
      gradeColor={b.creditInfo.gradeColor}
      payScore={b.creditInfo.payScore}
      riskLevel={b.creditInfo.riskLevel}
    />
  )}
</td>
<td style={{padding:"8px 10px",fontSize:12,color:"var(--t2)"}}>{b.demand}</td>
```

- [ ] **Step 4: 저장 후 빌드 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -20
```

Expected: `✓ built in` 성공 메시지 (에러 없음)

- [ ] **Step 5: 중간 커밋**

```bash
git add src/App.jsx
git commit -m "feat: 바이어 리스트에 신용등급 배지 추가"
```

---

## Task 5: BuyerDetailPanel 상단에 신용평가 카드 삽입

**Files:**
- Modify: `src/App.jsx` — line ~526 (AI 매칭 점수 카드 다음)

- [ ] **Step 1: AI 매칭 점수 카드 끝 위치 확인**

```bash
grep -n "AI 매칭 점수\|산업 적합도.*인증" src/App.jsx | head -10
```

Expected: `523:              <div style={{fontSize:13,fontWeight:700}}>AI 매칭 점수</div>`

- [ ] **Step 2: AI 매칭 점수 카드 닫는 태그(</div>) 이후 위치 확인**

```bash
sed -n '524,530p' src/App.jsx
```

Expected:
```
524:              <div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>산업 적합도, 인증, 구매 이력 기반</div>
525:            </div>
526:          </div>
527:          <div style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:16}}>
527:            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:12,...}}>연락처</div>
```

- [ ] **Step 3: AI 매칭 점수 카드 닫는 `</div>` 바로 다음에 신용평가 카드 삽입**

`src/App.jsx`에서 AI 매칭 점수 카드가 끝나는 `</div>`(`{buyer.score}` 원형 그래프 + "AI 매칭 점수" 텍스트를 포함하는 카드)를 찾아 그 다음에 삽입:

변경 전:
```jsx
          </div>
          <div style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Ic.Mail s={13}/>연락처</div>
```

변경 후:
```jsx
          </div>
          {/* ── 신용평가 카드 ── */}
          {buyer.creditInfo && (() => {
            const ci = buyer.creditInfo;
            return (
              <div style={{
                padding:"14px 16px", borderRadius:10,
                background:"var(--bg-2)",
                border:"1px solid var(--border)",
                borderLeft:`3px solid ${ci.gradeColor}`,
                marginBottom:16,
              }}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",gap:6}}>
                    <Ic.Shield s={13}/>신용평가
                  </div>
                  {ci.source === "mock" && (
                    <span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:3,background:"var(--bg-4)",color:"var(--t4)"}}>Mock 데이터</span>
                  )}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
                  <div>
                    <div style={{fontSize:20,fontWeight:900,color:ci.gradeColor,fontFamily:"var(--mono)"}}>{ci.grade}</div>
                    <div style={{fontSize:10,color:"var(--t3)",marginTop:3,fontWeight:600}}>신용등급</div>
                  </div>
                  <div>
                    <div style={{fontSize:20,fontWeight:900,color:ci.gradeColor,fontFamily:"var(--mono)"}}>{ci.payScore}</div>
                    <div style={{fontSize:10,color:"var(--t3)",marginTop:3,fontWeight:600}}>결제이력점수</div>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:ci.riskColor}}>{ci.riskLevel}</div>
                    <div style={{fontSize:10,color:"var(--t3)",marginTop:3,fontWeight:600}}>미수채권리스크</div>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:10,color:"var(--t4)",textAlign:"right"}}>{ci.lastUpdated} 기준 · K-SURE/D&B 연계 예정</div>
              </div>
            );
          })()}
          <div style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Ic.Mail s={13}/>연락처</div>
```

- [ ] **Step 4: 저장 후 빌드 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -20
```

Expected: `✓ built in` 성공 메시지 (에러 없음)

- [ ] **Step 5: 중간 커밋**

```bash
git add src/App.jsx
git commit -m "feat: BuyerDetailPanel 신용평가 요약 카드 추가"
```

---

## Task 6: api/credit.js D&B 프록시 엔드포인트 생성

**Files:**
- Create: `api/credit.js`

- [ ] **Step 1: api 디렉토리 확인**

```bash
ls api/
```

Expected: `hunter.js` 가 보임

- [ ] **Step 2: `api/credit.js` 생성**

아래 내용으로 `api/credit.js` 파일을 새로 생성:

```js
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
```

- [ ] **Step 3: 파일 생성 확인**

```bash
ls api/ && head -5 api/credit.js
```

Expected: `credit.js hunter.js` 그리고 파일 상단 주석 출력

---

## Task 7: vite.config.js에 /api/credit 로컬 미들웨어 추가

**Files:**
- Modify: `vite.config.js` — hunter API 미들웨어 패턴과 동일하게 추가

- [ ] **Step 1: 기존 hunter 미들웨어 끝 위치 확인**

```bash
grep -n "hunter-api-dev\|server.middlewares.use" vite.config.js
```

Expected:
```
12:          name: 'hunter-api-dev',
14:          server.middlewares.use('/api/hunter', async (req, res) => {
```

- [ ] **Step 2: vite.config.js의 plugins 배열에 credit 미들웨어 플러그인 추가**

`vite.config.js`에서 hunter 플러그인 객체(`}` + `]` 닫기 직전, 기존 hunter 플러그인 `},` 다음)에 추가:

변경 전 (`plugins` 배열 끝 부분):
```js
      }
    }
  ],
  build: {
```

변경 후:
```js
      }
    },
    {
      name: 'credit-api-dev',
      configureServer(server) {
        server.middlewares.use('/api/credit', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          const url = new URL(req.url, 'http://localhost')
          const idx = url.searchParams.get('idx') || '0'
          const GRADES = ["AAA","AA","A+","A","BBB","BB","B","C","D"]
          const RISKS  = ["낮음","낮음","낮음","중간","중간","높음","높음","매우높음","매우높음"]
          const GRADE_COLOR = {
            "AAA":"#34C759","AA":"#34C759","A+":"#34C759",
            "A":"#0A84FF","BBB":"#0A84FF",
            "BB":"#FF9F0A","B":"#FF9F0A",
            "C":"#FF453A","D":"#FF453A",
          }
          const RISK_COLOR = { "낮음":"#34C759","중간":"#FF9F0A","높음":"#FF453A","매우높음":"#FF453A" }
          const i = Math.abs(parseInt(idx) || 0) % GRADES.length
          const grade = GRADES[i]
          const riskLevel = RISKS[i]
          res.end(JSON.stringify({
            grade, payScore: 95 - i * 9, riskLevel,
            gradeColor: GRADE_COLOR[grade], riskColor: RISK_COLOR[riskLevel],
            lastUpdated: "2025-03", source: "mock",
          }))
        })
      }
    }
  ],
  build: {
```

- [ ] **Step 3: 저장 후 빌드 최종 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -20
```

Expected: `✓ built in` 성공 메시지

---

## Task 8: 최종 검증 및 커밋·푸시·PR

- [ ] **Step 1: preview 서버 실행**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run preview
```

Expected: `http://localhost:4173` 에서 서버 실행

- [ ] **Step 2: 수동 검증 체크리스트**

브라우저에서 `http://localhost:4173` 접속 후:
- [ ] 바이어 리스트 테이블에 "신용등급" 컬럼이 보임
- [ ] 각 행에 `AAA` / `A+` / `BB` 등 신용등급 배지가 색상으로 표시됨
- [ ] 배지에 마우스 오버 시 `결제점수 82 · 리스크 낮음` 형태 툴팁 표시
- [ ] 바이어 행 클릭 → BuyerDetailPanel 열림 → AI 매칭 점수 카드 바로 아래에 신용평가 카드 표시
- [ ] 신용평가 카드에 신용등급·결제이력점수·미수채권리스크 3개 지표 표시
- [ ] 신용평가 카드 우상단에 "Mock 데이터" 레이블 표시
- [ ] 카드 왼쪽 보더 색상이 등급 색상과 일치
- [ ] `api/credit.js` 파일 존재

- [ ] **Step 3: preview 서버 종료 후 최종 커밋**

```bash
git add src/App.jsx api/credit.js vite.config.js
git commit -m "feat: 바이어 신용평가 기능 추가 (Phase A) — 리스트 배지 + 상세 카드 + D&B 프록시 뼈대"
```

- [ ] **Step 4: 브랜치 푸시 및 PR 생성**

```bash
git push origin HEAD
```

PR이 없는 경우:
```bash
gh pr create \
  --title "feat: 바이어 신용평가 기능 Phase A" \
  --body "$(cat <<'EOF'
## 변경 사항
- 바이어 리스트 테이블에 신용등급 배지 컬럼 추가
- BuyerDetailPanel 상단에 신용평가 요약 카드 삽입 (신용등급·결제이력점수·미수채권리스크)
- Mock 데이터 기반 구현 (D&B API 키 없으면 자동 Mock fallback)
- `api/credit.js` D&B Direct+ 프록시 뼈대 생성
- `vite.config.js` `/api/credit` 로컬 미들웨어 추가

## 검증
- [ ] 빌드 성공 (`npm run build`)
- [ ] 바이어 리스트 신용등급 배지 정상 표시
- [ ] BuyerDetailPanel 신용평가 카드 정상 표시
- [ ] Mock 데이터 배지 표시 확인

## Phase B 확장 포인트
- `DNB_API_KEY` 환경변수 설정 시 D&B Direct+ 실제 연동
- 신용등급 사이드바 필터 추가
- 풀 리포트 (PAYDEX, 국가 리스크, 추천 결제 조건, K-SURE 보험 안내)
EOF
)"
```

---

## 성공 기준 최종 확인

- [ ] `npm run build` 빌드 성공
- [ ] 바이어 리스트에 "신용등급" 컬럼과 CreditBadge 렌더링
- [ ] BuyerDetailPanel에 신용평가 카드 (3개 지표)
- [ ] Mock 배지 표시 (`source === "mock"`)
- [ ] 카드 좌측 보더 색상 = 등급 색상
- [ ] `api/credit.js` 파일 생성 및 Mock fallback 동작
- [ ] PR 생성 완료
