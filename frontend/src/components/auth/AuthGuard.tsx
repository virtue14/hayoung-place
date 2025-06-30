'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

const PUBLIC_PATHS = ['/login', '/login/callback']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    if (!isLoading) return // 이미 초기화가 완료된 경우 중복 호출 방지
    initialize()
  }, [initialize, isLoading])

  useEffect(() => {
    if (isLoading) return // 로딩 중에는 리다이렉트하지 않음

    // 현재 경로가 public path가 아니고 인증되지 않은 경우
    if (!PUBLIC_PATHS.includes(pathname) && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // public path이고 인증된 경우
    if (PUBLIC_PATHS.includes(pathname) && isAuthenticated) {
      console.log('Authenticated user on public path, redirecting to home')
      router.push('/')
      return
    }
  }, [pathname, isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">로딩 중...</h2>
          <p className="mt-2 text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 