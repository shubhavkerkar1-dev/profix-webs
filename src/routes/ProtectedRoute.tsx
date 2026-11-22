import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect user to their own role dashboard if they try to access unauthorized pages
    if (profile.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />
    } else if (profile.role === 'professional') {
      return <Navigate to="/professional/dashboard" replace />
    } else if (profile.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
