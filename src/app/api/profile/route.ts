import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/clerk'
import { getServiceSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  console.log('📥 [PROFILE API POST] 프로필 생성 API 호출')
  
  try {
    // 1. 인증 확인 및 사용자 정보 가져오기
    console.log('🔐 [PROFILE API POST] 사용자 인증 확인 중...')
    const clerkUser = await requireUser()
    const clerkUserId = clerkUser.id
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress
    
    console.log('✅ [PROFILE API POST] 인증된 사용자:', { clerkUserId, userEmail })

    if (!userEmail) {
      console.error('❌ [PROFILE API POST] 사용자 이메일을 찾을 수 없습니다')
      return NextResponse.json(
        { error: '사용자 이메일을 찾을 수 없습니다' },
        { status: 400 }
      )
    }

    // 2. 요청 데이터 파싱
    const data = await req.json()
    console.log('📦 [PROFILE API POST] 받은 데이터:', data)

    const { age, gender, goal, allergy, height, weight, daily_calorie } = data

    // 3. goal 필수 확인
    if (!goal || !['lose', 'keep', 'gain'].includes(goal)) {
      console.error('❌ [PROFILE API POST] 목표가 누락되었거나 잘못되었습니다:', goal)
      return NextResponse.json(
        { error: '목표를 선택해주세요' },
        { status: 400 }
      )
    }

    // 4. Supabase 클라이언트 생성
    console.log('🔧 [PROFILE API POST] 환경 변수 확인:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
    })
    
    const supabase = getServiceSupabase()
    console.log('✅ [PROFILE API POST] Supabase 클라이언트 생성 완료')

    // 5. users 테이블에서 user_id 찾기 (없으면 생성)
    console.log('🔍 [PROFILE API POST] users 테이블에서 사용자 찾기...')
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    console.log('📊 [PROFILE API POST] 사용자 조회 결과:', { user, userError })

    // 사용자가 없으면 자동으로 생성
    if (userError || !user) {
      console.log('📝 [PROFILE API POST] 사용자가 없어서 새로 생성합니다...')
      console.log('📝 [PROFILE API POST] 생성할 데이터:', { 
        clerk_user_id: clerkUserId, 
        email: userEmail,
        created_at: new Date().toISOString()
      })
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email: userEmail,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (createError || !newUser) {
        console.error('❌ [PROFILE API POST] 사용자 생성 실패!')
        console.error('❌ [PROFILE API POST] 에러 객체:', createError)
        console.error('❌ [PROFILE API POST] 에러 상세:', {
          code: createError?.code,
          message: createError?.message,
          details: createError?.details,
          hint: createError?.hint,
        })
        
        return NextResponse.json(
          { 
            error: '사용자 생성에 실패했습니다',
            message: createError?.message || '알 수 없는 오류',
            errorDetails: {
              code: createError?.code,
              message: createError?.message,
              hint: createError?.hint,
              details: createError?.details
            }
          },
          { status: 500 }
        )
      }

      user = newUser
      console.log('✅ [PROFILE API POST] 새 사용자 생성 완료:', user.id)
    } else {
      console.log('✅ [PROFILE API POST] 기존 사용자 발견:', user.id)
    }

    // 6. user_profile 생성 또는 업데이트
    const profileData = {
      user_id: user.id,
      age: age || null,
      gender: gender || null,
      goal,
      allergy: allergy || [],
      height: height || null,
      weight: weight || null,
      daily_calorie: daily_calorie || 2000,
      updated_at: new Date().toISOString(),
    }

    console.log('💾 [PROFILE API POST] 프로필 데이터 저장 시도:', profileData)

    // upsert: 있으면 업데이트, 없으면 생성
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .upsert(profileData, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ [PROFILE API POST] 프로필 저장 실패!')
      console.error('❌ [PROFILE API POST] 에러 객체:', profileError)
      console.error('❌ [PROFILE API POST] 에러 상세:', {
        code: profileError?.code,
        message: profileError?.message,
        details: profileError?.details,
        hint: profileError?.hint
      })
      
      return NextResponse.json(
        { 
          error: '프로필 저장에 실패했습니다',
          message: profileError.message,
          errorDetails: {
            code: profileError?.code,
            message: profileError?.message,
            hint: profileError?.hint,
            details: profileError?.details
          }
        },
        { status: 500 }
      )
    }

    console.log('✅ [PROFILE API POST] 프로필 저장 성공:', profile)

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('❌ [PROFILE API POST] 프로필 생성 중 예상치 못한 오류:', error)
    console.error('❌ [PROFILE API POST] 에러 스택:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      {
        error: '프로필 생성 중 오류가 발생했습니다',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  console.log('📥 [PROFILE API GET] 프로필 조회 API 호출')
  
  try {
    // 1. 인증 확인 및 사용자 정보 가져오기
    console.log('🔐 [PROFILE API GET] 사용자 인증 확인 중...')
    const clerkUser = await requireUser()
    const clerkUserId = clerkUser.id
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress
    
    console.log('✅ [PROFILE API GET] 인증된 사용자:', { clerkUserId, userEmail })

    if (!userEmail) {
      console.error('❌ [PROFILE API GET] 사용자 이메일을 찾을 수 없습니다')
      return NextResponse.json(
        { error: '사용자 이메일을 찾을 수 없습니다' },
        { status: 400 }
      )
    }

    // 2. Supabase 클라이언트 생성
    console.log('🔧 [PROFILE API GET] 환경 변수 확인:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    })
    
    const supabase = getServiceSupabase()
    console.log('✅ [PROFILE API GET] Supabase 클라이언트 생성 완료')

    // 3. users 테이블에서 user_id 찾기 (없으면 생성)
    console.log('🔍 [PROFILE API GET] users 테이블에서 사용자 찾기...')
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    console.log('📊 [PROFILE API GET] 사용자 조회 결과:', { user, userError })

    // 사용자가 없으면 자동으로 생성
    if (userError || !user) {
      console.log('📝 [PROFILE API GET] 사용자가 없어서 새로 생성합니다...')
      console.log('📝 [PROFILE API GET] 생성할 데이터:', { 
        clerk_user_id: clerkUserId, 
        email: userEmail 
      })
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email: userEmail,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (createError || !newUser) {
        console.error('❌ [PROFILE API GET] 사용자 생성 실패!')
        console.error('❌ [PROFILE API GET] 에러 객체:', createError)
        console.error('❌ [PROFILE API GET] 에러 상세:', {
          code: createError?.code,
          message: createError?.message,
          details: createError?.details,
          hint: createError?.hint
        })
        
        return NextResponse.json(
          { 
            error: '사용자 생성에 실패했습니다',
            message: createError?.message || '알 수 없는 오류',
            errorDetails: {
              code: createError?.code,
              message: createError?.message,
              hint: createError?.hint
            }
          },
          { status: 500 }
        )
      }

      user = newUser
      console.log('✅ [PROFILE API GET] 새 사용자 생성 완료:', user.id)
    } else {
      console.log('✅ [PROFILE API GET] 기존 사용자 발견:', user.id)
    }

    // 4. user_profile 조회
    console.log('🔍 [PROFILE API GET] user_profile 조회 중...')
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      // PGRST116은 "결과 없음" 에러 (정상적인 상황)
      if (profileError.code === 'PGRST116') {
        console.log('📝 [PROFILE API GET] 프로필이 아직 생성되지 않음')
        return NextResponse.json({
          success: true,
          profile: null,
        })
      }
      
      console.error('❌ [PROFILE API GET] 프로필 조회 실패:', profileError)
      return NextResponse.json(
        { error: '프로필 조회 중 오류가 발생했습니다', message: profileError.message },
        { status: 500 }
      )
    }

    console.log('✅ [PROFILE API GET] 프로필 조회 성공:', profile)

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('❌ [PROFILE API GET] 프로필 조회 중 예상치 못한 오류:', error)
    console.error('❌ [PROFILE API GET] 에러 스택:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      {
        error: '프로필 조회 중 오류가 발생했습니다',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
