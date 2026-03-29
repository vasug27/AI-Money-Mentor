import { useState,useEffect } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import api from '../api/axios'
import { useSearchParams } from 'react-router-dom'
import {  useUser } from '@clerk/clerk-react'
import { saveUserData, loadUserData } from '../utils/userProfile'
import PageHero from '../components/PageHero'

const initialPartner = {
  name: '',
  age: '',
  monthly_income: '',
  monthly_expenses: '',
  existing_investments: '',
  monthly_sip: '',
  has_health_insurance: '',
  has_life_insurance: '',
  total_emi: '',
  tax_saving_investments: '',
  risk_profile: 'moderate',
}

const fields = [
  { key: 'name', label: 'Name', placeholder: 'Rahul', type: 'text' },
  { key: 'age', label: 'Age', placeholder: '28', type: 'number' },
  { key: 'monthly_income', label: 'Monthly Income (₹)', placeholder: '80000', type: 'number' },
  { key: 'monthly_expenses', label: 'Monthly Expenses (₹)', placeholder: '30000', type: 'number' },
  { key: 'existing_investments', label: 'Existing Investments (₹)', placeholder: '500000', type: 'number' },
  { key: 'monthly_sip', label: 'Current Monthly SIP (₹)', placeholder: '10000', type: 'number' },
  { key: 'has_health_insurance', label: 'Health Insurance?', placeholder: 'Yes / No', type: 'text' },
  { key: 'has_life_insurance', label: 'Life Insurance?', placeholder: 'Yes / No', type: 'text' },
  { key: 'total_emi', label: 'Total EMIs (₹)', placeholder: '5000', type: 'number' },
  { key: 'tax_saving_investments', label: 'Tax Saving Investments (₹)', placeholder: '50000', type: 'number' },
]

const riskOptions = ['conservative', 'moderate', 'aggressive']

