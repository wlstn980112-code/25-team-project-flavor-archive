'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Recipe } from '@/types/recipe.types'

/**
 * 모든 레시피를 가져옵니다.
 */
export function useRecipes() {
  return useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      console.log('🔍 Fetching all recipes...')

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching recipes:', error)
        throw error
      }

      console.log(`✅ Fetched ${data?.length || 0} recipes`)
      return data as unknown as Recipe[]
    },
  })
}

/**
 * 특정 레시피를 ID로 가져옵니다.
 */
export function useRecipe(id: string) {
  return useQuery<Recipe | null>({
    queryKey: ['recipe', id],
    queryFn: async () => {
      console.log('🔍 Fetching recipe:', id)

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error fetching recipe:', error)
        return null
      }

      console.log('✅ Recipe fetched successfully')
      return data as unknown as Recipe
    },
    enabled: !!id,
  })
}

