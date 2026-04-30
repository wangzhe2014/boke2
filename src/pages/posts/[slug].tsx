import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { createClient, getPostBySlug, getComments, createComment, type BlogPost, type Comment, type User } from '@/lib/supabase'

export default function PostDetail() {
  const router = useRouter()
  const { slug } = router.query
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<(Comment & { author: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug || typeof slug !== 'string') return
      try {
        const data = await getPostBySlug(supabase, slug)
        setPost(data)
        await fetchComments(data.id)
      } catch (error) {
        console.error('Error fetching post:', error)
        setError('文章不存在')
      } finally {
        setLoading(false)
      }
    }

    const fetchComments = async (postId: string) => {
      try {
        const data = await getComments(supabase, postId)
        setComments(data)
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }

    const fetchUser = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      if (currentUser && currentUser.email) {
        const profile = await supabase.from('profiles').select('name').eq('id', currentUser.id).single()
        setUser({ id: currentUser.id, email: currentUser.email, name: profile.data?.name || null })
      }
    }

    fetchPost()
    fetchUser()
  }, [slug])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim() || !user || !post) return

    try {
      await createComment(supabase, post.id, commentContent.trim(), user.id)
      setCommentContent('')
      const data = await getComments(supabase, post.id)
      setComments(data)
    } catch (error) {
      console.error('Error creating comment:', error)
      setError('评论发布失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  if (error || !post) {
    return (
      <Layout user={user} onUserChange={setUser}>
        <div className="text-center py-12">
          <p className="text-red-500">{error || '文章不存在'}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user} onUserChange={setUser}>
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <time className="text-sm text-gray-400">{formatDate(post.created_at)}</time>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">{post.title}</h1>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      <section className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">评论 ({comments.length})</h2>
        
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <button
              type="submit"
              className="mt-3 px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
            >
              发表评论
            </button>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
          </form>
        ) : (
          <p className="text-gray-500 mb-4">请先登录才能发表评论</p>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-400">暂无评论</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {comment.author.name || comment.author.email}
                  </span>
                  <span className="text-sm text-gray-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}