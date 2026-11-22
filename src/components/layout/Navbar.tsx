import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Wrench, Shield, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!profile) return '/'
    switch (profile.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'professional':
        return '/professional/dashboard'
      default:
        return '/customer/dashboard'
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">ProFix</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link to="/services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Services
          </Link>
          <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            About Us
          </Link>
          {profile?.role === 'customer' && (
            <Link to="/customer/find" className="text-sm font-medium text-blue-600 hover:text-blue-700 font-semibold">
              Find Pros
            </Link>
          )}
          {profile?.role === 'admin' && (
            <Link to="/admin/dashboard" className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user && profile ? (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Avatar name={profile.fullName} size="sm" />
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-900 leading-tight">{profile.fullName}</div>
                  <div className="text-slate-500 capitalize">{profile.role}</div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
