import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  getProfessionalServices,
  addProfessionalService,
  deleteProfessionalService,
  getActiveCategories,
} from '@/services/firestore/api'
import { ProfessionalService, ServiceCategory } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Trash2, Tag, DollarSign, AlertCircle } from 'lucide-react'

export const ManageServicesPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [startingPrice, setStartingPrice] = useState(50)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getActiveCategories().then(setCategories).catch(console.error)
  }, [])

  const { data: services = [], isLoading } = useQuery<ProfessionalService[]>({
    queryKey: ['professionalServices', user?.uid],
    queryFn: () => getProfessionalServices(user!.uid),
    enabled: !!user,
  })

  const activeServices = services.filter((s) => s.isActive)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)

    try {
      await addProfessionalService(
        user.uid,
        categoryId || categories[0]?.id || 'plumbing',
        description,
        Number(startingPrice)
      )
      queryClient.invalidateQueries({ queryKey: ['professionalServices', user.uid] })
      setIsModalOpen(false)
      setDescription('')
    } catch (err: any) {
      setError(err.message || 'Failed to add service')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Remove this service from your offerings?')) return
    await deleteProfessionalService(serviceId)
    queryClient.invalidateQueries({ queryKey: ['professionalServices', user?.uid] })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offered Services & Pricing</h1>
          <p className="text-sm text-slate-500 mt-1">
            Specify the jobs you specialize in and your standard starting rates.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : activeServices.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-800">You haven't listed any services yet.</p>
          <p className="text-xs text-slate-500">
            Clients look at your specific services and starting rates before sending requests.
          </p>
          <div className="pt-2">
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              Create Your First Service
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeServices.map((svc) => (
            <Card key={svc.id} className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {categories.find((c) => c.id === svc.categoryId)?.name || 'Service'}
                </span>
                <h4 className="text-base font-bold text-slate-900">{svc.description}</h4>
                <div className="flex items-center gap-1 text-slate-700 font-extrabold text-sm pt-1">
                  <span>Starting at ${svc.startingPrice}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(svc.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Remove service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Offered Service">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Service Title / Description"
            required
            placeholder="E.g., Complete Drain Cleaning or Circuit Breaker Diagnostic"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Starting Price ($ USD)"
            type="number"
            min={1}
            required
            value={startingPrice}
            onChange={(e) => setStartingPrice(Number(e.target.value))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Add Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
