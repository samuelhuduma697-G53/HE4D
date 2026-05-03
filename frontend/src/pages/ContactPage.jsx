import { Helmet } from 'react-helmet-async'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useForm } from '../hooks/useForm'
import toast from 'react-hot-toast'

export const ContactPage = () => {
  const { values, handleChange } = useForm({
    name: '', email: '', subject: '', message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Message sent! We will respond within 24 hours.')
  }

  return (
    <>
      <Helmet>
        <title>Contact | Huduma Ecosystem</title>
      </Helmet>
      
      <div className="min-h-screen bg-dark-base">
        <Navbar />
        
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white text-center mb-4">
              Contact <span className="text-primary-gold">Us</span>
            </h1>
            <p className="text-gray-400 text-center mb-12">
              Have questions? We're here to help.
            </p>

            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Name" name="name" value={values.name} onChange={handleChange} required />
                <Input label="Email" name="email" type="email" value={values.email} onChange={handleChange} required />
                <Input label="Subject" name="subject" value={values.subject} onChange={handleChange} required />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea name="message" value={values.message} onChange={handleChange} rows={5} className="glass-input" required />
                </div>
                <Button type="submit" fullWidth>Send Message</Button>
              </form>
            </Card>

            <div className="mt-8 p-6 glass-card border-accent-emergency/30 bg-accent-emergency/5">
              <p className="text-center text-gray-300">
                <span className="text-accent-emergency font-bold">🚨 Emergency?</span>
                <br />
                Do not use this form. Call <span className="font-bold">119</span> or <span className="font-bold">999</span> immediately.
              </p>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  )
}

export default ContactPage
