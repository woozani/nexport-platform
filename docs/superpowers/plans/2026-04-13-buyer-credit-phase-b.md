# Buyer Credit Phase B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BuyerDetailPanel의 신용평가 카드를 탭 기반 독립 CreditCard 컴포넌트로 교체하고, 풀 리포트(PAYDEX·국가리스크·결제조건·K-SURE 추천)와 신용등급 필터/정렬을 추가한다.

**Architecture:** `src/App.jsx` 단일 파일 SPA. Phase A에서 추가된 IIFE 패턴 신용카드 블록(lines 581-616)을 독립 `CreditCard` 컴포넌트로 교체하고, `mockCreditInfo()`에 Phase B 필드를 추가한다. 필터는 `filters.grades` 배열 확장, 정렬은 기존 `toggleSort` + `sort.field === "creditGrade"` 분기 추가.

**Tech Stack:** React 18, Vite 5, inline CSS-in-JS (CSS 변수), 기존 `ScoreBar`·`FilterSection`·`SortIcon` 패턴 재사용

---

## File Map

| 파일 | 변경 내용 |
|------|----------|
| `src/App.jsx` | 모든 변경 (mockCreditInfo 확장, CreditCard 신규, BuyerDetailPanel 교체, sort 로직, FilterSection, filters state) |

> ⚠️ App.jsx는 ~4500줄 단일 파일. 각 태스크 전 반드시 Grep으로 대상 라인 확인 후 Edit.

---

## Task 1: mockCreditInfo() — Phase B 필드 추가

**Files:**
- Modify: `src/App.jsx` (mockCreditInfo 함수, lines ~227-244)

배경: 현재 `mockCreditInfo(idx)`는 Phase A 필드만 반환한다. Phase B 풀리포트에 필요한 `paydex`, `countryRisk`, `countryRiskLabel`, `industryDelinquency`, `paymentConditions`, `ksureProducts`를 추가한다.

- [ ] **Step 1: Grep으로 mockCreditInfo 위치 확인**

```bash
grep -n "function mockCreditInfo" src/App.jsx
```

Expected output: `227:function mockCreditInfo(idx) {` (라인 번호는 다를 수 있음)

- [ ] **Step 2: mockCreditInfo 함수를 아래 코드로 교체**

기존 `function mockCreditInfo(idx) { ... }` 블록 전체를 다음으로 교체:

