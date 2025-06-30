"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
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
