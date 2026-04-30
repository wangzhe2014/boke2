import Link from 'next/link'
import Auth from './Auth'
import type { User } from '@/lib/supabase'

interface LayoutProps {
  children: React.ReactNode
  user: User | null
  onUserChange: (user: User | null) => void
}

export default function Layout({ children, user, onUserChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            我的博客
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              首页
            </Link>
            {user && (
              <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                管理后台
              </Link>
            )}
            <Auth user={user} onUserChange={onUserChange} />
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500">
          © 2024 我的博客. All rights reserved.
        </div>
      </footer>
    </div>
  )
}