# DESIGN_RULES.md — read before editing anything

This is a shared repo worked on by more than one model/person (Claude Code for
mechanics, ChatGPT/Codex for content). These rules keep it from drifting into a
mess. They are not suggestions. If a rule blocks you, raise it, don't route around it.

---

## 0. The lane rule (most important)

| You are doing… | You may edit | You must NOT edit |
|---|---|---|
| Adding questions / content | `data/skills.js` only | engine.js, tasktypes.js, index.html |
| Adding a task type | `tasktypes.js` (+ a stub note in SPEC) | engine.js, other task types |
| Engine / screens / report | `engine.js`, `index.html` | content in data/, task-type internals |
| Design tokens | the `:root` block in `index.html` only | nothing else for a token change |

One commit does one job in one lane. A content commit that also touches engine.js
gets rejected. This is what stops two contributors clobbering each other.

---

## 1. Modularity contract

- A **skill** is one node in `window.SKILLS`. Self-contained. Adding or removing one
  never affects another.
- A **task type** is one object in `window.TASK_TYPES` implementing the interface in
  SPEC.md §5. Self-contained. Types never call each other.
- The **engine owns shuffling, scoring, the mastery loop, and the report.** Content
  provides plain arrays; never put ordering, scoring, or DOM logic in `data/skills.js`.
- Never add global state. Never reach across modules. If a task type needs a helper,
  it keeps its own copy or uses the shared helpers already at the top of tasktypes.js.

If one module breaks, nothing else may break. That is the whole point of going modular
instead of rules-based for now.

---

## 2. Colour — tokens only, never hex

All colour lives in the `:root` block of `index.html`. Use the variables. Never write a
raw hex value anywhere else.

```
--bg #f4efe6     page background          --accent #a83232  primary / targets / links
--paper #fbf7ee  card surface             --correct #2f6a3e right answers
--ink #1f1f1f    body text                --wrong #a83232   wrong answers
--muted #6b6256  secondary text           --okbg #eef5ee    correct background
--line #d8cfbb   borders                  --badbg #f7ecec   wrong background
--line-soft #e8e0cd  soft borders
```

This palette is shared with the Aussie Phonics Trainer on purpose: the two tools must
read as one suite. Do not introduce a new palette, gradients, or shadows beyond the
single card shadow already defined.

---

## 3. Typography — two fonts, fixed scale

- **Headings / stimulus / big numbers:** Georgia, 'Times New Roman', serif.
- **Everything else:** the system stack `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`.
- No third font. No web-font imports (offline classrooms, load speed).
- Sizes already in use, reuse them, don't invent: h1 23px, h3 15px, prompt 16px,
  stimulus 24px (gap 21px), option 15px, body 13–15px, big-stat 46px.

---

## 4. Spacing, borders, radius

- Radius: cards/inputs 8–12px, pills 14–20px. Nothing sharp, nothing rounder.
- Borders: 1px `--line` default, 2px `--accent` for the active/selected state.
- Reuse existing component classes (`.btn`, `.btn-primary`, `.btn-ghost`, `.option`,
  `.stimulus`, `.feedback`, `.matrix-cell`, `.skill-row`). Do not create a parallel
  button or card style. A new task type styles its input area with existing classes
  first; only add CSS if a genuinely new element exists, and put it with the others.

---

## 5. Content rules (for the content lane)

- **Canonical mapping is the marking grid.** 4 bands: C1, C2, C3, C4/C4+. 8 progression
  strands + 2 pools. Do not re-add a separate C4+ column. Do not move a skill to a
  different band than the grid without changing the grid and the pretest first.
- Every item needs `tags`. In a bundled cell (e.g. Present Simple/Continuous) tag which
  sub-skill each item targets so the report can diagnose the half that was missed.
- `identify`: exactly one defensible answer. No distractor may also be arguable.
- `gapfill`: `accept` must list every valid answer, lowercase, including contractions
  (`will go` AND `ll go`) and reasonable spellings.
- AU spelling. No em dashes in any learner-facing text.
- EAL Year 7 register: short, concrete, classroom-safe. Vary subjects and verbs.
- Before committing a content batch, run the sanity check (README) and confirm
  `key problems: 0`.

---

## 6. Accessibility floor (non-negotiable)

- Visible keyboard focus on every interactive element. Do not remove focus outlines.
- Tap targets >= 40px high (kids on touchscreens / whiteboards).
- Never signal correct/incorrect by colour alone; always pair with the ✓ / ✗ glyph and
  text, as the feedback panel already does.
- Respect `prefers-reduced-motion`: no animation longer than the existing 0.3s bar.

---

## 7. Things that are explicitly OUT for now

- **No rules-based sentence generator / multi-skill build task yet.** Deferred (SPEC §11).
  Build it later as ONE isolated module so it can't break the static banks.
- **No accounts, login, or backend.** Persistence, if added, is `localStorage` only, and
  only on the deployed site (it does not work in the Claude artifact sandbox).
- **No localStorage / sessionStorage in any artifact-previewed build.**
- **No new dependencies / frameworks / CDNs.** Plain HTML + JS, `window` globals, no
  build step, opens by double-click. Keep it that way until something forces otherwise.

---

## 8. Commit hygiene

- Small commits, one lane, present-tense message naming the lane and the thing:
  `content: add 8 present-perfect items (tense-c2)`, `engine: render practice pools`.
- Run the sanity check before any content commit.
- If you change a shared contract (a schema field, a token, the task-type interface),
  update SPEC.md in the same commit. The spec is the source of truth; code that
  disagrees with the spec is the bug.
