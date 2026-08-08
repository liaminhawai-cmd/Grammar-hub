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

// curriculum mapping coverage: every introduced progression cell needs a
// VIC_MAP entry with a well-formed VC2E code (the toggle shows these).
const curricCode = fs.readFileSync(path.join(__dirname, 'data/curriculum.js'), 'utf8');
eval(curricCode);
window.SKILLS.forEach((skill) => {
  if (skill.mode !== 'progression' || !skill.introduced) return;
  const list = (window.VIC_MAP || {})[skill.id];
  const ok = Array.isArray(list) && list.length &&
    list.every((v) => /^VC2E([0-9]{1,2}|F)[A-Z]{2}\d{2}$/.test(v.code) && v.label);
  if (!ok) {
    console.error(`❌ [${skill.id}] missing/malformed VIC_MAP entry`);
    errorCount++;
  }
});

// VIC_CHUNKS coverage: chunks reference real introduced skills of their own
// strand, and every introduced progression cell sits in exactly one chunk.
{
  const covered = {};
  Object.entries(window.VIC_CHUNKS || {}).forEach(([cat, chunks]) => {
    chunks.forEach((ch, idx) => {
      if (!ch.title || !ch.years || !Array.isArray(ch.covers) || !ch.covers.length) {
        console.error(`❌ VIC_CHUNKS ${cat}#${idx}: missing title/years/covers`); errorCount++;
      }
      if (!(Number.isInteger(ch.y0) && Number.isInteger(ch.y1) && ch.y0 >= 0 && ch.y1 <= 10 && ch.y0 <= ch.y1)) {
        console.error(`❌ VIC_CHUNKS ${cat}#${idx}: bad year span y0/y1`); errorCount++;
      }
      (ch.covers || []).forEach((id) => {
        const sk = window.SKILLS.find((s) => s.id === id);
        if (!sk || !sk.introduced || sk.category !== cat) {
          console.error(`❌ VIC_CHUNKS ${cat}#${idx}: bad covers id "${id}"`); errorCount++;
        }
        covered[id] = (covered[id] || 0) + 1;
      });
    });
  });
  window.SKILLS.forEach((skill) => {
    if (skill.mode !== 'progression' || !skill.introduced) return;
    if ((covered[skill.id] || 0) !== 1) {
      console.error(`❌ [${skill.id}] covered by ${covered[skill.id] || 0} VIC_CHUNKS (want exactly 1)`); errorCount++;
    }
  });
  // sequence logic: within a strand, year placement must never contradict the
  // teaching order (a later band may not sit earlier on the year axis)
  Object.entries(window.VIC_CHUNKS || {}).forEach(([cat, chunks]) => {
    const byTeach = chunks.slice().sort((a, b) => {
      const band = (ch) => {
        const sk = window.SKILLS.find((s) => s.id === ch.covers[0]);
        return sk ? window.BANDS.indexOf(sk.band) : 0;
      };
      return band(a) - band(b);
    });
    for (let i = 1; i < byTeach.length; i++) {
      if (byTeach[i].y0 < byTeach[i - 1].y0) {
        console.error(`❌ VIC_CHUNKS ${cat}: "${byTeach[i].title}" (y0=${byTeach[i].y0}) sits earlier than "${byTeach[i - 1].title}" (y0=${byTeach[i - 1].y0}) but is taught later`);
        errorCount++;
      }
    }
  });
}

// clausePick structural checks (metalanguage select-the-clause data)
window.SKILLS.forEach((skill) => {
  const cp = skill.clausePick;
  if (!cp) return;
  (cp.modelled || []).concat(cp.items || []).forEach((it, idx) => {
    const ok = Array.isArray(it.words) && Array.isArray(it.span) &&
      it.span[0] >= 0 && it.span[1] < it.words.length && it.span[0] <= it.span[1];
    if (!ok) { console.error(`❌ [${skill.id}] clausePick ${idx}: bad span`); errorCount++; }
    if (cp.labels && !cp.labels[it.find]) {
      console.error(`❌ [${skill.id}] clausePick ${idx}: find "${it.find}" has no label`); errorCount++;
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
