import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/axios'
import { saveUserData, loadUserData } from '../utils/userProfile'
import PageHero from '../components/PageHero'

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16']

export default function MFXray() {
  const [mode, setMode] = useState('upload') // upload | manual
  const [pdfFile, setPdfFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useUser()

  

  const handleUpload = async () => {
    if (!pdfFile) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', pdfFile)
      const res = await api.post('/api/mf-xray/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      await saveUserData(user.id, 'mf_xray_result', res.data)
    } catch (err) {
      setError('PDF parsing failed. Please try the sample statement or manual entry.')
    } finally {
      setLoading(false)
    }
  }

  const handleSample = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/mf-xray/sample')
      setResult(res.data)
      await saveUserData(user.id, 'mf_xray_result', res.data)
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const pieData = result?.allocation?.map((a) => ({
    name: a.category,
    value: a.percentage,
  })) || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageHero
        title="📊 MF Portfolio X-Ray"
        subtitle="Upload your CAMS statement and get a complete portfolio analysis in seconds."
        image="https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=1200"
        />
        <div className="max-w-4xl mx-auto px-4 py-10">
      {!result ? (
        <div className="space-y-6">

          {/* Mode Toggle */}
          <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 flex gap-4">
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition
                ${mode === 'upload' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              📄 Upload CAMS Statement
            </button>
            <button
              onClick={() => setMode('sample')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition
                ${mode === 'sample' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              🧪 Try Sample Statement
            </button>
          </div>

          {mode === 'upload' ? (
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 transition"
                onClick={() => document.getElementById('cams-upload').click()}
              >
                <p className="text-4xl mb-4">📄</p>
                <p className="text-gray-600 font-medium">
                  {pdfFile ? pdfFile.name : 'Click to upload CAMS/KFintech PDF'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Download from camsonline.com → Consolidated Account Statement
                </p>
                <input
                  id="cams-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

              <button
                onClick={handleUpload}
                disabled={loading || !pdfFile}
                className="mt-6 w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition disabled:opacity-50"
              >
                {loading ? 'Analyzing your portfolio...' : 'Analyze My Portfolio →'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 text-center">
              <p className="text-4xl mb-4">🧪</p>
              <p className="text-gray-600 font-medium mb-2">Try with a sample CAMS statement</p>
              <p className="text-gray-400 text-sm mb-6">
                See exactly what the X-Ray analysis looks like with real sample data
              </p>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={handleSample}
                disabled={loading}
                className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition disabled:opacity-50"
              >
                {loading ? 'Loading sample...' : 'Analyze Sample Portfolio →'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Invested', value: `₹${Number(result.total_invested).toLocaleString('en-IN')}`, color: 'text-gray-800' },
              { label: 'Current Value', value: `₹${Number(result.current_value).toLocaleString('en-IN')}`, color: 'text-blue-600' },
              { label: 'XIRR', value: `${result.xirr}%`, color: result.xirr > 12 ? 'text-green-600' : 'text-orange-500' },
              { label: 'Total Returns', value: `₹${Number(result.total_returns).toLocaleString('en-IN')}`, color: result.total_returns > 0 ? 'text-green-600' : 'text-red-500' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl shadow p-6 border border-gray-100 text-center">
                <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Allocation Pie Chart */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Portfolio Allocation</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fund wise breakdown */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Fund-wise Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-gray-500 font-medium">Fund Name</th>
                    <th className="text-right py-3 text-gray-500 font-medium">Invested</th>
                    <th className="text-right py-3 text-gray-500 font-medium">Current</th>
                    <th className="text-right py-3 text-gray-500 font-medium">Returns</th>
                    <th className="text-right py-3 text-gray-500 font-medium">XIRR</th>
                  </tr>
                </thead>
                <tbody>
                  {result.funds?.map((fund, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-gray-700">{fund.name}</td>
                      <td className="py-3 text-right text-gray-600">₹{Number(fund.invested).toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right text-gray-600">₹{Number(fund.current_value).toLocaleString('en-IN')}</td>
                      <td className={`py-3 text-right font-medium ${fund.returns > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {fund.returns > 0 ? '+' : ''}₹{Number(fund.returns).toLocaleString('en-IN')}
                      </td>
                      <td className={`py-3 text-right font-medium ${fund.xirr > 12 ? 'text-green-600' : 'text-orange-500'}`}>
                        {fund.xirr}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overlap Analysis */}
          {result.overlaps?.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">⚠️ Overlap Analysis</h2>
              <p className="text-gray-500 text-sm mb-4">
                These funds hold similar stocks — you may be over-diversifying without benefit.
              </p>
              <div className="space-y-3">
                {result.overlaps.map((o, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl">
                    <p className="text-sm text-gray-700">{o.fund1} ↔ {o.fund2}</p>
                    <p className="text-orange-500 font-semibold text-sm">{o.overlap}% overlap</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense Ratio */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">💸 Expense Ratio Drag</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={result.funds}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="expense_ratio" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Expense Ratio" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Benchmark Comparison */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 Benchmark Comparison</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-indigo-50 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">Your Portfolio XIRR</p>
                <p className="text-2xl font-bold text-indigo-600">{result.xirr}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">Nifty 50 XIRR</p>
                <p className="text-2xl font-bold text-gray-700">{result.nifty_xirr}%</p>
              </div>
              <div className={`p-4 rounded-xl ${result.xirr > result.nifty_xirr ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-gray-500 text-xs mb-1">Alpha Generated</p>
                <p className={`text-2xl font-bold ${result.xirr > result.nifty_xirr ? 'text-green-600' : 'text-red-500'}`}>
                  {(result.xirr - result.nifty_xirr).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* AI Rebalancing Plan */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">🤖 AI Rebalancing Plan</h2>
            <ul className="space-y-3">
              {result.rebalancing_plan?.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 p-3 bg-indigo-50 rounded-xl">
                  <span className="text-indigo-500 font-bold shrink-0">{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full border border-gray-200 text-gray-500 py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Analyze Another Statement
          </button>
        </div>
      )}
      </div>
    </div>
  )
}