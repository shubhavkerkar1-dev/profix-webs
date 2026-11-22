import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ProFix. High-trust local service finder (Plumbers & Electricians).</p>
          <p className="mt-1 text-xs text-slate-400">Powered by Cloud Firestore and OpenStreetMap.</p>
        </div>
      </footer>
    </div>
  )
}
