import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 공개 라우트 정의
const isPublicRoute = createRouteMatcher([
  '/',
  '/recipes(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
])

export default clerkMiddleware(async (auth, request) => {
  console.log('🔐 Middleware 실행:', request.nextUrl.pathname)
  
  // 공개 라우트가 아니면 인증 필요
  if (!isPublicRoute(request)) {
    console.log('🔒 보호된 라우트 - 인증 확인')
    await auth.protect()
  } else {
    console.log('🌍 공개 라우트 - 인증 불필요')
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

