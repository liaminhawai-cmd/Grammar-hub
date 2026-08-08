# Victorian Curriculum mapping (DRAFT, awaiting teacher sign-off)

The app's Vic Curriculum toggle reads `data/curriculum.js`, which mirrors
this table. Every code was verified against the two content-description
documents in the repo root (F–6 and 7–10, 13-12-2023), read in full.

## Which scheme leads?

**The app's own sequence is the pedagogical spine; VC codes are best-fit
reporting labels.** The Victorian Curriculum is a strong guide, but this
tool exists to sequence and separate grammar into a more useful development
order than VC's coarse chunks — and where a VC label would blur a teaching
step (e.g. VC treats all perfect/progressive forms as one chunk), the app
keeps its finer steps and the label just repeats. Labels fit as well as
they can; they are never allowed to hurt pedagogy or clarity, and they
never reshape the sequence. The sequence itself is justified by grammar
acquisition research (see "Evidence base" below), not by VC.

## The two student views

The toggle exists so EAL and non-EAL students can use the same tool with
labels they understand. **No curriculum codes appear in the student UI in
either view** — the codes in this document and `data/curriculum.js` are the
documentation/reporting record only.

- **EAL view (default):** the C1–C4/C4+ grid — the C levels ARE the EAL
  curriculum and what EAL students know.
- **Non-EAL view:** the same skills and the same underlying sequence on an
  F–10 year timeline, one topic per teaching step, labelled with **year
  levels** and plain titles. Where VC is too coarse to sequence the steps
  (elaborated tenses, modality, conditionals), the year placements are
  evidence-based interpolation from the acquisition literature — and
  validate.js enforces that within a strand the year axis never contradicts
  the teaching order. Inside a session, band labels become neutral
  "Step 1–4". Teacher exports always keep C bands (source of truth).

**The C bands and VC levels are deliberately NOT aligned.** The EAL C1–C4
progression and Victorian Curriculum English 2.0 chunk grammar differently,
so a C1 cell can carry a Level 4 code, three cells can share one code, and
no column headers claim level equivalence. The mapping below answers one
question only: *where does this cell's grammar genuinely live in VC2E?*

**How to read it:** a cell maps to one or more codes. ✓ = VC names the
grammar point (or the chunk that contains it). ≈ = VC never names the point;
the nearest genuine description is used — these are the rows to check.

## How VC chunks grammar differently from the C bands

- **Sentence structure** is VC's cleanest ladder (simple → compound →
  complex → for-effect → embedded → varied-for-effect) but it is spread
  over Levels 1–9, not four bands.
- **Tenses:** VC does basic tense at Levels 3–4, then bundles *every*
  perfect and progressive form into one chunk — "elaborated tenses"
  (VC2E6LA06). It never distinguishes present perfect from past perfect
  from future perfect, which the C bands split across C2–C4. That is why
  tense-c2/c3/c4 share codes.
- **Modality** gets exactly one grammar description in the entire F–10
  sequence (VC2E3LA09). Modal perfect/progressive have no VC home.
- **Conditionals** are never named. Their honest home is subordination —
  VC2E4LA06 explicitly covers dependent clauses creating "relationships,
  such as time and causality".
- **Passive voice** is never named. Nearest genuine chunks: reordering the
  sentence starting point for prominence (5LA04), verb-group control
  (7LA06), and reported speech / nominalisation for impersonal reporting.
- **Questions** are treated as *interaction* (Language for interacting with
  others), not syntax — except indirect speech, which is named at VC2E4LA12
  and is a genuinely direct hook for indirect questions.

## Evidence base for the teaching sequence

Where the grid is finer-grained than VC (or sequences differently), the
ordering follows second-language grammar acquisition research:

- **Sentence Structure (SVO → coordination → subordination → cleft).**
  Learners process canonical subject–verb–object order before non-canonical
  structures (Pienemann 1998). In writing development, coordination
  reliably precedes subordination as syntactic maturity grows (Hunt 1965).
  Clefts are marked information-structure devices and come last.
- **Verb Tenses (simple → present perfect → past perfect/progressive →
  future perfect/progressive).** Emergence order in L2 English is well
  documented: past simple before present perfect before past perfect, with
  future perfect forms late and rare (Bardovi-Harlig 2000). VC's single
  "elaborated tenses" chunk hides exactly the steps EAL learners climb.
