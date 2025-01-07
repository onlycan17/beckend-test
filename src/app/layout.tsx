import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '시험 카운트다운',
  description: '시험 시간 카운트다운 테스트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}