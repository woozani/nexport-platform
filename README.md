# NEXPORT — AI Export Matching Platform

AI 기반 글로벌 바이어 매칭 플랫폼. 한국 중소 제조업체를 위한 수출 파트너 탐색 서비스.

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: CSS-in-JS (Inline Styles)
- **Font**: DM Sans, JetBrains Mono, Noto Sans KR
- **Deploy**: Vercel

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📦 Build

```bash
npm run build
npm run preview
```

## 🌍 Deployment

[배포 가이드](./DEPLOY_GUIDE.md) 참고

## 📁 프로젝트 구조

```
nexport-deploy/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx        # 엔트리포인트
│   └── App.jsx         # 메인 앱 컴포넌트
├── index.html
├── package.json
├── vite.config.js
├── vercel.json         # Vercel 배포 설정 (SPA 라우팅)
├── DEPLOY_GUIDE.md     # 배포 & 도메인 가이드
└── README.md
```
