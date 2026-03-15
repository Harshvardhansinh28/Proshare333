import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card3D } from '@/components/ui/Card3D'
import { api } from '@/lib/api'

// --- Types ---
interface SystemHealth {
  apiLatency: string
  errorRate: string
  serverLoad: string
  activeNodes: number
  databaseStatus: string
  uptime: string
}

interface AdvancedStats {
  revenueTrends: { date: string; revenue: number }[]
  userGrowth: { date: string; users: number }[]
}

interface Report {
  id: string
  reporter: { id: string; username: string }
  targetType: string
  targetId: string
  reason: string
  status: string
  createdAt: string
}

// --- Components ---

const TelemetryNode = ({ label, value, sub, pulse }: { label: string; value: string; sub: string; pulse?: boolean }) => (
  <div className="bg-black/20 border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
    <div className="flex justify-between items-start mb-1">
      <span className="text-[10px] font-black uppercase tracking-tighter text-brand-300/80">{label}</span>
      {pulse && <div className="w-1.5 h-1.5 rounded-full bg-brand-300 animate-pulse shadow-[0_0_8px_rgba(var(--brand-300-rgb),0.8)]" />}
    </div>
    <div className="text-xl font-bold text-foreground font-mono">{value}</div>
    <div className="text-[10px] text-muted">{sub}</div>
    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-brand-300/5 rounded-full blur-xl group-hover:bg-brand-300/10 transition-all" />
  </div>
)

const Sparkline = ({ data }: { data: number[] }) => {
  if (!data?.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 100
  const height = 40
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ')
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 stroke-brand-300 fill-none stroke-2">
      <polyline points={points} strokeLinejoin="round" />
    </svg>
  )
}

