# 🚄 소소행 (SoSoHaeng) — FE (React Native · Expo)

소도시/중소도시 여행 추천, 지역 축제 정보, 로컬 특산물 마켓을 **하나의 앱**에서 제공하는 **소소행** 프로젝트의 프론트엔드 레포지토리입니다.  
본 앱은 **Expo + React Native + Expo Router(파일 기반 라우팅)** 구조로 구성되어 있습니다.

---

## 기술 스택

| Category | Technology |
| --- | --- |
| **Framework** | React Native (Expo SDK 51+) |
| **Routing** | Expo Router (app/ 기반 파일 라우팅) |
| **Language** | JavaScript (ES6+) |
| **State Mgt** | Context API, Zustand (in `src/stores`) |
| **Network** | Axios (API 통신), React Query (TanStack Query) |
| **Map/Location** | Expo Location, MapView |

- **상태관리**: `stores/`, `src/stores/`, `context/` 기반 구성(프로젝트 내 모듈 혼용)
- (프로젝트 진행 상황에 따라 추가 라이브러리가 포함될 수 있습니다)

---

## 📂 폴더 구조 (Folder Structure)

프로젝트의 주요 디렉토리 구조입니다.

```bash
FE/sosohaeng-app/
├── app/                  # Expo Router 기반 페이지 라우팅 (Tabs, Stacks)
│   ├── (tabs)/           # 하단 탭 네비게이션 (홈, 축제, 마켓 등)
│   ├── festivals/        # 축제 관련 페이지 라우팅
│   ├── market/           # 마켓 관련 페이지 라우팅
│   └── recommend/        # AI 추천 챗봇 관련 페이지
├── assets/               # 이미지, 아이콘, 폰트 리소스
├── components/           # 재사용 가능한 UI 컴포넌트 (Header, Footer 등)
├── context/              # 전역 상태 관리 (AuthContext 등)
├── screens/              # 비즈니스 로직 및 세부 화면 구현 (Legacy/Detailed Views)
│   ├── RecommendScreen/  # RAG 기반 여행지 추천, 챗봇 대화
│   ├── MarketScreen/     # 마켓 홈, 상품 상세, 등록, Q&A 화면
│   ├── FestivalScreen/   # 축제 리스트, 상세 화면
│   └── ...
└── src/
    ├── config/           # API 설정 및 환경 변수 (api.js, client.js)
    ├── data/             # 정적 데이터 및 더미 데이터
    ├── features/         # 기능별 모듈
    └── stores/           # 상태 관리 스토어 (authStore 등)
```

---

## 빠른 시작 (로컬 실행)

### 1. 레포지토리 클론
```bash
git clone [https://github.com/CAPSTONEEEEE/FE.git](https://github.com/CAPSTONEEEEE/FE.git)
cd FE/sosohaeng-app
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 앱 실행
```bash
npx expo start -c --lan
```

---

## License
This project is developed for an academic capstone course.  
All rights reserved unless otherwise specified.

- **No commercial use** without explicit permission from the project team.
- **No redistribution** of source code or assets without permission.
- If you need to reuse any part of this repository (code, UI, images, icons), please contact the maintainers first.