- **Modality (must/can → may/might → modal perfect → modal progressive).**
  Root modality (obligation, ability) is consistently acquired before
  epistemic modality (possibility, inference), and modal perfect adds past
  reference on top of epistemic meaning (Coates 1983; Celce-Murcia &
  Larsen-Freeman 1999).
- **Conditionals (zero → first → second → third/mixed).** The standard
  pedagogical-grammar sequence, graded by hypotheticality and the amount
  of tense backshift the learner must control (Celce-Murcia &
  Larsen-Freeman 1999). VC never names conditionals at all.
- **Passive (agentless intro → tensed passives → passive reporting).**
  Passives require non-canonical form–meaning mapping and are late
  acquired; agentless be-passives precede complex/reporting passives
  (Pienemann 1998; Celce-Murcia & Larsen-Freeman 1999).
- **Relative Clauses (subject relatives → defining/non-defining →
  reduced).** Follows the Noun Phrase Accessibility Hierarchy: subject
  relatives (who/which) are easiest cross-linguistically (Keenan & Comrie
  1977), and instruction research on L2 relativisation supports explicit,
  staged teaching (Doughty 1991). Reduced relatives add deletion +
  participle morphology, so they come last.
- **Agreement & Number.** Third-person -s is notoriously late in the L2
  morpheme acquisition order despite being "simple", which justifies
  explicit, recurring attention rather than one early touch (Dulay & Burt
  1974; Krashen 1977).
- **Questions & Negation (yes/no → wh- → inversion/tags →
  indirect/embedded).** The strongest literature match in the grid: this
  is, almost step for step, the developmental sequence for English
  questions — fronting before inversion before cancel-inversion in
  embedded questions (Pienemann 1998; Spada & Lightbown 1993). VC treats
  questioning as interaction and never sequences the syntax.

The teaching mode's design is likewise evidence-based: explicit modelling
with gradual release (I do → We do → You do) per Rosenshine (2012), Archer
& Hughes (2011) and Fisher & Frey (2008); metalanguage taught first and
connected to writing per Myhill, Jones, Lines & Watson (2012); explicit
instruction outperforming implicit exposure per Norris & Ortega (2000).

### References

- Archer, A. & Hughes, C. (2011). *Explicit Instruction: Effective and Efficient Teaching.* Guilford.
- Bardovi-Harlig, K. (2000). *Tense and Aspect in Second Language Acquisition.* Blackwell.
- Celce-Murcia, M. & Larsen-Freeman, D. (1999). *The Grammar Book: An ESL/EFL Teacher's Course* (2nd ed.). Heinle.
- Coates, J. (1983). *The Semantics of the Modal Auxiliaries.* Croom Helm.
- Doughty, C. (1991). Second language instruction does make a difference: Evidence from an empirical study of SL relativization. *Studies in Second Language Acquisition, 13*(4).
- Dulay, H. & Burt, M. (1974). Natural sequences in child second language acquisition. *Language Learning, 24*(1).
- Fisher, D. & Frey, N. (2008). *Better Learning Through Structured Teaching: A Framework for the Gradual Release of Responsibility.* ASCD.
- Hunt, K. (1965). *Grammatical Structures Written at Three Grade Levels.* NCTE.
- Keenan, E. & Comrie, B. (1977). Noun phrase accessibility and universal grammar. *Linguistic Inquiry, 8*(1).
- Krashen, S. (1977). Some issues relating to the Monitor Model. In *On TESOL '77.*
- Myhill, D., Jones, S., Lines, H. & Watson, A. (2012). Re-thinking grammar: the impact of embedded grammar teaching on students' writing and students' metalinguistic understanding. *Research Papers in Education, 27*(2).
- Norris, J. & Ortega, L. (2000). Effectiveness of L2 instruction: A research synthesis and quantitative meta-analysis. *Language Learning, 50*(3).
- Pienemann, M. (1998). *Language Processing and Second Language Development: Processability Theory.* John Benjamins.
- Rosenshine, B. (2012). Principles of instruction: Research-based strategies that all teachers should know. *American Educator, 36*(1).
- Spada, N. & Lightbown, P. (1993). Instruction and the development of questions in L2 classrooms. *Studies in Second Language Acquisition, 15*(2).

## The mapping

