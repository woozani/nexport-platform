# NEXPORT — CLAUDE.md

Claude가 이 프로젝트 작업 시 자동으로 읽는 컨텍스트 파일입니다.

---

## 프로젝트 개요

**NEXPORT** — AI 기반 글로벌 바이어 매칭 플랫폼
한국 중소 제조업체가 검증된 해외 바이어를 빠르게 찾을 수 있도록 지원하는 SaaS 서비스.

| 항목 | 내용 |
|------|------|
| 서비스 URL | https://nexport-platform.vercel.app |
| 커스텀 도메인 | nexport.trade |
| GitHub | https://github.com/woozani/nexport-platform |

---

## 기술 스택

- **React 18** + **Vite 5** (단일 SPA)
- **스타일링**: 순수 CSS-in-JS (인라인 `style={{}}` + CSS 변수)
- **지도**: react-simple-maps + topojson-client
- **배포**: Vercel (CI/CD + Serverless Functions)
- **외부 API**: Hunter.io (`api/hunter.js` Serverless 프록시)

---

## 디렉토리 구조

```
nexport-deploy/
├── src/
│   ├── App.jsx          # 전체 앱 로직 단일 파일 (~3,400줄)
│   └── main.jsx         # React 진입점
├── api/
│   └── hunter.js        # Vercel Serverless — Hunter.io 프록시
├── public/
│   └── favicon.svg
├── index.html           # viewport meta 포함
├── vite.config.js       # dev 미들웨어 (API 프록시 + Mock fallback)
├── vercel.json          # SPA 라우팅 + 보안 헤더
└── CLAUDE.md            # 이 파일
```

---

## App.jsx 구조 (섹션 순서)

```
1. CSS 문자열 정의        — 테마 변수, keyframes, @media
2. Ic 아이콘 라이브러리   — SVG 아이콘 객체 (Ic.Search, Ic.Mail, ...)
3. NexportLogo 컴포넌트  — N+>> SVG (linearGradient id: nxLogoGrad, #0A2463→#3E92CC)
4. 상수 / Mock 데이터     — COUNTRIES, INDUSTRIES, generateBuyers()
5. 유틸 훅               — useInView, useIsMobile, CountUp
6. 컴포넌트              — MobileDesktopBanner, LandingHero, ...
7. App()                 — 메인 컴포넌트 (라우팅, 상태 관리)
```

> ⚠️ 단일 파일 ~3,400줄 — 수정 전 반드시 `Grep`으로 위치 먼저 파악할 것

---

## 코딩 컨벤션

### 스타일
```jsx
// CSS 변수 참조 (인라인 스타일)
<div style={{ background: "var(--bg-2)", color: "var(--t1)" }} />

// 동적 값
<div style={{ opacity: visible ? 1 : 0, padding: isMobile ? "16px" : "28px" }} />
```

### 주요 CSS 변수
| 변수 | 용도 |
|------|------|
| `--bg-0` ~ `--bg-4` | 배경 단계 |
| `--t1` ~ `--t4` | 텍스트 명도 |
| `--blue`, `--cyan`, `--green`, `--violet` | 강조색 |
| `--border`, `--border-h` | 경계선 |
| `--glass-bg`, `--glass-shadow` | Frosted glass |
| `--card-shadow`, `--modal-shadow` | 그림자 |

### 아이콘
```jsx
// Ic 객체 내 SVG 컴포넌트
<Ic.Search s={16} />
<Ic.Mail s={20} />
```

### 모바일 반응형
```jsx
// useIsMobile 훅 (768px 기준)
const isMobile = useIsMobile();

// 인라인 분기
fontSize: isMobile ? 22 : 32

// JSX 조건부 렌더링
{!isMobile && <DesktopOnlySection />}
{isMobile && <MobileOnlySection />}
```

### 기정의 애니메이션
`staggerUp`, `fadeIn`, `scaleIn`, `glowPulse`, `floatCard`, `shimmerBg`, `typingCursor`

### CSS @media 규칙
- CSS 문자열(`` const CSS = `...` ``) 내부에 작성
- 인라인 스타일 오버라이드 시 `!important` + 인라인 스타일도 함께 수정 필요

---

## 브랜치 전략

```
main              ← 프로덕션 (Vercel 자동 배포)
feat/기능명        ← 새 기능 추가
fix/버그명         ← 버그 수정
claude/작업명      ← Claude worktree 작업 브랜치
```

- **PR 기반 머지**: main 직접 push 금지, 반드시 PR → Merge
- **Worktree**: `.claude/worktrees/` 하위에 격리된 작업 공간 생성
- **커밋 메시지**: `feat:` / `fix:` 접두사 + 한글 설명

---

## 개발 워크플로우

```bash
# 로컬 개발
npm install            # 최초 설치
npm run dev            # http://localhost:3000

# 빌드 (커밋 전 반드시 확인)
npm run build          # dist/ 생성
npm run preview        # http://localhost:4173 빌드 미리보기
```

### 환경 변수
| 변수 | 설명 |
|------|------|
| `VITE_HUNTER_API_KEY` | Hunter.io API 키 (없으면 Mock 데이터 자동 fallback) |

---

## Claude 자동 커밋/푸시 규칙

> **작업 완료 시 Claude가 자동으로 commit + push까지 수행한다.**

### 자동 실행 순서
1. 코드 수정 완료
2. `npm run build` 성공 확인 (실패 시 수정 후 재시도)
3. preview 서버에서 변경사항 시각적 검증
4. `git add <수정된 파일>` → `git commit -m "feat/fix: 한글 설명"` 자동 실행
5. `git push origin <현재 브랜치>` 자동 실행
6. **main 브랜치가 아닌 경우**: `gh pr create` 로 PR 자동 생성 (이미 PR이 없을 때만)

### 커밋 메시지 규칙
```
feat: 새 기능 추가 설명
fix: 버그 수정 설명
docs: 문서 변경
refactor: 리팩토링
```

### 주의
- `main` 직접 push는 금지 — 반드시 PR 브랜치에서 push
- 빌드 실패 시 커밋하지 않고 문제 먼저 해결
- 여러 작업을 한 세션에서 할 경우 작업 단위별로 커밋 분리

---

## 배포 (Vercel)

| 브랜치 | 결과 |
|--------|------|
| `main` push/merge | 프로덕션 자동 배포 |
| 기타 브랜치 push | 프리뷰 URL 자동 생성 |

- 배포 확인: https://vercel.com/nexport-platforms-projects/nexport-platform
- GitHub PR Checks 탭에서 Vercel 배포 상태 실시간 확인 가능

---

## 주의사항 (자주 발생하는 문제)

1. **react-simple-maps 빌드 에러**
   새 worktree 생성 시 별도 설치 필요:
   ```bash
   npm install react-simple-maps topojson-client
   ```

2. **CSS `!important` vs 인라인 스타일**
   CSS @media에서 `!important`로 인라인 스타일을 오버라이드할 수 있지만,
   `align-items` 등 일부 속성은 인라인 스타일도 함께 수정해야 확실히 적용됨.

3. **App.jsx 수정 위치 파악**
   항상 `Grep`으로 해당 키워드 먼저 검색 후 `Read`로 컨텍스트 확인할 것.

4. **빌드 성공 필수**
   커밋 전 `npm run build` 성공 여부 반드시 확인.
