import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(req: NextRequest) {
  console.log('🔍 [TEST GEMINI] Gemini 모델 테스트 시작')
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'GEMINI_API_KEY가 설정되지 않았습니다'
      }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // 사용 가능한 모델 목록 가져오기
    console.log('📋 [TEST GEMINI] 사용 가능한 모델 목록 요청 중...')
    
    const models = [
      // Gemini 2.0 모델
      'gemini-2.0-flash-exp',
      'gemini-2.0-pro-exp',
      'gemini-exp-1206',
      // Gemini 1.5 모델 (백업)
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ]
    const testResults: any = {}
    
    for (const modelName of models) {
      try {
        console.log(`🧪 [TEST GEMINI] ${modelName} 테스트 중...`)
        const model = genAI.getGenerativeModel({ model: modelName })
        
        const result = await model.generateContent('Say "OK" if you can hear me.')
        const response = result.response
        const text = response.text()
        
        testResults[modelName] = {
          success: true,
          response: text.substring(0, 100) // 처음 100자만
        }
        
        console.log(`✅ [TEST GEMINI] ${modelName} 성공!`)
      } catch (error) {
        testResults[modelName] = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
        
        console.log(`❌ [TEST GEMINI] ${modelName} 실패:`, error instanceof Error ? error.message : error)
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      gemini_api_key_set: true,
      models_tested: testResults,
      recommendation: Object.entries(testResults).find(([_, v]: any) => v.success)?.[0] || null
    })
    
  } catch (error) {
    console.error('❌ [TEST GEMINI] 테스트 중 오류:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

