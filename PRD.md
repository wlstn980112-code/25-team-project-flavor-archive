# 🚀 Flavor Archive - Cursor 개발 PRD

## 📋 프로젝트 개요

**목표**: 1개월 내 Hyper-MVP 완성
**핵심 가치**: 건강 정보 입력 → AI 맞춤 식단 추천 → 레시피 열람

---

## 🎯 Phase 1: 프로젝트 초기 설정 (Day 1)

### 1.1 Next.js 프로젝트 생성
```bash
npx create-next-app@latest flavor-archive --typescript --tailwind --app
cd flavor-archive
```

**Cursor에게 요청할 내용**:
```
Next.js 14 App Router 프로젝트 생성해줘.
- TypeScript 사용
- Tailwind CSS 설정
- src/ 디렉토리 구조 사용
- prettier, eslint 설정 포함
```

### 1.2 필수 패키지 설치
```bash
# 인증
npm install @clerk/nextjs

# Supabase
npm install @supabase/supabase-js

# 상태 관리 & API
npm install @tanstack/react-query axios

# UI 라이브러리
npm install lucide-react class-variance-authority clsx tailwind-merge

# 폼 관리
npm install react-hook-form zod @hookform/resolvers
```

**Cursor에게 요청할 내용**:
```
package.json에 위 패키지들 설치하고 
최신 버전으로 설정해줘.
```

### 1.3 환경 변수 설정
**`.env.local` 파일 생성**:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 🏗️ Phase 2: 폴더 구조 & 기본 설정 (Day 1-2)

### 2.1 폴더 구조
```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 홈 (오늘의 추천)
│   │   ├── onboarding/page.tsx
│   │   ├── recommendations/page.tsx
│   │   ├── recipes/
│   │   │   ├── page.tsx          # 레시피 목록
│   │   │   └── [id]/page.tsx     # 레시피 상세
│   │   └── profile/page.tsx
│   ├── api/
│   │   ├── webhooks/clerk/route.ts
│   │   ├── recommendations/route.ts
│   │   └── recipes/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn/ui 컴포넌트
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── recipe/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeList.tsx
│   │   └── RecipeDetail.tsx
│   └── recommendation/
│       ├── MealCard.tsx
│       └── DailyRecommendation.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── clerk.ts
│   └── utils.ts
├── types/
│   ├── database.types.ts
│   ├── recipe.types.ts
│   └── user.types.ts
└── hooks/
    ├── useUser.ts
    ├── useRecipes.ts
    └── useRecommendations.ts
```

**Cursor에게 요청할 내용**:
```
위 폴더 구조를 생성하고 각 파일에 
기본 boilerplate 코드를 작성해줘.
```

### 2.2 Clerk 설정
**`src/app/layout.tsx`**:
```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { ko } from '@clerk/localizations'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ko}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**Cursor에게 요청할 내용**:
```
Clerk Provider를 root layout에 설정하고
한국어 로케일을 적용해줘.
middleware.ts도 생성해서 보호된 라우트 설정해줘.
```

### 2.3 Supabase 클라이언트 설정
**`src/lib/supabase/client.ts`**:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Cursor에게 요청할 내용**:
```
Supabase 클라이언트와 서버 사이드 클라이언트를 
각각 생성해줘. TypeScript 타입도 포함해서.
```

---

## 🔐 Phase 3: 인증 & 사용자 동기화 (Day 2-3)

### 3.1 Clerk → Supabase 동기화
**Webhook 설정**:

**Cursor에게 요청할 내용**:
```
Clerk webhook을 만들어서 사용자가 회원가입하면
Supabase의 users 테이블에 자동으로 추가되게 해줘.

POST /api/webhooks/clerk

1. Clerk에서 user.created 이벤트 받기
2. Supabase users 테이블에 insert
   - clerk_user_id
   - email
3. 에러 핸들링 포함
```

### 3.2 미들웨어 설정
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhooks/clerk"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**Cursor에게 요청할 내용**:
```
Clerk 미들웨어를 설정해서
- public route: 홈, 로그인, 회원가입
- protected route: 나머지 모든 페이지
로 설정해줘.
```

---

## 🎨 Phase 4: 온보딩 페이지 (Day 3-4)

### 4.1 온보딩 폼
**화면 구성**:
- 나이 (선택)
- 성별 (선택: male/female/other)
- 목표 (필수: lose/keep/gain)
- 알레르기 (다중 선택: milk/nut/shellfish)
- 키 (선택)
- 몸무게 (선택)
- 하루 목표 칼로리 자동 계산 표시

**Cursor에게 요청할 내용**:
```
온보딩 페이지를 만들어줘.

