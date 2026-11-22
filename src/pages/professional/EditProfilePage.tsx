import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getProfessionalProfile,
  updateProfessionalProfile,
  uploadQualificationPhoto,
} from '@/services/firestore/api'
import { ProfessionalProfile, AvailabilityStatus, TradeType } from '@/types'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShieldCheck, AlertCircle, CheckCircle, MapPin, Upload, FileImage, ExternalLink, Zap, Wrench } from 'lucide-react'

export const EditProfilePage: React.FC = () => {
  const { user, profile } = useAuth()
  const [pro, setPro] = useState<ProfessionalProfile | null>(null)
  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState(1)
  const [tradeType, setTradeType] = useState<TradeType>('electrician')
  const [serviceArea, setServiceArea] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('AVAILABLE')
  const [latitude, setLatitude] = useState(28.6139)
  const [longitude, setLongitude] = useState(77.2090)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Photo upload state
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoSuccess, setPhotoSuccess] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [currentPhotoURL, setCurrentPhotoURL] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data = await getProfessionalProfile(user.uid)
        if (data) {
          setPro(data)
          setBio(data.bio || '')
          setExperienceYears(data.experienceYears || 1)
          setTradeType(data.tradeType || 'electrician')
          setServiceArea(data.serviceArea || '')
          setAvailabilityStatus(data.availabilityStatus || 'AVAILABLE')
          setLatitude(data.latitude || 28.6139)
          setLongitude(data.longitude || 77.2090)
          setCurrentPhotoURL(data.qualificationPhotoURL || null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      await updateProfessionalProfile(user.uid, {
        bio,
        experienceYears: Number(experienceYears),
        tradeType,
        serviceArea,
        availabilityStatus,
        latitude: Number(latitude),
        longitude: Number(longitude),
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
      })
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file (JPG, PNG, PDF etc.)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File size must be less than 5MB')
      return
    }

    setPhotoError(null)
    setPhotoSuccess(false)
    setPhotoUploading(true)

    try {
      const downloadURL = await uploadQualificationPhoto(user.uid, file)
      setCurrentPhotoURL(downloadURL)
      setPhotoSuccess(true)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to upload photo. Please try again.')
    } finally {
      setPhotoUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Professional Profile & Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your details updated so clients can discover and book your services.
        </p>
      </div>

      {/* Verification Status Banner */}
      <div className="p-4 rounded-xl border flex items-center justify-between bg-white">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Verification Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-slate-800">
              {pro?.verificationStatus === 'VERIFIED'
                ? 'Fully Verified Professional'
                : pro?.verificationStatus === 'REJECTED'
                ? 'Application Needs Attention'
                : 'Pending Admin Review'}
            </span>
            <Badge
              variant={
                pro?.verificationStatus === 'VERIFIED'
                  ? 'success'
                  : pro?.verificationStatus === 'REJECTED'
                  ? 'danger'
                  : 'warning'
              }
            >
              {pro?.verificationStatus}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-slate-400 max-w-xs text-right">
          Admin manual verification ensures platform trust and client safety.
        </p>
      </div>

      <Card className="p-8">
        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Trade Specialization
              </label>
              <select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value as TradeType)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="electrician">⚡ Electrician (Wiring, Lighting, Panels)</option>
                <option value="plumber">🔧 Plumber (Pipes, Taps, Drains, Heaters)</option>
                <option value="both">⚡🔧 Both (Electrician & Plumber)</option>
                <option value="other">🛠️ Other Specialist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="AVAILABLE">AVAILABLE - Ready to accept requests</option>
                <option value="BUSY">BUSY - Temporarily booked</option>
                <option value="UNAVAILABLE">UNAVAILABLE - Not accepting jobs</option>
              </select>
            </div>
          </div>

          <Input
            label="Years of Trade Experience"
            type="number"
            min={0}
            max={60}
            required
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
          />

          <Input
            label="Service Coverage Area / Neighborhood"
            required
            placeholder="E.g., North District, Metro Center, South Suburbs"
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
          />

          {/* Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              required
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              required
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              Set coordinates from current device location
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Professional Bio & Credentials
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detail your specializations, tools, and background in plumbing or electrical repairs..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ── Qualification Photo Upload ── */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Qualification / Certificate Photo
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Upload a photo of your trade license, certificate, or other qualification document. This will be reviewed by the admin for verification. Max 5MB, image files only.
              </p>

              {/* Current photo preview with thumbnail */}
              {currentPhotoURL && (
                <div className="mb-4 p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileImage className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900">Current Qualification Document</p>
                        <p className="text-xs text-blue-600">Admin will inspect this document during verification</p>
                      </div>
                    </div>
                    <a
                      href={currentPhotoURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
                    >
                      Open Full Size <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-blue-200 bg-white p-2 max-w-sm">
                    <img
                      src={currentPhotoURL}
                      alt="Uploaded qualification document"
                      className="w-full max-h-48 object-contain rounded"
                    />
                  </div>
                </div>
              )}

              {/* Photo upload error */}
              {photoError && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Photo upload success */}
              {photoSuccess && (
                <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Qualification photo uploaded successfully! Admin will review it during verification.</span>
                </div>
              )}

              {/* Upload area */}
              <div
                className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-slate-600 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {currentPhotoURL ? 'Replace qualification photo' : 'Upload qualification photo'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Click to browse — JPG, PNG, WEBP up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={photoUploading}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
