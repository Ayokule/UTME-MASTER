import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users, ArrowLeft, Search, Plus, Edit2, Trash2, Key,
  ToggleLeft, ToggleRight, X, Save, AlertCircle, RefreshCw,
  Shield, GraduationCap, BookOpen, UserCheck, UserX, Eye, EyeOff
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { showToast } from '../../components/ui/Toast'
import {
  getUsers, updateUser, resetUserPassword, toggleUserActive,
  deleteUser, createUser, AdminUser
} from '../../api/users'

const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  TEACHER: 'bg-purple-100 text-purple-700',
  STUDENT: 'bg-blue-100 text-blue-700',
  SUPER_ADMIN: 'bg-orange-100 text-orange-700',
}
const ROLE_ICONS: Record<string, any> = {
  ADMIN: Shield, TEACHER: BookOpen, STUDENT: GraduationCap, SUPER_ADMIN: Shield
}

function RoleBadge({ role }: { role: string }) {
  const Icon = ROLE_ICONS[role] ?? Shield
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-700'}`}>
      <Icon className="w-3 h-3" />{role}
    </span>
  )
}

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Modals
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState<Partial<AdminUser>>({})
  const [pwdUser, setPwdUser] = useState<AdminUser | null>(null)
  const [newPwd, setNewPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'STUDENT' })
  const [showCreatePwd, setShowCreatePwd] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUsers({ page, limit: 15, role: roleFilter || undefined, search: search || undefined })
      setUsers(res.data.users)
      setTotal(res.data.pagination.total)
      setPages(res.data.pagination.pages)
    } catch {
      showToast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, search])

  useEffect(() => { load() }, [load])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  function openEdit(u: AdminUser) {
    setEditForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone ?? '', role: u.role })
    setEditUser(u)
  }

  async function handleSaveEdit() {
    if (!editUser) return
    setSaving(true)
    try {
      const res = await updateUser(editUser.id, editForm)
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...res.data.user } : u))
      showToast.success('User updated')
      setEditUser(null)
    } catch (e: any) { showToast.error(e.message || 'Failed to update') }
    finally { setSaving(false) }
  }

  async function handleResetPwd() {
    if (!pwdUser || !newPwd) return
    setSaving(true)
    try {
      await resetUserPassword(pwdUser.id, newPwd)
      showToast.success('Password reset successfully')
      setPwdUser(null); setNewPwd('')
    } catch (e: any) { showToast.error(e.message || 'Failed to reset password') }
    finally { setSaving(false) }
  }

  async function handleToggle(u: AdminUser) {
    try {
      const res = await toggleUserActive(u.id)
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: res.data.user.isActive } : x))
      showToast.success(res.data.user.isActive ? 'User activated' : 'User deactivated')
    } catch (e: any) { showToast.error(e.message || 'Failed') }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteUser(deleteTarget.id)
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
      setTotal(t => t - 1)
      showToast.success('User deleted')
      setDeleteTarget(null)
    } catch (e: any) { showToast.error(e.message || 'Failed to delete') }
    finally { setSaving(false) }
  }

  async function handleCreate() {
    if (!createForm.email || !createForm.password || !createForm.firstName || !createForm.lastName) {
      return showToast.error('Fill all required fields')
    }
    setSaving(true)
    try {
      await createUser(createForm)
      showToast.success('User created successfully')
      setCreateOpen(false)
      setCreateForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'STUDENT' })
      load()
    } catch (e: any) { showToast.error(e.message || 'Failed to create user') }
    finally { setSaving(false) }
  }

  const getTimeAgo = (d?: string | null) => {
    if (!d) return 'Never'
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <SafePageWrapper pageName="User Management">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link to="/admin/dashboard">
                <Button variant="outline" size="sm" className="mb-3">
                  <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl"><Users className="w-6 h-6 text-blue-600" /></div>
                User Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">{total} total users</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
              </Button>
              <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />Create User
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['User', 'Role', 'Status', 'Last Login', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggle(u)} className="flex items-center gap-1.5 text-xs font-medium">
                            {u.isActive
                              ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">Active</span></>
                              : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Inactive</span></>}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{getTimeAgo(u.lastLogin)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setPwdUser(u); setNewPwd('') }} title="Reset Password" className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                              <Key className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(u)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">Page {page} of {pages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* EDIT USER MODAL */}
        <AnimatePresence>
          {editUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-blue-500" />Edit User
                  </h2>
                  <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input className={inputClass} value={editForm.firstName ?? ''} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input className={inputClass} value={editForm.lastName ?? ''} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" className={inputClass} value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input className={inputClass} value={editForm.phone ?? ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <select className={inputClass} value={editForm.role ?? 'STUDENT'} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as any }))}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-5 border-t">
                  <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                  <Button variant="primary" onClick={handleSaveEdit} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RESET PASSWORD MODAL */}
        <AnimatePresence>
          {pwdUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-between p-5 border-b">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-500" />Reset Password
                  </h2>
                  <button onClick={() => setPwdUser(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-4">
                    Set a new password for <span className="font-semibold">{pwdUser.firstName} {pwdUser.lastName}</span>
                  </p>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className={inputClass + ' pr-10'}
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-5 border-t">
                  <Button variant="outline" onClick={() => setPwdUser(null)}>Cancel</Button>
                  <Button variant="primary" onClick={handleResetPwd} disabled={saving || newPwd.length < 6}>
                    <Key className="w-4 h-4 mr-2" />{saving ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRM MODAL */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg"><Trash2 className="w-5 h-5 text-red-600" /></div>
                  <h2 className="text-lg font-bold text-gray-900">Delete User</h2>
                </div>
                <p className="text-gray-600 mb-1">Delete <span className="font-semibold">{deleteTarget.firstName} {deleteTarget.lastName}</span>?</p>
                <p className="text-sm text-red-600 mb-5">This permanently removes the account and all associated data.</p>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={saving}>
                    <Trash2 className="w-4 h-4 mr-2" />{saving ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CREATE USER MODAL */}
        <AnimatePresence>
          {createOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-500" />Create User
                  </h2>
                  <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input className={inputClass} value={createForm.firstName} onChange={e => setCreateForm(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input className={inputClass} value={createForm.lastName} onChange={e => setCreateForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" className={inputClass} value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input className={inputClass} value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <select className={inputClass} value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Password *</label>
                    <div className="relative">
                      <input
                        type={showCreatePwd ? 'text' : 'password'}
                        className={inputClass + ' pr-10'}
                        value={createForm.password}
                        onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Min 6 characters"
                      />
                      <button type="button" onClick={() => setShowCreatePwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCreatePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-5 border-t">
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleCreate} disabled={saving}>
                    <Plus className="w-4 h-4 mr-2" />{saving ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </Layout>
    </SafePageWrapper>
  )
}
