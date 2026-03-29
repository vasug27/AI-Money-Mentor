import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react'
import { saveUserData, loadUserData } from '../utils/userProfile'
import api from '../api/axios'
import PageHero from '../components/PageHero'

const initialForm = {
  basic_salary: '',
  hra_received: '',
  rent_paid: '',
  city_type: 'metro',
  special_allowance: '',
  other_income: '',
  section_80c: '',
  section_80d: '',
  section_80ccd: '',
  home_loan_interest: '',
  education_loan_interest: '',
  other_deductions: '',
}

const fields = [
  { key: 'basic_salary', label: 'Basic Salary (Annual ₹)', placeholder: '600000', type: 'number' },
  { key: 'hra_received', label: 'HRA Received (Annual ₹)', placeholder: '240000', type: 'number' },
  { key: 'rent_paid', label: 'Rent Paid (Annual ₹)', placeholder: '180000', type: 'number' },
  { key: 'special_allowance', label: 'Special Allowance (Annual ₹)', placeholder: '120000', type: 'number' },
  { key: 'other_income', label: 'Other Income (Annual ₹)', placeholder: '0', type: 'number' },
  { key: 'section_80c', label: 'Section 80C Investments (₹)', placeholder: '150000', type: 'number' },
  { key: 'section_80d', label: 'Section 80D - Health Insurance Premium (₹)', placeholder: '25000', type: 'number' },
  { key: 'section_80ccd', label: 'NPS Contribution 80CCD(1B) (₹)', placeholder: '50000', type: 'number' },
  { key: 'home_loan_interest', label: 'Home Loan Interest (₹)', placeholder: '0', type: 'number' },
  { key: 'education_loan_interest', label: 'Education Loan Interest (₹)', placeholder: '0', type: 'number' },
  { key: 'other_deductions', label: 'Other Deductions (₹)', placeholder: '0', type: 'number' },
]

const cityOptions = ['metro', 'non-metro']

export default function TaxWizard() {
  const [mode, setMode] = useState('manual') // 'manual' or 'pdf'
  const [form, setForm] = useState(initialForm)
  const [pdfFile, setPdfFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  useEffect(() => {                
  if (user) {
    loadUserData(user.id, 'tax_form').then((saved) => {
      if (saved) setForm(saved)
    })
  }
}, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmitManual = async () => {
    setLoading(true)
    setError(null)
    try {
        await saveUserData(user.id, 'tax_form', form)
      const res = await api.post('/api/tax', form)
      setResult(res.data)
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPdf = async () => {
    if (!pdfFile) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', pdfFile)
      const res = await api.post('/api/tax/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (err) {
      setError('PDF parsing failed. Try manual entry instead.')
    } finally {
      setLoading(false)
    }
  }

  const savings = result
    ? result.old_regime_tax - result.new_regime_tax
    : 0

  const betterRegime = savings > 0 ? 'New Regime' : savings < 0 ? 'Old Regime' : 'Equal'
  const savedAmount = Math.abs(savings)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageHero
      title="🧾 Tax Wizard"
      subtitle="Find every deduction you're missing and see which tax regime saves you more."
      image="https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=1200"
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
      {!result ? (
        <div className="space-y-6">

          {/* Mode Toggle */}
          <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 flex gap-4">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition
                ${mode === 'manual' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ✏️ Manual Entry
            </button>
            <button
              onClick={() => setMode('pdf')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition
                ${mode === 'pdf' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              📄 Upload Form 16
            </button>
          </div>

          {mode === 'pdf' ? (
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-green-400 transition"
                onClick={() => document.getElementById('pdf-upload').click()}
              >
                <p className="text-4xl mb-4">📄</p>
                <p className="text-gray-600 font-medium">
                  {pdfFile ? pdfFile.name : 'Click to upload Form 16 PDF'}
                </p>
                <p className="text-gray-400 text-sm mt-2">Supports PDF format</p>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              <button
                onClick={handleSubmitPdf}
                disabled={loading || !pdfFile}
                className="mt-6 w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50"
              >
                {loading ? 'Analyzing Form 16...' : 'Analyze My Form 16 →'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">

              {/* City Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">City Type</label>
                <div className="flex gap-4">
                  {cityOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, city_type: c })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition capitalize
                        ${form.city_type === c
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

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
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                ))}
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

              <button
                onClick={handleSubmitManual}
                disabled={loading}
                className="mt-8 w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50"
              >
                {loading ? 'Calculating your taxes...' : 'Calculate My Tax →'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">

          {/* Verdict */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 text-center">
            <p className="text-gray-500 mb-2">Best Regime For You</p>
            <p className="text-5xl font-bold text-green-600">{betterRegime}</p>
            <p className="text-gray-400 text-sm mt-1">
              You save <span className="text-green-600 font-semibold">₹{savedAmount.toLocaleString('en-IN')}</span> by choosing {betterRegime}
            </p>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Old Regime */}
            <div className={`bg-white rounded-2xl shadow p-6 border-2 transition
              ${betterRegime === 'Old Regime' ? 'border-green-400' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">Old Regime</h2>
                {betterRegime === 'Old Regime' && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">✓ Better</span>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Income</span>
                  <span className="font-medium">₹{Number(result.gross_income).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Deductions</span>
                  <span className="font-medium text-green-600">- ₹{Number(result.old_regime_deductions).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxable Income</span>
                  <span className="font-medium">₹{Number(result.old_regime_taxable).toLocaleString('en-IN')}</span>
                </div>
                <hr />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-700">Tax Payable</span>
                  <span className="font-bold text-red-500">₹{Number(result.old_regime_tax).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* New Regime */}
            <div className={`bg-white rounded-2xl shadow p-6 border-2 transition
              ${betterRegime === 'New Regime' ? 'border-green-400' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">New Regime</h2>
                {betterRegime === 'New Regime' && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">✓ Better</span>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Income</span>
                  <span className="font-medium">₹{Number(result.gross_income).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Standard Deduction</span>
                  <span className="font-medium text-green-600">- ₹75,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxable Income</span>
                  <span className="font-medium">₹{Number(result.new_regime_taxable).toLocaleString('en-IN')}</span>
                </div>
                <hr />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-700">Tax Payable</span>
                  <span className="font-bold text-red-500">₹{Number(result.new_regime_tax).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Missing Deductions */}
          {result.missing_deductions?.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                💡 Deductions You're Missing
              </h2>
              <div className="space-y-3">
                {result.missing_deductions.map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{d.section}</p>
                      <p className="text-xs text-gray-400">{d.description}</p>
                    </div>
                    <p className="text-green-600 font-semibold text-sm">
                      Save ₹{Number(d.potential_saving).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investment Suggestions */}
          {result.investment_suggestions?.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                📈 Tax-Saving Investment Suggestions
              </h2>
              <div className="space-y-3">
                {result.investment_suggestions.map((s, i) => (
                  <div key={i} className="flex justify-between items-center border border-gray-100 rounded-xl p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Risk: {s.risk}</p>
                      <p className="text-xs text-gray-400">Lock-in: {s.lock_in}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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