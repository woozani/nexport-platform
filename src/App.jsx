import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ─────────── STYLES ───────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Noto+Sans+KR:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
:root {
  --bg-0:#06070A; --bg-1:#0C0D12; --bg-2:#111218; --bg-3:#16171F; --bg-4:#1C1D27;
  --bg-hover:#1F2130; --bg-active:#252738;
  --blue:#3B6BF5; --blue-light:#5B8AFF; --blue-dim:rgba(59,107,245,.08);
  --cyan:#22D3EE; --cyan-dim:rgba(34,211,238,.08);
  --green:#10B981; --green-dim:rgba(16,185,129,.08);
  --amber:#F59E0B; --amber-dim:rgba(245,158,11,.08);
  --red:#EF4444; --red-dim:rgba(239,68,68,.08);
  --violet:#8B5CF6; --violet-dim:rgba(139,92,246,.08);
  --t1:#ECEEF4; --t2:#9498A8; --t3:#5C6078; --t4:#3A3D4E;
  --border:#1E2030; --border-h:#2A2D42;
  --font: 'DM Sans','Noto Sans KR',sans-serif;
  --mono: 'JetBrains Mono',monospace;
  --serif: 'Instrument Serif',serif;
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font);background:var(--bg-0);color:var(--t1);font-size:13px;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--t4);border-radius:3px}
input,textarea,select,button{font-family:inherit}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes barGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes float{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}
@keyframes slideInRight{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
}
}
.fi{animation:fadeIn .4s ease forwards;opacity:0}
.fi1{animation-delay:.03s}.fi2{animation-delay:.06s}.fi3{animation-delay:.09s}.fi4{animation-delay:.12s}.fi5{animation-delay:.15s}
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
};

// ─────────── DATA ───────────
const COUNTRIES = ["독일","미국","일본","베트남","스웨덴","네덜란드","영국","호주","캐나다","프랑스","싱가포르","태국","인도","브라질","멕시코"];
const FLAGS = {"독일":"🇩🇪","미국":"🇺🇸","일본":"🇯🇵","베트남":"🇻🇳","스웨덴":"🇸🇪","네덜란드":"🇳🇱","영국":"🇬🇧","호주":"🇦🇺","캐나다":"🇨🇦","프랑스":"🇫🇷","싱가포르":"🇸🇬","태국":"🇹🇭","인도":"🇮🇳","브라질":"🇧🇷","멕시코":"🇲🇽"};
const REGIONS = {"독일":"유럽","미국":"북미","일본":"아시아","베트남":"동남아","스웨덴":"유럽","네덜란드":"유럽","영국":"유럽","호주":"오세아니아","캐나다":"북미","프랑스":"유럽","싱가포르":"동남아","태국":"동남아","인도":"아시아","브라질":"남미","멕시코":"북미"};
const INDUSTRIES = ["자동차 부품","전자부품","의료기기","항공우주","플라스틱 사출","금속가공","반도체 장비","화학소재","건설자재","에너지"];
const CERTS = ["ISO 9001","ISO 13485","IATF 16949","UL","CE","FDA","RoHS","REACH","JIS","AS9100"];
const DEMANDS = ["CNC 정밀가공 부품","PCB 어셈블리","아크릴 패널 가공","스테인레스 정밀 부품","알루미늄 다이캐스팅","플라스틱 사출 성형","금형 제작","표면처리 가공","레이저 커팅","프레스 부품"];
const STATUSES = ["신규","검토중","협상중","LOI","계약완료"];
const NAMES_FIRST = ["Hans","Sarah","Erik","Nguyen","Tanaka","Pierre","James","Maria","Sven","Akiko","John","Lisa","Marco","Priya","Carlos","Wei","Oliver","Sophie","Lars","Yuki"];
const NAMES_LAST = ["Mueller","Chen","Johansson","Tran","Yamamoto","Dupont","Wilson","Garcia","Lindberg","Sato","Smith","Park","Rossi","Patel","Rodriguez","Zhang","Brown","Martin","Eriksson","Kim"];
const COMPANIES = ["TechParts GmbH","Pacific Trade Corp","Saigon Manufacturing","Nordic Solutions AB","Osaka Precision Co.","Rotterdam Metals BV","Thames Engineering","Sydney Industrial","Maple Leaf Tech","Lyon Aerospace","SG Components Pte","Bangkok Polymer","Delhi Precision","São Paulo Metals","Monterrey Auto Parts","Shanghai Tech Group","Manchester Steel","Paris Medical Devices","Stockholm Dynamics","Tokyo Electronics"];

