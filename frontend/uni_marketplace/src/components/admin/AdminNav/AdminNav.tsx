import { NavLink } from 'react-router-dom'
import { Gauge, ShoppingBag, Users } from 'lucide-react'
import { ROUTES } from '../../../routes/routePaths'

const ADMIN_NAV_LINKS = [
  { to: ROUTES.ADMIN, label: 'Dashboard', icon: Gauge },
  { to: ROUTES.ADMIN_USERS, label: 'Users', icon: Users },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Products', icon: ShoppingBag },
]

function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Admin">
      {ADMIN_NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === ROUTES.ADMIN}
          className={({ isActive }) =>
            [
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-primary text-white' : 'bg-white text-ink-soft shadow-card hover:text-ink',
            ].join(' ')
          }
        >
          <link.icon className="h-4 w-4" aria-hidden="true" />
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default AdminNav