요구사항:
1. react-hook-form + zod로 폼 검증
2. 단계별 UI (한 화면에 모두 표시)
3. 알레르기는 체크박스 (다중 선택)
4. 목표는 3개 버튼 중 선택
5. 칼로리 자동 계산 로직:
   - 기본값: 2000kcal
   - 감량: -500kcal
   - 증가: +500kcal
   - 키/몸무게 입력 시 더 정확한 계산
6. 제출 시 Supabase user_profile 테이블에 저장
7. 완료 후 /home으로 리다이렉트
```

### 4.2 API Route
```typescript
// app/api/profile/route.ts
export async function POST(req: Request) {
  // user_profile 생성
}
```

---

## 🏠 Phase 5: 홈 화면 (Day 4-5)

### 5.1 홈 화면 UI
**구성 요소**:
- 헤더: 사용자 이름, 로그아웃 버튼
- "오늘의 추천 식단" 버튼
- 최근 추천 기록 (optional)
- 레시피 둘러보기 링크

**Cursor에게 요청할 내용**:
```
홈 화면을 만들어줘.

레이아웃:
1. 상단: "안녕하세요, {사용자명}님"
2. 큰 버튼: "오늘의 식단 추천받기"
   - 클릭 시 추천 API 호출
   - 로딩 상태 표시
   - 완료 시 /recommendations 이동
3. 하단: "레시피 둘러보기" 링크
4. Clerk UserButton 컴포넌트 포함

스타일:
- 모던하고 깔끔한 디자인
- Tailwind CSS 사용
- 반응형 디자인
```

---

## 🤖 Phase 6: AI 추천 시스템 (Day 5-6)

### 6.1 추천 API
```typescript
// app/api/recommendations/route.ts

export async function POST(req: Request) {
  // 1. 사용자 정보 가져오기
  // 2. daily_calorie / 3 = perMealTarget
  // 3. recipes 테이블에서 필터링:
  //    - calories BETWEEN perMealTarget * 0.8 AND 1.2
  //    - 알레르기 제외
  //    - random() 정렬
  // 4. 3개 레시피 선택 (중복 없이)
  // 5. 결과 반환
}
```

**Cursor에게 요청할 내용**:
```
식단 추천 API를 만들어줘.

로직:
1. 현재 로그인한 사용자의 user_profile 가져오기
2. daily_calorie ÷ 3 = 한 끼 목표 칼로리
3. Supabase에서 레시피 필터링:
   ```sql
   SELECT * FROM recipes
   WHERE calories BETWEEN ${minCal} AND ${maxCal}
   AND NOT (ingredients::jsonb ?| array[사용자알레르기])
   ORDER BY random()
   LIMIT 3
   ```
4. 아침/점심/저녁 3개 레시피 반환
5. 에러 처리:
   - 프로필 없음
   - 레시피 부족
```

### 6.2 추천 결과 화면
**구성**:
- 아침/점심/저녁 각각 카드 형태
- 썸네일, 제목, 칼로리
- "상세보기" 버튼
- "다시 추천받기" 버튼

**Cursor에게 요청할 내용**:
```
추천 결과 페이지를 만들어줘.

레이아웃:
1. 제목: "오늘의 추천 식단"
2. 총 칼로리 표시
3. 3개 카드 (아침/점심/저녁)
   - 썸네일 이미지
   - 레시피 제목
   - 칼로리, 단백질, 탄수화물, 지방
   - "자세히 보기" 버튼 → /recipes/[id]
4. 하단: "다시 추천받기" 버튼
5. React Query로 데이터 페칭
```

---

## 📖 Phase 7: 레시피 목록 & 상세 (Day 6-7)

### 7.1 레시피 목록 페이지
**기능**:
- 전체 레시피 그리드 표시
- 칼로리 필터 (선택)
- 태그 필터 (선택)
- 무한 스크롤 or 페이지네이션

**Cursor에게 요청할 내용**:
```
레시피 목록 페이지를 만들어줘.

기능:
1. Supabase에서 recipes 전체 가져오기
2. 그리드 레이아웃 (3열)
3. RecipeCard 컴포넌트:
   - 썸네일
   - 제목
   - 칼로리
   - 태그 (최대 3개)
4. 클릭 시 /recipes/[id] 이동
5. 로딩 스켈레톤 UI
6. React Query 사용
```

### 7.2 레시피 상세 페이지
**구성**:
- 큰 썸네일
- 제목, 칼로리, 영양소
- 재료 리스트
- 조리 단계
- 태그

**Cursor에게 요청할 내용**:
```
레시피 상세 페이지를 만들어줘.

