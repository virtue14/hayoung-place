import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "@/lib/providers";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "하영플레이스",
  description: "제주도의 숨겨진 맛집과 카페, 포토스팟을 발견하고 공유하세요! 하영이 추천하는 특별한 장소들을 만나보세요.",
  keywords: ["제주도", "맛집", "카페", "포토스팟", "여행", "하영플레이스"],
  authors: [{ name: "하영플레이스" }],
  openGraph: {
    title: "하영플레이스",
    description: "제주도의 숨겨진 맛집과 카페, 포토스팟을 발견하고 공유하세요!",
    type: "website",
    locale: "ko_KR",
    url: "https://virtue-project.info",
    siteName: "하영플레이스",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "하영플레이스 - 제주도 맛집과 카페 추천",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "하영플레이스",
    description: "제주도의 숨겨진 맛집과 카페, 포토스팟을 발견하고 공유하세요!",
    images: ["/logo.svg"],
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  alternates: {
    canonical: "https://virtue-project.info",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon" />
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=53ecd70791d8ce3eac93d3d83685d882&autoload=false`}
        strategy="afterInteractive"
      />
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
