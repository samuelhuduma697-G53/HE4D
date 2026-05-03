import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from '../../hooks/useForm'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { validators } from '../../utils/validators'

export const RegisterHelperForm = () => {
  const { registerHelper } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const { values, errors, handleChange, handleBlur, setFieldValue, validateAll, isSubmitting, setIsSubmitting } = useForm(
    {
      title: 'Mr.',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      nationalId: '',
      experienceType: 'Professional',
      yearsOfExperience: '',
      professionalType: '',
      specializations: [],
      county: 'Kilifi',
      subCounty: '',
      ward: ''
    },
    {
      name: (v) => v.length < 2 ? 'Name required' : '',
      email: (v) => !validators.isEmail(v) ? 'Valid email required' : '',
      phone: (v) => !validators.isKenyanPhone(v) ? 'Valid Kenyan phone required' : '',
      password: (v) => !validators.isStrongPassword(v) ? 'Password too weak' : '',
      confirmPassword: (v) => v !== values.password ? 'Passwords do not match' : '',
      nationalId: (v) => !validators.isKenyanNationalId(v) ? 'Valid 7-8 digit ID required' : '',
      yearsOfExperience: (v) => v && (v < 0 || v > 50) ? '0-50 years required' : ''
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      if (!validateAll()) return
      setIsSubmitting(true)
      try {
        await registerHelper(values)
        navigate('/login')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const toggleSpecialization = (spec) => {
    const current = values.specializations || []
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec]
    setFieldValue('specializations', updated)
  }

  const specializationsList = [
    'psychologist', 'counselor', 'social_worker', 'legal_professional',
    'medical_professional', 'peer_support', 'religious_counselor', 'crisis_specialist'
  ]

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-white mb-2">Register as Helper</h2>
      <p className="text-gray-400 mb-6">Step {step} of 3</p>

      {step === 1 && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-sm text-gray-300 mb-2">Title</label>
              <select name="title" value={values.title} onChange={handleChange} className="glass-input">
                <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                <option>Prof.</option><option>Pastor</option><option>Clergy</option><option>Counselor</option>
              </select>
            </div>
            <div className="col-span-3">
              <Input label="Full Name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} />
            </div>
          </div>
          <div className="mt-4"><Input label="Email" name="email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} /></div>
          <div className="mt-4"><Input label="Phone" name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} placeholder="+254..." /></div>
          <div className="mt-4"><Input label="Password" name="password" type="password" value={values.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} /></div>
          <div className="mt-4"><Input label="Confirm Password" name="confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} error={errors.confirmPassword} /></div>
        </>
      )}

      {step === 2 && (
        <>
          <Input label="National ID Number" name="nationalId" value={values.nationalId} onChange={handleChange} onBlur={handleBlur} error={errors.nationalId} placeholder="12345678" />
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">Experience Type</label>
            <select name="experienceType" value={values.experienceType} onChange={handleChange} className="glass-input">
              <option value="Professional">Professional (Qualified/Certified)</option>
              <option value="Peer Support (Lived Experience)">Peer Support (Lived Experience)</option>
            </select>
          </div>
          <div className="mt-4"><Input label="Years of Experience" name="yearsOfExperience" type="number" value={values.yearsOfExperience} onChange={handleChange} onBlur={handleBlur} error={errors.yearsOfExperience} /></div>
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">Professional Type</label>
            <select name="professionalType" value={values.professionalType} onChange={handleChange} className="glass-input">
              <option value="">Select...</option>
              {specializationsList.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Specializations</label>
            <div className="grid grid-cols-2 gap-2">
              {specializationsList.map(spec => (
                <label key={spec} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={values.specializations?.includes(spec)} onChange={() => toggleSpecialization(spec)} className="rounded" />
                  {spec.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4"><Input label="County" name="county" value={values.county} onChange={handleChange} /></div>
          <div className="mt-4"><Input label="Sub-County" name="subCounty" value={values.subCounty} onChange={handleChange} placeholder="e.g., Kilifi North" /></div>
          <div className="mt-4"><Input label="Ward" name="ward" value={values.ward} onChange={handleChange} placeholder="e.g., Sokoni" /></div>
          <p className="text-sm text-primary-gold mt-4">✓ Your account will be verified within 24-48 hours</p>
        </>
      )}

      <div className="flex gap-3 mt-6">
        {step > 1 && <Button variant="secondary" onClick={() => setStep(step - 1)} type="button">Back</Button>}
        <Button type="submit" fullWidth isLoading={isSubmitting}>{step === 3 ? 'Submit Registration' : 'Continue'}</Button>
      </div>

      <p className="text-center text-gray-400 mt-6">
        Already registered? <Link to="/login" className="text-primary-gold hover:underline">Sign In</Link>
      </p>
    </form>
  )
}
