'use client'

import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import type { Recipe } from '@/types/recipe.types'

interface RecommendationResponse {
  recommendations: Recipe[]
  totalCalories: number
  ai_reason?: string
}

interface ErrorResponse {
  error: string
  details?: string
}

/**
 * 식단 추천을 요청합니다.
 */
export function useRecommendations() {
  return useMutation<RecommendationResponse, Error>({
    mutationFn: async () => {
      console.log('🔍 [useRecommendations] 식단 추천 요청 시작...')
      console.log('🔍 [useRecommendations] API URL: /api/recommendations')
      console.log('🔍 [useRecommendations] Current path:', window.location.pathname)

      try {
        const response = await axios.post<RecommendationResponse>(
          '/api/recommendations',
          {},
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        console.log('✅ [useRecommendations] 추천 받기 성공')
        console.log('✅ [useRecommendations] Response:', response.data)
        console.log('✅ [useRecommendations] Status:', response.status)
        
        return response.data
      } catch (error) {
        console.error('❌ [useRecommendations] 추천 받기 실패')
        
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ErrorResponse>
          console.error('❌ [useRecommendations] Axios Error:', {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            message: axiosError.message,
          })
          
          // 서버에서 온 에러 메시지 사용
          if (axiosError.response?.data?.error) {
            throw new Error(axiosError.response.data.error)
          }
          
          // 상태 코드에 따른 에러 메시지
          if (axiosError.response?.status === 404) {
            throw new Error('API를 찾을 수 없습니다. 페이지를 새로고침 해주세요.')
          } else if (axiosError.response?.status === 401) {
            throw new Error('로그인이 필요합니다.')
          } else if (axiosError.response?.status === 500) {
            throw new Error('서버 오류가 발생했습니다.')
          }
        }
        
        console.error('❌ [useRecommendations] Unknown error:', error)
        throw error
      }
    },
  })
}

