#!/usr/bin/env node
/**
 * GRAMMAR HUB — SANITY CHECK
 *
 * Validates that every item's model answer grades correctly against its own checker.
 * Intended to run as a pre-commit hook to catch bad content before it lands.
 *
 * Usage: node validate.js [--silent]
 * Exit code: 0 if all items valid, 1 if any fail
 */

const fs = require('fs');
const path = require('path');

// Mock DOM environment for tasktypes.js
const window = {
  TASK_TYPES: {},
  CustomEvent: class CustomEvent extends Event {
    constructor(type, eventInit) {
      super(type, eventInit);
      this.detail = eventInit?.detail;
    }
  }
};

global.window = window;

// Load skills data
const skillsCode = fs.readFileSync(path.join(__dirname, 'data/skills.js'), 'utf8');
eval(skillsCode);

// Load task types
const tasktypesCode = fs.readFileSync(path.join(__dirname, 'tasktypes.js'), 'utf8');
eval(tasktypesCode);

const silent = process.argv.includes('--silent');
let errorCount = 0;
let itemCount = 0;

// Validate each skill and item
window.SKILLS.forEach((skill) => {
  if (!skill.items || !Array.isArray(skill.items)) return;

  skill.items.forEach((item, idx) => {
    itemCount++;
    const type = window.TASK_TYPES[item.type];

    if (!type) {
      console.error(`❌ [${skill.id}] Item ${idx}: unknown type "${item.type}"`);
      errorCount++;
      return;
    }

    if (typeof type.check !== 'function') {
      console.error(`❌ [${skill.id}] Item ${idx}: type "${item.type}" has no check function`);
      errorCount++;
      return;
    }

    // Determine the model answer (the response that MUST grade correct).
    // Each autograded type exposes its own canonical answer field.
    let modelAnswer = null;
    if (item.type === 'identify' || item.type === 'choose' || item.type === 'order') {
      modelAnswer = item.answer;
    } else if (item.type === 'gapfill' || item.type === 'transform' || item.type === 'join' || item.type === 'edit') {
      modelAnswer = item.accept?.[0];
    } else if (item.type === 'match') {
      // match has no scalar answer: the model response is the identity pairing.
      modelAnswer = (item.pairs || []).map((_, i) => [i, i]);
    } else if (item.type === 'produce') {
      // free response, no auto-grade — nothing to verify.
      return;
    } else {
      console.error(`❌ [${skill.id}] Item ${idx}: type "${item.type}" not covered by sanity check`);
      errorCount++;
      return;
    }

    if (modelAnswer === null || modelAnswer === undefined) {
      console.error(`❌ [${skill.id}] Item ${idx}: no model answer found`);
      errorCount++;
      return;
    }

    // Run the checker
    const result = type.check(item, modelAnswer);
    if (!result || typeof result.correct !== 'boolean') {
      console.error(`❌ [${skill.id}] Item ${idx}: check() returned invalid result`, result);
      errorCount++;
      return;
    }

    if (!result.correct) {
      console.error(`❌ [${skill.id}] Item ${idx}: model answer "${modelAnswer}" does not grade as correct`);
      if (!silent) {
        console.error(`   Expected: ${result.expected}`);
        console.error(`   Item: type="${item.type}"`);
      }
      errorCount++;
    }
  });
});

// Report
if (!silent) {
  if (errorCount === 0) {
    console.log(`✓ All ${itemCount} items valid`);
  } else {
    console.log(`✗ ${errorCount} of ${itemCount} items failed validation`);
  }
}

process.exit(errorCount > 0 ? 1 : 0);
