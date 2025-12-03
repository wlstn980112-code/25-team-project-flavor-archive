# ✅ 배포 전 최종 체크리스트

배포하기 전에 반드시 확인하세요!

## 🔑 환경 변수 (가장 중요!)

### Vercel 대시보드에서 확인:

Settings → Environment Variables 메뉴에서 다음이 **모두** 설정되어 있는지 확인:

```
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✅ CLERK_SECRET_KEY
✅ NEXT_PUBLIC_CLERK_SIGN_IN_URL
✅ NEXT_PUBLIC_CLERK_SIGN_UP_URL
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY

✅ GEMINI_API_KEY  ⭐⭐⭐ 이게 가장 중요!
```

### ⚠️ 중요한 점:

1. **환경 변수를 추가하거나 수정했다면 반드시 재배포!**
   - Vercel은 환경 변수 변경 시 자동 재배포하지 않습니다
   - Deployments → 점 3개 → Redeploy 클릭

2. **Environments 선택**
   - Production, Preview, Development 모두 체크

3. **값 검증**
   - 앞뒤 공백 없는지 확인
   - 따옴표 없이 값만 입력
   - 복사/붙여넣기 시 전체가 복사되었는지 확인

## 🧪 배포 후 테스트

### 1. 디버그 페이지로 환경 확인

```
https://your-app.vercel.app/debug
```

**확인 사항:**
- ⚙️ 환경 변수 체크 섹션
  - 모든 항목이 ✅인지 확인
  - ❌가 하나라도 있으면 환경 변수 추가 후 재배포

### 2. 인증 테스트

1. 회원가입 시도
2. 이메일 인증 (Clerk 설정에 따라)
3. 로그인 후 홈 화면 확인

### 3. 온보딩 테스트

1. `/onboarding` 자동 리다이렉트 확인
2. 프로필 정보 입력
3. "시작하기" 버튼 클릭
4. 홈으로 리다이렉트 확인

### 4. 식단 추천 테스트 ⭐

1. 홈에서 "오늘의 식단 추천받기" 클릭
2. 로딩 애니메이션 확인 (5-10초)
3. 추천 결과 표시 확인:
   - 아침/점심/저녁 3개 카드
   - 총 칼로리 표시
   - AI 추천 이유 표시
4. 레시피 카드 클릭 → 상세 페이지 이동 확인

### 5. 에러 시나리오 테스트

- 로그아웃 후 보호된 페이지 접근 시 → 로그인 페이지로 리다이렉트
- 프로필 없이 추천 요청 시 → 온보딩으로 리다이렉트

## 🚨 자주 발생하는 문제

### "Gemini API 키가 설정되지 않았습니다"

**체크:**
1. Vercel 환경 변수에 `GEMINI_API_KEY` 있는지
2. 값이 제대로 복사되었는지 (앞뒤 공백 없이)
3. 환경 변수 추가 후 **재배포** 했는지

**해결:**
```
Settings → Environment Variables → Add
Name: GEMINI_API_KEY
Value: AIza... (전체 값)
Environments: 모두 체크
Save → Deployments → Redeploy
```

### 식단 추천이 무한 로딩

**가능한 원인:**
1. GEMINI_API_KEY 오류 (잘못된 키, 만료, 할당량 초과)
2. Supabase 연결 실패
3. 서버 타임아웃

**확인:**
1. Vercel Functions 로그 확인
2. `/debug` 페이지에서 추천 API 테스트
3. 브라우저 콘솔 에러 확인

### 500 Internal Server Error

**확인:**
1. Vercel Functions → Logs
2. Supabase 대시보드 → Database → Tables
3. `/debug` 페이지 환경 변수 상태

## 📊 모니터링

### 배포 직후:

1. **Vercel Analytics** (Settings → Analytics)
   - 페이지 로딩 속도
   - 에러 발생률

2. **Functions Logs** (Functions 탭)
   - API 에러 확인
   - 응답 시간 모니터링

3. **Supabase Dashboard**
   - Database 활동
   - API 요청 수

## 🎯 성공 기준

배포가 성공했다고 판단하는 기준:

- ✅ `/debug` 페이지에서 모든 환경 변수 ✅
- ✅ 회원가입/로그인 정상 작동
- ✅ 온보딩 완료 후 프로필 저장됨
- ✅ 식단 추천이 5-10초 내에 표시됨
- ✅ 추천 결과에 3개 레시피 + 총 칼로리 + AI 이유 표시
- ✅ 레시피 상세 페이지 정상 작동
- ✅ 브라우저 콘솔에 에러 없음
- ✅ Vercel Functions에 에러 로그 없음

## 🔄 롤백 방법

문제가 발생하면 즉시 이전 버전으로 롤백:

1. Vercel 대시보드 → Deployments
2. 정상 작동하던 이전 배포 찾기
3. 점 3개 메뉴 → **Promote to Production**
4. 확인

## 📞 추가 도움이 필요하면

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel Support: https://vercel.com/support
- Clerk Support: https://clerk.com/support
- Supabase Support: https://supabase.com/dashboard/support

---

**핵심 포인트**: 환경 변수 변경 후 **반드시 재배포**! ⭐


