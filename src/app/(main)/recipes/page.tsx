'use client'

import { useRecipes } from '@/hooks/useRecipes'
import { Loader2, Search, Filter, ChefHat, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

type CalorieCategory = 'all' | 'low' | 'medium' | 'high'
type SortOption = 'default' | 'calories-asc' | 'calories-desc' | 'name-asc'

export default function RecipesPage() {
  const { data: recipes, isLoading, error } = useRecipes()
  const [searchTerm, setSearchTerm] = useState('')
  const [calorieCategory, setCalorieCategory] = useState<CalorieCategory>('all')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [sortOption, setSortOption] = useState<SortOption>('default')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // 한 페이지에 표시할 레시피 수

  // 모든 hooks는 조건부 렌더링 전에 호출되어야 함
  // 모든 태그 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    recipes?.forEach((recipe) => {
      if (recipe.tags && Array.isArray(recipe.tags)) {
        recipe.tags.forEach((tag) => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [recipes])

  // 칼로리 범위별 분류
  const categorizedRecipes = useMemo(() => {
    if (!recipes) return { low: [], medium: [], high: [] }

    return {
      low: recipes.filter((r) => r.calories < 400),
      medium: recipes.filter((r) => r.calories >= 400 && r.calories < 700),
      high: recipes.filter((r) => r.calories >= 700),
    }
  }, [recipes])

  // 필터링 및 정렬
  const filteredRecipes = useMemo(() => {
    if (!recipes) return []

    let filtered = recipes.filter((recipe) => {
      // 검색어 필터
      if (searchTerm && !recipe.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // 칼로리 범위 필터
      if (calorieCategory === 'low' && recipe.calories >= 400) return false
      if (calorieCategory === 'medium' && (recipe.calories < 400 || recipe.calories >= 700)) return false
      if (calorieCategory === 'high' && recipe.calories < 700) return false

      // 태그 필터
      if (selectedTag && (!recipe.tags || !recipe.tags.includes(selectedTag))) {
        return false
      }

      return true
    })

    // 정렬
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'calories-asc':
          return a.calories - b.calories
        case 'calories-desc':
          return b.calories - a.calories
        case 'name-asc':
          return a.title.localeCompare(b.title, 'ko')
        default:
          return 0
      }
    })

    return filtered
  }, [recipes, searchTerm, calorieCategory, selectedTag, sortOption])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex)

  // 필터 변경 시 첫 페이지로 리셋
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  console.log('📖 Recipes page loaded')

  // 조건부 렌더링은 모든 hooks 호출 이후에
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

      {/* 검색 및 필터 영역 */}
      <div className="mb-8 space-y-4">
        {/* 검색바 */}
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

        {/* 필터 및 정렬 */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* 칼로리 범위 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">칼로리:</span>
            <div className="flex gap-2">
              {(['all', 'low', 'medium', 'high'] as CalorieCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCalorieCategory(cat)
                    handleFilterChange()
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    calorieCategory === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? '전체' : cat === 'low' ? '저칼로리' : cat === 'medium' ? '중간' : '고칼로리'}
                </button>
              ))}
            </div>
          </div>

          {/* 태그 필터 */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">태그:</span>
              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">전체</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 정렬 */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption)
                handleFilterChange()
              }}
              className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="default">기본</option>
              <option value="name-asc">이름순</option>
              <option value="calories-asc">칼로리 낮은순</option>
              <option value="calories-desc">칼로리 높은순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 카테고리별 통계 */}
      {recipes && recipes.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{recipes.length}</div>
            <div className="text-sm text-gray-600">전체 레시피</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{categorizedRecipes.low.length}</div>
            <div className="text-sm text-green-700">저칼로리 (&lt;400kcal)</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{categorizedRecipes.medium.length}</div>
            <div className="text-sm text-yellow-700">중간칼로리 (400-700kcal)</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{categorizedRecipes.high.length}</div>
            <div className="text-sm text-orange-700">고칼로리 (≥700kcal)</div>
          </div>
        </div>
      )}

      {/* 레시피 개수 및 페이지 정보 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-gray-600">
          총 <strong className="text-orange-500">{filteredRecipes.length}</strong>개의 레시피
          {filteredRecipes.length > itemsPerPage && (
            <span className="ml-2 text-sm text-gray-500">
              ({startIndex + 1}-{Math.min(endIndex, filteredRecipes.length)} / {filteredRecipes.length})
            </span>
          )}
        </div>
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
        {paginatedRecipes.map((recipe) => (
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 페이지 정보 */}
      {totalPages > 1 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          페이지 {currentPage} / {totalPages}
        </div>
      )}
    </div>
  )
}

