#!/usr/bin/env node
/**
 * log_heartbeat_delta.js
 * Called during every heartbeat to auto-log token usage deltas to Zeth Dashboard (MongoDB).
 *
 * Usage:
 *   node log_heartbeat_delta.js \
 *     --tokens_in 12000 \
 *     --tokens_out 3500 \
 *     --model "opencode/claude-sonnet-4-6" \
 *     --title "Optional title override" \
 *     --description "Optional description override"
 *
 * State is tracked in: workspace/memory/heartbeat-state.json
 * Min delta to log: 500 tokens (configurable via MIN_DELTA env var)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.DASH_API_URL || 'https://zeth-dash-be.jheels.in';
const STATE_FILE = path.join(__dirname, '../../memory/heartbeat-state.json');
const MIN_DELTA = parseInt(process.env.MIN_DELTA || '500');

// ── Arg parser ────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      result[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return result;
}

// ── State helpers ─────────────────────────────────────────────────────────────
function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastLoggedTokensIn: 0, lastLoggedTokensOut: 0, lastLoggedAt: null };
  }
}

function writeState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...readState(), ...state }, null, 2));
}

// ── Dashboard POST ────────────────────────────────────────────────────────────
function postLog(data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const url = new URL(`${API_URL}/api/logs`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () =>
        res.statusCode === 201 ? resolve(JSON.parse(raw)) : reject(new Error(`${res.statusCode}: ${raw}`))
      );
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Auto-categorize ───────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  coding:     ['build', 'code', 'deploy', 'npm', 'git', 'push', 'install', 'script', 'backend', 'frontend', 'api', 'react', 'fix', 'bug', 'skill', 'vercel', 'github'],
  research:   ['search', 'read', 'fetch', 'rss', 'brief', 'news', 'article', 'web', 'research', 'find'],
  writing:    ['write', 'draft', 'summary', 'summarize', 'document', 'readme', 'blog', 'report'],
  automation: ['cron', 'heartbeat', 'automate', 'schedule', 'reminder', 'daily', 'monitor', 'hook', 'pm2'],
  admin:      ['config', 'setup', 'configure', 'nginx', 'ssl', 'cert', 'key', 'token', 'auth'],
};

function categorize(text = '') {
  const t = text.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(k => t.includes(k))) return cat;
  }
  return 'other';
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();

  const currentIn  = parseInt(args.tokens_in  || process.env.TOKENS_IN  || '0');
  const currentOut = parseInt(args.tokens_out || process.env.TOKENS_OUT || '0');
  const model      = args.model || process.env.MODEL || 'unknown';
  const title      = args.title || process.env.TASK_TITLE || null;
  const description = args.description || process.env.TASK_DESCRIPTION || '';

  if (!currentIn && !currentOut) {
    console.log('[heartbeat-logger] No token data provided, skipping.');
    process.exit(0);
  }

  const state = readState();
  const deltaIn  = Math.max(0, currentIn  - (state.lastLoggedTokensIn  || 0));
  const deltaOut = Math.max(0, currentOut - (state.lastLoggedTokensOut || 0));
  const deltaTotal = deltaIn + deltaOut;

  if (deltaTotal < MIN_DELTA) {
    console.log(`[heartbeat-logger] Delta too small (${deltaTotal} tokens), skipping.`);
    process.exit(0);
  }

  // Calculate duration since last log
  const now = Date.now();
  const lastAt = state.lastLoggedAt ? new Date(state.lastLoggedAt).getTime() : now;
  const durationMinutes = Math.round((now - lastAt) / 60000);

  const finalTitle = title || `Heartbeat batch (${new Date().toUTCString().slice(0, 16)})`;
  const category   = categorize(finalTitle + ' ' + description);

  try {
    const result = await postLog({
      title: finalTitle,
      description: description || `Auto-logged ${deltaTotal} tokens via heartbeat delta (in: ${deltaIn}, out: ${deltaOut})`,
      category,
      tokens_in: deltaIn,
      tokens_out: deltaOut,
      tokens_total: deltaTotal,
      duration_minutes: durationMinutes,
      model,
      timestamp: new Date().toISOString()
    });

    // Update state only on success
    writeState({
      lastLoggedTokensIn:  currentIn,
      lastLoggedTokensOut: currentOut,
      lastLoggedAt: new Date().toISOString()
    });

    console.log(`[heartbeat-logger] ✅ Logged: "${finalTitle}" (${deltaTotal} tokens, ${durationMinutes}min) → ID: ${result._id}`);
  } catch (err) {
    console.error(`[heartbeat-logger] ❌ Failed: ${err.message}`);
    process.exit(1);
  }
}

main();
