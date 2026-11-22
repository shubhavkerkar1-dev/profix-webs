import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase/config'
import { UserProfile, UserRole } from '@/types'

interface AuthContextType {
  user: FirebaseUser | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, pass: string) => Promise<void>
  signUp: (params: { email: string; pass: string; fullName: string; phone: string; role: 'customer' | 'professional' }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile)
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid)
    }
  }

  const signIn = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass)
    await fetchProfile(cred.user.uid)
  }

  const signUp = async ({
    email,
    pass,
    fullName,
    phone,
    role,
  }: {
    email: string
    pass: string
    fullName: string
    phone: string
    role: 'customer' | 'professional'
  }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass)
    const now = new Date().toISOString()
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      fullName,
      email,
      phone,
      role: role as UserRole, // 'customer' | 'professional', strictly non-admin
      createdAt: now,
      updatedAt: now,
    }

    // Save profile to users collection
    await setDoc(doc(db, 'users', cred.user.uid), newProfile)

    // If professional, initialize professionalProfiles document
    if (role === 'professional') {
      await setDoc(doc(db, 'professionalProfiles', cred.user.uid), {
        userId: cred.user.uid,
        bio: '',
        experienceYears: 0,
        verificationStatus: 'PENDING',
        availabilityStatus: 'AVAILABLE',
        serviceArea: '',
        latitude: 28.6139, // Default approx center (e.g. New Delhi or local default)
        longitude: 77.2090,
        createdAt: now,
        updatedAt: now,
      })
    }

    setProfile(newProfile)
  }

  const signOut = async () => {
    await fbSignOut(auth)
    setUser(null)
    setProfile(null)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
