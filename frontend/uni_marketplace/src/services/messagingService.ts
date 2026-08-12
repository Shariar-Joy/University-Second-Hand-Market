import { apiClient } from './apiClient'
import { toProduct } from './productService'
import type { Product, ProductResponse } from './productService'
import { toTutor } from './tutorService'
import type { Tutor, TutorResponse } from './tutorService'

export interface ConversationParticipant {
  id: number
  fullName: string
  profileImage: string | null
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  content: string
  createdAt: string
}

export interface Conversation {
  id: number
  buyer: ConversationParticipant
  seller: ConversationParticipant
  product: Product | null
  tutor: Tutor | null
  createdAt: string
  updatedAt: string
  lastMessage: Message | null
  unread: boolean
}

interface ParticipantResponse {
  id: number
  full_name: string
  profile_image: string | null
}

interface MessageResponse {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  created_at: string
}

interface ConversationResponse {
  id: number
  buyer: ParticipantResponse
  seller: ParticipantResponse
  product: ProductResponse | null
  tutor: TutorResponse | null
  created_at: string
  updated_at: string
  last_message: MessageResponse | null
  unread: boolean
}

interface ConversationMessagesResponse {
  conversation: ConversationResponse
  messages: MessageResponse[]
}

function toParticipant(response: ParticipantResponse): ConversationParticipant {
  return { id: response.id, fullName: response.full_name, profileImage: response.profile_image }
}

function toMessage(response: MessageResponse): Message {
  return {
    id: response.id,
    conversationId: response.conversation_id,
    senderId: response.sender_id,
    content: response.content,
    createdAt: response.created_at,
  }
}

function toConversation(response: ConversationResponse): Conversation {
  return {
    id: response.id,
    buyer: toParticipant(response.buyer),
    seller: toParticipant(response.seller),
    product: response.product ? toProduct(response.product) : null,
    tutor: response.tutor ? toTutor(response.tutor) : null,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    lastMessage: response.last_message ? toMessage(response.last_message) : null,
    unread: response.unread,
  }
}

export async function listConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<ConversationResponse[]>('/conversations')
  return response.map(toConversation)
}

export async function startConversation(productId: number): Promise<Conversation> {
  const response = await apiClient.post<ConversationResponse>('/conversations', { product_id: productId })
  return toConversation(response)
}

export async function startTutorConversation(tutorId: number): Promise<Conversation> {
  const response = await apiClient.post<ConversationResponse>('/conversations', { tutor_id: tutorId })
  return toConversation(response)
}

export async function getConversationMessages(
  conversationId: number,
): Promise<{ conversation: Conversation; messages: Message[] }> {
  const response = await apiClient.get<ConversationMessagesResponse>(`/conversations/${conversationId}/messages`)
  return {
    conversation: toConversation(response.conversation),
    messages: response.messages.map(toMessage),
  }
}

export async function sendMessage(conversationId: number, content: string): Promise<Message> {
  const response = await apiClient.post<MessageResponse>(`/conversations/${conversationId}/messages`, { content })
  return toMessage(response)
}
