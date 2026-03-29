import { useState, useRef, useEffect } from 'react'
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react'
import { saveUserData, loadUserData } from '../utils/userProfile'
import api from '../api/axios'
import PageHero from '../components/PageHero'

const lifeEvents = [
  { key: 'bonus', label: '💰 Received a Bonus', desc: 'How to invest your bonus smartly' },
  { key: 'marriage', label: '💍 Getting Married', desc: 'Joint finances, insurance, goals' },
  { key: 'new_baby', label: '👶 New Baby', desc: 'Education fund, insurance, budgeting' },
  { key: 'inheritance', label: '🏦 Received Inheritance', desc: 'Tax implications and investment plan' },
  { key: 'job_change', label: '💼 Job Change', desc: 'PF transfer, salary negotiation, tax' },
  { key: 'home_purchase', label: '🏠 Buying a Home', desc: 'Loan planning, tax benefits, budget' },
]

const initialProfile = {
  age: '',
  monthly_income: '',
  tax_bracket: '',
  risk_profile: 'moderate',
  existing_investments: '',
  amount_involved: '',
}

export default function LifeEventAdvisor() {
  const [step, setStep] = useState('select') // select | profile | chat
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [profile, setProfile] = useState(initialProfile)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const { user } = useUser()        

useEffect(() => {                 
  if (user) {
    loadUserData(user.id, 'life_event_profile').then((saved) => {
      if (saved) setProfile(saved)
    })
  }
}, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    setStep('profile')
  }

  const handleStartChat = async () => {
    setStep('chat')
    setLoading(true)
    try {
        await saveUserData(user.id, 'life_event_profile', profile)  
      const res = await api.post('/api/life-event/start', {
        event: selectedEvent.key,
        profile,
      })
      setMessages([{ role: 'assistant', content: res.data.message }])
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await api.post('/api/life-event/chat', {
        event: selectedEvent.key,
        profile,
        messages: [...messages, userMsg],
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.message }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = () => {
    setStep('select')
    setSelectedEvent(null)
    setProfile(initialProfile)
    setMessages([])
    setInput('')
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageHero
      title="🎯 Life Event Advisor"
      subtitle="Get personalized financial advice for your life's biggest moments."
      image="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1200"
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
      
      {step === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifeEvents.map((event) => (
            <button
              key={event.key}
              onClick={() => handleSelectEvent(event)}
              className="bg-white rounded-2xl shadow p-6 border border-gray-100 text-left hover:border-purple-400 hover:shadow-md transition"
            >
              <p className="text-2xl mb-2">{event.label}</p>
              <p className="text-gray-500 text-sm">{event.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2 - Quick Profile */}
      {step === 'profile' && (
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setStep('select')}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold text-gray-700">
              {selectedEvent.label} — Quick Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Age</label>
              <input
                type="number"
                placeholder="28"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
              <input
                type="number"
                placeholder="80000"
                value={profile.monthly_income}
                onChange={(e) => setProfile({ ...profile, monthly_income: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Bracket</label>
              <select
                value={profile.tax_bracket}
                onChange={(e) => setProfile({ ...profile, tax_bracket: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Select bracket</option>
                <option value="0">0% (below ₹3L)</option>
                <option value="5">5% (₹3L - ₹7L)</option>
                <option value="10">10% (₹7L - ₹10L)</option>
                <option value="15">15% (₹10L - ₹12L)</option>
                <option value="20">20% (₹12L - ₹15L)</option>
                <option value="30">30% (above ₹15L)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedEvent.key === 'bonus' ? 'Bonus Amount (₹)' :
                 selectedEvent.key === 'inheritance' ? 'Inheritance Amount (₹)' :
                 'Amount Involved (₹)'}
              </label>
              <input
                type="number"
                placeholder="500000"
                value={profile.amount_involved}
                onChange={(e) => setProfile({ ...profile, amount_involved: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Existing Investments (₹)</label>
              <input
                type="number"
                placeholder="200000"
                value={profile.existing_investments}
                onChange={(e) => setProfile({ ...profile, existing_investments: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Profile</label>
              <div className="flex gap-3">
                {['conservative', 'moderate', 'aggressive'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setProfile({ ...profile, risk_profile: r })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition capitalize
                      ${profile.risk_profile === r
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <button
            onClick={handleStartChat}
            disabled={loading}
            className="mt-8 w-full bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition disabled:opacity-50"
          >
            {loading ? 'Starting your session...' : 'Start Conversation →'}
          </button>
        </div>
      )}

      {/* Step 3 - Chat */}
      {step === 'chat' && (
        <div className="bg-white rounded-2xl shadow border border-gray-100 flex flex-col h-150">

          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <p className="font-semibold text-gray-700">{selectedEvent.label}</p>
              <p className="text-xs text-gray-400">AI Financial Advisor</p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Start Over
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-purple-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-700 rounded-bl-none'}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your finances..."
              rows={1}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-purple-500 text-white px-5 py-2 rounded-xl font-medium hover:bg-purple-600 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}