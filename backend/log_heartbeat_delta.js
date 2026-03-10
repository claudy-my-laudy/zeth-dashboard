#!/usr/bin/env node
/**
 * log_heartbeat_delta.js
 * Logs a conversation/activity batch to Zeth Dashboard (MongoDB).
 * Called during heartbeats after scanning session history for new activity.
 *
 * Usage:
 *   node log_heartbeat_delta.js \
 *     --title "Conversation: dashboard cleanup, removed delete button" \
 *     --description "Removed Add Log and Delete buttons, wired heartbeat logger" \
 *     --category "coding" \
 *     --tokens_in 229 \
 *     --tokens_out 1900 \
 *     --duration 45 \
 *     --model "opencode/claude-sonnet-4-6"
 *
 * State tracked in: workspace/memory/heartbeat-state.json
 * Skips logging if no messages since lastLoggedAt (pass --force to override).
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.DASH_API_URL || 'https://zeth-dash-be.jheels.in';
const STATE_FILE = path.join(__dirname, '../../memory/heartbeat-state.json');

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

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastLoggedAt: null };
  }
}

function writeState(patch) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const current = readState();
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...current, ...patch }, null, 2));
}

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

async function main() {
  const args = parseArgs();

  const title       = args.title       || process.env.TASK_TITLE       || 'Heartbeat activity';
  const description = args.description || process.env.TASK_DESCRIPTION || '';
  const category    = args.category    || process.env.TASK_CATEGORY    || 'other';
  const tokens_in   = parseInt(args.tokens_in  || process.env.TOKENS_IN  || '0');
  const tokens_out  = parseInt(args.tokens_out || process.env.TOKENS_OUT || '0');
  const duration    = parseInt(args.duration   || process.env.DURATION   || '0');
  const model       = args.model || process.env.MODEL || 'unknown';

  const state = readState();

  // Print last logged time for reference
  if (state.lastLoggedAt) {
    console.log(`[heartbeat-logger] Last logged: ${state.lastLoggedAt}`);
  }

  try {
    const result = await postLog({
      title,
      description,
      category,
      tokens_in,
      tokens_out,
      tokens_total: tokens_in + tokens_out,
      duration_minutes: duration,
      model,
      timestamp: new Date().toISOString()
    });

    writeState({ lastLoggedAt: new Date().toISOString() });

    console.log(`[heartbeat-logger] ✅ Logged: "${title}" (${tokens_in + tokens_out} tokens, ${duration}min) → ID: ${result._id}`);
  } catch (err) {
    console.error(`[heartbeat-logger] ❌ Failed: ${err.message}`);
    process.exit(1);
  }
}

main();
