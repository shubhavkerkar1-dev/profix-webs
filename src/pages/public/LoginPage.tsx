import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wrench, AlertCircle } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials.')
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.')
      } else {
        setError(err.message || 'Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.')
      return
    }
    setError(null)
    try {
      await resetPassword(email)
      setResetSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sign in to ProFix</h2>
          <p className="text-sm text-slate-500">Access your service requests and professional tools</p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              Password reset link sent to your email address!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-blue-600 hover:underline font-medium"
              >
                Forgot your password?
              </button>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Register now
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
