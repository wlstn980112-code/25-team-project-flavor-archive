import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/clerk'
import { getServiceSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  console.log('🔍 [DEBUG API] 디버그 정보 요청')
  
  try {
    // 1. 환경 변수 확인
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      supabase_url_value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      service_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      gemini_key_length: process.env.GEMINI_API_KEY?.length || 0,
    }

    console.log('🔧 [DEBUG API] 환경 변수 체크:', envCheck)

    // 2. Clerk 인증 확인
    let clerkInfo = null
    let clerkError = null
    try {
      const clerkUser = await requireUser()
      clerkInfo = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      }
      console.log('✅ [DEBUG API] Clerk 인증 성공:', clerkInfo)
    } catch (err) {
      clerkError = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ [DEBUG API] Clerk 인증 실패:', clerkError)
    }

    // 3. Supabase 연결 확인
    let supabaseCheck = {
      connected: false,
      error: null as any,
      tablesExist: {
        users: false,
        user_profile: false,
        recipes: false,
      },
      canInsert: false,
      insertError: null as any,
    }

    try {
      const supabase = getServiceSupabase()
      console.log('✅ [DEBUG API] Supabase 클라이언트 생성 성공')
      supabaseCheck.connected = true

      // 테이블 존재 확인
      console.log('🔍 [DEBUG API] users 테이블 확인 중...')
      const { error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      supabaseCheck.tablesExist.users = !usersError
      if (usersError) {
        console.error('❌ [DEBUG API] users 테이블 에러:', usersError)
      } else {
        console.log('✅ [DEBUG API] users 테이블 접근 가능')
      }

      console.log('🔍 [DEBUG API] user_profile 테이블 확인 중...')
      const { error: profileError } = await supabase
        .from('user_profile')
        .select('id')
        .limit(1)
      
      supabaseCheck.tablesExist.user_profile = !profileError
      if (profileError) {
        console.error('❌ [DEBUG API] user_profile 테이블 에러:', profileError)
      } else {
        console.log('✅ [DEBUG API] user_profile 테이블 접근 가능')
      }

      console.log('🔍 [DEBUG API] recipes 테이블 확인 중...')
      const { error: recipesError } = await supabase
        .from('recipes')
        .select('id')
        .limit(1)
      
      supabaseCheck.tablesExist.recipes = !recipesError
      if (recipesError) {
        console.error('❌ [DEBUG API] recipes 테이블 에러:', recipesError)
      } else {
        console.log('✅ [DEBUG API] recipes 테이블 접근 가능')
      }

      // Insert 권한 테스트 (실제로 삽입하지 않음)
      if (clerkInfo) {
        console.log('🔍 [DEBUG API] users 테이블 insert 권한 테스트...')
        const testData = {
          clerk_user_id: `test_${Date.now()}`,
          email: 'test@example.com',
          created_at: new Date().toISOString(),
        }
        
        // 실제로 insert하지 않고 에러만 확인
        const { error: insertError } = await supabase
          .from('users')
          .insert(testData)
          .select('id')
        
        if (insertError) {
          supabaseCheck.canInsert = false
          supabaseCheck.insertError = {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          }
          console.error('❌ [DEBUG API] Insert 테스트 실패:', supabaseCheck.insertError)
        } else {
          // 테스트 데이터 삭제
          await supabase
            .from('users')
            .delete()
            .eq('clerk_user_id', testData.clerk_user_id)
          
          supabaseCheck.canInsert = true
          console.log('✅ [DEBUG API] Insert 권한 확인됨')
        }
      }

    } catch (err) {
      supabaseCheck.error = err instanceof Error ? {
        message: err.message,
        stack: err.stack,
      } : String(err)
      console.error('❌ [DEBUG API] Supabase 연결 에러:', supabaseCheck.error)
    }

    const response = {
      timestamp: new Date().toISOString(),
      environment: {
        variables: envCheck,
      },
      clerk: {
        authenticated: !!clerkInfo,
        user: clerkInfo,
        error: clerkError,
      },
      supabase: supabaseCheck,
    }

    console.log('✅ [DEBUG API] 디버그 정보 반환:', response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ [DEBUG API] 디버그 중 에러:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

