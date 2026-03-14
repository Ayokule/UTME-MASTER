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
  Bell,
  HelpCircle
} from 'lucide-react'
import Badge from './ui/Badge'

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    showToast.success('Logged out successfully')
    navigate('/login')
  }

  const handleProfileEdit = () => {
    // Navigate to profile edit page
    navigate('/profile/edit')
    setIsUserMenuOpen(false)
  }

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'ADMIN' || user?.role === 'TEACHER') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
        { name: 'Questions', href: '/admin/questions', icon: FileText },
        { name: 'Bulk Import', href: '/admin/bulk-import', icon: FileText },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        ...(user?.role === 'ADMIN' ? [
          { name: 'Licenses', href: '/admin/licenses', icon: Shield },
          { name: 'Settings', href: '/admin/settings', icon: Settings },
        ] : [])
      ]
    } else {
      return [
        { name: 'Dashboard', href: '/student/dashboard', icon: Home },
        { name: 'Subjects', href: '/student/subjects', icon: BookOpen },
        { name: 'Analytics', href: '/student/analytics', icon: BarChart3 },
      ]
    }
  }

  const navigationItems = getNavigationItems()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error'
      case 'TEACHER': return 'warning'
      case 'STUDENT': return 'primary'
      default: return 'info'
    }
  }

  const getLicenseBadgeColor = (tier: string) => {
    switch (tier) {
      case 'ENTERPRISE': return 'error'
      case 'PREMIUM': return 'warning'
      case 'BASIC': return 'primary'
      case 'TRIAL': return 'info'
      default: return 'info'
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center flex-shrink-0"
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300 flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-shrink-0">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent whitespace-nowrap">
                  UTME Master
                </span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Professional</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-soft'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-600' : ''}`} />
                    <span>{item.name}</span>
                    {isActive && (
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

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {/* Notifications */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* Help */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                className="flex items-center space-x-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 min-w-0 flex-shrink-0"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-left min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeColor(user?.role || '')} size="sm">
                      {user?.role}
                    </Badge>
                    <Badge variant={getLicenseBadgeColor(user?.licenseTier || '')} size="sm">
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
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
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
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          navigate('/profile/settings')
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </button>

                      <div className="border-t border-gray-100 my-2"></div>
                      
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 py-4 overflow-hidden"
            >
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  )
                })}
                
                {/* Mobile User Info */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="px-4 py-3 bg-gray-50 rounded-xl mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getRoleBadgeColor(user?.role || '')} size="sm">
                            {user?.role}
                          </Badge>
                          <Badge variant={getLicenseBadgeColor(user?.licenseTier || '')} size="sm">
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
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl w-full transition-colors"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
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