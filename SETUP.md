# ⚡ 빠른 설정 가이드

로컬에서 빠르게 시작하는 방법입니다.

## 1. 저장소 클론 및 패키지 설치

```bash
git clone <repository-url>
cd flavor-archive
npm install
```

## 2. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하세요:

```bash
# Windows
copy nul .env.local

# Mac/Linux
touch .env.local
```

## 3. Clerk 키 발급 (5분)

1. [Clerk 대시보드](https://dashboard.clerk.com/)에 가입/로그인
2. "Create Application" 클릭
3. 애플리케이션 이름 입력 (예: "Flavor Archive")
4. **API Keys** 메뉴에서 다음 복사:
   - Publishable Key
   - Secret Key

`.env.local`에 추가:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## 4. Supabase 키 발급 (5분)

1. [Supabase 대시보드](https://supabase.com/dashboard)에 가입/로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력 후 생성 (약 2분 소요)
4. **Settings → API**에서 다음 복사:
   - Project URL
   - anon public key
   - service_role key (Show 클릭 후 복사)

`.env.local`에 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

### 4-1. Supabase 테이블 생성

Supabase 대시보드 → SQL Editor에서 다음 SQL 실행:

```sql
-- users 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_profile 테이블
CREATE TABLE user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  age INTEGER,
  gender TEXT,
  goal TEXT NOT NULL CHECK (goal IN ('lose', 'keep', 'gain')),
  allergy JSONB DEFAULT '[]'::jsonb,
  height INTEGER,
  weight INTEGER,
  daily_calorie INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- recipes 테이블
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carb INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Gemini API 키 발급 (3분) ⭐ 중요!

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 기존 Google Cloud 프로젝트 선택 또는 "Create new project"
5. 생성된 키 복사

`.env.local`에 추가:

```env
GEMINI_API_KEY=AIza...
```

## 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 7. 확인 및 테스트

1. **환경 변수 확인**: [http://localhost:3000/debug](http://localhost:3000/debug)
   - 모든 항목이 ✅인지 확인

2. **회원가입**: Sign Up 버튼 클릭

3. **온보딩**: `/onboarding`에서 프로필 설정
   - 목표 선택 (감량/유지/증량)
   - 알레르기 선택 (선택사항)
   - 키/몸무게 입력 (선택사항)

4. **샘플 레시피 추가** (선택사항):
   ```bash
   npm run seed:recipes
   ```

5. **식단 추천 테스트**: 홈에서 "오늘의 식단 추천받기" 클릭

## 완료! 🎉

이제 AI 기반 식단 추천을 사용할 수 있습니다.

## 문제가 발생하면?

- `/debug` 페이지로 환경 변수 상태 확인
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 참고
- 브라우저 콘솔과 터미널 로그 확인

## 배포하려면?

[DEPLOYMENT.md](./DEPLOYMENT.md) 가이드를 참고하세요.

