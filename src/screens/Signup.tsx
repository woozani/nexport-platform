import { useState } from 'react'
import { useStore } from '../store'
import { Field, Logo, OnboardSteps } from '../components/ui'

// 화면 2. 회원가입 — 검증은 mock (백엔드 없음)
export function Signup() {
  const signup = useStore((s) => s.signup)
  const [f, setF] = useState({ email: '', password: '', company: '', bizNumber: '', managerName: '', managerTitle: '' })
  const [err, setErr] = useState('')
  const ok = f.email.includes('@') && f.password.length >= 4 && f.company && f.managerName

  const submit = () => {
    if (!ok) { setErr('필수 항목을 확인해주세요. (이메일 형식 / 비밀번호 4자 이상 / 회사명 / 담당자명)'); return }
    signup({ email: f.email, company: f.company, bizNumber: f.bizNumber, managerName: f.managerName, managerTitle: f.managerTitle })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-up" style={{ width: 440, padding: 32 }}>
        <Logo />
        <OnboardSteps current={1} />
        <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>회원가입</h1>
        <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 24 }}>가입 후 바로 내 바이어를 확인할 수 있습니다.</p>
        <Field label="이메일 *"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@company.co.kr" /></Field>
        <Field label="비밀번호 *"><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <Field label="회사명 *"><input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="(주)한국정수테크" /></Field>
        <Field label="사업자등록번호"><input value={f.bizNumber} onChange={(e) => setF({ ...f, bizNumber: e.target.value })} placeholder="000-00-00000" /></Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="담당자명 *"><input value={f.managerName} onChange={(e) => setF({ ...f, managerName: e.target.value })} /></Field></div>
          <div style={{ flex: 1 }}><Field label="직책"><input value={f.managerTitle} onChange={(e) => setF({ ...f, managerTitle: e.target.value })} placeholder="해외영업 과장" /></Field></div>
        </div>
        {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{err}</div>}
        <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={submit}>가입하기</button>
      </div>
    </div>
  )
}
