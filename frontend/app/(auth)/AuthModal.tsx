"use client"
import { useEffect, useState } from 'react'
import { AuthAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

type Step = 'identify' | 'otp' | 'done'
type AuthMethod = 'email' | 'phone'

export default function AuthModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('identify')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const { login } = useAuth()

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('open-auth', onOpen as EventListener)
    return () => window.removeEventListener('open-auth', onOpen as EventListener)
  }, [])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const close = () => {
    setOpen(false)
    setStep('identify')
    setEmailOrPhone('')
    setCode('')
    setError(null)
    setCountdown(0)
    setCanResend(true)
  }

  const validateInput = (input: string, method: AuthMethod) => {
    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(input)
    } else {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
      return phoneRegex.test(input)
    }
  }

  const formatPhone = (phone: string) => {
    // Basic phone formatting
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const submitIdentify = async () => {
    if (!emailOrPhone.trim()) {
      setError('Please enter your email or phone number')
      return
    }

    if (!validateInput(emailOrPhone, authMethod)) {
      setError(`Please enter a valid ${authMethod}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = authMethod === 'email' 
        ? { email: emailOrPhone.trim() } 
        : { phone: emailOrPhone.trim() }
      
      await AuthAPI.requestOtp(payload)
      setStep('otp')
      setCountdown(60) // 1 minute cooldown
      setCanResend(false)
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (!canResend) return

    setLoading(true)
    setError(null)

    try {
      const payload = authMethod === 'email' 
        ? { email: emailOrPhone.trim() } 
        : { phone: emailOrPhone.trim() }
      
      await AuthAPI.requestOtp(payload)
      setCountdown(60)
      setCanResend(false)
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const submitOtp = async () => {
    if (!code.trim()) {
      setError('Please enter the OTP code')
      return
    }

    if (code.length !== 6) {
      setError('OTP code must be 6 digits')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = authMethod === 'email' 
        ? { email: emailOrPhone.trim(), code: code.trim() } 
        : { phone: emailOrPhone.trim(), code: code.trim() }
      
      const response = await AuthAPI.verifyOtp(payload)
      
      // Login user through context
      login(response.token, response.user)
      setStep('done')
      
      // Auto-close after success
      setTimeout(() => {
        close()
      }, 1500)
    } catch (e: any) {
      setError(e.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setEmailOrPhone(value)
    setError(null) // Clear error when user types
  }

  const handleCodeChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '')
    setCode(digitsOnly.slice(0, 6)) // Limit to 6 digits
    setError(null)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6">
        <button 
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700" 
          onClick={close}
        >
          ✕
        </button>

        {step === 'identify' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Login or Register</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email or phone to receive an OTP
            </p>

            {/* Method Toggle */}
            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                  authMethod === 'email' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                  authMethod === 'phone' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Phone
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  value={emailOrPhone}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={authMethod === 'email' 
                    ? 'you@example.com' 
                    : '+1 (555) 123-4567'
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type={authMethod === 'email' ? 'email' : 'tel'}
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button 
                disabled={!emailOrPhone.trim() || loading} 
                onClick={submitIdentify} 
                className="w-full bg-blue-600 text-white rounded-md px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 transition"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
            <p className="text-sm text-gray-600 mb-4">
              We sent a 6-digit code to{' '}
              <span className="font-medium">
                {authMethod === 'email' ? emailOrPhone : formatPhone(emailOrPhone)}
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="000000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => setStep('identify')} 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button 
                  disabled={!code || code.length !== 6 || loading} 
                  onClick={submitOtp} 
                  className="flex-1 bg-blue-600 text-white rounded-md px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  onClick={resendOtp}
                  disabled={!canResend || loading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResend 
                    ? 'Resend OTP' 
                    : `Resend in ${countdown}s`
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  )
}


