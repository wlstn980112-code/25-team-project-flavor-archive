'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { OnboardingFormData } from '@/types/user.types'

// Zod 스키마 정의
const onboardingSchema = z.object({
  age: z.number().min(1).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  goal: z.enum(['lose', 'keep', 'gain']),
  allergy: z.array(z.string()),
  disease: z.array(z.string()).optional(),
  height: z.number().min(50).max(250).optional(),
  weight: z.number().min(20).max(300).optional(),
})

type OnboardingFormSchema = z.infer<typeof onboardingSchema>

// 알레르기 옵션 (22가지)
const allergyOptions = [
  { value: 'egg', label: '난류' },
  { value: 'milk', label: '우유' },
  { value: 'buckwheat', label: '메밀' },
  { value: 'peanut', label: '땅콩' },
  { value: 'soybean', label: '대두' },
  { value: 'wheat', label: '밀' },
  { value: 'mackerel', label: '고등어' },
  { value: 'crab', label: '게' },
  { value: 'shrimp', label: '새우' },
  { value: 'pork', label: '돼지고기' },
  { value: 'peach', label: '복숭아' },
  { value: 'tomato', label: '토마토' },
  { value: 'sulfite', label: '아황산류' },
  { value: 'walnut', label: '호두' },
  { value: 'chicken', label: '닭고기' },
  { value: 'beef', label: '쇠고기' },
  { value: 'squid', label: '오징어' },
  { value: 'shellfish', label: '조개류' },
  { value: 'pine_nut', label: '잣' },
  { value: 'almond', label: '아몬드' },
  { value: 'cashew', label: '캐슈넛' },
  { value: 'sesame', label: '참깨' },
]

// 질병 옵션 (카테고리별)
const diseaseOptions = [
  // 심혈관/대사 질환
  { category: 'cardiovascular', value: 'diabetes_type1', label: '당뇨병 (1형)' },
  { category: 'cardiovascular', value: 'diabetes_type2', label: '당뇨병 (2형)' },
  { category: 'cardiovascular', value: 'hypertension', label: '고혈압' },
  { category: 'cardiovascular', value: 'dyslipidemia', label: '이상지질혈증' },
  { category: 'cardiovascular', value: 'obesity', label: '비만' },
  
  // 신장/비뇨기 질환
  { category: 'kidney', value: 'ckd', label: '만성 신장 질환 (CKD)' },
  { category: 'kidney', value: 'kidney_stone', label: '신장 결석' },
  
  // 소화기 질환
  { category: 'digestive', value: 'gastritis', label: '위염/위궤양/식도염' },
  { category: 'digestive', value: 'ibd', label: '염증성 장 질환 (IBD)' },
  { category: 'digestive', value: 'ibs', label: '과민성 대장 증후군 (IBS)' },
  { category: 'digestive', value: 'liver_disease', label: '간 질환' },
  
  // 면역/대사성 질환
  { category: 'immune', value: 'gout', label: '통풍' },
  { category: 'immune', value: 'anemia', label: '빈혈' },
  { category: 'immune', value: 'osteoporosis', label: '골다공증' },
  
  // 특수 생애 주기
  { category: 'special', value: 'pregnancy', label: '임신 및 수유기' },
  { category: 'special', value: 'elderly', label: '노인 영양 관리' },
]

