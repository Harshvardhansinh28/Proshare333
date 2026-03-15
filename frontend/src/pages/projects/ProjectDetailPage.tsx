import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'

interface Project {
  id: string
  title: string
  description: string
  priceInCents: number
  category: string
  tags: string[]
  slug: string
  rating?: {
    aiScore: number
    backendScore: number
    designScore: number
    overallScore: number
  }
  owner: {
    id: string
    username: string
    avatarUrl: string | null
  }
}

export function ProjectDetailPage() {
  const { slug } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProject()
  }, [slug])

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${slug}`)
      setProject(data)
    } catch (err) {
      console.error('Failed to fetch project', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async () => {
    if (!project) return
    const reason = window.prompt('Reason for reporting this project?')
    if (!reason) return
    try {
      await api.post('/community/report', { targetType: 'PROJECT', targetId: project.id, reason })
      alert('Project reported. The Sentinel is investigating.')
    } catch (err) {
      console.error('Failed to report', err)
    }
  }

  if (loading) return <div className="text-center py-20 text-muted font-mono animate-pulse">Scanning infrastructure...</div>
  if (!project) return <div className="text-center py-20 text-muted">Project not found.</div>

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const getFullUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${baseUrl}${url}`
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <Link to="/projects" className="inline-flex items-center text-sm font-semibold text-brand-200 hover:text-brand-300 mb-8 transition-colors">
        ← Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 xl:gap-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-300/20 rounded-full mix-blend-screen filter blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex gap-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-200 px-3 py-1 bg-brand-200/10 rounded-full border border-brand-200/20">{project.category || 'General'}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white px-3 py-1 bg-gradient-to-r from-brand-300 to-brand-400 rounded-full shadow-sm">Verified</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">{project.title}</h1>
            <p className="text-lg text-foreground/80 leading-relaxed mb-8 max-w-2xl">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-10">
              {project.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-background/50 border border-white/10 text-muted shadow-inner">{tag}</span>
              ))}
            </div>

            <div className="border-t border-white/10 pt-8 mt-4">
              <h3 className="text-xl font-bold text-foreground mb-6">Automated Evaluation Matrix</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricScore label="AI Score" score={project.rating?.aiScore || 0} />
                <MetricScore label="Backend" score={project.rating?.backendScore || 0} />
                <MetricScore label="Design" score={project.rating?.designScore || 0} />
                <MetricScore label="Overall" score={project.rating?.overallScore || 0} highlight />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <div className="glass-card rounded-[2rem] p-8 border border-brand-200/30 shadow-3d relative overflow-hidden group">
            <h2 className="text-3xl font-black text-foreground mb-2">${((project.priceInCents || 0) / 100).toFixed(2)}</h2>
            <p className="text-sm text-muted mb-8">One-time payment for full intellectual property and source transfer.</p>
            
            <button className="w-full rounded-xl bg-gradient-to-r from-brand-200 to-brand-300 py-4 text-sm font-bold text-white shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-300 mb-4 uppercase tracking-widest relative overflow-hidden">
              Buy & Transfer Rights
            </button>
            
            <button className="w-full rounded-xl bg-background/50 border border-white/10 py-3.5 text-sm font-bold text-foreground hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2">
              Deploy Instantly
            </button>

            <button 
              onClick={handleReport}
              className="w-full mt-4 text-[10px] font-black text-red-400 opacity-50 hover:opacity-100 transition-opacity uppercase"
            >
              Report Misconduct
            </button>
          </div>

          <div className="glass-card rounded-[2rem] p-6 flex flex-col items-center text-center">
            <Link to={`/u/${project.owner.id}`}>
              <img src={getFullUrl(project.owner.avatarUrl) || `https://i.pravatar.cc/150?u=${project.owner.id}`} alt={project.owner.username} className="w-20 h-20 rounded-full border-4 border-background shadow-md mb-4 -mt-12 bg-background relative z-10" />
            </Link>
            <h3 className="text-lg font-bold text-foreground">@{project.owner.username}</h3>
             <Link to={`/u/${project.owner.id}`} className="w-full mt-4 py-2 rounded-xl border border-brand-200/50 text-sm font-bold text-brand-200 hover:bg-brand-200/10 transition-colors">
              View Developer Profile
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function MetricScore({ label, score, highlight = false }: { label: string, score: number, highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border ${highlight ? 'bg-gradient-to-br from-brand-300 to-brand-400 border-white/20 shadow-3d transform -translate-y-1' : 'bg-background/40 border-white/5'}`}>
      <div className={`text-xs font-semibold mb-1 ${highlight ? 'text-brand-50' : 'text-muted'}`}>{label}</div>
      <div className={`text-3xl font-black ${highlight ? 'text-white' : 'text-brand-200'}`}>{score}</div>
    </div>
  )
}
