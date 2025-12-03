'use client'

import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import type { Recipe } from '@/types/recipe.types'

interface RecommendationResponse {
  recommendations: Recipe[]
  totalCalories: number
}

/**
 * 식단 추천을 요청합니다.
 */
export function useRecommendations() {
  return useMutation<RecommendationResponse, Error>({
    mutationFn: async () => {
      console.log('🔍 Requesting meal recommendations...')

      const response = await axios.post<RecommendationResponse>(
        '/api/recommendations'
      )

      console.log('✅ Recommendations received:', response.data)
      return response.data
    },
  })
}

