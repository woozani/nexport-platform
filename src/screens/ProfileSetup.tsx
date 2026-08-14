import { useState } from 'react'
import { useStore } from '../store'
import { Field, Logo, OnboardSteps } from '../components/ui'

// 박스 필터는 얕게 — 초기 3개 섹터만 깊게 구축 (dev_spec policy 2 scope_limitation + policy 3 hybrid)
// 데모 주: 수처리는 화학·환경 섹터에 포함해 시연 (실서비스 택소노미는 프로벤타 초안 기준)
const SECTORS = ['의료기기', '자동차부품', '화학·환경(수처리)']
const CERTS = ['FDA', 'CE', 'ISO 13485', 'IATF 16949']

// 화면 3. 회사 프로필 작성 ★핵심 — 서술형(주관식) 우선, 구조 입력은 보조 (8/13 회의 전환사항)
export function ProfileSetup() {
  const saveProfile = useStore((s) => s.saveProfile)
  const [desc, setDesc] = useState('')
  const [industry, setIndustry] = useState('')
  const [certs, setCerts] = useState<string[]>([])
  const [certEtc, setCertEtc] = useState('')
  const ok = desc.trim().length >= 20

  const toggleCert = (c: string) =>
    setCerts((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-up" style={{ width: 560, padding: 32 }}>
        <Logo />
        <OnboardSteps current={2} />
        <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>회사 프로필 작성</h1>
        <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 24 }}>
          이 내용이 AI 바이어 매칭의 입력값이 됩니다. 자세할수록 추천이 정확해집니다.
        </p>

        <Field
          label="어떤 제품을 만들고, 어떤 바이어를 찾고 계신가요? 자유롭게 적어주세요. *"
          hint={ok ? '좋습니다 — 서술이 구체적일수록 매칭 정확도가 올라갑니다.' : '20자 이상 서술해주세요. (주력 입력값)'}
        >
          <textarea
            rows={5}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="예: 산업용 정수처리 필터를 제조합니다. 미국의 수처리 설비 업체나 유통사를 찾고 있습니다."
          />
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="타겟 국가" hint="MVP는 미국 단일 지원">
              <select value="US" disabled><option value="US">🇺🇸 미국</option></select>
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="섹터 (1차 필터)" hint="세밀한 구분은 태그·서술이 담당합니다">
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">선택</option>
                {SECTORS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <Field label="보유 인증">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CERTS.map((c) => (
              <button
                key={c}
                className="btn"
                onClick={() => toggleCert(c)}
                style={{
                  padding: '7px 14px', fontSize: 12,
                  background: certs.includes(c) ? 'var(--blue)' : 'var(--bg-2)',
                  color: certs.includes(c) ? '#fff' : 'var(--t2)',
                }}
              >
                {certs.includes(c) ? '✓ ' : ''}{c}
              </button>
            ))}
            <input
              value={certEtc}
              onChange={(e) => setCertEtc(e.target.value)}
              placeholder="기타 직접입력"
              style={{ width: 140, padding: '7px 10px', fontSize: 12 }}
            />
          </div>
        </Field>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 13, marginTop: 8 }}
          disabled={!ok}
          onClick={() => saveProfile({ description: desc, country: 'US', industry, certs, certEtc })}
        >
          프로필 저장하고 내 바이어 보기 →
        </button>
      </div>
    </div>
  )
}
