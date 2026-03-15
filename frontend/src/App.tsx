import { Route, Routes } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MainLayout } from './layout/MainLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { AdminLoginPage } from './pages/auth/AdminLoginPage'
import { LandingPage } from './pages/home/LandingPage'
import { FeedPage } from './pages/feed/FeedPage'
import { ProjectsPage } from './pages/projects/ProjectsPage'
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { WalletPage } from './pages/wallet/WalletPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'

export default function App() {
  return (
    <motion.div
      className="min-h-screen bg-brand-50 text-text-dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <MainLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/u/:userId" element={<ProfilePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </MainLayout>
    </motion.div>
  )
}

