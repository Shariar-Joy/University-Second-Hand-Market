import { apiClient } from './apiClient'

export interface Product {
  id: number
  slug: string
  name: string
  category: string
  condition: string
  price: number
  seller: string
  university: string
  createdAt: string
}

interface ProductResponse {
  id: number
  slug: string
  name: string
  category: string
  condition: string
  price: number
  seller: string
  university: string
  created_at: string
}

function toProduct(response: ProductResponse): Product {
  return {
    id: response.id,
    slug: response.slug,
    name: response.name,
    category: response.category,
    condition: response.condition,
    price: response.price,
    seller: response.seller,
    university: response.university,
    createdAt: response.created_at,
  }
}

export async function listProducts(): Promise<Product[]> {
  const response = await apiClient.get<ProductResponse[]>('/products')
  return response.map(toProduct)
}
