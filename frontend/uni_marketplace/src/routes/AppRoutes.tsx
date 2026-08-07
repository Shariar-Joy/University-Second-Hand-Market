import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import About from '../pages/About'
import Contact from '../pages/Contact'
import Cart from '../pages/Cart'
import Profile from '../pages/Profile'
import ProductDetails from '../pages/ProductDetails'
import TutorDetails from '../pages/TutorDetails'
import RequireAuth from './RequireAuth'
import PageTransition from '../components/layout/PageTransition'
import { ROUTES } from './routePaths'

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path={ROUTES.HOME}
          element={
            <RequireAuth>
              <PageTransition>
                <Home />
              </PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path={ROUTES.ABOUT}
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path={ROUTES.CONTACT}
          element={
            <PageTransition>
              <Contact />
            </PageTransition>
          }
        />
        <Route
          path={ROUTES.CART}
          element={
            <PageTransition>
              <Cart />
            </PageTransition>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <RequireAuth>
              <PageTransition>
                <Profile />
              </PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path={ROUTES.PRODUCT_DETAILS}
          element={
            <PageTransition>
              <ProductDetails />
            </PageTransition>
          }
        />
        <Route
          path={ROUTES.TUTOR_DETAILS}
          element={
            <PageTransition>
              <TutorDetails />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <RequireAuth>
              <PageTransition>
                <Home />
              </PageTransition>
            </RequireAuth>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default AppRoutes
