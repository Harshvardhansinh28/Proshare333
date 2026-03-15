import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

const MOCK_TRANSACTIONS = [
  { id: 'TX-9921', date: '2023-11-20', description: 'API Subscription (Weather)', amount: '-$0.00', status: 'Completed', type: 'expense' },
  { id: 'TX-9920', date: '2023-11-18', description: 'Sold NeuroForge License', amount: '+$299.00', status: 'Completed', type: 'income' },
  { id: 'TX-9919', date: '2023-11-15', description: 'Platform Withdrawal', amount: '-$1,200.00', status: 'Processing', type: 'withdrawal' },
  { id: 'TX-9918', date: '2023-11-10', description: 'Sold UI Template', amount: '+$89.00', status: 'Completed', type: 'income' },
]

export function WalletPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState('$3,492.50')

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto pt-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Wallet</h1>
          <p className="text-muted">Manage your earnings, purchases, and platform balance.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-brand-200 mb-1">Available Balance</p>
          <h2 className="text-4xl font-black text-foreground">{balance}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-2xl p-6 text-center border border-white/5 hover:border-brand-200/50 transition-colors shadow-3d group"
        >
          <div className="w-12 h-12 rounded-full bg-brand-200/20 text-brand-200 mx-auto mb-4 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">➕</div>
          <h3 className="font-bold text-foreground mb-1">Add Funds</h3>
          <p className="text-xs text-muted">Deposit via Crypto or Card</p>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-2xl p-6 text-center border border-white/5 hover:border-brand-300/50 transition-colors shadow-3d group"
        >
          <div className="w-12 h-12 rounded-full bg-brand-300/20 text-brand-300 mx-auto mb-4 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💸</div>
          <h3 className="font-bold text-foreground mb-1">Withdraw</h3>
          <p className="text-xs text-muted">Transfer to external wallet</p>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-2xl p-6 text-center border border-white/5 hover:border-brand-400/50 transition-colors shadow-3d group"
        >
          <div className="w-12 h-12 rounded-full bg-brand-400/20 text-brand-400 mx-auto mb-4 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">⚙️</div>
          <h3 className="font-bold text-foreground mb-1">Settings</h3>
          <p className="text-xs text-muted">Manage payment methods</p>
        </motion.button>
      </div>

      <div className="glass-card rounded-[2rem] p-8 border border-white/5 overflow-hidden">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">Recent Transactions</h3>
          <button className="text-sm text-brand-200 font-semibold hover:text-brand-300">Download CSV</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-semibold text-muted uppercase tracking-wider">
                <th className="pb-4 pr-4">Transaction ID</th>
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4 w-1/3">Description</th>
                <th className="pb-4 px-4">Amount</th>
                <th className="pb-4 pl-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4 pr-4 font-mono text-brand-100">{tx.id}</td>
                  <td className="py-4 px-4 text-muted">{tx.date}</td>
                  <td className="py-4 px-4 font-semibold text-foreground">{tx.description}</td>
                  <td className={`py-4 px-4 font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-foreground'}`}>
                    {tx.amount}
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      tx.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

