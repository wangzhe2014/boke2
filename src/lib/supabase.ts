import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SupabaseClient } from '@supabase/supabase-js'

export const createClient = () => createClientComponentClient()

export type BlogPost = {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  published: boolean
  slug: string
}

export type Comment = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
}

export type User = {
  id: string
  email: string
  name: string | null
}

export const getPosts = async (client: SupabaseClient, publishedOnly = true) => {
  let query = client.from('posts').select('*')
  if (publishedOnly) {
    query = query.eq('published', true)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data as BlogPost[]
}

export const getPostBySlug = async (client: SupabaseClient, slug: string) => {
  const { data, error } = await client
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data as BlogPost
}

export const getComments = async (client: SupabaseClient, postId: string) => {
  const { data, error } = await client
    .from('comments')
    .select('*, author:profiles(id, name, email)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as (Comment & { author: User })[]
}

export const createComment = async (
  client: SupabaseClient,
  postId: string,
  content: string,
  authorId: string
) => {
  const { data, error } = await client
    .from('comments')
    .insert({ post_id: postId, content, author_id: authorId })
    .select()
    .single()
  if (error) throw error
  return data as Comment
}

export const createPost = async (
  client: SupabaseClient,
  title: string,
  content: string,
  authorId: string,
  slug: string
) => {
  const { data, error } = await client
    .from('posts')
    .insert({ title, content, author_id: authorId, slug, published: false })
    .select()
    .single()
  if (error) throw error
  return data as BlogPost
}

export const updatePost = async (
  client: SupabaseClient,
  id: string,
  updates: Partial<Pick<BlogPost, 'title' | 'content' | 'published' | 'slug'>>
) => {
  const { data, error } = await client
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as BlogPost
}

export const deletePost = async (client: SupabaseClient, id: string) => {
  const { error } = await client.from('posts').delete().eq('id', id)
  if (error) throw error
}

export const getUserProfile = async (client: SupabaseClient, userId: string) => {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data as User
}