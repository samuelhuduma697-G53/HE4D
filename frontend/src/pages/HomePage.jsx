import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'
import { useEffect, useState } from 'react'
import { DonationCard } from '../components/donation/DonationCard'

export const HomePage = () => {
  const [stats, setStats] = useState({ 
    totalHelped: 1250, 
    activeHelpers: 45, 
    successRate: '94%' 
  })
  const [stories, setStories] = useState([
    { id: 1, rating: 5, content: 'Huduma saved my life when I had nowhere to turn.', author: 'Mary W.' },
    { id: 2, rating: 5, content: 'The helpers arrived within minutes. I am forever grateful.', author: 'John K.' },
    { id: 3, rating: 4, content: 'Professional and caring support during my crisis.', author: 'Amina S.' }
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/public/stats').then(r => r.json()).catch(() => null)
        const storiesRes = await fetch('/api/public/success-stories').then(r => r.json()).catch(() => null)
        
        if (statsRes?.success) setStats(statsRes)
        if (storiesRes?.stories?.length) setStories(storiesRes.stories)
      } catch (error) {
        console.error('Failed to fetch public data:', error)
      }
    }
    fetchData()
  }, [])

  const crisisCategories = [
    { icon: '🧠', name: 'Mental Health', color: 'bg-blue-500/20' },
    { icon: '🏠', name: 'Domestic Violence', color: 'bg-red-500/20' },
    { icon: '⚖️', name: 'Legal Aid', color: 'bg-purple-500/20' },
    { icon: '🏥', name: 'Medical', color: 'bg-green-500/20' },
    { icon: '💰', name: 'Financial', color: 'bg-yellow-500/20' },
    { icon: '🏚️', name: 'Housing', color: 'bg-orange-500/20' }
  ]

  return (
    <div className="min-h-screen bg-dark-base">
      <Navbar />
      
      {/* Emergency Banner */}
      <div className="bg-accent-emergency/20 border-b border-accent-emergency/30 py-3 px-4 text-center">
        <p className="text-white">
          <span className="font-bold text-accent-emergency">⚠️ IN CRISIS?</span>
          {' '}Call <span className="font-bold">119</span> or <span className="font-bold">999</span> immediately.
          Press the panic button in the app for instant help.
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-red/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary-gold font-semibold mb-4 block">
                🇰🇪 Kilifi County
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Crisis Support When You
                <span className="text-primary-gold"> Need It Most</span>
              </h1>
              <p className="text-gray-300 text-lg mt-6">
                AI-powered triage connecting you with verified helpers in real-time.
                Mental health, legal aid, shelter, and more — all in one place.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/register">
                  <Button size="lg">Get Help Now</Button>
                </Link>
                <Link to="/register/helper">
                  <Button variant="gold" size="lg">Become a Helper</Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="lg">Try First (Guest)</Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-gold">{stats.totalHelped}+</p>
                  <p className="text-gray-400 text-sm">People Helped</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-gold">{stats.activeHelpers}</p>
                  <p className="text-gray-400 text-sm">Active Helpers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-gold">{stats.successRate}</p>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">Crisis Categories</h3>
              <div className="grid grid-cols-2 gap-4">
                {crisisCategories.map((cat) => (
                  <div key={cat.name} className={`${cat.color} p-4 rounded-xl border border-white/10`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <p className="text-white font-medium mt-2">{cat.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-dark-elevated/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How <span className="text-primary-gold">Huduma</span> Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Report Crisis', desc: 'Describe your situation in English, Swahili, or Sheng' },
              { step: 2, title: 'AI Triage', desc: 'Our AI analyzes urgency and categorizes your needs' },
              { step: 3, title: 'Helper Matched', desc: 'Verified helper nearby accepts your case' },
              { step: 4, title: 'Get Support', desc: 'Real-time chat and tracking until resolved' }
            ].map((item) => (
              <Card key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-gold font-bold text-xl">{item.step}</span>
                </div>
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* M-PESA Donation Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Support Our <span className="text-primary-gold">Mission</span>
                </h2>
                <p className="text-gray-300 mb-6">
                  Your donation helps us provide free crisis support to vulnerable communities
                  in Kilifi and the Coast region.
                </p>
                <DonationCard />
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-6 bg-dark-elevated/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Success <span className="text-primary-gold">Stories</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stories.slice(0, 3).map((story, i) => (
              <Card key={i}>
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className={j < (story.rating || 5) ? 'text-primary-gold' : 'text-gray-600'}>★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{story.content?.substring(0, 120)}..."</p>
                <p className="text-white font-medium">— {story.author}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/success-stories">
              <Button variant="ghost">Read More Stories →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto glass-card p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-gray-300 mb-8">
            Join our network of verified helpers and support your community.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register/helper">
              <Button variant="gold" size="lg">Register as Helper</Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage
