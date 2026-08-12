import { apiClient } from './apiClient'

export interface User {
  id: number
  fullName: string
  username: string
  email: string
  university: string
  department: string
  studentId: string
  phone?: string | null
  profileImage?: string | null
  bio?: string | null
  isAdmin: boolean
  createdAt: string
}

interface RawUser {
  id: number
  full_name: string
  username: string
  email: string
  university: string
  department: string
  student_id: string
  phone: string | null
  profile_image: string | null
  bio: string | null
  is_admin: boolean
  created_at: string
}

interface AuthResponse {
  user: RawUser
}

function toUser(user: RawUser): User {
  return {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    email: user.email,
    university: user.university,
    department: user.department,
    studentId: user.student_id,
    phone: user.phone,
    profileImage: user.profile_image,
    bio: user.bio,
    isAdmin: user.is_admin,
    createdAt: user.created_at,
  }
}

export interface LoginPayload {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterPayload {
  fullName: string
  username: string
  email: string
  university: string
  department: string
  studentId: string
  phone?: string
  password: string
  confirmPassword: string
}

export interface UpdateProfilePayload {
  fullName?: string
  phone?: string
  department?: string
  university?: string
  bio?: string
}

export async function login(payload: LoginPayload): Promise<User> {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email: payload.email,
    password: payload.password,
    remember_me: payload.rememberMe,
  })
  return toUser(response.user)
}

export async function register(payload: RegisterPayload): Promise<User> {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    full_name: payload.fullName,
    username: payload.username,
    email: payload.email,
    university: payload.university,
    department: payload.department,
    student_id: payload.studentId,
    phone: payload.phone,
    password: payload.password,
    confirm_password: payload.confirmPassword,
  })
  return toUser(response.user)
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get<AuthResponse>('/auth/me')
  return toUser(response.user)
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const raw = await apiClient.patch<RawUser>('/users/me', {
    full_name: payload.fullName,
    phone: payload.phone,
    department: payload.department,
    university: payload.university,
    bio: payload.bio,
  })
  return toUser(raw)
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData()
  formData.append('file', file)
  const raw = await apiClient.postForm<RawUser>('/users/me/avatar', formData)
  return toUser(raw)
}

export async function deleteAccount(password: string): Promise<void> {
  await apiClient.del('/users/me', { password })
}
