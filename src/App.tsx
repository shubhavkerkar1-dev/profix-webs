import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { ServicesPage } from '@/pages/public/ServicesPage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'

// Customer Pages
import { CustomerDashboardPage } from '@/pages/customer/CustomerDashboardPage'
import { FindProfessionalsPage } from '@/pages/customer/FindProfessionalsPage'
import { ProfessionalDetailPage } from '@/pages/customer/ProfessionalDetailPage'
import { CustomerRequestsPage } from '@/pages/customer/CustomerRequestsPage'
import { RequestDetailPage } from '@/pages/customer/RequestDetailPage'

// Professional Pages
import { ProfessionalDashboardPage } from '@/pages/professional/ProfessionalDashboardPage'
import { EditProfilePage } from '@/pages/professional/EditProfilePage'
import { ManageServicesPage } from '@/pages/professional/ManageServicesPage'
import { IncomingRequestsPage } from '@/pages/professional/IncomingRequestsPage'

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes default cache
      retry: 1,
    },
  },
})

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Public or Customer Discovery */}
              <Route path="/customer/find" element={<FindProfessionalsPage />} />
              <Route path="/customer/professionals/:id" element={<ProfessionalDetailPage />} />

              {/* Protected Customer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
                <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
                <Route path="/customer/requests" element={<CustomerRequestsPage />} />
                <Route path="/customer/requests/:id" element={<RequestDetailPage />} />
              </Route>

              {/* Protected Professional Routes */}
              <Route element={<ProtectedRoute allowedRoles={['professional', 'admin']} />}>
                <Route path="/professional/dashboard" element={<ProfessionalDashboardPage />} />
                <Route path="/professional/profile" element={<EditProfilePage />} />
                <Route path="/professional/services" element={<ManageServicesPage />} />
                <Route path="/professional/requests" element={<IncomingRequestsPage />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminDashboardPage />} />
                <Route path="/admin/verifications" element={<AdminDashboardPage />} />
                <Route path="/admin/categories" element={<AdminDashboardPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
export default App
