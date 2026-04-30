import Link from 'next/link'
import type { BlogPost } from '@/lib/supabase'

interface PostCardProps {
  post: BlogPost
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow">
      <time className="text-sm text-gray-400">{formatDate(post.created_at)}</time>
      <h2 className="text-xl font-semibold text-gray-900 mt-2 mb-3">
        <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors">
          {post.title}
        </Link>
      </h2>
      <p className="text-gray-600 leading-relaxed">
        {truncateContent(post.content)}
      </p>
      <Link
        href={`/posts/${post.slug}`}
        className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
      >
        阅读更多 →
      </Link>
    </article>
  )
}