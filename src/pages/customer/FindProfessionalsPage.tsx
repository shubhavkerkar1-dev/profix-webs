import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowUpDown,
  Navigation,
} from 'lucide-react'
import { getVerifiedProfessionals, getActiveCategories } from '@/services/firestore/api'
import { ProfessionalProfile, ProfessionalService, ServiceCategory, UserProfile } from '@/types'
import { calculateDistanceKm } from '@/utils/cn'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export const FindProfessionalsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialCat = searchParams.get('category') || 'all'

  const [professionals, setProfessionals] = useState<
    (ProfessionalProfile & { user?: UserProfile; services?: ProfessionalService[] })[]
  >([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat)
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'rating' | 'distance'>('rating')
  const [loading, setLoading] = useState(true)

  // Customer geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [pros, cats] = await Promise.all([
          getVerifiedProfessionals(),
          getActiveCategories(),
        ])
        setProfessionals(pros)
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load professionals:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setSortBy('distance')
        setLocating(false)
      },
      (err) => {
        console.warn(err)
        alert('Could not access location. Please check browser permissions.')
        setLocating(false)
      }
    )
  }

  // Filter & sort
  const filteredPros = professionals
    .map((pro) => {
      let distanceKm: number | null = null
      if (userLocation && pro.latitude && pro.longitude) {
        distanceKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          pro.latitude,
          pro.longitude
        )
      }
      return { ...pro, distanceKm }
    })
    .filter((pro) => {
      if (selectedCategory !== 'all') {
        const offersCategory = pro.services?.some(
          (s) => s.isActive && s.categoryId === selectedCategory
        )
        if (!offersCategory) return false
      }
      if (availabilityFilter !== 'all' && pro.availabilityStatus !== availabilityFilter) {
        return false
      }
      if (minRating > 0 && (pro.ratingAverage || 0) < minRating) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'distance' && a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm
      }
      // Sort by rating descending by default
      return (b.ratingAverage || 0) - (a.ratingAverage || 0)
    })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Find Trusted Professionals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare verified local plumbers & electricians near you.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetLocation}
            isLoading={locating}
            className="gap-2"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            {userLocation ? 'Location Enabled' : 'Use My Location'}
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Trade Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-sm bg-transparent border-0 focus:ring-0 font-medium text-slate-800 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Availability</label>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full text-sm bg-transparent border-0 focus:ring-0 font-medium text-slate-800 cursor-pointer"
          >
            <option value="all">Any Status</option>
            <option value="AVAILABLE">Available Now</option>
            <option value="BUSY">Busy</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>

        {/* Min Rating */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Minimum Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full text-sm bg-transparent border-0 focus:ring-0 font-medium text-slate-800 cursor-pointer"
          >
            <option value={0}>Any Rating</option>
            <option value={4.5}>4.5+ Stars</option>
            <option value={4.0}>4.0+ Stars</option>
            <option value={3.5}>3.5+ Stars</option>
          </select>
        </div>

        {/* Sort */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Sort Results By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full text-sm bg-transparent border-0 focus:ring-0 font-medium text-slate-800 cursor-pointer"
          >
            <option value="rating">Highest Rated</option>
            <option value="distance" disabled={!userLocation}>
              Nearest First {!userLocation ? '(requires location)' : ''}
            </option>
          </select>
        </div>
      </div>

      {/* Main Content Layout: Map & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Pro Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-sm text-slate-500">Searching verified professionals...</p>
            </div>
          ) : filteredPros.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <p className="text-base font-semibold text-slate-700">No professionals found matching your filters</p>
              <p className="text-xs text-slate-500">Try loosening your rating or availability filters.</p>
            </div>
          ) : (
            filteredPros.map((pro) => (
              <Card key={pro.userId} className="p-6 transition-all hover:border-blue-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar name={pro.user?.fullName || 'Pro'} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{pro.user?.fullName || 'Tradesperson'}</h3>
                        <Badge
                          variant={pro.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
                          className="gap-1 py-0.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{pro.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending Verification'}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{pro.ratingAverage ? pro.ratingAverage.toFixed(1) : '5.0'}</span>
                          <span className="text-slate-400 font-normal">({pro.reviewCount || 0} reviews)</span>
                        </div>
                        <div>•</div>
                        <div>{pro.experienceYears || 1}+ Years Exp</div>
                        {pro.distanceKm !== null && (
                          <>
                            <div>•</div>
                            <div className="flex items-center gap-1 text-blue-600 font-medium">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{pro.distanceKm} km away</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
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
                        ? 'Available Now'
                        : pro.availabilityStatus === 'BUSY'
                        ? 'Busy'
                        : 'Unavailable'}
                    </Badge>

                    <Link to={`/customer/professionals/${pro.userId}`}>
                      <Button size="sm">View Profile</Button>
                    </Link>
                  </div>
                </div>

                {pro.bio && (
                  <p className="mt-4 text-xs sm:text-sm text-slate-600 line-clamp-2 text-left">
                    {pro.bio}
                  </p>
                )}

                {pro.services && pro.services.filter((s) => s.isActive).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Services:
                    </span>
                    {pro.services
                      .filter((s) => s.isActive)
                      .slice(0, 3)
                      .map((svc) => (
                        <span
                          key={svc.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700"
                        >
                          <span>{svc.description}</span>
                          <span className="text-blue-600 font-bold">from ${svc.startingPrice}</span>
                        </span>
                      ))}
                    {pro.services.filter((s) => s.isActive).length > 3 && (
                      <span className="text-xs text-slate-400 font-medium">
                        +{pro.services.filter((s) => s.isActive).length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Interactive OpenStreetMap View */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-[500px]">
            <MapContainer
              center={[userLocation?.lat || 28.6139, userLocation?.lng || 77.2090]}
              zoom={12}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>
                    <div className="text-xs font-semibold">Your Location</div>
                  </Popup>
                </Marker>
              )}

              {filteredPros.map((pro) => (
                <Marker key={pro.userId} position={[pro.latitude || 28.6139, pro.longitude || 77.2090]}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-900">{pro.user?.fullName || 'Pro'}</div>
                      <div className="text-slate-500">{pro.serviceArea || 'Local area'}</div>
                      <Link
                        to={`/customer/professionals/${pro.userId}`}
                        className="text-blue-600 font-semibold hover:underline block pt-1"
                      >
                        Request Service →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
