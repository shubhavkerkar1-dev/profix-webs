import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getCustomerRequests } from '@/services/firestore/api'
import { ServiceRequest, RequestStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Clock, Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case 'OPEN':
      return <Badge variant="info">Request Sent (Open)</Badge>
    case 'ACCEPTED':
      return <Badge variant="warning">Accepted by Pro</Badge>
    case 'IN_PROGRESS':
      return <Badge variant="warning">Work In Progress</Badge>
    case 'COMPLETION_PENDING_CONFIRMATION':
      return <Badge variant="warning">Awaiting Your Confirmation</Badge>
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>
    case 'REVIEWED':
      return <Badge variant="success">Completed & Reviewed</Badge>
    case 'CANCELLED':
      return <Badge variant="neutral">Cancelled</Badge>
    case 'REJECTED':
      return <Badge variant="danger">Declined</Badge>
    default:
      return <Badge variant="neutral">{status}</Badge>
  }
}

export const CustomerRequestsPage: React.FC = () => {
  const { user } = useAuth()

  // Polling requirement: Customer request list every 15 seconds, stops in background tabs
  const { data: requests = [], isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ['customerRequests', user?.uid],
    queryFn: () => getCustomerRequests(user!.uid),
    enabled: !!user,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900">My Service Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track real-time progress on your booked plumbers and electricians.
          </p>
        </div>
        <Link to="/customer/find">
          <Button size="sm">Find New Specialist</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-500">Loading your requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-800">You haven't sent any service requests yet.</p>
          <p className="text-xs text-slate-500">Find a nearby electrician or plumber to get started.</p>
          <div className="pt-2">
            <Link to="/customer/find">
              <Button size="sm">Browse Available Pros</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 transition-all hover:border-blue-300 text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Request #{req.id.slice(0, 8)}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{req.description}</h3>
                </div>

                <Link to={`/customer/requests/${req.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <span>View Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Scheduled: {new Date(req.preferredDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Sent: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
