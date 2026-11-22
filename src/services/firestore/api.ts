import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import {
  UserProfile,
  ProfessionalProfile,
  ServiceCategory,
  ProfessionalService,
  ServiceRequest,
  RequestStatus,
  Review,
  AdminAction,
} from '@/types'

// --- Categories ---
export async function getActiveCategories(): Promise<ServiceCategory[]> {
  const colRef = collection(db, 'serviceCategories')
  const snap = await getDocs(colRef)
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceCategory, 'id'>) }))
    .filter((c) => c.isActive)
}

export async function getAllCategories(): Promise<ServiceCategory[]> {
  const colRef = collection(db, 'serviceCategories')
  const snap = await getDocs(colRef)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceCategory, 'id'>) }))
}

export async function createCategory(name: string, description: string): Promise<void> {
  const docRef = doc(collection(db, 'serviceCategories'))
  const now = new Date().toISOString()
  await setDoc(docRef, {
    name,
    description,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  })
}

export async function toggleCategoryStatus(categoryId: string, isActive: boolean): Promise<void> {
  const docRef = doc(db, 'serviceCategories', categoryId)
  await updateDoc(docRef, {
    isActive,
    updatedAt: new Date().toISOString(),
  })
}

// --- Professionals & Services ---
export async function getProfessionalProfile(uid: string): Promise<ProfessionalProfile | null> {
  const snap = await getDoc(doc(db, 'professionalProfiles', uid))
  if (!snap.exists()) return null
  return snap.data() as ProfessionalProfile
}

export async function updateProfessionalProfile(
  uid: string,
  data: Partial<Pick<ProfessionalProfile, 'bio' | 'experienceYears' | 'tradeType' | 'availabilityStatus' | 'serviceArea' | 'latitude' | 'longitude' | 'qualificationPhotoURL'>>
): Promise<void> {
  const docRef = doc(db, 'professionalProfiles', uid)
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function getProfessionalServices(professionalId: string): Promise<ProfessionalService[]> {
  const colRef = collection(db, 'professionalServices')
  const q = query(colRef, where('professionalId', '==', professionalId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProfessionalService, 'id'>) }))
}

export async function addProfessionalService(
  professionalId: string,
  categoryId: string,
  description: string,
  startingPrice: number
): Promise<void> {
  const docRef = doc(collection(db, 'professionalServices'))
  const now = new Date().toISOString()
  await setDoc(docRef, {
    professionalId,
    categoryId,
    description,
    startingPrice,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  })
}

export async function deleteProfessionalService(serviceId: string): Promise<void> {
  const docRef = doc(db, 'professionalServices', serviceId)
  await updateDoc(docRef, { isActive: false, updatedAt: new Date().toISOString() })
}

// Get all active professionals for discovery (verified professionals, or any registered pro in prototype mode)
export async function getVerifiedProfessionals(): Promise<
  (ProfessionalProfile & { user?: UserProfile; services?: ProfessionalService[] })[]
> {
  let snap = await getDocs(
    query(
      collection(db, 'professionalProfiles'),
      where('verificationStatus', '==', 'VERIFIED')
    )
  )

  // Prototype fallback: If no verified pros exist yet, show registered pros so prototype can be explored
  if (snap.empty) {
    snap = await getDocs(collection(db, 'professionalProfiles'))
  }

  const profiles = snap.docs.map((d) => d.data() as ProfessionalProfile)

  // Fetch their user names and services efficiently
  const enriched = await Promise.all(
    profiles.map(async (p) => {
      const uSnap = await getDoc(doc(db, 'users', p.userId))
      const user = uSnap.exists() ? (uSnap.data() as UserProfile) : undefined
      const services = await getProfessionalServices(p.userId)
      return { ...p, user, services }
    })
  )
  return enriched
}

// --- Service Requests (Atomic Transaction Powered) ---

export async function createServiceRequest(params: {
  customerId: string
  professionalId: string
  categoryId: string
  description: string
  preferredDate: string
}): Promise<string> {
  const reqRef = doc(collection(db, 'serviceRequests'))
  const historyRef = doc(collection(db, 'requestStatusHistory'))
  const now = new Date().toISOString()

  await runTransaction(db, async (tx) => {
    tx.set(reqRef, {
      customerId: params.customerId,
      professionalId: params.professionalId,
      categoryId: params.categoryId,
      description: params.description,
      preferredDate: params.preferredDate,
      status: 'OPEN',
      completionMarkedAt: null,
      completionConfirmedAt: null,
      createdAt: now,
      updatedAt: now,
    })

    tx.set(historyRef, {
      requestId: reqRef.id,
      changedBy: params.customerId,
      oldStatus: 'OPEN',
      newStatus: 'OPEN',
      note: 'Request created by customer',
      createdAt: now,
    })
  })

  return reqRef.id
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: RequestStatus,
  changedBy: string,
  note?: string
): Promise<void> {
  const reqRef = doc(db, 'serviceRequests', requestId)
  const historyRef = doc(collection(db, 'requestStatusHistory'))
  const now = new Date().toISOString()

  await runTransaction(db, async (tx) => {
    const docSnap = await tx.get(reqRef)
    if (!docSnap.exists()) {
      throw new Error('Service request does not exist')
    }
    const currentData = docSnap.data() as ServiceRequest
    const oldStatus = currentData.status

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updatedAt: now,
    }

    if (newStatus === 'COMPLETION_PENDING_CONFIRMATION') {
      updatePayload.completionMarkedAt = now
    } else if (newStatus === 'COMPLETED') {
      updatePayload.completionConfirmedAt = now
    }

    tx.update(reqRef, updatePayload)

    tx.set(historyRef, {
      requestId,
      changedBy,
      oldStatus,
      newStatus,
      note: note || `Status transitioned to ${newStatus}`,
      createdAt: now,
    })
  })
}

