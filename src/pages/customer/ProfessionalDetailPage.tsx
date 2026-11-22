import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  getProfessionalProfile,
  getProfessionalServices,
  getProfessionalReviews,
  getActiveCategories,
  createServiceRequest,
} from '@/services/firestore/api'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import { ProfessionalProfile, ProfessionalService, Review, ServiceCategory, UserProfile } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Star, ShieldCheck, MapPin, Calendar, Clock, DollarSign, AlertCircle, FileCheck, ExternalLink, Zap, Wrench } from 'lucide-react'

export const ProfessionalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [pro, setPro] = useState<ProfessionalProfile | null>(null)
  const [proUser, setProUser] = useState<UserProfile | null>(null)
  const [services, setServices] = useState<ProfessionalService[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Service Request Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [description, setDescription] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const [profileData, servicesData, reviewsData, catsData] = await Promise.all([
          getProfessionalProfile(id),
          getProfessionalServices(id),
          getProfessionalReviews(id),
          getActiveCategories(),
        ])
        setPro(profileData)
        setServices(servicesData.filter((s) => s.isActive))
        setReviews(reviewsData)
        setCategories(catsData)

        // Load pro user details
        const uSnap = await getDoc(doc(db, 'users', id))
        if (uSnap.exists()) {
          setProUser(uSnap.data() as UserProfile)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return
    setRequestError(null)
    setSubmitting(true)

    try {
      const requestId = await createServiceRequest({
        customerId: user.uid,
        professionalId: id,
        categoryId: selectedCategory || categories[0]?.id || 'plumbing',
        description,
        preferredDate,
      })
      setIsModalOpen(false)
      navigate(`/customer/requests/${requestId}`)
    } catch (err: any) {
      console.error(err)
      setRequestError(err.message || 'Failed to send service request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!pro) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Professional Not Found</h2>
        <p className="text-sm text-slate-500">The requested specialist does not exist or is inactive.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <Avatar name={proUser?.fullName || 'Pro'} size="xl" />
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{proUser?.fullName || 'Verified Specialist'}</h1>
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </Badge>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" /> {pro.serviceArea || 'Local service coverage'}
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600 pt-1">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{pro.ratingAverage ? pro.ratingAverage.toFixed(1) : '5.0'}</span>
                  <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
                </div>
                <div>•</div>
                <div>{pro.experienceYears || 1}+ Years Experience</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
            <Badge
              variant={
                pro.availabilityStatus === 'AVAILABLE'
                  ? 'success'
                  : pro.availabilityStatus === 'BUSY'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {pro.availabilityStatus === 'AVAILABLE'
                ? 'Available for new jobs'
                : pro.availabilityStatus === 'BUSY'
                ? 'Currently Busy'
                : 'Unavailable'}
            </Badge>

            {profile?.role === 'customer' ? (
              <Button size="lg" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                Request Service
              </Button>
            ) : !user ? (
              <Button size="lg" onClick={() => navigate('/login')} className="w-full sm:w-auto">
                Sign in to Request
              </Button>
            ) : null}
          </div>
        </div>

        {/* Bio */}
        <div className="pt-6 text-left space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">About</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {pro.bio || 'Experienced trade specialist providing dependable plumbing and electrical repair solutions.'}
          </p>
        </div>

        {/* Qualification Certificate / Document (if uploaded) */}
        {pro.qualificationPhotoURL && (
          <div className="pt-6 border-t border-slate-100 text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verified Qualification & License
                </h3>
              </div>
              <a
                href={pro.qualificationPhotoURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Full Size <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="max-w-md rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 shadow-xs">
              <img
                src={pro.qualificationPhotoURL}
                alt="Qualification Certificate"
                className="w-full max-h-56 object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Services & Pricing */}
      <div className="text-left space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Offered Services & Starting Rates</h2>
        {services.length === 0 ? (
          <p className="text-sm text-slate-500">Contact the professional directly for custom repair estimates.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => (
              <Card key={svc.id} className="p-5 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{svc.description}</h4>
                  <p className="text-xs text-slate-500 mt-1">Starting from</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-blue-600">${svc.startingPrice}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Verified Reviews */}
      <div className="text-left space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Verified Customer Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-sm">
            No completed reviews yet. Be the first to hire and review this professional!
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <Card key={rev.requestId} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{rev.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Service Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Send Service Request">
        {requestError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{requestError}</span>
          </div>
        )}

        <form onSubmit={handleSendRequest} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Preferred Service Date & Time"
            type="datetime-local"
            required
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Describe the Problem / Repair Needed
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Kitchen sink pipe is leaking under the cabinet. Need replacement fitting."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Send Request to {proUser?.fullName || 'Specialist'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
