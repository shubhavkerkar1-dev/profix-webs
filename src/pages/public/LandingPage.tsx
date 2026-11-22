import React from 'react'
import { Link } from 'react-router-dom'
import { Wrench, Zap, ShieldCheck, Clock, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 to-white py-20 lg:py-28 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Verified Local Service Marketplace
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Expert Plumbers & Electricians, <span className="text-blue-600">On Demand.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Connect directly with background-checked local professionals in your neighborhood. Discover verified ratings, upfront starting prices, and track your repairs with zero middlemen fees.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/customer/find">
                  <Button size="lg" className="shadow-md shadow-blue-500/20 gap-2">
                    Find Professionals Nearby <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg">
                    Join as a Professional
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200/60 text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Admin Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Direct One-on-One</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Zero Commission</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Popular Services</h3>
                  <span className="text-xs text-blue-600 font-semibold">Ready in minutes</span>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/customer/find?category=plumbing"
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">Plumbing & Pipes</div>
                      <div className="text-xs text-slate-500 mt-0.5">Leaking taps, burst pipes, drain unclogging & bathroom installs.</div>
                    </div>
                  </Link>

                  <Link
                    to="/customer/find?category=electrical"
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50/50 hover:border-amber-200 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-amber-600">Electrical & Wiring</div>
                      <div className="text-xs text-slate-500 mt-0.5">Short circuits, switchboard fixes, fixture mounting & wiring.</div>
                    </div>
                  </Link>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 flex items-center gap-3 text-left">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-slate-600">
                    Live updates on incoming service requests with instant status notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900">How ProFix Works</h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A transparent, reliable way to hire specialized tradespeople without hidden platform fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Card className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Find & Compare</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Browse nearby plumbers or electricians using our interactive OpenStreetMap view. Filter by verification badge, customer ratings, and distance.
              </p>
            </Card>

            <Card className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Request One Professional</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit your specific job details directly to your chosen specialist. Avoid spamming multiple providers and communicate directly.
              </p>
            </Card>

            <Card className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Track & Confirm</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Monitor status from Accepted to In-Progress. Once the work is done, you confirm completion and leave a verified review.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
