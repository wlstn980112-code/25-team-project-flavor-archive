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
  // 공개 라우트가 아니면 인증 필요
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
  
  console.log('🔐 Middleware:', request.nextUrl.pathname)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

