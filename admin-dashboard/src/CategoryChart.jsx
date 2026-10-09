import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

export default function CategoryChart({ reports }) {
  // Count how many reports exist per category.
  const counts = {}
  reports.forEach((r) => {
    counts[r.category] = (counts[r.category] || 0) + 1
  })
  const data = Object.entries(counts).map(([name, count]) => ({ name, count }))

  if (data.length === 0) {
    return <p className="p-8 text-center text-slate-500">No data yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}