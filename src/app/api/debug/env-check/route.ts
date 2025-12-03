import { NextResponse } from 'next/server'

/**
 * 환경 변수 체크 API
 * 배포 환경에서 필요한 환경 변수가 제대로 설정되었는지 확인
 */
export async function GET() {
  console.log('🔍 [ENV CHECK] 환경 변수 체크 시작')
  
  const envCheck = {
    clerk: {
      publishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKey: !!process.env.CLERK_SECRET_KEY,
      publishableKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) || 'N/A',
    },
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || 'N/A',
    },
    gemini: {
      apiKey: !!process.env.GEMINI_API_KEY,
      keyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || 'N/A',
    },
    summary: {
      allSet: !!(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        process.env.CLERK_SECRET_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.GEMINI_API_KEY
      ),
    },
  }

  console.log('✅ [ENV CHECK] 체크 결과:', envCheck)

  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    envCheck,
    timestamp: new Date().toISOString(),
  })
}

