/**
 * 레시피 샘플 데이터 생성 스크립트
 * 사용법: npx tsx scripts/seed-recipes.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env.local 파일 로드
const envPath = resolve(process.cwd(), '.env.local')
console.log('🔍 환경 변수 파일 로드:', envPath)
config({ path: envPath })

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 환경 변수 확인:')
console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓ (길이: ' + supabaseServiceKey?.length + ')' : '✗')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ 환경 변수가 설정되지 않았습니다.')
  console.error('💡 .env.local 파일을 확인해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 샘플 레시피 데이터
const sampleRecipes = [
  // 저칼로리 (300-500kcal)
  {
    title: '그릭 요거트 과일 볼',
    calories: 350,
    protein: 15,
    carb: 45,
    fat: 8,
    ingredients: [
      { name: '그릭 요거트', amount: '200g' },
      { name: '블루베리', amount: '50g' },
      { name: '바나나', amount: '1개' },
      { name: '꿀', amount: '1스푼' },
      { name: '그래놀라', amount: '30g' },
    ],
    steps: [
      '그릭 요거트를 볼에 담는다',
      '블루베리와 바나나를 씻어 적당한 크기로 자른다',
      '요거트 위에 과일을 올린다',
      '꿀을 뿌리고 그래놀라를 토핑한다',
    ],
    tags: ['아침', '간편', '저칼로리', '건강'],
    thumbnail_url: null,
  },
  {
    title: '닭가슴살 샐러드',
    calories: 420,
    protein: 35,
    carb: 25,
    fat: 18,
    ingredients: [
      { name: '닭가슴살', amount: '150g' },
      { name: '로메인 상추', amount: '100g' },
      { name: '방울토마토', amount: '10개' },
      { name: '오이', amount: '1/2개' },
      { name: '발사믹 드레싱', amount: '2스푼' },
      { name: '아보카도', amount: '1/2개' },
    ],
    steps: [
      '닭가슴살을 소금, 후추로 밑간하고 구운다',
      '상추를 한 입 크기로 자르고 토마토는 반으로 자른다',
      '오이와 아보카도를 슬라이스한다',
      '모든 재료를 볼에 담고 드레싱을 뿌린다',
      '구운 닭가슴살을 슬라이스하여 올린다',
    ],
    tags: ['점심', '다이어트', '고단백', '샐러드'],
    thumbnail_url: null,
  },

  // 중간 칼로리 (500-700kcal)
  {
    title: '연어 아보카도 덮밥',
    calories: 580,
    protein: 28,
    carb: 65,
    fat: 22,
    ingredients: [
      { name: '현미밥', amount: '200g' },
      { name: '연어회', amount: '100g' },
      { name: '아보카도', amount: '1개' },
      { name: '계란', amount: '1개' },
      { name: '간장', amount: '2스푼' },
      { name: '참기름', amount: '1스푼' },
      { name: '김', amount: '적당량' },
    ],
    steps: [
      '현미밥을 그릇에 담는다',
      '아보카도를 슬라이스하고 연어회를 준비한다',
      '계란은 반숙으로 삶는다',
      '밥 위에 연어, 아보카도, 계란을 올린다',
      '간장과 참기름을 섞어 뿌리고 김을 올린다',
    ],
    tags: ['점심', '저녁', '오메가3', '영양', '덮밥'],
    thumbnail_url: null,
  },
  {
    title: '퀴노아 치킨 볼',
    calories: 620,
    protein: 32,
    carb: 58,
    fat: 24,
    ingredients: [
      { name: '퀴노아', amount: '150g' },
      { name: '닭가슴살', amount: '120g' },
      { name: '브로콜리', amount: '100g' },
      { name: '파프리카', amount: '1개' },
      { name: '올리브 오일', amount: '1스푼' },
      { name: '레몬', amount: '1/2개' },
    ],
    steps: [
      '퀴노아를 삶아 준비한다',
      '닭가슴살을 큐브로 자르고 구운다',
      '브로콜리는 데치고 파프리카는 자른다',
      '볼에 모든 재료를 담는다',
      '올리브 오일과 레몬즙을 뿌린다',
    ],
    tags: ['점심', '저녁', '슈퍼푸드', '균형식'],
    thumbnail_url: null,
  },

  // 고칼로리 (700-900kcal)
  {
    title: '소고기 덮밥',
    calories: 750,
    protein: 38,
    carb: 82,
    fat: 28,
    ingredients: [
      { name: '쌀밥', amount: '300g' },
      { name: '소고기', amount: '150g' },
      { name: '양파', amount: '1개' },
      { name: '간장', amount: '3스푼' },
      { name: '설탕', amount: '1스푼' },
      { name: '대파', amount: '1대' },
      { name: '계란', amount: '1개' },
    ],
    steps: [
      '소고기를 얇게 썰고 양파는 채 썬다',
      '팬에 소고기와 양파를 볶는다',
      '간장, 설탕으로 간을 하고 대파를 넣는다',
      '밥 위에 볶은 재료를 올린다',
      '반숙 계란을 올려 완성한다',
    ],
    tags: ['저녁', '든든', '고단백', '한식'],
    thumbnail_url: null,
  },
  {
    title: '스테이크 샐러드',
    calories: 680,
    protein: 42,
    carb: 35,
    fat: 38,
    ingredients: [
      { name: '소고기 스테이크', amount: '200g' },
      { name: '감자', amount: '2개' },
      { name: '혼합 채소', amount: '150g' },
      { name: '방울토마토', amount: '10개' },
      { name: '올리브 오일', amount: '2스푼' },
      { name: '발사믹 식초', amount: '1스푼' },
    ],
    steps: [
      '스테이크를 소금, 후추로 간하고 구운다',
      '감자는 큐브로 자르고 오븐에 굽는다',
      '채소와 토마토를 준비한다',
      '스테이크를 슬라이스한다',
      '모든 재료를 담고 드레싱을 뿌린다',
    ],
    tags: ['저녁', '고급', '고단백', '서양식'],
    thumbnail_url: null,
  },
  {
    title: '닭가슴살 현미 도시락',
    calories: 720,
    protein: 45,
    carb: 78,
    fat: 18,
    ingredients: [
      { name: '현미밥', amount: '250g' },
      { name: '닭가슴살', amount: '180g' },
      { name: '계란', amount: '2개' },
      { name: '브로콜리', amount: '100g' },
      { name: '당근', amount: '50g' },
      { name: '간장', amount: '2스푼' },
    ],
    steps: [
      '현미밥을 짓는다',
      '닭가슴살을 구워서 슬라이스한다',
      '계란은 삶아서 반으로 자른다',
      '브로콜리와 당근은 데친다',
      '도시락에 모든 재료를 담는다',
    ],
    tags: ['점심', '도시락', '운동', '고단백'],
    thumbnail_url: null,
  },

  // 간식/스낵 (200-300kcal)
  {
    title: '프로틴 스무디',
    calories: 280,
    protein: 25,
    carb: 32,
    fat: 6,
    ingredients: [
      { name: '단백질 파우더', amount: '30g' },
      { name: '바나나', amount: '1개' },
      { name: '아몬드 우유', amount: '200ml' },
      { name: '시금치', amount: '30g' },
      { name: '얼음', amount: '적당량' },
    ],
    steps: [
      '모든 재료를 믹서기에 넣는다',
      '부드러워질 때까지 갈아준다',
      '컵에 담아 마신다',
    ],
    tags: ['간식', '운동', '단백질', '스무디'],
    thumbnail_url: null,
  },
]

async function seedRecipes() {
  console.log('🌱 레시피 데이터 생성 시작...')
  console.log('📊 총 레시피 수:', sampleRecipes.length)

  try {
    // 기존 레시피 확인
    const { count: existingCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })

    console.log('📦 기존 레시피 수:', existingCount || 0)

    // 레시피 삽입
    const { data, error } = await supabase
      .from('recipes')
      .insert(sampleRecipes)
      .select()

    if (error) {
      console.error('❌ 레시피 삽입 실패:', error)
      throw error
    }

    console.log('✅ 레시피 삽입 성공!')
    console.log('✅ 삽입된 레시피 수:', data?.length || 0)

    // 최종 레시피 수 확인
    const { count: finalCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })

    console.log('📊 최종 레시피 수:', finalCount || 0)

    // 칼로리 범위별 통계
    const ranges = [
      { name: '저칼로리 (200-500kcal)', min: 200, max: 500 },
      { name: '중간칼로리 (500-700kcal)', min: 500, max: 700 },
      { name: '고칼로리 (700-900kcal)', min: 700, max: 900 },
    ]

    console.log('\n📈 칼로리 범위별 레시피 수:')
    for (const range of ranges) {
      const { count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .gte('calories', range.min)
        .lte('calories', range.max)

      console.log(`  ${range.name}: ${count || 0}개`)
    }

    console.log('\n✅ 레시피 데이터 생성 완료!')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

async function checkRecipes() {
  console.log('🔍 데이터베이스 레시피 확인 중...')
  console.log('📡 Supabase URL:', supabaseUrl)
  
  try {
    // 전체 레시피 확인
    const { data: allRecipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ 레시피 조회 실패:', fetchError)
      console.error('❌ 에러 상세:', JSON.stringify(fetchError, null, 2))
      throw fetchError
    }
    
    console.log(`\n📊 총 레시피 수: ${allRecipes?.length || 0}개`)
    
    if (allRecipes && allRecipes.length > 0) {
      console.log('\n📋 현재 데이터베이스에 있는 레시피 목록:')
      allRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe.title} (ID: ${recipe.id})`)
      })
    } else {
      console.log('\n⚠️ 데이터베이스에 레시피가 없습니다.')
    }
    
    return allRecipes || []
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    throw error
  }
}

async function deleteSampleRecipes() {
  console.log('🗑️ 예시 레시피 삭제 시작...')
  
  // 아까 말씀하신 예시 레시피 목록
  const recipeTitlesToDelete = [
    '프로틴 스무디',
    '연어 아보카도 덮밥',
    '퀴노아 치킨 볼',
    '소고기 덮밥',
    '스테이크 샐러드',
    '닭가슴살 현미 도시락',
    '그릭 요거트 과일 볼',
    '닭가슴살 샐러드',
    '퀴노아 채소 볶음밥',
    '그릭 요거트 파르페',
    '두부 스테이크',
  ]
  
  console.log('📋 삭제할 레시피 목록:')
  recipeTitlesToDelete.forEach((title, index) => {
    console.log(`  ${index + 1}. ${title}`)
  })
  
  try {
    // 먼저 전체 레시피 확인
    const allRecipes = await checkRecipes()
    
    // 삭제 전 레시피 확인
    const { data: beforeDelete, error: checkError } = await supabase
      .from('recipes')
      .select('id, title')
      .in('title', recipeTitlesToDelete)
    
    if (checkError) {
      console.error('❌ 레시피 확인 실패:', checkError)
      throw checkError
    }
    
    console.log(`\n📦 삭제 대상 레시피 수: ${beforeDelete?.length || 0}개`)
    if (beforeDelete && beforeDelete.length > 0) {
      console.log('📋 삭제 대상 레시피:')
      beforeDelete.forEach((recipe) => {
        console.log(`  - ${recipe.title} (ID: ${recipe.id})`)
      })
      
      // 레시피 삭제
      const { data: deletedData, error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .in('title', recipeTitlesToDelete)
        .select()
      
      if (deleteError) {
        console.error('❌ 레시피 삭제 실패:', deleteError)
        throw deleteError
      }
      
      console.log('\n✅ 레시피 삭제 성공!')
      console.log(`✅ 삭제된 레시피 수: ${deletedData?.length || 0}개`)
      if (deletedData && deletedData.length > 0) {
        console.log('✅ 삭제된 레시피:')
        deletedData.forEach((recipe) => {
          console.log(`  - ${recipe.title}`)
        })
      }
      
      // 최종 레시피 수 확인
      const { count: finalCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
      
      console.log(`\n📊 최종 레시피 수: ${finalCount || 0}개`)
      console.log('\n✅ 예시 레시피 삭제 완료!')
    } else {
      console.log('⚠️ 삭제할 레시피를 찾을 수 없습니다.')
      console.log('\n💡 현재 데이터베이스에 있는 레시피와 삭제하려는 레시피 제목이 일치하지 않을 수 있습니다.')
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

// 스크립트 실행
// seedRecipes() // 레시피 생성 (주석 처리)
deleteSampleRecipes() // 예시 레시피 삭제

