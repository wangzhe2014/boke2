import { useState } from 'react'
import { createClient, type User } from '@/lib/supabase'

interface AuthProps {
  user: User | null
  onUserChange: (user: User | null) => void
}

export default function Auth({ user, onUserChange }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    const { data: { user: newUser }, error: fetchError } = await supabase.auth.getUser()
    if (newUser && newUser.email) {
      const userName = newUser.email.split('@')[0]
      await supabase.from('profiles').upsert({ id: newUser.id, email: newUser.email, name: userName })
      onUserChange({ id: newUser.id, email: newUser.email, name: userName })
    } else if (fetchError) {
      setError(fetchError.message)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      return
    }
    const { data: { user: newUser }, error: fetchError } = await supabase.auth.getUser()
    if (newUser && newUser.email) {
      const profile = await supabase.from('profiles').select('name').eq('id', newUser.id).single()
      onUserChange({ id: newUser.id, email: newUser.email, name: profile.data?.name || null })
    } else if (fetchError) {
      setError(fetchError.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onUserChange(null)
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-600">欢迎, {user.name || user.email}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          退出登录
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <form onSubmit={handleSignIn} className="flex gap-2">
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
        >
          登录
        </button>
        <button
          type="button"
          onClick={handleSignUp}
          className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors"
        >
          注册
        </button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}