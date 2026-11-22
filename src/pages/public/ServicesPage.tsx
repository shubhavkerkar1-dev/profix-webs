import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveCategories } from '@/services/firestore/api'
import { ServiceCategory } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Wrench, Zap, ArrowRight, ShieldCheck } from 'lucide-react'

export const ServicesPage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveCategories().then((res) => {
      setCategories(res)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Specialized Home Trade Services
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Browse all categories of licensed plumbers and certified electricians available in your neighborhood.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{cat.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{cat.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Specialists</span>
                </div>
                <Link to={`/customer/find?category=${cat.id}`}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <span>Find Pros</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
