// src/components/Navigation.tsx
// ==========================================
// CORRECTED NAVIGATION COMPONENT
// ==========================================
// Fixed to match new architecture:
// - Separate /admin, /teacher, /student routes
// - Added new exam/test dashboards for students
// - Proper role-based navigation
// - Organized with dropdown menus
// - All routes match routes-config.tsx
//
// ALL WITH BEGINNER-FRIENDLY COMMENTS!

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'
import { showToast } from './ui/Toast'
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Shield,
  Users,
  FileText,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Edit,
  UserCircle,
  HelpCircle,
  BookMarked,
  Zap,
  Sun,
  Moon
} from 'lucide-react'
import Badge from './ui/Badge'
import NotificationCenter from './notifications/NotificationCenter'
import { useThemeStore } from '../store/theme'

// ==========================================
// NAVIGATION ITEM TYPE
// ==========================================
interface NavItem {
  name: string
  href?: string
  icon: React.ReactNode
  submenu?: NavItem[] // For dropdown menus
}

export default function Navigation() {
  // ==========================================
  // STATE
  // ==========================================
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)
  
  // ==========================================
  // HOOKS
  // ==========================================
  const { user, clearAuth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleLogout = () => {
    clearAuth()
    showToast.success('Logged out successfully')
    navigate('/login')
  }

  const handleProfileEdit = () => {
    // Navigate to role-specific profile page
    if (user?.role === 'STUDENT') {
      navigate('/student/profile/edit')
    } else if (user?.role === 'TEACHER') {
      navigate('/teacher/profile/settings')
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/profile/settings')
    }
    setIsUserMenuOpen(false)
  }

  // ==========================================
  // GET NAVIGATION ITEMS BY ROLE
  // ==========================================
  // Now properly separated by role!

  const getNavigationItems = (): NavItem[] => {
    // ==========================================
    // ADMIN NAVIGATION (ADMIN ONLY)
    // ==========================================
    if (user?.role === 'ADMIN') {
      return [
        {
          name: 'Dashboard',
          href: '/admin/dashboard', // ✅ Correct /admin path
          icon: <Home className="w-4 h-4" />
        },
        {
          name: 'Questions', // Grouped with submenu
          icon: <FileText className="w-4 h-4" />,
          submenu: [
            { name: 'Question List', href: '/admin/questions', icon: <FileText className="w-4 h-4" /> },
            { name: 'Bulk Import', href: '/admin/bulk-import', icon: <FileText className="w-4 h-4" /> },
          ]
        },
        {
          name: 'Exams',
          href: '/admin/exams', // ✅ For managing exams
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          name: 'Users',
          href: '/admin/users', // ✅ For user management
          icon: <Users className="w-4 h-4" />
        },
        {
          name: 'Analytics',
          href: '/admin/analytics', // ✅ System-wide analytics
          icon: <BarChart3 className="w-4 h-4" />
        }
        // Note: Settings in dropdown menu below
      ]
    }

    // ==========================================
    // TEACHER NAVIGATION (TEACHER ONLY)
    // ==========================================
    // ✅ NEW: Now properly separated from admin
    else if (user?.role === 'TEACHER') {
      return [
        {
          name: 'Dashboard',
          href: '/teacher/dashboard', // ✅ /teacher NOT /admin
          icon: <Home className="w-4 h-4" />
        },
        {
          name: 'Classes',
          href: '/teacher/classes', // ✅ Teacher-specific feature
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          name: 'Students',
          href: '/teacher/students', // ✅ Student progress tracking
          icon: <Users className="w-4 h-4" />
        },
        {
          name: 'Analytics',
          href: '/teacher/analytics', // ✅ Teacher analytics only
          icon: <BarChart3 className="w-4 h-4" />
        }
        // Note: Settings in dropdown menu below
      ]
    }

    // ==========================================
    // STUDENT NAVIGATION (STUDENT ONLY)
    // ==========================================
    // ✅ NEW: Updated with exam/test dashboards
    else if (user?.role === 'STUDENT') {
      return [
        {
          name: 'Dashboard',
          href: '/student/dashboard', // ✅ Main dashboard
          icon: <Home className="w-4 h-4" />
        },
        {
          name: 'Official Exams', // ✅ NEW - from Dashboard-Reorganized.tsx
          href: '/student/exam-dashboard',
          icon: <BookMarked className="w-4 h-4" />
        },
        {
          name: 'Practice Tests', // ✅ NEW - from Dashboard-Reorganized.tsx
          href: '/student/test-dashboard',
          icon: <Zap className="w-4 h-4" />
        }
        // Note: Settings in dropdown menu below
      ]
    }

    // Fallback (shouldn't happen with ProtectedRoute)
    return []
  }

  const navigationItems = getNavigationItems()

  const getRoleBadgeColor = (role?: string) => {
    const map: Record<string, 'error' | 'warning' | 'primary' | 'info'> = {
      ADMIN: 'error', TEACHER: 'warning', STUDENT: 'primary', SUPER_ADMIN: 'error'
    }
    return map[role ?? ''] ?? 'info'
  }

  const getLicenseBadgeColor = (tier?: string) => {
    const map: Record<string, 'error' | 'warning' | 'primary' | 'info'> = {
      ENTERPRISE: 'error', PREMIUM: 'warning', BASIC: 'primary', TRIAL: 'info'
    }
    return map[tier ?? ''] ?? 'info'
  }

  // ==========================================
  // CHECK IF NAVIGATION ITEM IS ACTIVE
  // ==========================================
  const isNavItemActive = (item: NavItem): boolean => {
    if (!item.href) return false
    return location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  }

  // ==========================================
  // RENDER NAVIGATION (DON'T RENDER IF NOT LOGGED IN)
  // ==========================================
  // ✅ Added: Don't show nav if user not authenticated
  if (!user) {
    return null
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <nav className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-soft border-b border-gray-100 dark:border-gray-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ────────────────────────────────────────
              LOGO
              ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center flex-shrink-0"
          >
            <Link to={user?.role === 'STUDENT' ? '/student/dashboard' : user?.role === 'TEACHER' ? '/teacher/dashboard' : '/admin/dashboard'} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300 flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-shrink-0">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent whitespace-nowrap">
                  UTME Master
                </span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'TEACHER' ? 'Educator' : 'Student'}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ────────────────────────────────────────
              DESKTOP NAVIGATION
              ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item, index) => {
              // For submenu items, don't create direct link
              if (item.submenu) {
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative group">
                      <button className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                        {item.icon}
                        <span>{item.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Dropdown submenu */}
                      <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            to={subitem.href || '#'}
                            className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                              isNavItemActive(subitem)
                                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {subitem.icon}
                            <span>{subitem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              }

              // Regular navigation items
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href || '#'}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isNavItemActive(item)
                        ? 'bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 text-primary-700 dark:text-primary-300 shadow-soft'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {isNavItemActive(item) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* ────────────────────────────────────────
              USER MENU (DESKTOP)
              ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-yellow-400" />
                : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Notifications — real NotificationCenter */}
            <NotificationCenter />

            {/* Help — links to docs or flagged questions for admin */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (user?.role === 'ADMIN' || user?.role === 'TEACHER') {
                  navigate('/admin/flagged-questions')
                } else {
                  navigate('/student/analytics')
                }
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={user?.role === 'ADMIN' || user?.role === 'TEACHER' ? 'Flagged Questions' : 'Analytics'}
            >
              <HelpCircle className="w-5 h-5" />
            </motion.button>

            {/* User Dropdown */}
            <div className="relative">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-left min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeColor(user?.role)} size="sm">
                      {user?.role}
                    </Badge>
                    <Badge variant={getLicenseBadgeColor(user?.licenseTier)} size="sm">
                      {user?.licenseTier}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileEdit}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                      
                      {/* Settings for each role */}
                      {user?.role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => {
                              navigate('/admin/settings')
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>System Settings</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/admin/license')
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            <span>License Management</span>
                          </button>
                        </>
                      )}

                      {user?.role === 'TEACHER' && (
                        <button
                          onClick={() => {
                            navigate('/teacher/settings')
                            setIsUserMenuOpen(false)
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                      )}

                      {user?.role === 'STUDENT' && (
                        <button
                          onClick={() => {
                            navigate('/student/settings')
                            setIsUserMenuOpen(false)
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Preferences</span>
                        </button>
                      )}

                      <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                      
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ────────────────────────────────────────
              MOBILE MENU BUTTON
              ──────────────────────────────────────── */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* ────────────────────────────────────────
            MOBILE NAVIGATION
            ──────────────────────────────────────── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 dark:border-gray-700 py-4 overflow-hidden"
            >
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  // Submenu items on mobile
                  if (item.submenu) {
                    const isExpanded = expandedSubmenu === item.name
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => setExpandedSubmenu(isExpanded ? null : item.name)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all`}
                        >
                          {item.icon}
                          <span className="flex-1">{item.name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Submenu items */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4 space-y-2"
                            >
                              {item.submenu.map((subitem) => (
                                <Link
                                  key={subitem.name}
                                  to={subitem.href || '#'}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                                >
                                  {subitem.icon}
                                  <span>{subitem.name}</span>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  }

                  // Regular navigation items
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href || '#'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isNavItemActive(item)
                            ? 'bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  )
                })}
                
                {/* Mobile User Info */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getRoleBadgeColor(user?.role)} size="sm">
                            {user?.role}
                          </Badge>
                          <Badge variant={getLicenseBadgeColor(user?.licenseTier)} size="sm">
                            {user?.licenseTier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleProfileEdit()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full transition-colors"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
