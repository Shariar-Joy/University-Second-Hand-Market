export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ABOUT: '/about',
  CONTACT: '/contact',
  CART: '/cart',
  PROFILE: '/profile',
  PRODUCT_DETAILS: '/products/:slug',
  TUTOR_DETAILS: '/tutors/:slug',
} as const

export function productDetailsPath(slug: string): string {
  return `/products/${slug}`
}

export function tutorDetailsPath(slug: string): string {
  return `/tutors/${slug}`
}
