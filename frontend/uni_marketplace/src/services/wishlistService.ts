import { apiClient } from './apiClient'
import { toProduct } from './productService'
import type { Product, ProductResponse } from './productService'

export interface WishlistItem {
  id: number
  product: Product
  createdAt: string
}

interface WishlistItemResponse {
  id: number
  product: ProductResponse
  created_at: string
}

function toWishlistItem(response: WishlistItemResponse): WishlistItem {
  return {
    id: response.id,
    product: toProduct(response.product),
    createdAt: response.created_at,
  }
}

export async function listWishlist(): Promise<WishlistItem[]> {
  const response = await apiClient.get<WishlistItemResponse[]>('/wishlist')
  return response.map(toWishlistItem)
}

export async function addToWishlist(productId: number): Promise<WishlistItem> {
  const response = await apiClient.post<WishlistItemResponse>('/wishlist', { product_id: productId })
  return toWishlistItem(response)
}

export async function removeFromWishlist(productId: number): Promise<void> {
  await apiClient.del(`/wishlist/${productId}`)
}

export async function checkWishlistStatus(productId: number): Promise<boolean> {
  const response = await apiClient.get<{ wishlisted: boolean }>(`/wishlist/${productId}/check`)
  return response.wishlisted
}
