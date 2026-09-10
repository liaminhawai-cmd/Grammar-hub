# Grammar Hub — SPEC

The brief. Read this and DESIGN_RULES.md before touching anything.

## 1. What this is

A single-page grammar practice hub for the ELC, modelled on the Aussie Phonics
Trainer. One shell, a data spine, a state machine, swappable task types, and a
report that turns misses into targeted follow-up. The whole ELC grammar sequence is
visible at once as a rubric matrix; a teacher or student picks any cell, drills it
with a mastery loop, and gets a first-try report.

## 2. The one principle

**The engine knows nothing about grammar.** It runs whatever is in `data/skills.js`,
dispatching each item to a handler in `tasktypes.js`. Growing the app is almost always
one of two jobs, in separate lanes (see DESIGN_RULES.md §0):

- add items to a skill node in `data/skills.js` (content lane)
- add a task type in `tasktypes.js` (mechanics lane)

Neither requires editing `engine.js`.

## 3. Files and load order

```
index.html        shell: markup, styling, design tokens in :root. Loads in order:
data/skills.js      content. window.SKILLS, window.BANDS, window.CATEGORIES, window.POOLS
tasktypes.js        task-type registry (render + grade per type)
engine.js           state machine: selector, drill loop, mastery rounds, report
DESIGN_RULES.md   the shared constitution. Lanes, tokens, fonts, what's out of scope.
content-prompt.md paste-in prompt to generate items to schema (content lane)
reference/        the artifacts this was modelled on (phonics, Holly's quiz, sentence builder)
```

Plain `<script src>` with `window` globals on purpose: no build step, opens by
double-click and in Claude Code's preview server. Keep it that way (DESIGN_RULES §7).

## 4. Canonical mapping = the Grammar Pre-Test Marking Grid

The marking grid is the source of truth, not the older sequence doc. The pretest tests
to the grid and teachers circle it, so the rubric must match it or the paper-to-app
handoff breaks.

- **Bands: C1, C2, C3, C4/C4+** (four columns; the grid merges C4 and C4+). Do not
  reintroduce a separate C4+ column.
- **Eight progression strands** (mastery-tracked, shown in the matrix):

| Strand | C1 | C2 | C3 | C4/C4+ |
|---|---|---|---|---|
| Sentence Structure | Basic SVO | Coordination | Subordination | Cleft/Emphatic |
| Verb Tenses | Pres Simple/Cont, Past Simple | Present Perfect | Past Perfect/Prog | Future Prog/Perfect |
| Modality | Must/Can | May/Might | Modal Perfect | Modal Progressive |
| Conditionals | Zero | First | Second | Third & Mixed/Unreal |
| Passive Voice | Intro | Present/Past | — | Reporting |
| Relative Clauses | Intro (who/which) | Defining/Non-def | — | Non-def + Reduced |
| Agreement & Number* | Subject–Verb Agreement | Reg/Irreg Plurals | Count/Uncount & Quantifiers | Collective/Complex |
| Questions & Negation* | Yes/No & Negation | Wh- Questions | Inversion & Tags | Indirect/Embedded |

\* Added strands. `assessed:false` until the pretest is extended to cover them; until
then they are drillable but have no paper pretest data to seed the rubric from.

- **Two pools** (NOT mastery-tracked, excluded from the matrix): **Prepositions**,
  **Articles**. These don't band cleanly into a progression, so they are flat practice
  banks. Their rubric/UI rendering is a roadmap item (§10); data exists now.

The "—" cells (Passive C3, Relative C3) are `introduced:false`: greyed, not drillable.

**Curriculum overlay:** the C1–C4 bands ARE the EAL curriculum and the
pedagogical spine. The Vic Curriculum toggle attaches best-fit VC2E codes for
reporting only; labels never reshape the sequence. Sequencing rationale and
its evidence base (acquisition-order literature): CURRICULUM-MAP.md.

## 5. Task-type library

