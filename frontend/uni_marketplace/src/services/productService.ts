import { apiClient } from './apiClient'

export type ProductStatus = 'available' | 'sold' | 'reserved' | 'archived'

export interface ProductImage {
  id: number
  url: string
  position: number
  isPrimary: boolean
}

export interface Product {
  id: number
  slug: string
  name: string
  category: string
  condition: string
  price: number
  seller: string
  sellerId: number | null
  university: string
  description?: string | null
  images: string[]
  imageDetails: ProductImage[]
  negotiable: boolean
  location?: string | null
  department?: string | null
  status: string
  buyerName?: string | null
  createdAt: string
  updatedAt: string
}

interface ProductImageResponse {
  id: number
  url: string
  position: number
  is_primary: boolean
}

export interface ProductResponse {
  id: number
  slug: string
  name: string
  category: string
  condition: string
  price: number
  seller: string
  seller_id: number | null
  university: string
  description: string | null
  images: string[]
  image_details: ProductImageResponse[]
  negotiable: boolean
  location: string | null
  department: string | null
  status: string
  buyer_name: string | null
  created_at: string
  updated_at: string
}

export function toProduct(response: ProductResponse): Product {
  return {
    id: response.id,
    slug: response.slug,
    name: response.name,
    category: response.category,
    condition: response.condition,
    price: response.price,
    seller: response.seller,
    sellerId: response.seller_id,
    university: response.university,
    description: response.description,
    images: response.images,
    imageDetails: response.image_details.map((image) => ({
      id: image.id,
      url: image.url,
      position: image.position,
      isPrimary: image.is_primary,
    })),
    negotiable: response.negotiable,
    location: response.location,
    department: response.department,
    status: response.status,
    buyerName: response.buyer_name,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  }
}

export interface ProductPayload {
  name?: string
  description?: string
  price?: number
  negotiable?: boolean
  category?: string
  condition?: string
  location?: string
  department?: string
}

function toRequestBody(payload: ProductPayload) {
  return {
    name: payload.name,
    description: payload.description,
    price: payload.price,
    negotiable: payload.negotiable,
    category: payload.category,
    condition: payload.condition,
    location: payload.location,
    department: payload.department,
  }
}

export type ProductSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc'
export type ProductAvailability = 'available' | 'reserved'

export interface ProductListParams {
  search?: string
  category?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  availability?: ProductAvailability | ''
  sort?: ProductSort | ''
}

export async function listProducts(params: ProductListParams = {}): Promise<Product[]> {
  const query = new URLSearchParams()
  const search = params.search?.trim()
  if (search) query.set('search', search)
  if (params.category) query.set('category', params.category)
  if (params.condition) query.set('condition', params.condition)
  if (params.minPrice !== undefined) query.set('min_price', String(params.minPrice))
  if (params.maxPrice !== undefined) query.set('max_price', String(params.maxPrice))
  if (params.availability) query.set('availability', params.availability)
  if (params.sort) query.set('sort', params.sort)

  const queryString = query.toString()
  const response = await apiClient.get<ProductResponse[]>(`/products${queryString ? `?${queryString}` : ''}`)
  return response.map(toProduct)
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await apiClient.get<ProductResponse>(`/products/${slug}`)
  return toProduct(response)
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

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const response = await apiClient.post<ProductResponse>('/products', toRequestBody(payload))
  return toProduct(response)
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const response = await apiClient.patch<ProductResponse>(`/products/${id}`, toRequestBody(payload))
  return toProduct(response)
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.del(`/products/${id}`)
}

export async function setStatus(id: number, status: 'available' | 'reserved' | 'archived'): Promise<Product> {
  const response = await apiClient.patch<ProductResponse>(`/products/${id}/status`, { status })
  return toProduct(response)
}

export async function uploadProductImages(id: number, files: File[]): Promise<Product> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const response = await apiClient.postForm<ProductResponse>(`/products/${id}/images`, formData)
  return toProduct(response)
}

export async function removeProductImage(id: number, imageId: number): Promise<Product> {
  const response = await apiClient.del<ProductResponse>(`/products/${id}/images/${imageId}`)
  return toProduct(response)
}

export async function setPrimaryImage(id: number, imageId: number): Promise<Product> {
  const response = await apiClient.patch<ProductResponse>(`/products/${id}/images/${imageId}/primary`)
  return toProduct(response)
}

export async function reorderProductImages(id: number, imageIds: number[]): Promise<Product> {
  const response = await apiClient.patch<ProductResponse>(`/products/${id}/images/reorder`, { image_ids: imageIds })
  return toProduct(response)
}

export async function markAsSold(id: number, buyerIdentifier?: string): Promise<Product> {
  const response = await apiClient.post<ProductResponse>(`/products/${id}/sold`, {
    buyer_identifier: buyerIdentifier || undefined,
  })
  return toProduct(response)
}
