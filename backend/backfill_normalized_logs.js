#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const { VALID_CATEGORIES, normalizeLogPayload } = require('./log_normalizer');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'zeth-dashboard' });

  const taskLogSchema = new mongoose.Schema({
    timestamp: { type: String, default: () => new Date().toISOString() },
    category: { type: String, enum: VALID_CATEGORIES, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    tokens_in: { type: Number, default: 0 },
    tokens_out: { type: Number, default: 0 },
    tokens_total: { type: Number, default: 0 },
    duration_minutes: { type: Number, default: 0 },
    model: { type: String, default: 'unknown' }
  }, { collection: 'task_logs' });

  const TaskLog = mongoose.model('TaskLogBackfill', taskLogSchema);
  const logs = await TaskLog.find();
  let updated = 0;

  for (const log of logs) {
    const normalized = normalizeLogPayload(log.toObject());
    const changed =
      normalized.category !== log.category ||
      normalized.model !== log.model ||
      normalized.title !== log.title ||
      normalized.description !== log.description ||
      normalized.tokens_in !== log.tokens_in ||
      normalized.tokens_out !== log.tokens_out ||
      normalized.tokens_total !== log.tokens_total ||
      normalized.duration_minutes !== log.duration_minutes;

    if (!changed) continue;

    await TaskLog.updateOne(
      { _id: log._id },
      {
        $set: {
          category: normalized.category,
          model: normalized.model,
          title: normalized.title,
          description: normalized.description,
          tokens_in: normalized.tokens_in,
          tokens_out: normalized.tokens_out,
          tokens_total: normalized.tokens_total,
          duration_minutes: normalized.duration_minutes,
        }
      }
    );
    updated += 1;
  }

  console.log(`Backfill complete. Updated ${updated} / ${logs.length} logs.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
