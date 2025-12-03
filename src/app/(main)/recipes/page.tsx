'use client'

import { useRecipes } from '@/hooks/useRecipes'
import { Loader2, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function RecipesPage() {
  const { data: recipes, isLoading, error } = useRecipes()
  const [searchTerm, setSearchTerm] = useState('')

  console.log('📖 Recipes page loaded')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (error) {
    console.error('❌ Error loading recipes:', error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">레시피를 불러오는 중 오류가 발생했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-orange-500 hover:underline"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // 검색 필터링
  const filteredRecipes = recipes?.filter((recipe) => {
    if (!searchTerm) return true
    return recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  }) || []

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          레시피 둘러보기 📚
        </h1>
        <p className="text-lg text-gray-600">
          다양한 건강 레시피를 탐색하고 원하는 요리를 찾아보세요
        </p>
      </div>

      {/* 검색바 */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="레시피 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 레시피 개수 */}
      <div className="mb-6 text-gray-600">
        총 <strong className="text-orange-500">{filteredRecipes.length}</strong>개의 레시피
      </div>

      {/* 레시피 없음 */}
      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 레시피가 없습니다.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-orange-500 hover:underline"
            >
              전체 레시피 보기
            </button>
          )}
        </div>
      )}

      {/* 레시피 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 group"
          >
            {/* 썸네일 */}
            <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
              {recipe.thumbnail_url ? (
                <img
                  src={recipe.thumbnail_url}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-orange-400 text-6xl">
                  🍽️
                </div>
              )}
              {/* 칼로리 배지 */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-orange-600">
                {recipe.calories}kcal
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                {recipe.title}
              </h3>

              {/* 영양소 정보 */}
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <span>단백질 {recipe.protein}g</span>
                <span>•</span>
                <span>탄수화물 {recipe.carb}g</span>
                <span>•</span>
                <span>지방 {recipe.fat}g</span>
              </div>

              {/* 태그 */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(recipe.tags) ? recipe.tags : []).slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

