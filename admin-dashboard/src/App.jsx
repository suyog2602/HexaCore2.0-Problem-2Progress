import { useEffect, useState } from 'react'
import { fetchReports, updateReportStatus } from './api'
import ReportTable from './ReportTable'

const FILTERS = ['All', 'Pending', 'In Progress', 'Resolved']

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

export default function App() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')

  async function load() {
    try {
      setReports(await fetchReports())
      setError('')
    } catch (e) {
      setError('Could not reach the server. Is the backend running on port 3000?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 10000)
    return () => clearInterval(timer)
  }, [])

  async function handleStatusChange(id, status) {
    try {
      const updated = await updateReportStatus(id, status)
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (e) {
      alert(e.message)
    }
  }

  const count = (s) => reports.filter((r) => r.status === s).length
  const visible = filter === 'All' ? reports : reports.filter((r) => r.status === filter)

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-blue-600 to-blue-900 px-6 py-8 text-white">
        <h1 className="text-3xl font-bold">CivicPulse Admin</h1>
        <p className="mt-1 text-blue-100">Track, prioritize and resolve civic issues.</p>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        {error && (
          <div className="rounded-xl bg-red-100 p-4 text-red-800">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total reports" value={reports.length} color="text-slate-800" />
          <StatCard label="Pending" value={count('Pending')} color="text-amber-600" />
          <StatCard label="In progress" value={count('In Progress')} color="text-blue-600" />
          <StatCard label="Resolved" value={count('Resolved')} color="text-green-600" />
        </div>

        <section className="rounded-2xl bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
            <h2 className="mr-4 text-lg font-semibold text-slate-800">Reports</h2>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1 text-sm font-medium ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-500">Loading reports...</p>
          ) : (
            <ReportTable reports={visible} onStatusChange={handleStatusChange} />
          )}
        </section>
      </main>
    </div>
  )
}