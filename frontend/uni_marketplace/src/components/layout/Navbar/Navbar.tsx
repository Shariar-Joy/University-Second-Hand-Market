import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, GraduationCap, Heart, MessageCircle, Menu, Plus, Shield, ShoppingBag } from 'lucide-react'
import Avatar from '../../common/Avatar'
import Button from '../../common/Button'
import Drawer from '../../ui/Drawer'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { useMessaging } from '../../../context/MessagingContext'
import { APP_NAME } from '../../../constants'
import { ROUTES } from '../../../routes/routePaths'

const NAV_LINKS = [
  { to: ROUTES.HOME, label: 'Home', end: true },
  { to: ROUTES.ABOUT, label: 'About', end: false },
  { to: ROUTES.CONTACT, label: 'Contact', end: false },
]

function navLinkClasses(isActive: boolean): string {
  return [
    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-primary/10 text-primary' : 'text-ink-soft hover:bg-slate-100 hover:text-ink',
  ].join(' ')
}

function Navbar() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { unreadCount } = useMessaging()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-(--header-height) max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="flex shrink-0 items-center gap-2 text-lg font-extrabold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => navLinkClasses(isActive)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {user && (
            <Button to={ROUTES.SELL} size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Sell
            </Button>
          )}

          <button
            type="button"
            onClick={() => showToast('No new notifications yet.', 'info')}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink sm:flex"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          {user && (
            <Link
              to={ROUTES.MESSAGES}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
              aria-label="Messages"
            >
              <MessageCircle className="h-5 w-5" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}

          {user && (
            <Link
              to={ROUTES.WISHLIST}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}

          {user?.isAdmin && (
            <Link
              to={ROUTES.ADMIN}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
              aria-label="Admin dashboard"
            >
              <Shield className="h-5 w-5" />
            </Link>
          )}

          {user ? (
            <Link to={ROUTES.PROFILE} className="ml-1" aria-label="Profile">
              <Avatar name={user.fullName} src={user.profileImage} size="sm" />
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button to={ROUTES.LOGIN} variant="ghost" size="sm">
                Log In
              </Button>
              <Button to={ROUTES.REGISTER} size="sm">
                Sign Up
              </Button>
            </div>
          )}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Drawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} title={APP_NAME}>
        <nav className="flex flex-col gap-1" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [
                  'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-ink-soft hover:bg-slate-50 hover:text-ink',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {user ? (
          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
            <Button to={ROUTES.SELL} fullWidth>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Sell an Item
            </Button>
            <Button to={ROUTES.MESSAGES} variant="outline" fullWidth>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Messages
              {unreadCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
            <Button to={ROUTES.WISHLIST} variant="outline" fullWidth>
              <Heart className="h-4 w-4" aria-hidden="true" />
              Wishlist
            </Button>
            <Button to={ROUTES.BECOME_TUTOR} variant="outline" fullWidth>
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              Become a Tutor
            </Button>
            {user.isAdmin && (
              <Button to={ROUTES.ADMIN} variant="outline" fullWidth>
                <Shield className="h-4 w-4" aria-hidden="true" />
                Admin Dashboard
              </Button>
            )}
            <Link to={ROUTES.PROFILE} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50">
              <Avatar name={user.fullName} src={user.profileImage} size="md" />
              <div>
                <p className="text-sm font-semibold text-ink">{user.fullName}</p>
                <p className="text-xs text-ink-soft">View profile</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5">
            <Button to={ROUTES.LOGIN} variant="outline" fullWidth>
              Log In
            </Button>
            <Button to={ROUTES.REGISTER} fullWidth>
              Sign Up
            </Button>
          </div>
        )}
      </Drawer>
    </header>
  )
}

export default Navbar
