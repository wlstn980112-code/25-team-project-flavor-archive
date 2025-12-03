'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { UserProfile } from '@/types/user.types'

/**
 * 현재 로그인한 사용자의 Clerk 정보를 가져옵니다.
 */
export function useUser() {
  return useClerkUser()
}

/**
 * 현재 로그인한 사용자의 프로필 정보를 가져옵니다.
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

      console.log('🔍 Fetching user profile for:', user.id)

      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        return null
      }

      console.log('✅ User profile fetched successfully')
      return data as UserProfile
    },
    enabled: !!user?.id,
  })
}

