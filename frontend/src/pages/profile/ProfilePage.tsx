import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card3D } from '@/components/ui/Card3D'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface ProfileData {
  id: string
  headline: string | null
  resumeUrl: string | null
  githubUrl: string | null
  portfolioUrl: string | null
  linkedinUrl: string | null
  location: string | null
  skills: string[]
  user: {
    id: string
    username: string
    bio: string | null
    avatarUrl: string | null
    createdAt: string
  }
}

export function ProfilePage() {
  const { userId } = useParams()
  const { user: currentUser, refreshUser } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'Portfolio' | 'Activity' | 'Settings'>('Portfolio')
  const [uploading, setUploading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    headline: '',
    bio: '',
    location: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    skills: '',
    avatarUrl: ''
  })

  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    if (userId) {
      fetchProfile()
      fetchProjects()
    }
  }, [userId])

  const fetchProfile = async () => {
    if (!userId) return
    try {
      const { data } = await api.get(`/profiles/${userId}`)
      if (data.user && !data.id) {
        setProfile({
          id: '',
          headline: '',
          resumeUrl: '',
          githubUrl: '',
          portfolioUrl: '',
          linkedinUrl: '',
          location: '',
          skills: [],
          user: data.user
        })
      } else {
        setProfile(data)
      }
      
      if (data) {
        setEditForm({
          headline: data.headline || '',
          bio: data.user?.bio || '',
          location: data.location || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          skills: data.skills?.join(', ') || '',
          avatarUrl: data.user?.avatarUrl || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects', { params: { ownerId: userId } })
      setProjects(data)
    } catch (err) {
      console.error('Failed to fetch projects', err)
    }
  }

  const handleFollow = async () => {
    if (!userId) return
    try {
      if (isFollowing) {
        await api.delete(`/community/follow/${userId}`)
      } else {
        await api.post(`/community/follow/${userId}`)
      }
      setIsFollowing(!isFollowing)
    } catch (err) {
      console.error('Follow toggle failed', err)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/uploads/image', formData)
      setEditForm(prev => ({ ...prev, avatarUrl: data.url }))
      await api.put('/profiles/me', { avatarUrl: data.url })
      await refreshUser()
      fetchProfile()
    } catch (err) {
      console.error('Avatar upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await api.put('/profiles/me', {
        ...editForm,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(s => s)
      })
      setIsEditing(false)
      await refreshUser()
      fetchProfile()
    } catch (err) {
      console.error('Failed to update profile', err)
    }
  }

  if (loading) return <div className="text-center py-20 text-muted">Loading profile...</div>
  if (!profile) return <div className="text-center py-20 text-muted">Profile not found</div>

  const baseUrl = import.meta.env.VITE_API_URL
  const getFullUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${baseUrl}${url}`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
      
      {/* 3D Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-200/20 rounded-full mix-blend-screen filter blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-brand-200 to-brand-400 shadow-3d">
              <img 
                src={getFullUrl(profile.user.avatarUrl) || `https://i.pravatar.cc/150?u=${profile.user.id}`} 
                alt="Profile" 
                className="w-full h-full rounded-full border-4 border-background object-cover" 
              />
            </div>
            {isOwnProfile && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                <span className="text-white text-xs font-bold">{uploading ? '...' : 'Change'}</span>
              </label>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {profile.user.username}
            </h1>
            <p className="text-brand-300 dark:text-brand-100 font-medium mb-2">
              {profile.headline || 'Member'}
            </p>
            <p className="text-muted text-sm max-w-lg mb-6 mx-auto md:mx-0">
              {profile.user.bio || 'No bio yet.'}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-center">
              {profile.location && (
                <span className="text-xs font-semibold text-muted bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  📍 {profile.location}
                </span>
              )}
              {profile.skills.map(skill => (
                <span key={skill} className="text-xs font-semibold text-brand-200 bg-brand-200/10 px-3 py-1 rounded-full border border-brand-200/20">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-xl bg-gradient-to-r from-brand-200 to-brand-300 px-8 py-3 text-sm font-bold text-white shadow-3d hover:shadow-3d-hover transition-all"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            ) : (
              <>
                <button 
                  onClick={handleFollow}
                  className={`rounded-xl px-8 py-3 text-sm font-bold shadow-3d hover:shadow-3d-hover transition-all ${isFollowing ? 'bg-background border border-brand-300 text-brand-300' : 'bg-gradient-to-r from-brand-300 to-brand-400 text-white'}`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow Dev'}
                </button>
                <button className="rounded-xl bg-background/50 border border-white/10 px-8 py-3 text-sm font-bold text-foreground hover:bg-white/5 transition-all">
                  Message
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-12 pt-12 border-t border-white/10 space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted">Headline</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl border border-white/10 px-4 py-3 outline-none focus:border-brand-300 transition-all text-foreground"
                  value={editForm.headline}
                  onChange={e => setEditForm({...editForm, headline: e.target.value})}
                  placeholder="e.g. Senior Full-stack Developer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted">Location</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl border border-white/10 px-4 py-3 outline-none focus:border-brand-300 transition-all text-foreground"
                  value={editForm.location}
                  onChange={e => setEditForm({...editForm, location: e.target.value})}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase text-muted">Bio</label>
                <textarea 
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl border border-white/10 px-4 py-3 outline-none focus:border-brand-300 transition-all text-foreground min-h-[100px]"
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Share a bit about yourself..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted">Skills (comma separated)</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl border border-white/10 px-4 py-3 outline-none focus:border-brand-300 transition-all text-foreground"
                  value={editForm.skills}
                  onChange={e => setEditForm({...editForm, skills: e.target.value})}
                  placeholder="React, TypeScript, AI..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted">Portfolio URL</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl border border-white/10 px-4 py-3 outline-none focus:border-brand-300 transition-all text-foreground"
                  value={editForm.portfolioUrl}
                  onChange={e => setEditForm({...editForm, portfolioUrl: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleUpdate}
                className="rounded-xl bg-brand-300 px-12 py-3 font-bold text-white shadow-3d hover:shadow-3d-hover transition-all"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 pb-2">
        {['Portfolio', 'Activity'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`text-lg font-semibold transition-colors relative ${activeTab === tab ? 'text-foreground' : 'text-muted hover:text-foreground/80'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="profileTab" className="absolute -bottom-[9px] left-0 w-full h-0.5 bg-brand-300 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Portfolio' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground">Projects</h2>
            {isOwnProfile && (
              <button className="text-sm font-semibold text-brand-200 hover:text-brand-300 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Upload Project
              </button>
            )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center text-muted col-span-full">
                No public projects yet.
              </div>
            ) : projects.map(proj => (
              <Card3D key={proj.id} className="p-6">
                <img src={getFullUrl(proj.thumbnailUrl) || '/project-placeholder.png'} className="w-full h-32 object-cover rounded-xl mb-4" />
                <h3 className="font-bold text-foreground mb-1">{proj.title}</h3>
                <p className="text-xs text-muted line-clamp-2 mb-4">{proj.description}</p>
                <Link to={`/projects/${proj.slug}`} className="text-xs font-bold text-brand-300 hover:text-brand-400 transition-colors">View Details →</Link>
              </Card3D>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'Activity' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
          <div className="glass-card rounded-3xl p-12 text-center text-muted">
            Posts and interactions will appear here in the next update.
          </div>
        </motion.div>
      )}

    </div>
  )
}
