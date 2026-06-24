# Grammar Hub

A grammar practice hub for the ELC. Pick any cell of the ELC progression matrix, drill it with a mastery loop, get a first-try report. Built to sit alongside the Aussie Phonics Trainer as one suite.

This is the **skeleton**: the architecture, two working task types, and a few seeded skills. The bones are here; content and the remaining task types come next. Before editing, read **DESIGN_RULES.md** (lanes, tokens, fonts, what's out of scope) so multiple contributors don't clobber each other.

## Run it

Open `index.html` in a browser (double-click works, no server needed). Or in Claude Code, open the preview pane and it will serve `index.html`.

## What works right now

- The rubric matrix renders on the landing screen: **8 progression strands x 4 bands (C1, C2, C3, C4/C4+)**, mapped to the marking grid John's pretest uses. Greyed cells aren't introduced at that band; cells showing `0` exist but have no items yet.
- Two task types: **Identify** (MCQ, name the feature) and **Gap fill** (type the form).
- Seeded skills (15 items): Verb Tenses C1, Modality C1, Conditionals C1 and C2.
- Prepositions and Articles exist as **pools** in the data (not mastery-tracked); their UI is a roadmap item.
- Mastery loop: missed items come back until correct.
- Report: first-try score, per-skill breakdown, "Practise next" list, and **Copy teacher results** to clipboard.

## Repo map

```
index.html        the app (markup + styling + design tokens + script tags)
data/skills.js    ALL content. 8 strands x 4 bands + 2 pools + seeded items. Edit to add questions.
tasktypes.js      the task-type registry. Add a task style here.
engine.js         the machinery. You rarely touch this.
SPEC.md           read first. Architecture, the grid mapping, schema, roadmap, deferred work.
DESIGN_RULES.md   the shared constitution: lanes, colour/font tokens, what's out of scope.
content-prompt.md paste-in prompt to generate new items to schema (content lane).
reference/        artifacts this was modelled on (phonics, Holly's quiz, sentence builder).
```

## Migrating to the Claude Code tab

1. Push this folder to a GitHub repo (or open the local folder directly).
2. In the Claude Desktop app, open the **Code** tab, start a session, and point it at this folder/repo.
3. First message: ask it to read `SPEC.md`, **and DESIGN_RULES.md**, then pick a roadmap item (SPEC section 10). Good first task: "Build the `choose` task type per the interface in SPEC.md section 5, with a few seeded items, staying within the lane rules."
4. Use the preview pane to watch it work against `index.html`.

The spec is written to be the brief, so Claude Code should need little hand-holding once it reads it.

## Adding content (no code needed)

1. Open `data/skills.js`, find the skill node (e.g. `tense-c2`).
2. Add items to its `items:[]` array using the shapes in `SPEC.md` section 6.
3. Reload. Run the smoke check (below) before committing a batch.

To generate a batch, paste `content-prompt.md` into ChatGPT/Copilot with the target skill, and drop the returned array in.

## Adding a task type (code)

Add one entry to `window.TASK_TYPES` in `tasktypes.js` following the interface in `SPEC.md` section 5. The five stubs (`choose`, `order`, `join`, `transform`, `produce`) mark where they go and what they are.

## Sanity check before committing content

A quick script that confirms every item's model answer grades as correct against its own checker (catches wrong keys and bad `accept` lists):

```bash
node -e 'global.window={};require("./data/skills.js");require("./tasktypes.js");
const S=window.SKILLS,T=window.TASK_TYPES;let n=0,bad=0;
S.forEach(s=>s.items.forEach((it,i)=>{n++;const p=it.type==="identify"?it.answer:it.accept[0];
if(!T[it.type].check(it,p).correct){bad++;console.log("BAD",s.id,i,it.type)}}));
console.log("items",n,"problems",bad)'
```

## Open decision already made

Report is **performance-first** (first-try score + teacher export) with a **remediation hook** in place. When per-skill resources exist, populate each node's `resources` field and the "Practise next" list becomes live links. No schema change needed. See SPEC.md section 7.

## Out of scope for now (don't build yet)

The rules-based multi-skill sentence builder is **deferred** (SPEC section 11). v1 is
deliberately modular static banks so content and mechanics can be added in parallel
without collisions. No accounts, no backend, no localStorage in artifact-previewed
builds. See DESIGN_RULES.md section 7.
