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
const { normalizeLogPayload } = require('./log_normalizer');

const API_URL = 'https://zeth-dash-be.jheels.in';

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

  const normalized = normalizeLogPayload({
    title: hookData.title || process.env.TASK_TITLE || 'Unnamed task',
    description: hookData.description || process.env.TASK_DESCRIPTION || '',
    tokens_in: hookData.tokens_in || process.env.TOKENS_IN || '0',
    tokens_out: hookData.tokens_out || process.env.TOKENS_OUT || '0',
    duration_minutes: hookData.duration_minutes || process.env.DURATION || '0',
    model: hookData.model || process.env.MODEL || 'unknown',
    category: hookData.category,
    timestamp: new Date().toISOString()
  });

  if (!normalized.tokens_in && !normalized.tokens_out) {
    process.exit(0); // Nothing to log
  }

  try {
    await postLog(normalized);
    console.log(`[dashboard] Logged: ${normalized.title} (${normalized.tokens_total} tokens)`);
  } catch (err) {
    console.error(`[dashboard] Log failed: ${err.message}`);
  }
}

main();
