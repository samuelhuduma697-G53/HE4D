import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-dark-elevated border-t border-white/5 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo + Description */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-3">
              <img src="/logo.png" alt="Huduma Ecosystem" className="h-14 w-auto rounded-full" />
              <span className="text-xl font-bold text-primary-gold">Huduma Ecosystem</span>
            </Link>
            <p className="text-gray-400 text-sm mt-3">
              AI-powered crisis support connecting seekers with verified helpers in real-time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/about" className="block text-gray-400 hover:text-white">About Us</Link>
              <Link to="/success-stories" className="block text-gray-400 hover:text-white">Success Stories</Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white">Contact</Link>
              <Link to="/donate" className="block text-gray-400 hover:text-white">Donate</Link>
            </div>
          </div>

          {/* Emergency & Region */}
          <div>
            <h4 className="text-white font-semibold mb-3">Emergency</h4>
            <div className="space-y-1 text-sm text-gray-400">
              <p>📞 Police: <span className="text-white">119</span></p>
              <p>🚑 Ambulance: <span className="text-white">999</span></p>
            </div>
            <h4 className="text-white font-semibold mt-4 mb-2">Our Region</h4>
            <p className="text-gray-400 text-sm">Serving Kilifi County and the greater Coast region of Kenya.</p>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Huduma Ecosystem. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
