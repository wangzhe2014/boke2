import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { createClient, createPost, type User } from '@/lib/supabase'

export default function Write() {
  const router = useRouter()
  const [formData, setFormData] = useState({ title: '', content: '', slug: '', authorName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title.trim()) {
      setError('请输入文章标题')
      return
    }
    if (!formData.content.trim()) {
      setError('请输入文章内容')
      return
    }
    if (!formData.slug.trim()) {
      setError('请输入文章链接（slug）')
      return
    }
    if (!formData.authorName.trim()) {
      setError('请输入作者名称')
      return
    }

    setLoading(true)
    try {
      const anonymousUserId = 'anonymous_' + Math.random().toString(36).substring(2, 15)
      
      await supabase.from('profiles').upsert({ 
        id: anonymousUserId, 
        email: `${anonymousUserId}@anonymous.com`, 
        name: formData.authorName 
      })
      
      await createPost(supabase, formData.title, formData.content, anonymousUserId, formData.slug)
      
      router.push(`/posts/${formData.slug}`)
    } catch (err) {
      console.error('Error creating post:', err)
      setError('创建文章失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = () => {
    if (!formData.title.trim()) return
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
    setFormData({ ...formData, slug })
  }

  return (
    <Layout user={null} onUserChange={() => {}}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">写文章</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            返回首页
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">作者名称</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              placeholder="输入你的名字"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">文章标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入文章标题"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              自动生成链接
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">文章链接 (Slug)</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">/posts/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="url-slug"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">文章内容</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="写下你的文章内容..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={12}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 rounded-lg transition-colors font-medium"
            >
              {loading ? '发布中...' : '发布文章'}
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors font-medium"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}