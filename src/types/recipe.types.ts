export interface Recipe {
  id: string
  title: string
  thumbnail_url: string | null
  calories: number
  protein: number
  carb: number
  fat: number
  tags: string[] | null
  ingredients: Ingredient[]
  steps: Step[]
  created_at: string
}

export interface Ingredient {
  name: string
  amount: string
}

export interface Step {
  step_num: number
  text: string
}

export interface RecipeCard {
  id: string
  title: string
  thumbnail_url: string | null
  calories: number
  tags: string[] | null
}

