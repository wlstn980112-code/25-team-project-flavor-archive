'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { ChefHat, Home, BookOpen, User, LogIn } from 'lucide-react'

export default function Header() {
  const { isSignedIn } = useUser()

  return (
    <header className="bg-white shadow-sm border-b border-orange-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-800">
              Flavor Archive
            </span>
          </Link>

          {/* 네비게이션 */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition"
            >
              <Home className="w-5 h-5" />
              <span>홈</span>
            </Link>
            <Link
              href="/recipes"
              className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition"
            >
              <BookOpen className="w-5 h-5" />
              <span>레시피</span>
            </Link>
            
            {isSignedIn ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition"
                >
                  <User className="w-5 h-5" />
                  <span>프로필</span>
                </Link>
                {/* Clerk UserButton */}
                <div className="ml-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition"
                >
                  <LogIn className="w-5 h-5" />
                  <span>로그인</span>
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

