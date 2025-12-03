'use client'

import { useRecipe } from '@/hooks/useRecipes'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Clock, Users, ChefHat } from 'lucide-react'
import type { Ingredient, Step } from '@/types/recipe.types'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { data: recipe, isLoading, error } = useRecipe(recipeId)

  console.log('📖 Recipe detail page loaded, ID:', recipeId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (error || !recipe) {
    console.error('❌ Error loading recipe:', error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">레시피를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.push('/recipes')}
          className="text-orange-500 hover:underline"
        >
          레시피 목록으로 돌아가기
        </button>
      </div>
    )
  }

  // JSON 파싱 (이미 파싱되어 있을 수도 있음)
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients as Ingredient[]
    : []
  const steps = Array.isArray(recipe.steps) 
    ? recipe.steps as Step[]
    : []
  const tags = Array.isArray(recipe.tags) ? recipe.tags as string[] : []

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>뒤로가기</span>
      </button>

      {/* 썸네일 이미지 */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-orange-100 to-orange-200">
        {recipe.thumbnail_url ? (
          <img
            src={recipe.thumbnail_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-orange-400 text-9xl">
            🍽️
          </div>
        )}
      </div>

      {/* 제목 & 기본 정보 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {recipe.title}
        </h1>

        {/* 영양소 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {recipe.calories}
              </div>
              <div className="text-sm text-gray-600">칼로리 (kcal)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {recipe.protein}g
              </div>
              <div className="text-sm text-gray-600">단백질</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {recipe.carb}g
              </div>
              <div className="text-sm text-gray-600">탄수화물</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {recipe.fat}g
              </div>
              <div className="text-sm text-gray-600">지방</div>
            </div>
          </div>
        </div>
      </div>

      {/* 태그 */}
      {tags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 재료 섹션 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <ChefHat className="w-6 h-6 text-orange-500" />
          <span>재료</span>
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {ingredients.length > 0 ? (
            <ul className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-gray-800">
                    {ingredient.name}
                  </span>
                  <span className="text-gray-600">{ingredient.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">재료 정보가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 조리 과정 섹션 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Clock className="w-6 h-6 text-orange-500" />
          <span>조리 과정</span>
        </h2>
        <div className="space-y-4">
          {steps.length > 0 ? (
            steps
              .sort((a, b) => a.step_num - b.step_num)
              .map((step) => (
                <div
                  key={step.step_num}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      {step.step_num}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-500">조리 과정 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 액션 */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/recipes')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            다른 레시피 보기
          </button>
        </div>
      </div>
    </div>
  )
}

