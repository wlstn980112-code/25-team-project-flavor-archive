'use client'

import { useUser } from '@clerk/nextjs'
import { useUserProfile } from '@/hooks/useUser'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Loader2, ChefHat } from 'lucide-react'
import type { Recipe } from '@/types/recipe.types'

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
        console.log('✅ Recommendations received:', data)
        setRecommendations(data.recommendations)
        router.push('/recommendations')
      },
      onError: (error) => {
        console.error('❌ Error getting recommendations:', error)
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
                하루 목표 칼로리: <strong>{profile.daily_calorie}kcal</strong>
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

      {/* 정보 섹션 */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-orange-500 font-bold text-3xl mb-2">🥗</div>
          <h4 className="font-semibold text-gray-800 mb-1">건강한 식단</h4>
          <p className="text-sm text-gray-600">영양 균형을 고려한 맞춤 레시피</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-orange-500 font-bold text-3xl mb-2">🎯</div>
          <h4 className="font-semibold text-gray-800 mb-1">목표 달성</h4>
          <p className="text-sm text-gray-600">당신의 건강 목표를 지원합니다</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-orange-500 font-bold text-3xl mb-2">⚡</div>
          <h4 className="font-semibold text-gray-800 mb-1">간편한 조리</h4>
          <p className="text-sm text-gray-600">쉽고 빠르게 만들 수 있는 레시피</p>
        </div>
      </div>
    </div>
  )
}

