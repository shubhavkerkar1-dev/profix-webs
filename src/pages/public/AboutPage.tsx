import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Sparkles, Wrench, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About ProFix
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Connecting homeowners with top-rated local plumbers and electricians through honest, direct communication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Why ProFix was built</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Finding dependable emergency repair services shouldn't mean sifting through spam directories or paying massive markups to middleman corporations.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            ProFix enables direct, one-on-one booking between verified tradespeople and customers with zero hidden dispatch fees.
          </p>
        </div>

        <Card className="p-8 space-y-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero Middlemen, Full Trust</h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Manual administrator verification for every specialist</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Strict completion confirmation workflow before reviews</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>OpenStreetMap powered location discovery without tracking</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
