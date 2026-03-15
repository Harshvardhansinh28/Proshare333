import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'

interface Post {
  id: string
  content: string
  mediaUrls: string[]
  createdAt: string
  user: {
    id: string
    username: string
    avatarUrl: string | null
  }
  _count: {
    likes: number
    comments: number
  }
}

interface TrendingProject {
  id: string
  title: string
  slug: string
  category: string | null
  rating?: {
    aiScore: number
  }
}

export function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [trending, setTrending] = useState<TrendingProject[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [activeComments, setActiveComments] = useState<Record<string, { body: string; list: any[] }>>({})

  useEffect(() => {
    fetchFeed()
    fetchTrending()
  }, [])

  const fetchFeed = async () => {
    try {
      const { data } = await api.get('/community/feed')
      setPosts(data)
    } catch (err) {
      console.error('Failed to fetch feed', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrending = async () => {
    try {
      const { data } = await api.get('/community/trending')
      setTrending(data)
    } catch (err) {
      console.error('Failed to fetch trending', err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/uploads/image', formData)
      setMediaUrls(prev => [...prev, data.url])
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const handlePost = async () => {
    if (!newPostContent.trim() && mediaUrls.length === 0) return
    setPosting(true)
    try {
      await api.post('/community/posts', { 
        content: newPostContent,
        mediaUrls
      })
      setNewPostContent('')
      setMediaUrls([])
      fetchFeed()
    } catch (err) {
      console.error('Failed to create post', err)
    } finally {
      setPosting(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/community/posts/${postId}/like`)
      fetchFeed()
    } catch (err) {
      try {
        await api.delete(`/community/posts/${postId}/like`)
        fetchFeed()
      } catch (e) {
        console.error('Like toggle failed', e)
      }
    }
  }

  const handleReport = async (postId: string) => {
    const reason = window.prompt('Reason for reporting this post?')
    if (!reason) return
    try {
      await api.post('/community/report', { targetType: 'POST', targetId: postId, reason })
      alert('Post reported to the Sentinel. Thank you for keeping ProShare safe.')
    } catch (err) {
      console.error('Failed to report', err)
    }
  }

  const toggleComments = async (postId: string) => {
    if (activeComments[postId]) {
      const newComments = { ...activeComments }
      delete newComments[postId]
      setActiveComments(newComments)
    } else {
      try {
        const { data } = await api.get(`/community/posts/${postId}/comments`)
        setActiveComments({ ...activeComments, [postId]: { body: '', list: data } })
      } catch (err) {
        console.error('Failed to fetch comments', err)
      }
    }
  }

  const handleAddComment = async (postId: string) => {
    const body = activeComments[postId]?.body
    if (!body?.trim()) return
    try {
      await api.post(`/community/posts/${postId}/comments`, { body })
      const { data } = await api.get(`/community/posts/${postId}/comments`)
      setActiveComments({ ...activeComments, [postId]: { body: '', list: data } })
      fetchFeed()
    } catch (err) {
      console.error('Failed to add comment', err)
    }
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const getFullUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${baseUrl}${url}`
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] pb-20">
      
      <section className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-200 to-brand-300" />
          <div className="flex gap-4 items-start">
            <img 
              src={getFullUrl(user?.avatarUrl) || `https://i.pravatar.cc/150?u=${user?.id}`} 
              alt="You" 
              className="w-12 h-12 rounded-full border border-white/20 object-cover" 
            />
            <div className="flex-1 space-y-3">
              <textarea 
                placeholder="Share your latest deployment or finding..." 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-transparent border-b border-brand-200/30 text-foreground placeholder:text-muted focus:border-brand-300 outline-none resize-none py-2 transition-all min-h-[80px]"
              />
              
              {mediaUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {mediaUrls.map(url => (
                    <img key={url} src={getFullUrl(url)!} className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-3 text-brand-300 dark:text-brand-100">
                  <label className="hover:text-brand-400 hover:scale-110 transition-all p-1 cursor-pointer">
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    🖼️
                  </label>
                  {uploading && <span className="text-[10px] animate-pulse">Uploading...</span>}
                </div>
                <button 
                  onClick={handlePost}
                  disabled={posting || (!newPostContent.trim() && mediaUrls.length === 0)}
                  className="rounded-pill bg-brand-200 px-6 py-1.5 text-sm font-semibold text-white shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-20 text-muted">Loading feed...</div>
          ) : posts.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center text-muted">
              No posts yet.
            </div>
          ) : posts.map((post) => (
            <motion.div key={post.id} className="glass-card rounded-3xl p-6 group relative">
              <button 
                onClick={() => handleReport(post.id)}
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-red-400/60 hover:text-red-400"
              >
                REPORT
              </button>
              <div className="flex gap-3 items-center mb-4">
                <Link to={`/u/${post.user.id}`}>
                  <img 
                    src={getFullUrl(post.user.avatarUrl) || `https://i.pravatar.cc/150?u=${post.user.id}`} 
                    className="w-10 h-10 rounded-full border border-brand-200 object-cover" 
                  />
                </Link>
                <div>
                  <Link to={`/u/${post.user.id}`} className="font-semibold text-foreground hover:text-brand-200 transition-colors">
                    {post.user.username}
                  </Link>
                  <p className="text-xs text-muted">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-foreground/90 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              {post.mediaUrls?.map(url => (
                <img key={url} src={getFullUrl(url)!} className="w-full rounded-2xl mb-4 border border-white/5 shadow-2xl" />
              ))}
              <div className="flex gap-6 border-t border-white/10 pt-4 text-xs font-bold uppercase tracking-widest text-brand-300">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 hover:scale-110 transition-transform">
                  👍 Like ({post._count?.likes || 0})
                </button>
                <button onClick={() => toggleComments(post.id)} className="flex items-center gap-2 hover:scale-110 transition-transform">
                  💬 Comment ({post._count?.comments || 0})
                </button>
              </div>

              {activeComments[post.id] && (
                <div className="mt-6 space-y-4 pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-white/5 rounded-pill px-4 py-2 text-sm outline-none border border-white/10 focus:border-brand-300" 
                      placeholder="Write a comment..." 
                      value={activeComments[post.id].body}
                      onChange={(e) => setActiveComments({...activeComments, [post.id]: { ...activeComments[post.id], body: e.target.value }})}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <button onClick={() => handleAddComment(post.id)} className="text-brand-300 font-bold text-xs uppercase">Send</button>
                  </div>
                  <div className="space-y-3">
                    {activeComments[post.id].list.map((c: any) => (
                      <div key={c.id} className="flex gap-2 items-start">
                        <img src={getFullUrl(c.user.avatarUrl) || `https://i.pravatar.cc/150?u=${c.user.id}`} className="w-6 h-6 rounded-full" />
                        <div className="flex-1 bg-white/5 p-3 rounded-2xl">
                          <p className="text-xs font-bold text-brand-200">{c.user.username}</p>
                          <p className="text-sm text-foreground/90">{c.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <aside className="space-y-8">
        <motion.div className="glass-card rounded-[2rem] p-6 sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-foreground">Trending Projects</h2>
          </div>
          <div className="space-y-5">
            {trending.map((proj, idx) => (
              <Link key={proj.id} to={`/projects/${proj.slug}`} className="group block">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-foreground group-hover:text-brand-200">{idx + 1}. {proj.title}</h3>
                  <div className="text-xs font-bold bg-brand-300/20 px-2 py-0.5 rounded-pill">AI: {proj.rating?.aiScore || 0}</div>
                </div>
                <p className="text-xs text-muted">{proj.category || 'General'}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </aside>
    </div>
  )
}
