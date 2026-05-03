import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Huduma Ecosystem</title>
      </Helmet>
      
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-8xl font-bold text-primary-gold mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default NotFoundPage
