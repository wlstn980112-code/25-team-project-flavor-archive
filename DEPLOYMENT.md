# 🚀 배포 가이드

## Vercel 배포 방법

### 1단계: Vercel 계정 준비

1. [Vercel](https://vercel.com) 회원가입 (GitHub 계정 연동 추천)
2. GitHub 저장소와 연결

### 2단계: 환경 변수 설정 ⚠️ (중요!)

배포 전 반드시 다음 환경 변수를 설정해야 합니다:

#### Clerk (인증)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

#### Supabase (데이터베이스)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### Gemini AI (식단 추천) ⚠️ 필수!
```
GEMINI_API_KEY=AIza...
```

### 3단계: Vercel에서 환경 변수 입력

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** 탭
3. **Environment Variables** 메뉴
4. 각 변수를 하나씩 추가:
   - **Name**: 변수 이름 (예: `GEMINI_API_KEY`)
   - **Value**: 실제 값
   - **Environments**: Production, Preview, Development 모두 선택
5. **Save** 클릭

### 4단계: 배포

#### 첫 배포:
```bash
git push origin main
```

Vercel이 자동으로 배포를 시작합니다.

#### 환경 변수 변경 후:
⚠️ **중요**: 환경 변수를 추가하거나 수정한 경우, **반드시 재배포**해야 합니다!

1. Vercel 대시보드 → Deployments
2. 최신 배포 옆 **...** 메뉴 클릭
3. **Redeploy** 선택
4. **Redeploy** 버튼 클릭

### 5단계: 배포 확인

1. 배포 URL로 접속 (예: `https://your-app.vercel.app`)
2. `/debug` 페이지 방문: `https://your-app.vercel.app/debug`
3. **환경 변수 체크** 섹션에서 모든 항목이 ✅인지 확인
4. 프로필이 없으면 `/onboarding`에서 설정
5. 식단 추천 테스트

## 문제 해결

### "Gemini API 키가 설정되지 않았습니다"

**원인**: GEMINI_API_KEY가 누락되었거나 재배포하지 않았습니다.

**해결**:
1. Vercel Settings → Environment Variables에서 `GEMINI_API_KEY` 확인
2. 없으면 추가
3. **반드시 재배포!** (Deployments → Redeploy)

### "로그인이 필요합니다"

**원인**: Clerk 설정 문제

**해결**:
1. Clerk 대시보드에서 도메인 확인
2. Allowed Origins에 Vercel URL 추가
3. 환경 변수 재확인

### "프로필을 먼저 설정해주세요"

**원인**: 온보딩 미완료

**해결**:
1. `/onboarding` 페이지 방문
2. 프로필 정보 입력

### 500 에러 (서버 오류)

**원인**: 여러 가지 가능

**해결**:
1. Vercel 대시보드 → 프로젝트 → Functions
2. 최근 에러 로그 확인
3. `/debug` 페이지에서 환경 변수 체크
4. Supabase 연결 상태 확인

## 배포 전 체크리스트

- [ ] GitHub 저장소에 코드 푸시 완료
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인 (로컬 환경 변수 유출 방지)
- [ ] Vercel에 모든 환경 변수 설정
  - [ ] GEMINI_API_KEY ⭐ (가장 중요!)
  - [ ] Clerk 키 (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
  - [ ] Supabase 키 (URL, ANON_KEY, SERVICE_ROLE_KEY)
- [ ] Clerk 대시보드에서 도메인 설정
- [ ] Supabase에서 RLS 정책 확인
- [ ] 배포 후 `/debug` 페이지로 환경 변수 확인

## 배포 후 해야 할 일

### 1. 도메인 설정 (선택)
1. Vercel 대시보드 → Domains
2. 커스텀 도메인 추가
3. DNS 설정

### 2. Clerk Webhook 설정 (선택, 고급)
1. Clerk 대시보드 → Webhooks
2. Endpoint URL: `https://your-app.vercel.app/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`
4. WEBHOOK_SECRET 환경 변수 추가

### 3. 모니터링
- Vercel Analytics 활성화 (Settings → Analytics)
- 에러 추적 (Functions → Logs)

## 유용한 명령어

### 로컬 배포 미리보기:
```bash
npm run build
npm start
```

### Vercel CLI로 배포:
```bash
npm install -g vercel
vercel login
vercel
```

## 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Clerk 프로덕션 체크리스트](https://clerk.com/docs/deployments/production-checklist)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 긴급 문제 발생 시

1. Vercel 대시보드 → Deployments → Previous Deployment으로 롤백
2. 로그 확인: Functions → View Function Logs
3. `/debug` 페이지로 상태 진단
4. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 참고


