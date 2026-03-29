import { Link } from 'react-router-dom'
import { useAuth, SignInButton } from '@clerk/clerk-react'

const features = [
  {
    title: 'Money Health Score',
    desc: 'Get your financial wellness score across 6 dimensions',
    path: '/health-score',
    image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'FIRE Path Planner',
    desc: 'Plan your Financial Independence and Early Retirement',
    path: '/fire',
    image: 'https://images.pexels.com/photos/7691731/pexels-photo-7691731.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Tax Wizard',
    desc: 'Find missing deductions and compare old vs new tax regime',
    path: '/tax',
    image: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'Life Event Advisor',
    desc: 'Get advice for bonus, marriage, baby, inheritance and more',
    path: '/life-event',
    image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: "Couple's Money Planner",
    desc: 'Optimize your joint finances, HRA, SIP splits and insurance',
    path: '/couple',
    image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    title: 'MF Portfolio X-Ray',
    desc: 'Upload CAMS statement and get complete portfolio analysis',
    path: '/mf-xray',
    image: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="relative w-full h-125 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/30 flex flex-col justify-center px-8 md:px-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-2xl leading-tight">
            Your AI-Powered Financial Mentor
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-4 max-w-xl">
            95% of Indians don't have a financial plan. Let's fix that — in minutes.
          </p>
          <p className="text-white/60 text-base mb-8 max-w-lg">
            Free. Personalized. Powered by AI.
          </p>

          {isSignedIn ? (
            <Link
              to="/home"
              className="w-fit bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-lg"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="w-fit bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-lg">
                Get Started Free →
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      <div className="bg-blue-700 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-bold">95%</p>
            <p className="text-blue-200 text-sm">Indians lack a financial plan</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold">₹25,000+</p>
            <p className="text-blue-200 text-sm">Cost of a human advisor per year</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold">6 Tools</p>
            <p className="text-blue-200 text-sm">All free. All AI-powered.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Everything You Need</h2>
          <p className="text-gray-500 text-lg">Six powerful tools to take control of your finances</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            isSignedIn ? (
              <Link
                to={f.path}
                key={f.title}
                className="group bg-white rounded-2xl shadow overflow-hidden hover:shadow-xl transition border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold text-lg">{f.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                  <p className="text-blue-600 text-sm font-medium mt-3">Get Started →</p>
                </div>
              </Link>
            ) : (
              <div
                key={f.title}
                className="group bg-white rounded-2xl shadow overflow-hidden border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold text-lg">{f.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                  <SignInButton mode="modal">
                    <button className="text-blue-600 text-sm font-medium mt-3 hover:underline">
                      Sign in to access →
                    </button>
                  </SignInButton>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
  <img
    src="https://images.pexels.com/photos/6801873/pexels-photo-6801873.jpeg?auto=compress&cs=tinysrgb&w=1600"
    alt="footer"
    className="w-full h-64 object-cover"
  />
  <div className="absolute inset-0 bg-black/70 flex items-center justify-center px-4">
    <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
      
      <div>
        <h3 className="text-white font-bold text-xl mb-2">💰 AI Money Mentor</h3>
        <p className="text-white/60 text-sm">
          Making financial planning accessible to every Indian. Free. Personalized. AI-powered.
        </p>
      </div>


    
      <div>
        <h3 className="text-white font-semibold mb-3">Contact Us</h3>
        <ul className="space-y-2 text-white/60 text-sm">
          <li className="flex items-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-white/60" viewBox="0 0 24 24">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
  <span>support@aimoneymentor.in</span>
</li>
          <li className="flex items-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-white/60" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
  <span>linkedin.com/in/aimoneymentor</span>
</li>
          <li>💼 Built for ET AI Hackathon 2026</li>
          
        </ul>
      </div>

    </div>
  </div>
</div>

    </div>
  )
}