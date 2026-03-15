import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: ReactNode
}

export function MainLayout({ children }: Props) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-brand-500/10 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 flex items-center justify-center rounded-lg bg-transparent overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-widest text-foreground uppercase">ProShare</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <NavLink to="/projects" label="Projects" current={location.pathname.startsWith('/projects')} />
            <NavLink to="/feed" label="Feed" current={location.pathname === '/feed'} />
            <NavLink to="/wallet" label="Wallet" current={location.pathname.startsWith('/wallet')} />
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted hover:text-foreground"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={`/u/${user.id}`}
                  className="px-3 py-1.5 rounded-lg border border-brand-500/20 hover:bg-brand-500/5 transition-colors font-semibold text-brand-300"
                >
                  Account
                </Link>
                <button
                  onClick={logout}
                  className="text-muted hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-pill bg-gradient-to-r from-brand-200 to-brand-300 px-5 py-2 text-white font-semibold shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 relative z-10">{children}</div>
      </main>

      <footer className="mt-auto border-t border-white/10 dark:border-white/5 bg-background/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>© {new Date().getFullYear()} ProShare. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface NavProps {
  to: string
  label: string
  current: boolean
}

function NavLink({ to, label, current }: NavProps) {
  return (
    <Link to={to} className="relative group px-2 py-1">
      <span className={`transition-colors duration-200 ${current ? 'text-foreground font-semibold' : 'text-muted group-hover:text-foreground'}`}>
        {label}
      </span>
      {current && (
        <motion.span
          layoutId="nav-pill"
          className="absolute -inset-x-2 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-brand-100 to-brand-300"
        />
      )}
    </Link>
  )
}

