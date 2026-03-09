import { useState } from 'react'

const CATEGORIES = ['coding', 'research', 'writing', 'automation', 'admin', 'other']
const MODELS = ['claude-sonnet-4-6', 'claude-opus-4', 'claude-haiku-3', 'gpt-4o', 'gpt-4o-mini']

const inputStyle = {
  background: '#0F0F0F',
  border: '1px solid #2A2A2A',
  borderRadius: 8,
  color: '#E5E5E5',
  padding: '8px 12px',
  width: '100%',
  fontSize: 14,
  outline: 'none'
}

const labelStyle = { color: '#888', fontSize: 12, fontWeight: 500, marginBottom: 4, display: 'block' }

export default function AddLogModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    category: 'coding',
    title: '',
    description: '',
    tokens_in: '',
    tokens_out: '',
    duration_minutes: '',
    model: 'claude-sonnet-4-6'
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const ti = parseInt(form.tokens_in) || 0
    const to = parseInt(form.tokens_out) || 0
    await onSave({
      ...form,
      timestamp: new Date(form.timestamp).toISOString(),
      tokens_in: ti,
      tokens_out: to,
      tokens_total: ti + to,
      duration_minutes: parseInt(form.duration_minutes) || 0
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A2A' }}>
          <h2 className="font-semibold" style={{ color: '#E5E5E5' }}>Add Task Log</h2>
          <button onClick={onClose} style={{ color: '#666', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Timestamp</label>
              <input type="datetime-local" value={form.timestamp} onChange={e => set('timestamp', e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Title</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} placeholder="Short task description" required />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} placeholder="More details (optional)" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={labelStyle}>Tokens In</label>
              <input type="number" value={form.tokens_in} onChange={e => set('tokens_in', e.target.value)} style={inputStyle} placeholder="0" min="0" />
            </div>
            <div>
              <label style={labelStyle}>Tokens Out</label>
              <input type="number" value={form.tokens_out} onChange={e => set('tokens_out', e.target.value)} style={inputStyle} placeholder="0" min="0" />
            </div>
            <div>
              <label style={labelStyle}>Duration (min)</label>
              <input type="number" value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} style={inputStyle} placeholder="0" min="0" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Model</label>
            <select value={form.model} onChange={e => set('model', e.target.value)} style={inputStyle}>
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: '#2A2A2A', color: '#888' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#FF6B2B', color: '#fff' }}>
              {saving ? 'Saving…' : 'Add Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