```js
function mockCreditInfo(idx) {
  // 인덱스 기반 결정론적 생성 — 새로고침해도 동일한 값 유지
  const gradeIdx = Math.abs(idx % CREDIT_GRADES.length);
  const grade = CREDIT_GRADES[gradeIdx];
  const payScore = 95 - gradeIdx * 9;  // AAA=95 … D=23
  const riskLevel = CREDIT_RISK[gradeIdx];
  const gradeEntry = CREDIT_GRADE_COLOR[grade];

  // Phase B: PAYDEX
  const paydex = 55 + (idx * 7) % 46;  // 55–100

  // Phase B: 국가 리스크
  const countryRiskMap = [
    { risk:"A",    label:"안정"   },  // gradeIdx 0-2
    { risk:"A",    label:"안정"   },
    { risk:"A",    label:"안정"   },
    { risk:"BBB+", label:"주의"   },  // gradeIdx 3-4
    { risk:"BBB+", label:"주의"   },
    { risk:"BB",   label:"위험"   },  // gradeIdx 5-6
    { risk:"BB",   label:"위험"   },
    { risk:"B",    label:"매우위험" }, // gradeIdx 7-8
    { risk:"B",    label:"매우위험" },
  ];
  const countryRisk = countryRiskMap[gradeIdx].risk;
  const countryRiskLabel = countryRiskMap[gradeIdx].label;

  // Phase B: 업종 연체율
  const industryDelinquency = parseFloat((1.0 + (idx * 0.3) % 6.0).toFixed(1));

  // Phase B: 결제 조건 (항상 3개)
  const paymentConditionsMap = [
    // gradeIdx 0-2 (AAA~A+)
    [
      { label:"신용장(LC)",  status:"green",  reason:"AAA~A+ 등급 바이어에 적합" },
      { label:"T/T 선불",   status:"green",  reason:"리스크 최소화" },
      { label:"DA/DP",      status:"yellow", reason:"업종 연체율 확인 권장" },
    ],
    [
      { label:"신용장(LC)",  status:"green",  reason:"AAA~A+ 등급 바이어에 적합" },
      { label:"T/T 선불",   status:"green",  reason:"리스크 최소화" },
      { label:"DA/DP",      status:"yellow", reason:"업종 연체율 확인 권장" },
    ],
    [
      { label:"신용장(LC)",  status:"green",  reason:"AAA~A+ 등급 바이어에 적합" },
      { label:"T/T 선불",   status:"green",  reason:"리스크 최소화" },
      { label:"DA/DP",      status:"yellow", reason:"업종 연체율 확인 권장" },
    ],
    // gradeIdx 3-4 (A~BBB)
    [
      { label:"신용장(LC)",  status:"green",  reason:"안정적 결제 이력 확인됨" },
      { label:"T/T 선불",   status:"yellow", reason:"PAYDEX 80 미만 시 주의" },
      { label:"DA/DP",      status:"red",    reason:"BBB 등급 이하 지양 권장" },
    ],
    [
      { label:"신용장(LC)",  status:"green",  reason:"안정적 결제 이력 확인됨" },
      { label:"T/T 선불",   status:"yellow", reason:"PAYDEX 80 미만 시 주의" },
      { label:"DA/DP",      status:"red",    reason:"BBB 등급 이하 지양 권장" },
    ],
    // gradeIdx 5-6 (BB~B)
    [
      { label:"신용장(LC)",  status:"yellow", reason:"필수 아님, 협상 가능" },
      { label:"T/T 선불",   status:"green",  reason:"선불 조건 강력 권장" },
      { label:"DA/DP",      status:"red",    reason:"높은 미수채권 위험" },
    ],
    [
      { label:"신용장(LC)",  status:"yellow", reason:"필수 아님, 협상 가능" },
      { label:"T/T 선불",   status:"green",  reason:"선불 조건 강력 권장" },
      { label:"DA/DP",      status:"red",    reason:"높은 미수채권 위험" },
    ],
    // gradeIdx 7-8 (C~D)
    [
      { label:"신용장(LC)",  status:"red",    reason:"발급 거절 가능성 높음" },
      { label:"T/T 선불",   status:"green",  reason:"유일한 안전 결제 수단" },
      { label:"DA/DP",      status:"red",    reason:"결제 불이행 위험 매우 높음" },
    ],
    [
      { label:"신용장(LC)",  status:"red",    reason:"발급 거절 가능성 높음" },
      { label:"T/T 선불",   status:"green",  reason:"유일한 안전 결제 수단" },
      { label:"DA/DP",      status:"red",    reason:"결제 불이행 위험 매우 높음" },
    ],
  ];
  const paymentConditions = paymentConditionsMap[gradeIdx];

  // Phase B: K-SURE 추천 상품
  let ksureProducts = [];
  if (riskLevel === "중간") {
    ksureProducts = [
      { name:"단기수출보험", coverage:"결제금액의 95%", fit:"medium", reason:"중간 등급 바이어 선택적 권장" },
    ];
  } else if (riskLevel === "높음" || riskLevel === "매우높음") {
    ksureProducts = [
      { name:"단기수출보험", coverage:"결제금액의 95%", fit:"high",   reason:"BB 등급 이하 바이어 필수 권장" },
      { name:"중장기수출보험", coverage:"계약금액의 90%", fit:"medium", reason:"고위험 시장 장기 거래 보호" },
    ];
  }

  return {
    grade,
    payScore,
    riskLevel,
    gradeColor: gradeEntry.color,
    gradeDim: gradeEntry.dim,
    riskColor: CREDIT_RISK_COLOR[riskLevel],
    lastUpdated: "2025-03",
    source: "mock",
    // Phase B
    paydex,
    countryRisk,
    countryRiskLabel,
    industryDelinquency,
    paymentConditions,
    ksureProducts,
  };
}
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` 메시지, 0 errors

