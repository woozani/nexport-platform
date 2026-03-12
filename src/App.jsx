import { useState, useEffect, useMemo, useCallback, useRef, useReducer } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// ─────────── STYLES ───────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
:root {
  /* ── Apple Dark (기본) ── */
  --bg-0:#000000; --bg-1:#1C1C1E; --bg-2:#2C2C2E; --bg-3:#3A3A3C; --bg-4:#48484A;
  --bg-hover:rgba(120,120,128,0.18); --bg-active:rgba(120,120,128,0.28);
  --blue:#0A84FF; --blue-light:#409CFF; --blue-dim:rgba(10,132,255,0.18);
  --cyan:#32ADE6; --cyan-dim:rgba(50,173,230,0.18);
  --green:#30D158; --green-dim:rgba(48,209,88,0.18);
  --amber:#FF9F0A; --amber-dim:rgba(255,159,10,0.18);
  --red:#FF453A; --red-dim:rgba(255,69,58,0.18);
  --violet:#BF5AF2; --violet-dim:rgba(191,90,242,0.18);
  --t1:#FFFFFF; --t2:rgba(235,235,245,0.6); --t3:rgba(235,235,245,0.3); --t4:rgba(235,235,245,0.18);
  --border:rgba(84,84,88,0.65); --border-h:rgba(84,84,88,0.9);
  /* Frosted Glass */
  --glass-bg:rgba(28,28,30,0.85); --glass-bg-strong:rgba(28,28,30,0.94);
  --glass-shadow:0 8px 32px rgba(0,0,0,0.5),0 2px 8px rgba(0,0,0,0.3);
  --modal-shadow:0 24px 60px rgba(0,0,0,0.7),0 8px 24px rgba(0,0,0,0.5);
  --card-shadow:0 4px 16px rgba(0,0,0,0.35),0 1px 4px rgba(0,0,0,0.2);
  /* Apple System Font */
  --font:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;
  --mono:"SF Mono",SFMono-Regular,Menlo,monospace;
  --serif:'Instrument Serif',Georgia,serif;
}
[data-theme="light"] {
  /* ── Apple Light ── */
  --bg-0:#FFFFFF; --bg-1:#F2F2F7; --bg-2:#EFEFF4; --bg-3:#E5E5EA; --bg-4:#D1D1D6;
  --bg-hover:rgba(120,120,128,0.12); --bg-active:rgba(120,120,128,0.2);
  --blue:#007AFF; --blue-light:#0A84FF; --blue-dim:rgba(0,122,255,0.12);
  --cyan:#32ADE6; --cyan-dim:rgba(50,173,230,0.12);
  --green:#34C759; --green-dim:rgba(52,199,89,0.12);
  --amber:#FF9500; --amber-dim:rgba(255,149,0,0.12);
  --red:#FF3B30; --red-dim:rgba(255,59,48,0.12);
  --violet:#AF52DE; --violet-dim:rgba(175,82,222,0.12);
  --t1:#000000; --t2:rgba(60,60,67,0.6); --t3:rgba(60,60,67,0.3); --t4:rgba(60,60,67,0.18);
  --border:rgba(60,60,67,0.2); --border-h:rgba(60,60,67,0.4);
  --glass-bg:rgba(255,255,255,0.85); --glass-bg-strong:rgba(255,255,255,0.95);
  --glass-shadow:0 4px 20px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.04);
  --modal-shadow:0 8px 40px rgba(0,0,0,0.15),0 2px 8px rgba(0,0,0,0.08);
  --card-shadow:0 2px 8px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.04);
}
*{margin:0;padding:0;box-sizing:border-box}
html{transition:background .3s,color .3s}
body{font-family:var(--font);background:var(--bg-0);color:var(--t1);font-size:13px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;transition:background .3s,color .3s}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--t4);border-radius:3px}
input,textarea,select,button{font-family:inherit}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes barGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes float{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes slideInRight{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
@keyframes typingCursor{0%,100%{opacity:1}50%{opacity:0}}
@keyframes floatCard{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-14px) rotate(-1.5deg)}}
@keyframes glowPulse{0%,100%{box-shadow:0 4px 20px rgba(10,132,255,.4)}50%{box-shadow:0 8px 48px rgba(10,132,255,.7),0 0 80px rgba(10,132,255,.2)}}
@keyframes stepLine{from{width:0;opacity:0}to{width:100%;opacity:1}}
@keyframes staggerUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmerBg{0%{background-position:-400px 0}100%{background-position:400px 0}}
@media(max-width:768px){.hiw-grid{display:flex!important;flex-direction:column!important;gap:16px!important;align-items:stretch!important}.hiw-grid>div{width:100%!important;box-sizing:border-box!important;padding:24px 20px!important;text-align:center!important;background:var(--bg-2);border-radius:16px;border:1px solid var(--border)}.hiw-connector{display:none!important}}
.fi{animation:fadeIn .4s cubic-bezier(0.2,0,0,1) forwards;opacity:0}
.fi1{animation-delay:.04s}.fi2{animation-delay:.08s}.fi3{animation-delay:.12s}.fi4{animation-delay:.16s}.fi5{animation-delay:.2s}
`;

// ─────────── ICONS ───────────
const Ic = {
  Search:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Filter:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  ChevDown:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevRight:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevLeft:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  X:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Check:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>,
  Mail:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Download:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  List:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Zap:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Globe:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Building:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>,
  Users:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Star:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  StarFill:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Eye:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Sort:({s=12})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>,
  SortAsc:({s=12})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m7 9 5-5 5 5"/></svg>,
  SortDesc:({s=12})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m7 15 5 5 5-5"/></svg>,
  Phone:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Sparkle:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41Z"/></svg>,
  Columns:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>,
  Bookmark:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  Tag:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>,
  Layers:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Shield:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Target:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Bar:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>,
  Refresh:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Grid:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Bell:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  BookOpen:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  TrendUp:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Sun:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Moon:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

// ─────────── NEXPORT LOGO ───────────
function NexportLogo({ iconSize = 28, textSize = 17 }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {/* N + >> 아이콘 */}
      <svg width={iconSize} height={Math.round(iconSize*0.7)} viewBox="0 0 40 28" fill="none">
        <defs>
          <linearGradient id="nxLogoGrad" x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A2463"/>
            <stop offset="100%" stopColor="#3E92CC"/>
          </linearGradient>
        </defs>
        {/* N 레터 */}
        <path d="M2 26V2L18 24V2" stroke="url(#nxLogoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        {/* 첫 번째 > */}
        <path d="M23 7L31 14L23 21" stroke="#3E92CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* 두 번째 > */}
        <path d="M30 7L38 14L30 21" stroke="#3E92CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      {/* NEXPORT 텍스트 그라데이션 */}
      <span style={{
        fontSize:textSize, fontWeight:700, letterSpacing:".05em",
        background:"linear-gradient(90deg,#0A2463 0%,#3E92CC 100%)",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        backgroundClip:"text", lineHeight:1,
      }}>NEXPORT</span>
    </div>
  );
}

// ─────────── DATA ───────────
const COUNTRIES = ["독일","미국","일본","베트남","스웨덴","네덜란드","영국","호주","캐나다","프랑스","싱가포르","태국","인도","브라질","멕시코"];
const FLAGS = {"독일":"🇩🇪","미국":"🇺🇸","일본":"🇯🇵","베트남":"🇻🇳","스웨덴":"🇸🇪","네덜란드":"🇳🇱","영국":"🇬🇧","호주":"🇦🇺","캐나다":"🇨🇦","프랑스":"🇫🇷","싱가포르":"🇸🇬","태국":"🇹🇭","인도":"🇮🇳","브라질":"🇧🇷","멕시코":"🇲🇽"};
const REGIONS = {"독일":"유럽","미국":"북미","일본":"아시아","베트남":"동남아","스웨덴":"유럽","네덜란드":"유럽","영국":"유럽","호주":"오세아니아","캐나다":"북미","프랑스":"유럽","싱가포르":"동남아","태국":"동남아","인도":"아시아","브라질":"남미","멕시코":"북미"};
const INDUSTRIES = ["자동차 부품","전자부품","의료기기","항공우주","플라스틱 사출","금속가공","반도체 장비","화학소재","건설자재","에너지","식품기계","조선/해양","섬유/의류","포장재","냉동/공조","방산/방위","이차전지","로봇/자동화","철강/비철금속","공작기계"];
const CERTS = ["ISO 9001","ISO 13485","IATF 16949","UL","CE","FDA","RoHS","REACH","JIS","AS9100"];
const DEMANDS = ["CNC 정밀가공 부품","PCB 어셈블리","의료용 정밀 부품","항공기 구조 부품","플라스틱 사출 성형","스테인레스 정밀 부품","반도체 공정 부품","산업용 화학약품","알루미늄 패널/창호","태양광 모듈 부품","식품가공 설비","선박 엔진 부품","기능성 원단","산업용 포장 용기","냉동 컴프레서","방산용 정밀 부품","배터리 셀/모듈","산업용 로봇 부품","열연/냉연 강판","고정밀 공작기계"];
const STATUSES = ["신규","검토중","협상중","LOI","계약완료"];
const REGULATIONS = ["중국산 규제","인증 필수","한국산 우선","Buy American","공공 인프라"];
const HOT_SIGNALS = ["채용 급증","최근 펀딩","RFQ 발송","전시회 참가","신규공장 건설"];
const REG_BY_INDUSTRY = {
  "의료기기":["인증 필수","한국산 우선"],
  "항공우주":["인증 필수","Buy American"],
  "에너지":["중국산 규제","공공 인프라"],
  "반도체 장비":["중국산 규제"],
  "건설자재":["공공 인프라"],
  "식품기계":["인증 필수"],
  "조선/해양":["한국산 우선"],
  "포장재":["한국산 우선"],
  "냉동/공조":["중국산 규제"],
  "방산/방위":["인증 필수","Buy American"],
  "이차전지":["중국산 규제"],
  "로봇/자동화":["중국산 규제"],
  "철강/비철금속":["한국산 우선"],
  "공작기계":["인증 필수"],
};
const NAMES_FIRST = ["Hans","Sarah","Erik","Nguyen","Tanaka","Pierre","James","Maria","Sven","Akiko","John","Lisa","Marco","Priya","Carlos","Wei","Oliver","Sophie","Lars","Yuki","David","Anna","Michael","Julia","Robert","Nina","Thomas","Emma","Patrick","Linda"];
const NAMES_LAST = ["Mueller","Chen","Johansson","Tran","Yamamoto","Dupont","Wilson","Garcia","Lindberg","Sato","Smith","Park","Rossi","Patel","Rodriguez","Zhang","Brown","Martin","Eriksson","Kim","Lee","Andersen","Fischer","Nakamura","Costa","Singh","Bergström","Hernandez","Novak","O'Brien"];
const COMPANIES = ["TechParts GmbH","Pacific Trade Corp","Saigon Manufacturing","Nordic Solutions AB","Osaka Precision Co.","Rotterdam Metals BV","Thames Engineering","Sydney Industrial","Maple Leaf Tech","Lyon Aerospace","SG Components Pte","Bangkok Polymer","Delhi Precision","São Paulo Metals","Monterrey Auto Parts","Shanghai Tech Group","Manchester Steel","Paris Medical Devices","Stockholm Dynamics","Tokyo Electronics","Berlin Industrial AG","Melbourne Parts Co.","Toronto Precision Inc.","Seoul Components","Warsaw Engineering"];

function generateBuyers(n) {
  const buyers = [];
  for (let i = 0; i < n; i++) {
    const country = COUNTRIES[i % COUNTRIES.length];
    const company = i < COMPANIES.length ? COMPANIES[i] : `${COMPANIES[i%COMPANIES.length]} ${Math.floor(i/COMPANIES.length)+2}`;
    const score = Math.max(45, Math.min(99, Math.floor(Math.random() * 55) + 45));
    const ind = INDUSTRIES[i % INDUSTRIES.length];
    const emp = [10,25,50,100,250,500,1000,5000][Math.floor(Math.random()*8)];
    const rev = ["$1M-5M","$5M-10M","$10M-50M","$50M-100M","$100M+"][Math.floor(Math.random()*5)];
    const certs = CERTS.filter(() => Math.random() > .65);
    const baseRegs = REG_BY_INDUSTRY[ind] || [];
    const regulatoryShield = baseRegs.length > 0 && Math.random() > 0.25 ? baseRegs : [];
    const buyerType = regulatoryShield.length === 0 ? "가격우선"
      : regulatoryShield.some(r => r === "인증 필수" || r === "Buy American") ? "인증우선"
      : "한국산필수";
    const buyingIntent = ["높음","중간","낮음"][Math.floor(Math.random()*3)];
    const hotSignal = buyingIntent === "높음" && Math.random() > 0.45
      ? HOT_SIGNALS[i % HOT_SIGNALS.length]
      : buyingIntent === "중간" && Math.random() > 0.78
        ? HOT_SIGNALS[(i+2) % HOT_SIGNALS.length]
        : null;
    buyers.push({
      id: i + 1,
      name: `${NAMES_FIRST[i%NAMES_FIRST.length]} ${NAMES_LAST[Math.floor(i/NAMES_FIRST.length)%NAMES_LAST.length]}`,
      company, country, flag: FLAGS[country] || "🌐",
      region: REGIONS[country] || "기타",
      industry: ind,
      title: ["Procurement Director","VP Supply Chain","Head of Sourcing","Purchase Manager","Chief Procurement Officer","Sourcing Specialist","Supply Chain Director","Operations Manager"][i%8],
      score,
      demand: DEMANDS[i%DEMANDS.length],
      volume: `$${(Math.random()*4+0.5).toFixed(1)}M/년`,
      status: STATUSES[Math.floor(Math.random()*5)],
      employees: emp,
      employeeLabel: emp >= 1000 ? `${emp/1000}K+` : `${emp}+`,
      revenue: rev,
      certifications: certs.length ? certs : [CERTS[Math.floor(Math.random()*CERTS.length)]],
      email: `${NAMES_FIRST[i%NAMES_FIRST.length].toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g,'').slice(0,12)}.com`,
      phone: `+${[49,1,81,84,46,31,44,61,1,33,65,66,91,55,52][i%15]}-${Math.floor(Math.random()*900+100)}-${Math.floor(Math.random()*9000+1000)}`,
      buyingIntent,
      hotSignal,
      regulatoryShield,
      buyerType,
      saved: Math.random() > .7,
      starred: Math.random() > .85,
      lastActive: `${Math.floor(Math.random()*30)+1}일 전`,
    });
  }
  return buyers;
}

const ALL_BUYERS = generateBuyers(1000);

// ─────────── QUICK FILTERS ───────────
const QUICK_FILTERS = [
  { id:'hotIntent',   label:'🔥 고의향',  color:'--red',    test:(b)=>b.buyingIntent==='높음' },
  { id:'topScore',    label:'⭐ 고득점',  color:'--amber',  test:(b)=>b.score>=85 },
  { id:'newBuyer',    label:'🆕 신규',    color:'--green',  test:(b)=>b.status==='신규' },
  { id:'negotiating', label:'🤝 협상중',  color:'--blue',   test:(b)=>b.status==='협상중' },
  { id:'europe',      label:'🌍 유럽',    color:'--cyan',   test:(b)=>b.region==='유럽' },
  { id:'asia',        label:'🌏 아시아',  color:'--violet', test:(b)=>b.region==='아시아'||b.region==='동남아' },
  { id:'regShield',   label:'🛡 규제보호', color:'--green',  test:(b)=>b.regulatoryShield&&b.regulatoryShield.length>0 },
  { id:'hotSignal',   label:'⚡ 핫시그널', color:'--amber',  test:(b)=>!!b.hotSignal },
];

// ─────────── PLAYBOOKS ───────────
const PLAYBOOKS = [
  { id:'fasttrack',        emoji:'🚀', title:'패스트트랙 클로징',  color:'--green',
    tag:'AI 추천',   tagColor:'--green',
    desc:'매칭 점수 85점 이상의 신규 바이어를 빠르게 첫 접촉으로 전환하는 고속 어프로치 전략',
    steps:['신규 바이어 자동 필터링','AI 맞춤 첫인상 이메일 발송','3일 내 팔로업 예약'],
    filter:(b,s)=>b.score>=85&&b.status==='신규' },
  { id:'reactivate',       emoji:'♻️', title:'협상 재활성화',       color:'--amber',
    tag:'긴급',      tagColor:'--amber',
    desc:'협상 단계에서 멈춰 있는 바이어의 모멘텀을 되살리는 전략적 재점화 캠페인',
    steps:['협상중 바이어 선별','결정 지원 자료 첨부 이메일','인센티브 제안 시퀀스'],
    filter:(b,s)=>b.status==='협상중' },
  { id:'loi_close',        emoji:'🎯', title:'LOI 클로징 가속화',  color:'--blue',
    tag:'고전환',    tagColor:'--blue',
    desc:'LOI 서명 직전 바이어에게 최종 결정을 촉진하는 집중 클로징 시퀀스',
    steps:['LOI 단계 바이어 식별','계약 초안 요약 발송','72시간 이내 응답 유도'],
    filter:(b,s)=>b.status==='LOI' },
  { id:'vip_care',         emoji:'💎', title:'VIP 바이어 케어',     color:'--violet',
    tag:'관계 강화', tagColor:'--violet',
    desc:'저장된 고의향 핵심 바이어와의 장기 관계를 깊게 유지하는 VIP 케어 전략',
    steps:['저장 + 고의향 바이어 선별','개인화된 케어 메시지 발송','정기 체크인 일정 수립'],
    filter:(b,s)=>s.has(b.id)&&b.buyingIntent==='높음' },
  { id:'new_market',       emoji:'🌍', title:'신시장 탐색',         color:'--cyan',
    tag:'성장 전략', tagColor:'--cyan',
    desc:'아직 관계가 없는 고가치 잠재 바이어를 발굴해 새로운 시장을 개척하는 전략',
    steps:['미저장 고득점 바이어 탐색','시장 진입 의향 타진 이메일','관심도 측정 후 세분화'],
    filter:(b,s)=>!s.has(b.id)&&b.score>=80 },
  { id:'pipeline_cleanup', emoji:'📊', title:'파이프라인 클린업',    color:'--red',
    tag:'관리',      tagColor:'--red',
    desc:'검토중 단계에서 오래 머문 바이어를 진단하고 다음 단계로 추진하는 정리 전략',
    steps:['검토중 바이어 전체 선별','의사결정 지연 원인 파악 이메일','이탈 여부 분류 및 재배정'],
    filter:(b,s)=>b.status==='검토중' },
];

// ─────────── LOOKALIKE ALGORITHM ───────────
const getLookalikes = (target, buyers) => {
  return buyers
    .filter(b => b.id !== target.id)
    .map(b => {
      let sim = 0;
      if (b.industry === target.industry) sim += 30;
      if (b.region === target.region) sim += 20;
      if (Math.abs(b.score - target.score) <= 15) sim += 15;
      const certOverlap = (target.certifications||[]).filter(c=>(b.certifications||[]).includes(c)).length;
      sim += certOverlap * 8;
      if (b.buyingIntent === target.buyingIntent) sim += 10;
      if (b.country === target.country) sim += 5;
      return { ...b, similarity: sim };
    })
    .sort((a,b) => b.similarity - a.similarity)
    .slice(0, 5);
};

// ─────────── SMALL COMPONENTS ───────────
const Badge = ({children, color="var(--blue)", bg}) => (
  <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:4,background:bg||`${color}15`,color,letterSpacing:".02em",whiteSpace:"nowrap"}}>{children}</span>
);

const ScoreBar = ({score}) => {
  const c = score >= 85 ? "var(--green)" : score >= 70 ? "var(--blue)" : score >= 55 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,minWidth:100}}>
      <span style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:c,width:24}}>{score}</span>
      <div style={{flex:1,height:4,borderRadius:2,background:"var(--bg-4)",overflow:"hidden"}}>
        <div style={{width:`${score}%`,height:"100%",borderRadius:2,background:c,transformOrigin:"left",animation:"barGrow .8s ease forwards"}} />
      </div>
    </div>
  );
};

const Checkbox = ({checked, onChange, indeterminate}) => (
  <div onClick={e=>{e.stopPropagation();onChange&&onChange(!checked)}} style={{
    width:16,height:16,borderRadius:4,border:`1.5px solid ${checked||indeterminate?"var(--blue)":"var(--t4)"}`,
    background:checked||indeterminate?"var(--blue)":"transparent",cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0
  }}>
    {checked && <Ic.Check s={10} />}
    {indeterminate && !checked && <div style={{width:8,height:2,background:"#fff",borderRadius:1}} />}
  </div>
);

const Tooltip = ({children, text}) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:"relative",display:"inline-flex"}} onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show && <div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",padding:"4px 8px",borderRadius:6,background:"var(--bg-4)",border:"1px solid var(--border-h)",fontSize:11,color:"var(--t2)",whiteSpace:"nowrap",zIndex:999,animation:"scaleIn .15s ease"}}>{text}</div>}
    </div>
  );
};

// ─────────── FILTER SIDEBAR ───────────

// ─────────── UI STATE COMPONENTS ───────────
function LoadingSpinner({ size=20, color="var(--blue)" }) {
  return <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
    <svg width={size} height={size} viewBox="0 0 24 24" style={{animation:"spin 1s linear infinite"}}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--bg-4)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  </div>;
}

function EmptyState({ icon, title, subtitle, action, actionLabel }) {
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",animation:"fadeIn .4s ease"}}>
    <div style={{width:56,height:56,borderRadius:14,background:"var(--bg-3)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
      {icon || <Ic.Search s={24}/>}
    </div>
    <div style={{fontSize:15,fontWeight:700,color:"var(--t1)",marginBottom:6}}>{title}</div>
    <div style={{fontSize:12,color:"var(--t3)",textAlign:"center",maxWidth:320,lineHeight:1.6}}>{subtitle}</div>
    {action && <div onClick={action} style={{marginTop:16,padding:"8px 20px",borderRadius:8,background:"var(--blue)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",transition:"opacity .15s"}}
      onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{actionLabel||"다시 시도"}</div>}
  </div>;
}

function ErrorBanner({ message, onRetry, onDismiss }) {
  return <div style={{margin:"8px 20px",padding:"10px 14px",borderRadius:8,background:"var(--red-dim)",border:"1px solid rgba(239,68,68,.2)",display:"flex",alignItems:"center",gap:10,animation:"fadeIn .3s ease"}}>
    <div style={{width:20,height:20,borderRadius:"50%",background:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic.X s={10}/></div>
    <span style={{flex:1,fontSize:12,color:"var(--red)"}}>{message}</span>
    {onRetry && <div onClick={onRetry} style={{padding:"4px 10px",borderRadius:5,border:"1px solid rgba(239,68,68,.3)",color:"var(--red)",fontSize:11,cursor:"pointer",fontWeight:500}}>재시도</div>}
    {onDismiss && <div onClick={onDismiss} style={{cursor:"pointer",color:"var(--t4)"}}><Ic.X s={14}/></div>}
  </div>;
}

function SkeletonRow({ cols=8 }) {
  return <tr>{Array.from({length:cols}).map((_,i)=><td key={i} style={{padding:"10px 12px"}}><div style={{height:12,borderRadius:4,background:"var(--bg-4)",animation:"pulse 1.5s ease infinite",width:i===0?"60%":i===cols-1?"40%":"75%"}}/></td>)}</tr>;
}

function SkeletonTable({ rows=8, cols=8 }) {
  return <>{Array.from({length:rows}).map((_,i)=><SkeletonRow key={i} cols={cols}/>)}</>;
}


// ─────────── NOTIFICATION CENTER ───────────
function NotificationCenter({ notifications, unread, onMarkRead, onMarkAllRead, onClear, onClose }) {
  const typeConf = {
    match:    {icon:<Ic.Target s={13}/>,   color:"var(--amber)",   dim:"var(--amber-dim)"},
    pipeline: {icon:<Ic.Bar s={13}/>,      color:"var(--blue)",    dim:"var(--blue-dim)"},
    email:    {icon:<Ic.Mail s={13}/>,     color:"var(--cyan)",    dim:"var(--cyan-dim)"},
    note:     {icon:<Ic.Tag s={13}/>,      color:"var(--violet)",  dim:"var(--violet-dim)"},
  };
  const relTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "방금 전";
    if (diff < 3600000) return `${Math.floor(diff/60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}시간 전`;
    return `${Math.floor(diff/86400000)}일 전`;
  };
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:199}}/>
      <div style={{position:"fixed",top:56,right:16,zIndex:200,width:340,background:"var(--glass-bg-strong)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"1px solid var(--border)",borderRadius:16,boxShadow:"var(--glass-shadow)",animation:"scaleIn .25s cubic-bezier(0.05,0.7,0.1,1)",transformOrigin:"top right",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
          <Ic.Bell s={15}/>
          <span style={{fontSize:13,fontWeight:700,flex:1}}>알림</span>
          {unread > 0 && <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10,background:"var(--red)",color:"#fff"}}>{unread}</span>}
          {notifications.length > 0 && <>
            <div onClick={onMarkAllRead} style={{fontSize:10,color:"var(--t3)",cursor:"pointer",padding:"2px 6px",borderRadius:5}} onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"} onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}>모두 읽음</div>
            <div onClick={onClear} style={{fontSize:10,color:"var(--t4)",cursor:"pointer",padding:"2px 6px",borderRadius:5}} onMouseEnter={e=>e.currentTarget.style.color="var(--red)"} onMouseLeave={e=>e.currentTarget.style.color="var(--t4)"}>전체 삭제</div>
          </>}
        </div>
        {/* List */}
        <div style={{maxHeight:380,overflowY:"auto"}}>
          {notifications.length === 0 ? (
            <div style={{textAlign:"center",padding:"36px 20px",color:"var(--t4)"}}>
              <div style={{fontSize:24,marginBottom:8}}>🔔</div>
              <div style={{fontSize:12}}>새로운 알림이 없습니다</div>
            </div>
          ) : notifications.map(n => {
            const tc = typeConf[n.type] || typeConf.note;
            return (
              <div key={n.id} onClick={()=>onMarkRead(n.id)} style={{
                padding:"12px 16px",borderBottom:"1px solid var(--border)",cursor:"pointer",
                background:n.read?"transparent":"rgba(59,107,245,.04)",transition:"background .15s",
                display:"flex",gap:10,alignItems:"flex-start",position:"relative"
              }}
                onMouseEnter={e=>e.currentTarget.style.background=n.read?"var(--bg-3)":"rgba(59,107,245,.08)"}
                onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":"rgba(59,107,245,.04)"}
              >
                {!n.read && <div style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",width:5,height:5,borderRadius:"50%",background:"var(--blue)"}}/>}
                <div style={{width:28,height:28,borderRadius:8,background:tc.dim,color:tc.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}>{tc.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:n.read?500:700,color:"var(--t1)",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.title}</div>
                  <div style={{fontSize:11,color:"var(--t3)",lineHeight:1.4}}>{n.body}</div>
                  <div style={{fontSize:10,color:"var(--t4)",marginTop:4}}>{relTime(n.ts)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}


// ─────────── BUYER DETAIL PANEL ───────────
function BuyerDetailPanel({ buyer, onClose, onSave, isSaved, onEmailBuyer, onShowNotes, onDetailBuyer }) {
  if (!buyer) return null;
  const [showLookalikes, setShowLookalikes] = useState(false);
  const cColor = (s) => s>=80?"var(--green)":s>=65?"var(--cyan)":s>=50?"var(--amber)":"var(--red)";
  const sections = [
    {label:"산업",value:buyer.industry,icon:<Ic.Grid s={13}/>},
    {label:"수요 품목",value:buyer.demand,icon:<Ic.Sparkle s={13}/>},
    {label:"예상 규모",value:buyer.volume,icon:<Ic.Bar s={13}/>},
    {label:"구매 의향",value:buyer.buyingIntent,icon:<Ic.Eye s={13}/>},
    {label:"상태",value:buyer.status,icon:<Ic.Check s={13}/>},
  ];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:90,animation:"fadeIn .2s cubic-bezier(0.2,0,0,1)",backdropFilter:"blur(8px) saturate(140%)",WebkitBackdropFilter:"blur(8px) saturate(140%)"}}/>
      <div style={{position:"fixed",right:0,top:0,bottom:0,width:420,maxWidth:"90vw",background:"var(--glass-bg-strong)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",borderLeft:"1px solid var(--border)",boxShadow:"var(--glass-shadow)",zIndex:91,display:"flex",flexDirection:"column",animation:"slideInRight .3s cubic-bezier(0.2,0,0,1)",overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div onClick={onClose} style={{cursor:"pointer",padding:4,borderRadius:6,color:"var(--t3)"}}><Ic.X s={16}/></div>
          <span style={{fontSize:14,fontWeight:700,flex:1}}>바이어 상세</span>
          <div onClick={()=>onSave(buyer)} style={{padding:"6px 14px",borderRadius:6,background:isSaved?"var(--green-dim)":"var(--bg-3)",border:`1px solid ${isSaved?"var(--green)":"var(--border)"}`,cursor:"pointer",fontSize:11,fontWeight:600,color:isSaved?"var(--green)":"var(--t2)",display:"flex",alignItems:"center",gap:5}}>
            <Ic.Bookmark s={12}/>{isSaved?"저장됨":"저장"}
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:20}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <div style={{width:52,height:52,borderRadius:13,background:"linear-gradient(135deg,var(--blue-dim),var(--violet-dim))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"var(--blue)",flexShrink:0}}>{buyer.name.charAt(0)}</div>
            <div>
              <div style={{fontSize:16,fontWeight:800,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                {buyer.name}
                {buyer.hotSignal&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:"rgba(245,158,11,.12)",color:"var(--amber)",border:"1px solid rgba(245,158,11,.25)"}}>⚡ {buyer.hotSignal}</span>}
              </div>
              <div style={{fontSize:12,color:"var(--t3)",marginTop:2}}>{buyer.title}</div>
              <div style={{fontSize:12,color:"var(--t3)",display:"flex",alignItems:"center",gap:4,marginTop:1}}>{buyer.flag} {buyer.company} · {buyer.country}</div>
            </div>
          </div>
          <div style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
            <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="var(--bg-4)" strokeWidth="4"/>
                <circle cx="32" cy="32" r="28" fill="none" stroke={cColor(buyer.score)} strokeWidth="4" strokeDasharray={`${(buyer.score/100)*176} 176`} strokeLinecap="round" transform="rotate(-90 32 32)"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,fontFamily:"var(--mono)",color:cColor(buyer.score)}}>{buyer.score}</div>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>AI 매칭 점수</div>
              <div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>산업 적합도, 인증, 구매 이력 기반</div>
            </div>
          </div>
          <div style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Ic.Mail s={13}/>연락처</div>
            <div style={{display:"grid",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:6,background:"var(--blue-dim)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Mail s={12}/></div>
                <div><div style={{fontSize:10,color:"var(--t4)",textTransform:"uppercase",letterSpacing:".05em",fontWeight:600}}>이메일</div><div style={{fontSize:12,color:"var(--blue)"}}>{buyer.email}</div></div>
                <div onClick={()=>navigator.clipboard.writeText(buyer.email)} style={{marginLeft:"auto",padding:"4px 8px",borderRadius:4,border:"1px solid var(--border)",cursor:"pointer",fontSize:10,color:"var(--t3)"}}>복사</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:6,background:"var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Phone s={12}/></div>
                <div><div style={{fontSize:10,color:"var(--t4)",textTransform:"uppercase",letterSpacing:".05em",fontWeight:600}}>전화</div><div style={{fontSize:12,color:"var(--t1)"}}>{buyer.phone}</div></div>
              </div>
            </div>
          </div>
          <div style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Ic.Grid s={13}/>상세 정보</div>
            <div style={{display:"grid",gap:10}}>
              {sections.map((s,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<sections.length-1?"1px solid var(--border)":"none"}}><span style={{fontSize:11,color:"var(--t3)",display:"flex",alignItems:"center",gap:6}}>{s.icon}{s.label}</span><span style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{s.value}</span></div>))}
            </div>
          </div>
          <div style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Ic.Shield s={13}/>인증</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {(buyer.certifications||[]).map((c,i)=>(<span key={i} style={{padding:"3px 8px",borderRadius:5,background:"var(--cyan-dim)",color:"var(--cyan)",fontSize:10,fontWeight:600,border:"1px solid rgba(34,211,238,.15)"}}>{c}</span>))}
              {(!buyer.certifications||buyer.certifications.length===0)&&<span style={{fontSize:11,color:"var(--t4)"}}>인증 정보 없음</span>}
            </div>
          </div>
          <div style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Ic.Sparkle s={13}/>AI 분석</div>
            <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7}}>
              {buyer.name}은(는) <strong style={{color:"var(--t1)"}}>{buyer.industry}</strong> 분야의 바이어로, 현재 <strong style={{color:cColor(buyer.score)}}>{buyer.buyingIntent}</strong> 수준의 구매 의향을 보이고 있습니다. 주요 수요 품목은 <strong style={{color:"var(--t1)"}}>{buyer.demand}</strong>이며, 예상 거래 규모는 <strong style={{color:"var(--cyan)"}}>{buyer.volume}</strong>입니다.
              {buyer.score>=80&&" AI 분석 결과 높은 매칭률을 보이며, 즉시 접촉을 권장합니다."}
              {buyer.score>=60&&buyer.score<80&&" 잠재적 매칭 가능성이 있으며, 추가 검토를 권장합니다."}
              {buyer.score<60&&" 추가적인 니즈 파악이 필요합니다."}
            </div>
          </div>

          {/* ── Lookalike Section ── */}
          {showLookalikes && (
            <div style={{marginTop:16,padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid rgba(139,92,246,.25)",animation:"fadeIn .3s ease"}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--violet)",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                <Ic.Users s={13}/> 유사 바이어 Top 5
                <span style={{fontSize:10,color:"var(--t3)",fontWeight:400,marginLeft:4}}>· {buyer.industry} · {buyer.region}</span>
              </div>
              {getLookalikes(buyer, ALL_BUYERS).map((lb,i)=>{
                const lc = lb.score>=80?"var(--green)":lb.score>=65?"var(--cyan)":lb.score>=50?"var(--amber)":"var(--red)";
                return (
                  <div key={lb.id}
                    className={`fi fi${Math.min(i+1,5)}`}
                    onClick={()=>{ onDetailBuyer&&onDetailBuyer(lb); }}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,
                      cursor:"pointer",marginBottom:i<4?6:0,border:"1px solid var(--border)",
                      background:"var(--bg-3)",transition:"background .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
                    onMouseLeave={e=>e.currentTarget.style.background="var(--bg-3)"}>
                    <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,
                      background:"var(--bg-4)",border:`2px solid ${lc}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:13,fontWeight:700,color:"var(--t1)"}}>
                      {lb.name.charAt(0)}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lb.name} {lb.flag}</div>
                      <div style={{fontSize:10,color:"var(--t3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lb.company} · {lb.industry}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:14,fontWeight:800,fontFamily:"var(--mono)",color:lc}}>{lb.score}</div>
                      <div style={{fontSize:9,color:"var(--t4)"}}>점</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={{padding:"12px 20px",borderTop:"1px solid var(--border)",display:"flex",gap:6,flexShrink:0,flexWrap:"wrap"}}>
          <div onClick={()=>navigator.clipboard.writeText(buyer.email)} style={{flex:1,minWidth:80,padding:"9px 0",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t2)",textAlign:"center",fontSize:11,fontWeight:600,cursor:"pointer"}}>이메일 복사</div>
          <div onClick={()=>onEmailBuyer(buyer)} style={{flex:1,minWidth:80,padding:"9px 0",borderRadius:8,background:"linear-gradient(135deg,var(--green),#0d9488)",color:"#fff",textAlign:"center",fontSize:11,fontWeight:600,cursor:"pointer"}}>AI 이메일</div>
          <div onClick={()=>onShowNotes(buyer)} style={{flex:1,minWidth:60,padding:"9px 0",borderRadius:8,background:"var(--violet-dim)",border:"1px solid rgba(139,92,246,.2)",color:"var(--violet)",textAlign:"center",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><Ic.Tag s={11}/>노트</div>
          <div onClick={()=>setShowLookalikes(v=>!v)} style={{flex:1,minWidth:80,padding:"9px 0",borderRadius:8,background:showLookalikes?"var(--blue-dim)":"var(--bg-3)",border:`1px solid ${showLookalikes?"rgba(59,107,245,.3)":"var(--border)"}`,color:showLookalikes?"var(--blue)":"var(--t2)",textAlign:"center",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><Ic.Users s={11}/>유사 바이어</div>
        </div>
      </div>
    </>
  );
}


// ─────────── BUYER NOTES PANEL ───────────
function BuyerNotesPanel({ buyer, notes, onAddNote, onDeleteNote, onClose }) {
  const [inputText, setInputText] = useState("");
  const [activeType, setActiveType] = useState("note");
  const [hoveredId, setHoveredId] = useState(null);
  const typeConfig = {
    note:    {label:"메모",    icon:<Ic.Tag s={12}/>,    color:"var(--violet)", dim:"var(--violet-dim)", border:"rgba(139,92,246,.2)"},
    call:    {label:"통화",    icon:<Ic.Phone s={12}/>,  color:"var(--green)",  dim:"var(--green-dim)",  border:"rgba(16,185,129,.2)"},
    meeting: {label:"미팅",   icon:<Ic.Users s={12}/>,  color:"var(--blue)",   dim:"var(--blue-dim)",   border:"rgba(59,107,245,.2)"},
    email:   {label:"이메일", icon:<Ic.Mail s={12}/>,   color:"var(--cyan)",   dim:"var(--cyan-dim)",   border:"rgba(34,211,238,.2)"},
  };
  const handleAdd = () => {
    if (!inputText.trim()) return;
    onAddNote({id:Date.now(), type:activeType, content:inputText.trim(), timestamp:Date.now()});
    setInputText("");
  };
  const fmtTime = (ts) => new Date(ts).toLocaleString('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:93,backdropFilter:"blur(8px) saturate(140%)",WebkitBackdropFilter:"blur(8px) saturate(140%)"}}/>
      <div style={{position:"fixed",right:0,top:0,bottom:0,width:420,maxWidth:"90vw",background:"var(--glass-bg-strong)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",borderLeft:"1px solid var(--border)",boxShadow:"var(--glass-shadow)",zIndex:94,display:"flex",flexDirection:"column",animation:"slideInRight .3s cubic-bezier(0.2,0,0,1)",overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div onClick={onClose} style={{cursor:"pointer",padding:4,borderRadius:6,color:"var(--t3)"}}><Ic.X s={16}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700}}>활동 로그</div>
            <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>{buyer.name} · {buyer.company}</div>
          </div>
          <span style={{fontSize:10,fontFamily:"var(--mono)",padding:"2px 7px",borderRadius:4,background:"var(--violet-dim)",color:"var(--violet)",fontWeight:600}}>{notes.length}건</span>
        </div>
        {/* Type selector */}
        <div style={{padding:"12px 20px",borderBottom:"1px solid var(--border)",display:"flex",gap:6,flexShrink:0}}>
          {Object.entries(typeConfig).map(([k,v])=>(
            <div key={k} onClick={()=>setActiveType(k)} style={{flex:1,padding:"6px 0",borderRadius:7,fontSize:11,fontWeight:600,textAlign:"center",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,background:activeType===k?v.dim:"transparent",color:activeType===k?v.color:"var(--t3)",border:`1px solid ${activeType===k?v.border:"transparent"}`,transition:"all .15s"}}>
              {v.icon}{v.label}
            </div>
          ))}
        </div>
        {/* Input area */}
        <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
          <textarea value={inputText} onChange={e=>setInputText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))handleAdd();}}
            placeholder={`${typeConfig[activeType].label} 내용을 입력하세요... (Ctrl+Enter로 추가)`}
            style={{width:"100%",minHeight:72,padding:"10px 12px",borderRadius:8,background:"var(--bg-3)",border:`1px solid ${typeConfig[activeType].border}`,color:"var(--t1)",fontSize:12,outline:"none",resize:"none",fontFamily:"var(--font)",lineHeight:1.6}}/>
          <div onClick={handleAdd} style={{marginTop:8,padding:"8px 0",borderRadius:8,background:typeConfig[activeType].color,color:"#fff",textAlign:"center",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,opacity:inputText.trim()?1:.45,transition:"opacity .15s"}}>
            <Ic.Plus s={12}/>{typeConfig[activeType].label} 추가
          </div>
        </div>
        {/* Timeline */}
        <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
          {notes.length===0 ? (
            <div style={{textAlign:"center",padding:40,color:"var(--t4)"}}>
              <div style={{fontSize:28,marginBottom:8}}>📝</div>
              <div style={{fontSize:12}}>아직 기록이 없습니다</div>
              <div style={{fontSize:11,color:"var(--t4)",marginTop:4}}>위에서 활동을 추가해보세요</div>
            </div>
          ) : (
            <div style={{display:"grid",gap:10}}>
              {[...notes].reverse().map(entry=>{
                const tc = typeConfig[entry.type]||typeConfig.note;
                return (
                  <div key={entry.id} onMouseEnter={()=>setHoveredId(entry.id)} onMouseLeave={()=>setHoveredId(null)}
                    style={{padding:"12px 14px",borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",borderLeft:`3px solid ${tc.color}`,position:"relative",transition:"border-color .15s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <span style={{padding:"2px 7px",borderRadius:4,background:tc.dim,color:tc.color,fontSize:10,fontWeight:600,display:"flex",alignItems:"center",gap:3}}>{tc.icon}{tc.label}</span>
                      <span style={{fontSize:10,color:"var(--t4)",marginLeft:"auto"}}>{fmtTime(entry.timestamp)}</span>
                      {hoveredId===entry.id && (
                        <div onClick={()=>onDeleteNote(entry.id)} style={{cursor:"pointer",color:"var(--t4)",padding:2,borderRadius:4,transition:"color .15s"}}
                          onMouseEnter={e=>e.currentTarget.style.color="var(--red)"} onMouseLeave={e=>e.currentTarget.style.color="var(--t4)"}>
                          <Ic.Trash s={12}/>
                        </div>
                      )}
                    </div>
                    <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{entry.content}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


// ─────────── BUYER COMPARE MODAL ───────────
function BuyerCompareModal({ buyers, onClose }) {
  const rows = [
    {key:"score",      label:"매칭 점수",    type:"numeric",  fmt:(b)=>`${b.score}점`},
    {key:"country",    label:"국가",         type:"text",     fmt:(b)=>`${b.flag} ${b.country}`},
    {key:"industry",   label:"산업군",       type:"text",     fmt:(b)=>b.industry},
    {key:"demand",     label:"수요 품목",    type:"text",     fmt:(b)=>b.demand},
    {key:"volume",     label:"예상 규모",    type:"volume",   fmt:(b)=>b.volume},
    {key:"buyingIntent",label:"구매 의향",   type:"intent",   fmt:(b)=>b.buyingIntent},
    {key:"status",     label:"파이프라인",   type:"status",   fmt:(b)=>b.status},
    {key:"employees",  label:"직원 수",      type:"numeric",  fmt:(b)=>b.employees},
    {key:"revenue",    label:"연매출",       type:"volume",   fmt:(b)=>b.revenue||"미기재"},
    {key:"certifications",label:"인증",      type:"list",     fmt:(b)=>(b.certifications||[]).join(", ")||"없음"},
  ];
  const isBest = (row, buyer) => {
    if (buyers.length < 2) return false;
    const vals = buyers.map(b => {
      if (row.type === "numeric") return parseFloat(String(b[row.key]||0).replace(/[^0-9.]/g,"")) || 0;
      if (row.type === "volume") { const m = String(b[row.key]||"$0").match(/\$(\d+)/); return m ? parseInt(m[1]) : 0; }
      if (row.type === "intent") return {높음:3,중간:2,낮음:1}[b[row.key]] || 0;
      if (row.type === "status") return {계약완료:5,LOI:4,협상중:3,검토중:2,신규:1}[b[row.key]] || 0;
      return null;
    });
    if (vals[0] === null) return false;
    const myVal = vals[buyers.indexOf(buyer)];
    return myVal !== null && myVal === Math.max(...vals) && myVal > 0;
  };
  const scoreColors = s => s >= 90 ? "var(--green)" : s >= 75 ? "var(--cyan)" : s >= 60 ? "var(--blue)" : "var(--amber)";
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:102,backdropFilter:"blur(12px) saturate(140%)",WebkitBackdropFilter:"blur(12px) saturate(140%)"}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:103,background:"var(--glass-bg-strong)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"1px solid var(--border)",borderRadius:20,width:"min(960px,94vw)",maxHeight:"88vh",display:"flex",flexDirection:"column",animation:"scaleIn .3s cubic-bezier(0.05,0.7,0.1,1)",boxShadow:"var(--modal-shadow)"}}>
        {/* Header */}
        <div style={{padding:"18px 24px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:14,fontWeight:700}}><Ic.Columns s={16}/>바이어 비교</div>
          <div style={{display:"flex",gap:16,marginLeft:8}}>
            {buyers.map(b=>(
              <div key={b.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 12px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:`${scoreColors(b.score)}22`,border:`1.5px solid ${scoreColors(b.score)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{b.name[0]}</div>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--t1)"}}>{b.name}</div>
                  <div style={{fontSize:10,color:"var(--t3)"}}>{b.flag} {b.company}</div>
                </div>
              </div>
            ))}
          </div>
          <div onClick={onClose} style={{marginLeft:"auto",cursor:"pointer",color:"var(--t4)",padding:4,borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.color="var(--t2)"} onMouseLeave={e=>e.currentTarget.style.color="var(--t4)"}><Ic.X s={18}/></div>
        </div>
        {/* Table */}
        <div style={{overflow:"auto",flex:1}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{position:"sticky",top:0,background:"var(--bg-2)",zIndex:5}}>
                <th style={{padding:"10px 20px",textAlign:"left",fontSize:11,fontWeight:700,color:"var(--t3)",width:140,borderBottom:"1px solid var(--border)"}}>항목</th>
                {buyers.map(b=>(
                  <th key={b.id} style={{padding:"10px 20px",textAlign:"center",fontSize:11,fontWeight:700,color:"var(--t1)",borderBottom:"1px solid var(--border)"}}>
                    {b.name}
                    <div style={{fontSize:10,color:scoreColors(b.score),fontFamily:"var(--mono)",marginTop:2}}>{b.score}점</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row,ri)=>(
                <tr key={row.key} style={{background:ri%2===0?"var(--bg-1)":"var(--bg-2)"}}>
                  <td style={{padding:"12px 20px",fontSize:11,fontWeight:600,color:"var(--t3)",borderBottom:"1px solid var(--border)"}}>{row.label}</td>
                  {buyers.map(b=>{
                    const best = isBest(row, b);
                    return (
                      <td key={b.id} style={{padding:"12px 20px",textAlign:"center",borderBottom:"1px solid var(--border)",background:best?"rgba(16,185,129,.08)":"transparent",border:best?"1px solid rgba(16,185,129,.2)":undefined,transition:"background .15s"}}>
                        <span style={{fontSize:12,fontWeight:best?700:400,color:best?"var(--green)":row.key==="score"?scoreColors(b.score):"var(--t1)"}}>
                          {row.fmt(b)}
                        </span>
                        {best && <span style={{marginLeft:5,fontSize:10,color:"var(--green)",fontWeight:700}}>✓ Best</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div style={{padding:"12px 24px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"var(--green)"}}/>
          <span style={{fontSize:11,color:"var(--t3)"}}>초록색 Best 항목은 해당 지표에서 가장 높은 값을 가진 바이어입니다.</span>
          <div onClick={onClose} style={{marginLeft:"auto",padding:"8px 20px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t2)",fontSize:12,fontWeight:600,cursor:"pointer"}}>닫기</div>
        </div>
      </div>
    </>
  );
}


// ─────────── LANDING HELPERS ───────────
function useInView(threshold=0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 마운트 직후 이미 뷰포트 안에 있으면 즉시 트리거 (IntersectionObserver는 비동기라 늦을 수 있음)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setInView(true); }, {threshold});
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function CountUp({end, suffix="", duration=1200}) {
  const [ref, inView] = useInView(0.1); // threshold 낮춤: 조금만 보여도 즉시 시작
  const [val, setVal] = useState(0);
  const hasRun = useRef(false); // 중복 실행 방지
  useEffect(() => {
    if(!inView || hasRun.current) return;
    hasRun.current = true;
    let rafId;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.floor(p * end));
      if(p < 1) rafId = requestAnimationFrame(tick);
      else setVal(end);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId); // 언마운트 시 RAF 정리
  }, [inView, end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─────────── MOBILE HELPERS ───────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function MobileDesktopBanner({ onClose }) {
  return (
    <>
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:299,backdropFilter:"blur(8px)"}} onClick={onClose}/>
      <div style={{position:"fixed",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
        zIndex:300,width:"calc(100% - 48px)",maxWidth:360,
        background:"var(--bg-1)",borderRadius:24,border:"1px solid var(--border)",
        padding:"40px 28px",textAlign:"center",animation:"scaleIn .3s ease"}}>
        <div style={{fontSize:48,marginBottom:20}}>💻</div>
        <h2 style={{fontSize:22,fontWeight:800,color:"var(--t1)",marginBottom:12,letterSpacing:"-.02em"}}>
          데스크탑에서 이용해 주세요
        </h2>
        <p style={{fontSize:14,color:"var(--t2)",lineHeight:1.8,marginBottom:32}}>
          NEXPORT 플랫폼은 바이어 탐색,<br/>
          이메일 발굴, AI 매칭 등<br/>
          데스크탑 환경에 최적화되어 있습니다.<br/>
          PC에서 접속하시면 최고의<br/>
          경험을 제공해 드립니다.
        </p>
        <div onClick={onClose}
          style={{padding:"13px 0",borderRadius:12,background:"var(--blue)",
            color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",
            transition:"opacity .15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          ← 돌아가기
        </div>
      </div>
    </>
  );
}

// ─────────── LANDING HERO ───────────
function LandingHero({ onEnter, isMobile }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  // ── 타이핑 애니메이션 ──
  const QUERIES = ["자동차 부품 독일 바이어", "PCB 제조 미국 바이어", "플라스틱 사출 유럽 바이어", "의료기기 일본 바이어"];
  const [qIdx, setQIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  useEffect(() => {
    const target = QUERIES[qIdx];
    if(isTyping) {
      if(typed.length < target.length) {
        const t = setTimeout(() => setTyped(target.slice(0, typed.length+1)), 65);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setIsTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if(typed.length > 0) {
        const t = setTimeout(() => setTyped(typed.slice(0,-1)), 28);
        return () => clearTimeout(t);
      } else {
        setQIdx(i => (i+1) % QUERIES.length);
        setIsTyping(true);
      }
    }
  }, [typed, isTyping, qIdx]);

  // ── How it Works inView ──
  const [howRef, howInView] = useInView(0.2);
  // ── ROI 비교 inView ──
  const [roiRef, roiInView] = useInView(0.15);
  // ── ROI 계산기 state ──
  const [tradeShowBudget, setTradeShowBudget] = useState(5000);
  const nexportMonthly = 30;
  const tradeShowConvRate = 0.01;
  const nexportConvRate = 0.08;
  const avgDealSize = 500;
  // ── Features inView ──
  const [featRef, featInView] = useInView(0.15);

  const features = [
    { icon: <Ic.Search s={20}/>, title: "바이어 탐색", desc: "60개국 산업·인증·지역별 고급 필터링으로 최적의 바이어를 즉시 발굴하세요", color: "var(--blue)", dim: "var(--blue-dim)" },
    { icon: <Ic.Mail s={20}/>, title: "이메일 파인더", desc: "Hunter.io 기반 실시간 바이어 이메일 검색 및 검증으로 직통 연락처 확보", color: "var(--cyan)", dim: "var(--cyan-dim)" },
    { icon: <Ic.Bar s={20}/>, title: "세일즈 대시보드", desc: "파이프라인 관리, KPI 지표, 전환율 분석을 한눈에 모니터링", color: "var(--amber)", dim: "var(--amber-dim)" },
    { icon: <Ic.Sparkle s={20}/>, title: "AI 매칭", desc: "제조사 프로필 기반 TOP 15 바이어 자동 추천 — 매칭 근거까지 설명", color: "var(--green)", dim: "var(--green-dim)" },
  ];

  const steps = [
    { num:"①", icon:<Ic.Search s={22}/>, title:"바이어 발굴", desc:"60개국 산업별 고급 필터링으로 최적 바이어 검색", color:"var(--blue)", dim:"var(--blue-dim)" },
    { num:"②", icon:<Ic.Mail s={22}/>, title:"이메일 확보", desc:"Hunter.io 기반 직통 연락처를 5분 내 즉시 발굴", color:"var(--cyan)", dim:"var(--cyan-dim)" },
    { num:"③", icon:<Ic.Sparkle s={22}/>, title:"AI 매칭", desc:"제조사 프로필 분석 후 TOP 15 바이어 자동 추천", color:"var(--violet)", dim:"var(--violet-dim)" },
  ];

  const mockBuyers = [
    { name:"Sarah Chen", company:"Pacific Trade Corp", flag:"🇺🇸", score:98, email:"sarah@pacifictrade.com" },
    { name:"Hans Mueller", company:"TechParts GmbH", flag:"🇩🇪", score:97, email:"hans@techparts.de" },
    { name:"Akiko Sato", company:"Lyon Aerospace", flag:"🇸🇪", score:96, email:"akiko@lyonaero..." },
  ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:100,background:"var(--bg-0)",overflowY:"auto",overflowX:"hidden"}}>
      {/* Ambient glows */}
      <div style={{position:"fixed",top:"-15%",left:"5%",width:"55vw",height:"55vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(10,132,255,0.07) 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-5%",right:"0%",width:"45vw",height:"45vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(191,90,242,0.05) 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>

      {/* ① STICKY NAV */}
      <div style={{position:"sticky",top:0,zIndex:200,background:"var(--glass-bg)",backdropFilter:"blur(20px) saturate(180%)",WebkitBackdropFilter:"blur(20px) saturate(180%)",borderBottom:"1px solid var(--border)",opacity:visible?1:0,transition:"opacity .5s ease"}}>
        <div style={{maxWidth:1080,margin:"0 auto",padding:isMobile?"0 16px":"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <NexportLogo iconSize={isMobile?24:28} textSize={isMobile?15:17}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div onClick={onEnter} style={{padding:"7px 18px",borderRadius:8,border:"1px solid var(--border)",color:"var(--t2)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .18s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-h)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>로그인</div>
            <div onClick={onEnter} style={{padding:"7px 18px",borderRadius:8,background:"var(--blue)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .18s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>플랫폼 시작 →</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1080,margin:"0 auto",padding:isMobile?"0 16px":"0 28px",position:"relative",zIndex:1}}>

        {/* ② HERO */}
        <div style={{textAlign:"center",padding:"80px 0 48px",opacity:visible?1:0,transform:visible?"none":"translateY(24px)",transition:"all .75s cubic-bezier(0.2,0,0,1) .05s"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,background:"var(--blue-dim)",border:"1px solid rgba(10,132,255,.25)",fontSize:11,fontWeight:600,color:"var(--blue)",marginBottom:24,letterSpacing:".04em"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--blue)",display:"inline-block",animation:"pulse 1.5s infinite"}}/>
            AI-Powered Export Platform
          </div>
          <h1 style={{fontSize:isMobile?"clamp(30px,8vw,40px)":52,fontWeight:900,lineHeight:1.15,letterSpacing:"-.04em",marginBottom:20}}>
            <span style={{color:"var(--t1)"}}>수출 바이어 발굴,</span><br/>
            <span style={{background:"linear-gradient(120deg,var(--blue),var(--cyan) 60%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>AI로 10배 빠르게</span>
          </h1>
          <p style={{fontSize:isMobile?14:17,color:"var(--t2)",maxWidth:560,margin:"0 auto 36px",lineHeight:1.75}}>
            바이어 발굴부터 이메일 확보, AI 매칭까지.<br/>수출의 모든 과정을 하나의 플랫폼에서.
          </p>

          {/* 타이핑 검색창 */}
          <div style={{maxWidth:580,margin:"0 auto 32px",display:"flex",alignItems:"center",flexDirection:isMobile?"column":"row",gap:0,borderRadius:14,border:"1px solid var(--border-h)",background:"var(--bg-2)",overflow:"hidden",boxShadow:"var(--card-shadow)"}}>
            <div style={{padding:"0 16px",color:"var(--t3)",display:"flex",alignItems:"center"}}><Ic.Search s={16}/></div>
            <div style={{flex:1,padding:"14px 0",fontSize:15,color:"var(--t1)",textAlign:"left",fontFamily:"var(--font)",minHeight:22}}>
              {typed}
              <span style={{display:"inline-block",width:2,height:"1em",background:"var(--blue)",marginLeft:1,verticalAlign:"text-bottom",animation:"typingCursor 1s step-end infinite"}}/>
            </div>
            <div onClick={onEnter} style={{padding:"10px 20px",margin:6,borderRadius:9,background:"var(--blue)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",transition:"all .18s",flexShrink:0,width:isMobile?"calc(100% - 12px)":undefined,textAlign:isMobile?"center":undefined}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>바이어 찾기 →</div>
          </div>

          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <div onClick={onEnter} style={{padding:"13px 34px",borderRadius:10,background:"var(--blue)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",animation:"glowPulse 3s ease-in-out infinite",transition:"transform .2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              무료로 시작하기
            </div>
            <div onClick={onEnter} style={{padding:"13px 34px",borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",color:"var(--t1)",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all .18s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-h)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
              데모 보기
            </div>
          </div>
        </div>

        {/* ③ PRODUCT PREVIEW CARD — 데스크탑 전용 */}
        {!isMobile && <div style={{display:"flex",justifyContent:"center",padding:"0 0 72px",opacity:visible?1:0,transform:visible?"none":"translateY(30px)",transition:"all .9s cubic-bezier(0.2,0,0,1) .2s"}}>
          <div style={{width:"100%",maxWidth:720,borderRadius:16,overflow:"hidden",boxShadow:"var(--modal-shadow)",border:"1px solid var(--border)",background:"var(--bg-1)",animation:"floatCard 5s ease-in-out infinite",position:"relative"}}>
            {/* 가짜 윈도우 헤더 */}
            <div style={{padding:"10px 16px",background:"var(--bg-2)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
              <div style={{display:"flex",gap:6}}>{["#FF5F57","#FFBD2E","#28C940"].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}</div>
              <div style={{flex:1,textAlign:"center",fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>nexport.io/buyers</div>
            </div>
            {/* 테이블 헤더 */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 0.8fr 2fr",gap:0,padding:"10px 20px",background:"var(--bg-2)",borderBottom:"1px solid var(--border)"}}>
              {["바이어","기업명","점수","이메일"].map(h=><div key={h} style={{fontSize:11,fontWeight:600,color:"var(--t3)",letterSpacing:".04em"}}>{h}</div>)}
            </div>
            {/* 테이블 행 */}
            {mockBuyers.map((b,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 0.8fr 2fr",gap:0,padding:"13px 20px",borderBottom:"1px solid var(--border)",alignItems:"center",background:i%2===0?"transparent":"rgba(120,120,128,0.03)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,var(--blue),var(--violet))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{b.name[0]}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{b.name}</div>
                    <div style={{fontSize:10,color:"var(--t3)"}}>{b.company}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:"var(--t2)"}}>{b.flag} {b.company.split(" ")[0]}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"var(--green)"}}>{b.score}</div>
                </div>
                <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>{b.email}</div>
              </div>
            ))}
            {/* 더 보기 */}
            <div style={{padding:"12px 20px",textAlign:"center",fontSize:12,color:"var(--t3)"}}>
              <span style={{color:"var(--blue)",fontWeight:600,cursor:"pointer"}} onClick={onEnter}>+ 57개 바이어 더 보기</span>
            </div>
            {/* 하단 fade overlay */}
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(transparent,var(--bg-1))",pointerEvents:"none"}}/>
          </div>
        </div>}

        {/* ④ HOW IT WORKS */}
        <div ref={howRef} style={{padding:"0 0 80px"}}>
          <div style={{textAlign:"center",marginBottom:48,opacity:howInView?1:0,transform:howInView?"none":"translateY(20px)",transition:"all .6s cubic-bezier(0.2,0,0,1)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",textTransform:"uppercase",letterSpacing:".12em",marginBottom:10}}>How it works</div>
            <h2 style={{fontSize:isMobile?22:32,fontWeight:800,letterSpacing:"-.03em",color:"var(--t1)"}}>NEXPORT로 수출 바이어를 찾는 방법</h2>
            <p style={{fontSize:isMobile?13:15,color:"var(--t3)",marginTop:10}}>단 3단계로 검증된 글로벌 바이어와 연결하세요</p>
          </div>
          <div className="hiw-grid" style={{display:isMobile?"flex":"grid",flexDirection:isMobile?"column":undefined,gridTemplateColumns:isMobile?undefined:"1fr auto 1fr auto 1fr",gap:isMobile?"16px":0,alignItems:isMobile?"stretch":"start"}}>
            {steps.map((s,i) => (
              <>
                <div key={`step-${i}`} style={{textAlign:"center",padding:"0 12px",opacity:howInView?1:0,animation:howInView?`staggerUp .6s cubic-bezier(0.2,0,0,1) ${i*200}ms both`:"none"}}>
                  <div style={{width:56,height:56,borderRadius:16,background:s.dim,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:s.color,border:`1px solid ${s.color}33`}}>
                    {s.icon}
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:s.color,letterSpacing:".06em",marginBottom:6}}>{s.num}</div>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--t1)",marginBottom:8}}>{s.title}</div>
                  <div style={{fontSize:13,color:"var(--t3)",lineHeight:1.65}}>{s.desc}</div>
                </div>
                {i < steps.length-1 && (
                  <div key={`line-${i}`} className="hiw-connector" style={{display:"flex",alignItems:"center",paddingTop:28}}>
                    <div style={{height:2,width:howInView?60:0,background:`linear-gradient(90deg,${steps[i].color},${steps[i+1].color})`,borderRadius:2,transition:`width .8s cubic-bezier(0.2,0,0,1) ${i*200+300}ms`,opacity:howInView?1:0}}/>
                    <div style={{color:"var(--t4)",fontSize:16,marginLeft:4,opacity:howInView?1:0,transition:`opacity .4s ${i*200+400}ms`}}>→</div>
                  </div>
                )}
              </>
            ))}
          </div>
        </div>

        {/* ⑤ STATS BAR */}
        <div style={{margin:"0 0 80px",padding:"36px 0",borderRadius:16,background:"var(--bg-2)",border:"1px solid var(--border)"}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:0}}>
            {[
              {end:60,suffix:"개국+",label:"글로벌 바이어 DB",color:"var(--blue)"},
              {end:98,suffix:"%",label:"이메일 정확도",color:"var(--green)"},
              {end:5,suffix:"분 내",label:"바이어 발굴 시간",color:"var(--amber)"},
              {end:15,suffix:"개국",label:"국가 커버리지",color:"var(--cyan)"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",padding:"16px 12px",
                borderRight:isMobile?(i%2===0?"1px solid var(--border)":"none"):(i<3?"1px solid var(--border)":"none"),
                borderBottom:isMobile&&i<2?"1px solid var(--border)":"none"}}>
                <div style={{fontSize:isMobile?28:36,fontWeight:900,fontFamily:"var(--mono)",color:s.color,letterSpacing:"-.02em",lineHeight:1.1}}>
                  <CountUp end={s.end} suffix={s.suffix} duration={1400}/>
                </div>
                <div style={{fontSize:11,color:"var(--t3)",marginTop:6,fontWeight:500}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ⑤-B ROI 비교 위젯 */}
        <div ref={roiRef} style={{margin:"0 0 80px"}}>
          <div style={{textAlign:"center",marginBottom:isMobile?28:44,opacity:roiInView?1:0,transform:roiInView?"none":"translateY(16px)",transition:"all .6s cubic-bezier(0.2,0,0,1)"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:20,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.28)",fontSize:11,fontWeight:700,color:"var(--amber)",marginBottom:12,letterSpacing:".04em"}}>
              실제 수출 영업 담당자 VOC
            </div>
            <h2 style={{fontSize:isMobile?22:32,fontWeight:800,letterSpacing:"-.03em",color:"var(--t1)"}}>
              기존 방식으로 <span style={{color:"rgba(255,69,58,1)"}}>얼마나 낭비</span>하고 있나요?
            </h2>
            <p style={{fontSize:isMobile?13:15,color:"var(--t3)",marginTop:10}}>
              수출 경력 10년+ 실무자 인터뷰 기반 — 연 매출 4,000억 중견기업 &amp; 100억 중소기업
            </p>
          </div>

          {/* 비교 카드 */}
          <div style={{display:isMobile?"flex":"grid",flexDirection:isMobile?"column":undefined,gridTemplateColumns:isMobile?undefined:"1fr 56px 1fr",gap:isMobile?"12px":0,alignItems:"stretch",opacity:roiInView?1:0,transform:roiInView?"none":"translateY(20px)",transition:"all .7s cubic-bezier(0.2,0,0,1) .15s"}}>
            {/* 기존 방식 */}
            <div style={{padding:isMobile?"22px 18px":"32px",borderRadius:16,background:"rgba(255,69,58,.04)",border:"1px solid rgba(255,69,58,.2)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
                <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,69,58,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>❌</div>
                <div style={{fontSize:14,fontWeight:700,color:"rgba(255,69,58,1)"}}>기존 영업 방식</div>
              </div>
              {[
                {label:"해외 전시회 1회 비용",value:"~5,000만원",sub:"항공·숙박·부스·인건비 포함"},
                {label:"Cold Email 응답률",value:"1% 미만",sub:"\"3년 보냈는데 실계약 0건\" — Scott"},
                {label:"바이어 발굴까지 걸리는 시간",value:"수 개월",sub:"준비 → 현장 미팅 → 팔로업 전 과정"},
                {label:"검증 바이어 전환율",value:"1% 미만",sub:"전시회 방문객 대비 실계약 비율"},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"11px 0",borderBottom:i<3?"1px solid rgba(255,69,58,.1)":"none"}}>
                  <div style={{flex:1,paddingRight:12}}>
                    <div style={{fontSize:12,color:"var(--t2)",fontWeight:500,lineHeight:1.4}}>{item.label}</div>
                    <div style={{fontSize:10,color:"var(--t4)",marginTop:2,lineHeight:1.4,fontStyle:"italic"}}>{item.sub}</div>
                  </div>
                  <div style={{fontSize:15,fontWeight:800,color:"rgba(255,69,58,1)",textAlign:"right",flexShrink:0,whiteSpace:"nowrap"}}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* VS */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:900,color:"var(--t4)",letterSpacing:".06em",padding:isMobile?"4px 0":"0",textAlign:"center"}}>VS</div>
            </div>

            {/* NEXPORT */}
            <div style={{padding:isMobile?"22px 18px":"32px",borderRadius:16,background:"rgba(16,185,129,.05)",border:"1px solid rgba(16,185,129,.25)",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,padding:"4px 14px",background:"var(--green)",borderRadius:"0 16px 0 12px",fontSize:10,fontWeight:700,color:"#fff",letterSpacing:".04em"}}>NEXPORT</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
                <div style={{width:28,height:28,borderRadius:8,background:"rgba(16,185,129,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✅</div>
                <div style={{fontSize:14,fontWeight:700,color:"var(--green)"}}>NEXPORT 사용 시</div>
              </div>
              {[
                {label:"월 이용 요금",value:"30만원",sub:"3개월 구독 기준 / 전시회 대비 167배↓"},
                {label:"바이어 매칭 방식",value:"AI 정밀 매칭",sub:"규제·인증·산업·지역별 스코어링"},
                {label:"바이어 발굴까지 걸리는 시간",value:"5분",sub:"검색 → 이메일 확보 → AI 추천 즉시"},
                {label:"글로벌 바이어 접근",value:"즉시",sub:"60개국 검증된 바이어 DB 즉시 접근"},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"11px 0",borderBottom:i<3?"1px solid rgba(16,185,129,.12)":"none"}}>
                  <div style={{flex:1,paddingRight:12}}>
                    <div style={{fontSize:12,color:"var(--t2)",fontWeight:500,lineHeight:1.4}}>{item.label}</div>
                    <div style={{fontSize:10,color:"var(--t4)",marginTop:2,lineHeight:1.4,fontStyle:"italic"}}>{item.sub}</div>
                  </div>
                  <div style={{fontSize:15,fontWeight:800,color:"var(--green)",textAlign:"right",flexShrink:0,whiteSpace:"nowrap"}}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* VOC 인용 */}
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16,marginTop:20,opacity:roiInView?1:0,transform:roiInView?"none":"translateY(16px)",transition:"all .7s cubic-bezier(0.2,0,0,1) .3s"}}>
            {[
              {quote:"전시회에 5,000만원 쏟아부었는데, 실제로 이어진 계약은 손에 꼽아요. 그마저도 3년 뒤에나 됐고.",name:"Scott",role:"연 매출 4,000억 중견기업 · 자동차 부품 수출 담당"},
              {quote:"3년간 cold email 보냈는데 응답이 거의 없었어요. 검증된 바이어를 찾는 게 가장 큰 문제예요.",name:"Peter",role:"연 매출 100억 중소기업 · 수처리 장비 수출 담당"},
            ].map((q,i)=>(
              <div key={i} style={{padding:"20px 22px",borderRadius:14,background:"var(--bg-2)",border:"1px solid var(--border)"}}>
                <div style={{fontSize:24,color:"var(--t4)",lineHeight:1,marginBottom:8,fontFamily:"Georgia,serif"}}>"</div>
                <p style={{fontSize:13,color:"var(--t2)",lineHeight:1.75,fontStyle:"italic",margin:"0 0 14px"}}>{q.quote}</p>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,var(--blue),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{q.name[0]}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"var(--t1)"}}>{q.name}</div>
                    <div style={{fontSize:10,color:"var(--t4)"}}>{q.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ⑤-C 인터랙티브 ROI 계산기 */}
        {!isMobile && (
          <div style={{margin:"0 0 80px",padding:"36px 40px",borderRadius:20,background:"var(--bg-2)",border:"1px solid var(--border)",opacity:roiInView?1:0,transform:roiInView?"none":"translateY(16px)",transition:"all .7s cubic-bezier(0.2,0,0,1) .5s"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
              <div style={{width:32,height:32,borderRadius:8,background:"rgba(245,158,11,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧮</div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:"var(--t1)"}}>나의 ROI 직접 계산해보기</div>
                <div style={{fontSize:12,color:"var(--t3)",marginTop:2}}>연간 전시회 예산을 입력하면 NEXPORT 대비 절감액을 즉시 계산합니다</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"center"}}>
              {/* 슬라이더 */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
                  <label style={{fontSize:12,fontWeight:700,color:"var(--t2)"}}>연간 전시회 예산</label>
                  <span style={{fontSize:22,fontWeight:900,color:"rgba(255,69,58,1)",fontFamily:"var(--mono)"}}>{tradeShowBudget.toLocaleString()}만원</span>
                </div>
                <input type="range" min={500} max={20000} step={500} value={tradeShowBudget}
                  onChange={e=>setTradeShowBudget(Number(e.target.value))}
                  style={{width:"100%",accentColor:"var(--blue)",cursor:"pointer"}}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--t4)",marginTop:4}}>
                  <span>500만원</span><span>2억원</span>
                </div>
                <div style={{marginTop:16,display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[1000,3000,5000,10000].map(v=>(
                    <div key={v} onClick={()=>setTradeShowBudget(v)}
                      style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .15s",
                        background:tradeShowBudget===v?"var(--blue)":"var(--bg-3)",
                        color:tradeShowBudget===v?"#fff":"var(--t3)",
                        border:`1px solid ${tradeShowBudget===v?"var(--blue)":"var(--border)"}`}}>
                      {(v/1000).toFixed(0)}천만
                    </div>
                  ))}
                </div>
              </div>
              {/* 결과 */}
              <div style={{display:"grid",gap:12}}>
                {[
                  {label:"전시회 연간 비용",value:`${tradeShowBudget.toLocaleString()}만원`,sub:`${Math.round(tradeShowBudget*tradeShowConvRate)}만원 가치의 계약 (전환율 ${(tradeShowConvRate*100).toFixed(0)}%)`,color:"rgba(255,69,58,1)",bg:"rgba(255,69,58,.06)",border:"rgba(255,69,58,.2)"},
                  {label:"NEXPORT 연간 비용",value:`${(nexportMonthly*12).toLocaleString()}만원`,sub:`${Math.round(tradeShowBudget*nexportConvRate/tradeShowConvRate*nexportMonthly*12/tradeShowBudget)}배 더 많은 바이어 접근 가능`,color:"var(--green)",bg:"rgba(16,185,129,.06)",border:"rgba(16,185,129,.2)"},
                  {label:"연간 절감액",value:`${(tradeShowBudget - nexportMonthly*12).toLocaleString()}만원`,sub:`NEXPORT 전환 시 즉시 절약 — ${Math.round((1-nexportMonthly*12/tradeShowBudget)*100)}% 비용 절감`,color:"var(--cyan)",bg:"rgba(34,211,238,.06)",border:"rgba(34,211,238,.2)"},
                ].map((item,i)=>(
                  <div key={i} style={{padding:"12px 16px",borderRadius:10,background:item.bg,border:`1px solid ${item.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                    <div>
                      <div style={{fontSize:11,color:"var(--t3)",fontWeight:500}}>{item.label}</div>
                      <div style={{fontSize:10,color:"var(--t4)",marginTop:2}}>{item.sub}</div>
                    </div>
                    <div style={{fontSize:17,fontWeight:900,color:item.color,fontFamily:"var(--mono)",flexShrink:0}}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ⑤-M MISSION / VISION — 모바일 전용 */}
        {isMobile && (
          <div style={{padding:"0 0 60px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:28}}>
              Our Purpose
            </div>
            {[
              { label:"Mission",
                text:'"한국 제조업체가 세계 어디서나 검증된 바이어를 5분 안에 찾을 수 있는 세상"' },
              { label:"Vision",
                text:'"AI로 수출 장벽을 없애, 모든 중소기업이 글로벌 플레이어가 되는 미래"' }
            ].map((item,i)=>(
              <div key={i} style={{marginBottom:i===0?16:0,padding:"28px 22px",
                borderRadius:16,background:"var(--bg-2)",border:"1px solid var(--border)",
                textAlign:"left",animation:howInView?`staggerUp .5s ease ${i*150}ms both`:"none"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",
                  letterSpacing:".1em",marginBottom:10}}>{item.label}</div>
                <p style={{fontSize:16,fontWeight:600,color:"var(--t1)",
                  lineHeight:1.75,fontFamily:"var(--serif)",fontStyle:"italic",margin:0}}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ⑥ FEATURES GRID — 데스크탑 전용 */}
        {!isMobile &&
        <div ref={featRef} style={{padding:"0 0 80px"}}>
          <div style={{textAlign:"center",marginBottom:40,opacity:featInView?1:0,transform:featInView?"none":"translateY(16px)",transition:"all .6s cubic-bezier(0.2,0,0,1)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",textTransform:"uppercase",letterSpacing:".12em",marginBottom:10}}>Features</div>
            <h2 style={{fontSize:32,fontWeight:800,letterSpacing:"-.03em",color:"var(--t1)"}}>수출 전 과정을 하나의 플랫폼에서</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
            {features.map((f,i)=>(
              <div key={i} style={{padding:"28px 28px 24px",borderRadius:14,background:"var(--bg-2)",border:"1px solid var(--border)",boxShadow:"var(--card-shadow)",transition:"all .25s cubic-bezier(0.2,0,0,1)",cursor:"default",opacity:featInView?1:0,animation:featInView?`staggerUp .55s cubic-bezier(0.2,0,0,1) ${i*110}ms both`:"none",position:"relative",overflow:"hidden"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=f.color+"55";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="var(--glass-shadow)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="var(--card-shadow)"}}>
                <div style={{width:46,height:46,borderRadius:12,background:f.dim,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,color:f.color,border:`1px solid ${f.color}22`}}>{f.icon}</div>
                <div style={{fontSize:16,fontWeight:700,color:"var(--t1)",marginBottom:8}}>{f.title}</div>
                <div style={{fontSize:13,color:"var(--t3)",lineHeight:1.65}}>{f.desc}</div>
                <div style={{position:"absolute",bottom:20,right:20,fontSize:16,color:f.color,opacity:.5}}>→</div>
              </div>
            ))}
          </div>
        </div>}

        {/* ⑦ BOTTOM CTA */}
        <div style={{margin:"0 0 60px",padding:isMobile?"40px 20px":"56px 40px",borderRadius:20,background:"linear-gradient(135deg,rgba(10,132,255,.09),rgba(191,90,242,.06))",border:"1px solid rgba(10,132,255,.18)",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"60%",height:"60%",borderRadius:"50%",background:"radial-gradient(circle,rgba(10,132,255,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <h2 style={{fontSize:isMobile?26:36,fontWeight:900,letterSpacing:"-.03em",color:"var(--t1)",marginBottom:12}}>지금 NEXPORT를 시작하세요</h2>
            <p style={{fontSize:isMobile?14:16,color:"var(--t2)",marginBottom:32,lineHeight:1.7}}>바이어 발굴에 소비하던 시간을 계약에 투자하세요.<br/>AI가 검증된 글로벌 바이어를 5분 내에 찾아드립니다.</p>
            <div onClick={onEnter} style={{display:"inline-block",padding:isMobile?"14px 32px":"15px 44px",borderRadius:12,background:"var(--blue)",color:"#fff",fontSize:isMobile?14:16,fontWeight:700,cursor:"pointer",animation:"glowPulse 2.5s ease-in-out infinite",transition:"transform .2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              무료로 시작하기 →
            </div>
            <div style={{marginTop:14,fontSize:12,color:"var(--t4)"}}>신용카드 불필요 · 즉시 시작 · 60개국 바이어 DB 즉시 접근</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",padding:"24px 0 40px",borderTop:"1px solid var(--border)"}}>
          <div style={{fontSize:11,color:"var(--t4)"}}>© 2026 NEXPORT. AI 기반 수출 바이어 매칭 플랫폼</div>
        </div>
      </div>
    </div>
  );
}


// ─────────── AI MATCH VIEW ───────────
function AIMatchView({ buyers }) {
  const [step, setStep] = useState("input");
  const [profile, setProfile] = useState({ company:"", product:"", industry:"", certs:[], regions:[], preferRegulated:false });
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const industries = ["자동차 부품","전자부품","의료기기","화학/소재","기계/장비","섬유/의류","식품/농산물","건축자재","플라스틱/고무","에너지/환경"];
  const certList = ["ISO 9001","ISO 14001","IATF 16949","UL","CE","FDA","KS","ROHS","REACH","GMP"];
  const regionList = ["유럽","북미","아시아","동남아","오세아니아","남미","중동","아프리카"];

  const toggleArr = (arr, setFn, key, val) => {
    const cur = profile[key];
    setProfile(p=>({...p,[key]:cur.includes(val)?cur.filter(v=>v!==val):[...cur,val]}));
  };

  const runAnalysis = () => {
    setStep("analyzing");
    setProgress(0);
    const steps = ["데이터 로딩","산업 매칭","인증 체크","지역 수요","AI 점수"];
    let i = 0;
    const timer = setInterval(()=>{
      i++;
      setProgress(i);
      if (i >= steps.length) {
        clearInterval(timer);
        setTimeout(()=>{
          const scored = buyers.map(b => {
            let s = b.score || 50;
            if (profile.industry && b.industry && b.industry.includes(profile.industry.slice(0,2))) s += 15;
            if (profile.regions.some(r => {
              if (r==="유럽") return ["독일","프랑스","영국","스웨덴","네덜란드","이탈리아","스페인","폴란드"].includes(b.country);
              if (r==="북미") return ["미국","캐나다","멕시코"].includes(b.country);
              if (r==="아시아") return ["일본","중국","대만","한국"].includes(b.country);
              if (r==="동남아") return ["베트남","태국","인도네시아","말레이시아","싱가포르","필리핀"].includes(b.country);
              return false;
            })) s += 10;
            if (profile.certs.length > 0 && b.certifications) {
              const matched = profile.certs.filter(c => b.certifications.includes(c));
              s += matched.length * 5;
            }
            if (profile.product && b.demand && b.demand.toLowerCase().includes(profile.product.toLowerCase().slice(0,3))) s += 8;
            if (b.buyingIntent === "높음") s += 10;
            else if (b.buyingIntent === "중간") s += 5;
            if (profile.preferRegulated && b.regulatoryShield && b.regulatoryShield.length > 0) s += 20;
            const matchPct = Math.min(99, Math.round(s * 1.1));
            const reasons = [];
            if (profile.industry && b.industry) reasons.push("산업 매칭");
            if (profile.regions.length > 0) reasons.push("타겟 지역");
            if (profile.certs.length > 0 && b.certifications && b.certifications.some(c=>profile.certs.includes(c))) reasons.push("인증 일치");
            if (b.buyingIntent === "높음") reasons.push("구매의향 높음");
            if (profile.preferRegulated && b.regulatoryShield && b.regulatoryShield.length > 0) reasons.push("규제 보호 시장");
            return { ...b, aiScore: s, matchPct, reasons: reasons.slice(0,3) };
          }).sort((a,b) => b.aiScore - a.aiScore).slice(0, 15);
          setResults(scored);
          setStep("results");
        }, 500);
      }
    }, 600);
  };

  const exportCSV = () => {
    if (!results) return;
    const csv = "순위,바이어,회사,국가,산업,매칭률,추천사유\n" + results.map((r,i) => `${i+1},${r.name},${r.company},${r.country},${r.industry},${r.matchPct}%,"${r.reasons.join(", ")}"`).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `nexport-ai-match-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const cColor = (s) => s>=85?"var(--green)":s>=70?"var(--cyan)":s>=55?"var(--amber)":"var(--red)";
  const tagStyle = (active) => ({padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .15s",background:active?"var(--blue)":"var(--bg-3)",color:active?"#fff":"var(--t3)",border:`1px solid ${active?"var(--blue)":"var(--border)"}`});

  const cardStyle = {padding:20,borderRadius:12,background:"var(--bg-2)",border:"1px solid var(--border)"};

  if (step === "input") return (
    <div style={{flex:1,overflow:"auto",padding:24}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32,animation:"fadeIn .4s ease"}}>
          <div style={{width:48,height:48,borderRadius:12,background:"var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Ic.Sparkle s={22}/></div>
          <h2 style={{fontSize:22,fontWeight:800,marginBottom:6}}>AI 매칭 추천</h2>
          <p style={{fontSize:13,color:"var(--t3)"}}>제조사 프로필을 입력하면 AI가 최적의 바이어를 추천합니다</p>
        </div>

        <div style={{...cardStyle,marginBottom:16,animation:"fadeIn .4s ease .1s",animationFillMode:"both"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:6}}><Ic.Users s={14}/>기본 정보</div>
          <div style={{display:"grid",gap:12}}>
            <div>
              <label style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:4,display:"block"}}>회사명</label>
              <input value={profile.company} onChange={e=>setProfile(p=>({...p,company:e.target.value}))} placeholder="예: 한국정밀부품(주)" style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t1)",fontSize:12,outline:"none"}} />
            </div>
            <div>
              <label style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:4,display:"block"}}>주력 제품</label>
              <input value={profile.product} onChange={e=>setProfile(p=>({...p,product:e.target.value}))} placeholder="예: CNC 정밀가공 부품, 자동차 브레이크 패드" style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t1)",fontSize:12,outline:"none"}} />
            </div>
          </div>
        </div>

        <div style={{...cardStyle,marginBottom:16,animation:"fadeIn .4s ease .2s",animationFillMode:"both"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:6}}><Ic.Grid s={14}/>산업 분야</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {industries.map(ind=>(
              <div key={ind} onClick={()=>setProfile(p=>({...p,industry:p.industry===ind?"":ind}))} style={tagStyle(profile.industry===ind)}>{ind}</div>
            ))}
          </div>
        </div>

        <div style={{...cardStyle,marginBottom:16,animation:"fadeIn .4s ease .3s",animationFillMode:"both"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:6}}><Ic.Shield s={14}/>보유 인증</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {certList.map(c=>(
              <div key={c} onClick={()=>toggleArr(null,null,"certs",c)} style={tagStyle(profile.certs.includes(c))}>{c}</div>
            ))}
          </div>
        </div>

        <div style={{...cardStyle,marginBottom:24,animation:"fadeIn .4s ease .4s",animationFillMode:"both"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:6}}><Ic.Globe s={14}/>타겟 수출 지역</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {regionList.map(r=>(
              <div key={r} onClick={()=>toggleArr(null,null,"regions",r)} style={tagStyle(profile.regions.includes(r))}>{r}</div>
            ))}
          </div>
        </div>

        <div onClick={()=>setProfile(p=>({...p,preferRegulated:!p.preferRegulated}))}
          style={{...cardStyle,marginBottom:16,animation:"fadeIn .4s ease .45s",animationFillMode:"both",cursor:"pointer",
            border:`1px solid ${profile.preferRegulated?"var(--green)":"var(--border)"}`,
            background:profile.preferRegulated?"rgba(16,185,129,.06)":"var(--bg-2)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:9,background:profile.preferRegulated?"var(--green-dim)":"var(--bg-3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>🛡</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:profile.preferRegulated?"var(--green)":"var(--t1)"}}>규제 보호 바이어 우선 매칭</div>
              <div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>중국산 규제·인증 필수·Buy American 등 한국산이 유리한 바이어를 상위에 배치</div>
            </div>
            <div style={{width:20,height:20,borderRadius:10,border:`2px solid ${profile.preferRegulated?"var(--green)":"var(--border)"}`,background:profile.preferRegulated?"var(--green)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
              {profile.preferRegulated&&<Ic.Check s={10}/>}
            </div>
          </div>
        </div>

        <div onClick={runAnalysis} style={{width:"100%",padding:"14px 0",borderRadius:10,background:"linear-gradient(135deg,var(--green),#0d9488)",color:"#fff",textAlign:"center",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .2s",boxShadow:"0 4px 16px rgba(16,185,129,.3)",animation:"fadeIn .4s ease .5s",animationFillMode:"both"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(16,185,129,.4)"}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 16px rgba(16,185,129,.3)"}}>
          <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Ic.Sparkle s={16}/>AI 매칭 분석 시작</span>
        </div>
      </div>
    </div>
  );

  if (step === "analyzing") {
    const steps = ["데이터 로딩","산업 매칭 분석","인증 호환성 체크","지역 수요 분석","AI 점수 산정"];
    return (
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center",maxWidth:400,animation:"fadeIn .4s ease"}}>
          <div style={{width:56,height:56,borderRadius:14,background:"var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Ic.Sparkle s={24}/></div>
          <h3 style={{fontSize:18,fontWeight:800,marginBottom:6}}>AI 분석 중...</h3>
          <p style={{fontSize:12,color:"var(--t3)",marginBottom:24}}>바이어 데이터를 분석하고 있습니다</p>
          <div style={{display:"grid",gap:10,textAlign:"left"}}>
            {steps.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderRadius:8,background:i<progress?"var(--green-dim)":i===progress?"var(--bg-3)":"var(--bg-2)",border:`1px solid ${i<progress?"rgba(16,185,129,.2)":"var(--border)"}`,transition:"all .3s ease"}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:i<progress?"var(--green)":i===progress?"var(--amber)":"var(--bg-4)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}>
                  {i<progress ? <Ic.Check s={10}/> : i===progress ? <div style={{width:6,height:6,borderRadius:"50%",background:"var(--amber)",animation:"pulse 1s infinite"}}/> : null}
                </div>
                <span style={{fontSize:12,fontWeight:600,color:i<=progress?"var(--t1)":"var(--t4)"}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results
  const topScore = results?.[0]?.matchPct || 0;
  const avgScore = results ? Math.round(results.reduce((a,b)=>a+b.matchPct,0)/results.length) : 0;
  const highIntent = results ? results.filter(r=>r.buyingIntent==="높음").length : 0;

  return (
    <div style={{flex:1,overflow:"auto",padding:24}}>
      <div style={{maxWidth:800,margin:"0 auto"}}>
        {/* Summary Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20,animation:"fadeIn .4s ease"}}>
          {[{label:"최고 매칭률",val:`${topScore}%`,color:"var(--green)"},{label:"평균 매칭률",val:`${avgScore}%`,color:"var(--cyan)"},{label:"구매의향 높음",val:`${highIntent}명`,color:"var(--amber)"}].map((s,i)=>(
            <div key={i} style={{padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"var(--mono)",color:s.color}}>{s.val}</div>
              <div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{display:"flex",gap:8,marginBottom:20,animation:"fadeIn .4s ease .1s",animationFillMode:"both"}}>
          <div onClick={exportCSV} style={{padding:"8px 16px",borderRadius:7,background:"var(--bg-3)",border:"1px solid var(--border)",cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--t2)",display:"flex",alignItems:"center",gap:5}}><Ic.Download s={12}/>CSV 내보내기</div>
          <div onClick={()=>{setStep("input");setResults(null);}} style={{padding:"8px 16px",borderRadius:7,background:"var(--bg-3)",border:"1px solid var(--border)",cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--t2)",display:"flex",alignItems:"center",gap:5}}><Ic.Search s={12}/>다시 검색</div>
        </div>

        {/* Results List */}
        <div style={{display:"grid",gap:10}}>
          {results && results.map((r,i)=>(
            <div key={r.id} style={{padding:16,borderRadius:12,background:"var(--bg-2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:14,animation:`fadeIn .3s ease ${i*0.05}s`,animationFillMode:"both",transition:"border-color .2s",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-h)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
              {/* Rank */}
              <div style={{width:32,height:32,borderRadius:8,background:i<3?`linear-gradient(135deg,${i===0?"var(--green),#0d9488":i===1?"var(--cyan),var(--blue)":"var(--amber),var(--orange)"})`:"var(--bg-4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:i<3?"#fff":"var(--t3)",flexShrink:0}}>{i+1}</div>
              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:13,fontWeight:700}}>{r.name}</span>
                  <span style={{fontSize:11,color:"var(--t3)"}}>{r.flag} {r.company}</span>
                </div>
                <div style={{fontSize:11,color:"var(--t3)",marginTop:3}}>{r.title} · {r.industry} · {r.demand}</div>
                <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                  {r.reasons.map((reason,ri)=>(
                    <span key={ri} style={{padding:"2px 7px",borderRadius:4,background:"var(--green-dim)",color:"var(--green)",fontSize:9,fontWeight:600,border:"1px solid rgba(16,185,129,.15)"}}>{reason}</span>
                  ))}
                </div>
              </div>
              {/* Score Ring */}
              <div style={{position:"relative",width:48,height:48,flexShrink:0}}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="var(--bg-4)" strokeWidth="3"/>
                  <circle cx="24" cy="24" r="20" fill="none" stroke={cColor(r.matchPct)} strokeWidth="3" strokeDasharray={`${(r.matchPct/100)*126} 126`} strokeLinecap="round" transform="rotate(-90 24 24)"/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,fontFamily:"var(--mono)",color:cColor(r.matchPct)}}>{r.matchPct}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─────────── COLD EMAIL GENERATOR ───────────
function ColdEmailModal({ buyer, onClose }) {
  const [tone, setTone] = useState(buyer.regulatoryShield?.length > 0 ? "regulatory" : "formal");
  const [lang, setLang] = useState("en");
  const [copied, setCopied] = useState(false);
  const [company, setCompany] = useState("한국정밀부품(주)");
  const [product, setProduct] = useState("CNC 정밀가공 부품");

  const templates = {
    formal: {
      en: {
        subject: `Partnership Inquiry - ${product} Supply from Korea`,
        body: `Dear ${buyer.name},

I hope this message finds you well. My name is [Your Name], and I am reaching out from ${company}, a certified Korean manufacturer specializing in ${product}.

We have been following ${buyer.company}'s growth in the ${buyer.industry} sector and believe there is a strong synergy between our capabilities and your sourcing needs.

Key highlights of our offering:
• Certified manufacturing (ISO 9001, IATF 16949)
• Competitive pricing with consistent quality
• Flexible MOQ and customization options
• Direct export experience to ${buyer.country}

We would welcome the opportunity to discuss how we can support your supply chain. Would you be available for a brief call this week?

Best regards,
[Your Name]
${company}
[Phone] | [Email]`
      },
      ko: {
        subject: `파트너십 문의 - ${product} 공급 제안`,
        body: `${buyer.name} 님께,

안녕하세요. ${company}에서 해외영업을 담당하고 있는 [이름]입니다.

저희는 ${product} 전문 제조업체로, ${buyer.company}의 ${buyer.industry} 분야에서의 성장을 주목해왔습니다.

저희의 핵심 강점:
• 국제 인증 보유 (ISO 9001, IATF 16949)
• 경쟁력 있는 가격과 안정적인 품질
• 유연한 MOQ 및 맞춤 생산
• ${buyer.country} 수출 경험 보유

귀사의 공급망에 기여할 수 있는 방법을 논의하고 싶습니다. 이번 주 간단한 통화가 가능하실까요?

감사합니다.
[이름]
${company}
[연락처]`
      }
    },
    friendly: {
      en: {
        subject: `Quick intro - ${company} x ${buyer.company}`,
        body: `Hi ${buyer.name},

I came across ${buyer.company} while researching leading companies in ${buyer.industry} - really impressive work you're doing in ${buyer.country}!

I'm with ${company} here in Korea. We make ${product}, and I think there could be a great fit for what you're looking for.

A few things that might interest you:
• We've been supplying similar products to companies in your region
• Our quality standards match international certifications
• We're flexible on quantities and can do custom specs

Would love to have a quick 15-min chat to explore if there's a fit. No pressure at all - just curious if we can help!

Cheers,
[Your Name]
${company}`
      },
      ko: {
        subject: `안녕하세요! ${company}입니다 😊`,
        body: `${buyer.name} 님, 안녕하세요!

${buyer.industry} 분야를 리서치하다가 ${buyer.company}를 알게 되었습니다. ${buyer.country}에서 정말 인상적인 성과를 내고 계시네요!

저는 한국에서 ${product}를 제조하는 ${company}에서 일하고 있어요. 저희 제품이 귀사에 도움이 될 수 있을 것 같아 연락드립니다.

• 귀사 지역에 유사 제품 공급 경험 보유
• 국제 인증 기준 충족
• 수량과 스펙 맞춤 가능

15분 정도 편하게 이야기 나눌 수 있을까요? 부담 없이, 서로에게 맞는지 탐색해보면 좋겠습니다!

감사합니다,
[이름]
${company}`
      }
    },
    regulatory: {
      en: {
        subject: `Certified Korean Supplier — ${(buyer.regulatoryShield||["Compliance"])[0]} Ready`,
        body: `Dear ${buyer.name},

I'm reaching out because ${buyer.company}'s procurement environment aligns perfectly with what ${company} offers as a certified Korean manufacturer.

Your market's ${(buyer.regulatoryShield||["compliance"]).join(" and ")} requirements mean that sourcing from proven, certified non-Chinese suppliers has become a strategic priority — and ${company} is positioned to meet exactly these needs.

Why Korean-origin ${product} from ${company}:
• Fully compliant with ${(buyer.regulatoryShield||[]).join(", ")} requirements
• ISO-certified manufacturing with complete traceability documentation
• Zero trade restriction risk — Korean-origin goods face no tariff penalties
• Proven export experience to ${buyer.country}

Given the current supply chain landscape, we believe now is the ideal time to establish a reliable, compliant supply partnership before demand peaks.

Would you be available for a 20-minute call this week to discuss your current sourcing needs?

Best regards,
[Your Name]
${company}
[Phone] | [Email]`
      },
      ko: {
        subject: `규제 대응 공급망 파트너 제안 — ${company}`,
        body: `${buyer.name} 님께,

${buyer.company}의 조달 환경과 저희 ${company}의 역량이 정확히 일치한다고 판단하여 연락드립니다.

귀사 시장의 ${(buyer.regulatoryShield||["규정 준수"]).join(", ")} 요건은 검증된 비중국산 공급망 확보를 전략적 과제로 만들었습니다. 저희 ${company}는 이 요구에 정확히 부응할 수 있습니다.

규제 적합 조달에 ${company}를 선택해야 하는 이유:
• ${(buyer.regulatoryShield||[]).join(", ")} 완전 준수 한국산 제품
• ISO 인증 제조 + 완전한 이력 추적 문서
• 무역 규제 리스크 없는 안정적 공급망
• ${buyer.country} 수출 경험 보유 — 관세 페널티 없음

현재의 공급망 환경을 고려할 때, 지금이 신뢰할 수 있는 규제 준수 공급 파트너십을 구축하기에 최적의 시점이라고 생각합니다.

이번 주 20분 정도 통화가 가능하실까요?

감사합니다.
[이름]
${company}
[연락처]`
      }
    },
    urgent: {
      en: {
        subject: `Time-Sensitive: Exclusive Pricing for ${buyer.company}`,
        body: `Dear ${buyer.name},

I'm reaching out because we have a limited-time opportunity that may be relevant to ${buyer.company}.

${company} is currently offering exclusive pricing on ${product} for new partners in ${buyer.country}. This promotion includes:

• 15% below standard market pricing
• Priority production scheduling
• Free sample shipment (up to 5 units)
• Dedicated account manager

This offer is available until the end of this month. Given ${buyer.company}'s position in ${buyer.industry}, I believe this could be a valuable opportunity.

Can we schedule a call in the next 2-3 days to discuss details?

Best regards,
[Your Name]
${company}
[Phone] | [Email]`
      },
      ko: {
        subject: `[긴급] ${buyer.company} 전용 특별 가격 제안`,
        body: `${buyer.name} 님께,

${buyer.company}에 관련될 수 있는 한시적 기회가 있어 연락드립니다.

${company}는 현재 ${buyer.country} 신규 파트너를 대상으로 ${product}의 특별 가격을 제공하고 있습니다.

• 시장가 대비 15% 할인
• 우선 생산 스케줄링
• 무료 샘플 발송 (최대 5개)
• 전담 매니저 배정

이번 달 말까지 유효한 제안입니다. ${buyer.industry} 분야에서의 귀사의 위치를 감안할 때 좋은 기회가 될 것으로 생각합니다.

2~3일 내 통화가 가능하실까요?

감사합니다.
[이름]
${company}
[연락처]`
      }
    }
  };

  const current = templates[tone][lang];

  const copyAll = () => {
    navigator.clipboard.writeText(`Subject: ${current.subject}\n\n${current.body}`);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  const openMailto = () => {
    window.open(`mailto:${buyer.email}?subject=${encodeURIComponent(current.subject)}&body=${encodeURIComponent(current.body)}`);
  };

  const toneOptions = [
    {key:"formal",label:"포멀",icon:<Ic.Shield s={12}/>,desc:"비즈니스 공식"},
    {key:"friendly",label:"친근",icon:<Ic.Users s={12}/>,desc:"캐주얼 네트워킹"},
    {key:"urgent",label:"긴급",icon:<Ic.Eye s={12}/>,desc:"한시적 제안"},
    ...(buyer.regulatoryShield?.length > 0 ? [{key:"regulatory",label:"규제 우위",icon:<span style={{fontSize:11}}>🛡</span>,desc:"규제 시장 특화"}] : []),
  ];

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:100,backdropFilter:"blur(12px) saturate(140%)",WebkitBackdropFilter:"blur(12px) saturate(140%)"}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:640,maxWidth:"92vw",maxHeight:"88vh",background:"var(--glass-bg-strong)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"1px solid var(--border)",borderRadius:20,zIndex:101,display:"flex",flexDirection:"column",animation:"scaleIn .3s cubic-bezier(0.05,0.7,0.1,1)",boxShadow:"var(--modal-shadow)",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:32,height:32,borderRadius:8,background:"var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Mail s={16}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
              AI 이메일 생성
              {buyer.regulatoryShield?.length > 0 && <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,background:"rgba(139,92,246,.15)",color:"var(--violet)",border:"1px solid rgba(139,92,246,.2)"}}>🛡 규제 우위 자동 선택됨</span>}
            </div>
            <div style={{fontSize:11,color:"var(--t3)"}}>To: {buyer.name} ({buyer.email})</div>
          </div>
          <div onClick={onClose} style={{cursor:"pointer",padding:4,color:"var(--t4)"}}><Ic.X s={16}/></div>
        </div>

        <div style={{flex:1,overflow:"auto",padding:20}}>
          {/* Company/Product inputs */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div>
              <label style={{fontSize:10,color:"var(--t4)",fontWeight:600,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:".05em"}}>발신 회사</label>
              <input value={company} onChange={e=>setCompany(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t1)",fontSize:12,outline:"none"}} />
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--t4)",fontWeight:600,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:".05em"}}>주력 제품</label>
              <input value={product} onChange={e=>setProduct(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t1)",fontSize:12,outline:"none"}} />
            </div>
          </div>

          {/* Tone + Language */}
          <div style={{display:"flex",gap:12,marginBottom:16,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <label style={{fontSize:10,color:"var(--t4)",fontWeight:600,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:".05em"}}>톤</label>
              <div style={{display:"flex",gap:6}}>
                {toneOptions.map(t=>(
                  <div key={t.key} onClick={()=>setTone(t.key)} style={{flex:1,padding:"8px 10px",borderRadius:8,cursor:"pointer",textAlign:"center",transition:"all .2s",background:tone===t.key?"var(--blue)":"var(--bg-3)",color:tone===t.key?"#fff":"var(--t3)",border:`1px solid ${tone===t.key?"var(--blue)":"var(--border)"}`}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,fontSize:12,fontWeight:600}}>{t.icon}{t.label}</div>
                    <div style={{fontSize:9,marginTop:2,opacity:.7}}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{display:"flex",gap:2,padding:2,background:"var(--bg-3)",borderRadius:6}}>
                {[["en","EN"],["ko","KO"]].map(([k,l])=>(
                  <div key={k} onClick={()=>setLang(k)} style={{padding:"6px 14px",borderRadius:5,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .15s",background:lang===k?"var(--bg-1)":"transparent",color:lang===k?"var(--t1)":"var(--t4)",boxShadow:lang===k?"0 1px 3px rgba(0,0,0,.2)":"none"}}>{l}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:10,color:"var(--t4)",fontWeight:600,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:".05em"}}>제목</label>
            <div style={{padding:"9px 12px",borderRadius:8,background:"var(--bg-2)",border:"1px solid var(--border)",fontSize:12,color:"var(--t1)",fontWeight:600}}>{current.subject}</div>
          </div>

          {/* Body */}
          <div>
            <label style={{fontSize:10,color:"var(--t4)",fontWeight:600,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:".05em"}}>본문</label>
            <div style={{padding:14,borderRadius:8,background:"var(--bg-2)",border:"1px solid var(--border)",fontSize:12,color:"var(--t2)",lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:280,overflow:"auto",fontFamily:"var(--font)"}}>{current.body}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",gap:8}}>
          <div onClick={copyAll} style={{flex:1,padding:"10px 0",borderRadius:8,background:copied?"var(--green)":"var(--blue)",color:"#fff",textAlign:"center",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {copied ? <><Ic.Check s={14}/>복사됨!</> : <><Ic.Filter s={14}/>전체 복사</>}
          </div>
          <div onClick={openMailto} style={{flex:1,padding:"10px 0",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t1)",textAlign:"center",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <Ic.Mail s={14}/>메일 앱으로 열기
          </div>
        </div>
      </div>
    </>
  );
}


// ─────────── AI ASSISTANT ───────────
function AIAssistant({ buyers, onClose }) {
  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState(null);

  const suggestions = [
    "유럽에서 구매의향 높은 바이어 찾아줘",
    "자동차 부품 산업 바이어 TOP 5",
    "이번 달 파이프라인 요약해줘",
    "독일 바이어에게 보낼 이메일 작성해줘",
    "매칭점수 90 이상 바이어 리스트",
    "동남아 시장 진출 전략 추천",
  ];

  const processQuery = (q) => {
    if (!q.trim()) return;
    setThinking(true);
    setResult(null);
    const input = q.toLowerCase();
    setTimeout(() => {
      let response = { type:"text", content:"", data:null };
      if (input.includes("유럽") || input.includes("europe")) {
        const eu = buyers.filter(b=>["독일","프랑스","영국","스웨덴","네덜란드","이탈리아","스페인","폴란드"].includes(b.country));
        const high = input.includes("높") ? eu.filter(b=>b.buyingIntent==="높음") : eu;
        response = { type:"buyers", content:"유럽 지역"+(input.includes("높")?" 구매의향 높은":"")+" 바이어 "+high.length+"명을 찾았습니다.", data:high.slice(0,8) };
      } else if (input.includes("자동차") || input.includes("전자") || input.includes("의료")) {
        const keyword = ["자동차","전자","의료","화학","기계"].find(k=>input.includes(k)) || "";
        const matched = buyers.filter(b=>b.industry && b.industry.includes(keyword)).sort((a,b)=>b.score-a.score).slice(0,5);
        response = { type:"buyers", content:keyword+" 관련 바이어 "+matched.length+"명입니다.", data:matched };
      } else if (input.includes("매칭") && (input.includes("90")||input.includes("80"))) {
        const t = input.includes("90")?90:80;
        const matched = buyers.filter(b=>b.score>=t).sort((a,b)=>b.score-a.score);
        response = { type:"buyers", content:"매칭점수 "+t+"점 이상 바이어 "+matched.length+"명입니다.", data:matched.slice(0,10) };
      } else if (input.includes("파이프라인") || input.includes("요약")) {
        const high = buyers.filter(b=>b.buyingIntent==="높음").length;
        response = { type:"summary", content:"파이프라인 현황 요약", data:{
          total:buyers.length, highIntent:high,
          avgScore:Math.round(buyers.reduce((a,b)=>a+b.score,0)/buyers.length),
          pipeline:"$4.8M", conversion:"8%",
          topCountries:["독일","미국","일본","베트남","프랑스"]
        }};
      } else if (input.includes("동남아") || input.includes("southeast")) {
        const sea = buyers.filter(b=>["베트남","태국","인도네시아","말레이시아","싱가포르"].includes(b.country));
        response = { type:"buyers", content:"동남아 바이어 "+sea.length+"명을 찾았습니다.", data:sea.slice(0,8) };
      } else {
        const sample = buyers.sort((a,b)=>b.score-a.score).slice(0,5);
        response = { type:"buyers", content:'"'+q+'"에 대한 분석 결과입니다.', data:sample };
      }
      setResult(response);
      setThinking(false);
    }, 1200);
  };

  const cColor = (s) => s>=80?"var(--green)":s>=65?"var(--cyan)":s>=50?"var(--amber)":"var(--red)";
  const intentColor = (i) => i==="높음"?"var(--green)":i==="중간"?"var(--amber)":"var(--t4)";

  return (
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"8vh"}}>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"relative",width:680,maxWidth:"92vw",maxHeight:"80vh",background:"var(--bg-1)",border:"1px solid var(--border)",borderRadius:16,display:"flex",flexDirection:"column",animation:"scaleIn .2s ease",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,var(--blue),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Sparkle s={16}/></div>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")processQuery(query)}} placeholder="무엇이든 물어보세요... (예: 유럽에서 구매의향 높은 바이어)" autoFocus style={{flex:1,background:"transparent",border:"none",outline:"none",color:"var(--t1)",fontSize:15,fontWeight:500}} />
          {query&&<div onClick={()=>{setQuery("");setResult(null)}} style={{cursor:"pointer",color:"var(--t4)"}}><Ic.X s={16}/></div>}
          <div onClick={onClose} style={{padding:4,cursor:"pointer",color:"var(--t4)"}}><Ic.X s={14}/></div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:20}}>
          {!result&&!thinking&&(
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"var(--t4)",marginBottom:12,textTransform:"uppercase",letterSpacing:".05em"}}>추천 질문</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {suggestions.map((s,i)=>(
                  <div key={i} onClick={()=>{setQuery(s);processQuery(s)}} style={{padding:"10px 14px",borderRadius:8,background:"var(--bg-2)",border:"1px solid var(--border)",fontSize:12,color:"var(--t2)",cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--blue)";e.currentTarget.style.color="var(--t1)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--t2)"}}>{s}</div>
                ))}
              </div>
            </div>
          )}
          {thinking&&(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{display:"inline-flex",gap:6}}>
                {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"var(--blue)",animation:"pulse 1.2s ease "+i*0.2+"s infinite"}}/>)}
              </div>
              <div style={{fontSize:12,color:"var(--t3)",marginTop:12}}>AI가 분석 중입니다...</div>
            </div>
          )}
          {result&&!thinking&&(
            <div>
              <div style={{padding:14,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:16}}>
                <div style={{fontSize:13,color:"var(--t1)",lineHeight:1.6}}>{result.content}</div>
              </div>
              {result.type==="buyers"&&result.data&&(
                <div style={{display:"grid",gap:8}}>
                  {result.data.map((b,i)=>(
                    <div key={b.id||i} style={{padding:12,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-h)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                      <div style={{width:28,height:28,borderRadius:7,background:"var(--blue-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"var(--blue)"}}>{i+1}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700}}>{b.name} <span style={{fontWeight:400,color:"var(--t3)"}}>{b.flag} {b.company}</span></div>
                        <div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>{b.industry} · {b.demand}</div>
                      </div>
                      <div style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,color:intentColor(b.buyingIntent),background:b.buyingIntent==="높음"?"var(--green-dim)":b.buyingIntent==="중간"?"var(--amber-dim)":"var(--bg-4)"}}>{b.buyingIntent}</div>
                      <div style={{fontSize:14,fontWeight:800,fontFamily:"var(--mono)",color:cColor(b.score)}}>{b.score}</div>
                    </div>
                  ))}
                </div>
              )}
              {result.type==="summary"&&result.data&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[
                    {label:"전체 바이어",val:result.data.total,color:"var(--blue)"},
                    {label:"높은 구매의향",val:result.data.highIntent+"명",color:"var(--green)"},
                    {label:"평균 매칭점수",val:result.data.avgScore,color:"var(--cyan)"},
                    {label:"파이프라인",val:result.data.pipeline,color:"var(--amber)"},
                    {label:"전환율",val:result.data.conversion,color:"var(--violet)"},
                    {label:"TOP 국가",val:result.data.topCountries.slice(0,3).join(", "),color:"var(--t2)"},
                  ].map((s,i)=>(
                    <div key={i} style={{padding:14,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",textAlign:"center"}}>
                      <div style={{fontSize:20,fontWeight:800,fontFamily:"var(--mono)",color:s.color}}>{s.val}</div>
                      <div style={{fontSize:10,color:"var(--t3)",marginTop:4}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{padding:"10px 20px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:10,color:"var(--t4)"}}>Enter로 검색 · ESC로 닫기</span>
          <span style={{fontSize:10,color:"var(--t4)",marginLeft:"auto"}}>NEXPORT AI Assistant</span>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ filters, setFilters, collapsed, setCollapsed }) {
  const [openSections, setOpenSections] = useState({"산업":true,"지역":true,"회사규모":false,"인증":false,"구매의향":false,"규제시장":false,"매칭점수":false});
  const toggle = k => setOpenSections(p=>({...p,[k]:!p[k]}));

  const FilterSection = ({title, icon:Icon, children}) => (
    <div style={{borderBottom:"1px solid var(--border)"}}>
      <div onClick={()=>toggle(title)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",color:openSections[title]?"var(--t1)":"var(--t3)",transition:"color .15s",fontSize:12,fontWeight:600}}>
        <Icon s={14} />
        <span style={{flex:1}}>{title}</span>
        <span style={{transform:`rotate(${openSections[title]?180:0}deg)`,transition:"transform .2s"}}><Ic.ChevDown s={12} /></span>
      </div>
      {openSections[title] && <div style={{padding:"0 14px 12px",animation:"fadeIn .2s ease"}}>{children}</div>}
    </div>
  );

  const CheckItem = ({label, checked, onChange, count}) => (
    <div onClick={onChange} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",cursor:"pointer",fontSize:12,color:checked?"var(--t1)":"var(--t2)"}}>
      <Checkbox checked={checked} onChange={onChange} />
      <span style={{flex:1}}>{label}</span>
      {count !== undefined && <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t4)"}}>{count}</span>}
    </div>
  );

  if (collapsed) return (
    <div style={{width:44,background:"var(--bg-1)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",paddingTop:12,gap:8,flexShrink:0}}>
      <div onClick={()=>setCollapsed(false)} style={{cursor:"pointer",color:"var(--t3)",padding:6,borderRadius:6,background:"var(--bg-3)"}}><Ic.Filter s={16}/></div>
      <div onClick={()=>setCollapsed(false)} style={{cursor:"pointer",color:"var(--t3)",padding:6}}><Ic.Building s={14}/></div>
      <div onClick={()=>setCollapsed(false)} style={{cursor:"pointer",color:"var(--t3)",padding:6}}><Ic.Globe s={14}/></div>
      <div onClick={()=>setCollapsed(false)} style={{cursor:"pointer",color:"var(--t3)",padding:6}}><Ic.Users s={14}/></div>
    </div>
  );

  return (
    <div style={{width:260,background:"var(--glass-bg)",backdropFilter:"blur(20px) saturate(160%)",WebkitBackdropFilter:"blur(20px) saturate(160%)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:700}}><Ic.Filter s={14}/>필터</div>
        <div style={{display:"flex",gap:4}}>
          {Object.values(filters).some(v => Array.isArray(v) ? v.length : v) && (
            <div onClick={()=>setFilters({industries:[],regions:[],sizes:[],certs:[],intents:[],regulations:[],scoreMin:0,scoreMax:100})} style={{fontSize:10,color:"var(--red)",cursor:"pointer",padding:"2px 6px",borderRadius:4,background:"var(--red-dim)"}}>초기화</div>
          )}
          <div onClick={()=>setCollapsed(true)} style={{cursor:"pointer",color:"var(--t4)",padding:2}}><Ic.ChevLeft s={14}/></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {/* AI Search */}
        <div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t3)",fontSize:12}}>
            <Ic.Sparkle s={12} /><span>AI로 검색하기...</span>
          </div>
        </div>
        <FilterSection title="산업" icon={Ic.Layers}>
          {INDUSTRIES.map(ind => (
            <CheckItem key={ind} label={ind} count={ALL_BUYERS.filter(b=>b.industry===ind).length}
              checked={filters.industries.includes(ind)}
              onChange={()=>setFilters(p=>({...p,industries:p.industries.includes(ind)?p.industries.filter(x=>x!==ind):[...p.industries,ind]}))} />
          ))}
        </FilterSection>
        <FilterSection title="지역" icon={Ic.Globe}>
          {["유럽","북미","아시아","동남아","오세아니아","남미"].map(r => (
            <CheckItem key={r} label={r} count={ALL_BUYERS.filter(b=>b.region===r).length}
              checked={filters.regions.includes(r)}
              onChange={()=>setFilters(p=>({...p,regions:p.regions.includes(r)?p.regions.filter(x=>x!==r):[...p.regions,r]}))} />
          ))}
        </FilterSection>
        <FilterSection title="회사규모" icon={Ic.Building}>
          {[["1-50","소기업"],["51-200","중소기업"],["201-1000","중견기업"],["1001+","대기업"]].map(([val,label]) => (
            <CheckItem key={val} label={`${label} (${val})`}
              checked={filters.sizes.includes(val)}
              onChange={()=>setFilters(p=>({...p,sizes:p.sizes.includes(val)?p.sizes.filter(x=>x!==val):[...p.sizes,val]}))} />
          ))}
        </FilterSection>
        <FilterSection title="인증" icon={Ic.Shield}>
          {CERTS.slice(0,6).map(c => (
            <CheckItem key={c} label={c}
              checked={filters.certs.includes(c)}
              onChange={()=>setFilters(p=>({...p,certs:p.certs.includes(c)?p.certs.filter(x=>x!==c):[...p.certs,c]}))} />
          ))}
        </FilterSection>
        <FilterSection title="구매의향" icon={Ic.Target}>
          {["높음","중간","낮음"].map(i => (
            <CheckItem key={i} label={i} count={ALL_BUYERS.filter(b=>b.buyingIntent===i).length}
              checked={filters.intents.includes(i)}
              onChange={()=>setFilters(p=>({...p,intents:p.intents.includes(i)?p.intents.filter(x=>x!==i):[...p.intents,i]}))} />
          ))}
        </FilterSection>
        <FilterSection title="규제시장" icon={Ic.Shield}>
          <div style={{fontSize:10,color:"var(--t4)",marginBottom:6,lineHeight:1.4}}>한국산이 유리한 규제 조건을 가진 바이어</div>
          {REGULATIONS.map(r => (
            <CheckItem key={r} label={r} count={ALL_BUYERS.filter(b=>b.regulatoryShield&&b.regulatoryShield.includes(r)).length}
              checked={(filters.regulations||[]).includes(r)}
              onChange={()=>setFilters(p=>({...p,regulations:(p.regulations||[]).includes(r)?p.regulations.filter(x=>x!==r):[...(p.regulations||[]),r]}))} />
          ))}
        </FilterSection>
        <FilterSection title="매칭점수" icon={Ic.Bar}>
          <div style={{display:"flex",gap:8,alignItems:"center",fontSize:12}}>
            <input type="range" min={0} max={100} value={filters.scoreMin} onChange={e=>setFilters(p=>({...p,scoreMin:+e.target.value}))} style={{flex:1,accentColor:"var(--blue)"}} />
            <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--t2)",minWidth:20}}>{filters.scoreMin}</span>
            <span style={{color:"var(--t4)"}}>~</span>
            <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--t2)",minWidth:20}}>{filters.scoreMax}</span>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

// ─────────── DETAIL PANEL ───────────
function DetailPanel({ buyer, onClose }) {
  if (!buyer) return null;
  const c = buyer.score >= 85 ? "var(--green)" : buyer.score >= 70 ? "var(--blue)" : "var(--amber)";
  const r = 32, circ = 2 * Math.PI * r, off = circ - (buyer.score/100)*circ;

  return (
    <div style={{width:380,background:"var(--bg-1)",borderLeft:"1px solid var(--border)",display:"flex",flexDirection:"column",flexShrink:0,animation:"fadeIn .3s ease",overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,fontWeight:700}}>바이어 상세</span>
        <div onClick={onClose} style={{cursor:"pointer",color:"var(--t4)",padding:4}}><Ic.X s={16}/></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:18}}>
        {/* Header */}
        <div style={{display:"flex",gap:16,marginBottom:20}}>
          <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
            <svg width={72} height={72} style={{transform:"rotate(-90deg)"}}>
              <circle cx={36} cy={36} r={r} fill="none" stroke="var(--bg-4)" strokeWidth="4"/>
              <circle cx={36} cy={36} r={r} fill="none" stroke={c} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{transition:"all 1s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:18,fontWeight:700,color:c}}>{buyer.score}</div>
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:800}}>{buyer.name}</div>
            <div style={{fontSize:12,color:"var(--t2)",marginTop:2}}>{buyer.title}</div>
            <div style={{fontSize:12,color:"var(--t3)",marginTop:4,display:"flex",alignItems:"center",gap:4}}>{buyer.flag} {buyer.company}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[["이메일",Ic.Mail,"var(--blue)"],["전화",Ic.Phone,"var(--green)"],["리스트 추가",Ic.List,"var(--violet)"],["내보내기",Ic.Download,"var(--amber)"]].map(([l,Icon,col])=>(
            <div key={l} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 4px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",cursor:"pointer",transition:"all .15s",fontSize:10,color:"var(--t2)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=col;e.currentTarget.style.color=col}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--t2)"}}
            ><Icon s={14}/>{l}</div>
          ))}
        </div>

        {/* Info Grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
          {[["국가",`${buyer.flag} ${buyer.country}`],["산업",buyer.industry],["수요 품목",buyer.demand],["예상 규모",buyer.volume],["직원 수",buyer.employeeLabel],["매출 규모",buyer.revenue],["구매의향",buyer.buyingIntent],["상태",buyer.status]].map(([l,v])=>(
            <div key={l} style={{padding:"8px 10px",borderRadius:8,background:"var(--bg-3)"}}>
              <div style={{fontSize:10,color:"var(--t4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{l}</div>
              <div style={{fontSize:12,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{padding:14,borderRadius:10,background:"var(--bg-3)",border:"1px solid var(--border)",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>연락처</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}><Ic.Mail s={12}/><span style={{color:"var(--blue)"}}>{buyer.email}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}><Ic.Phone s={12}/><span>{buyer.phone}</span></div>
          </div>
        </div>

        {/* Certifications */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>인증</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {buyer.certifications.map(c => <Badge key={c} color="var(--cyan)">{c}</Badge>)}
          </div>
        </div>

        {/* Score Breakdown */}
        <div style={{padding:14,borderRadius:10,background:"linear-gradient(135deg,var(--blue-dim),var(--violet-dim))",border:"1px solid rgba(59,107,245,.15)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--t2)",marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Ic.Sparkle s={12}/>AI 매칭 분석</div>
          {[["제품 적합도",Math.min(99,buyer.score+3)],["시장 수요",Math.min(99,buyer.score-5)],["인증 일치",buyer.certifications.length*15+10],["거래 가능성",Math.min(99,buyer.score+1)]].map(([label,val])=>(
            <div key={label} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span style={{color:"var(--t2)"}}>{label}</span>
                <span style={{fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:"var(--t1)"}}>{Math.min(99,Math.max(20,val))}%</span>
              </div>
              <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                <div style={{width:`${Math.min(99,Math.max(20,val))}%`,height:"100%",borderRadius:2,background:"var(--blue-light)",animation:"barGrow .8s ease forwards"}} />
              </div>
            </div>
          ))}
        </div>

        <div style={{fontSize:11,color:"var(--t4)",marginTop:16,textAlign:"center"}}>마지막 활동: {buyer.lastActive}</div>
      </div>
    </div>
  );
}

// ─────────── MAIN TABLE ───────────

// ─────────── EMAIL FINDER ───────────

// ─────────── DASHBOARD ───────────

// ─────────── KANBAN PIPELINE ───────────
// ─────────── DONUT CHART ───────────
const DonutChart = ({ data, size=110, label, sublabel }) => {
  const total = data.reduce((s,d)=>s+d.value,0);
  if (total===0) return (
    <div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <div style={{fontSize:11,color:"var(--t4)"}}>데이터 없음</div>
    </div>
  );
  const r=36,cx=55,cy=55,circ=2*Math.PI*r;
  let offset=0;
  const segments=data.map(d=>{ const pct=d.value/total; const da=pct*circ; const seg={...d,da,offset,pct}; offset+=da; return seg; });
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} viewBox="0 0 110 110">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-4)" strokeWidth={10}/>
        {segments.map((seg,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={10}
            strokeDasharray={`${seg.da} ${circ-seg.da}`}
            strokeDashoffset={circ/4-seg.offset}
            style={{transition:"stroke-dasharray .6s ease"}}/>
        ))}
        <text x={cx} y={cy-4} textAnchor="middle" fill="var(--t1)" fontSize="16" fontWeight="800" fontFamily="var(--mono)">{label}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fill="var(--t3)" fontSize="8" fontFamily="var(--font)">{sublabel}</text>
      </svg>
    </div>
  );
};

// ─────────── PIPELINE HEALTH ───────────
function PipelineHealth({ buyers, buyerNotes }) {
  const intentData = [
    {label:"높음",value:buyers.filter(b=>b.buyingIntent==="높음").length,color:"var(--green)"},
    {label:"중간",value:buyers.filter(b=>b.buyingIntent==="중간").length,color:"var(--amber)"},
    {label:"낮음",value:buyers.filter(b=>b.buyingIntent==="낮음").length,color:"var(--red)"},
  ];
  const stageData = [
    {label:"신규",   value:buyers.filter(b=>b.status==="신규").length,   color:"var(--t3)"},
    {label:"검토중", value:buyers.filter(b=>b.status==="검토중").length, color:"var(--blue)"},
    {label:"협상중", value:buyers.filter(b=>b.status==="협상중").length, color:"var(--amber)"},
    {label:"LOI",   value:buyers.filter(b=>b.status==="LOI").length,    color:"var(--violet)"},
    {label:"계약완료",value:buyers.filter(b=>b.status==="계약완료").length,color:"var(--green)"},
  ];
  const regionMap={};
  buyers.forEach(b=>{ regionMap[b.region]=(regionMap[b.region]||0)+1; });
  const rcols={"유럽":"var(--blue)","북미":"var(--cyan)","아시아":"var(--green)","동남아":"var(--amber)","오세아니아":"var(--violet)","남미":"var(--red)"};
  const regionData = Object.entries(regionMap).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label,value,color:rcols[label]||"var(--t3)"}));
  const topRegion = regionData[0]||{label:"-",value:0};
  const topStage = stageData.reduce((a,b)=>b.value>a.value?b:a,stageData[0]);
  const riskBuyers = buyers.filter(b=>b.status==="협상중"&&(!buyerNotes||!buyerNotes.get(b.id)||buyerNotes.get(b.id).length===0));

  const Legend = ({items})=>(
    <div style={{marginTop:8}}>
      {items.filter(d=>d.value>0).map(d=>(
        <div key={d.label} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,fontSize:11}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:d.color,flexShrink:0}}/>
          <span style={{color:"var(--t2)",flex:1}}>{d.label}</span>
          <span style={{fontFamily:"var(--mono)",color:"var(--t1)",fontWeight:700}}>{d.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{padding:20,borderRadius:14,border:"1px solid var(--border)",background:"var(--bg-2)",marginBottom:20,animation:"fadeIn .4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <Ic.Target s={16}/>
        <span style={{fontSize:14,fontWeight:700,color:"var(--t1)"}}>파이프라인 건강도</span>
        <span style={{fontSize:10,padding:"2px 7px",borderRadius:5,background:"var(--blue-dim)",color:"var(--blue)",fontWeight:600,border:"1px solid rgba(59,107,245,.15)"}}>Apollo 방식</span>
        <span style={{marginLeft:"auto",fontSize:11,color:"var(--t3)"}}>{buyers.length}명 전체 바이어 기준</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24,marginBottom:riskBuyers.length?16:0}}>
        {/* 구매의향 */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <DonutChart data={intentData} label={intentData[0].value} sublabel="고의향"/>
          <div style={{fontSize:11,fontWeight:700,color:"var(--t1)",textAlign:"center",marginTop:4}}>구매의향 분포</div>
          <Legend items={intentData}/>
        </div>
        {/* 파이프라인 단계 */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <DonutChart data={stageData} label={topStage.value} sublabel={topStage.label}/>
          <div style={{fontSize:11,fontWeight:700,color:"var(--t1)",textAlign:"center",marginTop:4}}>파이프라인 단계</div>
          <Legend items={stageData}/>
        </div>
        {/* 지역 분포 */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <DonutChart data={regionData} label={topRegion.value} sublabel={topRegion.label}/>
          <div style={{fontSize:11,fontWeight:700,color:"var(--t1)",textAlign:"center",marginTop:4}}>지역 분포</div>
          <Legend items={regionData}/>
        </div>
      </div>
      {/* 리스크 알림 */}
      {riskBuyers.length > 0 && (
        <div style={{padding:"12px 16px",borderRadius:10,background:"var(--amber-dim)",
          border:"1px solid rgba(245,158,11,.3)",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"var(--amber)"}}>파이프라인 리스크 감지</div>
            <div style={{fontSize:11,color:"var(--t2)",marginTop:2}}>
              협상 중인 바이어 <strong style={{color:"var(--amber)"}}>{riskBuyers.length}명</strong>에게 아직 노트가 없습니다. 활동 로그를 남겨 관계를 유지하세요.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────── PLAYBOOK VIEW ───────────
function PlaybookView({ buyers, savedSet, onRunPlaybook }) {
  const [runningId, setRunningId] = useState(null);
  return (
    <div style={{flex:1,overflow:"auto",padding:"28px 24px"}}>
      {/* 헤더 */}
      <div style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <Ic.BookOpen s={20}/>
          <h2 style={{fontSize:20,fontWeight:700,color:"var(--t1)"}}>아웃리치 플레이북</h2>
        </div>
        <p style={{fontSize:13,color:"var(--t3)",maxWidth:560,lineHeight:1.6}}>
          단계별 바이어 접근 전략 — 플레이북을 실행하면 해당 바이어가 자동 선택됩니다. 이메일 발송, 비교 분석을 즉시 시작하세요.
        </p>
      </div>

      {/* 플레이북 그리드 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:16}}>
        {PLAYBOOKS.map((pb, i) => {
          const matching = buyers.filter(b=>pb.filter(b,savedSet));
          const isRunning = runningId === pb.id;
          return (
            <div key={pb.id}
              className={`fi fi${Math.min(i+1,5)}`}
              style={{background:"var(--bg-2)",border:"1px solid var(--border)",borderRadius:14,
                overflow:"hidden",transition:"border-color .2s,box-shadow .2s",position:"relative"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`var(${pb.color})`;e.currentTarget.style.boxShadow=`0 0 0 1px var(${pb.color})`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.boxShadow="none";}}>
              {/* 상단 컬러 바 */}
              <div style={{height:3,background:`var(${pb.color})`}}/>
              <div style={{padding:"18px 20px"}}>
                {/* 헤더: 이모지 + 제목 + 태그 */}
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                  <div style={{fontSize:28,lineHeight:1,flexShrink:0}}>{pb.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:700,color:"var(--t1)"}}>{pb.title}</span>
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,
                        background:`var(${pb.tagColor}-dim)`,color:`var(${pb.tagColor})`,fontWeight:600,
                        border:`1px solid var(${pb.tagColor}-dim)`}}>
                        {pb.tag}
                      </span>
                    </div>
                    <p style={{fontSize:11,color:"var(--t3)",lineHeight:1.5,margin:0}}>{pb.desc}</p>
                  </div>
                </div>
                {/* 스텝 리스트 */}
                <div style={{marginBottom:16,paddingLeft:4}}>
                  {pb.steps.map((step,si)=>(
                    <div key={si} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,fontSize:11,color:"var(--t2)"}}>
                      <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,
                        background:`var(${pb.color}-dim)`,border:`1px solid var(${pb.color})`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:9,fontWeight:700,color:`var(${pb.color})`}}>
                        {si+1}
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
                {/* 하단: 바이어 수 + 실행 버튼 */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  paddingTop:12,borderTop:"1px solid var(--border)"}}>
                  <div style={{fontSize:12,color:"var(--t2)"}}>
                    <span style={{fontFamily:"var(--mono)",fontSize:18,fontWeight:800,
                      color:matching.length>0?`var(${pb.color})`:"var(--t4)"}}>
                      {matching.length}
                    </span>
                    <span style={{color:"var(--t3)",marginLeft:4}}>명 대상</span>
                  </div>
                  <button
                    disabled={matching.length===0||isRunning}
                    onClick={()=>{
                      if(matching.length===0||isRunning) return;
                      setRunningId(pb.id);
                      setTimeout(()=>{
                        onRunPlaybook(new Set(matching.map(b=>b.id)), pb.title, matching.length);
                        setRunningId(null);
                      }, 700);
                    }}
                    style={{padding:"8px 18px",borderRadius:8,border:"none",
                      background:matching.length>0?`var(${pb.color})`:"var(--bg-4)",
                      color:matching.length>0?"#fff":"var(--t4)",
                      fontSize:12,fontWeight:600,
                      cursor:matching.length>0&&!isRunning?"pointer":"not-allowed",
                      display:"flex",alignItems:"center",gap:6,
                      opacity:matching.length>0?1:0.45,
                      transition:"opacity .2s,transform .1s",outline:"none"}}
                    onMouseEnter={e=>matching.length>0&&!isRunning&&(e.currentTarget.style.transform="scale(1.04)")}
                    onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}>
                    {isRunning ? <><LoadingSpinner size={12}/> 실행 중...</> : <><Ic.TrendUp s={12}/> 실행</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanPipeline({ buyers }) {
  const stages = [
    { key:"신규 리드", color:"var(--blue)", dim:"var(--blue-dim)", count:12 },
    { key:"검토 중", color:"var(--violet)", dim:"var(--violet-dim)", count:8 },
    { key:"협상 중", color:"var(--amber)", dim:"var(--amber-dim)", count:4 },
    { key:"LOI 발행", color:"var(--cyan)", dim:"var(--cyan-dim)", count:3 },
    { key:"계약 완료", color:"var(--green)", dim:"var(--green-dim)", count:2 },
  ];
  const allBuyers = buyers || [];
  const getBuyers = (si) => {
    const start = stages.slice(0,si).reduce((a,s)=>a+s.count,0);
    return allBuyers.slice(start, start+stages[si].count).slice(0,5);
  };
  return (
    <div style={{marginTop:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <Ic.Grid s={14}/>
        <span style={{fontSize:13,fontWeight:700}}>세일즈 파이프라인</span>
        <span style={{fontSize:11,color:"var(--t4)",marginLeft:"auto"}}>{allBuyers.length}건 관리 중</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,overflow:"auto"}}>
        {stages.map((st,si)=>{
          const cards = getBuyers(si);
          return (
            <div key={st.key} style={{background:"var(--bg-2)",borderRadius:12,border:"1px solid var(--border)",boxShadow:"var(--card-shadow)",overflow:"hidden",minWidth:160}}>
              <div style={{padding:"10px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:st.color}}/>
                <span style={{fontSize:11,fontWeight:700,flex:1}}>{st.key}</span>
                <span style={{fontSize:10,fontWeight:700,color:st.color,background:st.dim,padding:"2px 6px",borderRadius:4}}>{st.count}</span>
              </div>
              <div style={{padding:8,display:"grid",gap:6,minHeight:100}}>
                {cards.map((b,i)=>(
                  <div key={b.id||i} style={{padding:"8px 10px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",fontSize:11,transition:"all .15s cubic-bezier(0.2,0,0,1)",cursor:"pointer"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-h)";e.currentTarget.style.transform="translateY(-1px)"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none"}}>
                    <div style={{fontWeight:700,fontSize:11,marginBottom:3}}>{b.name}</div>
                    <div style={{color:"var(--t3)",fontSize:10,display:"flex",alignItems:"center",gap:4}}>{b.flag} {b.company}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
                      <span style={{fontSize:9,color:"var(--t4)"}}>{b.volume}</span>
                      <span style={{fontSize:10,fontWeight:700,fontFamily:"var(--mono)",color:st.color}}>{b.score}</span>
                    </div>
                  </div>
                ))}
                {cards.length===0&&<div style={{textAlign:"center",padding:12,fontSize:10,color:"var(--t4)"}}>비어있음</div>}
                {st.count>5&&<div style={{textAlign:"center",padding:4,fontSize:9,color:"var(--t4)"}}>+{st.count-5}건 더보기</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────── WORLD MAP VIEW ───────────
const COUNTRY_COORDS = {
  "독일":{x:392,y:112},"미국":{x:155,y:148},"일본":{x:672,y:145},"베트남":{x:624,y:218},
  "스웨덴":{x:400,y:85},"네덜란드":{x:375,y:108},"영국":{x:358,y:104},"호주":{x:672,y:315},
  "캐나다":{x:138,y:105},"프랑스":{x:370,y:118},"싱가포르":{x:635,y:235},"태국":{x:610,y:212},
  "인도":{x:565,y:190},"브라질":{x:235,y:298},"멕시코":{x:138,y:196},
};
const MAP_REGION_COLORS = {"유럽":"#0A84FF","북미":"#32ADE6","아시아":"#30D158","동남아":"#FF9F0A","오세아니아":"#BF5AF2","남미":"#FF453A"};

// ISO 3166-1 numeric → Korean name
const ISO_KR = {276:"독일",840:"미국",392:"일본",704:"베트남",752:"스웨덴",528:"네덜란드",826:"영국",36:"호주",124:"캐나다",250:"프랑스",702:"싱가포르",764:"태국",356:"인도",76:"브라질",484:"멕시코"};
// Country geographic centers [lng, lat]
const COUNTRY_GEO = {
  "독일":[10.45,51.17],"미국":[-98,38],"일본":[138,36],"베트남":[108,14],
  "스웨덴":[18,62],"네덜란드":[5.3,52.3],"영국":[-2,54],"호주":[134,-26],
  "캐나다":[-96,56],"프랑스":[2.2,46.2],"싱가포르":[103.8,1.35],"태국":[101,15],
  "인도":[79,21],"브라질":[-52,-10],"멕시코":[-102,24],
};
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMapView({ buyers }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const countryStats = {};
  buyers.forEach(b => { countryStats[b.country] = (countryStats[b.country]||0)+1; });
  const regionOf = (c) => REGIONS[c] || "기타";
  const regionTotals = {};
  const regionTopC = {};
  Object.entries(countryStats).forEach(([c,n]) => {
    const r = regionOf(c);
    regionTotals[r] = (regionTotals[r]||0)+n;
    if (!regionTopC[r]) regionTopC[r] = [];
    regionTopC[r].push({country:c,count:n});
  });
  Object.keys(regionTopC).forEach(r => regionTopC[r].sort((a,b)=>b.count-a.count));
  const RCOLS = MAP_REGION_COLORS;
  const maxCount = Math.max(...Object.values(countryStats), 1);

  const markers = Object.entries(countryStats).map(([name, count]) => ({
    name, count, coords: COUNTRY_GEO[name], region: regionOf(name),
  })).filter(m => m.coords);

  return (
    <div style={{position:"relative",width:"100%"}}>
      <div style={{borderRadius:14,overflow:"hidden",border:"1px solid var(--border)",
        boxShadow:"var(--card-shadow)",background:"var(--bg-1)",position:"relative"}}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{scale:130, center:[10, 15]}}
          width={800} height={420}
          style={{width:"100%",height:"auto",display:"block"}}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => geographies.map(geo => {
              const isoNum = parseInt(geo.id);
              const name = ISO_KR[isoNum];
              const region = name ? regionOf(name) : null;
              const col = region && RCOLS[region] ? RCOLS[region] : null;
              const count = name ? (countryStats[name]||0) : 0;
              const isActive = hoveredCountry===name || hoveredRegion===region;
              const hasData = count > 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={col
                    ? (isActive ? col+"cc" : hasData ? col+"66" : col+"30")
                    : "var(--bg-3)"}
                  stroke="var(--bg-0)"
                  strokeWidth={0.3}
                  style={{default:{outline:"none",transition:"fill .18s"},
                    hover:{outline:"none"},pressed:{outline:"none"}}}
                  onMouseEnter={(e)=>{
                    if(name){
                      setHoveredCountry(name);
                      setTooltip({
                        name, count, region, col,
                        tops:(regionTopC[region]||[]).slice(0,3),
                        total:regionTotals[region]||0,
                        x:e.clientX, y:e.clientY,
                      });
                    }
                  }}
                  onMouseMove={(e)=>{
                    if(tooltip) setTooltip(t=>t?{...t,x:e.clientX,y:e.clientY}:null);
                  }}
                  onMouseLeave={()=>{setHoveredCountry(null);setTooltip(null);}}
                />
              );
            })}
          </Geographies>
          {markers.map(m => {
            const col = RCOLS[m.region]||"#888";
            const r = 5 + (m.count/maxCount)*12;
            const isActive = hoveredCountry===m.name || hoveredRegion===m.region;
            return (
              <Marker key={m.name} coordinates={m.coords}>
                <circle r={r} fill={col} fillOpacity={isActive?0.95:0.78}
                  stroke="#fff" strokeWidth={isActive?2:1.2}
                  style={{cursor:"pointer",filter:isActive?`drop-shadow(0 0 6px ${col})`:"none",
                    transition:"all .18s"}}/>
                <text textAnchor="middle" y={-r-4}
                  style={{fontSize:8.5,fill:"var(--t1)",fontWeight:700,
                    textShadow:"0 1px 3px rgba(0,0,0,0.9)",pointerEvents:"none"}}>
                  {m.count}
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
        {tooltip && (
          <div style={{position:"fixed",left:tooltip.x+14,top:tooltip.y-10,
            background:"var(--glass-bg-strong)",backdropFilter:"blur(20px)",
            WebkitBackdropFilter:"blur(20px)",
            border:`1px solid ${tooltip.col||"var(--border)"}`,
            borderRadius:10,padding:"10px 14px",pointerEvents:"none",zIndex:9999,
            boxShadow:"var(--modal-shadow)",minWidth:160}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <span style={{fontSize:15}}>{FLAGS[tooltip.name]||"🌍"}</span>
              <span style={{fontSize:12,fontWeight:700,color:"var(--t1)"}}>{tooltip.name}</span>
              <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:tooltip.col}}>{tooltip.count}명</span>
            </div>
            <div style={{fontSize:10,color:"var(--t3)",marginBottom:4}}>
              리전: <span style={{color:tooltip.col,fontWeight:600}}>{tooltip.region}</span>
              {" · "}총 {tooltip.total}명
            </div>
            {tooltip.tops.map(t=>(
              <div key={t.country} style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}>
                <span style={{fontSize:11}}>{FLAGS[t.country]||"🌍"}</span>
                <span style={{fontSize:10,color:"var(--t2)"}}>{t.country}</span>
                <span style={{marginLeft:"auto",fontSize:10,color:tooltip.col,fontWeight:600}}>{t.count}명</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>
        {Object.entries(RCOLS).map(([region,color])=>(
          <div key={region}
            onMouseEnter={()=>setHoveredRegion(region)}
            onMouseLeave={()=>setHoveredRegion(null)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"4px 11px 4px 8px",
              borderRadius:20,background:hoveredRegion===region?"var(--bg-3)":"var(--bg-2)",
              border:`1px solid ${hoveredRegion===region?color:"var(--border)"}`,
              cursor:"pointer",transition:"all .15s cubic-bezier(0.2,0,0,1)"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>
            <span style={{fontSize:11,color:"var(--t2)",fontWeight:500}}>{region}</span>
            <span style={{fontSize:9,color,fontFamily:"var(--mono)",fontWeight:600,marginLeft:2}}>{regionTotals[region]||0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function DashboardView({ buyers, savedSet, starred, buyerNotes }) {
  const saved = buyers.filter(b => savedSet.has(b.id));
  const totalBuyers = buyers.length;
  const savedCount = savedSet.size;
  const starredCount = starred.size;

  // Pipeline stats from status field
  const pipeline = {};
  const pipelineOrder = ["신규","검토중","협상중","LOI","계약완료"];
  const pipelineColors = {"신규":"var(--blue)","검토중":"var(--violet)","협상중":"var(--amber)","LOI":"var(--cyan)","계약완료":"var(--green)"};
  pipelineOrder.forEach(s => pipeline[s] = 0);
  buyers.forEach(b => { if (pipeline[b.status] !== undefined) pipeline[b.status]++; });
  const maxPipeline = Math.max(...Object.values(pipeline), 1);

  // Region stats
  const regionStats = {};
  buyers.forEach(b => { regionStats[b.region] = (regionStats[b.region]||0) + 1; });
  const regionEntries = Object.entries(regionStats).sort((a,b) => b[1]-a[1]);
  const maxRegion = Math.max(...Object.values(regionStats), 1);
  const regionColors = ["var(--blue)","var(--cyan)","var(--green)","var(--amber)","var(--violet)","var(--red)"];

  // Industry stats
  const industryStats = {};
  buyers.forEach(b => { industryStats[b.industry] = (industryStats[b.industry]||0) + 1; });
  const industryEntries = Object.entries(industryStats).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const maxIndustry = Math.max(...industryEntries.map(e=>e[1]), 1);

  // Score distribution
  const scoreRanges = [
    {label:"90-100",min:90,max:100,color:"var(--green)"},
    {label:"80-89",min:80,max:89,color:"var(--cyan)"},
    {label:"70-79",min:70,max:79,color:"var(--blue)"},
    {label:"60-69",min:60,max:69,color:"var(--amber)"},
    {label:"50-59",min:50,max:59,color:"var(--red)"},
    {label:"<50",min:0,max:49,color:"var(--t4)"},
  ];
  scoreRanges.forEach(r => { r.count = buyers.filter(b => b.score >= r.min && b.score <= r.max).length; });
  const maxScore = Math.max(...scoreRanges.map(r=>r.count), 1);

  // Intent stats
  const intentStats = {};
  buyers.forEach(b => { intentStats[b.buyingIntent] = (intentStats[b.buyingIntent]||0) + 1; });

  // Top buyers
  const topBuyers = [...buyers].sort((a,b) => b.score - a.score).slice(0, 5);

  // Conversion funnel percentages
  const funnelTotal = totalBuyers;
  const funnelData = pipelineOrder.map(s => ({status: s, count: pipeline[s], pct: Math.round((pipeline[s]/funnelTotal)*100)}));

  // Recent activity (simulated) - More impressive for investors
  const recentActivity = [
    {buyer: topBuyers[0], action: "🎉 $2.3M 계약 성사", time: "방금 전", type: "success"},
    {buyer: topBuyers[1], action: "📋 LOI 체결 완료", time: "12분 전", type: "milestone"},
    {buyer: topBuyers[2], action: "🤝 온라인 미팅 성공", time: "1시간 전", type: "meeting"},
    {buyer: topBuyers[3], action: "⚡ AI 매칭 완료", time: "2시간 전", type: "match"}
  ];

  // Avg match score
  const avgScore = Math.round(buyers.reduce((s,b) => s+b.score, 0) / totalBuyers);

  // Estimated pipeline value
  const pipelineValue = buyers.reduce((s,b) => {
    const v = b.volume || "$0";
    const match = v.match(/\$(\d+)/);
    return s + (match ? parseInt(match[1]) * 1000 : 0);
  }, 0);

  const cardStyle = {padding:20,borderRadius:12,background:"var(--bg-2)",border:"1px solid var(--border)",boxShadow:"var(--card-shadow)"};
  const kpiCardStyle = {...cardStyle, position:"relative",overflow:"hidden"};

  // Real-time matching indicator
  const [matchingActive, setMatchingActive] = useState(true);
  const [successToast, setSuccessToast] = useState(null);
  
  useEffect(() => {
    const interval = setInterval(() => setMatchingActive(prev => !prev), 3000);
    return () => clearInterval(interval);
  }, []);

  // Success notification simulation for investors
  useEffect(() => {
    const successMessages = [
      "🎉 Pacific Trade Corp와 $2.3M 계약 성사!",
      "💼 독일 TechParts GmbH LOI 체결 완료",
      "⚡ 새로운 고가치 바이어 127명 매칭됨",
      "🤝 일본 Osaka Precision과 미팅 성공"
    ];
    
    const showToast = () => {
      const msg = successMessages[Math.floor(Math.random() * successMessages.length)];
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 4000);
    };
    
    // Show initial toast after 2 seconds, then every 15 seconds
    const initial = setTimeout(showToast, 2000);
    const recurring = setInterval(showToast, 15000);
    
    return () => {
      clearTimeout(initial);
      clearInterval(recurring);
    };
  }, []);

  return (
    <div style={{flex:1,overflow:"auto",padding:24,position:"relative"}}>
      {/* Success Toast */}
      {successToast && (
        <div style={{
          position:"fixed",top:20,right:20,zIndex:50,
          padding:"12px 20px",borderRadius:10,minWidth:300,
          background:"linear-gradient(135deg,var(--green),var(--blue))",
          color:"#fff",fontSize:13,fontWeight:600,
          animation:"slideIn .4s ease, fadeIn .4s ease",
          boxShadow:"0 10px 25px rgba(0,0,0,.3)",
          display:"flex",alignItems:"center",gap:8
        }}>
          <div style={{
            width:6,height:6,borderRadius:"50%",
            background:"#fff",animation:"pulse 1.5s infinite"
          }} />
          {successToast}
          <div 
            onClick={() => setSuccessToast(null)}
            style={{marginLeft:"auto",cursor:"pointer",opacity:.7,fontSize:16}}
          >×</div>
        </div>
      )}
      
      {/* Real-time Status Banner */}
      <div style={{
        position:"sticky",top:0,zIndex:10,marginBottom:20,
        padding:"12px 20px",borderRadius:10,
        background:"linear-gradient(90deg,var(--green-dim),var(--blue-dim))",
        border:"1px solid rgba(16,185,129,.2)",
        display:"flex",alignItems:"center",gap:12,
        animation:"float .6s ease"
      }}>
        <div style={{
          width:8,height:8,borderRadius:"50%",
          background:matchingActive?"var(--green)":"var(--blue)",
          animation:"pulse 2s infinite"
        }} />
        <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>
          🤖 AI 매칭 엔진 가동 중 • 
          {matchingActive ? " 새로운 바이어 57명 매칭됨" : " 실시간 글로벌 데이터 스캔 중..."}
        </span>
        <div style={{marginLeft:"auto",fontSize:11,color:"var(--green)",fontWeight:600}}>
          LIVE ● {new Date().toLocaleTimeString('ko-KR', {hour12:false})}
        </div>
      </div>
      {/* World Map */}
      <div className="fi fi1" style={{...cardStyle,marginBottom:24}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
          <Ic.Globe s={16}/>글로벌 바이어 분포
          <span style={{marginLeft:"auto",fontSize:11,color:"var(--t3)"}}>{buyers.length}개 바이어 · {Object.keys((() => { const s={}; buyers.forEach(b=>{ s[b.country]=(s[b.country]||0)+1; }); return s; })()).length}개국</span>
        </div>
        <WorldMapView buyers={buyers}/>
      </div>
      {/* Pipeline Health */}
      <div className="fi fi2">
        <PipelineHealth buyers={buyers} buyerNotes={buyerNotes}/>
      </div>
      {/* KPI Cards */}
      <div className="fi fi3" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        {[
          {label:"글로벌 바이어 네트워크",value:"60,000+",sub:`실시간 매칭 가능 • ${savedCount}건 저장`,color:"var(--blue)",icon:"Users"},
          {label:"AI 매칭 정확도",value:`${avgScore}%`,sub:"딥러닝 기반 실시간 분석",color:"var(--green)",icon:"Target"},
          {label:"총 파이프라인 가치",value:`$${Math.max(100, Math.round(pipelineValue/10000)).toFixed(0)}M`,sub:"누적 거래 잠재력",color:"var(--cyan)",icon:"Zap"},
          {label:"계약 성사율",value:`${Math.round((pipeline["계약완료"]||0)/totalBuyers*100)}%`,sub:`이번 달 ${pipeline["계약완료"]||0}건 성사`,color:"var(--amber)",icon:"Bar"},
        ].map((kpi,i) => (
          <div key={i} style={kpiCardStyle}>
            <div style={{position:"absolute",top:12,right:14,opacity:.08,color:kpi.color}}>{kpi.icon==="Users"?<Ic.Users s={48}/>:kpi.icon==="Target"?<Ic.Target s={48}/>:kpi.icon==="Zap"?<Ic.Zap s={48}/>:<Ic.Bar s={48}/>}</div>
            <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:600,marginBottom:8}}>{kpi.label}</div>
            <div style={{fontSize:28,fontWeight:800,fontFamily:"var(--mono)",color:kpi.color,letterSpacing:"-.02em"}}>{kpi.value}</div>
            <div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {/* Pipeline Funnel */}
        <div className="fi fi2" style={cardStyle}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <Ic.Layers s={16}/>세일즈 파이프라인
            <div style={{marginLeft:"auto",padding:"2px 6px",borderRadius:4,background:"var(--green-dim)",fontSize:9,color:"var(--green)",fontWeight:700}}>AI 추적</div>
          </div>
          <div style={{display:"grid",gap:10}}>
            {funnelData.map((f,i) => (
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:pipelineColors[f.status]}} />
                    <span style={{fontSize:12,fontWeight:500}}>{f.status}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:700,color:pipelineColors[f.status]}}>{f.count}</span>
                    <span style={{fontSize:10,color:"var(--t4)",fontFamily:"var(--mono)",width:32,textAlign:"right"}}>{f.pct}%</span>
                  </div>
                </div>
                <div style={{height:6,borderRadius:3,background:"var(--bg-4)",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,background:pipelineColors[f.status],width:`${(f.count/maxPipeline)*100}%`,transition:"width .6s ease",animation:"barGrow .8s ease"}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Region Distribution */}
        <div className="fi fi2" style={cardStyle}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}><Ic.Globe s={16}/>지역별 분포</div>
          <div style={{display:"grid",gap:10}}>
            {regionEntries.map(([region,count],i) => (
              <div key={region}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:500}}>{region}</span>
                  <span style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:700,color:regionColors[i%regionColors.length]}}>{count}</span>
                </div>
                <div style={{height:6,borderRadius:3,background:"var(--bg-4)",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,background:regionColors[i%regionColors.length],width:`${(count/maxRegion)*100}%`,animation:"barGrow .8s ease",animationDelay:`${i*.08}s`,animationFillMode:"backwards"}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {/* Industry Breakdown */}
        <div className="fi fi3" style={cardStyle}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}><Ic.Building s={16}/>산업별 분포</div>
          <div style={{display:"grid",gap:8}}>
            {industryEntries.map(([ind,count],i) => (
              <div key={ind} style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,width:90,color:"var(--t2)",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ind}</span>
                <div style={{flex:1,height:18,borderRadius:4,background:"var(--bg-4)",overflow:"hidden",position:"relative"}}>
                  <div style={{height:"100%",borderRadius:4,background:`linear-gradient(90deg,${regionColors[i%regionColors.length]},${regionColors[(i+1)%regionColors.length]})`,width:`${(count/maxIndustry)*100}%`,animation:"barGrow .6s ease",animationDelay:`${i*.06}s`,animationFillMode:"backwards"}} />
                  <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:10,fontFamily:"var(--mono)",fontWeight:600,color:"var(--t1)"}}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="fi fi3" style={cardStyle}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <Ic.Target s={16}/>AI 매칭점수 분포
            <Ic.Sparkle s={12} style={{color:"var(--amber)",marginLeft:4}} />
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:140,paddingTop:10}}>
            {scoreRanges.map((r,i) => (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <span style={{fontFamily:"var(--mono)",fontSize:10,fontWeight:600,color:r.color}}>{r.count}</span>
                <div style={{width:"100%",borderRadius:4,background:r.color,height:`${Math.max((r.count/maxScore)*110, 4)}px`,animation:"barGrow .6s ease",animationDelay:`${i*.08}s`,animationFillMode:"backwards",transformOrigin:"bottom"}} />
                <span style={{fontSize:9,color:"var(--t4)",fontFamily:"var(--mono)"}}>{r.label}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,padding:"10px 12px",borderRadius:8,background:"var(--bg-3)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"var(--t3)"}}>🤖 AI 평균 매칭 정확도</span>
            <span style={{fontFamily:"var(--mono)",fontSize:16,fontWeight:800,color:avgScore>=80?"var(--green)":avgScore>=60?"var(--amber)":"var(--red)"}}>{avgScore}%</span>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.2fr .8fr",gap:16}}>
        {/* Top Matched Buyers */}
        <div className="fi fi4" style={cardStyle}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <Ic.Star s={16}/>TOP AI 매칭 바이어
            <div style={{marginLeft:"auto",padding:"2px 6px",borderRadius:4,background:"var(--violet-dim)",fontSize:9,color:"var(--violet)",fontWeight:700}}>실시간 업데이트</div>
          </div>
          <div style={{display:"grid",gap:6}}>
            {topBuyers.map((b,i) => (
              <div key={b.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-h)";e.currentTarget.style.transform="translateX(2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${regionColors[i%regionColors.length]},${regionColors[(i+2)%regionColors.length]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",fontFamily:"var(--mono)",flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:12,fontWeight:600}}>{b.name}</span>
                    <span style={{fontSize:10,color:"var(--t4)"}}>{b.flag}</span>
                  </div>
                  <div style={{fontSize:11,color:"var(--t3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.company} · {b.demand}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"var(--mono)",fontSize:16,fontWeight:800,color:b.score>=80?"var(--green)":b.score>=60?"var(--amber)":"var(--red)"}}>{b.score}</div>
                  <div style={{fontSize:9,color:"var(--t4)",textTransform:"uppercase",letterSpacing:".06em"}}>SCORE</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{display:"grid",gap:16}}>
          {/* Buying Intent */}
          <div className="fi fi4" style={cardStyle}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><Ic.Zap s={16}/>구매 의향 분석</div>
            <div style={{display:"grid",gap:10}}>
              {[["높음","var(--green)"],["중간","var(--amber)"],["낮음","var(--t4)"]].map(([intent,color]) => {
                const count = intentStats[intent] || 0;
                const pct = Math.round((count/totalBuyers)*100);
                return (
                  <div key={intent}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:500,display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:color}}/>{intent}</span>
                      <span style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:600}}>{count} <span style={{color:"var(--t4)",fontSize:10}}>({pct}%)</span></span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:"var(--bg-4)",overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:3,background:color,width:`${pct}%`,animation:"barGrow .6s ease"}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="fi fi5" style={cardStyle}>
            <KanbanPipeline buyers={buyers} />
          <div style={{fontSize:14,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><Ic.Sparkle s={14}/>최근 활동</div>
            <div style={{display:"grid",gap:8}}>
              {recentActivity.map((a,i) => (
                <div key={i} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:6,
                  background: a.type === "success" ? "var(--green-dim)" : "var(--bg-3)",
                  border: a.type === "success" ? "1px solid rgba(16,185,129,.2)" : "1px solid var(--border)",
                  animation: a.type === "success" ? "pulse 2s infinite" : "none"
                }}>
                  <div style={{
                    width:6,height:6,borderRadius:"50%",
                    background:{"success":"var(--green)","milestone":"var(--blue)","meeting":"var(--cyan)","match":"var(--amber)"}[a.type],
                    flexShrink:0
                  }} />
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:500}}>
                      <span style={{color:"var(--blue-light)"}}>{a.buyer.company}</span> {a.action}
                    </div>
                  </div>
                  <span style={{fontSize:10,color:"var(--t4)",flexShrink:0}}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailFinderView() {
  const [searchType, setSearchType] = useState("domain");
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [savedEmails, setSavedEmails] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    fetch("/api/hunter?action=account").then(r=>r.json()).then(d=>{if(d.data)setAccountInfo(d.data)}).catch(()=>{});
  }, []);

  const doSearch = async () => {
    setLoading(true); setError(null); setResults(null);
    try {
      let url;
      if (searchType==="domain") {
        if (!domain.trim()) { setError("도메인을 입력하세요"); setLoading(false); return; }
        url = `/api/hunter?action=domain-search&domain=${encodeURIComponent(domain.trim())}`;
      } else if (searchType==="company") {
        if (!company.trim()) { setError("회사명을 입력하세요"); setLoading(false); return; }
        url = `/api/hunter?action=company-search&company=${encodeURIComponent(company.trim())}`;
      } else {
        if (!domain.trim()||!firstName.trim()||!lastName.trim()) { setError("도메인, 이름, 성을 모두 입력하세요"); setLoading(false); return; }
        url = `/api/hunter?action=email-finder&domain=${encodeURIComponent(domain.trim())}&first_name=${encodeURIComponent(firstName.trim())}&last_name=${encodeURIComponent(lastName.trim())}`;
      }
      const res = await fetch(url);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch(pe) {
        setError("API 서버가 응답하지 않습니다. 배포 환경에서는 Vercel HUNTER_API_KEY 환경변수를, 로컬에서는 .env 파일에 HUNTER_API_KEY를 설정하세요.");
        setLoading(false); return;
      }
      if (data.error) setError(data.error);
      else { setResults(data.data); if (data.data?._isMock) setError("⚠️ HUNTER_API_KEY 미설정 — 데모 데이터를 표시 중입니다."); }
    } catch(e) { setError("네트워크 오류. 연결 상태를 확인하세요: " + e.message); }
    setLoading(false);
  };

  const copyEmail = (email, id) => { navigator.clipboard.writeText(email); setCopiedId(id); setTimeout(()=>setCopiedId(null),2000); };
  const saveEmail = (em) => { if (!savedEmails.find(e=>e.value===em.value)) setSavedEmails(p=>[...p,em]); };
  const cColor = (s) => s>=80?"var(--green)":s>=50?"var(--amber)":"var(--red)";

  const exportCSV = () => {
    if (!savedEmails.length) return;
    const csv = "Email,Name,Position,Confidence\n" + savedEmails.map(e=>`${e.value},${e.first_name||""} ${e.last_name||""},${e.position||""},${e.confidence||""}`).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `nexport-emails-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const inputStyle = {flex:1,padding:"8px 12px",borderRadius:6,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t1)",fontSize:12,outline:"none"};
  const btnStyle = {padding:"8px 16px",borderRadius:6,background:"var(--blue)",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6};
  const tabStyle = (active) => ({padding:"6px 14px",borderRadius:5,fontSize:12,fontWeight:active?600:400,background:active?"var(--bg-1)":"transparent",color:active?"var(--t1)":"var(--t3)",cursor:"pointer",transition:"all .15s"});
  const cardStyle = {padding:16,borderRadius:10,background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:8};

  return (
    <div style={{flex:1,overflow:"auto",padding:20}}>
      <div className="fi fi1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700}}>이메일 파인더</h2>
          <p style={{fontSize:12,color:"var(--t3)",marginTop:4}}>
            Hunter.io 기반 바이어 이메일 검색
            {accountInfo && <span style={{marginLeft:10,padding:"2px 8px",borderRadius:12,background:"var(--green-dim)",color:"var(--green)",fontSize:10,fontWeight:600}}>잔여 {accountInfo.requests?.searches?.available||0}건</span>}
          </p>
        </div>
        {savedEmails.length>0 && <button onClick={exportCSV} style={{...btnStyle,background:"var(--bg-3)",color:"var(--t2)"}}><Ic.Download s={12}/>CSV ({savedEmails.length})</button>}
      </div>

      {/* Search Type Tabs */}
      <div className="fi fi2" style={{...cardStyle,marginBottom:16}}>
        <div style={{display:"flex",gap:2,padding:2,background:"var(--bg-3)",borderRadius:7,marginBottom:14,width:"fit-content"}}>
          {[["domain","도메인 검색"],["company","회사명 검색"],["person","개인 이메일 찾기"]].map(([k,v])=>(
            <div key={k} onClick={()=>{setSearchType(k);setResults(null);setError(null);}} style={tabStyle(searchType===k)}>{v}</div>
          ))}
        </div>

        {searchType==="domain" && <div style={{display:"flex",gap:8}}>
          <input style={inputStyle} placeholder="예: techparts.de, pacifictrade.com" value={domain} onChange={e=>setDomain(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} />
          <button onClick={doSearch} style={btnStyle} disabled={loading}>{loading?<><LoadingSpinner size={14} color="#fff"/> 검색 중...</>:"검색"}</button>
        </div>}

        {searchType==="company" && <div style={{display:"flex",gap:8}}>
          <input style={inputStyle} placeholder="예: TechParts GmbH, Pacific Trade" value={company} onChange={e=>setCompany(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} />
          <button onClick={doSearch} style={btnStyle} disabled={loading}>{loading?<><LoadingSpinner size={14} color="#fff"/> 검색 중...</>:"검색"}</button>
        </div>}

        {searchType==="person" && <div style={{display:"grid",gap:10}}>
          <input style={inputStyle} placeholder="회사 도메인 (예: techparts.de)" value={domain} onChange={e=>setDomain(e.target.value)} />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <input style={inputStyle} placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} />
            <input style={inputStyle} placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} />
          </div>
          <button onClick={doSearch} style={{...btnStyle,justifyContent:"center"}} disabled={loading}>{loading?<><LoadingSpinner size={14} color="#fff"/> 검색 중...</>:"이메일 찾기"}</button>
        </div>}
      </div>

      {/* Error */}
      {error && <ErrorBanner message={error} onDismiss={()=>setError(null)} onRetry={doSearch} />}

      {/* Domain/Company Results */}
      {results && (searchType==="domain"||searchType==="company") && <div className="fi fi3">
        {results.organization && <div style={{...cardStyle,background:"linear-gradient(135deg,var(--blue-dim),var(--violet-dim))",borderColor:"rgba(59,107,245,.2)"}}>
          <div style={{fontSize:15,fontWeight:700}}>{results.organization||results.domain}</div>
          <div style={{fontSize:11,color:"var(--t2)",marginTop:4}}>{results.domain} · 발견: <span style={{color:"var(--green)",fontWeight:700,fontFamily:"var(--mono)"}}>{results.emails?.length||0}건</span>{results.pattern&&<span style={{marginLeft:8,color:"var(--t3)"}}>패턴: {results.pattern}</span>}</div>
        </div>}

        {results.emails?.length>0 ? <div style={{display:"grid",gap:6}}>
          {results.emails.map((em,i)=>(
            <div key={i} style={{...cardStyle,padding:14,display:"flex",alignItems:"center",gap:12,transition:"all .2s",cursor:"default"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-h)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)"}}>
              {/* Score */}
              <div style={{width:38,height:38,borderRadius:"50%",border:`2px solid ${cColor(em.confidence||0)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,fontFamily:"var(--mono)",color:cColor(em.confidence||0),flexShrink:0}}>{em.confidence||0}</div>
              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:13,fontWeight:600,fontFamily:"var(--mono)",color:"var(--blue-light)"}}>{em.value}</span>
                  {em.verification?.status==="valid"&&<span style={{color:"var(--green)",fontSize:10}}>✓</span>}
                </div>
                <div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>
                  {em.first_name&&`${em.first_name} ${em.last_name||""}`}{em.position&&<span> · {em.position}</span>}{em.department&&<span> · {em.department}</span>}
                </div>
              </div>
              {/* Actions */}
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <div onClick={()=>copyEmail(em.value,i)} style={{padding:"4px 10px",borderRadius:5,border:"1px solid var(--border)",color:copiedId===i?"var(--green)":"var(--t3)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                  {copiedId===i?<><Ic.Check s={11}/>복사됨</>:<><Ic.Mail s={11}/>복사</>}
                </div>
                <div onClick={()=>saveEmail(em)} style={{padding:"4px 10px",borderRadius:5,border:"1px solid var(--border)",color:savedEmails.find(e=>e.value===em.value)?"var(--green)":"var(--t3)",fontSize:11,cursor:"pointer",background:savedEmails.find(e=>e.value===em.value)?"var(--green-dim)":"transparent",display:"flex",alignItems:"center",gap:4}}>
                  {savedEmails.find(e=>e.value===em.value)?<><Ic.Check s={11}/>저장됨</>:<><Ic.Plus s={11}/>저장</>}
                </div>
              </div>
            </div>
          ))}
        </div> : <div style={{...cardStyle,textAlign:"center",padding:40,color:"var(--t4)"}}>검색 결과가 없습니다.</div>}
      </div>}

      {/* Person Result */}
      {results && searchType==="person" && <div className="fi fi3" style={{...cardStyle,background:results.email?"linear-gradient(135deg,var(--green-dim),var(--blue-dim))":"var(--bg-2)",borderColor:results.email?"rgba(16,185,129,.2)":"var(--border)"}}>
        {results.email ? <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:56,height:56,borderRadius:"50%",border:`3px solid ${cColor(results.score||0)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,fontFamily:"var(--mono)",color:cColor(results.score||0)}}>{results.score||0}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>발견된 이메일</div>
            <div style={{fontSize:16,fontWeight:700,fontFamily:"var(--mono)",color:"var(--blue-light)"}}>{results.email}</div>
            <div style={{fontSize:12,color:"var(--t2)",marginTop:2}}>{results.first_name} {results.last_name}{results.position&&` · ${results.position}`}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button onClick={()=>copyEmail(results.email,"p")} style={{...btnStyle,background:"var(--bg-3)",color:"var(--t2)",padding:"6px 12px",fontSize:11}}>{copiedId==="p"?"복사됨":"복사"}</button>
            <button onClick={()=>saveEmail({value:results.email,first_name:results.first_name,last_name:results.last_name,position:results.position,confidence:results.score})} style={{...btnStyle,background:"var(--bg-3)",color:"var(--t2)",padding:"6px 12px",fontSize:11}}>저장</button>
          </div>
        </div> : <div style={{textAlign:"center",padding:20,color:"var(--t4)"}}>이메일을 찾을 수 없습니다.</div>}
      </div>}

      {/* Saved List */}
      {savedEmails.length>0 && <div className="fi fi4" style={{...cardStyle,marginTop:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:14,fontWeight:700}}>저장된 이메일 ({savedEmails.length})</span>
          <button onClick={exportCSV} style={{...btnStyle,background:"var(--bg-3)",color:"var(--t2)",padding:"5px 10px",fontSize:11}}><Ic.Download s={11}/>CSV</button>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid var(--border)"}}>
            {["이메일","이름","직책","신뢰도",""].map(h=><th key={h} style={{padding:"6px 10px",fontSize:10,color:"var(--t4)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:600,textAlign:"left"}}>{h}</th>)}
          </tr></thead>
          <tbody>{savedEmails.map((e,i)=><tr key={i} style={{borderBottom:"1px solid var(--border)"}}>
            <td style={{padding:"8px 10px",fontFamily:"var(--mono)",fontSize:11,color:"var(--blue-light)"}}>{e.value}</td>
            <td style={{padding:"8px 10px",fontSize:11}}>{e.first_name} {e.last_name}</td>
            <td style={{padding:"8px 10px",fontSize:11,color:"var(--t3)"}}>{e.position||"—"}</td>
            <td style={{padding:"8px 10px"}}><span style={{fontFamily:"var(--mono)",fontSize:11,fontWeight:600,color:cColor(e.confidence||0)}}>{e.confidence||0}%</span></td>
            <td style={{padding:"8px 10px"}}><div onClick={()=>setSavedEmails(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:"var(--t4)"}}><Ic.Trash s={12}/></div></td>
          </tr>)}</tbody>
        </table>
      </div>}
    </div>
  );
}

export default function App() {
  const [filters, setFilters] = useState({industries:[],regions:[],sizes:[],certs:[],intents:[],regulations:[],scoreMin:0,scoreMax:100});
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [detailBuyer, setDetailBuyer] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [emailBuyer, setEmailBuyer] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const isMobile = useIsMobile();
  const [showMobileBanner, setShowMobileBanner] = useState(false);

  // 뒤로가기로 랜딩 복귀
  useEffect(() => {
    const onPop = () => { setShowLanding(true); setShowMobileBanner(false); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [tab, setTab] = useState("전체");
  const [sort, setSort] = useState({field:"score",asc:false});
  const [selected, setSelected] = useState(new Set());
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [starred, setStarred] = useState(new Set(ALL_BUYERS.filter(b=>b.starred).map(b=>b.id)));
  const [savedSet, setSavedSet] = useState(new Set(ALL_BUYERS.filter(b=>b.saved).map(b=>b.id)));
  const [viewSaved, setViewSaved] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [buyerNotes, setBuyerNotes] = useState(new Map());
  const [notesBuyer, setNotesBuyer] = useState(null);
  const [compareSet, setCompareSet] = useState(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifUnread, setNotifUnread] = useState(0);
  const [quickFilter, setQuickFilter] = useState(null);
  const [toast, setToast] = useState(null);
  // ── Apple Theme ──
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('nexport-theme');
      if (saved) return saved === 'dark';
    } catch(e) {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('nexport-theme', isDark ? 'dark' : 'light'); } catch(e) {}
  }, [isDark]);
  const navReducer = (s, a) => {
    if (a.type==='NAVIGATE') { if (a.key===s.history[s.idx]) return s; return {history:[...s.history.slice(0,s.idx+1),a.key],idx:s.idx+1}; }
    if (a.type==='BACK') return s.idx>0?{...s,idx:s.idx-1}:s;
    if (a.type==='FORWARD') return s.idx<s.history.length-1?{...s,idx:s.idx+1}:s;
    if (a.type==='SYNC') { const i=a.idx; return (typeof i==='number'&&i>=0&&i<s.history.length)?{...s,idx:i}:s; }
    return s;
  };
  const [nav, navDispatch] = useReducer(navReducer, {history:['buyers'],idx:0});
  const view = nav.history[nav.idx];
  const canBack = nav.idx > 0;
  const canForward = nav.idx < nav.history.length - 1;
  const navRef = useRef(nav);
  useEffect(() => { navRef.current = nav; });
  const isProgrammaticRef = useRef(false);
  const navigateTo = useCallback((key) => {
    if (key === navRef.current.history[navRef.current.idx]) return;
    const newIdx = navRef.current.idx + 1;
    navDispatch({type:'NAVIGATE', key});
    window.history.pushState({navView:key, navIdx:newIdx}, '');
  }, []);
  const goBack = useCallback(() => {
    if (navRef.current.idx <= 0) return;
    navDispatch({type:'BACK'});
    isProgrammaticRef.current = true;
    window.history.back();
  }, []);
  const goForward = useCallback(() => {
    if (navRef.current.idx >= navRef.current.history.length - 1) return;
    navDispatch({type:'FORWARD'});
    isProgrammaticRef.current = true;
    window.history.forward();
  }, []);
  useEffect(() => {
    window.history.replaceState({navView:'buyers', navIdx:0}, '');
    const onPop = (e) => {
      if (isProgrammaticRef.current) { isProgrammaticRef.current = false; return; }
      if (e.state && typeof e.state.navIdx === 'number') {
        const cur = navRef.current.idx;
        if (e.state.navIdx < cur) navDispatch({type:'BACK'});
        else if (e.state.navIdx > cur) navDispatch({type:'FORWARD'});
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Seed notifications on mount
  useEffect(() => {
    const seed = [
      {id:1, type:"match",    title:"새 고가치 바이어 매칭",  body:"Pacific Trade Corp (점수 94) — 즉시 접촉 권장",        ts:Date.now()-180000, read:false},
      {id:2, type:"match",    title:"AI 매칭 완료",           body:"귀사 프로필과 87% 이상 일치 바이어 12명 발견",          ts:Date.now()-900000, read:false},
      {id:3, type:"pipeline", title:"파이프라인 업데이트",     body:"TechParts GmbH → 협상중 단계 진입",                   ts:Date.now()-3600000, read:true},
      {id:4, type:"email",    title:"이메일 확인 완료",        body:"Osaka Precision 담당자 이메일 검증 성공",              ts:Date.now()-7200000, read:true},
    ];
    setNotifications(seed);
    setNotifUnread(seed.filter(n=>!n.read).length);
  }, []);

  // Auto-notify when high-value buyer is saved
  useEffect(() => {
    const highValue = ALL_BUYERS.filter(b=>savedSet.has(b.id)&&b.score>=85);
    if (highValue.length > 0) {
      setNotifications(p => {
        const ids = new Set(p.map(n=>n.id));
        const newOnes = highValue
          .filter(b=>!ids.has(`save-${b.id}`))
          .map(b=>({id:`save-${b.id}`,type:"match",title:"고가치 바이어 저장됨",body:`${b.name} (${b.score}점) 저장 — 빠른 접촉을 권장합니다`,ts:Date.now(),read:false}));
        if (newOnes.length===0) return p;
        setNotifUnread(u=>u+newOnes.length);
        return [...newOnes,...p];
      });
    }
  }, [savedSet]);

  const perPage = 15;

  // Filtering
  const filtered = useMemo(() => {
    let d = [...ALL_BUYERS];
    if (tab === "신규") d = d.filter(b => !savedSet.has(b.id));
    if (tab === "저장됨") d = d.filter(b => savedSet.has(b.id));
    if (search) {
      const s = search.toLowerCase();
      d = d.filter(b => b.name.toLowerCase().includes(s) || b.company.toLowerCase().includes(s) || b.demand.toLowerCase().includes(s) || b.country.includes(s) || b.industry.includes(s));
    }
    if (filters.industries.length) d = d.filter(b => filters.industries.includes(b.industry));
    if (filters.regions.length) d = d.filter(b => filters.regions.includes(b.region));
    if (filters.certs.length) d = d.filter(b => b.certifications.some(c => filters.certs.includes(c)));
    if (filters.intents.length) d = d.filter(b => filters.intents.includes(b.buyingIntent));
    if (filters.regulations&&filters.regulations.length) d = d.filter(b => filters.regulations.some(r => (b.regulatoryShield||[]).includes(r)));
    if (filters.scoreMin > 0) d = d.filter(b => b.score >= filters.scoreMin);
    if (filters.scoreMax < 100) d = d.filter(b => b.score <= filters.scoreMax);
    // Size filter
    if (filters.sizes.length) {
      d = d.filter(b => filters.sizes.some(s => {
        if (s === "1-50") return b.employees <= 50;
        if (s === "51-200") return b.employees > 50 && b.employees <= 200;
        if (s === "201-1000") return b.employees > 200 && b.employees <= 1000;
        return b.employees > 1000;
      }));
    }
    // Quick filter
    if (quickFilter) {
      const qf = QUICK_FILTERS.find(q=>q.id===quickFilter);
      if (qf) d = d.filter(qf.test);
    }
    // Sort
    d.sort((a, b) => {
      let va = a[sort.field], vb = b[sort.field];
      if (typeof va === "string") return sort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sort.asc ? va - vb : vb - va;
    });
    return d;
  }, [filters, search, tab, sort, savedSet, quickFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey||e.ctrlKey) && e.key==="k") { e.preventDefault(); setShowAssistant(s=>!s); }
      if (e.key==="Escape") setShowAssistant(false);
      if (e.altKey && e.key==="ArrowLeft") { e.preventDefault(); goBack(); }
      if (e.altKey && e.key==="ArrowRight") { e.preventDefault(); goForward(); }
      if (e.key==="l" && !e.metaKey && !e.ctrlKey && !e.altKey && document.activeElement.tagName!=="INPUT" && document.activeElement.tagName!=="TEXTAREA") { setIsDark(d=>!d); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goBack, goForward]);

  const allOnPageSelected = paged.length > 0 && paged.every(b => selected.has(b.id));

  const toggleSort = (field) => setSort(p => p.field === field ? { field, asc: !p.asc } : { field, asc: false });
  const toggleSelect = (id) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    if (allOnPageSelected) setSelected(p => { const n = new Set(p); paged.forEach(b => n.delete(b.id)); return n; });
    else setSelected(p => { const n = new Set(p); paged.forEach(b => n.add(b.id)); return n; });
  };
  const saveSelected = () => { setSavedSet(p => { const n = new Set(p); selected.forEach(id => n.add(id)); return n; }); };

  const activeFilters = [
    ...filters.industries.map(i => ({label:i,clear:()=>setFilters(p=>({...p,industries:p.industries.filter(x=>x!==i)}))})),
    ...filters.regions.map(r => ({label:r,clear:()=>setFilters(p=>({...p,regions:p.regions.filter(x=>x!==r)}))})),
    ...filters.certs.map(c => ({label:c,clear:()=>setFilters(p=>({...p,certs:p.certs.filter(x=>x!==c)}))})),
    ...filters.intents.map(i => ({label:`의향:${i}`,clear:()=>setFilters(p=>({...p,intents:p.intents.filter(x=>x!==i)}))})),
    ...(filters.regulations||[]).map(r => ({label:`규제:${r}`,clear:()=>setFilters(p=>({...p,regulations:p.regulations.filter(x=>x!==r)}))})),
  ];

  useEffect(() => { setPage(1); }, [filters, search, tab, quickFilter]);

  const SortIcon = ({field}) => sort.field===field ? (sort.asc ? <Ic.SortAsc/> : <Ic.SortDesc/>) : <Ic.Sort/>;

  const intentColor = i => i==="높음"?"var(--green)":i==="중간"?"var(--amber)":"var(--t4)";
  const statusColor = s => ({신규:"var(--blue)",검토중:"var(--violet)",협상중:"var(--amber)",LOI:"var(--cyan)",계약완료:"var(--green)"}[s]||"var(--t3)");

  const netNew = ALL_BUYERS.filter(b => !savedSet.has(b.id)).length;
  const savedCount = savedSet.size;

  // App-level toast auto-dismiss
  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(null),4000); return()=>clearTimeout(t); } },[toast]);

  return (
    <>
      <style>{CSS}</style>
      {showLanding && <LandingHero
        onEnter={() => { if (isMobile) { setShowMobileBanner(true); } else { history.pushState({ page: "platform" }, "", location.href); setShowLanding(false); } }}
        isMobile={isMobile}
      />}
      {showMobileBanner && <MobileDesktopBanner onClose={() => setShowMobileBanner(false)} />}

      {!showLanding && !isMobile && (<>
      {/* App-level Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,right:20,zIndex:300,padding:"12px 20px",borderRadius:10,
          minWidth:280,background:"linear-gradient(135deg,var(--green),var(--blue))",
          color:"#fff",fontSize:13,fontWeight:600,animation:"slideIn .4s ease",
          boxShadow:"0 10px 25px rgba(0,0,0,.35)",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
          onClick={()=>setToast(null)}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#fff",animation:"pulse 1.5s infinite"}}/>
          {toast}
          <div style={{marginLeft:"auto",opacity:.7,fontSize:16}}>×</div>
        </div>
      )}

      {emailBuyer && <ColdEmailModal buyer={emailBuyer} onClose={()=>setEmailBuyer(null)} />}
      {showAssistant && <AIAssistant buyers={ALL_BUYERS} onClose={()=>setShowAssistant(false)} />}
      {notesBuyer && <BuyerNotesPanel buyer={notesBuyer} notes={buyerNotes.get(notesBuyer.id)||[]} onAddNote={entry=>setBuyerNotes(p=>{const n=new Map(p);n.set(notesBuyer.id,[...(n.get(notesBuyer.id)||[]),entry]);return n;})} onDeleteNote={id=>setBuyerNotes(p=>{const n=new Map(p);n.set(notesBuyer.id,(n.get(notesBuyer.id)||[]).filter(e=>e.id!==id));return n;})} onClose={()=>setNotesBuyer(null)} />}
      {showCompare && compareSet.size >= 2 && <BuyerCompareModal buyers={ALL_BUYERS.filter(b=>compareSet.has(b.id))} onClose={()=>{setShowCompare(false);setCompareSet(new Set());}} />}
      {detailBuyer && <BuyerDetailPanel buyer={detailBuyer} onClose={()=>setDetailBuyer(null)} onSave={(b)=>{savedSet.has(b.id)?setSavedSet(p=>{const n=new Set(p);n.delete(b.id);return n}):setSavedSet(p=>new Set([...p,b.id]))}} isSaved={savedSet.has(detailBuyer.id)} onEmailBuyer={b=>setEmailBuyer(b)} onShowNotes={b=>setNotesBuyer(b)} onDetailBuyer={b=>setDetailBuyer(b)} />}

      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"var(--bg-0)"}}>
        {/* Filter Sidebar */}
        {view==="buyers" && <FilterSidebar filters={filters} setFilters={setFilters} collapsed={sideCollapsed} setCollapsed={setSideCollapsed} />}

        {/* Main Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Top Header */}
          <div className="nx-header" style={{padding:"12px 20px",borderBottom:"1px solid var(--border)",background:"var(--glass-bg)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",display:"flex",alignItems:"center",gap:16,flexShrink:0,position:"sticky",top:0,zIndex:100}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,var(--blue),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Users s={14}/></div>
              <div>
                <h1 className="nx-header-brand" style={{fontSize:16,fontWeight:800,letterSpacing:"-.03em",fontFamily:"var(--font)"}}>NEXPORT</h1>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:2}}>
              <div onClick={canBack?goBack:undefined} title="뒤로 (Alt+←)" style={{width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:canBack?"pointer":"not-allowed",color:canBack?"var(--t1)":"var(--t4)",background:"var(--bg-3)",border:"1px solid var(--border)",opacity:canBack?1:0.35,transition:"all .15s"}}><Ic.ChevLeft s={14}/></div>
              <div onClick={canForward?goForward:undefined} title="앞으로 (Alt+→)" style={{width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:canForward?"pointer":"not-allowed",color:canForward?"var(--t1)":"var(--t4)",background:"var(--bg-3)",border:"1px solid var(--border)",opacity:canForward?1:0.35,transition:"all .15s"}}><Ic.ChevRight s={14}/></div>
            </div>
            <div className="nx-header-search" style={{flex:1,maxWidth:420}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)"}}>
                <Ic.Search s={14}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="바이어, 기업명, 품목, 국가 검색..." style={{flex:1,background:"transparent",border:"none",outline:"none",color:"var(--t1)",fontSize:12}} />
                {search && <div onClick={()=>setSearch("")} style={{cursor:"pointer",color:"var(--t4)"}}><Ic.X s={12}/></div>}
              </div>
            </div>
            <div className="nx-header-actions" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:2,background:"var(--bg-3)",borderRadius:8,padding:2}}>
              {[
                {key:"buyers",label:"바이어",icon:<Ic.Users s={12}/>},
                {key:"dashboard",label:"대시보드",icon:<Ic.Bar s={12}/>},
                {key:"emailfinder",label:"이메일",icon:<Ic.Mail s={12}/>},
                {key:"aiMatch",label:"AI 매칭",icon:<Ic.Sparkle s={12}/>},
                {key:"playbook",label:"플레이북",icon:<Ic.BookOpen s={12}/>},
              ].map(tab=>{
                const active = view===tab.key;
                return <div key={tab.key} onClick={()=>navigateTo(tab.key)} style={{padding:"6px 14px",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:active?700:500,transition:"all .2s",background:active?"var(--bg-1)":"transparent",color:active?"var(--t1)":"var(--t3)",boxShadow:active?"0 1px 3px rgba(0,0,0,.2)":"none"}}>{tab.icon}{tab.label}</div>;
              })}
            </div>
            {/* Theme Toggle */}
            <button onClick={()=>setIsDark(d=>!d)} title={isDark?"☀️ 라이트 모드로 전환":"🌙 다크 모드로 전환"}
              style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,outline:"none",background:"var(--bg-hover)",border:"1px solid var(--border)",color:"var(--t2)",transition:"all 0.25s cubic-bezier(0.2,0,0,1)"}}
              onMouseEnter={e=>{e.currentTarget.style.color="var(--t1)";e.currentTarget.style.borderColor="var(--border-h)"}}
              onMouseLeave={e=>{e.currentTarget.style.color="var(--t2)";e.currentTarget.style.borderColor="var(--border)"}}
            >{isDark?<Ic.Sun s={15}/>:<Ic.Moon s={15}/>}</button>
            {/* Bell / Notification */}
            <div style={{position:"relative",flexShrink:0}} onClick={()=>setShowNotifications(p=>!p)}>
              <div style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"var(--bg-hover)",border:"1px solid var(--border)",color:"var(--t2)",transition:"all .2s cubic-bezier(0.2,0,0,1)"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-h)";e.currentTarget.style.color="var(--t1)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--t2)"}}
              ><Ic.Bell s={15}/></div>
              {notifUnread > 0 && (
                <div style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:8,background:"var(--red)",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",animation:"pulse 2s infinite",pointerEvents:"none"}}>{notifUnread}</div>
              )}
            </div>
          </div>
          {showNotifications && (
            <NotificationCenter notifications={notifications} unread={notifUnread}
              onMarkRead={id=>{ setNotifications(p=>p.map(n=>n.id===id?{...n,read:true}:n)); setNotifUnread(p=>Math.max(0,p-1)); }}
              onMarkAllRead={()=>{ setNotifications(p=>p.map(n=>({...n,read:true}))); setNotifUnread(0); }}
              onClear={()=>{ setNotifications([]); setNotifUnread(0); }}
              onClose={()=>setShowNotifications(false)}
            />
          )}

          {view==="aiMatch" ? <AIMatchView buyers={ALL_BUYERS} /> : view==="dashboard" ? <DashboardView buyers={ALL_BUYERS} savedSet={savedSet} starred={starred} buyerNotes={buyerNotes} /> : view==="emailfinder" ? <EmailFinderView /> : view==="playbook" ? <PlaybookView buyers={ALL_BUYERS} savedSet={savedSet} onRunPlaybook={(ids,title,cnt)=>{setSelected(ids);navigateTo('buyers');setToast(`✅ "${title}" 실행 — ${cnt}명 바이어가 선택되었습니다`);}} /> : <>
          {/* Tabs + Meta */}
          <div style={{padding:"8px 20px",borderBottom:"1px solid var(--border)",background:"var(--bg-1)",display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
            <div style={{display:"flex",gap:2,padding:2,background:"var(--bg-3)",borderRadius:7}}>
              {[["전체",filtered.length],["신규",netNew],["저장됨",savedCount]].map(([t,c])=>(
                <div key={t} onClick={()=>setTab(t)} style={{
                  padding:"5px 14px",borderRadius:5,fontSize:12,fontWeight:tab===t?600:400,
                  background:tab===t?"var(--bg-1)":"transparent",color:tab===t?"var(--t1)":"var(--t3)",
                  cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:5
                }}>
                  {t}
                  <span style={{fontFamily:"var(--mono)",fontSize:10,padding:"0 4px",borderRadius:3,background:tab===t?"var(--blue-dim)":"transparent",color:tab===t?"var(--blue)":"var(--t4)"}}>{c}</span>
                </div>
              ))}
            </div>

            {/* Active filter tags */}
            {activeFilters.length > 0 && (
              <div style={{display:"flex",gap:4,flexWrap:"wrap",flex:1}}>
                {activeFilters.map((f,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:4,background:"var(--blue-dim)",color:"var(--blue)",fontSize:10,fontWeight:500}}>
                    {f.label}
                    <span onClick={f.clear} style={{cursor:"pointer",opacity:.6}}><Ic.X s={10}/></span>
                  </div>
                ))}
              </div>
            )}

            <div style={{marginLeft:"auto",fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>
              {filtered.length.toLocaleString()} 결과
            </div>
          </div>

          {/* ── Quick Filter Chips (Apollo-style) ── */}
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 20px",overflowX:"auto",borderBottom:"1px solid var(--border)",background:"var(--bg-1)",flexShrink:0}}>
            <span style={{fontSize:10,color:"var(--t4)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap",flexShrink:0}}>빠른 필터</span>
            {QUICK_FILTERS.map(q=>{
              const active = quickFilter===q.id;
              const cnt = ALL_BUYERS.filter(q.test).length;
              return (
                <button key={q.id} onClick={()=>setQuickFilter(active?null:q.id)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:20,
                    border:`1.5px solid ${active?`var(${q.color})`:"var(--border)"}`,
                    background:active?`var(${q.color}-dim)`:"transparent",
                    color:active?`var(${q.color})`:"var(--t2)",
                    fontSize:11,fontWeight:active?600:400,cursor:"pointer",
                    whiteSpace:"nowrap",transition:"all .2s cubic-bezier(0.2,0,0,1)",flexShrink:0,outline:"none"}}>
                  {q.label}
                  <span style={{fontSize:9,padding:"1px 5px",borderRadius:8,
                    background:active?`var(${q.color})`:"var(--bg-4)",
                    color:active?"#fff":"var(--t3)",fontFamily:"var(--mono)",fontWeight:600}}>
                    {cnt}
                  </span>
                </button>
              );
            })}
            {quickFilter && (
              <button onClick={()=>setQuickFilter(null)}
                style={{padding:"4px 10px",borderRadius:20,border:"1.5px solid var(--red)",
                  background:"var(--red-dim)",color:"var(--red)",fontSize:11,cursor:"pointer",
                  display:"flex",alignItems:"center",gap:4,flexShrink:0,outline:"none"}}>
                <Ic.X s={10}/> 초기화
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{flex:1,overflow:"auto",position:"relative"}}>
            <div className="nx-table-wrap"><table className="nx-main-table" style={{width:"100%",borderCollapse:"collapse",minWidth:1100}}>
              <thead>
                <tr style={{position:"sticky",top:0,zIndex:10,background:"var(--bg-2)"}}>
                  <th style={{width:40,padding:"8px 12px"}}><Checkbox checked={allOnPageSelected} indeterminate={selected.size>0&&!allOnPageSelected} onChange={toggleAll}/></th>
                  <th style={{width:30}}/>
                  {[
                    ["name","바이어",180],["company","기업명",150],["country","국가",105],["industry","산업",110],
                    ["score","매칭점수",120],["demand","수요 품목",140],["volume","예상 규모",90],
                    ["buyingIntent","의향",90],["status","상태",75],["email","이메일",170]
                  ].map(([field,label,w])=>(
                    <th key={field} onClick={()=>toggleSort(field)} style={{
                      padding:"8px 10px",fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",
                      letterSpacing:".08em",textAlign:"left",cursor:"pointer",whiteSpace:"nowrap",
                      width:w,borderBottom:"1px solid var(--border)",userSelect:"none"
                    }}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        {label}<span style={{color:sort.field===field?"var(--blue)":"var(--t4)"}}><SortIcon field={field}/></span>
                      </div>
                    </th>
                  ))}
                  <th style={{width:50,borderBottom:"1px solid var(--border)"}}/>
                </tr>
              </thead>
              <tbody>
                {paged.map((b, i) => {
                  const isSel = selected.has(b.id);
                  const isSaved = savedSet.has(b.id);
                  return (
                    <tr key={b.id} className={`

.nx-loading-overlay{position:absolute;inset:0;background:rgba(6,7,10,.6);display:flex;align-items:center;justify-content:center;z-index:20;backdrop-filter:blur(2px)}
.nx-empty-bounce{animation:fadeIn .4s ease}


/* Nav tabs */
.nx-header-actions > div:not(:hover) { }
.nx-header-actions > div:hover { background: var(--bg-hover) !important; color: var(--t1) !important; }

/* ─── RESPONSIVE BREAKPOINTS ─── */
@media (max-width: 1024px) {
  .nx-sidebar { width: 200px !important; min-width: 200px !important; }
  .nx-sidebar.collapsed { width: 0px !important; min-width: 0px !important; padding: 0 !important; overflow: hidden !important; }
  .nx-main-table th, .nx-main-table td { padding: 6px 8px !important; font-size: 11px !important; }
  .nx-header-actions { gap: 4px !important; }
  .nx-header-actions > div { font-size: 10px !important; padding: 4px 8px !important; }
  .nx-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .nx-dashboard-grid { grid-template-columns: 1fr !important; }
  .nx-email-modes { grid-template-columns: 1fr !important; }
}

@media (max-width: 768px) {
  .nx-sidebar { display: none !important; }
  .nx-header { flex-wrap: wrap !important; gap: 8px !important; padding: 8px 12px !important; }
  .nx-header-brand { font-size: 14px !important; }
  .nx-header-search { width: 100% !important; order: 10 !important; min-width: unset !important; }
  .nx-header-actions { width: 100% !important; justify-content: flex-start !important; overflow-x: auto !important; gap: 4px !important; flex-wrap: nowrap !important; }
  .nx-header-actions > div { white-space: nowrap !important; font-size: 10px !important; }
  .nx-main-content { padding: 8px !important; }
  .nx-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
  .nx-main-table { min-width: 800px !important; }
  .nx-main-table th:nth-child(n+6), .nx-main-table td:nth-child(n+6) { display: none !important; }
  .nx-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
  .nx-dashboard-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
  .nx-dashboard-section { padding: 14px !important; }
  .nx-email-modes { grid-template-columns: 1fr !important; }
  .nx-email-results td { font-size: 11px !important; padding: 6px !important; }
  .nx-ai-input-grid { grid-template-columns: 1fr !important; }
  .nx-ai-results-card { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
  .nx-ai-reasons { max-width: 100% !important; }
  .nx-ai-summary-grid { grid-template-columns: 1fr !important; }
}

@media (max-width: 480px) {
  .nx-header-actions > div > span.nx-btn-label { display: none !important; }
  .nx-kpi-grid { grid-template-columns: 1fr !important; }
  .nx-table-wrap { margin: 0 -8px !important; }
}

/* Utility classes for responsive */
.nx-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.nx-scroll-hint { display: none; }
@media (max-width: 768px) {
  .nx-scroll-hint { display: block; text-align: center; padding: 6px; font-size: 10px; color: var(--t4); }
}

fi fi${Math.min(i+1,5)}`}
                      onClick={()=>setDetailBuyer(b)}
                      style={{cursor:"pointer",borderBottom:"1px solid var(--border)",background:isSel?"var(--blue-dim)":"transparent",transition:"background .12s"}}
                      onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="var(--bg-hover)"}}
                      onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background=isSel?"var(--blue-dim)":"transparent"}}
                    >
                      <td style={{padding:"8px 12px"}} onClick={e=>e.stopPropagation()}><Checkbox checked={isSel} onChange={()=>toggleSelect(b.id)}/></td>
                      <td style={{padding:"4px 0"}} onClick={e=>{e.stopPropagation();setStarred(p=>{const n=new Set(p);n.has(b.id)?n.delete(b.id):n.add(b.id);return n})}}>
                        <span style={{cursor:"pointer",color:starred.has(b.id)?"var(--amber)":"var(--t4)"}}>{starred.has(b.id)?<Ic.StarFill s={13}/>:<Ic.Star s={13}/>}</span>
                      </td>
                      <td style={{padding:"8px 10px"}}>
                        <div style={{fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:5}}>
                          {b.name}
                          {b.hotSignal&&<span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:3,background:"rgba(245,158,11,.15)",color:"var(--amber)",border:"1px solid rgba(245,158,11,.25)",whiteSpace:"nowrap",animation:"pulse 2s infinite"}}>⚡ {b.hotSignal}</span>}
                        </div>
                        <div style={{fontSize:11,color:"var(--t3)",marginTop:1,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                          <span>{b.title}</span>
                          {b.regulatoryShield&&b.regulatoryShield.length>0&&<span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:3,background:"rgba(139,92,246,.15)",color:"var(--violet)",whiteSpace:"nowrap"}}>🛡 규제보호</span>}
                        </div>
                      </td>
                      <td style={{padding:"8px 10px"}}>
                        <div style={{fontSize:12,fontWeight:500}}>{b.company}</div>
                        <div style={{fontSize:10,color:"var(--t4)",marginTop:1}}>{b.employeeLabel} · {b.revenue}</div>
                      </td>
                      <td style={{padding:"8px 10px",fontSize:12,whiteSpace:"nowrap"}}><span>{b.flag}</span> <span style={{color:"var(--t2)"}}>{b.country}</span></td>
                      <td style={{padding:"8px 10px",fontSize:12,color:"var(--t2)"}}>{b.industry}</td>
                      <td style={{padding:"8px 10px"}}><ScoreBar score={b.score}/></td>
                      <td style={{padding:"8px 10px",fontSize:12,color:"var(--t2)"}}>{b.demand}</td>
                      <td style={{padding:"8px 10px"}}><span style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:600,color:"var(--green)"}}>{b.volume}</span></td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>
                        <div><span style={{width:6,height:6,borderRadius:"50%",background:intentColor(b.buyingIntent),display:"inline-block",marginRight:4}}/><span style={{fontSize:11,color:intentColor(b.buyingIntent)}}>{b.buyingIntent}</span></div>
                        {b.buyerType&&b.buyerType!=="가격우선"&&<div style={{fontSize:9,fontWeight:700,color:b.buyerType==="한국산필수"?"var(--green)":"var(--cyan)",marginTop:2,whiteSpace:"nowrap"}}>{b.buyerType==="한국산필수"?"🛡 한국산필수":"📋 인증우선"}</div>}
                      </td>
                      <td style={{padding:"8px 10px"}}><Badge color={statusColor(b.status)}>{b.status}</Badge></td>
                      <td style={{padding:"8px 10px",fontSize:11,color:"var(--t3)"}}>{b.email}</td>
                      <td style={{padding:"8px 10px"}} onClick={e=>e.stopPropagation()}>
                        {!isSaved ? (
                          <div onClick={()=>setSavedSet(p=>{const n=new Set(p);n.add(b.id);return n})} style={{padding:"3px 8px",borderRadius:4,background:"var(--blue-dim)",color:"var(--blue)",fontSize:10,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>+ 저장</div>
                        ) : (
                          <span style={{fontSize:10,color:"var(--green)",display:"flex",alignItems:"center",gap:3}}><Ic.Check s={10}/>저장됨</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
            {paged.length === 0 && <div style={{padding:"40px 0"}}><EmptyState icon={<Ic.Search s={24}/>} title="검색 결과가 없습니다" subtitle="다른 필터 조건이나 검색어를 시도해 보세요" /></div>}
          </div>

          {/* Pagination */}
          <div style={{padding:"8px 20px",borderTop:"1px solid var(--border)",background:"var(--bg-1)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{fontSize:11,color:"var(--t3)"}}>
              {filtered.length > 0 && `${(page-1)*perPage+1}-${Math.min(page*perPage,filtered.length)} / ${filtered.length}건`}
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <div onClick={()=>page>1&&setPage(p=>p-1)} style={{padding:"4px 8px",borderRadius:4,border:"1px solid var(--border)",cursor:page>1?"pointer":"default",color:page>1?"var(--t2)":"var(--t4)",fontSize:11}}><Ic.ChevLeft s={12}/></div>
              {Array.from({length:Math.min(7,totalPages)}, (_,i) => {
                let p;
                if (totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <div key={p} onClick={()=>setPage(p)} style={{
                    padding:"4px 8px",borderRadius:4,fontSize:11,fontFamily:"var(--mono)",cursor:"pointer",
                    background:page===p?"var(--blue)":"transparent",color:page===p?"#fff":"var(--t3)",
                    fontWeight:page===p?700:400,minWidth:28,textAlign:"center"
                  }}>{p}</div>
                );
              })}
              <div onClick={()=>page<totalPages&&setPage(p=>p+1)} style={{padding:"4px 8px",borderRadius:4,border:"1px solid var(--border)",cursor:page<totalPages?"pointer":"default",color:page<totalPages?"var(--t2)":"var(--t4)",fontSize:11}}><Ic.ChevRight s={12}/></div>
            </div>
            <div style={{fontSize:11,color:"var(--t4)"}}>페이지당 {perPage}건</div>
          </div>

          {/* Floating Action Bar */}
          {selected.size > 0 && (
            <div style={{
              position:"absolute",bottom:56,left:"50%",transform:"translateX(-50%)",
              display:"flex",alignItems:"center",gap:12,padding:"10px 20px",
              borderRadius:16,background:"var(--glass-bg-strong)",backdropFilter:"blur(20px) saturate(180%)",WebkitBackdropFilter:"blur(20px) saturate(180%)",border:"1px solid var(--border)",
              boxShadow:"var(--modal-shadow)",animation:"float .3s cubic-bezier(0.05,0.7,0.1,1)",zIndex:50
            }}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--blue)"}}>{selected.size}건 선택</span>
              <div style={{width:1,height:20,background:"var(--border)"}} />
              {[
                ["저장",Ic.Plus,saveSelected,"var(--blue)"],
                ["이메일",Ic.Mail,()=>{},"var(--green)"],
                ["리스트 추가",Ic.List,()=>{},"var(--violet)"],
                ["CSV 내보내기",Ic.Download,()=>setShowExport(true),"var(--amber)"],
                ["AI 매칭",Ic.Zap,()=>{},"var(--cyan)"],
              ].map(([label,Icon,action,color]) => (
                <div key={label} onClick={action} style={{
                  display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:6,
                  cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--t2)",transition:"all .15s"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${color}15`;e.currentTarget.style.color=color}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--t2)"}}
                ><Icon s={13}/>{label}</div>
              ))}
              {selected.size >= 2 && selected.size <= 3 && <>
                <div style={{width:1,height:20,background:"var(--border)"}} />
                <div onClick={()=>{setCompareSet(new Set(selected));setShowCompare(true);}} style={{
                  display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:6,
                  cursor:"pointer",fontSize:11,fontWeight:700,color:"var(--violet)",
                  background:"var(--violet-dim)",border:"1px solid rgba(139,92,246,.25)",transition:"all .15s"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(139,92,246,.25)"}}
                  onMouseLeave={e=>{e.currentTarget.style.background="var(--violet-dim)"}}
                ><Ic.Columns s={13}/>비교</div>
              </>}
              <div style={{width:1,height:20,background:"var(--border)"}} />
              <div onClick={()=>setSelected(new Set())} style={{cursor:"pointer",color:"var(--t4)",padding:4}}><Ic.X s={14}/></div>
            </div>
          )}
        </>}
        </div>

        {/* Detail Panel */}
        {detail && <DetailPanel buyer={detail} onClose={()=>setDetail(null)} />}
      </div>

      {/* Export Modal */}
      {showExport && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowExport(false)}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",background:"var(--bg-2)",border:"1px solid var(--border-h)",borderRadius:16,padding:24,width:420,animation:"scaleIn .2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontSize:16,fontWeight:700}}>CSV 내보내기</h3>
              <div onClick={()=>setShowExport(false)} style={{cursor:"pointer",color:"var(--t4)"}}><Ic.X s={16}/></div>
            </div>
            <p style={{fontSize:13,color:"var(--t2)",marginBottom:16}}>{selected.size}건의 바이어 데이터를 내보냅니다.</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {["모든 필드 포함","인증 이메일만 포함","연락처 정보 제외"].map((opt,i) => (
                <label key={opt} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"var(--t2)",cursor:"pointer"}}>
                  <input type="radio" name="exportOpt" defaultChecked={i===0} style={{accentColor:"var(--blue)"}} />{opt}
                </label>
              ))}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowExport(false)} style={{padding:"8px 16px",borderRadius:8,border:"1px solid var(--border)",background:"transparent",color:"var(--t2)",fontSize:13,cursor:"pointer"}}>취소</button>
              <button onClick={()=>{setShowExport(false);setSelected(new Set())}} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"linear-gradient(135deg,var(--blue),var(--violet))",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                <Ic.Download s={14}/>내보내기
              </button>
            </div>
          </div>
        </div>
      )}
      </>)}
    </>
  );
}
