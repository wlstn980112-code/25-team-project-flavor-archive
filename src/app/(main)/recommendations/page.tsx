'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, ChefHat, Flame, Beef, Wheat, Droplet } from 'lucide-react'
import type { Recipe } from '@/types/recipe.types'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useState, useEffect, useCallback } from 'react'

const MEAL_TIMES = ['아침', '점심', '저녁']
const MEAL_EMOJIS = ['🌅', '☀️', '🌙']

const RECOMMENDATIONS_STORAGE_KEY = 'current-recommendations'

export default function RecommendationsPage() {
  const router = useRouter()
  const { mutate: getRecommendations, isPending } = useRecommendations()
  const [recommendations, setRecommendations] = useState<Recipe[]>([])
  const [totalCalories, setTotalCalories] = useState(0)
  const [aiReason, setAiReason] = useState<string>('')

  // 로그: 페이지 로드
  useEffect(() => {
    console.log('📊 Recommendations page loaded')
  }, [])

  // 저장된 추천 복원 함수
  const restoreRecommendations = useCallback(() => {
    console.log('🔍 [Recommendations Page] Checking for saved recommendations...')
    
    // sessionStorage에서 저장된 추천 확인
    const savedRecommendations = sessionStorage.getItem(RECOMMENDATIONS_STORAGE_KEY)
    
    if (savedRecommendations) {
      try {
        const parsed = JSON.parse(savedRecommendations)
        console.log('✅ [Recommendations Page] Restored saved recommendations:', parsed)
        
        // 추천 데이터가 유효한지 확인
        if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
          setRecommendations(parsed.recommendations)
          setTotalCalories(parsed.totalCalories || 0)
          setAiReason(parsed.ai_reason || '')
          return true
        } else {
          console.warn('⚠️ [Recommendations Page] Saved recommendations are invalid')
        }
      } catch (error) {
        console.error('❌ [Recommendations Page] Failed to parse saved recommendations:', error)
      }
    }
    
    return false
  }, [])

  // 초기 로드 시: 저장된 추천이 있으면 복원, 없으면 새로 받기
  useEffect(() => {
    const restored = restoreRecommendations()
    
    // 저장된 추천이 없으면 새로 받기
    if (!restored) {
      console.log('📥 [Recommendations Page] No saved recommendations, fetching new ones...')
      handleGetRecommendations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreRecommendations])

  // 현재 상태를 sessionStorage에 저장하는 함수
  const saveCurrentState = useCallback(() => {
    if (recommendations.length > 0) {
      console.log('💾 [Recommendations Page] Saving current state to sessionStorage')
      sessionStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify({
        recommendations,
        totalCalories,
        ai_reason: aiReason,
        timestamp: Date.now()
      }))
    }
  }, [recommendations, totalCalories, aiReason])

  // 페이지가 언마운트되거나 상태가 변경될 때 저장
  useEffect(() => {
    // 상태가 변경될 때마다 저장 (debounce 없이 즉시 저장)
    if (recommendations.length > 0) {
      saveCurrentState()
    }
  }, [recommendations, totalCalories, aiReason, saveCurrentState])

  // 페이지가 다시 포커스를 받을 때 (뒤로가기 등) 저장된 추천 복원
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ [Recommendations Page] Page became visible, checking for saved recommendations...')
        // 현재 추천이 없을 때만 복원 시도
        if (recommendations.length === 0) {
          restoreRecommendations()
        }
      }
    }

    const handleFocus = () => {
      console.log('🎯 [Recommendations Page] Page focused, checking for saved recommendations...')
      // 현재 추천이 없을 때만 복원 시도
      if (recommendations.length === 0) {
        restoreRecommendations()
      }
    }

    // 페이지 언마운트 시 현재 상태 저장
    const handleBeforeUnload = () => {
      console.log('🚪 [Recommendations Page] Page unloading, saving state...')
      saveCurrentState()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      console.log('🧹 [Recommendations Page] Cleaning up, saving state...')
      saveCurrentState()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [recommendations.length, restoreRecommendations, saveCurrentState])

  const handleGetRecommendations = () => {
    console.log('🎯 [Recommendations Page] Requesting recommendations...')
    
    getRecommendations(undefined, {
      onSuccess: (data) => {
        console.log('✅ [Recommendations Page] Recommendations received:', data)
        setRecommendations(data.recommendations)
        setTotalCalories(data.totalCalories)
        setAiReason(data.ai_reason || '')
        
        // 전체 추천 데이터를 sessionStorage에 저장 (페이지 복원용)
        console.log('💾 [Recommendations Page] Saving recommendations to sessionStorage')
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
            console.log(`💾 Saved recipe: ${recipe.id}`)
          }
        })
      },
      onError: (error) => {
        console.error('❌ [Recommendations Page] Error getting recommendations:', error)
        
        const errorMessage = error.message || '알 수 없는 오류'
        
        // 프로필이 없는 경우 온보딩으로 리다이렉트
        if (errorMessage.includes('프로필') || errorMessage.includes('온보딩')) {
          console.log('🔄 [Recommendations Page] 프로필이 없음 - 온보딩으로 리다이렉트')
          alert('먼저 프로필을 설정해주세요.')
          router.push('/onboarding')
          return
        }
        
        // 인증 오류
        if (errorMessage.includes('로그인')) {
          console.log('🔄 [Recommendations Page] 인증 필요 - 로그인으로 리다이렉트')
          alert('로그인이 필요합니다.')
          router.push('/sign-in')
          return
        }
        
        // 기타 오류
        alert(`추천을 가져오는 중 오류가 발생했습니다: ${errorMessage}`)
      },
    })
  }

  if (isPending && recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-bounce mb-4">
          <ChefHat className="w-16 h-16 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          맞춤 식단을 준비하고 있어요...
        </h2>
        <p className="text-gray-600">잠시만 기다려주세요 🍳</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              오늘의 추천 식단 🎉
            </h1>
            <p className="text-gray-600">
              당신의 건강 목표에 맞춘 하루 식단입니다
            </p>
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={isPending}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-full flex items-center space-x-2 transition-all disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${isPending ? 'animate-spin' : ''}`} />
            <span>{isPending ? '추천 중...' : '다시 추천받기'}</span>
          </button>
        </div>
      </div>

      {/* AI 추천 이유 */}
      {aiReason && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-3xl">🤖</span>
            </div>
            <div>
              <p className="text-purple-100 text-sm mb-1 font-semibold">AI 영양사의 추천 이유</p>
              <p className="text-lg">{aiReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* 총 칼로리 */}
      {totalCalories > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">오늘의 총 칼로리</p>
              <p className="text-4xl font-bold">{totalCalories.toLocaleString()} kcal</p>
            </div>
            <Flame className="w-16 h-16 text-orange-200" />
          </div>
        </div>
      )}

      {/* 레시피 카드들 */}
      {recommendations.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {recommendations.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              mealTime={MEAL_TIMES[index] || '식사'}
              emoji={MEAL_EMOJIS[index] || '🍽️'}
              onClick={() => {
                console.log('🔍 Viewing recipe:', recipe.id, recipe.title)
                router.push(`/recipes/${recipe.id}`)
              }}
            />
          ))}
        </div>
      ) : (
        !isPending && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-600 mb-4">추천된 식단이 없습니다.</p>
            <button
              onClick={handleGetRecommendations}
              className="text-orange-500 hover:text-orange-600 font-semibold"
            >
              추천받기
            </button>
          </div>
        )
      )}

      {/* 하단 안내 */}
      {recommendations.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Tip</h3>
          <p className="text-sm text-gray-700">
            각 레시피 카드를 클릭하면 자세한 조리 방법과 재료를 확인할 수 있어요.
            마음에 들지 않는다면 "다시 추천받기" 버튼을 눌러보세요!
          </p>
        </div>
      )}
    </div>
  )
}

interface RecipeCardProps {
  recipe: Recipe
  mealTime: string
  emoji: string
  onClick: () => void
}

function RecipeCard({ recipe, mealTime, emoji, onClick }: RecipeCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
    >
      {/* 썸네일 */}
      <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
        {recipe.thumbnail_url ? (
          <img
            src={recipe.thumbnail_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-20 h-20 text-white opacity-50" />
          </div>
        )}
        
        {/* 식사 시간 뱃지 */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
          <span className="text-sm font-semibold text-gray-800">
            {emoji} {mealTime}
          </span>
        </div>
      </div>

      {/* 내용 */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          {recipe.title}
        </h3>

        {/* 영양 정보 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">
              <strong className="text-gray-800">{recipe.calories}</strong> kcal
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Beef className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">
              <strong className="text-gray-800">{recipe.protein}g</strong> 단백질
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Wheat className="w-4 h-4 text-yellow-600" />
            <span className="text-gray-600">
              <strong className="text-gray-800">{recipe.carb}g</strong> 탄수화물
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Droplet className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">
              <strong className="text-gray-800">{recipe.fat}g</strong> 지방
            </span>
          </div>
        </div>

        {/* 태그 */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 버튼 */}
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors">
          자세히 보기
        </button>
      </div>
    </div>
  )
}

