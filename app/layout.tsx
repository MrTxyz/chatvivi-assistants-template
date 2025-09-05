import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'ChatVivi AI Agent',
  description: 'AI Agent design by T&T Solutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 border-b">
  <div className="container mx-auto flex justify-between items-center">
    <div className="flex items-center gap-2">
      <img src="/vtc-logo.png" alt="VTC Telecom Logo" width="32" height="32" />
      <h1 className="text-xl font-bold text-blue-600">ChatVivi</h1>
    </div>
    <button className="text-gray-600 hover:text-gray-800">☰</button>
  </div>
</header>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-sm p-4 text-center text-gray-500 text-sm">
          © 2025 ChatVivi — Trợ lý AI của bạn tại sân bay T3
        </footer>
      </body>
    </html>
  );
}
