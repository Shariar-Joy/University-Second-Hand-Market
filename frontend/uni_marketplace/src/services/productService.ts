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
  status: string
  buyerName?: string | null
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
  status: string
  buyer_name: string | null
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
    status: response.status,
    buyerName: response.buyer_name,
    createdAt: response.created_at,
  }
}

export async function listProducts(): Promise<Product[]> {
  const response = await apiClient.get<ProductResponse[]>('/products')
  return response.map(toProduct)
}

export async function listMine(): Promise<Product[]> {
  const response = await apiClient.get<ProductResponse[]>('/products/mine')
  return response.map(toProduct)
}

export async function listSold(): Promise<Product[]> {
  const response = await apiClient.get<ProductResponse[]>('/products/sold')
  return response.map(toProduct)
}

export async function listPurchased(): Promise<Product[]> {
  const response = await apiClient.get<ProductResponse[]>('/products/purchased')
  return response.map(toProduct)
}

export async function markAsSold(id: number, buyerIdentifier?: string): Promise<Product> {
  const response = await apiClient.post<ProductResponse>(`/products/${id}/sold`, {
    buyer_identifier: buyerIdentifier || undefined,
  })
  return toProduct(response)
}
