import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Supabase 클라이언트 생성 (클라이언트 사이드)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// 로그: Supabase 클라이언트 초기화 완료
console.log('✅ Supabase client initialized')

