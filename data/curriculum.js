/* ============================================================
   GRAMMAR HUB — VICTORIAN CURRICULUM MAPPING (DRAFT, pending sign-off)
   ------------------------------------------------------------
   The C1–C4/C4+ bands ARE the EAL curriculum and stay the app's grid.
   The Vic Curriculum toggle overlays, per cell, the VC2E content
   description(s) that genuinely cover that cell's grammar — at whatever
   VC level they appear. The two schemes chunk grammar differently and
   are deliberately NOT aligned: e.g. VC treats every perfect/progressive
   form as one chunk ("elaborated tenses", VC2E6LA06), while the EAL
   bands split them across C2–C4; VC never names conditionals or the
   passive at all. So a C1 cell may carry a Level 4 code and three cells
   may share one code. That is honest, not a bug.

   PRINCIPLE: the app's own sequence is the pedagogical spine, justified
   by grammar acquisition research (see CURRICULUM-MAP.md, "Evidence
   base"). VC codes are best-fit labels for reporting; they never reshape
   the sequence, and a label is dropped or marked approx before it is
   allowed to hurt pedagogy or clarity.

   Each cell maps to an ARRAY of { code, label, approx? }.
   approx:true = judgement call (VC has no explicit description for the
   point; the nearest genuine chunk is used). Derived from a full read of
   the Language strand in the two content-description docx files in the
   repo root; rationale table for sign-off: CURRICULUM-MAP.md.
   ============================================================ */

/* ------------------------------------------------------------
   VIC_CHUNKS — the non-EAL (mainstream) student view. Same skills, same
   sequence underneath; the labels are ones non-EAL kids understand:
   YEAR LEVELS and plain titles, laid out on a shared F–10 timeline.

   One chunk per teaching step. Where VC is too coarse to sequence the
   steps (it bundles all perfect/progressive forms as "elaborated
   tenses", names modality once, never names conditionals), the year
   placements are evidence-based interpolation from the acquisition
   literature (see CURRICULUM-MAP.md, "Evidence base") — teacher-approved
   approach, exact years draft until sign-off. RULE (checked by
   validate.js): within a strand, the year axis must never contradict the
   teaching order.

   No curriculum codes are shown in the student UI (either view). The
   `codes` arrays are the documentation/reporting record backing
   CURRICULUM-MAP.md, same as VIC_MAP below.
   ------------------------------------------------------------ */
