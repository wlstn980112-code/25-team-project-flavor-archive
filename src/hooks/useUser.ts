'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import type { UserProfile } from '@/types/user.types'

/**
 * 현재 로그인한 사용자의 Clerk 정보를 가져옵니다.
 */
export function useUser() {
  return useClerkUser()
}

/**
 * 현재 로그인한 사용자의 프로필 정보를 가져옵니다.
 * API route를 통해 안전하게 조회합니다.
 */
export function useUserProfile() {
  const { user } = useClerkUser()

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('⚠️ No user ID available for profile fetch')
        return null
      }

      console.log('🔍 Fetching user profile via API for:', user.id)

      try {
        const response = await fetch('/api/profile')
        
        if (!response.ok) {
          console.log('📝 Profile not found or error occurred')
          return null
        }

        const result = await response.json()
        
        if (result.profile) {
          console.log('✅ User profile fetched successfully')
          return result.profile as UserProfile
        }

        return null
      } catch (error) {
        console.error('❌ Error fetching user profile:', error)
        return null
      }
    },
    enabled: !!user?.id,
    retry: false, // 프로필이 없을 수 있으므로 재시도하지 않음
  })
}

