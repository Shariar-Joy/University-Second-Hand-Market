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
  userId: number | null
  department?: string | null
  experience?: number | null
  availability?: string | null
  bio?: string | null
  createdAt: string
}

export interface TutorResponse {
  id: number
  slug: string
  name: string
  university: string
  subjects: string[]
  price_per_class: number
  rating: number
  review_count: number
  user_id: number | null
  department: string | null
  experience: number | null
  availability: string | null
  bio: string | null
  created_at: string
}

export function toTutor(response: TutorResponse): Tutor {
  return {
    id: response.id,
    slug: response.slug,
    name: response.name,
    university: response.university,
    subjects: response.subjects,
    pricePerClass: response.price_per_class,
    rating: response.rating,
    reviewCount: response.review_count,
    userId: response.user_id,
    department: response.department,
    experience: response.experience,
    availability: response.availability,
    bio: response.bio,
    createdAt: response.created_at,
  }
}

export interface TutorPayload {
  subjects?: string[]
  pricePerClass?: number
  availability?: string
  department?: string
  experience?: number
  bio?: string
}

function toRequestBody(payload: TutorPayload) {
  return {
    subjects: payload.subjects,
    price_per_class: payload.pricePerClass,
    availability: payload.availability,
    department: payload.department,
    experience: payload.experience,
    bio: payload.bio,
  }
}

export async function listTutors(): Promise<Tutor[]> {
  const response = await apiClient.get<TutorResponse[]>('/tutors')
  return response.map(toTutor)
}

export async function getTutorBySlug(slug: string): Promise<Tutor> {
  const response = await apiClient.get<TutorResponse>(`/tutors/${slug}`)
  return toTutor(response)
}

export async function getMyTutorProfile(): Promise<Tutor> {
  const response = await apiClient.get<TutorResponse>('/tutors/me')
  return toTutor(response)
}

export async function createTutorProfile(payload: TutorPayload): Promise<Tutor> {
  const response = await apiClient.post<TutorResponse>('/tutors', toRequestBody(payload))
  return toTutor(response)
}

export async function updateTutorProfile(payload: TutorPayload): Promise<Tutor> {
  const response = await apiClient.patch<TutorResponse>('/tutors/me', toRequestBody(payload))
  return toTutor(response)
}
