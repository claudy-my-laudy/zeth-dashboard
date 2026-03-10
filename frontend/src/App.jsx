import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Header from './components/Header'
import StatsRow from './components/StatsRow'
import Charts from './components/Charts'
import ActivityLog from './components/ActivityLog'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export default function App() {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${API}/api/stats`),
        axios.get(`${API}/api/logs`)
      ])
      setStats(statsRes.data)
      setLogs(logsRes.data)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const todayLogs = logs.filter(l => l.timestamp?.slice(0, 10) === new Date().toISOString().slice(0, 10))
  const todayTokens = todayLogs.reduce((s, l) => s + (l.tokens_total || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: '#0F0F0F' }}>
      <Header
        todayTokens={todayTokens}
        todayTasks={todayLogs.length}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-accent text-lg animate-pulse">Loading dashboard…</div>
        </div>
      ) : (
        <main className="max-w-screen-2xl mx-auto px-6 pb-12 space-y-8">
          <StatsRow stats={stats} logs={logs} />
          <Charts stats={stats} />
          <ActivityLog logs={logs} onDelete={async (id) => {
            await axios.delete(`${API}/api/logs/${id}`)
            fetchData()
          }} />
        </main>
      )}

    </div>
  )
}
