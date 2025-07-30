import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import { DevToolsBlocker } from '@/components/dev-tools-blocker'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: '呈尚策划工具中心',
  description: '集成19个专业工具的桌面应用，服务于运营、美工、销售、人事、客服等不同岗位的工作需求',
  generator: '呈尚策划',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <DevToolsBlocker />
          {children}
          <Toaster
            richColors
            position="top-right"
            expand={true}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
