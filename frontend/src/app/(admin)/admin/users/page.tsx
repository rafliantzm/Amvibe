'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, RefreshCw, Search, ShieldOff, ShieldCheck,
  Trash2, Terminal, Activity, AlertTriangle, CheckCircle2,
  XCircle, Loader2, ChevronDown, ChevronUp, Code, Mail,
  Eye, X, BarChart2, Clock, Layers, UserX, UserCheck, Info,
} from 'lucide-react'
import { GlitchText } from '@/components/ui/GlitchText'

interface UserRow {
  id: string
  email: string
  name: string | null
  avatar: string | null
  provider: string
  createdAt: string
  lastSignIn: string | null
  banned: boolean
  confirmed: boolean
  projectCount: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ProviderBadge({ provider }: { provider: string }) {
  if (provider === 'github') return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest bg-white/5 border border-white/10 px-1.5 py-0.5 text-[#888]">
      <Code size={9} />GitHub
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest bg-white/5 border border-white/10 px-1.5 py-0.5 text-[#888]">
      <Mail size={9} />Email
    </span>
  )
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [filtered, setFiltered] = useState<UserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'lastSignIn' | 'projectCount'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null)
  const [stats, setStats] = useState({ total: 0, active: 0, banned: 0, confirmed: 0 })

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(data.users)
      setStats({
        total: data.total,
        active: data.users.filter((u: UserRow) => !u.banned).length,
        banned: data.users.filter((u: UserRow) => u.banned).length,
        confirmed: data.users.filter((u: UserRow) => u.confirmed).length,
      })
    } catch (e: any) {
      showToast('error', `FETCH_ERR: ${e.message}`)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    let result = [...users]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        u.email.toLowerCase().includes(q) ||
        (u.name?.toLowerCase().includes(q) ?? false)
      )
    }
    result.sort((a, b) => {
      let av: any = a[sortBy] ?? ''
      let bv: any = b[sortBy] ?? ''
      if (typeof av === 'string') av = new Date(av).getTime()
      if (typeof bv === 'string') bv = new Date(bv).getTime()
      return sortDir === 'desc' ? bv - av : av - bv
    })
    setFiltered(result)
  }, [users, search, sortBy, sortDir])

  const handleBanToggle = async (user: UserRow) => {
    const action = user.banned ? 'unban' : 'ban'
    setActionLoading(user.id + action)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast('success', `${action.toUpperCase()}: ${user.email}`)
      await fetchUsers()
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, banned: action === 'ban' } : null)
      }
    } catch (e: any) {
      showToast('error', `${action.toUpperCase()}_ERR: ${e.message}`)
    }
    setActionLoading(null)
  }

  const handleDelete = async (user: UserRow) => {
    setActionLoading(user.id + 'delete')
    setConfirmDelete(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast('success', `DELETED: ${user.email}`)
      if (selectedUser?.id === user.id) setSelectedUser(null)
      await fetchUsers()
    } catch (e: any) {
      showToast('error', `DELETE_ERR: ${e.message}`)
    }
    setActionLoading(null)
  }

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col
      ? sortDir === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />
      : <ChevronDown size={10} className="opacity-30" />

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6 pt-4 font-sans relative"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center space-x-3 px-5 py-3 border text-[11px] font-mono uppercase tracking-widest shadow-2xl ${
              toast.type === 'success'
                ? 'bg-[#020202] border-[#34d399]/50 text-[#34d399] shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                : 'bg-[#020202] border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#050505] border border-red-500/50 p-8 max-w-md w-full mx-4 relative shadow-[0_0_40px_rgba(239,68,68,0.2)]"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500"></div>
              <AlertTriangle className="text-red-400 mb-4" size={24} />
              <p className="text-[11px] font-mono uppercase tracking-widest text-red-400 mb-2">Permanent Action</p>
              <h3 className="text-xl font-bold text-[#ededed] mb-2 tracking-tight">Delete User?</h3>
              <p className="text-[12px] font-mono text-[#888] mb-6 leading-relaxed">
                This will permanently delete <span className="text-red-300">{confirmDelete.email}</span> and all associated data from Supabase Auth. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 border border-white/10 text-[#888] hover:border-white/20 hover:text-white text-[11px] font-mono uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 border border-red-400 text-white text-[11px] font-mono uppercase tracking-widest transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div variants={itemVariants} className="mb-8 border-b border-blue-400/20 pb-6 relative">
        <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-blue-400 to-transparent" />
        <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-blue-400" />
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 text-[10px] font-mono tracking-[0.2em] uppercase mb-4 border border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] w-max">
          <Users size={11} className="animate-pulse" />
          <span>Governance Module</span>
        </div>
        <h1 className="text-4xl font-sans font-bold tracking-tight text-[#ededed] mb-2 flex items-center">
          <Terminal className="mr-3 text-blue-400 opacity-70" size={28} />
          USER MANAGEMENT
        </h1>
        <p className="text-[#888] font-mono text-[11px] uppercase tracking-widest mt-3">
          Monitor, manage, and control access for all registered accounts.
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'blue' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'green' },
          { label: 'Banned', value: stats.banned, icon: UserX, color: 'red' },
          { label: 'Confirmed', value: stats.confirmed, icon: ShieldCheck, color: 'purple' },
        ].map(s => (
          <div key={s.label} className={`p-5 bg-[#020202] border relative overflow-hidden ${
            s.color === 'blue' ? 'border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.05)]' :
            s.color === 'green' ? 'border-[#34d399]/30 shadow-[inset_0_0_15px_rgba(52,211,153,0.05)]' :
            s.color === 'red' ? 'border-red-500/30 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]' :
            'border-purple-500/30 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]'
          }`}>
            <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-t border-l ${
              s.color === 'blue' ? 'border-blue-500' :
              s.color === 'green' ? 'border-[#34d399]' :
              s.color === 'red' ? 'border-red-500' : 'border-purple-500'
            }`}></div>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#555] mb-2">{s.label}</p>
            <h3 className={`text-5xl font-light tracking-tighter ${
              s.color === 'blue' ? 'text-blue-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
              s.color === 'green' ? 'text-[#34d399] drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' :
              s.color === 'red' ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]'
            }`}>
              {isLoading ? '...' : <GlitchText text={s.value.toString()} delay={Math.random() * 500} />}
            </h3>
          </div>
        ))}
      </motion.div>

      {/* Table Panel */}
      <motion.div variants={itemVariants} className="bg-[#020202] border border-[#1e3a8a]/50 shadow-[inset_0_0_20px_rgba(30,58,138,0.1)] relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500"></div>

        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/[0.05] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Activity size={13} className="text-blue-400" />
            <span className="text-[11px] font-mono text-[#888] uppercase tracking-[0.2em]">
              User Registry — {filtered.length} records
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative w-full md:w-auto">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input
                type="text"
                placeholder="SEARCH BY EMAIL OR NAME..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#050505] border border-white/[0.08] pl-8 pr-4 py-2.5 text-[11px] font-mono text-[#ededed] placeholder:text-[#444] focus:outline-none focus:border-blue-400/50 w-full md:w-64 tracking-widest"
              />
            </div>
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="p-2.5 border border-white/[0.08] text-[#555] hover:text-blue-400 hover:border-blue-400/30 transition-all"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-blue-400' : ''} />
            </button>
          </div>
        </div>

        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-20"></div>

        {/* Table */}
        <div className="overflow-x-auto relative z-20">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {[
                  { label: 'User', key: null },
                  { label: 'Provider', key: null },
                  { label: 'Joined', key: 'createdAt' as const },
                  { label: 'Last Seen', key: 'lastSignIn' as const },
                  { label: 'Projects', key: 'projectCount' as const },
                  { label: 'Status', key: null },
                  { label: 'Actions', key: null },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={() => col.key && toggleSort(col.key)}
                    className={`px-5 py-3.5 text-left text-[9px] tracking-[0.2em] uppercase text-[#555] font-mono ${col.key ? 'cursor-pointer hover:text-blue-400 transition-colors' : ''}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#555] uppercase tracking-widest">
                    <Loader2 size={20} className="animate-spin mx-auto mb-3 text-blue-400" />
                    Fetching registry...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 z-10"></div>
                    <div className="flex flex-col items-center justify-center relative z-20">
                      <div className="relative w-32 h-32 mb-6">
                        <div className="absolute inset-0 rounded-full border border-blue-500/20"></div>
                        <div className="absolute inset-4 rounded-full border border-dashed border-blue-500/30 animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute inset-8 rounded-full border border-blue-500/10"></div>
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(59,130,246,0.3)_100%)]"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/50">
                          <Activity size={24} className="animate-pulse" />
                        </div>
                      </div>
                      <h4 className="text-blue-400 font-mono text-[13px] tracking-[0.3em] uppercase mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                        <GlitchText text="SYSTEM STANDBY" delay={100} />
                      </h4>
                      <div className="flex items-center space-x-2 text-[#555] font-mono text-[10px] tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                        <span>Awaiting incoming registries...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group border-b border-white/[0.03] hover:bg-blue-900/[0.03] transition-colors relative ${user.banned ? 'opacity-50' : ''}`}
                  >
                    {/* User */}
                    <td className="px-5 py-4 relative">
                      {/* Laser Crosshair Left */}
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-7 h-7 rounded-full border border-white/10 object-cover" />
                        ) : (
                          <div className="w-7 h-7 bg-blue-950/50 border border-blue-900/50 flex items-center justify-center text-blue-400 text-[10px] font-bold">
                            {user.email[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-[#ededed] tracking-wide text-[11px]">{user.name ?? user.email.split('@')[0]}</p>
                          <p className="text-[#555] text-[9px] tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Provider */}
                    <td className="px-5 py-4"><ProviderBadge provider={user.provider} /></td>
                    {/* Joined */}
                    <td className="px-5 py-4 text-[#888] text-[10px] tracking-widest whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    {/* Last Seen */}
                    <td className="px-5 py-4 text-[#888] text-[10px] tracking-widest whitespace-nowrap">{formatDate(user.lastSignIn)}</td>
                    {/* Projects */}
                    <td className="px-5 py-4">
                      <span className="text-blue-300 text-[13px] font-light">{user.projectCount}</span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      {user.banned ? (
                        <span className="text-[9px] font-mono uppercase tracking-widest bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1">BANNED</span>
                      ) : user.confirmed ? (
                        <span className="text-[9px] font-mono uppercase tracking-widest bg-[#34d399]/10 border border-[#34d399]/30 text-[#34d399] px-2 py-1">ACTIVE</span>
                      ) : (
                        <span className="text-[9px] font-mono uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-1">PENDING</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4 relative">
                      {/* Laser Crosshair Right */}
                      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                      
                      <div className="flex items-center space-x-2 relative z-10">
                        <button
                          title="View Details"
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 border border-white/[0.08] text-[#555] hover:text-blue-400 hover:border-blue-400/30 transition-all"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          title={user.banned ? 'Unban' : 'Ban'}
                          onClick={() => handleBanToggle(user)}
                          disabled={actionLoading === user.id + 'ban' || actionLoading === user.id + 'unban'}
                          className={`p-1.5 border transition-all disabled:opacity-50 ${
                            user.banned
                              ? 'border-[#34d399]/30 text-[#34d399] hover:bg-[#34d399]/10'
                              : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                          }`}
                        >
                          {(actionLoading === user.id + 'ban' || actionLoading === user.id + 'unban')
                            ? <Loader2 size={12} className="animate-spin" />
                            : user.banned ? <ShieldCheck size={12} /> : <ShieldOff size={12} />
                          }
                        </button>
                        <button
                          title="Delete permanently"
                          onClick={() => setConfirmDelete(user)}
                          disabled={actionLoading === user.id + 'delete'}
                          className="p-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {actionLoading === user.id + 'delete'
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Trash2 size={12} />
                          }
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* User Detail Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[70]"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#050505] border-l border-blue-500/30 z-[80] overflow-y-auto shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500"></div>

              {/* Drawer Header */}
              <div className="p-6 border-b border-white/[0.05] flex items-center justify-between sticky top-0 bg-[#050505]/95 backdrop-blur-xl z-10">
                <div className="flex items-center space-x-2">
                  <Info size={13} className="text-blue-400" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888]">User Detail</span>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-[#555] hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 pb-24 space-y-6">
                {/* Avatar + Name */}
                <div className="flex items-center space-x-4">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-blue-500/30 object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-blue-950/50 border-2 border-blue-900/50 flex items-center justify-center text-blue-400 text-xl font-bold">
                      {selectedUser.email[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[#ededed] font-medium tracking-tight text-base">{selectedUser.name ?? '—'}</p>
                    <p className="text-[#555] font-mono text-[11px] tracking-widest mt-0.5">{selectedUser.email}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <ProviderBadge provider={selectedUser.provider} />
                      {selectedUser.banned
                        ? <span className="text-[9px] font-mono uppercase tracking-widest bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5">BANNED</span>
                        : selectedUser.confirmed
                        ? <span className="text-[9px] font-mono uppercase tracking-widest bg-[#34d399]/10 border border-[#34d399]/30 text-[#34d399] px-2 py-0.5">ACTIVE</span>
                        : <span className="text-[9px] font-mono uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5">PENDING</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Projects', value: selectedUser.projectCount, icon: Layers, color: 'blue' },
                    { label: 'Confirmed', value: selectedUser.confirmed ? 'Yes' : 'No', icon: ShieldCheck, color: selectedUser.confirmed ? 'green' : 'amber' },
                    { label: 'Banned', value: selectedUser.banned ? 'Yes' : 'No', icon: UserX, color: selectedUser.banned ? 'red' : 'green' },
                  ].map(s => (
                    <div key={s.label} className={`p-3 bg-[#020202] border text-center ${
                      s.color === 'blue' ? 'border-blue-500/20' :
                      s.color === 'green' ? 'border-[#34d399]/20' :
                      s.color === 'red' ? 'border-red-500/20' : 'border-amber-500/20'
                    }`}>
                      <p className="text-[9px] font-mono uppercase tracking-widest text-[#555] mb-1">{s.label}</p>
                      <p className={`text-base font-medium ${
                        s.color === 'blue' ? 'text-blue-300' :
                        s.color === 'green' ? 'text-[#34d399]' :
                        s.color === 'red' ? 'text-red-400' : 'text-amber-400'
                      }`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="space-y-3 bg-[#020202] border border-white/[0.05] p-4">
                  {[
                    { label: 'User ID', value: selectedUser.id, mono: true },
                    { label: 'Joined', value: formatDate(selectedUser.createdAt), mono: true },
                    { label: 'Last Sign-in', value: formatDate(selectedUser.lastSignIn), mono: true },
                  ].map(row => (
                    <div key={row.label} className="flex flex-col space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#555]">{row.label}</span>
                      <span className={`text-[11px] ${row.mono ? 'font-mono text-[#888] break-all' : 'text-[#ededed]'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Drawer Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => handleBanToggle(selectedUser)}
                    disabled={!!actionLoading}
                    className={`w-full py-3 border text-[11px] font-mono uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${
                      selectedUser.banned
                        ? 'border-[#34d399]/50 text-[#34d399] hover:bg-[#34d399]/10'
                        : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                    }`}
                  >
                    {selectedUser.banned ? <><ShieldCheck size={14} /><span>Unban User</span></> : <><ShieldOff size={14} /><span>Ban User</span></>}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(selectedUser)}
                    disabled={!!actionLoading}
                    className="w-full py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-[11px] font-mono uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    <span>Delete Permanently</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
