import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 칼로리 계산 함수
 * @param goal - 목표 ('lose' | 'keep' | 'gain')
 * @param height - 키 (cm)
 * @param weight - 몸무게 (kg)
 * @param age - 나이
 * @param gender - 성별 ('male' | 'female' | 'other')
 * @returns 하루 목표 칼로리
 */
export function calculateDailyCalorie(
  goal: 'lose' | 'keep' | 'gain',
  height?: number,
  weight?: number,
  age?: number,
  gender?: 'male' | 'female' | 'other'
): number {
  // 기본 칼로리
  let baseCalorie = 2000

  // 키, 몸무게, 나이, 성별이 모두 있으면 더 정확한 계산
  if (height && weight && age && gender) {
    // Harris-Benedict 공식 사용
    if (gender === 'male') {
      baseCalorie = Math.round(
        88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      )
    } else if (gender === 'female') {
      baseCalorie = Math.round(
        447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
      )
    }
    // 활동 계수 (보통 활동)
    baseCalorie = Math.round(baseCalorie * 1.375)
  }

  // 목표에 따라 조정
  switch (goal) {
    case 'lose':
      return baseCalorie - 500
    case 'gain':
      return baseCalorie + 500
    case 'keep':
    default:
      return baseCalorie
  }
}

/**
 * 날짜 포맷팅 함수
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * 영양소 정보 포맷팅
 */
export function formatNutrition(
  calories: number,
  protein: number,
  carb: number,
  fat: number
): string {
  return `${calories}kcal | 단백질 ${protein}g | 탄수화물 ${carb}g | 지방 ${fat}g`
}

