# 🚀 Flavor Archive

AI 맞춤 식단 추천 서비스 - 당신의 건강 목표에 맞춘 레시피를 추천합니다.

## 📋 프로젝트 개요

- **목표**: 건강 정보 입력 → AI 맞춤 식단 추천 → 레시피 열람
- **기술 스택**: Next.js 14, TypeScript, Tailwind CSS, Clerk, Supabase
- **데이터베이스**: Supabase (PostgreSQL)

## 🚀 시작하기

> **빠른 시작**: 단계별 설정 가이드는 [SETUP.md](./SETUP.md)를 참고하세요!

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Clerk - https://clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase - https://supabase.com/
NEXT_PUBLIC_SUPABASE_URL=https://irxierjkwjegpqncndxh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini AI - https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key
```

#### Clerk 키 발급 방법:

1. [Clerk 대시보드](https://dashboard.clerk.com/)에 로그인
2. 새 애플리케이션 생성
3. API Keys 메뉴에서 Publishable Key와 Secret Key 복사

#### Supabase 키 발급 방법:

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 (프로젝트 URL: `https://irxierjkwjegpqncndxh.supabase.co`)
3. Settings → API에서 anon key와 service_role key 복사

#### Gemini AI API 키 발급 방법:

1. [Google AI Studio](https://aistudio.google.com/app/apikey)에 접속
2. 구글 계정으로 로그인
3. "Create API key" 버튼 클릭
4. 기존 Google Cloud 프로젝트 선택 또는 새로 생성
5. 생성된 키를 복사 (안전하게 보관!)
6. 무료 tier 제공 (일일 API 호출 제한 있음)

### 2. 의존성 설치

```bash
npm install
```

### 3. 샘플 레시피 데이터 추가 (필수)

추천 기능을 사용하려면 레시피 데이터가 필요합니다:

```bash
npm run seed:recipes
```

이 명령어는 다양한 칼로리 범위의 샘플 레시피 8개를 데이터베이스에 추가합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/              # 인증 페이지 (로그인, 회원가입)
│   ├── (main)/              # 메인 애플리케이션
│   │   ├── page.tsx         # 홈 페이지
│   │   ├── onboarding/      # 온보딩 (건강 정보 입력)
│   │   ├── recommendations/ # 식단 추천 결과
│   │   ├── recipes/         # 레시피 목록 및 상세
│   │   └── profile/         # 사용자 프로필
│   └── api/                 # API 라우트
├── components/              # React 컴포넌트
│   ├── ui/                  # UI 기본 컴포넌트
│   ├── layout/              # 레이아웃 컴포넌트
│   ├── recipe/              # 레시피 관련 컴포넌트
│   └── recommendation/      # 추천 관련 컴포넌트
├── lib/                     # 유틸리티 및 설정
│   ├── supabase/            # Supabase 클라이언트
│   └── utils.ts             # 공통 유틸리티 함수
├── types/                   # TypeScript 타입 정의
├── hooks/                   # 커스텀 React 훅
└── middleware.ts            # Next.js 미들웨어 (인증)
```

## 🗄️ 데이터베이스 구조

### users 테이블

- Clerk 인증 사용자 기본 정보
- `clerk_user_id`, `email`, `created_at`

### user_profile 테이블

- 사용자 건강 정보 및 목표
- `age`, `gender`, `goal`, `allergy`, `height`, `weight`, `daily_calorie`

### recipes 테이블

- 레시피 마스터 데이터
- `title`, `thumbnail_url`, `calories`, `protein`, `carb`, `fat`, `tags`, `ingredients`, `steps`

## 🤖 AI 식단 추천 시스템

Flavor Archive는 **Google Gemini 1.5 Flash**를 활용한 지능형 식단 추천 시스템을 제공합니다.

### 🌟 왜 Gemini AI인가?

- ✅ **뛰어난 성능**: 최신 Gemini 1.5 Flash 모델 사용
- ✅ **안정적**: Google의 검증된 AI 기술
- ✅ **저렴한 비용**: 무료 tier 제공
- ✅ **무료 API**: 개발 단계에서 무료로 사용 가능
- ✅ **빠른 응답**: 실시간 AI 분석 및 레시피 생성

### AI가 고려하는 요소:

- ✅ **개인 목표**: 체중 감량, 유지, 증량에 따른 최적 영양소 배분
- ✅ **칼로리 조절**: 하루 목표 칼로리에 맞춘 3끼 조합
- ✅ **알레르기 필터**: 사용자의 알레르기 재료를 철저히 제외
- ✅ **영양소 균형**: 단백질, 탄수화물, 지방의 최적 비율
- ✅ **식사 다양성**: 아침/점심/저녁이 겹치지 않는 다양한 메뉴

### AI 추천 프로세스:

1. 사용자의 건강 정보와 목표 분석
2. 데이터베이스의 모든 레시피 검토
3. AI가 최적의 3끼 조합 선택
4. 추천 이유와 함께 결과 제공

## 🎯 주요 기능

### ✅ 완료된 기능

- [x] Next.js 16 프로젝트 설정 (Turbopack)
- [x] Clerk 인증 통합
- [x] Supabase 데이터베이스 연동
- [x] TypeScript 타입 정의
- [x] 메인 홈 페이지 UI
- [x] 인증 라우트 (로그인/회원가입)
- [x] 미들웨어 설정
- [x] 온보딩 페이지 (건강 정보 입력)
- [x] AI 기반 식단 추천 API (Google Gemini 1.5 Flash)
- [x] 추천 결과 페이지 (AI 추천 이유 포함)
- [x] 샘플 레시피 데이터 생성 스크립트
- [x] 디버그 페이지
- [x] 상세 에러 로깅

### 🚧 개발 예정

- [ ] Clerk → Supabase 사용자 동기화 Webhook
- [ ] 레시피 목록 페이지
- [ ] 레시피 상세 페이지
- [ ] 프로필 수정 기능
- [ ] 알레르기 기반 필터링
- [ ] 즐겨찾기 기능

## 🔧 개발 가이드

### 로그 확인

핵심 기능에는 로그가 추가되어 있습니다:

- ✅ 성공 로그
- ❌ 에러 로그
- 🔍 데이터 조회 로그
- ⚠️ 경고 로그

브라우저 콘솔 또는 터미널에서 로그를 확인할 수 있습니다.

### 환경별 설정

- **개발**: `npm run dev`
- **빌드**: `npm run build`
- **프로덕션**: `npm start`

## 🚀 배포하기

프로덕션 배포 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

**배포 전 필수 체크:**
- ✅ 모든 환경 변수 설정 (특히 **GEMINI_API_KEY**!)
- ✅ 환경 변수 변경 후 **재배포** 필수
- ✅ `/debug` 페이지로 환경 변수 확인

## 📝 다음 단계

### 로컬 개발:
1. `.env.local` 파일 생성 및 환경 변수 설정
2. Clerk 애플리케이션 생성 및 키 발급
3. Supabase 키 발급
4. **Gemini API 키 발급** (필수!)
5. `npm install` 및 `npm run dev`
6. `/onboarding`에서 프로필 설정
7. 식단 추천 테스트

### 프로덕션 배포:
1. [DEPLOYMENT.md](./DEPLOYMENT.md) 가이드 참고
2. Vercel에 환경 변수 설정
3. GitHub 푸시로 자동 배포
4. `/debug` 페이지로 환경 확인

## 🐛 문제 해결

### 식단 추천이 작동하지 않나요?

**1단계**: `/debug` 페이지 방문 (`http://localhost:3000/debug` 또는 배포 URL)

**2단계**: 환경 변수 체크 섹션에서 확인:
- ❌가 있으면 해당 환경 변수 추가 필요
- ✅가 모두 있어야 정상 작동

**3단계**: 특히 **GEMINI_API_KEY** 확인!
- 없으면 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급
- 로컬: `.env.local`에 추가
- 배포: Vercel 환경 변수에 추가 후 **재배포**

**자세한 해결 방법**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 참고

### 디버그 페이지

문제를 진단하려면 디버그 페이지를 방문하세요:

```
http://localhost:3000/debug (로컬)
https://your-app.vercel.app/debug (배포)
```

이 페이지에서 다음을 확인할 수 있습니다:

- ⚙️ **환경 변수 체크** (NEW!)
  - Clerk, Supabase, Gemini API 키 상태
  - 누락된 변수 즉시 확인 가능
- 🔐 Clerk 인증 상태
- 👤 프로필 존재 여부
- 🍽️ 추천 API 테스트
- ❌ 에러 메시지

### 일반적인 문제

#### "Gemini API 키가 설정되지 않았습니다"
→ GEMINI_API_KEY 환경 변수 추가 필요

#### "프로필을 먼저 설정해주세요"
→ `/onboarding` 페이지에서 프로필 설정

#### 배포 후 작동하지 않음
→ Vercel 환경 변수 설정 후 **반드시 재배포**

#### API 로그 확인
개발 서버 터미널과 브라우저 콘솔에서 상세한 로그 확인:
- `[RECOMMENDATIONS API]`: 서버 사이드 로그
- `[useRecommendations]`: 클라이언트 사이드 로그

## 📚 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

Made with ❤️ by Flavor Archive Team
#   2 5 - t e a m - p r o j e c t - f l a v o r - a r c h i v e  
 