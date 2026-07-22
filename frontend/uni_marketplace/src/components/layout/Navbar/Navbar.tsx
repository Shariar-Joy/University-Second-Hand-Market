import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Avatar from '../../common/Avatar'
import Button from '../../common/Button'
import { CartIcon, CloseIcon, MenuIcon } from '../../common/icons'
import { useAuth } from '../../../context/AuthContext'
import { useCart } from '../../../context/CartContext'
import { APP_NAME } from '../../../constants'
import { ROUTES } from '../../../routes/routePaths'
import styles from './Navbar.module.css'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ')
}

function Navbar() {
  const { user } = useAuth()
  const { totalCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={ROUTES.HOME} className={styles.brand}>
          {APP_NAME}
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon className={styles.menuIcon} /> : <MenuIcon className={styles.menuIcon} />}
        </button>

        <nav className={[styles.links, menuOpen ? styles.linksOpen : ''].filter(Boolean).join(' ')}>
          <NavLink to={ROUTES.HOME} end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to={ROUTES.ABOUT} className={navLinkClass}>
            About
          </NavLink>
          <NavLink to={ROUTES.CONTACT} className={navLinkClass}>
            Contact
          </NavLink>

          {!user && (
            <div className={styles.mobileAuth}>
              <Button to={ROUTES.LOGIN} variant="outline" size="sm" fullWidth>
                Log In
              </Button>
              <Button to={ROUTES.REGISTER} size="sm" fullWidth>
                Sign Up
              </Button>
            </div>
          )}
        </nav>

        <div className={styles.actions}>
          <Link to={ROUTES.CART} className={styles.cartLink} aria-label="Cart">
            <CartIcon className={styles.cartIcon} />
            {totalCount > 0 && <span className={styles.badge}>{totalCount}</span>}
          </Link>

          {user ? (
            <Link to={ROUTES.PROFILE} className={styles.profileLink} aria-label="Profile">
              <Avatar name={user.fullName} size="sm" />
            </Link>
          ) : (
            <div className={styles.authButtons}>
              <Button to={ROUTES.LOGIN} variant="ghost" size="sm">
                Log In
              </Button>
              <Button to={ROUTES.REGISTER} size="sm">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
