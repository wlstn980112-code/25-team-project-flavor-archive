import { auth, currentUser } from '@clerk/nextjs/server'

/**
 * 현재 로그인한 사용자의 Clerk User ID를 가져옵니다.
 * @returns Clerk User ID 또는 null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * 현재 로그인한 사용자의 Clerk User ID를 가져오고, 없으면 에러를 발생시킵니다.
 * @returns Clerk User ID
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.error('❌ Authentication required but user not found')
    throw new Error('Unauthorized')
  }
  
  console.log('✅ User authenticated:', userId)
  return userId
}

/**
 * 현재 로그인한 사용자의 전체 정보를 가져옵니다.
 * @returns Clerk User 객체
 * @throws Error if not authenticated
 */
export async function requireUser() {
  const user = await currentUser()
  
  if (!user) {
    console.error('❌ Authentication required but user not found')
    throw new Error('Unauthorized')
  }
  
  console.log('✅ User authenticated:', user.id, user.emailAddresses[0]?.emailAddress)
  return user
}

