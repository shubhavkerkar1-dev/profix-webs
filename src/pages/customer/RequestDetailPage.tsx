import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  getServiceRequestById,
  getRequestHistory,
  updateRequestStatus,
  submitReview,
} from '@/services/firestore/api'
import { getStatusBadge } from './CustomerRequestsPage'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Star, CheckCircle, XCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react'

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Polling requirement: Request details every 10 seconds, pause when tab hidden
  const { data: request, isLoading } = useQuery({
    queryKey: ['requestDetail', id],
    queryFn: () => getServiceRequestById(id!),
    enabled: !!id,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  })

  const { data: history = [] } = useQuery({
    queryKey: ['requestHistory', id],
    queryFn: () => getRequestHistory(id!),
    enabled: !!id,
  })

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Request Not Found</h2>
      </div>
    )
  }

  const isCustomer = user?.uid === request.customerId

  // Cancel Request
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this service request?')) return
    setActionError(null)
    try {
      await updateRequestStatus(request.id, 'CANCELLED', user!.uid, 'Cancelled by customer')
      queryClient.invalidateQueries({ queryKey: ['requestDetail', id] })
      queryClient.invalidateQueries({ queryKey: ['requestHistory', id] })
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel request')
    }
  }

  // Confirm Completion
  const handleConfirmCompletion = async () => {
    setActionError(null)
    try {
      await updateRequestStatus(
        request.id,
        'COMPLETED',
        user!.uid,
        'Customer confirmed service completion'
      )
      queryClient.invalidateQueries({ queryKey: ['requestDetail', id] })
      queryClient.invalidateQueries({ queryKey: ['requestHistory', id] })
      setIsReviewOpen(true)
    } catch (err: any) {
      setActionError(err.message || 'Failed to confirm completion')
    }
  }

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)
    setSubmittingReview(true)
    try {
      await submitReview(request.id, request.customerId, request.professionalId, rating, comment)
      setIsReviewOpen(false)
      queryClient.invalidateQueries({ queryKey: ['requestDetail', id] })
      queryClient.invalidateQueries({ queryKey: ['requestHistory', id] })
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Status Header Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Service Order #{request.id.slice(0, 8)}
              </span>
              {getStatusBadge(request.status)}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">{request.description}</h1>
          </div>

          {/* Action Buttons based on status */}
          <div className="flex items-center gap-3">
            {isCustomer && (request.status === 'OPEN' || request.status === 'ACCEPTED') && (
              <Button variant="danger" size="sm" onClick={handleCancel}>
                Cancel Request
              </Button>
            )}

            {isCustomer && request.status === 'COMPLETION_PENDING_CONFIRMATION' && (
              <Button size="sm" onClick={handleConfirmCompletion} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="w-4 h-4" /> Confirm & Complete
              </Button>
            )}

            {isCustomer && request.status === 'COMPLETED' && (
              <Button size="sm" onClick={() => setIsReviewOpen(true)} className="gap-1.5">
                <Star className="w-4 h-4 fill-current text-amber-300" />
                Leave Review
              </Button>
            )}
          </div>
        </div>

        {/* Schedule & Time details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Preferred Service Window</span>
            <p className="font-semibold text-slate-800 text-sm">
              {new Date(request.preferredDate).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Request Placed At</span>
            <p className="font-semibold text-slate-800 text-sm">
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Request Status History Timeline */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Status History Audit Trail</h3>
        <div className="border-l-2 border-slate-200 ml-3 space-y-6 pt-2">
          {history.map((item: any, idx: number) => (
            <div key={item.id || idx} className="relative pl-6">
              <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{item.newStatus}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString()} • {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {item.note && <p className="text-xs text-slate-600">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Review Submission Modal */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Rate Your Service">
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Comment
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about the professional's punctuality, work quality, and conduct..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submittingReview}>
              Submit Verified Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