window.VIC_CHUNKS = {
  "Sentence Structure": [
    { title:"Simple sentences", y0:0, y1:1, years:"F–1", codes:["VC2EFLA06","VC2E1LA06"], covers:["sentence-c1"] },
    { title:"Compound sentences", y0:2, y1:3, years:"2–3", codes:["VC2E2LA06"], covers:["sentence-c2"] },
    { title:"Complex sentences", y0:4, y1:5, years:"4–5", codes:["VC2E4LA06","VC2E5LA05"], covers:["sentence-c3"] },
    { title:"Sentence style & emphasis", y0:8, y1:10, years:"8–10", codes:["VC2E9LA05","VC2E5LA04"], covers:["sentence-c4"] },
  ],
  "Verb Tenses": [
    { title:"Tense basics", y0:3, y1:4, years:"3–4", codes:["VC2E3LA08","VC2E4LA08"], covers:["tense-c1"] },
    { title:"Present perfect", y0:5, y1:6, years:"5–6", codes:["VC2E6LA06"], covers:["tense-c2"] },
    { title:"Past perfect & progressive", y0:7, y1:7, years:"7", codes:["VC2E6LA06","VC2E7LA06"], covers:["tense-c3"] },
    { title:"Future perfect & progressive", y0:8, y1:8, years:"8", codes:["VC2E6LA06","VC2E7LA06"], covers:["tense-c4"] },
  ],
  "Modality": [
    { title:"Must & can", y0:3, y1:3, years:"3", codes:["VC2E3LA09"], covers:["modality-c1"] },
    { title:"May & might", y0:4, y1:4, years:"4", codes:["VC2E3LA09","VC2E3LA02"], covers:["modality-c2"] },
    { title:"Past modals (should have)", y0:6, y1:6, years:"6", codes:["VC2E3LA09","VC2E6LE02"], covers:["modality-c3"] },
    { title:"Past modals (might have been)", y0:7, y1:7, years:"7", codes:["VC2E3LA09","VC2E6LE02"], covers:["modality-c4"] },
  ],
  "Conditionals": [
    { title:"Zero conditional (facts)", y0:4, y1:4, years:"4", codes:["VC2E4LA06"], covers:["cond-c1"] },
    { title:"First conditional (real future)", y0:5, y1:5, years:"5", codes:["VC2E4LA06","VC2E5LA05"], covers:["cond-c2"] },
    { title:"Second conditional (imagined now)", y0:7, y1:7, years:"7", codes:["VC2E7LA05"], covers:["cond-c3"] },
    { title:"Third & mixed conditionals", y0:8, y1:8, years:"8", codes:["VC2E7LA05","VC2E8LA05"], covers:["cond-c4"] },
  ],
  "Passive Voice": [
    { title:"Passive voice basics", y0:5, y1:5, years:"5", codes:["VC2E5LA04"], covers:["passive-c1"] },
    { title:"Present & past passive", y0:6, y1:7, years:"6–7", codes:["VC2E7LA06"], covers:["passive-c2"] },
    { title:"Passive reporting", y0:8, y1:9, years:"8–9", codes:["VC2E4LA12","VC2E9LA04"], covers:["passive-c4"] },
  ],
  "Relative Clauses": [
    { title:"Describing with who/which", y0:5, y1:5, years:"5", codes:["VC2E5LA06"], covers:["relative-c1"] },
    { title:"Extra-information clauses", y0:6, y1:6, years:"6", codes:["VC2E6LA05","VC2E6LA09"], covers:["relative-c2"] },
    { title:"Reduced clauses", y0:8, y1:8, years:"8", codes:["VC2E8LA05"], covers:["relative-c4"] },
  ],
  "Agreement & Number": [
    { title:"Subject–verb agreement", y0:3, y1:4, years:"3–4", codes:["VC2E3LA06"], covers:["agree-c1"] },
    { title:"Plurals & suffixes", y0:5, y1:5, years:"5", codes:["VC2E5LY05"], covers:["agree-c2"] },
    { title:"Countable & uncountable", y0:6, y1:6, years:"6", codes:["VC2E2LA07"], covers:["agree-c3"] },
    { title:"Agreement with tricky subjects", y0:7, y1:7, years:"7", codes:["VC2E3LA06"], covers:["agree-c4"] },
  ],
  "Questions & Negation": [
    { title:"Yes/no questions & negatives", y0:1, y1:2, years:"1–2", codes:["VC2E1LA01","VC2E1LA10"], covers:["question-c1"] },
    { title:"Wh- questions", y0:3, y1:3, years:"3", codes:["VC2E1LA01"], covers:["question-c2"] },
    { title:"Question tags", y0:6, y1:6, years:"6", codes:["VC2E6LA01"], covers:["question-c3"] },
    { title:"Indirect questions", y0:6, y1:7, years:"6–7", codes:["VC2E4LA12","VC2E6LA05"], covers:["question-c4"] },
  ],
};

