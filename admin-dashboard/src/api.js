const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function fetchReports() {
  const res = await fetch(`${API_URL}/reports`)
  if (!res.ok) throw new Error(`Server error (${res.status})`)
  return res.json()
}

export async function updateReportStatus(id, status) {
  const res = await fetch(`${API_URL}/reports/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`Could not update status (${res.status})`)
  return res.json()
}