export async function getCustomerRequests(customerId: string): Promise<ServiceRequest[]> {
  const q = query(
    collection(db, 'serviceRequests'),
    where('customerId', '==', customerId)
  )
  const snap = await getDocs(q)
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceRequest, 'id'>) }))
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getProfessionalRequests(professionalId: string): Promise<ServiceRequest[]> {
  const q = query(
    collection(db, 'serviceRequests'),
    where('professionalId', '==', professionalId)
  )
  const snap = await getDocs(q)
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceRequest, 'id'>) }))
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getServiceRequestById(requestId: string): Promise<ServiceRequest | null> {
  const snap = await getDoc(doc(db, 'serviceRequests', requestId))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<ServiceRequest, 'id'>) }
}

export async function getRequestHistory(requestId: string) {
  const q = query(
    collection(db, 'requestStatusHistory'),
    where('requestId', '==', requestId)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

// --- Reviews ---
export async function submitReview(
  requestId: string,
  customerId: string,
  professionalId: string,
  rating: number,
  comment: string
): Promise<void> {
  const reviewRef = doc(db, 'reviews', requestId)
  const reqRef = doc(db, 'serviceRequests', requestId)
  const proRef = doc(db, 'professionalProfiles', professionalId)
  const now = new Date().toISOString()

  await runTransaction(db, async (tx) => {
    const revSnap = await tx.get(reviewRef)
    if (revSnap.exists()) {
      throw new Error('Review already submitted for this service request')
    }

    const reqSnap = await tx.get(reqRef)
    if (!reqSnap.exists()) {
      throw new Error('Service request not found')
    }
    const reqData = reqSnap.data() as ServiceRequest
    if (reqData.status !== 'COMPLETED') {
      throw new Error('Only completed service requests can be reviewed')
    }

    // 1. Write review document
    tx.set(reviewRef, {
      requestId,
      customerId,
      professionalId,
      rating,
      comment,
      createdAt: now,
    })

    // 2. Mark request as REVIEWED
    tx.update(reqRef, {
      status: 'REVIEWED',
      updatedAt: now,
    })

    // 3. Update professional average rating & review count
    const proSnap = await tx.get(proRef)
    if (proSnap.exists()) {
      const proData = proSnap.data() as ProfessionalProfile
      const currentAvg = proData.ratingAverage || 5.0
      const currentCount = proData.reviewCount || 0
      const newCount = currentCount + 1
      const newAvg = Math.round(((currentAvg * currentCount + rating) / newCount) * 10) / 10
      tx.update(proRef, {
        ratingAverage: newAvg,
        reviewCount: newCount,
        updatedAt: now,
      })
    }
  })
}

export async function getProfessionalReviews(professionalId: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('professionalId', '==', professionalId)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => d.data() as Review)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// --- Admin Operations ---
export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => d.data() as UserProfile)
}

export async function getAllProfessionals(): Promise<(ProfessionalProfile & { user?: UserProfile; services?: ProfessionalService[] })[]> {
  const snap = await getDocs(collection(db, 'professionalProfiles'))
  const profiles = snap.docs.map((d) => d.data() as ProfessionalProfile)
  const enriched = await Promise.all(
    profiles.map(async (p) => {
      const uSnap = await getDoc(doc(db, 'users', p.userId))
      const services = await getProfessionalServices(p.userId)
      return {
        ...p,
        user: uSnap.exists() ? (uSnap.data() as UserProfile) : undefined,
        services,
      }
    })
  )
  return enriched
}

export async function verifyProfessional(
  adminId: string,
  professionalId: string,
  status: 'VERIFIED' | 'REJECTED',
  reason: string
): Promise<void> {
  const proRef = doc(db, 'professionalProfiles', professionalId)
  const auditRef = doc(collection(db, 'adminActions'))
  const now = new Date().toISOString()

  await runTransaction(db, async (tx) => {
    tx.update(proRef, {
      verificationStatus: status,
      updatedAt: now,
    })

    tx.set(auditRef, {
      adminId,
      targetUserId: professionalId,
      action: status === 'VERIFIED' ? 'VERIFY_PROFESSIONAL' : 'REJECT_PROFESSIONAL',
      reason,
      createdAt: now,
    })
  })
}

// --- Qualification Photo Upload (Firebase Storage with reliable inline fallback) ---
export async function uploadQualificationPhoto(uid: string, file: File): Promise<string> {
  try {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
    const { storage } = await import('@/services/firebase/config')
    const storageRef = ref(storage, `qualifications/${uid}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    // Save the URL back to the professional profile
    const proRef = doc(db, 'professionalProfiles', uid)
    await updateDoc(proRef, {
      qualificationPhotoURL: downloadURL,
      updatedAt: new Date().toISOString(),
    })
    return downloadURL
  } catch (storageErr) {
    console.warn('Firebase Storage upload encounter, falling back to document storage:', storageErr)
    // Fallback: Read as base64 data URL and persist directly
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string
          const proRef = doc(db, 'professionalProfiles', uid)
          await updateDoc(proRef, {
            qualificationPhotoURL: dataUrl,
            updatedAt: new Date().toISOString(),
          })
          resolve(dataUrl)
        } catch (dbErr) {
          reject(dbErr)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(file)
    })
  }
}
