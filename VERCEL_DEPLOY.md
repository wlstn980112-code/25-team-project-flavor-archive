# 🚀 Vercel CLI로 직접 배포하기 (Git 없이)

Git 저장소에 커밋하지 않고 Vercel CLI를 사용해서 직접 배포하는 방법입니다.

## 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

또는

```bash
npx vercel
```

## 2단계: Vercel 로그인

```bash
vercel login
```

브라우저가 열리면 Vercel 계정으로 로그인하세요.

## 3단계: 프로젝트 배포

프로젝트 루트 디렉토리에서:

```bash
vercel
```

또는 프로덕션 배포:

```bash
vercel --prod
```

## 4단계: 환경 변수 설정

### 방법 1: CLI로 설정

```bash
vercel env add GEMINI_API_KEY
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

각 명령어 실행 시:
- **Value**: 환경 변수 값 입력
- **Environment**: Production, Preview, Development 선택 (스페이스바로 선택)

### 방법 2: Vercel 대시보드에서 설정

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 환경 변수 추가

## 5단계: 재배포 (환경 변수 변경 후)

환경 변수를 추가하거나 수정한 경우:

```bash
vercel --prod
```

또는 Vercel 대시보드에서:
- **Deployments** → 최신 배포 옆 **...** → **Redeploy**

## 주요 명령어

### 현재 배포 상태 확인
```bash
vercel ls
```

### 배포 상세 정보
```bash
vercel inspect [deployment-url]
```

### 로그 확인
```bash
vercel logs [deployment-url]
```

### 프로젝트 제거
```bash
vercel remove
```

## 주의사항

1. **`.vercel` 폴더**: 
   - Vercel CLI가 생성하는 설정 폴더입니다
   - `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
   - 이 폴더가 있으면 같은 프로젝트로 인식됩니다

2. **환경 변수**:
   - CLI로 추가한 환경 변수는 Vercel 대시보드에서도 확인 가능합니다
   - 환경 변수 변경 후에는 반드시 재배포해야 합니다

3. **프로덕션 배포**:
   - `vercel --prod`는 프로덕션 환경에 배포합니다
   - `vercel`만 입력하면 Preview 환경에 배포됩니다

## 빠른 배포 스크립트

`package.json`에 스크립트 추가:

```json
{
  "scripts": {
    "deploy": "vercel --prod",
    "deploy:preview": "vercel"
  }
}
```

사용:
```bash
npm run deploy        # 프로덕션 배포
npm run deploy:preview # Preview 배포
```

## 문제 해결

### "Project not found"
- Vercel 대시보드에서 프로젝트를 먼저 생성하거나
- `vercel` 명령어로 새 프로젝트 생성

### 환경 변수가 적용되지 않음
- 환경 변수 추가 후 반드시 재배포: `vercel --prod`
- Vercel 대시보드에서 환경 변수 확인

### 배포 실패
- `vercel logs`로 로그 확인
- `/debug` 페이지에서 환경 변수 확인
- 빌드 에러 확인: `npm run build` 로컬에서 테스트

