'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface DebugInfo {
  clerk: {
    isLoaded: boolean
    isSignedIn: boolean
    userId: string | null
    email: string | null
  }
  api: {
    profileStatus: 'loading' | 'success' | 'error'
    profileData: any
    profileError: string | null
    recommendationsStatus: 'loading' | 'success' | 'error' | 'idle'
    recommendationsData: any
    recommendationsError: string | null
    envCheckStatus: 'loading' | 'success' | 'error' | 'idle'
    envCheckData: any
    envCheckError: string | null
  }
}

export default function DebugPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    clerk: {
      isLoaded: false,
      isSignedIn: false,
      userId: null,
      email: null,
    },
    api: {
      profileStatus: 'loading',
      profileData: null,
      profileError: null,
      recommendationsStatus: 'idle',
      recommendationsData: null,
      recommendationsError: null,
      envCheckStatus: 'idle',
      envCheckData: null,
      envCheckError: null,
    },
  })

  useEffect(() => {
    console.log('🐛 [Debug Page] 초기화')
    
    // Clerk 정보 업데이트
    setDebugInfo((prev) => ({
      ...prev,
      clerk: {
        isLoaded,
        isSignedIn: isSignedIn || false,
        userId: user?.id || null,
        email: user?.emailAddresses?.[0]?.emailAddress || null,
      },
    }))

    // 환경 변수 체크 (인증 불필요)
    testEnvCheck()

    // 프로필 API 테스트
    if (isLoaded && isSignedIn) {
      testProfileAPI()
    }
  }, [isLoaded, isSignedIn, user])

  const testProfileAPI = async () => {
    console.log('🔍 [Debug Page] 프로필 API 테스트 시작')
    
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      console.log('📥 [Debug Page] 프로필 응답:', { status: response.status, data })
      
      setDebugInfo((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          profileStatus: response.ok ? 'success' : 'error',
          profileData: data,
          profileError: response.ok ? null : (data.error || 'Unknown error'),
        },
      }))
    } catch (error) {
      console.error('❌ [Debug Page] 프로필 API 오류:', error)
      
      setDebugInfo((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          profileStatus: 'error',
          profileError: error instanceof Error ? error.message : 'Network error',
        },
      }))
    }
  }

  const testEnvCheck = async () => {
    console.log('🔍 [Debug Page] 환경 변수 체크 시작')
    
    setDebugInfo((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        envCheckStatus: 'loading',
      },
    }))
    
    try {
      const response = await fetch('/api/debug/env-check')
      const data = await response.json()
      
      console.log('📥 [Debug Page] 환경 변수 체크 응답:', { status: response.status, data })
      
      setDebugInfo((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          envCheckStatus: response.ok ? 'success' : 'error',
          envCheckData: data,
          envCheckError: response.ok ? null : (data.error || 'Unknown error'),
        },
      }))
    } catch (error) {
      console.error('❌ [Debug Page] 환경 변수 체크 오류:', error)
      
      setDebugInfo((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          envCheckStatus: 'error',
          envCheckError: error instanceof Error ? error.message : 'Network error',
        },
      }))
    }
  }

  const testRecommendationsAPI = async () => {
    console.log('🔍 [Debug Page] 추천 API 테스트 시작')
    
    setDebugInfo((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        recommendationsStatus: 'loading',
      },
    }))
    
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      console.log('📥 [Debug Page] 추천 응답:', { status: response.status, data })
      
      setDebugInfo((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          recommendationsStatus: response.ok ? 'success' : 'error',
          recommendationsData: data,
          recommendationsError: response.ok ? null : (data.error || 'Unknown error'),
        },
      }))
    } catch (error) {
      console.error('❌ [Debug Page] 추천 API 오류:', error)
      
      setDebugInfo((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          recommendationsStatus: 'error',
          recommendationsError: error instanceof Error ? error.message : 'Network error',
        },
      }))
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🐛 디버그 정보</h1>

      {/* Clerk 정보 */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🔐 Clerk 인증</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="text-gray-600">Loaded:</span>{' '}
            <span className={debugInfo.clerk.isLoaded ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.clerk.isLoaded ? '✓' : '✗'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Signed In:</span>{' '}
            <span className={debugInfo.clerk.isSignedIn ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.clerk.isSignedIn ? '✓' : '✗'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">User ID:</span>{' '}
            <span className="text-gray-800">{debugInfo.clerk.userId || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>{' '}
            <span className="text-gray-800">{debugInfo.clerk.email || 'N/A'}</span>
          </div>
        </div>
      </section>

      {/* 환경 변수 체크 */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">⚙️ 환경 변수 체크</h2>
        <div className="mb-4">
          <button
            onClick={testEnvCheck}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            환경 변수 재체크
          </button>
        </div>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="text-gray-600">Status:</span>{' '}
            <span
              className={
                debugInfo.api.envCheckStatus === 'success'
                  ? 'text-green-600'
                  : debugInfo.api.envCheckStatus === 'error'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }
            >
              {debugInfo.api.envCheckStatus}
            </span>
          </div>
          {debugInfo.api.envCheckError && (
            <div>
              <span className="text-gray-600">Error:</span>{' '}
              <span className="text-red-600">{debugInfo.api.envCheckError}</span>
            </div>
          )}
          {debugInfo.api.envCheckData?.envCheck && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold mb-2">🔐 Clerk</p>
                <div className="pl-4 space-y-1 text-xs">
                  <div>Publishable Key: {debugInfo.api.envCheckData.envCheck.clerk.publishableKey ? '✅' : '❌'}</div>
                  <div>Secret Key: {debugInfo.api.envCheckData.envCheck.clerk.secretKey ? '✅' : '❌'}</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold mb-2">🗄️ Supabase</p>
                <div className="pl-4 space-y-1 text-xs">
                  <div>URL: {debugInfo.api.envCheckData.envCheck.supabase.url ? '✅' : '❌'}</div>
                  <div>Anon Key: {debugInfo.api.envCheckData.envCheck.supabase.anonKey ? '✅' : '❌'}</div>
                  <div>Service Role Key: {debugInfo.api.envCheckData.envCheck.supabase.serviceRoleKey ? '✅' : '❌'}</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold mb-2">🤖 Gemini AI</p>
                <div className="pl-4 space-y-1 text-xs">
                  <div>API Key: {debugInfo.api.envCheckData.envCheck.gemini.apiKey ? '✅' : '❌'}</div>
                </div>
              </div>
              <div className={`p-3 rounded ${debugInfo.api.envCheckData.envCheck.summary.allSet ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="font-semibold">
                  {debugInfo.api.envCheckData.envCheck.summary.allSet ? '✅ 모든 환경 변수가 설정됨' : '❌ 일부 환경 변수가 누락됨'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 프로필 API */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">👤 프로필 API</h2>
        <div className="mb-4">
          <button
            onClick={testProfileAPI}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            프로필 API 재테스트
          </button>
        </div>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="text-gray-600">Status:</span>{' '}
            <span
              className={
                debugInfo.api.profileStatus === 'success'
                  ? 'text-green-600'
                  : debugInfo.api.profileStatus === 'error'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }
            >
              {debugInfo.api.profileStatus}
            </span>
          </div>
          {debugInfo.api.profileError && (
            <div>
              <span className="text-gray-600">Error:</span>{' '}
              <span className="text-red-600">{debugInfo.api.profileError}</span>
            </div>
          )}
          {debugInfo.api.profileData && (
            <div>
              <span className="text-gray-600">Data:</span>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo.api.profileData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* 추천 API */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🍽️ 추천 API</h2>
        <div className="mb-4">
          <button
            onClick={testRecommendationsAPI}
            disabled={debugInfo.api.recommendationsStatus === 'loading'}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {debugInfo.api.recommendationsStatus === 'loading'
              ? '테스트 중...'
              : '추천 API 테스트'}
          </button>
        </div>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="text-gray-600">Status:</span>{' '}
            <span
              className={
                debugInfo.api.recommendationsStatus === 'success'
                  ? 'text-green-600'
                  : debugInfo.api.recommendationsStatus === 'error'
                  ? 'text-red-600'
                  : debugInfo.api.recommendationsStatus === 'loading'
                  ? 'text-yellow-600'
                  : 'text-gray-600'
              }
            >
              {debugInfo.api.recommendationsStatus}
            </span>
          </div>
          {debugInfo.api.recommendationsError && (
            <div>
              <span className="text-gray-600">Error:</span>{' '}
              <span className="text-red-600">{debugInfo.api.recommendationsError}</span>
            </div>
          )}
          {debugInfo.api.recommendationsData && (
            <div>
              <span className="text-gray-600">Data:</span>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo.api.recommendationsData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* 도움말 */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2">💡 문제 해결 가이드</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            ✓ <strong>프로필이 없는 경우:</strong> /onboarding 페이지에서 프로필을 먼저
            설정해주세요.
          </li>
          <li>
            ✓ <strong>인증 오류:</strong> 로그아웃 후 다시 로그인해보세요.
          </li>
          <li>
            ✓ <strong>404 에러:</strong> 프로필이 없거나 API 경로가 잘못되었을 수 있습니다.
          </li>
          <li>
            ✓ <strong>500 에러:</strong> 서버 오류입니다. 콘솔 로그를 확인하세요.
          </li>
          <li>
            ✓ <strong>환경 변수 누락:</strong> Vercel 대시보드에서 환경 변수를 설정하고 재배포하세요.
          </li>
          <li>
            ✓ <strong>GEMINI_API_KEY 없음:</strong>{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
            에서 API 키를 발급받으세요.
          </li>
        </ul>
      </section>
    </div>
  )
}

