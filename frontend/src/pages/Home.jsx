import { Link } from 'react-router-dom'

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

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Your AI-Powered Financial Mentor
        </h1>
        <p className="text-gray-500 text-lg">
          95% of Indians don't have a financial plan. Let's fix that.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <Link
            to={f.path}
            key={f.title}
            className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition border border-gray-100 group"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={f.image}
                alt={f.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{f.title}</h2>
              <p className="text-gray-500 text-sm">{f.desc}</p>
              <p className="text-blue-600 text-sm font-medium mt-3">Get Started →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}