import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react'
import { saveUserData, loadUserData } from '../utils/userProfile'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/axios'
import PageHero from '../components/PageHero'

const initialForm = {
  age: '',
  retirement_age: '',
  monthly_income: '',
  monthly_expenses: '',
  existing_investments: '',
  risk_profile: 'moderate',
  goals: '',
}

const fields = [
  { key: 'age', label: 'Current Age', placeholder: '28', type: 'number' },
  { key: 'retirement_age', label: 'Target Retirement Age', placeholder: '45', type: 'number' },
  { key: 'monthly_income', label: 'Monthly Income (₹)', placeholder: '80000', type: 'number' },
  { key: 'monthly_expenses', label: 'Monthly Expenses (₹)', placeholder: '45000', type: 'number' },
  { key: 'existing_investments', label: 'Existing Investments (₹)', placeholder: '500000', type: 'number' },
  { key: 'goals', label: 'Life Goals', placeholder: 'Buy house, child education, travel', type: 'text' },
]

const riskOptions = ['conservative', 'moderate', 'aggressive']

export default function FirePlanner() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  useEffect(() => {                
  if (user) {
    loadUserData(user.id, 'fire_form').then((saved) => {
  if (saved) setForm({ ...initialForm, ...saved })
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
      await saveUserData(user.id, 'fire_form', form) 
      const res = await api.post('/api/fire', form)
      setResult(res.data)
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageHero
      title="🔥 FIRE Path Planner"
      subtitle="Plan your Financial Independence and Early Retirement journey."
      image="https://images.pexels.com/photos/7691731/pexels-photo-7691731.jpeg?auto=compress&cs=tinysrgb&w=1200"
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            ))}

            {/* Risk Profile */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Profile</label>
              <div className="flex gap-4">
                {riskOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setForm({ ...form, risk_profile: r })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition capitalize
                      ${form.risk_profile === r
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-8 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Building your FIRE roadmap...' : 'Generate My FIRE Plan →'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* FIRE Number */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 text-center">
            <p className="text-gray-500 mb-2">Your FIRE Number</p>
            <p className="text-6xl font-bold text-orange-500">
              ₹{Number(result.fire_number).toLocaleString('en-IN')}
            </p>
            <p className="text-gray-400 text-sm mt-1">Total corpus needed to retire</p>
            <div className="flex justify-center gap-8 mt-6">
              <div>
                <p className="text-2xl font-bold text-gray-800">{result.years_to_fire}</p>
                <p className="text-gray-400 text-sm">Years to FIRE</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">₹{Number(result.required_monthly_sip).toLocaleString('en-IN')}</p>
                <p className="text-gray-400 text-sm">Monthly SIP needed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{result.fire_age}</p>
                <p className="text-gray-400 text-sm">Retirement Age</p>
              </div>
            </div>
          </div>

          {/* Wealth Growth Chart */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Wealth Growth Projection</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={result.yearly_projection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} label={{ value: 'Year', position: 'insideBottom', offset: -2 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Legend />
                <Line type="monotone" dataKey="corpus" stroke="#f97316" strokeWidth={2} dot={false} name="Total Corpus" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" name="FIRE Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SIP Breakdown */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Recommended SIP Allocation</h2>
            <div className="space-y-3">
              {result.sip_allocation.map((s) => (
                <div key={s.fund_type} className="flex items-center gap-4">
                  <div className="w-40 text-sm text-gray-600 shrink-0">{s.fund_type}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-orange-400"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-700 w-20 text-right">
                    ₹{Number(s.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          {result.goal_breakdown?.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Goal-wise Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.goal_breakdown.map((g) => (
                  <div key={g.goal} className="border border-gray-100 rounded-xl p-4">
                    <p className="font-medium text-gray-700">{g.goal}</p>
                    <p className="text-orange-500 font-bold text-xl mt-1">₹{Number(g.estimated_cost).toLocaleString('en-IN')}</p>
                    <p className="text-gray-400 text-sm">SIP: ₹{Number(g.monthly_sip).toLocaleString('en-IN')}/month</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">AI Recommendations</h2>
            <ul className="space-y-3">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="text-orange-500 font-bold">{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full border border-gray-200 text-gray-500 py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Recalculate
          </button>
        </div>
      )}
      </div>
    </div>
  )
}