import { Helmet } from 'react-helmet-async'
import { DonationCard } from '../components/donation/DonationCard'

export const DonatePage = () => {
  return (
    <>
      <Helmet>
        <title>Donate | Huduma Ecosystem</title>
      </Helmet>
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Support Our Mission</h1>
          <p className="text-gray-400 mt-2">Your donation helps us provide free crisis support to vulnerable communities in Kilifi.</p>
        </div>
        <div className="glass-card p-6">
          <DonationCard />
        </div>
      </div>
    </>
  )
}

export default DonatePage