function PartnerForm({ title, partner, setPartner, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-6 border-t-4 ${color}`}>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            <input
              type={f.type}
              value={partner[f.key]}
              onChange={(e) => setPartner({ ...partner, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Risk Profile</label>
          <div className="flex gap-2">
            {riskOptions.map((r) => (
              <button
                key={r}
                onClick={() => setPartner({ ...partner, risk_profile: r })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition capitalize
                  ${partner.risk_profile === r
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CouplePlanner() {
  const [partner1, setPartner1] = useState({ ...initialPartner, name: 'Partner 1' })
  const [partner2, setPartner2] = useState({ ...initialPartner, name: 'Partner 2' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
 const { user } = useUser()
const [searchParams] = useSearchParams()
const [linkStatus, setLinkStatus] = useState(null) 
const [inviteLink, setInviteLink] = useState(null)
const [linkedPartner, setLinkedPartner] = useState(null)


useEffect(() => {
  if (!user) return

  const invitedBy = searchParams.get('invitedBy')

  if (invitedBy && invitedBy !== user.id) {
    
    handleLinkAccounts(invitedBy)
  } else {
    
    checkLinkStatus()
  }
}, [user])

const checkLinkStatus = async () => {
  const linked = await loadUserData(user.id, 'couple_link')
  if (linked?.partnerId) {
    setLinkStatus('linked')
    setLinkedPartner(linked)
    // Load both profiles
    const p1 = await loadUserData(user.id, 'couple_partner1')
    const p2 = await loadUserData(linked.partnerId, 'couple_partner1')
    if (p1) setPartner1({ ...initialPartner, ...p1 })
    if (p2) setPartner2({ ...initialPartner, ...p2 })
  } else {
    setLinkStatus('unlinked')
  }
}

const handleLinkAccounts = async (partnerId) => {
  await saveUserData(user.id, 'couple_link', {
    partnerId,
    linkedAt: new Date().toISOString()
  })
  await saveUserData(partnerId, 'couple_link', {
    partnerId: user.id,
    linkedAt: new Date().toISOString()
  })
  setLinkStatus('linked')
  checkLinkStatus()
}

const generateInviteLink = () => {
  const link = `${window.location.origin}/couple?invitedBy=${user.id}`
  setInviteLink(link)
}

const handleUnlink = async () => {
  const linked = await loadUserData(user.id, 'couple_link')
  if (linked?.partnerId) {
    await saveUserData(linked.partnerId, 'couple_link', null)
  }
  await saveUserData(user.id, 'couple_link', null)
  setLinkStatus('unlinked')
  setLinkedPartner(null)
  setInviteLink(null)
}       

useEffect(() => {             
  if (user) {
    loadUserData(user.id, 'couple_partner1').then((saved) => {
      if (saved) setPartner1(saved)
    })
    loadUserData(user.id, 'couple_partner2').then((saved) => {
      if (saved) setPartner2(saved)
    })
  }
}, [user])

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
        await saveUserData(user.id, 'couple_partner1', partner1)  
        await saveUserData(user.id, 'couple_partner2', partner2)
      const res = await api.post('/api/couple', { partner1, partner2 })
      setResult(res.data)
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const incomeCompare = result ? [
    { name: 'Income', [partner1.name || 'Partner 1']: result.partner1_summary.monthly_income, [partner2.name || 'Partner 2']: result.partner2_summary.monthly_income },
    { name: 'Expenses', [partner1.name || 'Partner 1']: result.partner1_summary.monthly_expenses, [partner2.name || 'Partner 2']: result.partner2_summary.monthly_expenses },
    { name: 'SIP', [partner1.name || 'Partner 1']: result.partner1_summary.monthly_sip, [partner2.name || 'Partner 2']: result.partner2_summary.monthly_sip },
  ] : []

  return (
    <div>
  <PageHero
    title="💑 Couple's Money Planner"
    subtitle="India's first AI-powered joint financial planning tool. Optimize your finances together."
    image="https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=1200"
  />
  <div className="max-w-5xl mx-auto px-4 py-10">
{linkStatus === 'unlinked' && (
  <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 mb-6">
    <h2 className="text-lg font-semibold text-gray-700 mb-2">
      🔗 Link Your Partner's Account
    </h2>
    
    <button
      onClick={generateInviteLink}
      className="bg-pink-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition"
    >
      Generate Invite Link
    </button>

    {inviteLink && (
      <div className="mt-4 p-4 bg-pink-50 rounded-xl">
        <p className="text-xs text-gray-500 mb-2">Share this link with your partner:</p>
        <div className="flex gap-2 items-center">
          <input
            readOnly
            value={inviteLink}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink)
              alert('Link copied!')
            }}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-pink-600 transition"
          >
            Copy
          </button>
        </div>
      </div>
    )}
    <p className="text-gray-400 text-xs mt-4">
      Or fill both forms manually below if your partner is with you right now.
    </p>
  </div>
)}

{linkStatus === 'linked' && (
  <div className="bg-green-50 rounded-2xl p-4 border border-green-200 mb-6 flex justify-between items-center">
    <div>
      <p className="text-green-700 font-semibold">✅ Partner Account Linked</p>
      <p className="text-green-600 text-sm">
        Both profiles loaded automatically. Linked on {new Date(linkedPartner?.linkedAt).toLocaleDateString()}
      </p>
    </div>
    <button
      onClick={handleUnlink}
      className="text-red-400 text-xs hover:text-red-600"
    >
      Unlink
    </button>
  </div>
)}
      <p className="text-gray-500 mb-8">
        India's first AI-powered joint financial planning tool. Optimize your finances together.
      </p>

      {!result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PartnerForm
              title="👤 Partner 1"
              partner={partner1}
              setPartner={setPartner1}
              color="border-pink-400"
            />
            <PartnerForm
              title="👤 Partner 2"
              partner={partner2}
              setPartner={setPartner2}
              color="border-blue-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition disabled:opacity-50"
          >
            {loading ? 'Optimizing your joint finances...' : 'Generate Joint Financial Plan →'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Combined Net Worth */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 text-center">
            <p className="text-gray-500 mb-2">Combined Net Worth</p>
            <p className="text-6xl font-bold text-pink-500">
              ₹{Number(result.combined_net_worth).toLocaleString('en-IN')}
            </p>
            <div className="flex justify-center gap-12 mt-6">
              <div>
                <p className="text-xl font-bold text-gray-800">
                  ₹{Number(result.combined_monthly_income).toLocaleString('en-IN')}
                </p>
                <p className="text-gray-400 text-sm">Combined Monthly Income</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">
                  ₹{Number(result.combined_monthly_savings).toLocaleString('en-IN')}
                </p>
                <p className="text-gray-400 text-sm">Combined Monthly Savings</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">
                  {result.financial_compatibility_score}/100
                </p>
                <p className="text-gray-400 text-sm">Financial Compatibility</p>
              </div>
            </div>
          </div>

          {/* Income Comparison Chart */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Income vs Expenses vs SIP</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={incomeCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey={partner1.name || 'Partner 1'} fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey={partner2.name || 'Partner 2'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              💡 Joint Optimization Suggestions
            </h2>
            <div className="space-y-3">
              {result.optimizations.map((o, i) => (
                <div key={i} className="flex gap-4 p-4 bg-pink-50 rounded-xl">
                  <span className="text-pink-500 font-bold text-sm shrink-0">{i + 1}.</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{o.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{o.description}</p>
                    {o.saving && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Potential saving: ₹{Number(o.saving).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HRA & Tax Splits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">🏠 HRA Optimization</h2>
              <p className="text-sm text-gray-600">{result.hra_advice}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">📊 SIP Split Strategy</h2>
              <p className="text-sm text-gray-600">{result.sip_split_advice}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">🛡️ Insurance Strategy</h2>
              <p className="text-sm text-gray-600">{result.insurance_advice}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">💰 NPS Strategy</h2>
              <p className="text-sm text-gray-600">{result.nps_advice}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Recommendations</h2>
            <ul className="space-y-3">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="text-pink-500 font-bold">{i + 1}.</span>
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