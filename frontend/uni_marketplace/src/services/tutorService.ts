import { apiClient } from './apiClient'

export interface Tutor {
  id: number
  slug: string
  name: string
  university: string
  subjects: string[]
  pricePerClass: number
  rating: number
  reviewCount: number
  createdAt: string
}

interface TutorResponse {
  id: number
  slug: string
  name: string
  university: string
  subjects: string[]
  price_per_class: number
  rating: number
  review_count: number
  created_at: string
}

function toTutor(response: TutorResponse): Tutor {
  return {
    id: response.id,
    slug: response.slug,
    name: response.name,
    university: response.university,
    subjects: response.subjects,
    pricePerClass: response.price_per_class,
    rating: response.rating,
    reviewCount: response.review_count,
    createdAt: response.created_at,
  }
}

export async function listTutors(): Promise<Tutor[]> {
  const response = await apiClient.get<TutorResponse[]>('/tutors')
  return response.map(toTutor)
}
