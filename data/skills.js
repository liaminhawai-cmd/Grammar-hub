/* ============================================================
   GRAMMAR HUB — CONTENT
   ------------------------------------------------------------
   This file is the data spine. The engine knows nothing about
   grammar; it only runs whatever is in SKILLS.

   CANONICAL MAPPING = the Grammar Pre-Test Marking Grid (John's
   paper). The pretest tests to that grid and teachers circle it,
   so the app's rubric MUST match it or the paper-to-app handoff
   breaks. Bands are C1, C2, C3, C4/C4+ (the grid merges C4 and
   C4+ into one column). Do not reintroduce a separate C4+ column.

   STRANDS:
     Eight "progression" strands are mastery-tracked and shown in
     the rubric matrix. Two "pool" strands (Prepositions, Articles)
     are flat practice banks: they do not band cleanly into C1..C4+,
     so they are NOT mastery-tracked. See SPEC.md and DESIGN_RULES.md.

   A node:
     id         slug: strand-band  (e.g. "tense-c1")
     category   strand name (must match an entry in CATEGORIES for
                progression strands; pools are excluded from CATEGORIES)
     band       "C1" | "C2" | "C3" | "C4/C4+"   (null for pools)
     name       the specific skill at this cell
     example    one canonical example sentence
     introduced false for grid "—" cells (greyed, not drillable)
     mode       "progression" | "pool"
     assessed   true if the current pretest covers it (drives the
                paper-to-rubric handoff). The two NEW strands
                (Agreement & Number, Questions & Negation) are
                assessed:false until the pretest is extended.
     resources  null for now. Remediation hook (phonics model):
                { video:"url", sheets:[{name,url}] }. Populate with
                the OneDrive textbook links per cell when available.
     items      array of task items

   ITEM SHAPES (the `type` must match a key in TASK_TYPES):

   identify  — multiple choice, name the feature
     { type:"identify", prompt, sentence (with <b> around target),
       options:[...], answer, explain, tags:[...] }

   gapfill   — type the correct form into a blank
     { type:"gapfill", prompt, before, after, cue, accept:[...],
       explain, tags:[...] }

   tags: sub-skill labels so the report can say which half of a
   BUNDLED cell was missed (e.g. a Present Simple/Continuous cell
   tags items "present-simple" vs "present-continuous"). Always tag
   items in bundled cells. Single-skill cells can use one tag.
   ============================================================ */

