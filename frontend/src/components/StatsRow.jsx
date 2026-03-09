const CAT_COLORS = {
  coding: '#6366F1', research: '#06B6D4', writing: '#10B981',
  automation: '#F59E0B', admin: '#EC4899', other: '#6B7280'
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <div className="text-xs font-medium mb-1" style={{ color: '#888' }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color: accent || '#E5E5E5' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: '#555' }}>{sub}</div>}
    </div>
  )
}

export default function StatsRow({ stats, logs }) {
  if (!stats) return null

  const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
  const avgTokens = stats.totalTasks > 0 ? Math.round(stats.totalTokens / stats.totalTasks) : 0

  const mostActive = Object.entries(stats.tokensByCategory || {})
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
      <StatCard label="Total Tokens (All Time)" value={fmt(stats.totalTokens)} sub="across all sessions" accent="#FF6B2B" />
      <StatCard label="Total Tasks" value={stats.totalTasks} sub="logged sessions" />
      <StatCard label="Most Active Category" value={mostActive} sub="by token volume" accent={CAT_COLORS[mostActive]} />
      <StatCard label="Avg Tokens / Task" value={fmt(avgTokens)} sub="mean per session" />
    </div>
  )
}
