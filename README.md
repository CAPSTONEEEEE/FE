# 🚄 SoSoHaeng (소소행) — Frontend

React Native (Expo) app for **SosoHaeng**, a travel recommender for small and mid-sized cities in Korea. It brings AI travel recommendations, local festival information, and a local specialty marketplace together in a single app.

> Capstone project (Team NaegaGreen, 3 members)
> Backend: [CAPSTONEEEEE/BE](https://github.com/CAPSTONEEEEE/BE) · Docs & demo: [CAPSTONEEEEE/NaegaGreen](https://github.com/CAPSTONEEEEE/NaegaGreen)

## Features

- **AI travel recommendations:** RAG-based, chat-style recommendations for small-city destinations (`RecommendScreen`)
- **Festivals:** festival list and detail screens
- **Local marketplace:** market home, product details, product registration, and Q&A
- **Maps & location:** location features built on Expo Location and MapView
- **Authentication:** auth state handled with Context API and a Zustand store

## Tech stack

| Category | Technology |
| --- | --- |
| **Framework** | React Native (Expo SDK 51+) |
| **Routing** | Expo Router (file-based routing under `app/`) |
| **Language** | JavaScript (ES6+) |
| **State management** | Context API (`context/`), Zustand (`src/stores/`) |
| **Networking** | Axios, React Query (TanStack Query) |
| **Map / Location** | Expo Location, MapView |

## Project structure

```bash
FE/sosohaeng-app/
├── app/                  # Expo Router pages (tabs, stacks)
│   ├── (tabs)/           # Bottom tab navigation (home, festivals, market, ...)
│   ├── festivals/        # Festival routes
│   ├── market/           # Marketplace routes
│   └── recommend/        # AI recommendation chatbot routes
├── assets/               # Images, icons, fonts
├── components/           # Reusable UI components (Header, Footer, ...)
├── context/              # Global state (AuthContext, ...)
├── screens/              # Detailed screen implementations
│   ├── RecommendScreen/  # RAG-based recommendations and chat
│   ├── MarketScreen/     # Market home, product detail, registration, Q&A
│   ├── FestivalScreen/   # Festival list and detail
│   └── ...
└── src/
    ├── config/           # API settings (api.js, client.js)
    ├── data/             # Static and dummy data
    ├── features/         # Feature modules
    └── stores/           # Zustand stores (authStore, ...)
```

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/CAPSTONEEEEE/FE.git
cd FE/sosohaeng-app

# 2. Install dependencies
npm install

# 3. Start the app
#    -c: clear cache, --lan: connect over the local network
npx expo start -c --lan
```

Then open the app on a device (Expo Go) or an emulator.

---

# 🚄 소소행 (SoSoHaeng) — FE (React Native · Expo)

소도시·중소도시 **여행 추천**, **지역 축제 정보**, **로컬 특산물 마켓**을 **하나의 앱**에서 제공하는 **소소행** 프로젝트의 프론트엔드 저장소입니다.
**Expo + React Native + Expo Router(파일 기반 라우팅)** 구조로 구성되어 있습니다.

> 졸업 프로젝트 (팀 내가그린, 3인)
> 백엔드: [CAPSTONEEEEE/BE](https://github.com/CAPSTONEEEEE/BE) · 기획 문서·시연 영상: [CAPSTONEEEEE/NaegaGreen](https://github.com/CAPSTONEEEEE/NaegaGreen)

## 주요 기능

- **AI 여행 추천:** RAG 기반 소도시 여행지 추천과 챗봇 대화 (`RecommendScreen`)
- **축제:** 축제 리스트와 상세 화면
- **로컬 마켓:** 마켓 홈, 상품 상세, 상품 등록, Q&A
- **지도·위치:** Expo Location과 MapView 기반 위치 기능
- **인증:** Context API와 Zustand 스토어로 로그인 상태 관리

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| **프레임워크** | React Native (Expo SDK 51+) |
| **라우팅** | Expo Router (`app/` 기반 파일 라우팅) |
| **언어** | JavaScript (ES6+) |
| **상태 관리** | Context API (`context/`), Zustand (`src/stores/`) |
| **네트워크** | Axios (API 통신), React Query (TanStack Query) |
| **지도·위치** | Expo Location, MapView |

## 폴더 구조

```bash
FE/sosohaeng-app/
├── app/                  # Expo Router 기반 페이지 (탭, 스택)
│   ├── (tabs)/           # 하단 탭 네비게이션 (홈, 축제, 마켓 등)
│   ├── festivals/        # 축제 관련 라우팅
│   ├── market/           # 마켓 관련 라우팅
│   └── recommend/        # AI 추천 챗봇 관련 라우팅
├── assets/               # 이미지, 아이콘, 폰트
├── components/           # 재사용 UI 컴포넌트 (Header, Footer 등)
├── context/              # 전역 상태 (AuthContext 등)
├── screens/              # 세부 화면 구현
│   ├── RecommendScreen/  # RAG 기반 여행지 추천, 챗봇 대화
│   ├── MarketScreen/     # 마켓 홈, 상품 상세, 등록, Q&A
│   ├── FestivalScreen/   # 축제 리스트, 상세
│   └── ...
└── src/
    ├── config/           # API 설정 (api.js, client.js)
    ├── data/             # 정적·더미 데이터
    ├── features/         # 기능별 모듈
    └── stores/           # Zustand 스토어 (authStore 등)
```

## 빠른 시작 (로컬 실행)

```bash
# 1. 저장소 클론
git clone https://github.com/CAPSTONEEEEE/FE.git
cd FE/sosohaeng-app

# 2. 패키지 설치
npm install

# 3. 앱 실행
#    -c: 캐시 삭제, --lan: 같은 네트워크의 기기에서 접속
npx expo start -c --lan
```

실행 후 실제 기기(Expo Go) 또는 에뮬레이터로 앱을 열면 됩니다.

---

## License

This project was developed for an academic capstone course (본 프로젝트는 학술 졸업 프로젝트로 개발되었습니다).
All rights reserved unless otherwise specified.

- **No commercial use** without explicit permission from the project team.
- **No redistribution** of source code or assets without permission.
- If you need to reuse any part of this repository (code, UI, images, icons), please contact the maintainers first.
