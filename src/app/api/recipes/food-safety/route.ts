import { NextRequest, NextResponse } from 'next/server'
import { getMfdsRecipeList } from '@/lib/mfds-recipe-api'
import { transformFoodSafetyRecipes } from '@/lib/utils/food-safety-transform'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/recipes/food-safety
 * 식약처 API에서 레시피를 가져와서 Recipe 타입으로 변환하여 반환합니다.
 */
export async function GET(req: NextRequest) {
  console.log('🏛️ [FOOD SAFETY API] 식약처 API 호출 시작')

  try {
    // 환경 변수 확인
    if (!process.env.NEXT_PUBLIC_MFDS_API_KEY) {
      console.error('❌ [FOOD SAFETY API] API 키가 설정되지 않았습니다')
      return NextResponse.json(
        {
          success: false,
          error: '식약처 API 키가 설정되지 않았습니다.',
          recipes: [],
        },
        { status: 500 }
      )
    }

    // 쿼리 파라미터 파싱
    const searchParams = req.nextUrl.searchParams
    const start = parseInt(searchParams.get('start') || '1', 10)
    const end = parseInt(searchParams.get('end') || '100', 10)
    const maxRecipes = parseInt(searchParams.get('maxRecipes') || '500', 10)

    console.log('🏛️ [FOOD SAFETY API] 요청 파라미터:', { start, end, maxRecipes })

    const batchSize = 100
    let recipeList: any[] = []

    // 여러 배치로 나누어 순차적으로 요청
    for (
      let batchStart = start;
      batchStart <= Math.min(end, maxRecipes);
      batchStart += batchSize
    ) {
      const batchEnd = Math.min(
        batchStart + batchSize - 1,
        Math.min(end, maxRecipes)
      )
      console.log(
        `🏛️ [FOOD SAFETY API] 배치 요청: ${batchStart} ~ ${batchEnd}`
      )

      try {
        const batch = await getMfdsRecipeList(batchStart, batchEnd)
        recipeList = [...recipeList, ...batch]

        // 배치 결과가 비어있으면 더 이상 데이터가 없음
        if (batch.length === 0) {
          console.log(
            `🏛️ [FOOD SAFETY API] ${batchStart}번째부터 데이터가 없어 요청 중단`
          )
          break
        }
      } catch (err) {
        console.error(
          `❌ [FOOD SAFETY API] 배치 ${batchStart}-${batchEnd} 요청 실패:`,
          err
        )
        // 일부 배치 실패해도 계속 진행
        break
      }
    }

    console.log(
      '✅ [FOOD SAFETY API] 레시피 목록 로딩 완료:',
      recipeList.length,
      '개'
    )

    // 식약처 API 데이터를 Recipe 타입으로 변환
    const transformedRecipes = transformFoodSafetyRecipes(recipeList)

    console.log(
      '✅ [FOOD SAFETY API] 데이터 변환 완료:',
      transformedRecipes.length,
      '개'
    )

    return NextResponse.json({
      success: true,
      recipes: transformedRecipes,
      totalCount: transformedRecipes.length,
    })
  } catch (error) {
    console.error('❌ [FOOD SAFETY API] 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '식약처 API 호출 중 오류가 발생했습니다.',
        recipes: [],
        totalCount: 0,
      },
      { status: 500 }
    )
  }
}

