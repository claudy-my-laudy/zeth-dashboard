require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { VALID_CATEGORIES, normalizeLogPayload } = require('./log_normalizer');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { dbName: 'zeth-dashboard' })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schema
const taskLogSchema = new mongoose.Schema({
  timestamp: { type: String, default: () => new Date().toISOString() },
  category: {
    type: String,
    enum: VALID_CATEGORIES,
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tokens_in: { type: Number, default: 0 },
  tokens_out: { type: Number, default: 0 },
  tokens_total: { type: Number, default: 0 },
  duration_minutes: { type: Number, default: 0 },
  model: { type: String, default: 'claude-sonnet-4-6' }
}, { collection: 'task_logs' });

const TaskLog = mongoose.model('TaskLog', taskLogSchema);

// GET /api/logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await TaskLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs
app.post('/api/logs', async (req, res) => {
  try {
    const normalized = normalizeLogPayload(req.body);
    const log = new TaskLog(normalized);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/logs/:id
app.delete('/api/logs/:id', async (req, res) => {
  try {
    await TaskLog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const logs = await TaskLog.find();

    const totalTokens = logs.reduce((s, l) => s + (l.tokens_total || 0), 0);
    const totalTasks = logs.length;

    // By category
    const categories = ['coding', 'research', 'writing', 'automation', 'admin', 'other'];
    const tokensByCategory = {};
    const timeByCategory = {};
    categories.forEach(c => { tokensByCategory[c] = 0; timeByCategory[c] = 0; });
    logs.forEach(l => {
      if (l.category) {
        tokensByCategory[l.category] = (tokensByCategory[l.category] || 0) + (l.tokens_total || 0);
        timeByCategory[l.category] = (timeByCategory[l.category] || 0) + (l.duration_minutes || 0);
      }
    });

    // By provider (extract from model field e.g. "opencode/claude-sonnet" -> "opencode")
    const tokensByProvider = {};
    const tasksByProvider = {};
    const timeByProvider = {};
    logs.forEach(l => {
      const provider = l.model && l.model.includes('/') ? l.model.split('/')[0] : (l.model || 'unknown');
      tokensByProvider[provider] = (tokensByProvider[provider] || 0) + (l.tokens_total || 0);
      tasksByProvider[provider] = (tasksByProvider[provider] || 0) + 1;
      timeByProvider[provider] = (timeByProvider[provider] || 0) + (l.duration_minutes || 0);
    });

    // Daily token usage last 30 days
    const now = new Date();
    const daily = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      daily[key] = 0;
    }
    logs.forEach(l => {
      const day = (l.timestamp || '').slice(0, 10);
      if (day in daily) daily[day] += (l.tokens_total || 0);
    });
    const dailyTokens = Object.entries(daily).map(([date, tokens]) => ({ date, tokens }));

    res.json({
      totalTokens,
      totalTasks,
      tokensByCategory,
      timeByCategory,
      tokensByProvider,
      tasksByProvider,
      timeByProvider,
      dailyTokens
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Zeth Dashboard API running on port ${PORT}`));