- [ ] **Step 4: 커밋**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && git add src/App.jsx && git commit -m "feat: mockCreditInfo Phase B 필드 추가 (paydex·countryRisk·결제조건·K-SURE)"
```

---

## Task 2: CreditCard 독립 컴포넌트 추가

**Files:**
- Modify: `src/App.jsx` (CreditBadge 컴포넌트 직후에 CreditCard 추가)

배경: 현재 BuyerDetailPanel의 신용카드는 IIFE 패턴(~line 581)으로 인라인 구현되어 있다. Phase B에서 탭 state가 필요하므로 독립 컴포넌트로 분리한다.

- [ ] **Step 1: CreditBadge 컴포넌트 위치 확인**

```bash
grep -n "const CreditBadge" src/App.jsx
```

`CreditBadge` 컴포넌트 닫는 괄호(`;`) 바로 다음 줄에 `CreditCard`를 삽입할 것.

- [ ] **Step 2: CreditBadge 닫는 줄 바로 뒤에 CreditCard 컴포넌트 삽입**

CreditBadge 정의 끝 (`);` 줄) 다음에 다음 코드를 삽입:

```jsx
const PAYDEX_COLOR = (v) => v >= 80 ? "var(--green)" : v >= 60 ? "var(--amber)" : "var(--red)";
const PC_ICON = { green:"🟢", yellow:"🟡", red:"🔴" };

