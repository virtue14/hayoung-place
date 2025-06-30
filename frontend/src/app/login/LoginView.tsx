'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginView() {
    const router = useRouter()

    const handleGoogleLogin = () => {
        // OAuth 로그인 처리
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative w-16 h-16">
                            <Image
                                src="/logo.svg"
                                alt="하영플레이스 로고"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        하영플레이스
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Made By MILLO
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 구글 로그인 버튼 */}
                    <Button
                        onClick={handleGoogleLogin}
                        className="w-full h-12 relative"
                        variant="outline"
                    >
                        <div className="absolute left-4 w-6 h-6">
                            <Image
                                src="/google.svg"
                                alt="Google 로고"
                                width={24}
                                height={24}
                            />
                        </div>
                        <span className="text-gray-700">Google로 계속하기</span>
                    </Button>
                </CardContent>
            </Card>

            {/* 배경 장식 */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full transform rotate-12 bg-gradient-to-b from-blue-100/20 to-transparent"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full transform -rotate-12 bg-gradient-to-t from-indigo-100/20 to-transparent"></div>
            </div>
        </div>
    )
} 