# 🐛 문제 해결 가이드

## 🚨 식단 추천이 작동하지 않는 경우

### 1단계: 디버그 페이지 확인
먼저 `/debug` 페이지를 방문하여 환경 변수가 제대로 설정되었는지 확인하세요:

```
http://localhost:3000/debug  (로컬)
https://your-domain.vercel.app/debug  (배포)
```

**확인 사항:**
- ✅ 모든 환경 변수가 설정되어 있는지
- ✅ Clerk 인증이 작동하는지
- ✅ 프로필이 생성되어 있는지

### 2단계: 환경 변수 설정 확인

#### 필수 환경 변수:
1. **GEMINI_API_KEY** ⚠️ (가장 중요!)
   - 식단 추천 AI 기능에 필수
   - [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급
   
2. **Clerk 키들**
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   
3. **Supabase 키들**
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

#### Vercel 배포 시 환경 변수 설정:
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. 위의 모든 환경 변수 추가
4. **Redeploy** 버튼 클릭 (중요!)

### 3단계: Gemini API 키 발급 (없는 경우)

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 기존 프로젝트 선택 또는 신규 생성
5. 생성된 키 복사
6. `.env.local` (로컬) 또는 Vercel 환경 변수에 추가:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## "조건에 맞는 레시피가 없습니다" 에러

### 원인
데이터베이스에 레시피 데이터가 없거나, 사용자의 칼로리 범위에 맞는 레시피가 없습니다.

### 해결 방법

#### 1단계: tsx 패키지 설치
```bash
npm install
```

#### 2단계: 환경 변수 확인
`.env.local` 파일에 다음 변수들이 설정되어 있는지 확인하세요:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

#### 3단계: 샘플 레시피 데이터 추가
```bash
npm run seed:recipes
```

이 명령어는 다양한 칼로리 범위의 샘플 레시피 8개를 데이터베이스에 추가합니다:
- 저칼로리 (300-500kcal): 2개
- 중간칼로리 (500-700kcal): 2개
- 고칼로리 (700-900kcal): 3개
- 간식 (200-300kcal): 1개

#### 4단계: 페이지 새로고침
`/recommendations` 페이지를 새로고침하여 다시 시도하세요.

## 디버그 페이지 사용하기

문제를 진단하려면 `/debug` 페이지를 방문하세요:

```
http://localhost:3000/debug
```

이 페이지에서 확인할 수 있는 정보:
- ✅ Clerk 인증 상태
- ✅ 프로필 존재 여부
- ✅ API 응답 상태
- ✅ 에러 메시지

## API 로그 확인하기

개발 서버 터미널에서 다음 형식의 로그를 찾아보세요:

```
📥 [RECOMMENDATIONS API] 식단 추천 API 호출 시작
🔐 [RECOMMENDATIONS API] 사용자 인증 확인 중...
✅ [RECOMMENDATIONS API] 인증 성공
🔍 [RECOMMENDATIONS API] users 테이블에서 사용자 찾기...
✅ [RECOMMENDATIONS API] 사용자 발견
🔍 [RECOMMENDATIONS API] user_profile 조회 중...
✅ [RECOMMENDATIONS API] 프로필 조회 성공
🎯 [RECOMMENDATIONS API] 칼로리 범위 계산
🔍 [RECOMMENDATIONS API] 레시피 조회 시작...
✅ [RECOMMENDATIONS API] 조회된 레시피 수: X
```

## 브라우저 콘솔 로그 확인하기

브라우저 개발자 도구(F12)의 콘솔 탭에서 다음 로그를 찾아보세요:

```
🔍 [useRecommendations] 식단 추천 요청 시작...
✅ [useRecommendations] 추천 받기 성공
```

또는 에러 로그:
```
❌ [useRecommendations] 추천 받기 실패
❌ [useRecommendations] Axios Error: {...}
```

## 일반적인 에러 및 해결 방법

### 0. "Gemini API 키가 설정되지 않았습니다" ⚠️ 
**원인**: GEMINI_API_KEY 환경 변수가 누락되었습니다.
**해결**: 
- 로컬: `.env.local` 파일에 `GEMINI_API_KEY=your_key` 추가
- 배포: Vercel 대시보드에서 환경 변수 설정 후 재배포
- 키 발급: [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. "프로필을 먼저 설정해주세요"
**원인**: 온보딩을 완료하지 않았습니다.
**해결**: `/onboarding` 페이지에서 프로필을 설정하세요.

### 2. "로그인이 필요합니다"
**원인**: 인증 세션이 만료되었거나 로그인하지 않았습니다.
**해결**: 로그아웃 후 다시 로그인하세요.

### 3. "데이터베이스에 레시피가 없습니다"
**원인**: recipes 테이블이 비어있습니다.
**해결**: `npm run seed:recipes` 명령어로 샘플 데이터를 추가하세요.

### 4. 404 에러 (API를 찾을 수 없음)
**원인**: 
- API route 파일이 제대로 빌드되지 않았습니다.
- 경로가 잘못되었습니다.

**해결**: 
- 개발 서버를 재시작하세요: `npm run dev`
- `.next` 폴더를 삭제하고 다시 빌드하세요

### 5. 500 에러 (서버 오류)
**원인**: 
- Supabase 연결 실패
- 환경 변수 누락
- 데이터베이스 스키마 문제

**해결**:
- 환경 변수 확인
- Supabase 프로젝트 상태 확인
- 데이터베이스 테이블 구조 확인

## 🌐 Vercel 배포 체크리스트

배포 전 반드시 확인:

- [ ] 모든 환경 변수가 Vercel에 설정되어 있는가?
  - [ ] GEMINI_API_KEY
  - [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - [ ] CLERK_SECRET_KEY
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY

- [ ] 환경 변수 추가/수정 후 **재배포**했는가?
  - Vercel은 환경 변수 변경 후 자동 재배포하지 않습니다!
  - Deployments → 점 3개 메뉴 → Redeploy 클릭

- [ ] Clerk Webhook이 설정되어 있는가? (optional)

- [ ] Supabase RLS 정책이 올바른가?

## 추가 도움

문제가 계속되면:
1. `/debug` 페이지에서 환경 변수 상태 확인
2. 개발 서버 터미널 로그 전체 복사
3. 브라우저 콘솔 에러 메시지 복사
4. 환경 변수 스크린샷 촬영 (키 값은 가리기)
5. 이슈 등록 또는 팀에 문의

## 자주 묻는 질문 (FAQ)

### Q: 로컬에서는 잘 작동하는데 배포 후 안됩니다
**A**: Vercel 환경 변수가 설정되지 않았을 가능성이 높습니다. 위의 체크리스트를 확인하고 재배포하세요.

### Q: Gemini API 키는 유료인가요?
**A**: 무료 tier가 제공됩니다. 개발 단계에서는 충분히 사용 가능합니다.

### Q: 식단 추천이 느립니다
**A**: Gemini AI가 레시피를 실시간으로 생성하기 때문에 5-10초 정도 소요될 수 있습니다. 이는 정상입니다.

### Q: 데이터베이스에 레시피를 추가하려면?
**A**: `npm run seed:recipes` 명령어로 샘플 레시피를 추가할 수 있습니다.

