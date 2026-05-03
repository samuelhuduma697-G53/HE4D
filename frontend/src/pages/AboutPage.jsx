import { Helmet } from 'react-helmet-async'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Card } from '../components/common/Card'

export const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About | Huduma Ecosystem</title>
      </Helmet>
      
      <div className="min-h-screen bg-dark-base">
        <Navbar />
        
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white text-center mb-4">
              About <span className="text-primary-gold">Huduma Ecosystem</span>
            </h1>
            <p className="text-gray-400 text-center mb-12">
              AI-powered crisis support for the Coast region of Kenya
            </p>

            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                The Huduma Ecosystem is a digital triage platform designed to bridge the gap between 
                individuals in crisis and verified support resources. We use AI to analyze crisis severity 
                and match seekers with the most appropriate helpers in real-time.
              </p>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Region</h2>
              <p className="text-gray-300 leading-relaxed">
                We serve Kilifi County and the greater Coast region, 
                including Mombasa, Kwale, Lamu, Tana River, and Taita Taveta counties. 
                Our network of verified helpers is strategically positioned to respond quickly 
                across both urban and rural areas.
              </p>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="glass-card p-4">
                  <div className="text-3xl mb-2">📝</div>
                  <h3 className="text-white font-semibold mb-1">Report Crisis</h3>
                  <p className="text-gray-400 text-sm">Describe your situation via text or voice</p>
                </div>
                <div className="glass-card p-4">
                  <div className="text-3xl mb-2">🤖</div>
                  <h3 className="text-white font-semibold mb-1">AI Triage</h3>
                  <p className="text-gray-400 text-sm">Our AI analyzes severity and urgency</p>
                </div>
                <div className="glass-card p-4">
                  <div className="text-3xl mb-2">🤝</div>
                  <h3 className="text-white font-semibold mb-1">Get Help</h3>
                  <p className="text-gray-400 text-sm">Matched with the nearest verified helper</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-bold text-white mb-4">Our Team</h2>
              <p className="text-gray-300 leading-relaxed">
                Huduma Ecosystem is built and maintained by a dedicated team of developers, 
                crisis support professionals, and community volunteers committed to making 
                crisis support accessible to everyone in the Coast region.
              </p>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  )
}

export default AboutPage
