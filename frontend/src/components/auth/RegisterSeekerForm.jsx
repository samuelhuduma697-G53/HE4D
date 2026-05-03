import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from '../../hooks/useForm'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { validators } from '../../utils/validators'

export const RegisterSeekerForm = () => {
  const { registerSeeker } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const { values, errors, handleChange, handleBlur, validateAll, isSubmitting, setIsSubmitting } = useForm(
    {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      county: 'Kilifi',
      subCounty: '',
      ward: ''
    },
    {
      name: (v) => v.length < 2 ? 'Name must be at least 2 characters' : '',
      email: (v) => !validators.isEmail(v) ? 'Valid email required' : '',
      phone: (v) => !validators.isKenyanPhone(v) ? 'Use format: +254XXXXXXXXX' : '',
      password: (v) => !validators.isStrongPassword(v) 
        ? 'Password must be 8+ chars with uppercase, number, special char' : '',
      confirmPassword: (v) => v !== values.password ? 'Passwords do not match' : ''
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1) {
      if (values.name && values.email && values.phone && !errors.name && !errors.email && !errors.phone) {
        setStep(2)
      } else {
        validateAll()
      }
    } else {
      if (!validateAll()) return
      setIsSubmitting(true)
      try {
        await registerSeeker(values)
        navigate('/dashboard/seeker')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-white mb-6">
        {step === 1 ? 'Create Account' : 'Set Password'}
      </h2>

      {step === 1 ? (
        <>
          <Input
            label="Full Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            placeholder="John Doe"
          />
          <div className="mt-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              placeholder="john@example.com"
            />
          </div>
          <div className="mt-4">
            <Input
              label="Phone Number"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              placeholder="+254700000000"
            />
          </div>
        </>
      ) : (
        <>
          <Input
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            placeholder="••••••••"
          />
          <div className="mt-4">
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">County</label>
            <select
              name="county"
              value={values.county}
              onChange={handleChange}
              className="glass-input"
            >
              <option value="Kilifi">Kilifi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Kwale">Kwale</option>
            </select>
          </div>
        </>
      )}

      <div className="flex gap-3 mt-6">
        {step === 2 && (
          <Button variant="secondary" onClick={() => setStep(1)} type="button">
            Back
          </Button>
        )}
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          {step === 1 ? 'Continue' : 'Create Account'}
        </Button>
      </div>

      <p className="text-center text-gray-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-gold hover:underline">
          Sign In
        </Link>
      </p>
      <p className="text-center mt-4">
        <Link to="/register/helper" className="text-sm text-gray-400 hover:text-white">
          Register as a Helper instead →
        </Link>
      </p>
    </form>
  )
}
