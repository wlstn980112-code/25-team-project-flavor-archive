import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/clerk'
import { getServiceSupabase } from '@/lib/supabase/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Next.js 라우트 캐싱 방지 - 매번 새로운 추천을 생성하기 위해 필수
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  console.log('📥 [RECOMMENDATIONS API] AI 식단 추천 API 호출 시작')
  console.log('📥 [RECOMMENDATIONS API] Request URL:', req.url)
  console.log('📥 [RECOMMENDATIONS API] Request Method:', req.method)
  
  try {
    // 1. Gemini API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ [RECOMMENDATIONS API] GEMINI_API_KEY가 설정되지 않았습니다')
      return NextResponse.json(
        { 
          error: 'Gemini API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.',
          details: 'GEMINI_API_KEY environment variable is not set'
        },
        { status: 500 }
      )
    }

    // 2. 인증 확인 및 사용자 정보 가져오기
    console.log('🔐 [RECOMMENDATIONS API] 사용자 인증 확인 중...')
    const clerkUser = await requireUser()
    const clerkUserId = clerkUser.id
    
    console.log('✅ [RECOMMENDATIONS API] 인증 성공 - Clerk User ID:', clerkUserId)

    // 3. Supabase 클라이언트 생성
    const supabase = getServiceSupabase()

    // 4. users 테이블에서 user_id 찾기
    console.log('🔍 [RECOMMENDATIONS API] users 테이블에서 사용자 찾기...')
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      console.error('❌ [RECOMMENDATIONS API] 사용자를 찾을 수 없습니다')
      return NextResponse.json(
        { 
          error: '사용자를 찾을 수 없습니다. 온보딩을 완료해주세요.',
          details: userError?.message || 'User not found in database'
        },
        { status: 404 }
      )
    }

    console.log('✅ [RECOMMENDATIONS API] 사용자 발견 - User ID:', user.id)

    // 5. user_profile 조회
    console.log('🔍 [RECOMMENDATIONS API] user_profile 조회 중...')
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('❌ [RECOMMENDATIONS API] 프로필을 찾을 수 없습니다')
      return NextResponse.json(
        { 
          error: '프로필을 먼저 설정해주세요. /onboarding 페이지에서 설정할 수 있습니다.',
          details: profileError?.message || 'Profile not found'
        },
        { status: 404 }
      )
    }

    console.log('✅ [RECOMMENDATIONS API] 프로필 조회 성공:', {
      user_id: user.id,
      daily_calorie: profile.daily_calorie,
      goal: profile.goal,
      allergy: profile.allergy
    })

    // 6. AI에게 제공할 사용자 정보 준비
    // 목표에 따라 권장 칼로리 조정
    let adjustedDailyCalorie = profile.daily_calorie
    let calorieAdjustmentNote = ''
    
    if (profile.goal === 'lose') {
      // 체중 감량: 1800~2000kcal 범위로 조정 (최소 1200kcal)
      adjustedDailyCalorie = Math.max(1200, Math.min(2000, Math.round(profile.daily_calorie * 0.65)))
      calorieAdjustmentNote = '체중 감량을 위해 칼로리를 1800~2000kcal 범위로 조정했습니다.'
      console.log('📉 [RECOMMENDATIONS API] 체중 감량 목표 - 칼로리 조정:', profile.daily_calorie, '→', adjustedDailyCalorie)
    } else if (profile.goal === 'gain') {
      // 체중 증량: 사용자 설정보다 10% 높게
      adjustedDailyCalorie = Math.round(profile.daily_calorie * 1.1)
      calorieAdjustmentNote = '체중 증량을 위해 칼로리를 조정했습니다.'
      console.log('📈 [RECOMMENDATIONS API] 체중 증량 목표 - 칼로리 조정:', profile.daily_calorie, '→', adjustedDailyCalorie)
    }
    
    const perMealTarget = Math.round(adjustedDailyCalorie / 3)
    const allergies = Array.isArray(profile.allergy) ? profile.allergy : []
    const userInfo = {
      age: profile.age,
      gender: profile.gender,
      goal: profile.goal,
      allergies,
      daily_calorie: adjustedDailyCalorie,
      original_calorie: profile.daily_calorie,
      per_meal_calorie: perMealTarget,
      adjustment_note: calorieAdjustmentNote,
    }

    console.log('🤖 [RECOMMENDATIONS API] AI에게 전달할 사용자 정보:', userInfo)

    // 7. Gemini AI 클라이언트 초기화
    console.log('🤖 [RECOMMENDATIONS API] Gemini AI 초기화...')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash', // thinking 없는 안정 버전으로 변경
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    })

    console.log('🤖 [RECOMMENDATIONS API] Gemini API 호출 시작...')
    console.log('🤖 [RECOMMENDATIONS API] 사용 모델: gemini-2.0-flash')

    // 현재 날짜/시간 정보 (매번 다른 추천을 위해)
    const now = new Date()
    const dateStr = now.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
    const timeStr = now.toLocaleTimeString('ko-KR')
    const requestId = now.getTime()

    console.log(`🕐 [RECOMMENDATIONS API] 추천 요청 시간: ${dateStr} ${timeStr} (ID: ${requestId})`)

    const systemPrompt = `당신은 세계적인 영양사이자 요리 전문가입니다.
사용자의 건강 목표, 알레르기, 하루 목표 칼로리를 고려하여 아침, 점심, 저녁 3끼의 완전히 새로운 레시피를 **직접 생성**해주세요.

⚠️ **칼로리 준수는 절대적으로 중요합니다!**

중요 원칙:
1. **완전히 새로운 레시피를 창의적으로 생성하기** - 기존 데이터베이스나 흔한 레시피에 의존하지 말 것
2. **🔥 칼로리 엄격 준수**: 하루 총 칼로리가 목표 칼로리(${userInfo.daily_calorie}kcal)를 **절대 초과하지 않도록** (±5% 이내)
3. **한 끼 칼로리**: 약 ${userInfo.per_meal_calorie}kcal 내외 (±15% 허용, 초과 금지)
4. 알레르기 재료(${userInfo.allergies.length > 0 ? userInfo.allergies.join(', ') : '없음'})는 절대 사용 금지
5. 목표별 영양소 균형:
   - lose(감량): 고단백(30-40%), 저탄수화물(30-40%), 저지방(20-30%) - **저칼로리 필수**
   - keep(유지): 균형잡힌 영양소 (단백질 25%, 탄수화물 50%, 지방 25%)
   - gain(증량): 고단백(30%), 고탄수화물(50%), 적정 지방(20%)
6. 다양한 요리 스타일 활용 (한식, 양식, 일식, 중식, 퓨전 등)
7. 신선하고 계절에 맞는 재료 사용
8. 실제 조리 가능한 현실적인 레시피
9. **체중 감량(lose) 목표 시**: 채소 위주, 저칼로리 조리법(찜, 구이, 샐러드), 포만감 높은 재료

매 요청마다 완전히 다른 독창적인 레시피를 만들어주세요!`

    const userPrompt = `오늘 날짜: ${dateStr}
현재 시간: ${timeStr}
추천 요청 ID: ${requestId}

사용자 프로필:
- 나이: ${userInfo.age || '정보 없음'}세
- 성별: ${userInfo.gender === 'male' ? '남성' : userInfo.gender === 'female' ? '여성' : '정보 없음'}
- 건강 목표: ${
  userInfo.goal === 'lose' ? '🔥 체중 감량 (저칼로리 필수!)' :
  userInfo.goal === 'gain' ? '💪 체중 증량 및 근육 증가' :
  userInfo.goal === 'keep' ? '⚖️ 현재 체중 유지' : userInfo.goal
}
- 알레르기: ${userInfo.allergies.length > 0 ? userInfo.allergies.join(', ') : '없음'}
- 🎯 하루 목표 칼로리: **${userInfo.daily_calorie}kcal (절대 초과 금지!)**
- 🍽️ 한 끼 목표 칼로리: **약 ${userInfo.per_meal_calorie}kcal (±15% 허용)**
${userInfo.adjustment_note ? `- ℹ️ ${userInfo.adjustment_note}` : ''}

⚠️ **필수 준수 사항**:
${userInfo.goal === 'lose' ? `
- 체중 감량 목표이므로 저칼로리 레시피 필수
- 각 끼니는 ${userInfo.per_meal_calorie}kcal를 초과하지 않아야 함
- 채소, 단백질 위주의 건강한 저칼로리 식단 구성
- 총 칼로리 ${userInfo.daily_calorie}kcal 이내 엄수
` : userInfo.goal === 'gain' ? `
- 체중 증량 목표이므로 고단백, 고탄수화물 레시피
- 영양가 높은 식재료 사용
` : `
- 균형잡힌 영양소 배분
- 건강한 식습관 유지
`}

위 정보를 바탕으로 아침, 점심, 저녁 3개의 완전히 새로운 레시피를 생성하고 다음 JSON 형식으로 응답하세요:

{
  "breakfast": {
    "title": "레시피 이름 (한국어)",
    "calories": 칼로리(숫자 - 목표치 준수!),
    "protein": 단백질g(숫자),
    "carb": 탄수화물g(숫자),
    "fat": 지방g(숫자),
    "ingredients": [
      {"name": "재료명", "amount": "수량"},
      ...
    ],
    "steps": [
      {"step_num": 1, "text": "조리 단계 설명"},
      ...
    ],
    "tags": ["태그1", "태그2", "태그3"]
  },
  "lunch": { ... 위와 동일한 구조 ... },
  "dinner": { ... 위와 동일한 구조 ... },
  "total_calories": 총_칼로리(숫자 - ${userInfo.daily_calorie}kcal 이내),
  "ai_reason": "이 식단을 추천한 이유 (한국어로 1-2문장)"
}

**절대 준수**: 
- 매번 완전히 다른 창의적인 레시피를 생성하세요
- 실제 조리 가능한 구체적인 재료와 단계를 포함하세요
- **영양소 수치는 정확하게 계산하고 칼로리 목표를 반드시 지키세요**
- total_calories는 breakfast + lunch + dinner의 합계여야 합니다`

    const prompt = `${systemPrompt}\n\n${userPrompt}`
    
    console.log('📤 [RECOMMENDATIONS API] Gemini에 요청 전송 중...')
    console.log('📏 [RECOMMENDATIONS API] 프롬프트 길이:', prompt.length, '자')
    
    const result = await model.generateContent(prompt)
    const geminiResponse = result.response

    console.log('✅ [RECOMMENDATIONS API] Gemini API 응답 받음')
    
    // candidates 상세 정보 로깅
    if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
      const candidate = geminiResponse.candidates[0]
      console.log('🔍 [RECOMMENDATIONS API] Candidate 정보:', {
        finishReason: candidate.finishReason,
        hasSafetyRatings: !!candidate.safetyRatings,
        hasContent: !!candidate.content,
        contentPartsLength: candidate.content?.parts?.length || 0,
      })
      
      if (candidate.safetyRatings) {
        console.log('⚠️ [RECOMMENDATIONS API] Safety Ratings:', candidate.safetyRatings)
      }
      
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.log('⚠️ [RECOMMENDATIONS API] 비정상 종료:', candidate.finishReason)
      }
    }
    
    console.log('🤖 [RECOMMENDATIONS API] 사용된 토큰:', {
      promptTokens: result.response.usageMetadata?.promptTokenCount,
      candidatesTokens: result.response.usageMetadata?.candidatesTokenCount,
      totalTokens: result.response.usageMetadata?.totalTokenCount,
    })

    // 10. AI 응답 파싱
    let aiResponse
    try {
      aiResponse = geminiResponse.text()
      console.log('📝 [RECOMMENDATIONS API] AI 응답 텍스트 추출 성공')
      console.log('📏 [RECOMMENDATIONS API] 응답 길이:', aiResponse?.length || 0, '자')
    } catch (textError) {
      console.error('❌ [RECOMMENDATIONS API] text() 호출 실패:', textError)
      console.log('🔍 [RECOMMENDATIONS API] candidates:', geminiResponse.candidates)
      
      // candidates에서 직접 텍스트 추출 시도
      if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
        const firstCandidate = geminiResponse.candidates[0]
        console.log('🔍 [RECOMMENDATIONS API] 첫 번째 candidate:', firstCandidate)
        
        if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
          aiResponse = firstCandidate.content.parts[0].text
          console.log('✅ [RECOMMENDATIONS API] candidate에서 텍스트 추출 성공')
        }
      }
    }
    
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.error('❌ [RECOMMENDATIONS API] AI 응답이 비어있습니다')
      console.error('❌ [RECOMMENDATIONS API] 전체 응답 객체:', JSON.stringify(geminiResponse, null, 2))
      return NextResponse.json(
        { 
          error: 'AI 추천 생성에 실패했습니다',
          details: 'Empty AI response',
          debugInfo: {
            hasResponse: !!geminiResponse,
            hasCandidates: !!(geminiResponse.candidates && geminiResponse.candidates.length > 0),
            responseKeys: geminiResponse ? Object.keys(geminiResponse) : []
          }
        },
        { status: 500 }
      )
    }

    console.log('📝 [RECOMMENDATIONS API] AI 응답 원본 (첫 200자):', aiResponse.substring(0, 200))

    let aiRecommendation
    try {
      aiRecommendation = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('❌ [RECOMMENDATIONS API] AI 응답 파싱 실패:', parseError)
      return NextResponse.json(
        { 
          error: 'AI 응답 처리에 실패했습니다',
          details: 'Failed to parse AI response'
        },
        { status: 500 }
      )
    }

    console.log('✅ [RECOMMENDATIONS API] AI 추천 파싱 완료:', aiRecommendation)

    // 11. AI가 생성한 레시피를 배열로 변환
    const generatedRecipes = [
      {
        id: `ai-breakfast-${requestId}`,
        title: aiRecommendation.breakfast.title,
        thumbnail_url: null,
        calories: aiRecommendation.breakfast.calories,
        protein: aiRecommendation.breakfast.protein,
        carb: aiRecommendation.breakfast.carb,
        fat: aiRecommendation.breakfast.fat,
        tags: aiRecommendation.breakfast.tags || [],
        ingredients: aiRecommendation.breakfast.ingredients || [],
        steps: aiRecommendation.breakfast.steps || [],
        created_at: new Date().toISOString(),
      },
      {
        id: `ai-lunch-${requestId}`,
        title: aiRecommendation.lunch.title,
        thumbnail_url: null,
        calories: aiRecommendation.lunch.calories,
        protein: aiRecommendation.lunch.protein,
        carb: aiRecommendation.lunch.carb,
        fat: aiRecommendation.lunch.fat,
        tags: aiRecommendation.lunch.tags || [],
        ingredients: aiRecommendation.lunch.ingredients || [],
        steps: aiRecommendation.lunch.steps || [],
        created_at: new Date().toISOString(),
      },
      {
        id: `ai-dinner-${requestId}`,
        title: aiRecommendation.dinner.title,
        thumbnail_url: null,
        calories: aiRecommendation.dinner.calories,
        protein: aiRecommendation.dinner.protein,
        carb: aiRecommendation.dinner.carb,
        fat: aiRecommendation.dinner.fat,
        tags: aiRecommendation.dinner.tags || [],
        ingredients: aiRecommendation.dinner.ingredients || [],
        steps: aiRecommendation.dinner.steps || [],
        created_at: new Date().toISOString(),
      },
    ]

    console.log('✅ [RECOMMENDATIONS API] AI가 생성한 레시피:', {
      count: generatedRecipes.length,
      totalCalories: aiRecommendation.total_calories,
      ai_reason: aiRecommendation.ai_reason,
      recipes: generatedRecipes.map(r => ({
        id: r.id,
        title: r.title,
        calories: r.calories,
        protein: r.protein,
        carb: r.carb,
        fat: r.fat
      }))
    })

    const apiResponse = {
      recommendations: generatedRecipes,
      totalCalories: aiRecommendation.total_calories,
      ai_reason: aiRecommendation.ai_reason,
    }
    
    console.log('✅ [RECOMMENDATIONS API] Response 전송')
    return NextResponse.json(apiResponse)
    
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS API] AI 식단 추천 중 오류:', error)
    console.error('❌ [RECOMMENDATIONS API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Clerk 인증 에러인 경우
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          error: '로그인이 필요합니다.',
          details: 'Authentication required'
        },
        { status: 401 }
      )
    }

    // Gemini API 에러인 경우
    if (error instanceof Error && (error.message.includes('API') || error.message.includes('quota') || error.message.includes('rate limit'))) {
      console.error('❌ [RECOMMENDATIONS API] Gemini API 에러')
      return NextResponse.json(
        {
          error: 'AI 추천 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          details: error.message
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
