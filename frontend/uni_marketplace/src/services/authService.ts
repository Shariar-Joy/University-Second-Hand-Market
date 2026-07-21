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
  createdAt: string
}

interface AuthResponse {
  user: {
    id: number
    full_name: string
    username: string
    email: string
    university: string
    department: string
    student_id: string
    phone: string | null
    created_at: string
  }
}

function toUser(response: AuthResponse): User {
  const { user } = response
  return {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    email: user.email,
    university: user.university,
    department: user.department,
    studentId: user.student_id,
    phone: user.phone,
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

export async function login(payload: LoginPayload): Promise<User> {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email: payload.email,
    password: payload.password,
    remember_me: payload.rememberMe,
  })
  return toUser(response)
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
  return toUser(response)
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get<AuthResponse>('/auth/me')
  return toUser(response)
}
