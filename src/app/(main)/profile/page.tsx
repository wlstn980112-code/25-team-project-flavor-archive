'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/hooks/useUser'
import { useUser } from '@clerk/nextjs'
import { Loader2, Edit2, Save, X, User, Target, Heart, Scale, Ruler } from 'lucide-react'

// Zod 스키마 정의
const profileSchema = z.object({
  age: z.number().min(1).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  goal: z.enum(['lose', 'keep', 'gain']),
  allergy: z.array(z.string()),
  height: z.number().min(50).max(250).optional(),
  weight: z.number().min(20).max(300).optional(),
})

type ProfileFormSchema = z.infer<typeof profileSchema>

// 알레르기 옵션
const allergyOptions = [
  { value: 'milk', label: '우유' },
  { value: 'nut', label: '견과류' },
  { value: 'shellfish', label: '갑각류' },
  { value: 'egg', label: '계란' },
  { value: 'soy', label: '콩' },
  { value: 'wheat', label: '밀' },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useUser()
  const { data: profile, isLoading: profileLoading, refetch } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      allergy: [],
    },
  })

  // 프로필 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (profile) {
      console.log('📝 [Profile] 프로필 데이터 로드:', profile)
      reset({
        age: profile.age || undefined,
        gender: profile.gender || undefined,
        goal: profile.goal,
        allergy: profile.allergy || [],
        height: profile.height || undefined,
        weight: profile.weight || undefined,
      })
    }
  }, [profile, reset])

  const watchedFields = watch()

  // 칼로리 계산 로직 (온보딩과 동일)
  const calculateCalories = (): number => {
    console.log('🧮 [Profile] 칼로리 계산 시작:', watchedFields)
    
    let baseCalories = 2000

    // 목표에 따른 조정
    if (watchedFields.goal === 'lose') {
      baseCalories -= 500
      console.log('📉 [Profile] 감량 목표: -500kcal')
    } else if (watchedFields.goal === 'gain') {
      baseCalories += 500
      console.log('📈 [Profile] 증가 목표: +500kcal')
    }

    // 키와 몸무게가 있으면 더 정확한 계산 (Harris-Benedict 공식)
    if (watchedFields.height && watchedFields.weight && watchedFields.age && watchedFields.gender) {
      console.log('📊 [Profile] 상세 정보로 정확한 계산 수행')
      
      let bmr: number
      if (watchedFields.gender === 'male') {
        bmr = 88.362 + (13.397 * watchedFields.weight) + (4.799 * watchedFields.height) - (5.677 * watchedFields.age)
      } else if (watchedFields.gender === 'female') {
        bmr = 447.593 + (9.247 * watchedFields.weight) + (3.098 * watchedFields.height) - (4.330 * watchedFields.age)
      } else {
        bmr = 1800
      }

      // 활동 계수 (보통 활동량)
      baseCalories = Math.round(bmr * 1.55)
      
      console.log('💪 [Profile] 기초대사량(BMR):', Math.round(bmr))
      console.log('🏃 [Profile] 활동 칼로리:', baseCalories)

      // 목표에 따른 조정
      if (watchedFields.goal === 'lose') {
        baseCalories -= 500
      } else if (watchedFields.goal === 'gain') {
        baseCalories += 500
      }
    }

    console.log('✅ [Profile] 최종 목표 칼로리:', baseCalories)
    return baseCalories
  }

  const onSubmit = async (data: ProfileFormSchema) => {
    console.log('💾 [Profile] 프로필 업데이트 시작:', data)
    setIsSaving(true)
    setError(null)

    try {
      const daily_calorie = calculateCalories()
      console.log('🎯 [Profile] 계산된 일일 칼로리:', daily_calorie)

      const profileData = {
        ...data,
        daily_calorie,
      }

      console.log('📤 [Profile] API 요청 데이터:', profileData)

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const result = await response.json()
      console.log('📥 [Profile] API 응답:', result)

      if (!response.ok) {
        console.error('❌ [Profile] 서버 에러 응답:', result)
        throw new Error(result.error || result.message || '프로필 업데이트에 실패했습니다')
      }

      console.log('✅ [Profile] 프로필 업데이트 성공')
      
      // 프로필 다시 불러오기
      await refetch()
      
      setIsEditing(false)
      alert('프로필이 성공적으로 업데이트되었습니다! 🎉')
    } catch (err) {
      console.error('❌ [Profile] 프로필 업데이트 실패:', err)
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleAllergy = (value: string) => {
    const currentAllergies = watchedFields.allergy || []
    const newAllergies = currentAllergies.includes(value)
      ? currentAllergies.filter((a) => a !== value)
      : [...currentAllergies, value]
    
    console.log('🏥 [Profile] 알레르기 업데이트:', { from: currentAllergies, to: newAllergies })
    setValue('allergy', newAllergies)
  }

  const handleCancelEdit = () => {
    console.log('❌ [Profile] 수정 취소')
    if (profile) {
      reset({
        age: profile.age || undefined,
        gender: profile.gender || undefined,
        goal: profile.goal,
        allergy: profile.allergy || [],
        height: profile.height || undefined,
        weight: profile.weight || undefined,
      })
    }
    setIsEditing(false)
    setError(null)
  }

  // 로딩 중
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // 프로필이 없을 때
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">
            프로필 정보가 없습니다. 먼저 건강 정보를 입력해주세요.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            정보 입력하러 가기
          </button>
        </div>
      </div>
    )
  }

  const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || '사용자'

  // 목표에 따른 조정된 칼로리 계산 (메인 페이지와 동일한 로직)
  const getAdjustedCalorie = () => {
    if (!profile) return 0
    
    if (profile.goal === 'lose') {
      // 체중 감량: 1800~2000kcal 범위로 조정 (최소 1200kcal)
      const adjusted = Math.max(1200, Math.min(2000, Math.round(profile.daily_calorie * 0.65)))
      console.log('📉 [Profile] 체중 감량 목표 - 칼로리 조정:', profile.daily_calorie, '→', adjusted)
      return adjusted
    } else if (profile.goal === 'gain') {
      // 체중 증량: 사용자 설정보다 10% 높게
      const adjusted = Math.round(profile.daily_calorie * 1.1)
      console.log('📈 [Profile] 체중 증량 목표 - 칼로리 조정:', profile.daily_calorie, '→', adjusted)
      return adjusted
    }
    
    // 체중 유지: 원래 칼로리 그대로
    console.log('⚖️ [Profile] 체중 유지 목표 - 칼로리 유지:', profile.daily_calorie)
    return profile.daily_calorie
  }

  const adjustedCalorie = getAdjustedCalorie()

  // 읽기 모드
  if (!isEditing) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 rounded-full p-3">
                <User className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{displayName}님의 프로필</h1>
                <p className="text-sm text-gray-500">건강 정보 및 목표</p>
              </div>
            </div>
            <button
              onClick={() => {
                console.log('✏️ [Profile] 수정 모드 활성화')
                setIsEditing(true)
              }}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>수정</span>
            </button>
          </div>

          {/* 프로필 정보 */}
          <div className="space-y-6">
            {/* 목표 */}
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-800">목표</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {profile.goal === 'lose' ? '체중 감량 📉' : profile.goal === 'gain' ? '체중 증가 📈' : '체중 유지 ⚖️'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                하루 목표 칼로리: <strong>{adjustedCalorie?.toLocaleString()} kcal</strong>
              </p>
            </div>

            {/* 신체 정보 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Ruler className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-800">신체 정보</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p>나이: <strong>{profile.age || '미입력'}세</strong></p>
                  <p>성별: <strong>{profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : profile.gender === 'other' ? '기타' : '미입력'}</strong></p>
                  <p>키: <strong>{profile.height ? `${profile.height}cm` : '미입력'}</strong></p>
                  <p>몸무게: <strong>{profile.weight ? `${profile.weight}kg` : '미입력'}</strong></p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-800">알레르기</h3>
                </div>
                {profile.allergy && profile.allergy.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergy.map((allergy) => (
                      <span
                        key={allergy}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                      >
                        {allergyOptions.find((opt) => opt.value === allergy)?.label || allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">없음</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 수정 모드
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">프로필 수정</h1>
          <button
            onClick={handleCancelEdit}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
            <span>취소</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 나이 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              나이 (선택)
            </label>
            <input
              type="number"
              {...register('age', { 
                setValueAs: (v) => v === '' ? undefined : parseInt(v, 10) 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="예: 25"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              성별 (선택)
            </label>
            <div className="flex gap-4">
              {[
                { value: 'male', label: '남성' },
                { value: 'female', label: '여성' },
                { value: 'other', label: '기타' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register('gender')}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 목표 (필수) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              목표 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'lose', label: '체중 감량', emoji: '📉' },
                { value: 'keep', label: '체중 유지', emoji: '⚖️' },
                { value: 'gain', label: '체중 증가', emoji: '📈' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    watchedFields.goal === option.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register('goal')}
                    className="sr-only"
                  />
                  <span className="text-3xl mb-2">{option.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.goal && (
              <p className="mt-2 text-sm text-red-600">{errors.goal.message}</p>
            )}
          </div>

          {/* 알레르기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              알레르기 (다중 선택 가능)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {allergyOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    watchedFields.allergy?.includes(option.value)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={watchedFields.allergy?.includes(option.value)}
                    onChange={() => toggleAllergy(option.value)}
                    className="mr-3 h-4 w-4 text-orange-500 rounded"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 키 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              키 (cm, 선택)
            </label>
            <input
              type="number"
              {...register('height', { 
                setValueAs: (v) => v === '' ? undefined : parseInt(v, 10) 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="예: 170"
            />
            {errors.height && (
              <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
            )}
          </div>

          {/* 몸무게 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              몸무게 (kg, 선택)
            </label>
            <input
              type="number"
              {...register('weight', { 
                setValueAs: (v) => v === '' ? undefined : parseInt(v, 10) 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="예: 65"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
            )}
          </div>

          {/* 칼로리 표시 */}
          {watchedFields.goal && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-1">
                하루 목표 칼로리
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {calculateCalories().toLocaleString()} kcal
              </p>
              <p className="text-sm text-gray-600 mt-2">
                이 칼로리를 기준으로 맞춤 식단을 추천해드립니다
              </p>
            </div>
          )}

          {/* 저장 버튼 */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>저장하기</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

