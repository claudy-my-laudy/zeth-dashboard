const VALID_CATEGORIES = ['coding', 'research', 'writing', 'automation', 'admin', 'other'];

const CATEGORY_KEYWORDS = {
  coding: ['build', 'code', 'deploy', 'npm', 'git', 'push', 'install', 'script', 'backend', 'frontend', 'api', 'react', 'express', 'fix', 'bug', 'skill', 'package', 'vercel', 'github', 'dashboard', 'mongo', 'database'],
  research: ['search', 'read', 'fetch', 'rss', 'brief', 'news', 'article', 'jina', 'web', 'research', 'find', 'look up', 'investigate', 'analyze'],
  writing: ['write', 'draft', 'summary', 'summarize', 'document', 'readme', 'blog', 'report', 'memo', 'notes'],
  automation: ['cron', 'heartbeat', 'automate', 'schedule', 'reminder', 'daily', 'monitor', 'hook', 'pm2', 'workflow', 'bot'],
  admin: ['config', 'setup', 'configure', 'nginx', 'ssl', 'cert', 'key', 'token', 'auth', 'password', 'permission', 'access', 'restart'],
};

function inferCategory(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) return category;
  }
  return 'other';
}

function normalizeCategory(category, title = '', description = '') {
  const cleaned = String(category || '').trim().toLowerCase();
  if (VALID_CATEGORIES.includes(cleaned) && cleaned !== 'other') return cleaned;
  return inferCategory(title, description);
}

function normalizeModel(model) {
  let raw = String(model || '').trim();
  if (!raw) return 'unknown';

  let provider = '';
  let modelId = raw;
  if (raw.includes('/')) {
    const parts = raw.split('/');
    provider = parts.shift().trim().toLowerCase();
    modelId = parts.join('/').trim().toLowerCase();
  } else {
    modelId = raw.toLowerCase();
  }

  modelId = modelId
    .replace(/\s+/g, '-')
    .replace(/\.(?=\d)/g, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-');

  // Canonicalize a few common aliases/typos.
  const aliasMap = new Map([
    ['claude-sonnet-4.6', 'claude-sonnet-4-6'],
    ['claude-opus-4.6', 'claude-opus-4-6'],
    ['claude-haiku-4.5', 'claude-haiku-4-5'],
    ['gpt5.4', 'gpt-5-4'],
    ['gpt-5.4', 'gpt-5-4'],
  ]);
  modelId = aliasMap.get(modelId) || modelId;

  if (!provider && modelId.startsWith('gpt-')) provider = 'openai';
  if (!provider && modelId.startsWith('claude-')) provider = 'anthropic';

  return provider ? `${provider}/${modelId}` : modelId;
}

function normalizeLogPayload(payload = {}) {
  const title = String(payload.title || '').trim();
  const description = String(payload.description || '').trim();
  const tokens_in = Number.parseInt(payload.tokens_in ?? 0, 10) || 0;
  const tokens_out = Number.parseInt(payload.tokens_out ?? 0, 10) || 0;
  const tokens_total = Number.parseInt(payload.tokens_total ?? (tokens_in + tokens_out), 10) || (tokens_in + tokens_out);
  const duration_minutes = Number.parseInt(payload.duration_minutes ?? payload.duration ?? 0, 10) || 0;
  const category = normalizeCategory(payload.category, title, description);
  const model = normalizeModel(payload.model);

  return {
    ...payload,
    title,
    description,
    category,
    model,
    tokens_in,
    tokens_out,
    tokens_total,
    duration_minutes,
  };
}

module.exports = {
  VALID_CATEGORIES,
  inferCategory,
  normalizeCategory,
  normalizeModel,
  normalizeLogPayload,
};
