import { useState } from 'react'

const CAT_COLORS = {
  coding: '#6366F1', research: '#06B6D4', writing: '#10B981',
  automation: '#F59E0B', admin: '#EC4899', other: '#6B7280'
}

const CATEGORIES = ['all', 'coding', 'research', 'writing', 'automation', 'admin', 'other']

function Badge({ category }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
      background: `${CAT_COLORS[category]}22`,
      color: CAT_COLORS[category] || '#aaa',
      border: `1px solid ${CAT_COLORS[category]}44`
    }}>
      {category}
    </span>
  )
}

export default function ActivityLog({ logs, onDelete }) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const PER_PAGE = 20

  const filtered = filter === 'all' ? logs : logs.filter(l => l.category === filter)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  return (
    <div className="rounded-xl border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b" style={{ borderColor: '#2A2A2A' }}>
        <h3 className="text-sm font-semibold" style={{ color: '#E5E5E5' }}>Activity Log</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setPage(1) }}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === cat ? (cat === 'all' ? '#FF6B2B' : CAT_COLORS[cat]) : '#2A2A2A',
                color: filter === cat ? '#fff' : '#888'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
              {['Timestamp', 'Category', 'Title', 'Tokens', 'Duration', 'Model', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#666' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10" style={{ color: '#555' }}>No logs found</td></tr>
            ) : paged.map((log) => (
              <tr key={log._id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: '#2A2A2A' }}>
                <td className="px-4 py-3 text-xs" style={{ color: '#888' }}>
                  {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3"><Badge category={log.category} /></td>
                <td className="px-4 py-3 font-medium max-w-xs truncate" title={log.title}>{log.title}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: '#FF6B2B' }}>{fmt(log.tokens_total)}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#888' }}>{log.duration_minutes}m</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#555' }}>{log.model}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { if (confirm('Delete this log?')) onDelete(log._id) }}
                    className="text-xs px-2 py-1 rounded opacity-40 hover:opacity-100 transition-opacity"
                    style={{ color: '#f87171' }}
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#2A2A2A' }}>
          <span className="text-xs" style={{ color: '#555' }}>
            {filtered.length} entries · Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded text-xs disabled:opacity-30"
              style={{ background: '#2A2A2A', color: '#aaa' }}
            >← Prev</button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded text-xs disabled:opacity-30"
              style={{ background: '#2A2A2A', color: '#aaa' }}
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  )
}
