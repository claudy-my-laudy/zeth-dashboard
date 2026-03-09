import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts'

const CAT_COLORS = {
  coding: '#6366F1', research: '#06B6D4', writing: '#10B981',
  automation: '#F59E0B', admin: '#EC4899', other: '#6B7280'
}

const PROVIDER_COLORS = {
  'opencode': '#FF6B2B',
  'github-copilot': '#6366F1',
  'anthropic': '#10B981',
  'openai': '#06B6D4',
  'unknown': '#6B7280'
}

const CARD_STYLE = {
  background: '#1A1A1A',
  borderColor: '#2A2A2A',
  borderRadius: '0.75rem',
  border: '1px solid #2A2A2A',
  padding: '1.25rem'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0F0F0F', border: '1px solid #2A2A2A', borderRadius: 8, padding: '8px 12px' }}>
      {label && <p style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#FF6B2B', fontSize: 13, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? `${(p.value / 1000).toFixed(1)}k` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Charts({ stats }) {
  if (!stats) return null

  const pieData = Object.entries(stats.tokensByCategory || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const barData = Object.entries(stats.timeByCategory || {})
    .filter(([, v]) => v > 0)
    .map(([name, mins]) => ({ name, hours: +(mins / 60).toFixed(2) }))

  const lineData = (stats.dailyTokens || []).map(d => ({
    date: d.date.slice(5),
    tokens: d.tokens
  }))

  // Provider data
  const providerPieData = Object.entries(stats.tokensByProvider || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const providerBarData = Object.entries(stats.tasksByProvider || {})
    .filter(([, v]) => v > 0)
    .map(([name, tasks]) => ({ name, tasks }))

  const providerTimeData = Object.entries(stats.timeByProvider || {})
    .filter(([, v]) => v > 0)
    .map(([name, mins]) => ({ name, hours: +(mins / 60).toFixed(2) }))

  return (
    <div className="space-y-6">
      {/* Category Charts */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#666' }}>By Category</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Pie */}
          <div style={CARD_STYLE}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#E5E5E5' }}>Tokens by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: '#aaa', fontSize: 12 }}>{value}</span>}
                  iconType="circle" iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Time by Category Bar */}
          <div style={CARD_STYLE}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#E5E5E5' }}>Time by Category (hrs)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,107,43,0.08)' }} />
                <Bar dataKey="hours" name="hours" radius={[4, 4, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#6B7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Tokens Line */}
          <div style={CARD_STYLE}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#E5E5E5' }}>Daily Tokens (30 days)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={lineData} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B2B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B2B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false}
                  interval={Math.floor(lineData.length / 6)} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tokens" name="tokens" stroke="#FF6B2B" strokeWidth={2}
                  fill="url(#tokenGrad)" dot={false} activeDot={{ r: 4, fill: '#FF6B2B' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Provider Charts */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#666' }}>By Provider</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider Token Pie */}
          <div style={CARD_STYLE}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#E5E5E5' }}>Tokens by Provider</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={providerPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                  {providerPieData.map((entry) => (
                    <Cell key={entry.name} fill={PROVIDER_COLORS[entry.name] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: '#aaa', fontSize: 12 }}>{value}</span>}
                  iconType="circle" iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks by Provider Bar */}
          <div style={CARD_STYLE}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#E5E5E5' }}>Tasks by Provider</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={providerBarData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,107,43,0.08)' }} />
                <Bar dataKey="tasks" name="tasks" radius={[4, 4, 0, 0]}>
                  {providerBarData.map((entry) => (
                    <Cell key={entry.name} fill={PROVIDER_COLORS[entry.name] || '#6B7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time by Provider Bar */}
          <div style={CARD_STYLE}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#E5E5E5' }}>Time by Provider (hrs)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={providerTimeData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,107,43,0.08)' }} />
                <Bar dataKey="hours" name="hours" radius={[4, 4, 0, 0]}>
                  {providerTimeData.map((entry) => (
                    <Cell key={entry.name} fill={PROVIDER_COLORS[entry.name] || '#6B7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