Each type is render + grade. All of these are built and auto-checked by
`validate.js`; `produce` remains only as the engine's fallback for an unknown type
and is banned from banks (JOBS house rules).

| Type | What it is |
|---|---|
| `identify` | MCQ, name the feature |
| `gapfill` | type the correct form into a blank |
| `choose` | MCQ, pick the correct sentence |
| `order` | put scrambled words in order |
| `join` | combine two sentences with a target connective |
| `transform` | rewrite a sentence to a target form |
| `edit` | one sentence, one change: swap a word, or insert a word/comma |
| `match` | pair sentences with the meaning a small change gives them |
| `passage` | a longer text (paragraph, dialogue, book excerpt): find and fix several errors, or re-purpose a correct text to a new goal |
| `produce` | free written response; fallback only, not for banks |

### Interface

```js
{
  label,
  render(item) -> htmlString,
  collect(root) -> response | null,
  check(item, response) -> { correct, expected },
  mark(root, item, result),   // optional: paint right/wrong
  wire(root)                  // optional: input listeners
}
```

`wire(root)` dispatches `gh:ready` (bubbling) when an answer is available so the engine
enables Check, and may dispatch `gh:submit` on Enter. The engine owns the prompt line,
Check/Next, the feedback panel, scoring, and the mastery loop. A type owns one item's
input and grading only. Types never call each other (DESIGN_RULES §1).

## 6. Data schema

Skill node:

```js
{ id, category, band, name, example, introduced, mode, assessed, resources, items }
```

- `category` = strand name. Matches a CATEGORIES entry for progression strands; pools
  are excluded from CATEGORIES and have `band:null`.
- `band` = "C1" | "C2" | "C3" | "C4/C4+" (null for pools).
- `mode` = "progression" | "pool".
- `assessed` = true if the current pretest covers it (drives the paper handoff).
- `resources` = remediation hook, null for now: `{ video, sheets:[{name,url}] }`.
  Populate with the OneDrive textbook links per cell when available (phonics model).
- `items` = task items.

Item shapes:

```js
// identify
{ type:"identify", prompt, sentence /* <b> around target */, options:[...], answer, explain, tags:[...] }
// gapfill
{ type:"gapfill", prompt, before, after, cue, accept:[...], explain, tags:[...] }
// passage
{ type:"passage", prompt,
  lines:[ { who, text, accept:[...] },   // editable: `accept` lists every correct version of THIS line
          { who, text } ],               // read-only context (a recast, a narrator); `who` optional
  bank:[...],                            // shared replacements, incl. decoys; exact spelling/case as inserted
  allowInsert,                           // true: gaps between words take a word or comma
  source:{ title, author, year, note },  // optional attribution; note:"adapted" if simplified
  explain, tags:[...] }
```

Passage rules (content lane):

- The unit of grading is the whole editable line: every error fixed, every sound
  word left alone. `accept` must list each valid corrected line in full.
- A passage lives in one cell and its errors are that cell's grammar. It may carry
  one or two extra errors from a **lower band** of any strand (a C3 tense passage
  may include a C1 agreement slip); never the same band or above. Pool passages
  (articles, prepositions) may mix freely.
- Put decoys in the passage, not only the bank: a correct word that looks wrong
  (`read` as a past form) is what makes the task a reading task.
- Tap-and-replace substitutes, inserts and deletes; it cannot **move** a word.
  Word-order errors belong in `order`, not `passage`.
- Book excerpts must be public domain in Australia (author died before 1955).
  Simplify freely and mark `note:"adapted"`. Mentioning a modern title in a
  dialogue is fine; quoting it is not.
- A fluent-speaker line never corrects the learner; it models the form
  (a recast). The learner's lines carry only the target errors, nothing else
  non-standard, so the character reads as a learner, not a caricature.

`tags`: sub-skill labels. Bundled cells (e.g. Present Simple/Continuous) MUST tag each
item by sub-skill so the report can diagnose which half was missed. Grading normalises
typed answers (lowercase, strip apostrophes, collapse spaces, drop trailing
punctuation); always include contraction variants in `accept`.