window.VIC_MAP = {
  /* Sentence Structure — VC ladder: simple (1) > compound (2) > complex (4)
     > for-effect (5) > embedded (6) > varied for effect (9). */
  "sentence-c1": [
    { code:"VC2EFLA06", label:"sentences are made up of groups of words that work together to make meaning" },
    { code:"VC2E1LA06", label:"a simple sentence is a single independent clause" },
  ],
  "sentence-c2": [
    { code:"VC2E2LA06", label:"compound sentences: independent clauses linked by a coordinating conjunction" },
  ],
  "sentence-c3": [
    { code:"VC2E4LA06", label:"complex sentences: a dependent clause joined by a subordinating conjunction" },
    { code:"VC2E5LA05", label:"using complex sentence structure for effect" },
  ],
  "sentence-c4": [
    { code:"VC2E9LA05", label:"authors vary sentence structures for effect" },
    { code:"VC2E5LA04", label:"the starting point of a sentence gives prominence to the message", approx:true },
  ],

  /* Verb Tenses — VC chunks differently: basic tense at 3–4, then ALL
     perfect/progressive forms live in one chunk, "elaborated tenses". */
  "tense-c1": [
    { code:"VC2E3LA08", label:"verbs are anchored in time through tense" },
    { code:"VC2E4LA08", label:"past, present and future tenses and their impact on meaning" },
  ],
  "tense-c2": [
    { code:"VC2E6LA06", label:"elaborated tenses expand and sharpen ideas (VC's chunk for perfect forms)" },
  ],
  "tense-c3": [
    { code:"VC2E6LA06", label:"elaborated tenses expand and sharpen ideas" },
    { code:"VC2E7LA06", label:"consistency of tense through verbs and verb groups" },
  ],
  "tense-c4": [
    { code:"VC2E6LA06", label:"elaborated tenses expand and sharpen ideas" },
    { code:"VC2E7LA06", label:"consistency of tense through verbs and verb groups" },
  ],

  /* Modality — VC names it once as grammar (3LA09); gradation of force
     sits in evaluation language; literary modality appears at 6LE02. */
  "modality-c1": [
    { code:"VC2E3LA09", label:"modal verbs indicate obligation, probability and possibility" },
  ],
  "modality-c2": [
    { code:"VC2E3LA09", label:"modal verbs indicate obligation, probability and possibility" },
    { code:"VC2E3LA02", label:"language of evaluation varied to be more or less forceful", approx:true },
  ],
  "modality-c3": [
    { code:"VC2E3LA09", label:"modal verbs (applied to past reference)", approx:true },
    { code:"VC2E6LE02", label:"compare language choices: modality and emphasis", approx:true },
  ],
  "modality-c4": [
    { code:"VC2E3LA09", label:"modal verbs (applied to ongoing/past reference)", approx:true },
    { code:"VC2E6LE02", label:"compare language choices: modality and emphasis", approx:true },
  ],

  /* Conditionals — never named in VC. Their honest home is subordination:
     4LA06 explicitly includes "relationships, such as time and causality". */
  "cond-c1": [
    { code:"VC2E4LA06", label:"subordination creating relationships of time and causality (if)", approx:true },
  ],
  "cond-c2": [
    { code:"VC2E4LA06", label:"subordination creating relationships of time and causality (if)", approx:true },
    { code:"VC2E5LA05", label:"using complex sentence structure for effect", approx:true },
  ],
  "cond-c3": [
    { code:"VC2E7LA05", label:"complex and compound-complex sentences elaborate and extend ideas", approx:true },
  ],
  "cond-c4": [
    { code:"VC2E7LA05", label:"complex and compound-complex sentences elaborate and extend ideas", approx:true },
    { code:"VC2E8LA05", label:"a variety of clause structures adds information and expands ideas", approx:true },
  ],

  /* Passive Voice — never named in VC. Nearest genuine chunks: reordering
     the sentence starting point, verb-group control, reported speech and
     nominalisation/condensing for impersonal reporting. */
  "passive-c1": [
    { code:"VC2E5LA04", label:"reorder the sentence starting point to give prominence to the message", approx:true },
  ],
  "passive-c2": [
    { code:"VC2E7LA06", label:"control of tense through verb groups (be + participle)", approx:true },
  ],
  "passive-c4": [
    { code:"VC2E4LA12", label:"how quoted (direct) and reported (indirect) speech are used", approx:true },
    { code:"VC2E9LA04", label:"cohesive devices, including nominalisation, condense information", approx:true },
  ],

  /* Relative Clauses — VC covers these well: expanded noun groups, then
     embedded clauses, then clause variety. */
  "relative-c1": [
    { code:"VC2E5LA06", label:"noun groups expanded in a variety of ways for fuller description" },
  ],
  "relative-c2": [
    { code:"VC2E6LA05", label:"embedded clauses expand the variety of complex sentences" },
    { code:"VC2E6LA09", label:"commas separate a dependent clause from an independent clause" },
  ],
  "relative-c4": [
    { code:"VC2E8LA05", label:"a variety of clause structures, including embedded clauses" },
  ],

  /* Agreement & Number */
  "agree-c1": [
    { code:"VC2E3LA06", label:"a clause contains a subject and a verb that need to agree" },
  ],
  "agree-c2": [
    { code:"VC2E5LY05", label:"less common plurals; suffixes change meaning or grammatical form" },
  ],
  "agree-c3": [
    { code:"VC2E2LA07", label:"nouns extend into noun groups (quantity words live here)", approx:true },
  ],
  "agree-c4": [
    { code:"VC2E3LA06", label:"subject–verb agreement applied to collective and complex subjects", approx:true },
  ],

  /* Questions & Negation — VC treats questioning as interaction rather than
     syntax, except indirect speech, which is named at 4LA12. */
  "question-c1": [
    { code:"VC2E1LA01", label:"language for asking for and providing information, requesting", approx:true },
    { code:"VC2E1LA10", label:"punctuation including question marks", approx:true },
  ],
  "question-c2": [
    { code:"VC2E1LA01", label:"language for asking for and providing information", approx:true },
  ],
  "question-c3": [
    { code:"VC2E6LA01", label:"language varies with formality and social distance (tags are interpersonal)", approx:true },
  ],
  "question-c4": [
    { code:"VC2E4LA12", label:"how quoted (direct) and reported (indirect) speech are used" },
    { code:"VC2E6LA05", label:"embedded clauses (an indirect question embeds a clause)" },
  ],
};
