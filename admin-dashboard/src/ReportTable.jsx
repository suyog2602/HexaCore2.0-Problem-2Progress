const STATUSES = ['Pending', 'In Progress', 'Resolved']

const BADGE = {
  Pending: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
}

function formatLocation(r) {
  if (r.address) return r.address
  if (r.latitude != null && r.longitude != null) {
    return `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`
  }
  return '-'
}

export default function ReportTable({ reports, allReports, onStatusChange }) {
  const titleById = Object.fromEntries((allReports || reports).map((r) => [r.id, r.title]))

  if (reports.length === 0) {
    return <p className="p-8 text-center text-slate-500">No reports to show.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Issue</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Reported</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((r) => (
            <tr key={r.id} className="align-top hover:bg-slate-50">
              <td className="max-w-xs px-4 py-3">
                <div className="font-semibold text-slate-800">{r.title}</div>
                <div className="mt-1 text-slate-500">{r.description}</div>
                {r.possibleDuplicateOf && (
                  <div className="mt-2 inline-block rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                    AI: possible duplicate of "{titleById[r.possibleDuplicateOf] || 'another report'}"
                    {' '}({Math.round(r.duplicateSimilarity * 100)}% similar)
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-blue-700">{r.category}</td>
              <td className="px-4 py-3 text-slate-600">{formatLocation(r)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {new Date(r.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <select
                  value={r.status}
                  onChange={(e) => onStatusChange(r.id, e.target.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[r.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
