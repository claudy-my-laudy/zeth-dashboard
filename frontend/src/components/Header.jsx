export default function Header({ todayTokens, todayTasks }) {
  const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: '#0F0F0F', borderColor: '#2A2A2A' }}>
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧡</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#FF6B2B' }}>
              Zeth Dashboard
            </h1>
            <p className="text-xs" style={{ color: '#666' }}>AI Token Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium" style={{ color: '#888' }}>Today's Tokens</div>
            <div className="text-lg font-bold" style={{ color: '#FF6B2B' }}>{fmt(todayTokens)}</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium" style={{ color: '#888' }}>Today's Tasks</div>
            <div className="text-lg font-bold text-white">{todayTasks}</div>
          </div>

        </div>
      </div>
    </header>
  )
}
