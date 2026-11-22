import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  getAllUsers,
  getAllProfessionals,
  getAllCategories,
  createCategory,
  toggleCategoryStatus,
  verifyProfessional,
} from '@/services/firestore/api'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ProfessionalProfile, ProfessionalService, UserProfile } from '@/types'
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  Tag,
  Plus,
  ShieldCheck,
  AlertCircle,
  FileImage,
  ExternalLink,
  UserCheck,
  Wrench,
  Zap,
  Eye,
  FileCheck,
} from 'lucide-react'

type EnrichedPro = ProfessionalProfile & { user?: UserProfile; services?: ProfessionalService[] }

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAllUsers,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })

  const { data: pros = [], isLoading: prosLoading } = useQuery({
    queryKey: ['adminPros'],
    queryFn: getAllProfessionals,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAllCategories,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catSubmitting, setCatSubmitting] = useState(false)

  // Professional Detail Modal
  const [selectedPro, setSelectedPro] = useState<EnrichedPro | null>(null)
  const [isProModalOpen, setIsProModalOpen] = useState(false)
  const [modalReason, setModalReason] = useState('Application qualifications verified.')

  // Filter tab for professionals: 'all' | 'electrician' | 'plumber' | 'pending'
  const [proFilter, setProFilter] = useState<'all' | 'electrician' | 'plumber' | 'pending'>('all')

  // Verification error
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Helper classifiers for Electricians and Plumbers
  const isElectrician = (p: EnrichedPro) => {
    if (p.tradeType === 'electrician' || p.tradeType === 'both') return true
    const bio = (p.bio || '').toLowerCase()
    if (bio.includes('electr') || bio.includes('wiring') || bio.includes('switchboard') || bio.includes('breaker')) return true
    if (p.services?.some((s) => s.categoryId?.toLowerCase().includes('electr') || s.description?.toLowerCase().includes('electr'))) return true
    return false
  }

  const isPlumber = (p: EnrichedPro) => {
    if (p.tradeType === 'plumber' || p.tradeType === 'both') return true
    const bio = (p.bio || '').toLowerCase()
    if (bio.includes('plumb') || bio.includes('pipe') || bio.includes('drain') || bio.includes('leak') || bio.includes('tap') || bio.includes('geyser')) return true
    if (p.services?.some((s) => s.categoryId?.toLowerCase().includes('plumb') || s.description?.toLowerCase().includes('plumb'))) return true
    return false
  }

  const getTradeLabel = (p: EnrichedPro) => {
    const isElec = isElectrician(p)
    const isPlumb = isPlumber(p)
    if (isElec && isPlumb) return { label: '⚡🔧 Multi-trade', variant: 'info' as const }
    if (isElec) return { label: '⚡ Electrician', variant: 'warning' as const }
    if (isPlumb) return { label: '🔧 Plumber', variant: 'info' as const }
    return { label: '🛠️ General Pro', variant: 'neutral' as const }
  }

  const handleVerify = async (proId: string, status: 'VERIFIED' | 'REJECTED', customReason?: string) => {
    if (!user) return
    const reason = customReason || prompt(
      `Enter admin reason/notes for ${status === 'VERIFIED' ? 'approving' : 'rejecting'}:`,
      status === 'VERIFIED' ? 'Application criteria and qualifications verified.' : 'Insufficient experience details or qualification proof.'
    )
    if (!reason) return

    setVerifyError(null)
    setActionLoading(true)
    try {
      await verifyProfessional(user.uid, proId, status, reason)
      queryClient.invalidateQueries({ queryKey: ['adminPros'] })
      // Update selected pro modal if open
      if (selectedPro?.userId === proId) {
        setSelectedPro((prev) => prev ? { ...prev, verificationStatus: status } : null)
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Verification update failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCatSubmitting(true)
    try {
      await createCategory(catName, catDesc)
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] })
      setIsCatModalOpen(false)
      setCatName('')
      setCatDesc('')
    } catch (err: any) {
      alert(err.message || 'Failed to create category')
    } finally {
      setCatSubmitting(false)
    }
  }

  const handleToggleCategory = async (catId: string, current: boolean) => {
    await toggleCategoryStatus(catId, !current)
    queryClient.invalidateQueries({ queryKey: ['adminCategories'] })
  }

  const openProModal = (pro: EnrichedPro) => {
    setSelectedPro(pro)
    setModalReason(
      pro.verificationStatus === 'VERIFIED'
        ? 'Verified trade specialist'
        : 'Reviewed qualification document and experience'
    )
    setIsProModalOpen(true)
  }

  // Computed platform statistics
  const customerCount = users.filter((u) => u.role === 'customer').length
  const professionalCount = users.filter((u) => u.role === 'professional').length
  const electricianCount = pros.filter(isElectrician).length
  const plumberCount = pros.filter(isPlumber).length
  const pendingCount = pros.filter((p) => p.verificationStatus === 'PENDING').length
  const activeCatCount = categories.filter((c) => c.isActive).length

  // Filtered professionals list for table
  const displayedPros = pros.filter((p) => {
    if (proFilter === 'electrician') return isElectrician(p)
    if (proFilter === 'plumber') return isPlumber(p)
    if (proFilter === 'pending') return p.verificationStatus === 'PENDING'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Admin Platform Dashboard</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Review &amp; verify qualifications of electricians and plumbers, monitor registered customers, and govern service categories.
        </p>
      </div>

      {verifyError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{verifyError}</span>
        </div>
      )}

      {/* Top Overview Cards - Specific Counts Requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Customers */}
        <Card className="p-5 space-y-2 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Customers
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {usersLoading ? '—' : customerCount}
          </div>
          <p className="text-xs text-slate-400">Total registered clients</p>
        </Card>

        {/* Electricians */}
        <Card className="p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Electricians
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {prosLoading ? '—' : electricianCount}
          </div>
          <p className="text-xs text-slate-400">Electrical specialists</p>
        </Card>

        {/* Plumbers */}
        <Card className="p-5 space-y-2 border-l-4 border-l-cyan-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Plumbers
            </span>
          </div>
          <div className="text-3xl font-extrabold text-cyan-700">
            {prosLoading ? '—' : plumberCount}
          </div>
          <p className="text-xs text-slate-400">Plumbing specialists</p>
        </Card>

        {/* Pending Verifications */}
        <Card className="p-5 space-y-2 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </span>
          </div>
          <div className="text-3xl font-extrabold text-orange-600">
            {prosLoading ? '—' : pendingCount}
          </div>
          <p className="text-xs text-slate-400">Qualifications to verify</p>
        </Card>

        {/* Active Categories */}
        <Card className="p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Tag className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Trades
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            {catsLoading ? '—' : activeCatCount}
          </div>
          <p className="text-xs text-slate-400">Service categories active</p>
        </Card>
      </div>

      {/* Professional Verification Queue & Qualification Review */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Trade Specialists &amp; Qualification Verification</h2>
            <p className="text-xs text-slate-500">Review qualifications submitted by electricians and plumbers.</p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setProFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                proFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({pros.length})
            </button>
            <button
              onClick={() => setProFilter('electrician')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                proFilter === 'electrician' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ Electricians ({electricianCount})
            </button>
            <button
              onClick={() => setProFilter('plumber')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                proFilter === 'plumber' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔧 Plumbers ({plumberCount})
            </button>
            <button
              onClick={() => setProFilter('pending')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                proFilter === 'pending' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏳ Pending ({pendingCount})
            </button>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3.5">Specialist</th>
                  <th className="px-6 py-3.5">Trade</th>
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Service Area</th>
                  <th className="px-6 py-3.5">Qualification Photo</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prosLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-sm">
                      Loading trade specialists...
                    </td>
                  </tr>
                ) : displayedPros.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No professionals found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  displayedPros.map((pro) => {
                    const trade = getTradeLabel(pro)
                    return (
                      <tr key={pro.userId} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openProModal(pro)}
                            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline text-left block"
                          >
                            {pro.user?.fullName || pro.userId.slice(0, 8)}
                          </button>
                          <div className="text-xs font-normal text-slate-400">{pro.user?.email}</div>
                          <div className="text-xs font-normal text-slate-400">{pro.user?.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={trade.variant}>{trade.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{pro.experienceYears || 0} years</td>
                        <td className="px-6 py-4 text-slate-600">{pro.serviceArea || 'Not specified'}</td>
                        <td className="px-6 py-4">
                          {pro.qualificationPhotoURL ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={pro.qualificationPhotoURL}
                                alt="Qualification"
                                className="w-9 h-9 object-cover rounded-md border border-slate-200 cursor-pointer hover:opacity-80"
                                onClick={() => openProModal(pro)}
                                title="Click to inspect"
                              />
                              <a
                                href={pro.qualificationPhotoURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <span>Inspect</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No document</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              pro.verificationStatus === 'VERIFIED'
                                ? 'success'
                                : pro.verificationStatus === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {pro.verificationStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProModal(pro)}
                            className="text-xs px-2.5 py-1 gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Review
                          </Button>
                          {pro.verificationStatus !== 'VERIFIED' && (
                            <Button
                              size="sm"
                              onClick={() => handleVerify(pro.userId, 'VERIFIED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs px-2.5 py-1"
                            >
                              Approve
                            </Button>
                          )}
                          {pro.verificationStatus !== 'REJECTED' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleVerify(pro.userId, 'REJECTED')}
                              className="text-xs px-2.5 py-1"
                            >
                              Reject
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Service Category Governance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Service Categories</h2>
            <p className="text-xs text-slate-500">Manage plumbing, electrical, and other specialized trade categories.</p>
          </div>
          <Button size="sm" onClick={() => setIsCatModalOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-5 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                  <Badge variant={cat.isActive ? 'success' : 'neutral'}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleCategory(cat.id, cat.isActive)}
                  className="text-xs"
                >
                  {cat.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Users (Customers & Professionals Directory) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Registered Platform Customers ({customerCount})</h2>
          <p className="text-xs text-slate-500">Overview of all active customer accounts registered on the website.</p>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                      Loading users...
                    </td>
                  </tr>
                ) : users.filter((u) => u.role === 'customer').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No customer accounts registered yet.
                    </td>
                  </tr>
                ) : (
                  users
                    .filter((u) => u.role === 'customer')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-900">{u.fullName}</td>
                        <td className="px-6 py-4 text-slate-600">{u.email}</td>
                        <td className="px-6 py-4 text-slate-600">{u.phone || '—'}</td>
                        <td className="px-6 py-4">
                          <Badge variant="neutral">Customer</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Professional Detail & Qualification Review Modal */}
      <Modal
        isOpen={isProModalOpen}
        onClose={() => { setIsProModalOpen(false); setSelectedPro(null) }}
        title={selectedPro?.user?.fullName ? `${selectedPro.user.fullName} - Qualification Review` : 'Specialist Details'}
      >
        {selectedPro && (
          <div className="space-y-5 text-left">
            {/* Status Header */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Verification Status</span>
                <span className="text-sm font-bold text-slate-900">{getTradeLabel(selectedPro).label}</span>
              </div>
              <Badge
                variant={
                  selectedPro.verificationStatus === 'VERIFIED'
                    ? 'success'
                    : selectedPro.verificationStatus === 'REJECTED'
                    ? 'danger'
                    : 'warning'
                }
              >
                {selectedPro.verificationStatus}
              </Badge>
            </div>

            {/* Contact & Professional Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
                <p className="text-slate-900 font-medium mt-0.5 break-all">{selectedPro.user?.email || '—'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phone</p>
                <p className="text-slate-900 font-medium mt-0.5">{selectedPro.user?.phone || '—'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Experience</p>
                <p className="text-slate-900 font-medium mt-0.5">{selectedPro.experienceYears || 0} years</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Service Area</p>
                <p className="text-slate-900 font-medium mt-0.5">{selectedPro.serviceArea || '—'}</p>
              </div>
            </div>

            {/* Bio */}
            {selectedPro.bio && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Trade Bio &amp; Background</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">{selectedPro.bio}</p>
              </div>
            )}

            {/* Qualification Document Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-slate-700 uppercase tracking-wider font-bold">
                    Uploaded Qualification Document
                  </p>
                </div>
                {selectedPro.qualificationPhotoURL && (
                  <a
                    href={selectedPro.qualificationPhotoURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Open Full Size <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {selectedPro.qualificationPhotoURL ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-2 text-center">
                  <img
                    src={selectedPro.qualificationPhotoURL}
                    alt="Qualification certificate"
                    className="w-full max-h-72 object-contain rounded-lg mx-auto"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">
                    No qualification certificate or license has been uploaded by this specialist yet.
                  </p>
                </div>
              )}
            </div>

            {/* Verification Reason / Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Review Notes / Reason
              </label>
              <textarea
                rows={2}
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="Notes about certificate validity, license verification, or missing documents..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="ghost"
                onClick={() => { setIsProModalOpen(false); setSelectedPro(null) }}
              >
                Close
              </Button>

              {selectedPro.verificationStatus !== 'REJECTED' && (
                <Button
                  variant="danger"
                  isLoading={actionLoading}
                  onClick={() => {
                    handleVerify(selectedPro.userId, 'REJECTED', modalReason)
                    setIsProModalOpen(false)
                  }}
                >
                  Reject Application
                </Button>
              )}

              {selectedPro.verificationStatus !== 'VERIFIED' && (
                <Button
                  isLoading={actionLoading}
                  onClick={() => {
                    handleVerify(selectedPro.userId, 'VERIFIED', modalReason)
                    setIsProModalOpen(false)
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Approve &amp; Verify Specialist
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Category Modal */}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Create Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="E.g., HVAC & Cooling"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category Description
            </label>
            <textarea
              required
              rows={3}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Describe the trade requirements..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={catSubmitting}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