## 7. Drill and report

**Mastery loop** (from Holly's quiz): every selected item is answered once; missed items
return in mastery rounds until all correct. The report scores **first try**.

**Report** does:
1. performance: first-try score overall and per skill
2. teacher export: plain-text summary to clipboard
3. remediation hook: skills below 100% first-try are listed under "Practise next". If a
   node has `resources`, they link; otherwise it says "no resources mapped yet". Filling
   `resources` later is additive, no schema change. **Decision: shipped performance-first
   with the hook in place, because the per-skill resource library doesn't exist yet.**

With `tags`, the per-skill breakdown can later split a bundled cell into sub-skills
(roadmap §10).

## 8. The correctness risk

Tense, modal, conditional and article items are where a generator emits a subtly wrong
key or an ambiguous distractor. Manual review doesn't scale. Before bulk content lands,
run the sanity check (README): every item's model answer must grade correct against its
own checker. For `identify`, no distractor may also be defensible. For `gapfill`,
`accept` must cover contractions and spelling variants.

## 9. Division of labour

- **Mechanics (Claude Code):** stub task types, engine changes, pool/assessed UI,
  resource routing once resources exist.
- **Content (ChatGPT/Codex or Copilot):** items for empty nodes, generated to §6 via
  content-prompt.md, committed to `data/skills.js`. Never touches engine/task-type code.

Partition by type of work, not file ownership. Lock the schema (this doc) before
generating, or reformatting costs more than writing. Lanes enforced in DESIGN_RULES §0.

## 10. Roadmap (in order)

1. Build `choose` (closest to `identify`, fast win).
2. Render the two pools (Prepositions, Articles) as flat practice banks below the matrix.
3. Mark `assessed:false` strands visually in the rubric (so the paper handoff is honest).
4. Split bundled-cell reporting by `tags`.
5. Build `transform` and `join` (tolerant compare; start strict, loosen via accept lists).
6. Build `order`, then `produce` (no auto-grade; capture response into the report).
7. Populate `resources` per cell (OneDrive links), switch "Practise next" to live links.
8. Add a validation script to a pre-commit / CI check.
9. Decide rubric semantics: clicking your level = consolidate at it (default) vs stretch
   to the next band. Report says "ready to move up" when a level is clean.

## 11. Deferred: the rules-based build task (NOT NOW)

A multi-skill "free build" task (type a sentence meeting several requirements; check
subordinator + tense + plural at once over a closed, coded vocab list) is the eventual
ambition. It is deferred on purpose. When built it must be **one isolated module** of
independent per-constraint checker functions, sitting alongside the static banks, so a
bug in it can never break them. Vocab comes from a build-time lemma+POS → forms expander
(LemmInflect / pyinflect / AGID) dumping JSON the browser reads; no model tokens, no
runtime NLP. See the conversation notes. Do not start this until the modular v1 is solid.

## 12. Direct skill links

Other ELC tools may link to a stable skill ID with query parameters:

- `?skill=tense-c2` opens that cell in teaching mode and leaves the learner on
  the selector so the choice is visible.
- `?skill=tense-c2&mode=revision` selects that level in revision mode. The
  normal revision rule still includes the preceding level when one exists.
- `?skill=tense-c2&start=1` starts the selected teaching cycle immediately.
- Pool IDs such as `?skill=prep-pool` select that pool in revision mode.

A valid `skill` value overrides saved selector state and uses the source-of-truth
EAL view. A missing, unknown, empty or non-drillable skill leaves restored state
untouched. IDs come from `window.SKILLS`; display names are not URL contracts.

## 13. Conventions

See DESIGN_RULES.md. In short: AU spelling, no em dashes in UI copy, shared phonics
palette and Georgia-serif headers, tokens not hex, no new fonts/deps, comments state
intent, one lane per commit.
