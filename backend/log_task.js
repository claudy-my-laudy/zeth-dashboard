#!/usr/bin/env node
/**
 * log_task.js - Log a completed task to the Zeth Dashboard
 * 
 * Usage:
 *   node log_task.js \
 *     --title "Built jina-reader skill" \
 *     --category coding \
 *     --tokens_in 5200 \
 *     --tokens_out 1800 \
 *     --duration 25 \
 *     --model "github-copilot/claude-sonnet-4.6" \
 *     --description "Created jina-reader skill with reader + search scripts"
 * 
 * Or via env vars: DASH_TITLE, DASH_CATEGORY, DASH_TOKENS_IN, DASH_TOKENS_OUT,
 *                  DASH_DURATION, DASH_MODEL, DASH_DESCRIPTION
 */

const https = require('https');

const API_URL = process.env.DASH_API_URL || 'https://zeth-dash-be.jheels.in';

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

function postLog(data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const url = new URL(`${API_URL}/api/logs`);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        if (res.statusCode === 201) resolve(JSON.parse(raw));
        else reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const args = parseArgs();
  
  const title = args.title || process.env.DASH_TITLE;
  const category = args.category || process.env.DASH_CATEGORY || 'other';
  const tokens_in = parseInt(args.tokens_in || process.env.DASH_TOKENS_IN || '0');
  const tokens_out = parseInt(args.tokens_out || process.env.DASH_TOKENS_OUT || '0');
  const tokens_total = tokens_in + tokens_out;
  const duration_minutes = parseInt(args.duration || process.env.DASH_DURATION || '0');
  const model = args.model || process.env.DASH_MODEL || 'unknown';
  const description = args.description || process.env.DASH_DESCRIPTION || '';

  if (!title) {
    console.error('Error: --title is required');
    process.exit(1);
  }

  const payload = {
    title,
    category,
    tokens_in,
    tokens_out,
    tokens_total,
    duration_minutes,
    model,
    description,
    timestamp: new Date().toISOString()
  };

  try {
    const result = await postLog(payload);
    console.log(`✅ Logged: "${title}" (${tokens_total} tokens, ${duration_minutes}min, ${model})`);
    console.log(`   ID: ${result._id}`);
  } catch (err) {
    console.error(`❌ Failed to log task: ${err.message}`);
    process.exit(1);
  }
}

main();
