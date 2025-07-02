'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 로고 */}
                    <Link href="/places" className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/logo.svg"
                                alt="하영플레이스 로고"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold text-blue-900">하영플레이스</span>
                    </Link>

                    {/* 데스크톱 메뉴 */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/places" className="text-gray-600 hover:text-blue-600">
                            맛집 지도
                        </Link>
                        <Link href="/places/list" className="text-gray-600 hover:text-blue-600">
                            맛집 목록
                        </Link>
                    </div>

                    {/* 모바일 메뉴 버튼 */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 모바일 메뉴 */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
                        <Link
                            href="/places"
                            className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            맛집 지도
                        </Link>
                        <Link
                            href="/places/list"
                            className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            맛집 목록
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
} 