'use client'

import { useUser } from '@clerk/nextjs'
import { useUserProfile } from '@/hooks/useUser'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Sparkles, ArrowRight, Loader2, ChefHat, RefreshCw, Eye } from 'lucide-react'
import type { Recipe } from '@/types/recipe.types'
import Link from 'next/link'

const RECOMMENDATIONS_STORAGE_KEY = 'current-recommendations'

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const { data: profile, isLoading: profileLoading } = useUserProfile()
  const router = useRouter()
  const { mutate: getRecommendations, isPending } = useRecommendations()
  const [recommendations, setRecommendations] = useState<Recipe[] | null>(null)

  // 로그: 페이지 로드
  useEffect(() => {
    console.log('🏠 Home page loaded')
    if (user) {
      console.log('👤 User:', user.firstName || user.emailAddresses[0]?.emailAddress)
    }
  }, [user])

  // 로그인한 사용자이지만 프로필이 없으면 온보딩으로 리다이렉트
  useEffect(() => {
    if (isLoaded && user && !profileLoading && !profile) {
      console.log('⚠️ No profile found, redirecting to onboarding...')
      router.push('/onboarding')
    }
  }, [isLoaded, user, profile, profileLoading, router])

  // 저장된 추천 복원 함수
  const restoreRecommendations = useCallback(() => {
    console.log('🔍 [Home Page] Checking for saved recommendations...')
    
    // sessionStorage에서 저장된 추천 확인
    const savedRecommendations = sessionStorage.getItem(RECOMMENDATIONS_STORAGE_KEY)
    
    if (savedRecommendations) {
      try {
        const parsed = JSON.parse(savedRecommendations)
        console.log('✅ [Home Page] Restored saved recommendations:', parsed)
        
        // 추천 데이터가 유효한지 확인
        if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
          setRecommendations(parsed.recommendations)
          return true
        } else {
          console.warn('⚠️ [Home Page] Saved recommendations are invalid')
        }
      } catch (error) {
        console.error('❌ [Home Page] Failed to parse saved recommendations:', error)
      }
    }
    
    return false
  }, [])

  // 현재 상태를 sessionStorage에 저장하는 함수
  const saveCurrentState = useCallback(() => {
    if (recommendations && recommendations.length > 0) {
      console.log('💾 [Home Page] Saving current state to sessionStorage')
      sessionStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify({
        recommendations,
        timestamp: Date.now()
      }))
      
      // AI가 생성한 개별 레시피를 sessionStorage에 저장 (상세 페이지용)
      recommendations.forEach((recipe) => {
        if (recipe.id.startsWith('ai-')) {
          sessionStorage.setItem(`recipe-${recipe.id}`, JSON.stringify(recipe))
          console.log(`💾 [Home Page] Saved recipe: ${recipe.id}`)
        }
      })
    }
  }, [recommendations])

  // 초기 로드 시: 저장된 추천이 있으면 복원
  useEffect(() => {
    const restored = restoreRecommendations()
    if (restored) {
      console.log('✅ [Home Page] Recommendations restored from sessionStorage')
    }
  }, [restoreRecommendations])

  // 상태가 변경될 때마다 저장
  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      saveCurrentState()
    }
  }, [recommendations, saveCurrentState])

  // 페이지가 다시 포커스를 받을 때 (뒤로가기 등) 저장된 추천 복원
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ [Home Page] Page became visible, checking for saved recommendations...')
        // 현재 추천이 없을 때만 복원 시도
        if (!recommendations || recommendations.length === 0) {
          restoreRecommendations()
        }
      }
    }

    const handleFocus = () => {
      console.log('🎯 [Home Page] Page focused, checking for saved recommendations...')
      // 현재 추천이 없을 때만 복원 시도
      if (!recommendations || recommendations.length === 0) {
        restoreRecommendations()
      }
    }

    // 페이지 언마운트 시 현재 상태 저장
    const handleBeforeUnload = () => {
      console.log('🚪 [Home Page] Page unloading, saving state...')
      saveCurrentState()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      console.log('🧹 [Home Page] Cleaning up, saving state...')
      saveCurrentState()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [recommendations, restoreRecommendations, saveCurrentState])

  const handleGetRecommendations = () => {
    // 로그인 체크
    if (!user) {
      console.log('⚠️ User not logged in, redirecting to sign-in...')
      alert('로그인이 필요한 서비스입니다.')
      router.push('/sign-in')
      return
    }

    // 프로필 체크
    if (!profile) {
      console.log('⚠️ Profile not found, redirecting to onboarding...')
      alert('먼저 건강 정보를 입력해주세요.')
      router.push('/onboarding')
      return
    }

    console.log('🎯 Requesting recommendations...')
    
    getRecommendations(undefined, {
      onSuccess: (data) => {
        console.log('✅ [Home Page] Recommendations received:', data)
        setRecommendations(data.recommendations)
        
        // 전체 추천 데이터를 sessionStorage에 저장 (페이지 복원용)
        console.log('💾 [Home Page] Saving recommendations to sessionStorage')
        sessionStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify({
          recommendations: data.recommendations,
          totalCalories: data.totalCalories,
          ai_reason: data.ai_reason || '',
          timestamp: Date.now()
        }))
        
        // AI가 생성한 개별 레시피를 sessionStorage에 저장 (상세 페이지용)
        data.recommendations.forEach((recipe) => {
          if (recipe.id.startsWith('ai-')) {
            sessionStorage.setItem(`recipe-${recipe.id}`, JSON.stringify(recipe))
            console.log(`💾 [Home Page] Saved recipe: ${recipe.id}`)
          }
        })
      },
      onError: (error) => {
        console.error('❌ [Home Page] Error getting recommendations:', error)
        alert('추천을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.')
      },
    })
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // 로그인한 사용자의 표시 이름
  const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || '사용자'
  
  // 로그인 여부
  const isLoggedIn = !!user

  // 목표에 따른 조정된 칼로리 계산 (API와 동일한 로직)
  const getAdjustedCalorie = () => {
    if (!profile) return 0
    
    if (profile.goal === 'lose') {
      // 체중 감량: 1800~2000kcal 범위로 조정 (최소 1200kcal)
      const adjusted = Math.max(1200, Math.min(2000, Math.round(profile.daily_calorie * 0.65)))
      console.log('📉 [Home] 체중 감량 목표 - 칼로리 조정:', profile.daily_calorie, '→', adjusted)
      return adjusted
    } else if (profile.goal === 'gain') {
      // 체중 증량: 사용자 설정보다 10% 높게
      const adjusted = Math.round(profile.daily_calorie * 1.1)
      console.log('📈 [Home] 체중 증량 목표 - 칼로리 조정:', profile.daily_calorie, '→', adjusted)
      return adjusted
    }
    
    // 체중 유지: 원래 칼로리 그대로
    console.log('⚖️ [Home] 체중 유지 목표 - 칼로리 유지:', profile.daily_calorie)
    return profile.daily_calorie
  }

  const adjustedCalorie = getAdjustedCalorie()

  return (
    <div className="max-w-4xl mx-auto">
      {/* 환영 메시지 */}
      <div className="text-center mb-12">
        {isLoggedIn ? (
          <>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              안녕하세요, <span className="text-orange-500">{displayName}</span>님! 👋
            </h1>
            <p className="text-lg text-gray-600">
              오늘은 어떤 맛있는 식사를 준비해볼까요?
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              <span className="text-orange-500">AI 맞춤 식단</span>으로 건강을 관리하세요 🍽️
            </h1>
            <p className="text-lg text-gray-600">
              당신의 건강 목표에 맞춘 레시피를 추천해드립니다
            </p>
          </>
        )}
      </div>

      {/* 메인 액션 카드 */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-orange-100">
        {!recommendations ? (
          // 추천 받기 전
          <div className="flex flex-col items-center text-center">
            <div className="bg-orange-100 rounded-full p-6 mb-6">
              <Sparkles className="w-12 h-12 text-orange-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              오늘의 식단 추천받기
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-md">
              당신의 건강 목표에 맞춘 아침, 점심, 저녁 식단을 AI가 추천해드립니다.
            </p>

            {isLoggedIn && profile && (
              <div className="bg-orange-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
                <p>
                  목표: <strong>{profile.goal === 'lose' ? '체중 감량' : profile.goal === 'gain' ? '체중 증가' : '체중 유지'}</strong>
                </p>
                <p>
                  하루 목표 칼로리: <strong>{adjustedCalorie}kcal</strong>
                </p>
              </div>
            )}

            {!isLoggedIn && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
                <p className="text-center">
                  💡 로그인하면 당신만을 위한 맞춤 식단을 추천받을 수 있어요!
                </p>
              </div>
            )}

            <button
              onClick={handleGetRecommendations}
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold px-8 py-4 rounded-full flex items-center space-x-2 transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>추천 중...</span>
                </>
              ) : (
                <>
                  <span>추천받기</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : (
          // 추천 결과 표시
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                오늘의 추천 식단 🍽️
              </h2>
              <button
                onClick={() => {
                  console.log('🔄 [Home] 다시 추천받기')
                  setRecommendations(null)
                  handleGetRecommendations()
                }}
                disabled={isPending}
                className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isPending ? 'animate-spin' : ''}`} />
                <span>다시 추천받기</span>
              </button>
            </div>

            {/* 총 칼로리 */}
            <div className="bg-orange-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">총 칼로리</p>
              <p className="text-2xl font-bold text-orange-600">
                {recommendations.reduce((sum, recipe) => sum + (recipe.calories || 0), 0).toLocaleString()} kcal
              </p>
            </div>

            {/* 식사별 카드 */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {['아침', '점심', '저녁'].map((mealTime, index) => {
                const recipe = recommendations[index]
                if (!recipe) return null

                return (
                  <div
                    key={recipe.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="text-center mb-3">
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                        {mealTime}
                      </span>
                    </div>
                    
                    {recipe.thumbnail_url && (
                      <div className="mb-3 rounded-lg overflow-hidden bg-gray-200 h-32">
                        <img
                          src={recipe.thumbnail_url}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm line-clamp-2">
                      {recipe.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <span className="font-semibold text-orange-600">
                        {recipe.calories} kcal
                      </span>
                      {recipe.cooking_time && (
                        <span>🕐 {recipe.cooking_time}분</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-xs text-gray-600 mb-3">
                      <div className="text-center">
                        <p className="text-gray-500">단백질</p>
                        <p className="font-semibold">{recipe.protein}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">탄수화물</p>
                        <p className="font-semibold">{recipe.carb}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">지방</p>
                        <p className="font-semibold">{recipe.fat}g</p>
                      </div>
                    </div>

                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded-lg transition-colors"
                    >
                      자세히 보기
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/recommendations')}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span>상세 페이지로 이동</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 레시피 둘러보기 카드 */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <ChefHat className="w-10 h-10 mb-4" />
            <h3 className="text-2xl font-bold mb-2">레시피 둘러보기</h3>
            <p className="text-orange-100 mb-4">
              다양한 건강 레시피를 탐색하고 원하는 요리를 찾아보세요.
            </p>
            <button
              onClick={() => router.push('/recipes')}
              className="bg-white text-orange-500 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full flex items-center space-x-2 transition-all"
            >
              <span>레시피 보기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

