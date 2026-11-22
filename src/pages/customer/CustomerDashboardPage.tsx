import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Search, ClipboardList, User, ShieldCheck } from 'lucide-react'

export const CustomerDashboardPage: React.FC = () => {
  const { profile } = useAuth()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {profile?.fullName || 'Customer'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your home repairs and service requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Find Professionals</h3>
            <p className="text-xs text-slate-500 mt-1">
              Search nearby plumbers and electricians with interactive OpenStreetMap discovery.
            </p>
          </div>
          <Link to="/customer/find" className="block pt-2">
            <Button size="sm" className="w-full">
              Explore Map & Search
            </Button>
          </Link>
        </Card>

        <Card className="p-6 space-y-4 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">My Service Requests</h3>
            <p className="text-xs text-slate-500 mt-1">
              Track status in real-time, cancel requests, or confirm completed repairs.
            </p>
          </div>
          <Link to="/customer/requests" className="block pt-2">
            <Button size="sm" variant="outline" className="w-full">
              View Active Requests
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
