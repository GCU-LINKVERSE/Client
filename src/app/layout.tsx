import type { Metadata } from 'next'
import './globals.css'
import localFont from 'next/font/local'
import React from 'react'
import Notification from '@/components/Modals/Notification'

const pretendard = localFont({
  src: '../fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

export const metadata: Metadata = {
  title: 'MOIM',
  description: '선배들이 추천하는 캠퍼스 라이프 필수템',
  icons: {
    icon: '/logo.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${pretendard.variable}`}>
      <body className={`${pretendard.className}`}>
        <Notification />
        <div className="mobile-container">{children}</div>
      </body>
    </html>
  )
}
