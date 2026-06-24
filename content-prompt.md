# Content generation prompt (for Holly / Copilot / Codex)

Paste the block below into ChatGPT or Copilot. Fill the two BRACKETS. It returns a
JSON array you drop straight into the matching skill node's `items:[]` in `data/skills.js`.

Generate one batch per skill. Keep the EAL register: short, concrete, classroom-safe
sentences. AU spelling. No em dashes.

---

You are writing practice items for a Year 7 EAL grammar app. Output ONLY a JSON array,
no prose, no markdown fences.

Target skill: [e.g. Verb Tenses, C2, Past Simple / Future Will]
Number of items: [e.g. 8] (mix of the two task types below, roughly half each)

Item shapes (use these EXACTLY):

identify (multiple choice, name the grammatical feature):
{
  "type": "identify",
  "prompt": "Name the tense",            // or "Which conditional?", "What does the modal show?"
  "sentence": "She <b>went</b> home.",   // wrap the target word(s) in <b></b>
  "options": ["past simple","present simple","past continuous","present perfect"],
  "answer": "past simple",               // must be one of options, and uniquely correct
  "explain": "One short sentence saying why."
}

gapfill (type the correct form into a blank):
{
  "type": "gapfill",
  "prompt": "Write the correct form",
  "before": "Yesterday, she",            // text before the blank
  "after": "to the market.",             // text after the blank
  "cue": "go",                           // lemma or instruction shown in the gap
  "accept": ["went"],                    // ALL acceptable answers, lowercase; include contractions
  "explain": "One short sentence saying why."
}

Rules:
- Every identify item must have exactly one defensible answer. No distractor should also be
  arguable for the marked target.
- Every gapfill `accept` list must include contraction variants (e.g. "will go" AND "ll go")
  and any reasonable spelling.
- Vary subjects and contexts. Avoid reusing the same verb across items.
- Keep sentences at EAL Year 7 reading level.

Return the JSON array only.

---

After pasting the result into `data/skills.js`, run the sanity check in README.md before committing.
