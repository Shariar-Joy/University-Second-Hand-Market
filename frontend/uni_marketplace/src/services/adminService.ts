import { apiClient } from './apiClient'
import { toProduct } from './productService'
import type { Product, ProductResponse } from './productService'

export interface AdminStats {
  totalUsers: number
  totalProducts: number
  activeListings: number
  soldListings: number
  totalTutors: number
}

interface AdminStatsResponse {
  total_users: number
  total_products: number
  active_listings: number
  sold_listings: number
  total_tutors: number
}

function toAdminStats(response: AdminStatsResponse): AdminStats {
  return {
    totalUsers: response.total_users,
    totalProducts: response.total_products,
    activeListings: response.active_listings,
    soldListings: response.sold_listings,
    totalTutors: response.total_tutors,
  }
}

export interface AdminUser {
  id: number
  fullName: string
  username: string
  email: string
  university: string
  department: string
  isAdmin: boolean
  createdAt: string
}

interface AdminUserResponse {
  id: number
  full_name: string
  username: string
  email: string
  university: string
  department: string
  is_admin: boolean
  created_at: string
}

function toAdminUser(response: AdminUserResponse): AdminUser {
  return {
    id: response.id,
    fullName: response.full_name,
    username: response.username,
    email: response.email,
    university: response.university,
    department: response.department,
    isAdmin: response.is_admin,
    createdAt: response.created_at,
  }
}

export async function fetchStats(): Promise<AdminStats> {
  const response = await apiClient.get<AdminStatsResponse>('/admin/stats')
  return toAdminStats(response)
}

export async function listUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get<AdminUserResponse[]>('/admin/users')
  return response.map(toAdminUser)
}

export async function listProducts(): Promise<Product[]> {
  const response = await apiClient.get<ProductResponse[]>('/admin/products')
  return response.map(toProduct)
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.del(`/admin/products/${id}`)
}
