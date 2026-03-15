import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
// import { useAuth } from '@/context/AuthContext' // Admin auth might use something separate depending on the backend, for now we mock or use the same

export function AdminLoginPage() {
  const navigate = useNavigate()
  // const { loginAdmin } = useAuth() // Assume an admin login exists or just do standard login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (email === 'vaghelahv333@gmail.com' && password === 'harsh2831@') {
        setTimeout(() => {
          setLoading(false)
          navigate('/admin/dashboard')
        }, 1000)
      } else {
        throw new Error('Invalid Admin Credentials')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Admin Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] glass-card border border-brand-200/50 shadow-3d"
      >
        <div className="p-8 sm:p-12 relative z-10 bg-background/80 backdrop-blur-3xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand-300 to-brand-500 rounded-2xl flex items-center justify-center shadow-3d-hover"
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold mb-2 text-foreground tracking-tight">Admin Portal</h2>
            <p className="text-brand-300 dark:text-brand-100 font-medium">Restricted Access</p>
          </div>
          
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Admin ID / Email</label>
              <input
                type="email"
                placeholder="admin@proshare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-300/30 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Master Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-brand-300/30 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all text-foreground"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 py-3.5 text-sm font-bold text-white shadow-3d hover:shadow-3d-hover disabled:opacity-60 transition-all duration-300 uppercase tracking-wider"
            >
              {loading ? 'Verifying...' : 'Authorize Access'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
