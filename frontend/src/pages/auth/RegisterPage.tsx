import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState('DEVELOPER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, username, password, category)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Registration failed.'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, type: 'spring' }}
        className="flex w-full max-w-5xl overflow-hidden rounded-[2rem] glass-card flex-row-reverse"
      >
        {/* Visual Identity Side */}
        <div className="hidden w-1/2 p-12 lg:flex flex-col justify-end bg-gradient-to-tr from-brand-400/90 to-brand-200/90 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80')] opacity-20 mix-blend-overlay bg-cover bg-center" />
          <div className="relative z-10 text-right">
            <h1 className="text-4xl font-bold text-white mb-4">Start Your Journey</h1>
            <p className="text-brand-50 text-lg">Build. Convert projects to products. Sell APIs. Get Hired.</p>
          </div>
        </div>

        {/* Register Form Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 relative z-10 bg-background/50">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-foreground">Create Account</h2>
              <p className="text-muted">Join the premier network for developers</p>
            </div>
            
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Username</label>
                <input
                  type="text"
                  placeholder="dev_wizard"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand-200 focus:ring-1 focus:ring-brand-200 transition-all text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand-200 focus:ring-1 focus:ring-brand-200 transition-all text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand-200 focus:ring-1 focus:ring-brand-200 transition-all text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Account Type</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand-200 focus:ring-1 focus:ring-brand-200 transition-all text-foreground"
                >
                  <option value="DEVELOPER">Developer / Student</option>
                  <option value="FREELANCER">Freelancer</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="TECH_ENTHUSIAST">Tech Enthusiast</option>
                </select>
              </div>

              <div className="flex items-center justify-center mt-2">
                <p className="text-sm text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand-200 hover:text-brand-300 transition-colors font-medium">Sign in</Link>
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-200 to-brand-300 py-3.5 text-sm font-bold text-white shadow-3d hover:shadow-3d-hover disabled:opacity-60 transition-all duration-300"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
