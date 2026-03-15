import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card3D } from '@/components/ui/Card3D'

type Project = {
  id: number
  slug: string
  name: string
  category: string
  description: string
  price: string
  aiScore: number
  backendScore: number
  designScore: number
  link?: string | null
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(100) // Start with 100, allow infinite loading

  useEffect(() => {
    fetch('/mock/projects.json')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load mock projects', err)
        setLoading(false)
      })
  }, [])

  const filteredProjects = projects
    .filter(p => filter === 'All' || p.category === filter)
    .filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    
  const displayedProjects = filteredProjects.slice(0, visibleCount)

  const handleScroll = () => {
    // Basic auto-load when near bottom
    if (window.innerHeight + document.documentElement.scrollTop + 500 >= document.documentElement.offsetHeight) {
      setVisibleCount(prev => Math.min(prev + 100, filteredProjects.length))
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [filteredProjects.length])

  // Reset visible count when filter or search changes
  useEffect(() => {
    setVisibleCount(100)
  }, [filter, search])



  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Project Marketplace</h1>
          <p className="text-muted text-sm max-w-lg">Discover, buy, and deploy high-quality technical assets from top developers worldwide.</p>
        </div>
        
        <div className="w-full md:w-auto flex gap-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${filteredProjects.length} assets...`}
            className="w-full md:w-64 rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-300 text-foreground shadow-inner"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'AI Model', 'Microservice', 'Template', 'Database', 'SaaS', 'API', 'Dataset'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${filter === f ? 'bg-brand-200 text-white shadow-3d' : 'bg-brand-400/20 text-brand-300 dark:text-brand-100 hover:bg-brand-400/40'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-20 text-center text-muted animate-pulse">Loading vast marketplace...</div>
        ) : displayedProjects.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted">No assets found matching your criteria.</div>
        ) : (
          displayedProjects.map((proj, idx) => (
            <motion.div 
              key={proj.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % 12) * 0.05 }}
            >
            {proj.link ? (
              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="block h-full cursor-pointer">
                <Card3D className="glass-card h-full rounded-[2rem] p-1 flex flex-col hover:border-brand-200/50 transition-colors">
                  <div className="bg-gradient-to-br from-brand-400/20 to-brand-300/10 rounded-t-[1.8rem] rounded-b-xl p-6 flex-1 flex flex-col border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="text-xs font-bold uppercase tracking-wider text-green-400 px-3 py-1 bg-green-400/10 rounded-full border border-green-400/20">{proj.category}</span>
                      <span className="text-lg font-bold text-foreground bg-white/10 px-3 py-1 rounded-xl backdrop-blur-md">Free Public Resource</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10 pr-8">{proj.name}</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-6 flex-1 relative z-10">{proj.description}</p>
                    
                    {(proj.category !== 'API' && proj.category !== 'Dataset') && (
                      <div className="grid grid-cols-3 gap-2 mt-auto relative z-10">
                        <div className="text-center p-2 rounded-xl bg-background/50 border border-white/5">
                          <div className="text-xs text-muted mb-1">AI</div>
                          <div className="font-bold text-brand-200">{proj.aiScore}</div>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-background/50 border border-white/5">
                          <div className="text-xs text-muted mb-1">Backend</div>
                          <div className="font-bold text-brand-200">{proj.backendScore}</div>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-background/50 border border-white/5">
                          <div className="text-xs text-muted mb-1">Design</div>
                          <div className="font-bold text-brand-200">{proj.designScore}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card3D>
              </a>
            ) : (
              <Link to={`/projects/${proj.slug}`} className="block h-full cursor-pointer">
                <Card3D className="glass-card h-full rounded-[2rem] p-1 flex flex-col hover:border-brand-200/50 transition-colors">
                  <div className="bg-gradient-to-br from-brand-400/20 to-brand-300/10 rounded-t-[1.8rem] rounded-b-xl p-6 flex-1 flex flex-col border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-200 px-3 py-1 bg-brand-200/10 rounded-full border border-brand-200/20">{proj.category}</span>
                      <span className="text-lg font-bold text-foreground bg-white/10 px-3 py-1 rounded-xl backdrop-blur-md">{proj.price}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{proj.name}</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-6 flex-1">{proj.description}</p>
                    
                    {(proj.category !== 'API' && proj.category !== 'Dataset') && (
                      <div className="grid grid-cols-3 gap-2 mt-auto">
                        <div className="text-center p-2 rounded-xl bg-background/50 border border-white/5">
                          <div className="text-xs text-muted mb-1">AI</div>
                          <div className="font-bold text-brand-200">{proj.aiScore}</div>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-background/50 border border-white/5">
                          <div className="text-xs text-muted mb-1">Backend</div>
                          <div className="font-bold text-brand-200">{proj.backendScore}</div>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-background/50 border border-white/5">
                          <div className="text-xs text-muted mb-1">Design</div>
                          <div className="font-bold text-brand-200">{proj.designScore}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card3D>
              </Link>
            )}
          </motion.div>
          ))
        )}
      </div>

      {!loading && displayedProjects.length < filteredProjects.length && (
        <div className="mt-12 text-center text-muted">
          <p className="mb-4">Showing {displayedProjects.length} of {filteredProjects.length} assets.</p>
          <button 
            onClick={() => setVisibleCount(v => Math.min(v + 100, filteredProjects.length))}
            className="px-6 py-2 rounded-xl bg-brand-200 text-white shadow-3d hover:-translate-y-0.5 transition-transform"
          >
            Load Next 100 Assets
          </button>
        </div>
      )}
    </div>
  )
}
