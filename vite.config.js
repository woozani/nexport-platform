import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const HUNTER_KEY = env.HUNTER_API_KEY || env.VITE_HUNTER_API_KEY || ''

  return {
    plugins: [
      react(),
      {
        name: 'hunter-api-dev',
        configureServer(server) {
          server.middlewares.use('/api/hunter', async (req, res) => {
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')

            const url = new URL(req.url, 'http://localhost')
            const { action, domain, first_name, last_name, company, email } = Object.fromEntries(url.searchParams)

            // No API key → return mock demo data
            if (!HUNTER_KEY) {
              const mock = getMockData(action, domain || company)
              res.end(JSON.stringify(mock))
              return
            }

            // Proxy to Hunter.io
            try {
              let hunterUrl
              switch (action) {
                case 'domain-search':
                  hunterUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain||'')}&api_key=${HUNTER_KEY}&limit=10`
                  break
                case 'email-finder':
                  hunterUrl = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain||'')}&first_name=${encodeURIComponent(first_name||'')}&last_name=${encodeURIComponent(last_name||'')}&api_key=${HUNTER_KEY}`
                  break
                case 'email-verify':
                  hunterUrl = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email||'')}&api_key=${HUNTER_KEY}`
                  break
                case 'company-search':
                  hunterUrl = `https://api.hunter.io/v2/domain-search?company=${encodeURIComponent(company||'')}&api_key=${HUNTER_KEY}&limit=10`
                  break
                case 'account':
                  hunterUrl = `https://api.hunter.io/v2/account?api_key=${HUNTER_KEY}`
                  break
                default:
                  res.end(JSON.stringify({ error: '잘못된 action 파라미터' }))
                  return
              }
              const response = await fetch(hunterUrl)
              const data = await response.json()
              res.end(JSON.stringify(data))
            } catch (e) {
              res.end(JSON.stringify({ error: 'Hunter.io 연결 오류: ' + e.message }))
            }
          })
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
      },
    ],
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: { output: { manualChunks: undefined } },
    },
    server: {
      port: 3000,
      open: true,
    },
  }
})

function getMockData(action, query) {
  const q = query || 'example'
  if (action === 'account') {
    return { data: { first_name: 'Demo', last_name: 'User', email: 'demo@nexport.io', plan_name: 'Free', requests: { used: 12, available: 25 } } }
  }
  if (action === 'email-finder') {
    return { data: { first_name: 'Hans', last_name: 'Mueller', email: `h.mueller@${q}`, score: 82, domain: q, sources: [] } }
  }
  // domain-search / company-search mock
  return {
    data: {
      domain: q,
      organization: q.split('.')[0].charAt(0).toUpperCase() + q.split('.')[0].slice(1),
      emails: [
        { value: `info@${q}`, type: 'generic', confidence: 94, first_name: '', last_name: '', position: 'General', sources: [] },
        { value: `sales@${q}`, type: 'generic', confidence: 88, first_name: '', last_name: '', position: 'Sales', sources: [] },
        { value: `procurement@${q}`, type: 'professional', confidence: 76, first_name: 'Klaus', last_name: 'Weber', position: 'Procurement Manager', sources: [] },
        { value: `ceo@${q}`, type: 'professional', confidence: 65, first_name: 'Maria', last_name: 'Schmidt', position: 'CEO', sources: [] },
      ],
      pattern: '{first}@{domain}',
      _isMock: true,
    }
  }
}
