'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TabNavigationProps {
  className?: string
}

const tabs = [
  {
    label: '플레이스',
    href: '/',
    matchPaths: ['/', '/places']
  },
  {
    label: '파티모집',
    href: '/parties',
    matchPaths: ['/parties']
  }
]

export default function TabNavigation({ className }: TabNavigationProps) {
  const pathname = usePathname()

  const isActiveTab = (tab: typeof tabs[0]) => {
    // 정확한 경로 매칭 또는 하위 경로 포함 확인
    return tab.matchPaths.some(path => {
      if (path === '/') {
        return pathname === '/' || pathname.startsWith('/places')
      }
      return pathname === path || pathname.startsWith(path + '/')
    })
  }

  return (
    <div className={cn("bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm", className)}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-center space-x-0">
          {tabs.map((tab) => {
            const isActive = isActiveTab(tab)
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center px-6 sm:px-8 py-3 text-sm sm:text-base font-medium transition-all duration-200 border-b-2 relative min-h-[44px]",
                  "hover:text-blue-600 hover:bg-blue-50/50 active:scale-95 touch-manipulation",
                  isActive
                    ? "text-blue-600 border-blue-600 bg-blue-50/30"
                    : "text-gray-600 border-transparent hover:border-blue-300"
                )}
              >
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-blue-50/50" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
} 