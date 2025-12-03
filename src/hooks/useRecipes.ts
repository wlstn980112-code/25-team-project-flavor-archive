'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import axios from 'axios'
import type { Recipe } from '@/types/recipe.types'

/**
 * 모든 레시피를 가져옵니다 (Supabase + 식약처 API).
 */
export function useRecipes() {
  return useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      console.log('🔍 Fetching all recipes (Supabase + 식약처 API)...')

      // 1. Supabase에서 레시피 가져오기
      const { data: dbRecipes, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching recipes from Supabase:', error)
        throw error
      }

      console.log(`✅ Fetched ${dbRecipes?.length || 0} recipes from Supabase`)

      // 2. 식약처 API에서 레시피 가져오기 (최대 500개)
      let foodSafetyRecipes: Recipe[] = []
      try {
        console.log('🏛️ Fetching recipes from 식약처 API...')
        const response = await axios.get('/api/recipes/food-safety', {
          params: {
            start: 1,
            end: 500,
            maxRecipes: 500, // 최대 500개까지 가져오기
          },
        })

        if (response.data.success && response.data.recipes) {
          foodSafetyRecipes = response.data.recipes
          console.log(
            `✅ Fetched ${foodSafetyRecipes.length} recipes from 식약처 API`
          )
        } else {
          console.warn('⚠️ 식약처 API 응답이 예상과 다릅니다:', response.data)
        }
      } catch (foodSafetyError) {
        console.error('❌ Error fetching from 식약처 API:', foodSafetyError)
        // 식약처 API 실패 시 Supabase 레시피만 반환 (에러를 throw하지 않음)
        console.log('⚠️ 식약처 API 실패, Supabase 레시피만 반환합니다')
      }

      // 3. 두 소스의 레시피 병합
      const allRecipes = [
        ...(dbRecipes as unknown as Recipe[]),
        ...foodSafetyRecipes,
      ]

      console.log(`✅ Total ${allRecipes.length} recipes combined`)
      return allRecipes
    },
  })
}

/**
 * 특정 레시피를 ID로 가져옵니다.
 * 식약처 API 레시피인 경우 (food-safety-로 시작) API에서 가져옵니다.
 */
export function useRecipe(id: string) {
  return useQuery<Recipe | null>({
    queryKey: ['recipe', id],
    queryFn: async () => {
      console.log('🔍 Fetching recipe:', id)

      // 식약처 API 레시피인 경우 (food-safety-로 시작)
      if (id.startsWith('food-safety-')) {
        console.log('🏛️ 식약처 API 레시피 조회:', id)
        try {
          // 식약처 API에서 모든 레시피를 가져와서 해당 ID 찾기
          const response = await axios.get('/api/recipes/food-safety', {
            params: {
              start: 1,
              end: 500,
              maxRecipes: 500,
            },
          })

          if (response.data.success && response.data.recipes) {
            const recipe = response.data.recipes.find(
              (r: Recipe) => r.id === id
            )
            if (recipe) {
              console.log('✅ 식약처 API 레시피 조회 성공:', recipe.title)
              return recipe
            }
          }
          console.warn('⚠️ 식약처 API 레시피를 찾을 수 없습니다:', id)
          return null
        } catch (error) {
          console.error('❌ Error fetching recipe from 식약처 API:', error)
          return null
        }
      }

      // Supabase 레시피인 경우
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error fetching recipe from Supabase:', error)
        return null
      }

      console.log('✅ Recipe fetched successfully from Supabase')
      return data as unknown as Recipe
    },
    enabled: !!id,
  })
}

