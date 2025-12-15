/**
 * 식약처 API 데이터를 Recipe 타입으로 변환하는 유틸리티
 */

import type { Recipe, Ingredient, Step } from '@/types/recipe.types'
import type { RecipeItem } from '@/lib/mfds-recipe-api'
import {
  parseNutritionInfo,
  getCookingSteps,
  parseHashTags,
  parseIngredients,
} from '@/lib/mfds-recipe-api'

/**
 * 식약처 API의 RecipeItem을 flavor-archive의 Recipe 타입으로 변환합니다.
 * @param foodSafetyData 식약처 API 응답 데이터
 * @returns Recipe 타입 객체
 */
export function transformFoodSafetyToRecipe(foodSafetyData: RecipeItem): Recipe {
  console.log('🔄 [데이터 변환] 식약처 API 데이터를 Recipe 타입으로 변환:', foodSafetyData.RCP_NM)

  // 영양 정보 파싱
  const nutrition = parseNutritionInfo(foodSafetyData)

  // 조리 과정 파싱
  const cookingSteps = getCookingSteps(foodSafetyData)

  // 해시태그 파싱
  const hashTags = parseHashTags(foodSafetyData)

  // 재료 파싱
  const ingredientsList = parseIngredients(foodSafetyData)

  // 재료를 Ingredient 타입으로 변환
  const ingredients: Ingredient[] = ingredientsList.map((ingredient) => {
    // 재료명과 양을 분리 (예: "돼지고기 200g" -> name: "돼지고기", amount: "200g")
    const parts = ingredient.split(/\s+(.+)/)
    if (parts.length >= 2) {
      return {
        name: parts[0].trim(),
        amount: parts[1].trim(),
      }
    }
    return {
      name: ingredient.trim(),
      amount: '',
    }
  })

  // 조리 과정을 Step 타입으로 변환
  const steps: Step[] = cookingSteps.map((step) => ({
    step_num: step.step,
    text: step.description,
  }))

  // 썸네일 URL 결정 (대표 이미지 우선, 없으면 첫 번째 조리 과정 이미지)
  const thumbnailUrl =
    foodSafetyData.ATT_FILE_NO_MAIN ||
    foodSafetyData.ATT_FILE_NO_MK ||
    cookingSteps[0]?.imageUrl ||
    null

  const recipe: Recipe = {
    id: `food-safety-${foodSafetyData.RCP_SEQ}`,
    title: foodSafetyData.RCP_NM,
    thumbnail_url: thumbnailUrl,
    calories: Math.round(nutrition.calories),
    protein: Math.round(nutrition.protein * 10) / 10, // 소수점 첫째자리까지
    carb: Math.round(nutrition.carbohydrate * 10) / 10,
    fat: Math.round(nutrition.fat * 10) / 10,
    cooking_time: undefined, // 식약처 API에는 조리 시간 정보가 없음
    tags: hashTags.length > 0 ? hashTags : null,
    ingredients,
    steps,
    created_at: new Date().toISOString(),
  }

  console.log('✅ [데이터 변환] 변환 완료:', {
    id: recipe.id,
    title: recipe.title,
    ingredientsCount: recipe.ingredients.length,
    stepsCount: recipe.steps.length,
    tagsCount: recipe.tags?.length || 0,
  })

  return recipe
}

/**
 * 여러 식약처 API 레시피를 한 번에 변환합니다.
 * @param foodSafetyDataList 식약처 API 응답 데이터 배열
 * @returns Recipe 타입 배열
 */
export function transformFoodSafetyRecipes(
  foodSafetyDataList: RecipeItem[]
): Recipe[] {
  console.log('🔄 [데이터 변환] 여러 레시피 변환 시작:', foodSafetyDataList.length, '개')

  const recipes = foodSafetyDataList.map((data) =>
    transformFoodSafetyToRecipe(data)
  )

  console.log('✅ [데이터 변환] 모든 레시피 변환 완료:', recipes.length, '개')

  return recipes
}














