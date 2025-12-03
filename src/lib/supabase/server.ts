import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// 서버 사이드 Supabase 클라이언트 (Service Role Key 사용)
export function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// 로그: 서버 사이드 Supabase 클라이언트 생성 함수 준비 완료
console.log('✅ Server-side Supabase client factory ready')

