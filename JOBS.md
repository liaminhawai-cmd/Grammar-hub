# JOBS — Grammar Hub improvement queue

A prioritised backlog for future working sessions. Each job is scoped so a
fresh session can execute it without re-deriving context. Read `SPEC.md` and
`DESIGN_RULES.md` first; they define the lanes (content vs mechanics), the
palette/tokens, and what is out of scope.

## House rules (apply to every job)

- **Run `node validate.js` before every commit.** It grades every item's model
  answer against its own checker and structurally checks `clausePick` data.
  The pre-commit hook runs it too; do not bypass.
- **The anti-gaming test.** Before shipping any question or metalanguage item,
  ask: *could a student get this right by surface features alone — length,
  position, punctuation, or matching a word in the stimulus to a word on a
  bucket/option — without reading?* If yes, redesign it. Precedents:
  - "complete sentence" MCQ: the answer is short, a distractor is a long
    verbless fragment (`sentence-c1` items).
  - conditionals/subordination metalanguage: `clausePick` shows the full
    sentence, asks for either clause, puts the marked clause at the start in
    some items and the end in others.
  - relative/wh-word sorts: the giveaway word is blanked out of the chip
    (`relative-c1`, `question-c2` sorts).
- **No free writing.** Every skill item must be auto-checkable. `produce` is
  banned from banks (engine still supports it as a fallback only).
- **One lane per commit** (content in `data/*.js` vs mechanics in
  `engine.js`/`tasktypes.js`/`index.html`). AU spelling. Tokens, not hex.
  No new dependencies, no build step.

## Architecture cheat-sheet

- `data/skills.js` — content: `SKILLS` (cells with `vocab`, `worked`, `sort`
  or `clausePick`, `items`), `GOALS` (LI/SC per cell), `BANDS`, `CATEGORIES`,
  `POOLS`.
- `tasktypes.js` — task registry: identify, gapfill, choose, transform, join,
  order, match, **edit** (word swap + `allowInsert` gaps for commas/words).
- `engine.js` — selector matrix; teaching flow (intention → metalanguage
  [`clausePick` preferred, else `sort`, else vocab MCQ fallback] → worked
  examples → skill task → adaptive placement); revision flow; reports/exports.
- Teaching gates: metalanguage you-do requires `YOUDO_TARGET` (5) in a row
  with ≤1 error; skill task samples `SAMPLE_PER_SKILL` (2) items per level
  with a mastery loop.

---

## Progress log