// --- Main Page ---

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'Nexus' | 'Sentinel' | 'Core' | 'Audit'>('Nexus')
  const [coreSubTab, setCoreSubTab] = useState<'Users' | 'Projects' | 'Transactions'>('Users')
  const queryClient = useQueryClient()

  // Queries
  const { data: health } = useQuery<SystemHealth>({
    queryKey: ['system-health'],
    queryFn: async () => (await api.get('/admin/system-health')).data,
    refetchInterval: 5000, // Very frequent for that live feel
  })

  const { data: advanced } = useQuery<AdvancedStats>({
    queryKey: ['advanced-stats'],
    queryFn: async () => (await api.get('/admin/advanced-stats')).data,
    refetchInterval: 60000,
  })

  const { data: reports } = useQuery<Report[]>({
    queryKey: ['moderation-queue'],
    queryFn: async () => (await api.get('/admin/moderation-queue')).data,
    enabled: activeTab === 'Sentinel',
    refetchInterval: 30000,
  })

  const { data: listData, isLoading: listLoading } = useQuery<any[]>({
    queryKey: ['admin-list', coreSubTab],
    queryFn: async () => (await api.get(`/admin/${coreSubTab.toLowerCase()}`)).data,
    enabled: activeTab === 'Core',
    refetchInterval: 30000,
  })

  // Mutations
  const resolveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'RESOLVE' | 'DISMISS' }) => 
      api.post(`/admin/moderation/${id}`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moderation-queue'] }),
  })

  const userActionMutation = useMutation({
    mutationFn: ({ id, role, isBan }: { id: string; role?: string; isBan?: boolean }) => {
      if (isBan !== undefined) return api.post(`/admin/users/${id}/ban`, { isBanned: isBan })
      return api.post(`/admin/users/${id}/role`, { role })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-list', 'Users'] }),
  })

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const getFullUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${baseUrl}${url}`
  }

  return (
    <div className="flex bg-background min-h-screen text-foreground relative overflow-hidden">
      
      {/* Visual Ambiance */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-300/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Futuristic Sidebar */}
      <aside className="w-16 hover:w-64 transition-all group border-r border-white/5 glass-card-strong z-50 flex flex-col h-screen fixed top-0 left-0">
        <div className="p-4 flex items-center gap-3 mb-10 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-300 to-white/20 flex-shrink-0 flex items-center justify-center font-black text-white text-xs">PS</div>
          <span className="font-black text-lg group-hover:opacity-100 opacity-0 transition-opacity">COMMANDER</span>
        </div>
        
        <nav className="flex-1 space-y-2 px-2">
          {[
            { id: 'Nexus', icon: '⚡', label: 'Ecosystem Pulse' },
            { id: 'Sentinel', icon: '🛡️', label: 'Security Center' },
            { id: 'Core', icon: '📦', label: 'Infrastructure' },
            { id: 'Audit', icon: '📝', label: 'Event Logs' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all relative overflow-hidden group/btn ${
                activeTab === item.id 
                  ? 'bg-brand-300/10 text-brand-300 border border-brand-300/20' 
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-brand-300 rounded-full" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 overflow-hidden group-hover:opacity-100 opacity-0">
             <div className="text-[10px] font-mono text-muted">SECURED BY PS-OS v1.4.2</div>
          </div>
        </div>
      </aside>

      {/* Main Command Display */}
      <main className="flex-1 ml-16 p-8 overflow-y-auto min-h-screen">
        
        {/* Header HUD */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-300">Operational Level 4</span>
              <div className="w-1 h-1 rounded-full bg-brand-300" />
              <span className="text-[10px] font-bold text-muted">Awaiting Input...</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">{activeTab.toUpperCase()} OVERRIDE</h1>
          </div>

          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase text-brand-300">Live Telemetry</div>
              <div className="text-xl font-mono text-foreground font-black">{health?.apiLatency || '--'}</div>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="text-right">
              <div className="text-[10px] font-black uppercase text-green-400">DB Status</div>
              <div className="text-xl font-mono text-foreground font-black">{health?.databaseStatus || 'SYNCING'}</div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          
          {/* NEXUS VIEW */}
          {activeTab === 'Nexus' && (
            <motion.div key="nexus" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-8">
              
              {/* Telemetry HUD */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <TelemetryNode label="Total Load" value={health?.serverLoad || '0%'} sub="Cluster: PRO-EU-1" pulse />
                <TelemetryNode label="Error Rate" value={health?.errorRate || '0%'} sub="Standard Range" />
                <TelemetryNode label="API Pulse" value={health?.apiLatency || '0ms'} sub="Global Average" />
                <TelemetryNode label="Uptime" value={health?.uptime || '0h 0m'} sub="Stable" />
                <TelemetryNode label="Active Nodes" value={String(health?.activeNodes || 0)} sub="Redundant" />
                <TelemetryNode label="Ecosystem Hub" value="OS-X" sub="Version 1.4" />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Financial Intelligence Map */}
                <div className="glass-card-strong rounded-[2.5rem] p-8 border border-white/5 relative group">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xl font-black text-white">Financial Intelligence</h3>
                      <p className="text-xs text-muted">Revenue flow over the last 7 cycles.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-brand-300">${advanced?.revenueTrends.reduce((a, b) => a + b.revenue, 0).toFixed(2)}</div>
                      <div className="text-[10px] font-bold text-muted uppercase">Gross Epoch Revenue</div>
                    </div>
                  </div>
                  
                  <div className="h-48 flex items-end gap-2 px-2">
                    {advanced?.revenueTrends.map((t, i) => {
                       const max = Math.max(...advanced.revenueTrends.map(r => r.revenue)) || 1
                       const height = (t.revenue / max) * 100
                       return (
                         <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                           <div className="relative w-full h-full flex flex-col justify-end gap-1">
                              <motion.div 
                                initial={{ height: 0 }} animate={{ height: `${height}%` }}
                                className="w-full bg-gradient-to-t from-brand-300/20 to-brand-300 rounded-lg relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                              </motion.div>
                              <div className="text-[8px] font-bold text-muted uppercase text-center">{t.date}</div>
                           </div>
                         </div>
                       )
                    })}
                  </div>
                </div>

                {/* User Influx Matrix */}
                <div className="glass-card-strong rounded-[2.5rem] p-8 border border-white/5 relative group">
                   <h3 className="text-xl font-black text-white mb-8">Growth Matrix</h3>
                   <div className="space-y-6">
                      {advanced?.userGrowth.slice(-4).map((g, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="text-[10px] font-mono text-muted w-10">{g.date}</div>
                          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${(g.users / 500) * 100}%` }}
                              className="h-full bg-gradient-to-r from-brand-300 to-white/40"
                            />
                          </div>
                          <div className="text-xs font-black font-mono">{g.users}</div>
                        </div>
                      ))}
                   </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* SENTINEL VIEW */}
          {activeTab === 'Sentinel' && (
            <motion.div key="sentinel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex gap-2">
                    <div className="bg-red-500/20 text-red-300 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/30">H-PRIORITY QUEUE</div>
                    <div className="bg-white/5 text-muted text-[10px] font-black px-3 py-1 rounded-full">ENCRYPTED STREAM</div>
                 </div>
              </div>

              {reports?.length === 0 ? (
                <div className="glass-card rounded-[2rem] p-20 text-center border border-white/5">
                  <div className="text-4xl mb-4">🛡️</div>
                  <h3 className="text-xl font-bold text-foreground">Aegis Clear</h3>
                  <p className="text-muted">No pending reports in the security queue.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reports?.map(report => (
                    <motion.div 
                      key={report.id} 
                      layout 
                      className="glass-card-strong rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-brand-300/30 transition-all"
                    >
                      <div className="flex gap-4 items-center flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-xl shadow-inner">⚠️</div>
                        <div>
                          <div className="text-[10px] font-black text-muted uppercase mb-1">Target: {report.targetType} // ID: {report.targetId.slice(0, 8)}...</div>
                          <div className="text-lg font-bold text-white mb-1">{report.reason}</div>
                          <div className="text-xs text-brand-300">Flagged by @{report.reporter.username}</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={() => resolveMutation.mutate({ id: report.id, action: 'DISMISS' })}
                           className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                         >
                           DISMISS
                         </button>
                         <button 
                           onClick={() => resolveMutation.mutate({ id: report.id, action: 'RESOLVE' })}
                           className="px-6 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                         >
                           RESOLVE ACTION
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* CORE VIEW */}
          {activeTab === 'Core' && (
            <motion.div key="core" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* Core Navigation */}
              <div className="flex gap-4 mb-8">
                 {['Users', 'Projects', 'Transactions'].map(tab => (
                   <button 
                     key={tab}
                     onClick={() => setCoreSubTab(tab as any)}
                     className={`px-6 py-2 rounded-full text-xs font-black transition-all ${coreSubTab === tab ? 'bg-brand-300 text-white shadow-[0_0_20px_rgba(var(--brand-300-rgb),0.4)]' : 'bg-white/5 text-muted hover:text-white'}`}
                   >
                     {tab.toUpperCase()} INFRA
                   </button>
                 ))}
              </div>

              {listLoading ? (
                <div className="p-20 text-center text-brand-300 animate-pulse font-mono uppercase tracking-[0.2em]">Synchronizing Core Clusters...</div>
              ) : (
                <div className="glass-card-strong rounded-[2.5rem] border border-white/5 overflow-hidden">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted">
                           <tr>
                              <th className="p-6">Metadata</th>
                              <th className="p-6">Status/Role</th>
                              <th className="p-6">Economic Impact</th>
                              <th className="p-6 text-right">Sys-Control</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {listData?.map((item: any) => (
                             <tr key={item.id} className="hover:bg-white-[0.02] group/row transition-colors">
                                <td className="p-6">
                                   <div className="flex items-center gap-3">
                                      {coreSubTab === 'Users' ? (
                                        <>
                                          <img src={getFullUrl(item.avatarUrl) || `https://i.pravatar.cc/150?u=${item.id}`} className="w-10 h-10 rounded-full border border-white/10" />
                                          <div>
                                             <div className="font-bold text-white">@{item.username}</div>
                                             <div className="text-[10px] text-muted font-mono">{item.email}</div>
                                          </div>
                                        </>
                                      ) : coreSubTab === 'Projects' ? (
                                        <div>
                                           <div className="font-bold text-white">{item.title}</div>
                                           <div className="text-[10px] text-brand-300 font-mono italic">UID: {item.id.slice(0, 8)}</div>
                                        </div>
                                      ) : (
                                        <div>
                                           <div className="font-bold text-white">Order #{item.id.slice(0, 6)}</div>
                                           <div className="text-[10px] text-muted font-mono">{new Date(item.createdAt).toLocaleString()}</div>
                                        </div>
                                      )}
                                   </div>
                                </td>
                                <td className="p-6">
                                   {coreSubTab === 'Users' ? (
                                     <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${item.role === 'ADMIN' ? 'bg-brand-300/10 border-brand-300/30 text-brand-300' : item.role === 'BANNED' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                                       {item.role}
                                     </span>
                                   ) : coreSubTab === 'Projects' ? (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/5 border border-white/10 text-muted">
                                        {item.status}
                                      </span>
                                   ) : (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-500/10 border border-green-500/30 text-green-400">
                                        COMPLETED
                                      </span>
                                   )}
                                </td>
                                <td className="p-6">
                                   <div className="text-sm font-black font-mono">
                                      {coreSubTab === 'Users' ? `${item._count.projects} Units` : coreSubTab === 'Projects' ? `${item._count.orders} Rev-Events` : `$${(item.amountInCents / 100).toFixed(2)}`}
                                   </div>
                                </td>
                                <td className="p-6 text-right space-x-2">
                                   {coreSubTab === 'Users' && item.role !== 'BANNED' && (
                                     <button 
                                       onClick={() => userActionMutation.mutate({ id: item.id, isBan: true })}
                                       className="text-[10px] font-black text-red-400 hover:text-red-300 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                     >
                                       TERMINATE
                                     </button>
                                   )}
                                   {coreSubTab === 'Users' && (
                                      <button 
                                        onClick={() => userActionMutation.mutate({ id: item.id, role: item.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                                        className="text-[10px] font-black text-brand-300 hover:text-brand-100 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                      >
                                        MOD-ACCESS
                                      </button>
                                   )}
                                </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'Audit' && (
            <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-strong rounded-[2.5rem] p-8 border border-white/5 font-mono">
               <div className="space-y-4">
                  {[
                    { cmd: 'SYS_RELOAD', time: '19:42:01', status: 'OK', origin: 'PS-CORE' },
                    { cmd: 'USER_MOD', time: '19:41:45', status: 'RESOLVED', origin: 'ADM-GREG' },
                    { cmd: 'REV_SYNC', time: '19:40:22', status: 'OK', origin: 'PS-FINANCE' },
                    { cmd: 'SENTINEL_SCAN', time: '19:35:00', status: 'CLEAR', origin: 'MOD-ENGINE' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-6 text-[10px] p-2 bg-white/5 rounded-lg border border-white/5">
                       <span className="text-brand-300 font-black">[{log.time}]</span>
                       <span className="w-24 font-black">CMD::{log.cmd}</span>
                       <span className="flex-1 opacity-50">ORIGIN::{log.origin}</span>
                       <span className={`font-black ${log.status === 'OK' ? 'text-green-400' : 'text-brand-200'}`}>{log.status}</span>
                    </div>
                  ))}
                  <div className="text-center pt-8 text-muted animate-pulse">--- END OF RECENT EPOCH ---</div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
