#!/usr/bin/env node
/**
 * OpenClaw post-turn hook: auto-logs token usage to Zeth Dashboard
 * 
 * Reads token usage from the OpenClaw command-logger hook output,
 * categorizes the task, and POSTs to the dashboard backend.
 * 
 * Install: add to openclaw hooks config or call from HEARTBEAT
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://zeth-dash-be.jheels.in';
const STATE_FILE = path.join(__dirname, '.last_logged_session.json');

// Keywords to auto-categorize tasks
const CATEGORY_KEYWORDS = {
  coding: ['build', 'code', 'deploy', 'npm', 'git', 'push', 'install', 'script', 'backend', 'frontend', 'api', 'react', 'express', 'fix', 'bug', 'skill', 'package', 'vercel', 'github'],
  research: ['search', 'read', 'fetch', 'rss', 'brief', 'news', 'article', 'jina', 'web', 'research', 'find', 'look up'],
  writing: ['write', 'draft', 'summary', 'summarize', 'document', 'readme', 'blog', 'report', 'memo'],
  automation: ['cron', 'heartbeat', 'automate', 'schedule', 'reminder', 'daily', 'monitor', 'hook', 'pm2'],
  admin: ['config', 'setup', 'configure', 'nginx', 'ssl', 'cert', 'key', 'token', 'auth', 'password'],
};

function categorize(title = '', description = '') {
  const text = (title + ' ' + description).toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return 'other';
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
      res.on('end', () => res.statusCode === 201 ? resolve(JSON.parse(raw)) : reject(new Error(`${res.statusCode}: ${raw}`)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // Read stdin (OpenClaw hook passes JSON context)
  let input = '';
  if (!process.stdin.isTTY) {
    for await (const chunk of process.stdin) input += chunk;
  }

  let hookData = {};
  try { hookData = JSON.parse(input); } catch {}

  const title = hookData.title || process.env.TASK_TITLE || 'Unnamed task';
  const description = hookData.description || process.env.TASK_DESCRIPTION || '';
  const tokens_in = parseInt(hookData.tokens_in || process.env.TOKENS_IN || '0');
  const tokens_out = parseInt(hookData.tokens_out || process.env.TOKENS_OUT || '0');
  const duration_minutes = parseInt(hookData.duration_minutes || process.env.DURATION || '0');
  const model = hookData.model || process.env.MODEL || 'unknown';
  const category = hookData.category || categorize(title, description);

  if (!tokens_in && !tokens_out) {
    process.exit(0); // Nothing to log
  }

  try {
    await postLog({
      title, description, category,
      tokens_in, tokens_out,
      tokens_total: tokens_in + tokens_out,
      duration_minutes, model,
      timestamp: new Date().toISOString()
    });
    console.log(`[dashboard] Logged: ${title} (${tokens_in + tokens_out} tokens)`);
  } catch (err) {
    console.error(`[dashboard] Log failed: ${err.message}`);
  }
}

main();
