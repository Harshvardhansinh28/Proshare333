import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="flex w-full max-w-5xl overflow-hidden rounded-[2rem] glass-card"
      >
        {/* Visual Identity Side */}
        <div className="hidden w-1/2 p-12 lg:flex flex-col justify-between bg-gradient-to-br from-brand-500/80 to-brand-300/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] opacity-20 mix-blend-overlay bg-cover bg-center" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome Back to ProShare</h1>
            <p className="text-brand-100 text-lg">Your gateway to the ultimate developer marketplace. Deploy, monetize, and scale your code.</p>
          </div>
          <div className="relative z-10">
            <div className="flex -space-x-4 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-brand-500 bg-brand-200" />
              ))}
            </div>
            <p className="text-sm text-brand-50 font-medium">Join 10,000+ developers discovering true collaboration.</p>
          </div>
        </div>

        {/* Login Form Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 relative z-10 bg-background/50">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-foreground">Sign In</h2>
              <p className="text-muted">Enter your credentials to access your account</p>
            </div>
            
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-300 transition-all text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-300 transition-all text-foreground"
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <Link to="/register" className="text-sm text-brand-200 hover:text-brand-300 transition-colors font-medium">Create account</Link>
                <Link to="/admin/login" className="text-xs text-muted hover:text-foreground transition-colors italic">Admin Login</Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-300 to-brand-400 py-3.5 text-sm font-bold text-white shadow-3d hover:shadow-3d-hover disabled:opacity-60 transition-all duration-300"
              >
                {loading ? 'Authenticating...' : 'Sign In Now'}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