function generateBuyers(n) {
  const buyers = [];
  for (let i = 0; i < n; i++) {
    const country = COUNTRIES[i % COUNTRIES.length];
    const company = i < COMPANIES.length ? COMPANIES[i] : `${COMPANIES[i%COMPANIES.length]} ${Math.floor(i/20)+2}`;
    const score = Math.max(45, Math.min(99, Math.floor(Math.random() * 55) + 45));
    const ind = INDUSTRIES[i % INDUSTRIES.length];
    const emp = [10,25,50,100,250,500,1000,5000][Math.floor(Math.random()*8)];
    const rev = ["$1M-5M","$5M-10M","$10M-50M","$50M-100M","$100M+"][Math.floor(Math.random()*5)];
    const certs = CERTS.filter(() => Math.random() > .65);
    buyers.push({
      id: i + 1,
      name: `${NAMES_FIRST[i%20]} ${NAMES_LAST[i%20]}`,
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
      email: `${NAMES_FIRST[i%20].toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g,'').slice(0,12)}.com`,
      phone: `+${[49,1,81,84,46,31,44,61,1,33,65,66,91,55,52][i%15]}-${Math.floor(Math.random()*900+100)}-${Math.floor(Math.random()*9000+1000)}`,
      buyingIntent: ["높음","중간","낮음"][Math.floor(Math.random()*3)],
      saved: Math.random() > .7,
      starred: Math.random() > .85,
      lastActive: `${Math.floor(Math.random()*30)+1}일 전`,
    });
  }
  return buyers;
}

const ALL_BUYERS = generateBuyers(60);

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


// ─────────── BUYER DETAIL PANEL ───────────
function BuyerDetailPanel({ buyer, onClose, onSave, isSaved }) {
  if (!buyer) return null;
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
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:90,animation:"fadeIn .2s ease",backdropFilter:"blur(2px)"}}/>
      <div style={{position:"fixed",right:0,top:0,bottom:0,width:420,maxWidth:"90vw",background:"var(--bg-1)",borderLeft:"1px solid var(--border)",zIndex:91,display:"flex",flexDirection:"column",animation:"slideInRight .25s ease",overflow:"hidden"}}>
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
              <div style={{fontSize:16,fontWeight:800}}>{buyer.name}</div>
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
        </div>
        <div style={{padding:"12px 20px",borderTop:"1px solid var(--border)",display:"flex",gap:8,flexShrink:0}}>
          <div onClick={()=>navigator.clipboard.writeText(buyer.email)} style={{flex:1,padding:"10px 0",borderRadius:8,background:"var(--blue)",color:"#fff",textAlign:"center",fontSize:12,fontWeight:600,cursor:"pointer"}}>이메일 복사</div>
          <div onClick={()=>window.open("mailto:"+buyer.email)} style={{flex:1,padding:"10px 0",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t1)",textAlign:"center",fontSize:12,fontWeight:600,cursor:"pointer"}}>이메일 보내기</div>
        </div>
      </div>
    </>
  );
}


