import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import About from '../pages/About'
import Contact from '../pages/Contact'
import Cart from '../pages/Cart'
import Profile from '../pages/Profile'
import RequireAuth from './RequireAuth'
import { ROUTES } from './routePaths'

function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.HOME}
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.ABOUT} element={<About />} />
      <Route path={ROUTES.CONTACT} element={<Contact />} />
      <Route path={ROUTES.CART} element={<Cart />} />
      <Route path={ROUTES.PROFILE} element={<Profile />} />
      <Route
        path="*"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default AppRoutes
