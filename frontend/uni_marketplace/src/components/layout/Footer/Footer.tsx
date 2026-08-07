import { Link } from 'react-router-dom'
import { Globe, Mail, MessageCircle, ShoppingBag } from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { APP_NAME, APP_TAGLINE } from '../../../constants'
import { ROUTES } from '../../../routes/routePaths'

const EXPLORE_LINKS = [
  { to: ROUTES.HOME, label: 'Browse Marketplace' },
  { to: ROUTES.ABOUT, label: 'About Us' },
  { to: ROUTES.CONTACT, label: 'Contact' },
]

const SUPPORT_LINKS = [
  { to: ROUTES.CONTACT, label: 'Help Center' },
  { to: ROUTES.CONTACT, label: 'Safety Tips' },
  { to: ROUTES.CONTACT, label: 'Report an Issue' },
]

const SOCIAL_LINKS = [
  { icon: Globe, label: 'Website' },
  { icon: MessageCircle, label: 'Community Chat' },
  { icon: Mail, label: 'Email' },
]

function Footer() {
  const { showToast } = useToast()

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 text-lg font-extrabold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              {APP_NAME}
            </Link>
            <p className="max-w-xs text-sm text-ink-soft">{APP_TAGLINE}</p>
            <div className="mt-2 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => showToast(`${label} link coming soon.`, 'info')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink-soft transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Explore</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-ink-soft transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Support</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-ink-soft transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Company</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="text-sm text-ink-soft">Built for university students</li>
              <li className="text-sm text-ink-soft">Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-border pt-6 text-xs text-ink-faint sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p>Made for students, by students.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