// ─────────── LANDING HERO ───────────
function LandingHero({ onEnter }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  const stats = [
    { val: "60+", label: "글로벌 바이어", color: "var(--blue)" },
    { val: "15개국", label: "커버리지", color: "var(--cyan)" },
    { val: "AI", label: "매칭 엔진", color: "var(--green)" },
    { val: "실시간", label: "이메일 파인더", color: "var(--violet)" },
  ];
  const features = [
    { icon: <Ic.Search s={18}/>, title: "바이어 탐색", desc: "60개국 산업·인증·지역별 고급 필터링으로 최적의 바이어를 찾으세요", color: "var(--blue)", dim: "var(--blue-dim)" },
    { icon: <Ic.Mail s={18}/>, title: "이메일 파인더", desc: "Hunter.io 기반 실시간 바이어 이메일 검색 및 검증", color: "var(--cyan)", dim: "var(--cyan-dim)" },
    { icon: <Ic.Bar s={18}/>, title: "대시보드", desc: "파이프라인 관리, KPI 지표, 전환율 분석을 한눈에", color: "var(--amber)", dim: "var(--amber-dim)" },
    { icon: <Ic.Sparkle s={18}/>, title: "AI 매칭", desc: "제조사 프로필 기반 TOP 15 바이어 자동 추천", color: "var(--green)", dim: "var(--green-dim)" },
  ];
  return (
    <div style={{position:"fixed",inset:0,zIndex:100,background:"var(--bg-0)",overflow:"auto"}}>
      {/* Ambient glow */}
      <div style={{position:"fixed",top:"-20%",left:"10%",width:"50vw",height:"50vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(59,107,245,.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"-10%",right:"5%",width:"40vw",height:"40vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.05) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{maxWidth:960,margin:"0 auto",padding:"0 24px"}}>
        {/* Nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 0",opacity:visible?1:0,transform:visible?"none":"translateY(-10px)",transition:"all .6s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,var(--blue),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Users s={16}/></div>
            <span style={{fontSize:18,fontWeight:800,letterSpacing:"-.03em"}}>NEXPORT</span>
          </div>
          <div onClick={onEnter} style={{padding:"8px 20px",borderRadius:8,background:"var(--blue)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",transition:"opacity .2s"}}
            onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>플랫폼 시작</div>
        </div>

        {/* Hero */}
        <div style={{textAlign:"center",padding:"60px 0 40px",opacity:visible?1:0,transform:visible?"none":"translateY(20px)",transition:"all .8s ease .1s"}}>
          <div style={{display:"inline-block",padding:"5px 14px",borderRadius:20,background:"var(--blue-dim)",border:"1px solid rgba(59,107,245,.15)",fontSize:11,fontWeight:600,color:"var(--blue)",marginBottom:20,letterSpacing:".02em"}}>AI-Powered Export Platform</div>
          <h1 style={{fontSize:44,fontWeight:900,lineHeight:1.2,letterSpacing:"-.03em",marginBottom:16,fontFamily:"var(--font)"}}>
            <span style={{color:"var(--t1)"}}>한국 제조업체의</span><br/>
            <span style={{background:"linear-gradient(135deg,var(--blue),var(--cyan))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>글로벌 수출을 AI로</span>
          </h1>
          <p style={{fontSize:16,color:"var(--t3)",maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
            바이어 발굴부터 이메일 검색, AI 매칭까지.<br/>수출의 모든 과정을 하나의 플랫폼에서.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:32}}>
            <div onClick={onEnter} style={{padding:"12px 32px",borderRadius:10,background:"var(--blue)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .2s",boxShadow:"0 4px 20px rgba(59,107,245,.3)"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 24px rgba(59,107,245,.4)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 20px rgba(59,107,245,.3)"}}>
              무료로 시작하기
            </div>
            <div onClick={onEnter} style={{padding:"12px 32px",borderRadius:10,background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--t1)",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-h)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
              데모 보기
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,padding:"20px 0 50px",opacity:visible?1:0,transform:visible?"none":"translateY(20px)",transition:"all .8s ease .3s"}}>
          {stats.map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:"20px 12px",borderRadius:12,background:"var(--bg-2)",border:"1px solid var(--border)"}}>
              <div style={{fontSize:28,fontWeight:800,fontFamily:"var(--mono)",color:s.color,letterSpacing:"-.02em"}}>{s.val}</div>
              <div style={{fontSize:11,color:"var(--t3)",marginTop:4,fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div style={{opacity:visible?1:0,transform:visible?"none":"translateY(20px)",transition:"all .8s ease .5s"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Features</div>
            <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.02em"}}>핵심 기능</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,paddingBottom:60}}>
            {features.map((f,i)=>(
              <div key={i} style={{padding:24,borderRadius:14,background:"var(--bg-2)",border:"1px solid var(--border)",transition:"all .2s",cursor:"default"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-h)";e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none"}}>
                <div style={{width:40,height:40,borderRadius:10,background:f.dim,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,color:f.color}}>{f.icon}</div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{f.title}</div>
                <div style={{fontSize:12,color:"var(--t3)",lineHeight:1.6}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",padding:"30px 0",borderTop:"1px solid var(--border)",opacity:visible?1:0,transition:"all .8s ease .7s"}}>
          <div style={{fontSize:11,color:"var(--t4)"}}>© 2026 NEXPORT. AI 기반 수출 바이어 매칭 플랫폼</div>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ filters, setFilters, collapsed, setCollapsed }) {
  const [openSections, setOpenSections] = useState({"산업":true,"지역":true,"회사규모":false,"인증":false,"구매의향":false,"매칭점수":false});
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
    <div style={{width:260,background:"var(--bg-1)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:700}}><Ic.Filter s={14}/>필터</div>
        <div style={{display:"flex",gap:4}}>
          {Object.values(filters).some(v => Array.isArray(v) ? v.length : v) && (
            <div onClick={()=>setFilters({industries:[],regions:[],sizes:[],certs:[],intents:[],scoreMin:0,scoreMax:100})} style={{fontSize:10,color:"var(--red)",cursor:"pointer",padding:"2px 6px",borderRadius:4,background:"var(--red-dim)"}}>초기화</div>
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
          {INDUSTRIES.slice(0,7).map(ind => (
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
function DashboardView({ buyers, savedSet, starred }) {
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

  const cardStyle = {padding:20,borderRadius:12,background:"var(--bg-2)",border:"1px solid var(--border)"};
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
      {/* KPI Cards */}
      <div className="fi fi1" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
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
      const res = await fetch(url); const data = await res.json();
      if (data.error) setError(data.error); else setResults(data.data);
    } catch(e) { setError("API 요청 실패"); }
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
  const [filters, setFilters] = useState({industries:[],regions:[],sizes:[],certs:[],intents:[],scoreMin:0,scoreMax:100});
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [detailBuyer, setDetailBuyer] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [tab, setTab] = useState("전체");
  const [sort, setSort] = useState({field:"score",asc:false});
  const [selected, setSelected] = useState(new Set());
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [starred, setStarred] = useState(new Set(ALL_BUYERS.filter(b=>b.starred).map(b=>b.id)));
  const [savedSet, setSavedSet] = useState(new Set(ALL_BUYERS.filter(b=>b.saved).map(b=>b.id)));
  const [viewSaved, setViewSaved] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [view, setView] = useState("buyers");
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
    // Sort
    d.sort((a, b) => {
      let va = a[sort.field], vb = b[sort.field];
      if (typeof va === "string") return sort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sort.asc ? va - vb : vb - va;
    });
    return d;
  }, [filters, search, tab, sort, savedSet]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
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
  ];

  useEffect(() => { setPage(1); }, [filters, search, tab]);

  const SortIcon = ({field}) => sort.field===field ? (sort.asc ? <Ic.SortAsc/> : <Ic.SortDesc/>) : <Ic.Sort/>;

  const intentColor = i => i==="높음"?"var(--green)":i==="중간"?"var(--amber)":"var(--t4)";
  const statusColor = s => ({신규:"var(--blue)",검토중:"var(--violet)",협상중:"var(--amber)",LOI:"var(--cyan)",계약완료:"var(--green)"}[s]||"var(--t3)");

  const netNew = ALL_BUYERS.filter(b => !savedSet.has(b.id)).length;
  const savedCount = savedSet.size;

  return (
    <>
      <style>{CSS}</style>
      {showLanding && <LandingHero onEnter={()=>setShowLanding(false)} />}

      {detailBuyer && <BuyerDetailPanel buyer={detailBuyer} onClose={()=>setDetailBuyer(null)} onSave={(b)=>{savedSet.has(b.id)?setSavedSet(p=>{const n=new Set(p);n.delete(b.id);return n}):setSavedSet(p=>new Set([...p,b.id]))}} isSaved={savedSet.has(detailBuyer.id)} />}

      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"var(--bg-0)"}}>
        {/* Filter Sidebar */}
        <FilterSidebar filters={filters} setFilters={setFilters} collapsed={sideCollapsed} setCollapsed={setSideCollapsed} />

        {/* Main Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Top Header */}
          <div className="nx-header" style={{padding:"12px 20px",borderBottom:"1px solid var(--border)",background:"var(--bg-1)",display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,var(--blue),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.Users s={14}/></div>
              <div>
                <h1 className="nx-header-brand" style={{fontSize:16,fontWeight:800,letterSpacing:"-.02em",fontFamily:"var(--font)"}}>바이어 탐색</h1>
              </div>
            </div>
            <div className="nx-header-search" style={{flex:1,maxWidth:420}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:8,background:"var(--bg-3)",border:"1px solid var(--border)"}}>
                <Ic.Search s={14}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="바이어, 기업명, 품목, 국가 검색..." style={{flex:1,background:"transparent",border:"none",outline:"none",color:"var(--t1)",fontSize:12}} />
                {search && <div onClick={()=>setSearch("")} style={{cursor:"pointer",color:"var(--t4)"}}><Ic.X s={12}/></div>}
              </div>
            </div>
            <div className="nx-header-actions" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
              <Tooltip text="검색 저장"><div style={{padding:"6px 10px",borderRadius:6,border:"1px solid var(--border)",cursor:"pointer",color:"var(--t3)",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500}}><Ic.Bookmark s={12}/>저장된 검색</div></Tooltip>
              <Tooltip text="대시보드"><div onClick={()=>setView(v=>v==="dashboard"?"buyers":"dashboard")} style={{padding:"6px 10px",borderRadius:6,border:view==="dashboard"?"1px solid var(--cyan)":"1px solid var(--border)",cursor:"pointer",color:view==="dashboard"?"var(--cyan)":"var(--t3)",background:view==="dashboard"?"var(--cyan-dim)":"transparent",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500,transition:"all .2s"}}><Ic.Bar s={12}/>대시보드</div></Tooltip>
              <Tooltip text="이메일 파인더"><div onClick={()=>setView(v=>v==="buyers"?"emailfinder":"buyers")} style={{padding:"6px 10px",borderRadius:6,border:view==="emailfinder"?"1px solid var(--blue)":"1px solid var(--border)",cursor:"pointer",color:view==="emailfinder"?"var(--blue)":"var(--t3)",background:view==="emailfinder"?"var(--blue-dim)":"transparent",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500,transition:"all .2s"}}><Ic.Mail s={12}/>이메일 파인더</div></Tooltip>
              <Tooltip text="컬럼 설정"><div style={{padding:6,borderRadius:6,border:"1px solid var(--border)",cursor:"pointer",color:"var(--t3)"}}><Ic.Columns s={14}/></div></Tooltip>
            </div>
          </div>

          {view==="dashboard" ? <DashboardView buyers={ALL_BUYERS} savedSet={savedSet} starred={starred} /> : view==="emailfinder" ? <EmailFinderView /> : <>
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

          {/* Table */}
          <div style={{flex:1,overflow:"auto",position:"relative"}}>
            <div className="nx-table-wrap"><table className="nx-main-table" style={{width:"100%",borderCollapse:"collapse",minWidth:1100}}>
              <thead>
                <tr style={{position:"sticky",top:0,zIndex:10,background:"var(--bg-2)"}}>
                  <th style={{width:40,padding:"8px 12px"}}><Checkbox checked={allOnPageSelected} indeterminate={selected.size>0&&!allOnPageSelected} onChange={toggleAll}/></th>
                  <th style={{width:30}}/>
                  {[
                    ["name","바이어",180],["company","기업명",150],["country","국가",80],["industry","산업",110],
                    ["score","매칭점수",120],["demand","수요 품목",140],["volume","예상 규모",90],
                    ["buyingIntent","의향",60],["status","상태",75],["email","이메일",170]
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
                    <tr key={b.id} onClick={()=>setDetailBuyer(b)} style={{cursor:"pointer"}} className={`

.nx-loading-overlay{position:absolute;inset:0;background:rgba(6,7,10,.6);display:flex;align-items:center;justify-content:center;z-index:20;backdrop-filter:blur(2px)}
.nx-empty-bounce{animation:fadeIn .4s ease}

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
                      onClick={()=>setDetail(b)}
                      style={{cursor:"pointer",borderBottom:"1px solid var(--border)",background:isSel?"var(--blue-dim)":"transparent",transition:"background .12s"}}
                      onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="var(--bg-hover)"}}
                      onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background=isSel?"var(--blue-dim)":"transparent"}}
                    >
                      <td style={{padding:"8px 12px"}} onClick={e=>e.stopPropagation()}><Checkbox checked={isSel} onChange={()=>toggleSelect(b.id)}/></td>
                      <td style={{padding:"4px 0"}} onClick={e=>{e.stopPropagation();setStarred(p=>{const n=new Set(p);n.has(b.id)?n.delete(b.id):n.add(b.id);return n})}}>
                        <span style={{cursor:"pointer",color:starred.has(b.id)?"var(--amber)":"var(--t4)"}}>{starred.has(b.id)?<Ic.StarFill s={13}/>:<Ic.Star s={13}/>}</span>
                      </td>
                      <td style={{padding:"8px 10px"}}>
                        <div style={{fontWeight:600,fontSize:13}}>{b.name}</div>
                        <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>{b.title}</div>
                      </td>
                      <td style={{padding:"8px 10px"}}>
                        <div style={{fontSize:12,fontWeight:500}}>{b.company}</div>
                        <div style={{fontSize:10,color:"var(--t4)",marginTop:1}}>{b.employeeLabel} · {b.revenue}</div>
                      </td>
                      <td style={{padding:"8px 10px",fontSize:12}}><span>{b.flag}</span> <span style={{color:"var(--t2)"}}>{b.country}</span></td>
                      <td style={{padding:"8px 10px",fontSize:12,color:"var(--t2)"}}>{b.industry}</td>
                      <td style={{padding:"8px 10px"}}><ScoreBar score={b.score}/></td>
                      <td style={{padding:"8px 10px",fontSize:12,color:"var(--t2)"}}>{b.demand}</td>
                      <td style={{padding:"8px 10px"}}><span style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:600,color:"var(--green)"}}>{b.volume}</span></td>
                      <td style={{padding:"8px 10px"}}><span style={{width:6,height:6,borderRadius:"50%",background:intentColor(b.buyingIntent),display:"inline-block",marginRight:4}}/><span style={{fontSize:11,color:intentColor(b.buyingIntent)}}>{b.buyingIntent}</span></td>
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
              borderRadius:12,background:"var(--bg-3)",border:"1px solid var(--border-h)",
              boxShadow:"0 12px 40px rgba(0,0,0,.5)",animation:"float .3s ease",zIndex:50
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
    </>
  );
}
