import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Card3D } from '@/components/ui/Card3D'

export function LandingPage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
        {/* Massive Animated Blob Background specifically for Hero */}
        <motion.div style={{ y }} className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-brand-300 to-brand-400 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tight leading-tight">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-100 to-brand-300">Ultimate</span><br/> 
              Developer Ecosystem
            </h1>
            <p className="text-xl text-muted max-w-3xl mx-auto font-medium">
              Showcase, deploy, monetize, and scale your code. The premier marketplace where top tech talent meets limitless opportunity.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-200 to-brand-300 shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all text-lg tracking-wide uppercase">
              Start Building Free
            </Link>
            <Link to="/projects" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-foreground bg-background/50 border border-white/10 hover:bg-white/5 transition-all text-lg tracking-wide shadow-inner">
              Explore Marketplace
            </Link>
          </motion.div>
        </div>

        {/* Floating 3D Graphic */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, type: 'spring' }}
          className="relative z-10 mt-20 w-full max-w-4xl mx-auto"
        >
          <div className="relative glass-card rounded-3xl p-2 shadow-xl border border-white/10 transition-transform duration-1000">
            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80" alt="Dashboard Preview" className="rounded-2xl w-full object-cover h-[400px] opacity-90" />
            
            {/* Holographic Overlays */}
            <div className="absolute -right-12 top-10 glass-card p-4 rounded-2xl animate-float">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <div>
                  <div className="text-sm font-bold text-foreground">NextJS Deployed</div>
                  <div className="text-xs text-brand-200">12s ago</div>
                </div>
              </div>
            </div>
            <div className="absolute -left-12 bottom-20 glass-card p-4 rounded-2xl animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">💰</span>
                <div>
                  <div className="text-sm font-bold text-foreground">Sale: FlexAuth</div>
                  <div className="text-xs text-green-400">+$149.00</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 relative z-10 w-full max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-foreground">Everything You Need</h2>
          <p className="text-lg text-muted">A comprehensive toolset bridging the gap between creation and monetization.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: '1-Click Deployment', desc: 'Push directly to Vercel, Railway, or AWS straight from your ProShare dashboard.', icon: '⚡' },
            { title: 'AI Code Evaluation', desc: 'Automated scoring of AI use, Backend architecture, and Frontend design quality.', icon: '🧠' },
            { title: 'Secure Credential Swap', desc: 'Instantly transfer digital asset ownership with automated credential rotation upon sale.', icon: '🔐' }
          ].map((feat, i) => (
            <Card3D key={i} className="h-full">
              <div className="glass-card h-full rounded-[2rem] p-8 hover:border-brand-200/50 transition-colors flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-3xl mb-6 shadow-3d-hover">{feat.icon}</div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feat.title}</h3>
                <p className="text-muted leading-relaxed">{feat.desc}</p>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 px-4 relative z-10 bg-black/10 dark:bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-around gap-12 text-center">
          <div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-100 to-brand-300 mb-2">10k+</div>
            <div className="text-sm font-bold text-muted uppercase tracking-widest">Active Developers</div>
          </div>
          <div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-brand-400 mb-2">$2M+</div>
            <div className="text-sm font-bold text-muted uppercase tracking-widest">Creator Earnings</div>
          </div>
          <div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500 mb-2">45k</div>
            <div className="text-sm font-bold text-muted uppercase tracking-widest">Projects Listed</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 relative z-10 text-center">
        <div className="max-w-3xl mx-auto glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-200/20 to-transparent group-hover:scale-105 transition-transform duration-700" />
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-8 relative z-10">Ready to Ship?</h2>
          <p className="text-xl text-muted mb-10 relative z-10">Join the thousands of developers building the future of the web, together.</p>
          <Link to="/register" className="inline-block px-10 py-5 rounded-2xl font-bold text-white bg-gradient-to-r from-brand-300 to-brand-500 shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all text-xl uppercase tracking-wider relative z-10">
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  )
}
