export type UserRole = 'customer' | 'professional' | 'admin'

export interface UserProfile {
  uid: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
export type TradeType = 'electrician' | 'plumber' | 'both' | 'other'

export interface ProfessionalProfile {
  userId: string
  bio: string
  experienceYears: number
  tradeType?: TradeType
  verificationStatus: VerificationStatus
  availabilityStatus: AvailabilityStatus
  serviceArea: string
  latitude: number
  longitude: number
  ratingAverage?: number
  reviewCount?: number
  qualificationPhotoURL?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceCategory {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProfessionalService {
  id: string
  professionalId: string
  categoryId: string
  description: string
  startingPrice: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type RequestStatus =
  | 'OPEN'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETION_PENDING_CONFIRMATION'
  | 'COMPLETED'
  | 'REVIEWED'
  | 'REJECTED'
  | 'CANCELLED'

export interface ServiceRequest {
  id: string
  customerId: string
  professionalId: string
  categoryId: string
  description: string
  preferredDate: string
  status: RequestStatus
  completionMarkedAt?: string | null
  completionConfirmedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface RequestStatusHistory {
  id: string
  requestId: string
  changedBy: string
  oldStatus: RequestStatus
  newStatus: RequestStatus
  note?: string
  createdAt: string
}

export interface Review {
  requestId: string
  customerId: string
  professionalId: string
  rating: number // 1 to 5
  comment: string
  createdAt: string
}

export interface AdminAction {
  id: string
  adminId: string
  targetUserId: string
  action: 'VERIFY_PROFESSIONAL' | 'REJECT_PROFESSIONAL' | 'DELETE_CATEGORY' | 'MODERATE_REVIEW'
  reason: string
  createdAt: string
}