레이아웃:
1. 상단: 큰 이미지
2. 제목 + 칼로리/영양소 박스
3. 재료 섹션:
   - ingredients JSON 파싱
   - 체크박스 형태 (optional)
4. 조리 과정:
   - steps JSON 파싱
   - 번호 매기기
5. 하단: 태그 표시
6. "뒤로가기" 버튼
```

---

## 🎨 Phase 8: UI/UX 개선 (Day 7-8)

### 8.1 공통 컴포넌트
**Cursor에게 요청할 내용**:
```
shadcn/ui 컴포넌트를 설치하고 다음을 만들어줘:

1. Button 컴포넌트 (variant: default/outline/ghost)
2. Card 컴포넌트
3. Loading Spinner
4. Skeleton UI
5. Toast 알림
6. Dialog/Modal
```

### 8.2 헤더 & 네비게이션
```
반응형 헤더를 만들어줘:
- 로고
- 네비게이션 메뉴 (홈/레시피/프로필)
- Clerk UserButton
- 모바일: 햄버거 메뉴
```

---

## 🧪 Phase 9: 테스트 & 버그 수정 (Day 8-9)

### 9.1 테스트 시나리오
```
다음 플로우를 테스트해줘:

1. 회원가입 → 온보딩 → 홈
2. 추천받기 → 결과 확인 → 레시피 상세
3. 레시피 목록 → 상세 → 뒤로가기
4. 프로필 수정 (optional)
5. 로그아웃 → 로그인

각 단계에서 에러 처리 확인:
- 네트워크 에러
- 데이터 없음
- 권한 없음
```

---

## 🚀 Phase 10: 배포 준비 (Day 9-10)

### 10.1 Vercel 배포
**Cursor에게 요청할 내용**:
```
Vercel 배포를 위한 설정을 해줘:

1. vercel.json 파일 생성
2. 환경 변수 체크리스트
3. build 명령어 최적화
4. 배포 전 체크리스트
```

### 10.2 최종 체크리스트
- [ ] 모든 환경 변수 설정 완료
- [ ] Clerk 프로덕션 키 발급
- [ ] Supabase 프로덕션 URL 설정
- [ ] 레시피 50개 Seed 데이터 입력
- [ ] 모든 페이지 반응형 확인
- [ ] 에러 핸들링 확인
- [ ] 로딩 상태 확인
- [ ] SEO 메타 태그 설정

---

## 📊 개발 우선순위

### 🔴 High Priority (MVP 필수)
1. 인증 (Clerk)
2. 온보딩
3. 추천 시스템
4. 레시피 상세

### 🟡 Medium Priority (있으면 좋음)
1. 레시피 목록 필터
2. 추천 기록 저장
3. 프로필 수정

### 🟢 Low Priority (나중에)
1. 알림 기능
2. 즐겨찾기
3. 공유 기능

---

## 💡 Cursor 사용 팁

### 효과적인 프롬프트 작성법
```
❌ 나쁜 예: "온보딩 페이지 만들어줘"

✅ 좋은 예:
"온보딩 페이지를 만들어줘.
파일: src/app/(main)/onboarding/page.tsx
요구사항:
1. react-hook-form 사용
2. 필드: 나이, 성별, 목표, 알레르기, 키, 몸무게
3. zod 스키마로 검증
4. 제출 시 /api/profile POST
5. Tailwind로 깔끔한 디자인
6. 로딩 상태 표시"
```

### 단계별 개발 방법
1. **기능 하나씩** 요청
2. **에러 발생 시** 에러 메시지 전체 복사해서 물어보기
3. **타입 에러** 발생 시 types 파일도 함께 수정 요청
4. **테스트하면서** 진행

---

## 🎯 최종 목표

**1개월 후 완성 상태**:
- ✅ 회원가입/로그인 완료
- ✅ 온보딩 완료
- ✅ AI 식단 추천 작동
- ✅ 레시피 50개 열람 가능
- ✅ 반응형 디자인
- ✅ Vercel 배포 완료

**성공 지표**:
- 사용자가 5분 안에 추천 받을 수 있음
- 모바일에서도 완벽하게 작동
- 로딩 시간 3초 이내

---

## 📞 다음 단계

이제 Cursor를 열고 위 PRD를 참고하면서:

1. **Day 1**: Phase 1-2 실행 (프로젝트 설정)
2. **Day 2-3**: Phase 3-4 실행 (인증 + 온보딩)
3. **Day 4-6**: Phase 5-6 실행 (홈 + 추천)
4. **Day 7-8**: Phase 7-8 실행 (레시피 + UI)
5. **Day 9-10**: Phase 9-10 실행 (테스트 + 배포)

필요한 부분이 있으면 언제든 물어보세요! 🚀