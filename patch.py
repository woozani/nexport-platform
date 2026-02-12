import re

with open("src/App.jsx", "r") as f:
    code = f.read()

# 1. Add icons (after Refresh icon line)
icon_addition = """,
  EmailSearch:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><circle cx="18" cy="18" r="4" fill="var(--bg-primary)" stroke="currentColor"/><path d="M18 16v4M16 18h4"/></svg>,
  Verified:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Copy:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,"""

# Find the last icon in I object and add after it
code = code.replace(
    'Refresh:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,\n};',
    'Refresh:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>' + icon_addition + '\n};'
)
print("  [1/4] Icons added")

# 2. Add EmailFinder component before Products
emailfinder = '''
// --- EMAIL FINDER ---
function EmailFinder() {
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

  const searchEmails = async () => {
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
    } catch(err) { setError("API 요청 실패. 네트워크를 확인하세요."); }
    setLoading(false);
  };

  const copyEmail = (email, id) => { navigator.clipboard.writeText(email); setCopiedId(id); setTimeout(()=>setCopiedId(null),2000); };
  const saveEmail = (email) => { if (!savedEmails.find(e=>e.value===email.value)) setSavedEmails(prev=>[...prev,email]); };
  const cColor = (s) => s>=80?"#34D399":s>=50?"#FBBF24":"#FF6B4A";
  const exportCSV = () => {
    if (!savedEmails.length) return;
    const csv = "Email,First Name,Last Name,Position,Confidence\\n" + savedEmails.map(e=>`${e.value},${e.first_name||""},${e.last_name||""},${e.position||""},${e.confidence||""}`).join("\\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `nexport-emails-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };
  const Spin = () => <span style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}} />;

  return (
    <div>
      <div className="anim-in d1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700}}>이메일 파인더</h2>
          <p style={{fontSize:13,color:"var(--text-tertiary)",marginTop:2}}>
            Hunter.io 기반 바이어 이메일 검색
            {accountInfo && <span style={{marginLeft:12,padding:"2px 8px",borderRadius:20,background:"rgba(52,211,153,.1)",color:"#34D399",fontSize:11,fontWeight:600}}>잔여 {accountInfo.requests?.searches?.available||0}건</span>}
          </p>
        </div>
        {savedEmails.length>0 && <Btn primary onClick={exportCSV}><I.DL /> 저장목록 CSV ({savedEmails.length})</Btn>}
      </div>

      <Card className="anim-in d2" style={{marginBottom:16}}>
        <Tabs tabs={["도메인 검색","회사명 검색","개인 이메일 찾기"]} active={searchType==="domain"?"도메인 검색":searchType==="company"?"회사명 검색":"개인 이메일 찾기"} onChange={(t)=>{setSearchType(t==="도메인 검색"?"domain":t==="회사명 검색"?"company":"person");setResults(null);setError(null);}} />
        <div style={{display:"grid",gap:12}}>
          {searchType==="domain" && <div><label style={{fontSize:12,color:"var(--text-secondary)",marginBottom:4,display:"block"}}>회사 도메인</label><div style={{display:"flex",gap:8}}><div style={{flex:1}}><Input icon={I.Globe} placeholder="예: techparts.de" value={domain} onChange={e=>setDomain(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchEmails()} /></div><Btn primary onClick={searchEmails} style={{minWidth:100}}>{loading?<Spin/>:<><I.Search /> 검색</>}</Btn></div></div>}
          {searchType==="company" && <div><label style={{fontSize:12,color:"var(--text-secondary)",marginBottom:4,display:"block"}}>회사명</label><div style={{display:"flex",gap:8}}><div style={{flex:1}}><Input icon={I.Bldg} placeholder="예: TechParts GmbH" value={company} onChange={e=>setCompany(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchEmails()} /></div><Btn primary onClick={searchEmails} style={{minWidth:100}}>{loading?<Spin/>:<><I.Search /> 검색</>}</Btn></div></div>}
          {searchType==="person" && <><div><label style={{fontSize:12,color:"var(--text-secondary)",marginBottom:4,display:"block"}}>회사 도메인 *</label><Input icon={I.Globe} placeholder="예: techparts.de" value={domain} onChange={e=>setDomain(e.target.value)} /></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div><label style={{fontSize:12,color:"var(--text-secondary)",marginBottom:4,display:"block"}}>First Name *</label><Input placeholder="예: Hans" value={firstName} onChange={e=>setFirstName(e.target.value)} /></div><div><label style={{fontSize:12,color:"var(--text-secondary)",marginBottom:4,display:"block"}}>Last Name *</label><Input placeholder="예: Mueller" value={lastName} onChange={e=>setLastName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchEmails()} /></div></div><Btn primary onClick={searchEmails} style={{width:"100%"}}>{loading?<><Spin /> 검색 중...</>:<><I.Search /> 이메일 찾기</>}</Btn></>}
        </div>
      </Card>

      {error && <Card className="anim-in d3" style={{marginBottom:16,borderColor:"rgba(255,107,74,.3)",background:"rgba(255,107,74,.05)"}}><div style={{color:"#FF6B4A",fontSize:13,display:"flex",alignItems:"center",gap:8}}><I.X /> {error}</div></Card>}

      {results && (searchType==="domain"||searchType==="company") && <div className="anim-in d3">
        {results.organization && <Card style={{marginBottom:16,background:"linear-gradient(135deg,rgba(79,124,255,.06),rgba(124,92,252,.04))",border:"1px solid rgba(79,124,255,.15)"}}><div style={{display:"flex",gap:16,alignItems:"center"}}><div style={{width:48,height:48,borderRadius:12,background:"var(--bg-tertiary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🏢</div><div style={{flex:1}}><div style={{fontSize:16,fontWeight:700}}>{results.organization||results.domain}</div><div style={{fontSize:12,color:"var(--text-secondary)",marginTop:2}}>{results.domain} · 발견: <span style={{color:"var(--accent-green)",fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{results.emails?.length||0}건</span>{results.pattern&&<span style={{marginLeft:10,color:"var(--text-tertiary)"}}>패턴: {results.pattern}</span>}</div></div></div></Card>}
        {results.emails?.length>0 ? <div style={{display:"grid",gap:10}}>{results.emails.map((em,i)=><Card key={i} style={{padding:16,transition:"all .25s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(79,124,255,.3)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-primary)";e.currentTarget.style.transform="none"}}><div style={{display:"flex",alignItems:"center",gap:14}}><ScoreRing score={em.confidence||0} size={44}/><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14,fontWeight:700,fontFamily:"'Space Mono',monospace",color:"var(--accent-primary)"}}>{em.value}</span>{em.verification?.status==="valid"&&<span style={{color:"#34D399"}}><I.Verified/></span>}</div><div style={{fontSize:12,color:"var(--text-secondary)",marginTop:3}}>{em.first_name&&`${em.first_name} ${em.last_name||""}`}{em.position&&<span style={{color:"var(--text-tertiary)"}}> · {em.position}</span>}</div></div><div style={{display:"flex",gap:6}}><div onClick={()=>copyEmail(em.value,i)} style={{cursor:"pointer",padding:"6px 10px",borderRadius:8,border:"1px solid var(--border-primary)",color:copiedId===i?"#34D399":"var(--text-secondary)",fontSize:12,display:"flex",alignItems:"center",gap:4}}>{copiedId===i?<><I.Check/> 복사됨</>:<><I.Copy/> 복사</>}</div><div onClick={()=>saveEmail(em)} style={{cursor:"pointer",padding:"6px 10px",borderRadius:8,border:"1px solid var(--border-primary)",color:savedEmails.find(e=>e.value===em.value)?"#34D399":"var(--text-secondary)",fontSize:12,display:"flex",alignItems:"center",gap:4,background:savedEmails.find(e=>e.value===em.value)?"rgba(52,211,153,.08)":"transparent"}}>{savedEmails.find(e=>e.value===em.value)?<><I.Check/> 저장됨</>:<><I.Plus/> 저장</>}</div></div></div>{em.sources?.length>0&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border-subtle)",display:"flex",gap:6,flexWrap:"wrap"}}><span style={{fontSize:10,color:"var(--text-tertiary)"}}>출처:</span>{em.sources.slice(0,3).map((s,j)=><span key={j} style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"var(--bg-tertiary)",color:"var(--text-secondary)"}}>{s.domain}</span>)}</div>}</Card>)}</div> : <Card style={{textAlign:"center",padding:40,color:"var(--text-tertiary)"}}>검색 결과가 없습니다.</Card>}
      </div>}

      {results && searchType==="person" && <Card className="anim-in d3" style={{background:results.email?"linear-gradient(135deg,rgba(52,211,153,.06),rgba(79,124,255,.04))":"var(--bg-card)",border:results.email?"1px solid rgba(52,211,153,.2)":"1px solid var(--border-primary)"}}>
        {results.email ? <div style={{display:"flex",alignItems:"center",gap:16}}><ScoreRing score={results.score||0} size={64}/><div style={{flex:1}}><div style={{fontSize:11,color:"var(--text-tertiary)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>발견된 이메일</div><div style={{fontSize:18,fontWeight:700,fontFamily:"'Space Mono',monospace",color:"var(--accent-primary)"}}>{results.email}</div><div style={{fontSize:12,color:"var(--text-secondary)",marginTop:4}}>{results.first_name} {results.last_name}{results.position&&<span> · {results.position}</span>}</div></div><div style={{display:"flex",flexDirection:"column",gap:6}}><Btn small onClick={()=>copyEmail(results.email,"person")}>{copiedId==="person"?<><I.Check/> 복사됨</>:<><I.Copy/> 복사</>}</Btn><Btn small onClick={()=>saveEmail({value:results.email,first_name:results.first_name,last_name:results.last_name,position:results.position,confidence:results.score})}><I.Plus/> 저장</Btn></div></div> : <div style={{textAlign:"center",padding:20,color:"var(--text-tertiary)"}}>이메일을 찾을 수 없습니다.</div>}
      </Card>}

      {savedEmails.length>0 && <Card className="anim-in d4" style={{marginTop:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:15,fontWeight:700}}>저장된 이메일 ({savedEmails.length})</div><Btn small onClick={exportCSV}><I.DL /> CSV</Btn></div>
        <div style={{borderRadius:12,overflow:"hidden",border:"1px solid var(--border-subtle)"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:"var(--bg-tertiary)"}}>{["이메일","이름","직책","신뢰도",""].map(h=><th key={h} style={{padding:"10px 14px",fontSize:10,color:"var(--text-tertiary)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:600,textAlign:"left"}}>{h}</th>)}</tr></thead><tbody>{savedEmails.map((e,i)=><tr key={i} style={{borderTop:"1px solid var(--border-subtle)"}}><td style={{padding:"10px 14px",fontFamily:"'Space Mono',monospace",fontSize:12,color:"var(--accent-primary)"}}>{e.value}</td><td style={{padding:"10px 14px",fontSize:12}}>{e.first_name} {e.last_name}</td><td style={{padding:"10px 14px",fontSize:12,color:"var(--text-secondary)"}}>{e.position||"—"}</td><td style={{padding:"10px 14px"}}><span style={{fontFamily:"'Space Mono',monospace",fontSize:12,fontWeight:600,color:cColor(e.confidence||0)}}>{e.confidence||0}%</span></td><td style={{padding:"10px 14px"}}><div onClick={()=>setSavedEmails(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:"var(--text-tertiary)",padding:2}}><I.Trash/></div></td></tr>)}</tbody></table></div>
      </Card>}
    </div>
  );
}

'''

code = code.replace('// ─── PAGE: PRODUCTS ───', emailfinder + '// ─── PAGE: PRODUCTS ───')
print("  [2/4] EmailFinder component added")

# 3. Add sidebar tab
code = code.replace(
    '{ id: "messages", label: "메시지", icon: I.Msg, badge: 2 },',
    '{ id: "messages", label: "메시지", icon: I.Msg, badge: 2 },\n    { id: "emailfinder", label: "이메일 파인더", icon: I.EmailSearch },'
)
print("  [3/4] Sidebar tab added")

# 4. Add routing
code = code.replace(
    'case "messages": return <Messages />;',
    'case "messages": return <Messages />;\n      case "emailfinder": return <EmailFinder />;'
)
code = code.replace(
    'messages: "메시지", settings: "설정"',
    'messages: "메시지", emailfinder: "이메일 파인더", settings: "설정"'
)
print("  [4/4] Routing added")

with open("src/App.jsx", "w") as f:
    f.write(code)

print("\n✅ App.jsx 패치 완료!")
