import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import PostCard from '@/components/PostCard'
import { createClient, getPosts, type BlogPost, type User } from '@/lib/supabase'

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts(supabase)
        setPosts(data)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchUser = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      if (currentUser && currentUser.email) {
        const profile = await supabase.from('profiles').select('name').eq('id', currentUser.id).single()
        setUser({ id: currentUser.id, email: currentUser.email, name: profile.data?.name || null })
      }
    }

    fetchPosts()
    fetchUser()
  }, [])

  if (loading) {
    return (
      <Layout user={user} onUserChange={setUser}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user} onUserChange={setUser}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎来到我的博客</h1>
            <p className="text-gray-600">分享技术、生活和思考</p>
          </div>
          <Link
            href="/write"
            className="px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <span>+</span>
            <span>写文章</span>
          </Link>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">暂无文章</p>
          <Link
            href="/write"
            className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
          >
            写下你的第一篇文章
          </Link>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Layout>
  )
}