window.SKILLS = [

  /* ========= 1. SENTENCE STRUCTURE (assessed) ========= */
  { id:"sentence-c1", category:"Sentence Structure", band:"C1", name:"Basic SVO", example:"She eats breakfast at 8.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"sentence-c2", category:"Sentence Structure", band:"C2", name:"Coordination", example:"He ran fast and won the race.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"sentence-c3", category:"Sentence Structure", band:"C3", name:"Subordination", example:"Although it was raining, we went out.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"sentence-c4", category:"Sentence Structure", band:"C4/C4+", name:"Cleft / Emphatic", example:"It was Mia who solved the problem.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },

  /* ========= 2. VERB TENSES (assessed) ========= */
  { id:"tense-c1", category:"Verb Tenses", band:"C1", name:"Present Simple/Continuous, Past Simple", example:"I live in Melbourne. I am learning English.", introduced:true, mode:"progression", assessed:true, resources:null, items:[
      { type:"identify", prompt:"Name the tense", sentence:"She <b>works</b> at the hospital.",        options:["present simple","present continuous","past simple","present perfect"], answer:"present simple",      explain:"Verb + s for a habit or fact = present simple.", tags:["present-simple"] },
      { type:"identify", prompt:"Name the tense", sentence:"They <b>are watching</b> a film right now.", options:["present simple","present continuous","past continuous","present perfect"], answer:"present continuous", explain:"am/is/are + verb-ing = present continuous.", tags:["present-continuous"] },
      { type:"identify", prompt:"Name the tense", sentence:"Yesterday she <b>walked</b> to school.",     options:["present simple","past simple","present continuous","present perfect"], answer:"past simple",         explain:"Regular verb + ed for a finished past action = past simple.", tags:["past-simple"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"Right now, I", after:"English.",  cue:"study",  accept:["am studying"], explain:"Happening now = present continuous: am + studying.", tags:["present-continuous"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"Every morning she", after:"the bus.", cue:"catch", accept:["catches"], explain:"Habit, third person singular = catch + es.", tags:["present-simple"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"Last weekend they", after:"their cousins.", cue:"visit", accept:["visited"], explain:"Finished past = visit + ed.", tags:["past-simple"] },
  ]},
  { id:"tense-c2", category:"Verb Tenses", band:"C2", name:"Present Perfect", example:"I have visited Japan.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"tense-c3", category:"Verb Tenses", band:"C3", name:"Past Perfect / Progressive", example:"He had been waiting when I arrived.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"tense-c4", category:"Verb Tenses", band:"C4/C4+", name:"Future Progressive / Perfect", example:"By next year, she will be working in Sydney.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },

  /* ========= 3. MODALITY (assessed) ========= */
  { id:"modality-c1", category:"Modality", band:"C1", name:"Must / Can", example:"You must wear a helmet. She can swim.", introduced:true, mode:"progression", assessed:true, resources:null, items:[
      { type:"identify", prompt:"What does the modal show?", sentence:"You <b>must</b> wear a seatbelt.",     options:["obligation","ability","advice","possibility"], answer:"obligation", explain:"must = a rule / strong obligation.", tags:["must"] },
      { type:"identify", prompt:"What does the modal show?", sentence:"She <b>can</b> speak three languages.", options:["obligation","ability","advice","possibility"], answer:"ability",    explain:"can = ability.", tags:["can"] },
      { type:"gapfill",  prompt:"Add the modal (obligation)", before:"You", after:"wear a helmet when cycling.", cue:"must / can", accept:["must"], explain:"A rule = must.", tags:["must"] },
      { type:"gapfill",  prompt:"Add the modal (ability)",    before:"He", after:"swim very well.",             cue:"must / can", accept:["can"],  explain:"Ability = can.", tags:["can"] },
  ]},
  { id:"modality-c2", category:"Modality", band:"C2", name:"May / Might", example:"It might rain tomorrow.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"modality-c3", category:"Modality", band:"C3", name:"Modal Perfect", example:"She should have studied harder.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"modality-c4", category:"Modality", band:"C4/C4+", name:"Modal Progressive", example:"You might have been speeding.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },

  /* ========= 4. CONDITIONALS (assessed) ========= */
  { id:"cond-c1", category:"Conditionals", band:"C1", name:"Zero", example:"If you heat ice, it melts.", introduced:true, mode:"progression", assessed:true, resources:null, items:[
      { type:"gapfill", prompt:"Write the correct form", before:"If you heat ice, it", after:".", cue:"melt", accept:["melts"], explain:"Zero conditional: present + present for facts.", tags:["zero"] },
  ]},
  { id:"cond-c2", category:"Conditionals", band:"C2", name:"First", example:"If I study, I will pass.", introduced:true, mode:"progression", assessed:true, resources:null, items:[
      { type:"gapfill",  prompt:"Write the correct form", before:"If I study, I", after:"the test.",      cue:"pass", accept:["will pass","ll pass"], explain:"First conditional: if + present, will + base verb.", tags:["first"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"If it", after:", we will stay inside.", cue:"rain", accept:["rains"], explain:"The if-clause uses the present simple: rains.", tags:["first"] },
      { type:"identify", prompt:"Which conditional?", sentence:"If you mix blue and yellow, you <b>get</b> green.", options:["zero conditional","first conditional","second conditional","third conditional"], answer:"zero conditional",  explain:"Always-true fact, present + present = zero conditional.", tags:["zero"] },
      { type:"identify", prompt:"Which conditional?", sentence:"If I finish early, I <b>will call</b> you.",        options:["zero conditional","first conditional","second conditional","third conditional"], answer:"first conditional", explain:"Real future possibility, will + base verb = first conditional.", tags:["first"] },
  ]},
  { id:"cond-c3", category:"Conditionals", band:"C3", name:"Second", example:"If I were taller, I'd play basketball.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"cond-c4", category:"Conditionals", band:"C4/C4+", name:"Third & Mixed / Unreal", example:"If he had left earlier, he would have caught the train.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },

  /* ========= 5. PASSIVE VOICE (assessed; grid C3 is blank) ========= */
  { id:"passive-c1", category:"Passive Voice", band:"C1", name:"Intro to Passive", example:"The letter was sent yesterday.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"passive-c2", category:"Passive Voice", band:"C2", name:"Present / Past Passive", example:"These shoes were made in Italy.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"passive-c3", category:"Passive Voice", band:"C3", name:"—", example:"", introduced:false, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"passive-c4", category:"Passive Voice", band:"C4/C4+", name:"Passive Reporting", example:"The manager is said to have resigned.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },

  /* ========= 6. RELATIVE CLAUSES (assessed; grid C3 is blank) ========= */
  { id:"relative-c1", category:"Relative Clauses", band:"C1", name:"Intro (who/which)", example:"That's the woman who helped me.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"relative-c2", category:"Relative Clauses", band:"C2", name:"Defining / Non-defining", example:"My car, which is red, is outside.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },
  { id:"relative-c3", category:"Relative Clauses", band:"C3", name:"—", example:"", introduced:false, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"relative-c4", category:"Relative Clauses", band:"C4/C4+", name:"Non-defining + Reduced", example:"Students living nearby don't drive.", introduced:true, mode:"progression", assessed:true, resources:null, items:[] },

  /* ========= 7. AGREEMENT & NUMBER (NEW; assessed:false until pretest extended) ========= */
  { id:"agree-c1", category:"Agreement & Number", band:"C1", name:"Subject–Verb Agreement", example:"She walks. They walk.", introduced:true, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"agree-c2", category:"Agreement & Number", band:"C2", name:"Regular / Irregular Plurals", example:"one child, two children", introduced:true, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"agree-c3", category:"Agreement & Number", band:"C3", name:"Countable / Uncountable & Quantifiers", example:"much water, many bottles", introduced:true, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"agree-c4", category:"Agreement & Number", band:"C4/C4+", name:"Collective / Complex Subjects", example:"The team is winning. The team are arguing.", introduced:true, mode:"progression", assessed:false, resources:null, items:[] },

  /* ========= 8. QUESTIONS & NEGATION (NEW; assessed:false until pretest extended) ========= */
  { id:"question-c1", category:"Questions & Negation", band:"C1", name:"Yes/No Questions & Basic Negation", example:"Do you like it? I don't like it.", introduced:true, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"question-c2", category:"Questions & Negation", band:"C2", name:"Wh- Questions", example:"Where did she go?", introduced:true, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"question-c3", category:"Questions & Negation", band:"C3", name:"Inversion & Question Tags", example:"You're coming, aren't you?", introduced:true, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"question-c4", category:"Questions & Negation", band:"C4/C4+", name:"Indirect / Embedded Questions", example:"Could you tell me where the station is?", introduced:true, mode:"progression", assessed:false, resources:null, items:[] },

  /* ========= POOLS: not mastery-tracked, excluded from the rubric matrix ========= */
  { id:"prep-pool",    category:"Prepositions", band:null, name:"Prepositions (practice pool)", example:"The book is on the table.", introduced:true, mode:"pool", assessed:false, resources:null, items:[] },
  { id:"article-pool", category:"Articles",     band:null, name:"Articles (practice pool)",     example:"I have a pen. The pen is blue.", introduced:true, mode:"pool", assessed:false, resources:null, items:[] },

];

// Rubric columns. Matches the marking grid: C4 and C4+ are one column.
window.BANDS = ["C1","C2","C3","C4/C4+"];

// Rubric rows: the eight progression strands, in display order.
// Pools (Prepositions, Articles) are deliberately NOT here.
window.CATEGORIES = [
  "Sentence Structure","Verb Tenses","Modality","Conditionals",
  "Passive Voice","Relative Clauses","Agreement & Number","Questions & Negation",
];

// Flat practice pools (rendered separately from the rubric; UI is a roadmap item).
window.POOLS = ["Prepositions","Articles"];
