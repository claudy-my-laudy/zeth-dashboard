require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, { dbName: 'zeth-dashboard' });

const taskLogSchema = new mongoose.Schema({
  timestamp: String,
  category: String,
  title: String,
  description: String,
  tokens_in: Number,
  tokens_out: Number,
  tokens_total: Number,
  duration_minutes: Number,
  model: String
}, { collection: 'task_logs' });

const TaskLog = mongoose.model('TaskLog', taskLogSchema);

const now = new Date();
const daysAgo = d => new Date(now - d * 86400000).toISOString();

const seeds = [
  { timestamp: daysAgo(0), category: 'coding', title: 'Refactor auth middleware', description: 'Cleaned up JWT validation and added refresh token support', tokens_in: 1840, tokens_out: 920, tokens_total: 2760, duration_minutes: 25, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(0), category: 'research', title: 'Investigate vector DB options', description: 'Compared Pinecone, Weaviate and Qdrant for embedding storage', tokens_in: 2100, tokens_out: 780, tokens_total: 2880, duration_minutes: 18, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(1), category: 'writing', title: 'Draft project README', description: 'Wrote comprehensive README with setup instructions and API docs', tokens_in: 950, tokens_out: 1240, tokens_total: 2190, duration_minutes: 15, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(1), category: 'coding', title: 'Build React dashboard layout', description: 'Created responsive grid layout with dark theme using TailwindCSS', tokens_in: 3200, tokens_out: 1800, tokens_total: 5000, duration_minutes: 40, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(2), category: 'automation', title: 'Set up GitHub Actions CI', description: 'Configured test and deploy pipeline for main branch pushes', tokens_in: 1100, tokens_out: 560, tokens_total: 1660, duration_minutes: 20, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(3), category: 'admin', title: 'Review and triage GitHub issues', description: 'Went through 12 open issues, labeled and prioritized them', tokens_in: 620, tokens_out: 380, tokens_total: 1000, duration_minutes: 10, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(4), category: 'coding', title: 'Implement MongoDB aggregation pipeline', description: 'Built stats endpoint with category grouping and daily rollups', tokens_in: 2400, tokens_out: 1100, tokens_total: 3500, duration_minutes: 30, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(5), category: 'research', title: 'Read Anthropic token pricing docs', description: 'Analyzed cost per 1M tokens across Claude models', tokens_in: 1300, tokens_out: 450, tokens_total: 1750, duration_minutes: 12, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(6), category: 'writing', title: 'Write technical blog post on RAG', description: 'Explained retrieval-augmented generation with code examples', tokens_in: 1700, tokens_out: 2100, tokens_total: 3800, duration_minutes: 35, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(7), category: 'coding', title: 'Fix pagination bug in activity log', description: 'Off-by-one error causing last page to show duplicates', tokens_in: 800, tokens_out: 420, tokens_total: 1220, duration_minutes: 8, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(8), category: 'automation', title: 'Build Telegram notification bot', description: 'Sends daily summary of token usage to Telegram channel', tokens_in: 1600, tokens_out: 900, tokens_total: 2500, duration_minutes: 22, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(10), category: 'admin', title: 'Update npm dependencies', description: 'Security audit and updated all outdated packages', tokens_in: 500, tokens_out: 280, tokens_total: 780, duration_minutes: 6, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(12), category: 'other', title: 'Brainstorm feature roadmap', description: 'Free-form session exploring new dashboard features and integrations', tokens_in: 1200, tokens_out: 850, tokens_total: 2050, duration_minutes: 18, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(15), category: 'coding', title: 'Add Recharts visualizations', description: 'Integrated pie, bar and line charts for token analytics', tokens_in: 2800, tokens_out: 1400, tokens_total: 4200, duration_minutes: 38, model: 'claude-sonnet-4-6' },
  { timestamp: daysAgo(18), category: 'research', title: 'Explore Vercel deployment options', description: 'Tested serverless functions vs static export for React app', tokens_in: 980, tokens_out: 620, tokens_total: 1600, duration_minutes: 14, model: 'claude-sonnet-4-6' },
];

async function seed() {
  await TaskLog.deleteMany({});
  await TaskLog.insertMany(seeds);
  console.log(`✅ Seeded ${seeds.length} task logs`);
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); mongoose.disconnect(); });