| Cell | Skill | Code(s) | Fit / rationale |
|---|---|---|---|
| sentence-c1 | Basic SVO | VC2EFLA06 + VC2E1LA06 | ✓ "groups of words that work together"; simple sentence = one clause |
| sentence-c2 | Coordination | VC2E2LA06 | ✓ named directly |
| sentence-c3 | Subordination | VC2E4LA06 + VC2E5LA05 | ✓ named directly; L5 adds "for effect" |
| sentence-c4 | Cleft / Emphatic | VC2E9LA05 + ≈VC2E5LA04 | ✓ "vary sentence structures for effect"; ≈ prominence via starting point |
| tense-c1 | Pres simple/cont, past simple | VC2E3LA08 + VC2E4LA08 | ✓ tense anchoring; past/present/future impact |
| tense-c2 | Present Perfect | VC2E6LA06 | ✓ VC's "elaborated tenses" chunk (contains all perfect forms) |
| tense-c3 | Past Perfect / Prog | VC2E6LA06 + VC2E7LA06 | ✓ same chunk + tense consistency through verb groups |
| tense-c4 | Future Prog / Perfect | VC2E6LA06 + VC2E7LA06 | ✓ same chunks — VC does not subdivide further |
| modality-c1 | Must / Can | VC2E3LA09 | ✓ named directly |
| modality-c2 | May / Might | VC2E3LA09 + ≈VC2E3LA02 | ✓ same code; ≈ "more or less forceful" evaluation = gradation of force |
| modality-c3 | Modal Perfect | ≈VC2E3LA09 + ≈VC2E6LE02 | ≈ no VC home; modality description applied to past + literary modality |
| modality-c4 | Modal Progressive | ≈VC2E3LA09 + ≈VC2E6LE02 | ≈ as above |
| cond-c1 | Zero | ≈VC2E4LA06 | ≈ subordination creating "time and causality" relationships |
| cond-c2 | First | ≈VC2E4LA06 + ≈VC2E5LA05 | ≈ as above, plus structure-for-effect |
| cond-c3 | Second | ≈VC2E7LA05 | ≈ complex/compound-complex elaboration |
| cond-c4 | Third & Mixed | ≈VC2E7LA05 + ≈VC2E8LA05 | ≈ clause-structure variety |
| passive-c1 | Intro to Passive | ≈VC2E5LA04 | ≈ passive = reordering the starting point for prominence |
| passive-c2 | Present / Past Passive | ≈VC2E7LA06 | ≈ verb-group control (be + participle) |
| passive-c4 | Passive Reporting | ≈VC2E4LA12 + ≈VC2E9LA04 | ≈ reported (indirect) speech; nominalisation condenses/depersonalises |
| relative-c1 | Intro (who/which) | VC2E5LA06 | ✓ relative clauses expand noun groups |
| relative-c2 | Defining / Non-defining | VC2E6LA05 + VC2E6LA09 | ✓ embedded clauses; commas around dependent clauses |
| relative-c4 | Non-def + Reduced | VC2E8LA05 | ✓ clause-structure variety incl. embedded |
| agree-c1 | Subject–Verb Agreement | VC2E3LA06 | ✓ "a subject and a verb that need to agree" |
| agree-c2 | Reg / Irreg Plurals | VC2E5LY05 | ✓ "less common plurals; suffixes change grammatical form" |
| agree-c3 | Count/Uncount & Quantifiers | ≈VC2E2LA07 | ≈ quantity words live in noun groups; VC never names countability |
| agree-c4 | Collective / Complex Subjects | ≈VC2E3LA06 | ≈ agreement applied at higher complexity (same code as c1) |
| question-c1 | Yes/No & Negation | ≈VC2E1LA01 + ≈VC2E1LA10 | ≈ asking for/providing information; question marks |
| question-c2 | Wh- Questions | ≈VC2E1LA01 | ≈ interaction hook — thinnest in the set |
| question-c3 | Inversion & Tags | ≈VC2E6LA01 | ≈ tags manage formality/social distance (interpersonal) |
| question-c4 | Indirect / Embedded | VC2E4LA12 + VC2E6LA05 | ✓ reported (indirect) speech; embedded clauses |

## Known limits (flag when quoting codes)

1. The ≈ rows (conditionals, passive, higher modality, countability, most
   question syntax) have **no explicit VC 2.0 description** — fine as
   "working toward / related to" language, not as a direct equivalence in
   formal reporting.
2. Where several cells share a code, that reflects VC's coarser chunking —
   quote the code once per strand in reports, not per cell.

## To change the mapping

Edit `data/curriculum.js` (each cell maps to an array of
`{code, label, approx}`), keep this table in sync. `node validate.js`
checks every introduced cell has well-formed entries. When signed off,
remove the "draft" wording here, in `data/curriculum.js`, and in the
matrix legend (`engine.js` → `buildMatrix`).