const CreditCard = ({ buyer }) => {
  const ci = buyer.creditInfo;
  if (!ci) return null;
  const [activeTab, setActiveTab] = React.useState("요약");
  const tabStyle = (t) => ({
    padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer",
    borderBottom: activeTab===t ? "2px solid var(--blue)" : "2px solid transparent",
    color: activeTab===t ? "var(--t1)" : "var(--t3)",
    background:"none", border:"none", borderBottomWidth:2,
    borderBottomStyle:"solid",
    borderBottomColor: activeTab===t ? "var(--blue)" : "transparent",
  });
  return (
    <div style={{
      padding:"14px 16px", borderRadius:10,
      background:"var(--bg-2)", border:"1px solid var(--border)",
      borderLeft:`3px solid ${ci.gradeColor}`, marginBottom:16,
    }}>
      {/* 헤더 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",gap:6}}>
          <Ic.Shield s={13}/>신용평가
        </div>
        {ci.source === "mock" && (
          <span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:3,background:"var(--bg-4)",color:"var(--t4)"}}>Mock 데이터</span>
        )}
      </div>
      {/* 탭 바 */}
      <div style={{display:"flex",gap:0,marginBottom:12,borderBottom:"1px solid var(--border)"}}>
        {["요약","풀 리포트"].map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={tabStyle(t)}>{t}</button>
        ))}
      </div>
      {/* 요약 탭 */}
      {activeTab === "요약" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
          <div style={{minWidth:0,overflow:"hidden"}}>
            <div style={{fontSize:20,fontWeight:900,color:ci.gradeColor,fontFamily:"var(--mono)"}}>{ci.grade}</div>
            <div style={{fontSize:10,color:"var(--t3)",marginTop:3,fontWeight:600}}>신용등급</div>
          </div>
          <div style={{minWidth:0,overflow:"hidden"}}>
            <div style={{fontSize:20,fontWeight:900,color:ci.gradeColor,fontFamily:"var(--mono)"}}>{ci.payScore}</div>
            <div style={{fontSize:10,color:"var(--t3)",marginTop:3,fontWeight:600}}>결제이력점수</div>
          </div>
          <div style={{minWidth:0,overflow:"hidden"}}>
            <div style={{fontSize:14,fontWeight:800,color:ci.riskColor}}>{ci.riskLevel}</div>
            <div style={{fontSize:10,color:"var(--t3)",marginTop:3,fontWeight:600}}>미수채권리스크</div>
          </div>
        </div>
      )}
      {/* 풀 리포트 탭 */}
      {activeTab === "풀 리포트" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* PAYDEX */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:10,fontWeight:700,color:"var(--t3)"}}>PAYDEX 결제이력</span>
              <span style={{fontSize:13,fontWeight:900,color:PAYDEX_COLOR(ci.paydex),fontFamily:"var(--mono)"}}>{ci.paydex}<span style={{fontSize:9,color:"var(--t4)"}}>/100</span></span>
            </div>
            <div style={{height:6,borderRadius:3,background:"var(--bg-4)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${ci.paydex}%`,background:PAYDEX_COLOR(ci.paydex),borderRadius:3,transition:"width .4s ease"}}/>
            </div>
          </div>
          {/* 리스크 그리드 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:"var(--bg-3)",borderRadius:6,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:"var(--t4)",fontWeight:600,marginBottom:3}}>국가 리스크</div>
              <div style={{fontSize:13,fontWeight:800,color:"var(--t1)"}}>{ci.countryRisk} <span style={{fontSize:10,color:"var(--t3)"}}>{ci.countryRiskLabel}</span></div>
            </div>
            <div style={{background:"var(--bg-3)",borderRadius:6,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:"var(--t4)",fontWeight:600,marginBottom:3}}>업종 연체율</div>
              <div style={{fontSize:13,fontWeight:800,color:"var(--t1)"}}>{ci.industryDelinquency}<span style={{fontSize:10,color:"var(--t3)"}}> %</span></div>
            </div>
          </div>
          {/* 결제 조건 */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"var(--t3)",marginBottom:6}}>결제 조건</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {ci.paymentConditions.map((pc,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:11}}>
                  <span style={{fontSize:13}}>{PC_ICON[pc.status]}</span>
                  <span style={{fontWeight:700,color:"var(--t2)",minWidth:72}}>{pc.label}</span>
                  <span style={{color:"var(--t3)"}}>{pc.reason}</span>
                </div>
              ))}
            </div>
          </div>
          {/* K-SURE 추천 */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"var(--t3)",marginBottom:6}}>K-SURE 추천 상품</div>
            {ci.ksureProducts.length === 0 ? (
              <div style={{fontSize:11,color:"var(--t4)",padding:"8px 0"}}>현재 등급에서 별도 보험 가입 불필요합니다.</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {ci.ksureProducts.map((p,i)=>(
                  <div key={i} style={{
                    padding:"8px 10px", borderRadius:6,
                    background: p.fit==="high" ? "var(--red-dim)" : "var(--blue-dim)",
                    borderLeft: `3px solid ${p.fit==="high" ? "var(--red)" : "var(--blue)"}`,
                    display:"flex",alignItems:"flex-start",gap:8,
                  }}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <span style={{fontSize:12,fontWeight:800,color:"var(--t1)"}}>{p.name}</span>
                        <span style={{
                          fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:3,
                          background: p.fit==="high" ? "var(--red)" : "var(--blue)",
                          color:"#fff"
                        }}>{p.fit==="high"?"필수":"선택"}</span>
                      </div>
                      <div style={{fontSize:10,color:"var(--t3)",marginBottom:1}}>{p.coverage}</div>
                      <div style={{fontSize:10,color:"var(--t4)"}}>{p.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{marginTop:10,fontSize:10,color:"var(--t4)",textAlign:"right"}}>{ci.lastUpdated} 기준 · K-SURE/D&B 연계 예정</div>
    </div>
  );
};
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -5
```

Expected: `✓ built in`, 0 errors

- [ ] **Step 4: 커밋**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && git add src/App.jsx && git commit -m "feat: CreditCard 독립 컴포넌트 추가 (탭 + 풀리포트)"
```

---

## Task 3: BuyerDetailPanel — IIFE 제거 후 CreditCard 교체

**Files:**
- Modify: `src/App.jsx` (BuyerDetailPanel의 신용평가 IIFE 블록)

배경: `{buyer.creditInfo && (() => { ... })()}` IIFE 패턴(~line 581)을 `<CreditCard buyer={buyer} />`로 교체한다.

- [ ] **Step 1: IIFE 블록 위치 확인**

```bash
grep -n "신용평가 카드\|buyer.creditInfo && (() =>" src/App.jsx
```

Expected 라인 번호 기록.

- [ ] **Step 2: IIFE 블록 전체를 교체**

아래 패턴을 찾아:
```jsx
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
```

IIFE 블록 전체(`{buyer.creditInfo && (() => { ... })()}`)를 다음으로 교체:

```jsx
          {/* ── 신용평가 카드 ── */}
          <CreditCard buyer={buyer} />
```

> ⚠️ IIFE 블록 끝은 `})()}` 로 끝남. 전체 블록 범위를 Grep/Read로 확인 후 Edit.

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -5
```

Expected: `✓ built in`, 0 errors

- [ ] **Step 4: 시각 검증 (npm run preview)**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run preview &
```

바이어 클릭 → 신용평가 카드 탭 전환 확인:
- "요약" 탭: 3-metric 그리드 표시
- "풀 리포트" 탭: PAYDEX 바 + 리스크 그리드 + 결제조건 + K-SURE 카드 표시

- [ ] **Step 5: 커밋**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && git add src/App.jsx && git commit -m "feat: BuyerDetailPanel IIFE → CreditCard 컴포넌트 교체"
```

---

## Task 4: 신용등급 정렬 지원

**Files:**
- Modify: `src/App.jsx` (sort 로직 + 신용등급 `<th>`)

배경: 현재 신용등급 `<th>`는 정적이다. `toggleSort("creditGrade")`를 연결하고 sort 로직에 `CREDIT_GRADES` index 기반 정렬을 추가한다.

- [ ] **Step 1: sort 로직 위치 확인**

```bash
grep -n "sort\.field\|va = a\[sort" src/App.jsx | head -10
```

Expected: `d.sort((a, b) => { let va = a[sort.field] ...` 형태의 라인

- [ ] **Step 2: sort 로직에 creditGrade 분기 추가**

기존 sort 블록:
```js
    d.sort((a, b) => {
      let va = a[sort.field], vb = b[sort.field];
      if (typeof va === "string") return sort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sort.asc ? va - vb : vb - va;
    });
```

다음으로 교체:
```js
    d.sort((a, b) => {
      if (sort.field === "creditGrade") {
        const ai = CREDIT_GRADES.indexOf(a.creditInfo?.grade ?? "D");
        const bi = CREDIT_GRADES.indexOf(b.creditInfo?.grade ?? "D");
        return sort.asc ? ai - bi : bi - ai;
      }
      let va = a[sort.field], vb = b[sort.field];
      if (typeof va === "string") return sort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sort.asc ? va - vb : vb - va;
    });
```

- [ ] **Step 3: 신용등급 `<th>` 정적 → 클릭 가능으로 변경**

현재 (`<th style={{...}}>신용등급</th>`) 를 찾아서:

```bash
grep -n "신용등급</th>\|신용등급.*th" src/App.jsx | head -5
```

다음으로 교체:

```jsx
                  <th onClick={()=>toggleSort("creditGrade")} style={{
                    padding:"8px 10px",fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",
                    letterSpacing:".08em",textAlign:"left",cursor:"pointer",whiteSpace:"nowrap",
                    width:90,borderBottom:"1px solid var(--border)",userSelect:"none"
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      신용등급<span style={{color:sort.field==="creditGrade"?"var(--blue)":"var(--t4)"}}><SortIcon field="creditGrade"/></span>
                    </div>
                  </th>
```

- [ ] **Step 4: 빌드 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -5
```

Expected: `✓ built in`, 0 errors

- [ ] **Step 5: 커밋**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && git add src/App.jsx && git commit -m "feat: 신용등급 컬럼 정렬 지원 (ASC/DESC)"
```

---

## Task 5: 신용등급 필터 추가

**Files:**
- Modify: `src/App.jsx` (filters state, FilterPanel, 필터 로직, 활성 칩)

배경: 기존 `filters` state에 `grades: []`를 추가하고, FilterPanel에 신용등급 FilterSection을 추가하며, 필터 로직과 활성 칩을 연결한다.

- [ ] **Step 1: filters 초기 state 위치 확인**

```bash
grep -n "industries:\[\]" src/App.jsx | head -3
```

- [ ] **Step 2: filters 초기 state에 grades 추가**

`grades: []` 필드를 기존 filters state 객체에 추가.

예시 — 기존:
```js
  const [filters, setFilters] = useState({
    industries:[], regions:[], sizes:[], certs:[], intents:[], regulations:[],
    scoreMin:0, scoreMax:100,
  });
```

변경 후:
```js
  const [filters, setFilters] = useState({
    industries:[], regions:[], sizes:[], certs:[], intents:[], regulations:[],
    grades:[],
    scoreMin:0, scoreMax:100,
  });
```

- [ ] **Step 3: 필터 로직에 grades 분기 추가**

`filters.regulations` 필터 로직 바로 뒤에 추가:

```js
    if (filters.grades.length) d = d.filter(b => filters.grades.includes(b.creditInfo?.grade));
```

- [ ] **Step 4: FilterPanel에 신용등급 FilterSection 추가**

기존 FilterSection 중 마지막 (`매칭점수` FilterSection) 바로 앞에 추가:

```bash
grep -n "매칭점수.*FilterSection\|FilterSection.*매칭" src/App.jsx | head -3
```

`매칭점수` FilterSection 바로 앞에 삽입:

```jsx
        <FilterSection title="신용등급" icon={Ic.Shield}>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {CREDIT_GRADES.map(g=>(
              <label key={g} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",
                padding:"2px 6px",borderRadius:4,fontSize:11,fontWeight:600,
                background: filters.grades.includes(g) ? CREDIT_GRADE_COLOR[g].dim : "transparent",
                color: filters.grades.includes(g) ? CREDIT_GRADE_COLOR[g].color : "var(--t3)",
                border: `1px solid ${filters.grades.includes(g) ? CREDIT_GRADE_COLOR[g].color+"60" : "var(--border)"}`,
              }}>
                <input type="checkbox" style={{display:"none"}}
                  checked={filters.grades.includes(g)}
                  onChange={()=>setFilters(p=>({...p,grades:p.grades.includes(g)?p.grades.filter(x=>x!==g):[...p.grades,g]}))}
                />
                {g}
              </label>
            ))}
          </div>
        </FilterSection>
```

- [ ] **Step 5: 활성 필터 칩(activeFilters)에 grades 추가**

```bash
grep -n "activeFilters\|filters\.regulations\.map\|filters\.industries\.map" src/App.jsx | head -5
```

기존 `activeFilters` 배열 spread 마지막에 추가:

```js
    ...filters.grades.map(g => ({label:g, clear:()=>setFilters(p=>({...p,grades:p.grades.filter(x=>x!==g)}))})),
```

- [ ] **Step 6: 빌드 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -5
```

Expected: `✓ built in`, 0 errors

- [ ] **Step 7: 커밋**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && git add src/App.jsx && git commit -m "feat: 신용등급 필터 추가 (FilterPanel + 활성 칩)"
```

---

## Task 6: 최종 검증 및 PR

**Files:**
- `src/App.jsx` (최종 확인)

- [ ] **Step 1: 전체 빌드 최종 확인**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run build 2>&1 | tail -10
```

Expected: `✓ built in`, 0 errors, 0 warnings (이미지/font 경고 제외)

- [ ] **Step 2: 시각 체크리스트 (npm run preview로 확인)**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && npm run preview
```

| 항목 | 확인 방법 |
|------|----------|
| 탭 전환 | 바이어 클릭 → "풀 리포트" 탭 클릭 |
| PAYDEX 바 색상 | gradeIdx 0(AAA, paydex 높음=green), gradeIdx 7(C, paydex 낮음=red) |
| 결제조건 3행 | AAA=🟢🟢🟡, D=🔴🟢🔴 |
| K-SURE 카드 | riskLevel=낮음→"불필요", 중간→1카드, 높음→2카드 |
| 신용등급 정렬 | 테이블 헤더 "신용등급" 클릭 → ASC/DESC |
| 신용등급 필터 | 필터 패널 → "B" 클릭 → B 등급 바이어만 |

- [ ] **Step 3: feature 브랜치 확인 및 PR 생성**

```bash
cd /Users/jayjang/Downloads/nexport-deploy && git branch --show-current
```

현재 브랜치가 `main`이 아닌 경우 → PR 생성:

```bash
git push origin $(git branch --show-current)
gh pr create \
  --title "feat: 신용평가 Phase B — 풀 리포트 + K-SURE 추천 + 필터/정렬" \
  --body "$(cat <<'EOF'
## 변경 사항

- **CreditCard 컴포넌트**: IIFE 패턴 → 탭 기반 독립 컴포넌트
- **풀 리포트 탭**: PAYDEX 바, 국가리스크/업종연체율 그리드, 결제조건 🟢🟡🔴, K-SURE 추천 상품
- **신용등급 정렬**: 테이블 헤더 클릭 → ASC/DESC
- **신용등급 필터**: 필터 패널에서 등급별 필터링
- **Mock 데이터 확장**: paydex · countryRisk · paymentConditions · ksureProducts

## 테스트

- [ ] `npm run build` 성공 확인
- [ ] 요약 ↔ 풀 리포트 탭 전환
- [ ] 풀 리포트 4개 섹션 렌더
- [ ] 신용등급 정렬 ASC/DESC
- [ ] 신용등급 필터링

🤖 Generated with Claude Code (superpowers:subagent-driven-development)
EOF
)"
```

현재 브랜치가 `main`인 경우:
```bash
git push origin main
```

---

## 완료 기준 체크리스트

- [ ] `npm run build` 0 errors
- [ ] CreditCard 탭 전환 동작 (요약 ↔ 풀 리포트)
- [ ] 풀 리포트: PAYDEX 바, 리스크 그리드, 결제조건 3행, K-SURE 카드
- [ ] 신용등급 `<th>` 클릭 정렬 동작
- [ ] 신용등급 필터 동작 + 활성 칩 표시
- [ ] Mock 데이터 결정론적 (새로고침 시 동일 값)