- **2026-07-05 (Opus):** Done — ALL of P1. JOBS 1 (de-tell), 2 (clause-select
  rolled to sentence-c4, passive-c1, relative-c2 — six clausePick cells now),
  3 (placement exports), 4 (localStorage persistence + history + clear),
  5 (bank floor: every introduced cell ≥8; 266 items total, all valid),
  6 (meaning-change edits). Boot + mechanics verified in Chromium, no console
  errors. P2/P3 remain (curriculum toggle, accessibility, smart review using
  the new history data, sub-skill drilldown, pool UI, ARC links pending the
  teacher's scraper run).

## P1 — do these first

### 1. De-tell audit of the remaining metalanguage sorts — DONE (2026-07-05)
Fixed question-c1 (word order, no "?"), tense-c2 and tense-c4 (verb form is
now the only reliable signal). Remaining sorts were judged acceptable (the
signal is the actual grammar: modal word, be+participle, countability). If new
sorts are added, re-run the anti-gaming test. Historic detail below.
Some sorts can still be won on surface features. Audit every `sort` block in
`data/skills.js` against the anti-gaming test and fix with the blanking or
clause-select patterns. Known offenders:
- **question-c1** (Yes/No question vs Negative statement): the `?` alone
  decides it. Change the discrimination to something punctuation can't give
  away — e.g. sort by *what the sentence does*: "asks for yes/no" vs "asks for
  information" (mix in wh- questions), or blank the auxiliary and sort by
  which auxiliary fits (`Do/Does/Don't/Doesn't`).
- **tense-c2** (present perfect vs past simple): several past-simple chips
  carry time-adverb tells ("an hour ago", "last year", "in 2019") while the
  perfect chips don't. Balance: add past-simple items with no time word
  ("I finished it.") and perfect items with adverbs ("I have just eaten.").
- **tense-c1/c3/c4**: same audit — make sure no zone is identifiable by an
  adverb alone; the verb form must be the only reliable signal.
Verify each fix by asking: what's the dumbest strategy that still scores 100%?

### 2. Convert more strands to clause-select (`clausePick`) — DONE (2026-07-05)
relative-c2, sentence-c4, passive-c1 converted (plus the earlier cond-c1/c2,
sentence-c3). The select-the-whole-span mechanic (engine: `renderClausePick` /
`checkClauseSelection`) is data-driven; data shape:
`clausePick: { labels:{find:label}, hints:{find:hint},
modelled:[{words,find,span,explain}], items:[{words,find,span}] }`. Spans are
word-index ranges; punctuation tokens are inert; `validate.js` checks them.
Candidates for future conversion if desired: none obvious remain — most other
"things" are word-level, not span-level. Don't force it.

### 3. Exports on the placement screen — DONE (2026-07-05)
Placement screen has the export row; `studentName()`/`setCopyNote()` are
screen-agnostic (suffix `-P` ids).

### 4. Persistence (localStorage) — DONE (2026-07-05)
Key `grammarHub.v1`: `{v, name, mode, rowLevel, drillTarget, selectedPools,
history:[{date,skillId,right,total}]}`. Saved in `buildMatrix` (selection) and
at session end; restored on boot with rubric-mismatch filtering; try/catch
guarded; "Clear saved progress" link on the select screen. `history` feeds
job 13.

### 5. Bank floor: every cell to ≥8 skill items — DONE (2026-07-05)
Every introduced progression cell now has ≥8 items (266 total, all valid).
Additions are production-first (edit/transform/join/gapfill). The two "—" grid
cells (passive-c3, relative-c3) remain `introduced:false` and empty by design.
Next content step is depth, not floor: consider raising the floor to 10 for
the assessed strands, or splitting bundled cells' items more evenly by `tags`
so the sub-skill report (job 9) has enough per tag.

### 6. More meaning-change edit items — PARTIALLY DONE (2026-07-05)
Added coordination but→so and tense-c2 went→"has gone" (plus the earlier
Grandma comma and modality must→might). The `edit` type only supports ONE
active change at a time, so multi-token meaning flips (add commas on BOTH
sides for non-defining; shift both clauses of a conditional) do NOT fit yet —
either (a) extend the edit task to allow multiple simultaneous edits, or
(b) stick to single-token flips. Good remaining single-token candidates:
question wh-word swaps that change what's asked; modality may↔must
(permission vs obligation); article a↔the (first mention vs specific).
Prompts name the meaning shift, not the mechanical fix.

## P2 — next

### 7. Sort tiles in sentence context
The word-class sorter shows the draggable word *inside its sentence*; our
`sort` shows a bare tile. Extend sort items with optional
`context:[before, after]` rendered as plain text around the tile
(`renderSortPractice` in engine.js). Content can then use richer, harder items.

### 8. Curriculum toggle (EAL v1 / Victorian Curriculum v2) — BUILT, MAPPING IS DRAFT (2026-07-05, Fable)
UPDATE (teacher direction): the app's sequence is the pedagogical spine; VC
codes are best-fit reporting labels that never reshape it. CURRICULUM-MAP.md
carries the "Which scheme leads?" principle and a per-strand evidence base
(Pienemann; Bardovi-Harlig; Keenan & Comrie/Doughty; Spada & Lightbown;
Myhill et al.; Rosenshine) justifying the finer-grained sequencing.
UPDATE 2 (teacher direction): the toggle is a STUDENT-FACING audience switch,
not a curriculum overlay. EAL view = C-level grid; non-EAL view = the same
skills re-chunked per strand with YEAR-LEVEL labels and plain titles
(VIC_CHUNKS in data/curriculum.js; rows are 4/2/1/2/2/3/3/3 chunks — not
forced into 4 columns). No curriculum codes anywhere in the student UI;
in-session band labels become "Step 1–4" in the non-EAL view; teaching mode
targets a chunk's first step, revision practises all steps in a chunk; smart
review selects chunks in that view. Codes remain the documentation/reporting
record (VIC_MAP + CURRICULUM-MAP.md). Year-level tags still draft pending
sign-off.
UPDATE 3: multi-step chunks split — one chunk per teaching step, year
placements interpolated from the acquisition literature where VC is coarse
(present perfect 5–6 -> past perfect 7 -> future perfect 8; modals 3/4/6/7;
conditionals 4/5/7/8). validate.js enforces that a strand's year axis never
contradicts teaching order. Timeline is full-width with lane-stacking for
genuine overlaps.
Shipped: `data/curriculum.js` (VIC_MAP per cell + VIC_BANDS level spans, all
21 codes verified against the source docx files), an EAL/Vic toggle under the
mode filter (relabels headers, adds code chips with description tooltips,
adds a Vic line to preteach cards; persists; never touches mechanics), a
draft-warning legend, validate.js coverage check, and **CURRICULUM-MAP.md —
the sign-off table**. WAITING ON TEACHER: review the ≈ rows (conditionals,
passive, modality C3/C4, questions — VC 2.0 has no explicit descriptions for
these), then remove the draft wording per the instructions at the bottom of
CURRICULUM-MAP.md.

### 9. Sub-skill report drill-down
Bundled cells tag items by sub-skill; the report splits rows per tag but
"Practise next" links the whole cell. Route remediation per tag and let a
"Practise this again" button queue *only* the missed sub-skill's items.

### 10. Accessibility pass — DONE (2026-07-05, Opus)
- `aria-live="polite"` on all feedback regions (#feedback, #sortFeedback,
  #clauseFb, #metaFeedback, #copyNote/#copyNoteP).
- Sort zones are now real `<button>`s: drag OR tap/press a box to place the
  tile, so the sort works with keyboard and touch, not just pointer drag
  (clause-pick and edit were already button-based).
- Visible `:focus-visible` ring on every interactive task control; a
  `prefers-reduced-motion` block neutralises the drag/reveal transitions.
- Focus moves to the prompt (`tabindex=-1`) on each new task item; a type's
  `wire()` can still steal focus to its input (gapfill etc.).
Remaining polish if desired: focus-move on each preteach phase change (kept
light to avoid fighting the tap/drag flows); a "skip to content" link.

### 11. ARC lesson-plan links (BLOCKED on teacher)
Waiting on the scraped title/id/url/section TSV from `arc-scraper.html` (must
be run inside a logged-in DET browser). When it arrives: map rows to cells by
topic, append to each cell's `resources.sheets` as
`{name:"ARC: <title>", url}` — `resourceLabel()` already passes "ARC:"
prefixes through.

### 12. Practice-pool UI (SPEC §10)
Pools render as toggle chips but have no rubric presence or report treatment.
Give them a flat progress strip (items seen / correct first-try) below the
matrix and a distinct report section.

## P3 — later

13. **Smart review** — DONE (2026-07-05, Opus). "Review what you missed"
    button on the select screen (shown only when saved history has misses):
    ranks progression cells by first-try success from `history`, queues the
    4 weakest as a revision session, and starts it. Future polish: decay old
    results (recency weighting) toward a lighter spaced-repetition feel.
14. **TTS**: a speaker button on stimuli via `speechSynthesis` (en-AU voice
    when available) — big win for EAL listeners; no dependencies.
15. **Difficulty knobs**: teacher panel for `SAMPLE_PER_SKILL`,
    `YOUDO_TARGET`, `WEDO_COUNT` (persist with job 4).
16. **Item analytics**: log per-item miss rates into the history schema and
    add a teacher export ranking the most-missed items — feeds bank pruning.
17. **Multi-student profiles**: name-keyed saves on one device.
18. **Rules-based free-build task**: still deferred on purpose (SPEC §11).
    Do not start.
