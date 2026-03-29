import { useState,useEffect } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../api/axios'
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react'
import { saveUserData, loadUserData } from '../utils/userProfile'
import PageHero from '../components/PageHero'

const initialForm = {
  age: '',
  monthly_income: '',
  monthly_expenses: '',
  emergency_fund_months: '',
  has_health_insurance: '',
  has_life_insurance: '',
  monthly_investment: '',
  investment_types: '',
  total_debt_emi: '',
  tax_saving_investments: '',
  has_retirement_plan: '',
}

const fields = [
  { key: 'age', label: 'Your Age', placeholder: '28', type: 'number' },
  { key: 'monthly_income', label: 'Monthly Income (₹)', placeholder: '80000', type: 'number' },
  { key: 'monthly_expenses', label: 'Monthly Expenses (₹)', placeholder: '45000', type: 'number' },
  { key: 'emergency_fund_months', label: 'Emergency Fund (months of expenses saved)', placeholder: '3', type: 'number' },
  { key: 'has_health_insurance', label: 'Do you have Health Insurance?', placeholder: 'Yes / No', type: 'text' },
  { key: 'has_life_insurance', label: 'Do you have Life Insurance?', placeholder: 'Yes / No', type: 'text' },
  { key: 'monthly_investment', label: 'Monthly Investment Amount (₹)', placeholder: '10000', type: 'number' },
  { key: 'investment_types', label: 'Investment Types', placeholder: 'Mutual Funds, FD, Stocks', type: 'text' },
  { key: 'total_debt_emi', label: 'Total Monthly EMIs (₹)', placeholder: '5000', type: 'number' },
  { key: 'tax_saving_investments', label: 'Annual Tax Saving Investments (₹)', placeholder: '50000', type: 'number' },
  { key: 'has_retirement_plan', label: 'Do you have a Retirement Plan?', placeholder: 'Yes / No / NPS / EPF', type: 'text' },
]

const dimensionColors = {
  'Emergency Preparedness': '#ef4444',
  'Insurance Coverage': '#f97316',
  'Investment Diversification': '#3b82f6',
  'Debt Health': '#8b5cf6',
  'Tax Efficiency': '#10b981',
  'Retirement Readiness': '#f59e0b',
}

export default function HealthScore() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()
  useEffect(() => {
  if (user) {
    loadUserData(user.id, 'health_score_form').then((saved) => {
      if (saved) setForm(saved)
    })
  }
}, [user])


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      await saveUserData(user.id, 'health_score_form', form)
      const res = await api.post('/api/health-score', form)
      setResult(res.data)
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const radarData = result?.dimensions?.map(d => ({
    dimension: d.name,
    score: d.score,
  })) || []

  const overallColor = result?.overall_score >= 75 ? 'text-green-600'
    : result?.overall_score >= 50 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10"> 
    <PageHero
      title="🏥 Money Health Score"
      subtitle="Answer 11 quick questions to get your financial wellness score across 6 dimensions."
      image="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200"
    />
    <div className="max-w-4xl mx-auto px-4 py-10">
      {!result ? (
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  name={f.key}
                  value={form[f.key]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing your finances...' : 'Get My Health Score →'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 text-center">
            <p className="text-gray-500 mb-2">Your Overall Money Health Score</p>
            <p className={`text-7xl font-bold ${overallColor}`}>{result.overall_score}</p>
            <p className="text-gray-400 text-sm mt-1">out of 100</p>
            <p className="text-gray-600 mt-4 max-w-xl mx-auto">{result.summary}</p>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Score Breakdown</h2>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Dimension Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.dimensions.map((d) => (
              <div key={d.name} className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">{d.name}</h3>
                  <span className="text-2xl font-bold" style={{ color: dimensionColors[d.name] }}>
                    {d.score}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${d.score}%`, backgroundColor: dimensionColors[d.name] }}
                  />
                </div>
                <p className="text-sm text-gray-500">{d.feedback}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Recommendations</h2>
            <ul className="space-y-3">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="text-blue-500 font-bold">{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full border border-gray-200 text-gray-500 py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Retake Assessment
          </button>
        </div>
      )}
      </div>
    </div>
  )
}