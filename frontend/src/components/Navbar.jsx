import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, UserButton, SignInButton } from '@clerk/clerk-react'

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/home', label: 'Home' },
    { to: '/health-score', label: 'Health Score' },
    { to: '/fire', label: 'FIRE Planner' },
    { to: '/tax', label: 'Tax Wizard' },
    { to: '/life-event', label: 'Life Events' },
    { to: '/couple', label: 'Couple Planner' },
    { to: '/mf-xray', label: 'MF X-Ray' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-700 shrink-0">
          💰 AI Money Mentor
        </Link>

        {isSignedIn ? (
          <>
            {/* Desktop Nav */}
            <div className="hidden lg:flex gap-1 items-center">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap
                    ${pathname === link.to
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="ml-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>

            
            <div className="flex lg:hidden items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                {menuOpen ? (
                  
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </>
        ) : (
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>

      {isSignedIn && menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition
                ${pathname === link.to
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}