# 🚀 NEXPORT 배포 & 커스텀 도메인 연결 가이드

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [GitHub에 코드 올리기](#2-github에-코드-올리기)
3. [Vercel 배포](#3-vercel-배포)
4. [도메인 구매](#4-도메인-구매)
5. [커스텀 도메인 연결](#5-커스텀-도메인-연결)
6. [SSL/HTTPS 자동 설정](#6-sslhttps-자동-설정)
7. [배포 후 관리](#7-배포-후-관리)

---

## 1. 사전 준비

### 필요한 도구 설치

```bash
# Node.js 설치 (v18 이상)
# https://nodejs.org 에서 다운로드

# 설치 확인
node --version
npm --version

# Git 설치 확인
git --version
```

### 프로젝트 로컬 테스트

```bash
# 프로젝트 폴더로 이동
cd nexport-deploy

# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
# → http://localhost:3000 에서 확인

# 프로덕션 빌드 테스트
npm run build
npm run preview
# → http://localhost:4173 에서 확인
```

---

## 2. GitHub에 코드 올리기

### 2-1. GitHub 저장소 생성

1. https://github.com 로그인
2. 우측 상단 **+** → **New repository** 클릭
3. Repository name: `nexport-platform` (원하는 이름)
4. **Private** 선택 (비공개)
5. **Create repository** 클릭

### 2-2. 코드 푸시

```bash
# 프로젝트 폴더에서 실행
cd nexport-deploy

# Git 초기화
git init
git add .
git commit -m "Initial commit: NEXPORT AI Export Platform"

# GitHub 저장소 연결
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nexport-platform.git
git push -u origin main
```

---

## 3. Vercel 배포

### 방법 A: Vercel 웹 대시보드 (추천 ⭐)

1. **https://vercel.com** 접속 → **Sign Up** (GitHub 계정으로 가입)
2. **Add New...** → **Project** 클릭
3. **Import Git Repository** → `nexport-platform` 선택
4. 설정 확인:
   - **Framework Preset**: `Vite` (자동 감지됨)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Deploy** 클릭
6. 배포 완료! → `https://nexport-platform.vercel.app` 같은 URL 자동 생성

### 방법 B: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포 (프로젝트 폴더에서)
cd nexport-deploy
vercel

# 프로덕션 배포
vercel --prod
```

> 🎉 이 시점에서 `https://nexport-xxxxx.vercel.app` URL로 실제 웹사이트가 작동합니다!

---

## 4. 도메인 구매

### 추천 도메인 등록 업체

| 업체 | 장점 | .com 가격 (연) | 링크 |
|------|------|---------------|------|
| **Namecheap** | 저렴, 무료 WhoisGuard | ~$9 | namecheap.com |
| **Cloudflare** | 원가 판매, DNS 빠름 | ~$9 | dash.cloudflare.com |
| **GoDaddy** | 한국어 지원 | ~$12 | godaddy.com |
| **Vercel Domains** | Vercel 통합 가장 쉬움 | ~$10 | vercel.com/domains |
| **Gabia** | 한국 업체, .kr 도메인 | ~₩15,000 | gabia.com |
| **Hosting.kr** | 한국 업체 | ~₩12,000 | hosting.kr |

### 도메인 이름 추천

```
nexport.io          ← 글로벌 스타트업 느낌
nexport.co          ← 심플
nexport.co.kr       ← 한국 기업 느낌
nexport-ai.com      ← AI 강조
getnexport.com      ← 만약 nexport.com 이 없을 때
```

### Vercel에서 직접 도메인 구매 (가장 간편)

1. Vercel Dashboard → **Settings** → **Domains**
2. 도메인 이름 입력 → **Buy** 클릭
3. 결제 → 자동으로 프로젝트에 연결됨 (DNS 설정 불필요!)

---

## 5. 커스텀 도메인 연결

### 5-1. Vercel에 도메인 추가

1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Domains**
3. 도메인 입력 (예: `nexport.io`) → **Add** 클릭
4. Vercel이 필요한 DNS 레코드를 안내해줌

### 5-2. DNS 레코드 설정

Vercel 대시보드에서 안내하는 값을 도메인 등록 업체의 DNS 설정에 입력합니다.

#### 루트 도메인 (nexport.io) → A 레코드

```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto (또는 3600)
```

> ⚠️ 실제 IP는 Vercel 대시보드에서 프로젝트별로 제공하는 값을 사용하세요.

#### WWW 서브도메인 (www.nexport.io) → CNAME 레코드

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto (또는 3600)
```

#### 서브도메인 (app.nexport.io) → CNAME 레코드

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto (또는 3600)
```

### 5-3. 각 도메인 등록 업체별 DNS 설정 위치

#### Namecheap
1. Dashboard → 도메인 선택 → **Manage**
2. **Advanced DNS** 탭
3. **Add New Record** → A 레코드 & CNAME 레코드 추가

#### Cloudflare
1. Dashboard → 도메인 선택
2. **DNS** → **Records**
3. **Add Record** → 레코드 추가
4. ⚠️ **Proxy status를 "DNS only" (회색 구름)로** 설정해야 Vercel SSL이 정상 작동

#### Gabia (가비아)
1. My가비아 → **DNS 관리**
2. 도메인 선택 → **DNS 설정**
3. 레코드 추가

#### GoDaddy
1. 내 제품 → 도메인 → **DNS 관리**
2. 레코드 추가

### 5-4. 리다이렉트 설정 (권장)

Vercel에서 www → apex (또는 반대) 리다이렉트를 설정합니다:

1. **Settings** → **Domains**
2. `www.nexport.io` 옆 **Edit** 클릭
3. **Redirect to** → `nexport.io` 선택
4. 이렇게 하면 `www.nexport.io` 접속 시 자동으로 `nexport.io`로 이동

### 5-5. 인증 확인

1. DNS 설정 후 **Verify** 클릭
2. DNS 전파에 최대 24~48시간 소요 (보통 5~30분)
3. 확인 사이트: https://www.whatsmydns.net/ 에서 전파 상태 확인

---

## 6. SSL/HTTPS 자동 설정

**Vercel이 자동으로 처리합니다!** 별도 설정 불필요.

- Let's Encrypt SSL 인증서 자동 발급
- HTTPS 자동 리다이렉트 활성화
- SSL 인증서 자동 갱신

도메인 인증이 완료되면 `https://nexport.io`로 안전하게 접속됩니다.

---

## 7. 배포 후 관리

### 자동 배포 (CI/CD)

GitHub에 코드를 push할 때마다 자동으로 배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "feature: 새로운 필터 기능 추가"
git push origin main
# → Vercel이 자동으로 감지하고 새 버전 배포!
```

### 프리뷰 배포

브랜치를 만들면 자동으로 프리뷰 URL이 생성됩니다:

```bash
git checkout -b feature/new-dashboard
# 수정 작업...
git push origin feature/new-dashboard
# → https://nexport-platform-git-feature-new-dashboard.vercel.app
#   프리뷰 URL에서 미리 확인 가능!
```

### 환경 변수 설정 (나중에 API 연동 시)

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. 키-값 추가:
   ```
   VITE_API_URL=https://api.nexport.io
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

### 성능 모니터링

Vercel은 자동으로 Core Web Vitals를 모니터링합니다:
- **Analytics** 탭에서 방문자 수, 성능 지표 확인
- **Speed Insights** 탭에서 페이지 로딩 속도 확인

---

## 🗺️ 전체 배포 플로우 요약

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. 로컬에서 코드 작성 (npm run dev로 테스트)               │
│     ↓                                                       │
│  2. GitHub에 push                                           │
│     ↓                                                       │
│  3. Vercel이 자동 감지 → 빌드 → 배포                        │
│     ↓                                                       │
│  4. xxxxx.vercel.app URL로 확인                              │
│     ↓                                                       │
│  5. 도메인 구매 (nexport.io 등)                              │
│     ↓                                                       │
│  6. Vercel에 도메인 추가 + DNS 레코드 설정                   │
│     ↓                                                       │
│  7. https://nexport.io 🎉 완료!                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ❓ FAQ

### Q: 비용이 얼마나 드나요?
- **Vercel Hobby (무료)**: 개인 프로젝트, 월 100GB 대역폭
- **Vercel Pro ($20/월)**: 팀 협업, 추가 대역폭
- **도메인**: 연 $9~15 (업체별 상이)

### Q: 도메인은 어디서 사는 게 가장 좋나요?
- **가장 쉬운 방법**: Vercel에서 직접 구매 → DNS 설정 자동
- **가장 저렴한 방법**: Cloudflare Registrar → 원가 판매
- **한국 도메인(.kr)**: 가비아 또는 hosting.kr

### Q: 도메인 연결 후 접속이 안 돼요
1. DNS 전파 대기 (최대 48시간, 보통 30분 내)
2. whatsmydns.net에서 전파 상태 확인
3. Vercel Domains에서 Verify 재시도
4. Cloudflare 사용 시 Proxy를 "DNS only"로 변경

### Q: 코드 수정하면 바로 반영되나요?
네! `git push`하면 30초~1분 내에 자동 배포됩니다.

### Q: 나중에 백엔드 API를 추가하고 싶어요
Vercel Serverless Functions를 사용하면 같은 프로젝트에서 API를 추가할 수 있습니다:
```
nexport-deploy/
├── api/
│   └── buyers.js    ← GET /api/buyers
├── src/
│   └── App.jsx
└── ...
```

---

## 📞 도움이 필요하면

- Vercel 문서: https://vercel.com/docs
- Vercel 커뮤니티: https://github.com/vercel/next.js/discussions
- DNS 전파 확인: https://www.whatsmydns.net/
- SSL 확인: https://www.ssllabs.com/ssltest/
