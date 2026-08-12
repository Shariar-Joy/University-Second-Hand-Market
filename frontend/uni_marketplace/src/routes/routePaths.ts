export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ABOUT: '/about',
  CONTACT: '/contact',
  MESSAGES: '/messages',
  MESSAGE_THREAD: '/messages/:conversationId',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  SELL: '/sell',
  EDIT_LISTING: '/listings/:id/edit',
  PRODUCT_DETAILS: '/products/:slug',
  TUTOR_DETAILS: '/tutors/:slug',
  BECOME_TUTOR: '/become-tutor',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRODUCTS: '/admin/products',
} as const

export function productDetailsPath(slug: string): string {
  return `/products/${slug}`
}

export function editListingPath(id: number): string {
  return `/listings/${id}/edit`
}

export function tutorDetailsPath(slug: string): string {
  return `/tutors/${slug}`
}

export function messageThreadPath(conversationId: number): string {
  return `/messages/${conversationId}`
}
