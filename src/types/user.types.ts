export interface User {
  id: string
  clerk_user_id: string
  email: string
  created_at: string
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface UserProfile {
  id: string
  user_id: string
  age: number | null
  gender: 'male' | 'female' | 'other' | null
  goal: 'lose' | 'keep' | 'gain'
  allergy: string[] | null
  disease: string[] | null
  height: number | null
  weight: number | null
  activity_level: ActivityLevel
  daily_calorie: number
  updated_at: string
}

export interface OnboardingFormData {
  age?: number
  gender?: 'male' | 'female' | 'other'
  goal: 'lose' | 'keep' | 'gain'
  allergy: string[]
  disease?: string[]
  height?: number
  weight?: number
  activity_level: ActivityLevel
}

