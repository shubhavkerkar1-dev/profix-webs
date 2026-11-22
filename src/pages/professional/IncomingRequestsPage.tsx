import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  getProfessionalRequests,
  updateRequestStatus,
} from '@/services/firestore/api'
import { ServiceRequest, RequestStatus } from '@/types'
import { getStatusBadge } from '@/pages/customer/CustomerRequestsPage'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, Clock, Check, X, ArrowRight, AlertCircle, Play, CheckCircle2 } from 'lucide-react'

export const IncomingRequestsPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Polling requirement: Professional incoming requests every 15 seconds, pause in background tabs
  const { data: requests = [], isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ['professionalRequests', user?.uid],
    queryFn: () => getProfessionalRequests(user!.uid),
    enabled: !!user,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  })

  const handleStatusChange = async (
    requestId: string,
    newStatus: RequestStatus,
    note?: string
  ) => {
    if (!user) return
    setActionError(null)
    setUpdatingId(requestId)

    try {
      await updateRequestStatus(requestId, newStatus, user.uid, note)
      queryClient.invalidateQueries({ queryKey: ['professionalRequests', user.uid] })
    } catch (err: any) {
      setActionError(err.message || 'Failed to update request')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Incoming Service Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, accept, and manage the requests assigned exclusively to you.
        </p>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-800">No incoming service requests right now.</p>
          <p className="text-xs text-slate-500">
            Make sure your profile availability is set to "AVAILABLE" and your services are listed.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 transition-all hover:border-blue-300">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Order #{req.id.slice(0, 8)}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{req.description}</h3>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {req.status === 'OPEN' && (
                    <>
                      <Button
                        size="sm"
                        isLoading={updatingId === req.id}
                        onClick={() => handleStatusChange(req.id, 'ACCEPTED', 'Professional accepted request')}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={updatingId === req.id}
                        onClick={() => handleStatusChange(req.id, 'REJECTED', 'Professional declined request')}
                        className="gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </Button>
                    </>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      isLoading={updatingId === req.id}
                      onClick={() => handleStatusChange(req.id, 'IN_PROGRESS', 'Work started on-site')}
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Work
                    </Button>
                  )}

                  {req.status === 'IN_PROGRESS' && (
                    <Button
                      size="sm"
                      isLoading={updatingId === req.id}
                      onClick={() =>
                        handleStatusChange(
                          req.id,
                          'COMPLETION_PENDING_CONFIRMATION',
                          'Professional marked work as completed'
                        )
                      }
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                    </Button>
                  )}

                  <Link to={`/customer/requests/${req.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Scheduled: {new Date(req.preferredDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Received: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
