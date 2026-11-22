import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Inbox, User, Layers, ShieldCheck } from 'lucide-react'

export const ProfessionalDashboardPage: React.FC = () => {
  const { profile } = useAuth()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Professional Hub — {profile?.fullName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your incoming jobs, trade specializations, and service area.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Incoming Orders</h3>
            <p className="text-xs text-slate-500 mt-1">
              Review new repair requests, accept or decline, and mark jobs as completed.
            </p>
          </div>
          <Link to="/professional/requests" className="block pt-2">
            <Button size="sm" className="w-full">
              Manage Orders
            </Button>
          </Link>
        </Card>

        <Card className="p-6 space-y-4 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage Services</h3>
            <p className="text-xs text-slate-500 mt-1">
              Set your specific trade skills, descriptions, and starting labor rates.
            </p>
          </div>
          <Link to="/professional/services" className="block pt-2">
            <Button size="sm" variant="outline" className="w-full">
              Edit Services
            </Button>
          </Link>
        </Card>

        <Card className="p-6 space-y-4 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Profile & Area</h3>
            <p className="text-xs text-slate-500 mt-1">
              Update availability toggle, map coordinates, experience years, and bio.
            </p>
          </div>
          <Link to="/professional/profile" className="block pt-2">
            <Button size="sm" variant="outline" className="w-full">
              Profile Settings
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