const diseaseCategories = [
  { id: 'cardiovascular', label: '심혈관/대사 질환' },
  { id: 'kidney', label: '신장/비뇨기 질환' },
  { id: 'digestive', label: '소화기 질환' },
  { id: 'immune', label: '면역/대사성 질환' },
  { id: 'special', label: '특수 생애 주기' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      allergy: [],
      disease: [],
    },
  })

  // 프로필이 이미 있는지 확인
  useEffect(() => {
    const checkProfile = async () => {
      console.log('🔍 프로필 존재 여부 확인 중...')
      try {
        const response = await fetch('/api/profile')
        
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            console.log('✅ 프로필이 이미 존재함 - 메인 페이지로 리디렉션')
            router.push('/')
            return
          }
        }
        
        console.log('📝 프로필이 없음 - 온보딩 진행')
      } catch (err) {
        console.error('❌ 프로필 확인 중 오류:', err)
        // 에러 발생 시에도 온보딩 진행
      } finally {
        setIsCheckingProfile(false)
      }
    }

    checkProfile()
  }, [router])

  const watchedFields = watch()

  // 칼로리 계산 로직
  const calculateCalories = (): number => {
    console.log('🧮 칼로리 계산 시작:', watchedFields)
    
    let baseCalories = 2000

    // 목표에 따른 조정
    if (watchedFields.goal === 'lose') {
      baseCalories -= 500
      console.log('📉 감량 목표: -500kcal')
    } else if (watchedFields.goal === 'gain') {
      baseCalories += 500
      console.log('📈 증가 목표: +500kcal')
    }

    // 키와 몸무게가 있으면 더 정확한 계산 (Harris-Benedict 공식 간소화)
    if (watchedFields.height && watchedFields.weight && watchedFields.age && watchedFields.gender) {
      console.log('📊 상세 정보로 정확한 계산 수행')
      
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
      
      console.log('💪 기초대사량(BMR):', Math.round(bmr))
      console.log('🏃 활동 칼로리:', baseCalories)

      // 목표에 따른 조정
      if (watchedFields.goal === 'lose') {
        baseCalories -= 500
      } else if (watchedFields.goal === 'gain') {
        baseCalories += 500
      }
    }

    console.log('✅ 최종 목표 칼로리:', baseCalories)
    return baseCalories
  }

  const onSubmit = async (data: OnboardingFormSchema) => {
    console.log('📝 온보딩 폼 제출 시작:', data)
    setIsLoading(true)
    setError(null)

    try {
      const daily_calorie = calculateCalories()
      console.log('🎯 계산된 일일 칼로리:', daily_calorie)

      const profileData = {
        ...data,
        daily_calorie,
      }

      console.log('📤 API 요청 데이터:', profileData)

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const result = await response.json()
      console.log('📥 API 응답:', result)

      if (!response.ok) {
        console.error('❌ 서버 에러 응답:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          message: result.message,
          errorDetails: result.errorDetails
        })
        
        // 더 자세한 에러 메시지 구성
        let errorMessage = result.error || result.message || '프로필 저장에 실패했습니다'
        if (result.errorDetails) {
          errorMessage += `\n\n상세 정보:\n`
          errorMessage += `코드: ${result.errorDetails.code || 'N/A'}\n`
          errorMessage += `메시지: ${result.errorDetails.message || 'N/A'}\n`
          if (result.errorDetails.hint) {
            errorMessage += `힌트: ${result.errorDetails.hint}\n`
          }
        }
        
        throw new Error(errorMessage)
      }

      console.log('✅ 프로필 저장 성공 - 홈으로 리디렉션')
      router.push('/')
    } catch (err) {
      console.error('❌ 프로필 저장 실패:', err)
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAllergy = (value: string) => {
    const currentAllergies = watchedFields.allergy || []
    const newAllergies = currentAllergies.includes(value)
      ? currentAllergies.filter((a) => a !== value)
      : [...currentAllergies, value]
    
    console.log('🏥 알레르기 업데이트:', { from: currentAllergies, to: newAllergies })
    setValue('allergy', newAllergies)
  }

  const toggleDisease = (value: string) => {
    const currentDiseases = watchedFields.disease || []
    const newDiseases = currentDiseases.includes(value)
      ? currentDiseases.filter((d) => d !== value)
      : [...currentDiseases, value]
    
    console.log('🏥 질병 업데이트:', { from: currentDiseases, to: newDiseases })
    setValue('disease', newDiseases)
  }

  // 프로필 확인 중일 때 로딩 표시
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">프로필 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            환영합니다! 🎉
          </h1>
          <p className="text-center text-gray-600 mb-8">
            맞춤형 식단 추천을 위해 정보를 입력해주세요
          </p>

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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                    <span className="text-gray-700 text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 질병 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                질병/건강 상태 (다중 선택 가능)
              </label>
              <div className="space-y-4">
                {diseaseCategories.map((category) => {
                  const categoryDiseases = diseaseOptions.filter(
                    (d) => d.category === category.id
                  )
                  return (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                        {category.label}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryDiseases.map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                              watchedFields.disease?.includes(option.value)
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={watchedFields.disease?.includes(option.value)}
                              onChange={() => toggleDisease(option.value)}
                              className="mr-2 h-4 w-4 text-orange-500 rounded"
                            />
                            <span className="text-gray-700 text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
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

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : '시작하기 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


