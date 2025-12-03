export interface User {
  id: string
  clerk_user_id: string
  email: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  age: number | null
  gender: 'male' | 'female' | 'other' | null
  goal: 'lose' | 'keep' | 'gain'
  allergy: string[] | null
  height: number | null
  weight: number | null
  daily_calorie: number
  updated_at: string
}

export interface OnboardingFormData {
  age?: number
  gender?: 'male' | 'female' | 'other'
  goal: 'lose' | 'keep' | 'gain'
  allergy: string[]
  height?: number
  weight?: number
}

