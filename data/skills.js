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

   VOCAB (teaching mode):
   Each cell has an optional `vocab` array of metalanguage terms:
     { term, def, example (with <b> around the target word/phrase) }
   The teaching engine shows these before skill items so students
   learn the metalanguage first, then practise the grammar concept.
   ============================================================ */

window.SKILLS = [

  /* ========= 1. SENTENCE STRUCTURE (assessed) ========= */
  { id:"sentence-c1", category:"Sentence Structure", band:"C1", name:"Basic SVO", example:"She eats breakfast at 8.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Simple Sentences",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Simple-Sentences.aspx"},{name:"Subjects",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Subjects.aspx"},{name:"Objects",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Objects.aspx"},{name:"Khan: Subjects & predicates",url:"https://www.khanacademy.org/humanities/grammar/syntax-sentences-and-clauses/subjects-and-predicates/e/identifying-subject-and-predicate"}] },
  vocab:[
    {term:"subject",def:"The person or thing doing the action in a sentence.",example:"<b>The dog</b> chased the cat."},
    {term:"verb",def:"The doing or being word — it tells you what happens.",example:"The dog <b>chased</b> the cat."},
    {term:"object",def:"The person or thing receiving the action.",example:"The dog chased <b>the cat</b>."},
  ],
  worked:[
    { text:"The dog chased the cat.", note:"The basic pattern: <b>subject</b> + <b>verb</b> + <b>object</b>." },
    { text:"My brother plays guitar.", note:"Different words, same subject-verb-object order." },
    { text:"She reads books every night.", note:"Extra detail (every night) can follow the object." },
    { text:"Tom and Sam built a fort.", note:"The subject can be more than one person." },
  ],
  sort:{
    prompt:"Drag each part into Subject, Verb, or Object.",
    zones:["Subject","Verb","Object"],
    modelled:[
      { text:"The dog", zone:"Subject", explain:"This names who does the action — it is the subject." },
      { text:"chased", zone:"Verb", explain:"This is the action word — it is the verb." },
      { text:"the cat", zone:"Object", explain:"This receives the action — it is the object." },
    ],
    items:[
      { text:"My brother", zone:"Subject" }, { text:"plays", zone:"Verb" }, { text:"guitar", zone:"Object" },
      { text:"The teacher", zone:"Subject" }, { text:"collected", zone:"Verb" }, { text:"the homework", zone:"Object" },
      { text:"She", zone:"Subject" }, { text:"reads", zone:"Verb" }, { text:"books", zone:"Object" },
      { text:"The children", zone:"Subject" }, { text:"kicked", zone:"Verb" }, { text:"the ball", zone:"Object" },
      { text:"My friend", zone:"Subject" }, { text:"wrote", zone:"Verb" }, { text:"a letter", zone:"Object" },
    ],
  },
  items:[
      { type:"identify", prompt:"Find the verb", sentence:"The dog chased the cat.", options:["The dog","chased","the cat","dog chased"], answer:"chased", explain:"The verb is the action word: chased.", tags:["svo"] },
      { type:"identify", prompt:"Find the subject", sentence:"My brother plays guitar after school.", options:["My brother","plays","guitar","after school"], answer:"My brother", explain:"The subject is who does the action: my brother.", tags:["svo"] },
      { type:"identify", prompt:"Is this a complete sentence?", sentence:"<b>She reads books every night.</b>", options:["Yes — subject + verb + rest","No — missing a subject","No — missing a verb","No — it is a fragment"], answer:"Yes — subject + verb + rest", explain:"She (subject) reads (verb) books every night — complete SVO.", tags:["svo"] },
      { type:"identify", prompt:"Is this a complete sentence?", sentence:"<b>Running to the shops.</b>", options:["Yes — subject + verb + rest","No — missing a subject","No — missing a verb","No — it is a fragment"], answer:"No — missing a subject", explain:"There is no subject: who is running?", tags:["svo"] },
      { type:"gapfill", prompt:"Write a verb to complete the sentence", before:"The teacher", after:"the homework.", cue:"collect", accept:["collects","collected"], explain:"The teacher collects/collected the homework — verb completes the SVO.", tags:["svo"] },
      { type:"gapfill", prompt:"Add ANY subject — who or what kicked the ball?", before:"", after:"kicked the ball over the fence.", cue:"a person or thing", accept:["i","you","he","she","we","they","it","the boy","the girl","the dog","the player","tom","sam","mia"], explain:"Any subject works here: I, you, he, she, we, they, it, or a noun like 'the boy'. A subject is needed before the verb 'kicked'.", tags:["svo"] },
      { type:"choose", prompt:"Which is a complete sentence?", options:["The cat sleeps on the sofa.","Sleeps on the sofa.","The cat on the sofa.","On the sofa sleeps."], answer:"The cat sleeps on the sofa.", explain:"Complete SVO: the cat (subject) sleeps (verb) on the sofa (rest).", tags:["svo"] },
      { type:"choose", prompt:"Which sentence is correct?", options:["My friend plays football.","My friend play football.","My friend are playing football.","My friend do play football."], answer:"My friend plays football.", explain:"Singular subject (friend) + verb + s = plays.", tags:["svo"] },
      { type:"order", prompt:"Arrange the words to tell us where she goes", words:["school","to","goes","She"], answer:"She goes to school", explain:"Subject (She) + verb (goes) + rest (to school) = SVO order.", tags:["svo"] },
      { type:"order", prompt:"Arrange the words to say what the cat does", words:["the","reads","cat","book","a"], answer:"The cat reads a book", explain:"Subject (the cat) + verb (reads) + object (a book) = correct SVO.", tags:["svo"] },
      { type:"match", prompt:"One little comma, two very different meanings. Match each sentence to what it actually says.", pairs:[
          { sentence:"Let's eat, Grandma!", meaning:"Inviting Grandma to come and eat" },
          { sentence:"Let's eat Grandma!", meaning:"Suggesting we eat Grandma (yikes!)" }
        ], explain:"The comma of direct address tells Grandma we're talking TO her, not about eating her.", tags:["svo"] },
  ] },
  { id:"sentence-c2", category:"Sentence Structure", band:"C2", name:"Coordination", example:"He ran fast and won the race.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Compound Sentences",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Compound-Sentences.aspx"},{name:"Conjunctions",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Conjunctions.aspx"},{name:"Khan: Compound sentences",url:"https://www.khanacademy.org/humanities/grammar/syntax-sentences-and-clauses/types-of-sentences/e/simple-and-compound-sentences"},{name:"Khan: Conjunctions",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-preposition-and-the-conjunction/introduction-to-conjunctions/e/coordinating-conjunctions"}] },
  vocab:[
    {term:"coordinating conjunction",def:"A joining word that links two equal ideas: and, but, or, so, yet.",example:"She likes maths <b>and</b> science."},
    {term:"compound sentence",def:"Two complete ideas joined by a coordinating conjunction.",example:"<b>He was tired, but he kept working.</b>"},
  ],
  worked:[
    { text:"He ran fast and won the race.", note:"<b>and</b> joins two things he did (addition)." },
    { text:"She was tired, but she kept working.", note:"<b>but</b> joins two ideas that contrast — note the comma." },
    { text:"We can stay or we can go.", note:"<b>or</b> offers a choice between two ideas." },
    { text:"It rained, so we stayed inside.", note:"<b>so</b> shows the result of the first idea." },
  ],
  sort:{
    prompt:"Each connective does a job. Drag each sentence to what its connective shows.",
    zones:["Addition","Contrast","Choice","Result"],
    modelled:[
      { text:"She likes tea and coffee.", zone:"Addition", explain:"and adds a second idea — that is addition." },
      { text:"He was tired, but he kept working.", zone:"Contrast", explain:"but signals the opposite of what you expect — that is contrast." },
      { text:"We can walk or take the bus.", zone:"Choice", explain:"or gives you two options — that is choice." },
      { text:"It rained, so we stayed in.", zone:"Result", explain:"so shows what happened as a result." },
    ],
    items:[
      { text:"I was hungry, so I made lunch.", zone:"Result" },
      { text:"He ran fast and won the race.", zone:"Addition" },
      { text:"Do you want tea or coffee?", zone:"Choice" },
      { text:"It was cold, but we went out.", zone:"Contrast" },
      { text:"The bus was late, so we walked.", zone:"Result" },
      { text:"She sings and she dances.", zone:"Addition" },
      { text:"You can call or text me.", zone:"Choice" },
      { text:"I tried hard, but I lost.", zone:"Contrast" },
    ],
  },
  items:[
      { type:"identify", prompt:"Which word shows the two ideas pull in opposite directions?", sentence:"She likes maths ___ she hates science.", options:["and","but","or","so"], answer:"but", explain:"But joins two ideas that contrast.", tags:["coordination"] },
      { type:"identify", prompt:"Which word offers a choice between two options?", sentence:"We can walk ___ take the bus.", options:["and","but","or","so"], answer:"or", explain:"Or gives a choice between two options.", tags:["coordination"] },
      { type:"identify", prompt:"Which word shows that staying inside was the result?", sentence:"It was raining, ___ we stayed inside.", options:["and","but","or","so"], answer:"so", explain:"So shows a result or consequence.", tags:["coordination"] },
      { type:"gapfill", prompt:"Link these so passing was the result of studying hard", before:"He studied hard", after:"he passed the test.", cue:"what's the link?", accept:["so","and"], explain:"So makes the result explicit: he studied hard, so he passed.", tags:["coordination"] },
      { type:"gapfill", prompt:"Link these to show she kept going despite being tired", before:"She was tired", after:"she kept working.", cue:"what's the link?", accept:["but","yet"], explain:"But (or yet) shows the contrast: tired, yet she kept working.", tags:["coordination"] },
      { type:"gapfill", prompt:"Link these to offer a choice of drink", before:"Do you want tea", after:"coffee?", cue:"what's the link?", accept:["or"], explain:"Or offers a choice between tea and coffee.", tags:["coordination"] },
      { type:"choose", prompt:"Which sentence correctly links two equal ideas?", options:["She likes maths and science.","She likes maths and she hates science.","She likes maths, and science is hard.","She likes maths and wants to study it."], answer:"She likes maths and science.", explain:"'And' joins two ideas of equal weight: she likes both maths and science.", tags:["coordination"] },
      { type:"choose", prompt:"Which sentence shows the second idea is surprising after the first?", options:["He was tall and strong.","He was tired, so he slept.","He was tired, but he kept working.","He studied and passed the test."], answer:"He was tired, but he kept working.", explain:"'But' shows contrast: expected to stop (tired) yet continued (kept working).", tags:["coordination"] },
      { type:"join", prompt:"Combine these into one sentence — both events happened, one then the other", sentence1:"The dog barked loudly.", sentence2:"The cat ran away.", accept:["the dog barked loudly and the cat ran away","and the cat ran away","the dog barked loudly and the cat","the dog barked and the cat ran away"], explain:"'And' joins two events of equal importance, one after the other.", tags:["coordination"] },
      { type:"join", prompt:"Combine these to show the swim was a surprise — it happened despite the cold", sentence1:"It was very cold.", sentence2:"We went swimming anyway.", accept:["it was very cold but we went swimming anyway","but we went swimming anyway","it was cold but we went swimming"], explain:"'But' shows the contrast: cold, yet we swam anyway.", tags:["coordination"] },
      { type:"join", prompt:"Combine these to show that forgetting the homework is why she got extra time", sentence1:"She forgot her homework.", sentence2:"The teacher gave her extra time.", accept:["she forgot her homework so the teacher gave her extra time","so the teacher gave her extra time","she forgot so the teacher gave her extra time"], explain:"'So' shows the result: she forgot, so the teacher gave her extra time.", tags:["coordination"] },
      { type:"match", prompt:"Same two ideas, different connective. Match each sentence to the relationship it shows.", pairs:[
          { sentence:"She was tired, so she stopped working.", meaning:"Being tired caused her to stop (result)" },
          { sentence:"She was tired, but she kept working.", meaning:"She kept going despite being tired (contrast)" },
          { sentence:"She was tired, and she went home.", meaning:"One thing, then the next (addition)" }
        ], explain:"The connective is what carries the meaning: so = result, but = contrast, and = addition.", tags:["coordination"] },
  ] },
  { id:"sentence-c3", category:"Sentence Structure", band:"C3", name:"Subordination", example:"Although it was raining, we went out.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Complex Sentences",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Complex-Sentences.aspx"},{name:"Clauses",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Clauses.aspx"},{name:"Khan: Complex sentences",url:"https://www.khanacademy.org/humanities/grammar/syntax-sentences-and-clauses/types-of-sentences/e/complex-and-compound-complex-sentences"},{name:"ABC: Linking words",url:"https://www.abc.net.au/education/learn-english/learn-english:-how-to-use-linking-words-when-youre-speaking/8878386"}] },
  vocab:[
    {term:"subordinate clause",def:"A clause that cannot stand alone — it needs a main clause to make sense.",example:"<b>Although it was raining</b>, we went out."},
    {term:"subordinating conjunction",def:"A word that introduces a subordinate clause: because, although, when, if, while.",example:"We stayed inside <b>because</b> it was cold."},
    {term:"main clause",def:"The part of the sentence that makes sense on its own.",example:"Although it was raining, <b>we went out</b>."},
  ],
  worked:[
    { text:"Although it was raining, we went out.", note:"Subordinate clause first, then the main clause — comma between." },
    { text:"We went out although it was raining.", note:"Same meaning, main clause first — no comma needed." },
    { text:"Because she was late, she missed the bus.", note:"<b>because</b> gives the reason." },
    { text:"When the bell rang, the students stood up.", note:"<b>when</b> marks the time." },
  ],
  sort:{
    prompt:"Drag each clause to where it belongs. A main clause makes sense alone; a subordinate clause leaves you hanging.",
    zones:["Main clause","Subordinate clause"],
    modelled:[
      { text:"we went out", zone:"Main clause", explain:"This makes complete sense on its own — it is a main clause." },
      { text:"Although it was raining", zone:"Subordinate clause", explain:"This leaves you waiting for more — it is a subordinate clause." },
    ],
    items:[
      { text:"Because it was hot", zone:"Subordinate clause" },
      { text:"we went swimming", zone:"Main clause" },
      { text:"the students stood up", zone:"Main clause" },
      { text:"When the bell rang", zone:"Subordinate clause" },
      { text:"After she finished her homework", zone:"Subordinate clause" },
      { text:"she went outside", zone:"Main clause" },
      { text:"He wore a jacket", zone:"Main clause" },
      { text:"because it was cold", zone:"Subordinate clause" },
    ],
  },
  items:[
      { type:"identify", prompt:"Which word gives the reason they went swimming?", sentence:"Because it was hot, we went swimming.", options:["Because","it was","hot","we went"], answer:"Because", explain:"Because introduces the reason clause (subordinate clause).", tags:["subordination"] },
      { type:"identify", prompt:"Which word signals the contrast with leaving early?", sentence:"She left early although she wanted to stay.", options:["She","early","although","wanted"], answer:"although", explain:"Although introduces a contrast clause.", tags:["subordination"] },
      { type:"identify", prompt:"Which part is the subordinate clause — the one that leaves you hanging?", sentence:"When the bell rang, the students stood up.", options:["When the bell rang","the students stood up"], answer:"When the bell rang", explain:"A subordinate clause can't stand alone: 'When the bell rang' leaves you waiting for what happened. 'The students stood up' is the main clause and works by itself.", tags:["subordination"] },
      { type:"gapfill", prompt:"Begin the sentence to show the order in time: homework first, then outside", before:"", after:"she finished her homework, she went outside.", cue:"what shows the time order?", accept:["after","when"], explain:"After (or when) shows the time order: finishing homework came first.", tags:["subordination"] },
      { type:"gapfill", prompt:"Connect these to give the reason he wore a jacket", before:"He wore a jacket", after:"it was cold.", cue:"what gives the reason?", accept:["because","as"], explain:"Because (or as) gives the reason for wearing a jacket.", tags:["subordination"] },
      { type:"gapfill", prompt:"Connect these so the game starts the moment everyone arrives", before:"We will start the game", after:"everyone arrives.", cue:"what marks the time?", accept:["when","once","after"], explain:"When (or once/after) shows the time the game will start.", tags:["subordination"] },
  ] },
  { id:"sentence-c4", category:"Sentence Structure", band:"C4/C4+", name:"Cleft / Emphatic", example:"It was Mia who solved the problem.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Varying Sentence Openings",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Varying-Sentence-Openings.aspx"},{name:"Cumulative and Periodic Sentences",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Cumulative-and-Periodic-Sentences.aspx"}] },
  vocab:[
    {term:"cleft sentence",def:"A sentence split into two parts to put extra focus on one piece of information.",example:"<b>It was Mia</b> who solved the problem."},
    {term:"emphasis",def:"Drawing special attention to one part of a sentence.",example:"It was <b>the rain</b> that ruined the picnic."},
  ],
  worked:[
    { text:"It was Mia who solved the problem.", note:"It was + <b>Mia</b> (focus) + who... — emphasises who did it." },
    { text:"It was the rain that ruined the picnic.", note:"Same frame, emphasising a thing instead of a person." },
    { text:"It was in Melbourne that they met.", note:"You can emphasise a place too." },
    { text:"What she wanted was a new phone.", note:"What ... was ... is another way to add emphasis." },
  ],
  sort:{
    prompt:"A cleft sentence is reshaped to stress one idea. Drag each sentence to Cleft or Plain.",
    zones:["Cleft sentence","Plain sentence"],
    modelled:[
      { text:"It was Mia who solved it.", zone:"Cleft sentence", explain:"It was ... who ... reshapes the sentence to stress Mia — that is a cleft." },
      { text:"Mia solved it.", zone:"Plain sentence", explain:"Plain word order, no special stress — a plain sentence." },
    ],
    items:[
      { text:"It was the rain that ruined the picnic.", zone:"Cleft sentence" },
      { text:"The rain ruined the picnic.", zone:"Plain sentence" },
      { text:"What she wanted was a phone.", zone:"Cleft sentence" },
      { text:"She wanted a phone.", zone:"Plain sentence" },
      { text:"It was in Melbourne that they met.", zone:"Cleft sentence" },
      { text:"They met in Melbourne.", zone:"Plain sentence" },
    ],
  },
  items:[
      { type:"identify", prompt:"What type of sentence is this?", sentence:"<b>It was</b> the rain <b>that</b> ruined the picnic.", options:["cleft sentence","passive sentence","conditional sentence","simple sentence"], answer:"cleft sentence", explain:"It was ... that ... splits the sentence to emphasise the rain.", tags:["cleft"] },
      { type:"identify", prompt:"What is being emphasised?", sentence:"It was Priya who broke the window.", options:["Priya","the window","broke","who"], answer:"Priya", explain:"The cleft structure puts Priya in the focus position.", tags:["cleft"] },
      { type:"identify", prompt:"What type of sentence is this?", sentence:"<b>What she wanted</b> was a new phone.", options:["cleft sentence","simple sentence","passive sentence","conditional sentence"], answer:"cleft sentence", explain:"What ... was ... is a pseudo-cleft that emphasises a new phone.", tags:["cleft"] },
      { type:"gapfill", prompt:"Complete the cleft sentence", before:"It was my sister", after:"found the lost key.", cue:"who / that / which", accept:["who","that"], explain:"Who or that introduces the relative clause in a cleft.", tags:["cleft"] },
      { type:"gapfill", prompt:"Complete the cleft sentence", before:"It was in Melbourne", after:"they first met.", cue:"that / who / which", accept:["that"], explain:"That links the focus (in Melbourne) to the rest of the cleft.", tags:["cleft"] },
      { type:"gapfill", prompt:"Rewrite as a cleft: emphasise 'the noise'", before:"It was", after:"that woke me up.", cue:"the noise", accept:["the noise"], explain:"The cleft moves 'the noise' into the focus position after 'It was'.", tags:["cleft"] },
  ] },

  /* ========= 2. VERB TENSES (assessed) ========= */
  { id:"tense-c1", category:"Verb Tenses", band:"C1", name:"Present Simple/Continuous, Past Simple", example:"I live in Melbourne. I am learning English.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Khan: Intro to verb tense",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/the-tenses/e/intro-to-verb-tense"},{name:"ABC: Was and were",url:"https://www.abc.net.au/education/learn-english/learn-english-was-and-were/7836102"}] },
  vocab:[
    {term:"present simple",def:"A tense for habits, facts, and routines — no -ing, no helping verb.",example:"She <b>works</b> at the hospital."},
    {term:"present continuous",def:"A tense for actions happening right now: am/is/are + verb-ing.",example:"They <b>are watching</b> a film."},
    {term:"past simple",def:"A tense for finished actions in the past, usually verb + ed.",example:"Yesterday she <b>walked</b> to school."},
  ], items:[
      { type:"identify", prompt:"Name the tense", sentence:"She <b>works</b> at the hospital.",        options:["present simple","present continuous","past simple","present perfect"], answer:"present simple",      explain:"Verb + s for a habit or fact = present simple.", tags:["present-simple"] },
      { type:"identify", prompt:"Name the tense", sentence:"They <b>are watching</b> a film right now.", options:["present simple","present continuous","past continuous","present perfect"], answer:"present continuous", explain:"am/is/are + verb-ing = present continuous.", tags:["present-continuous"] },
      { type:"identify", prompt:"Name the tense", sentence:"Yesterday she <b>walked</b> to school.",     options:["present simple","past simple","present continuous","present perfect"], answer:"past simple",         explain:"Regular verb + ed for a finished past action = past simple.", tags:["past-simple"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"Right now, I", after:"English.",  cue:"study",  accept:["am studying"], explain:"Happening now = present continuous: am + studying.", tags:["present-continuous"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"Every morning she", after:"the bus.", cue:"catch", accept:["catches"], explain:"Habit, third person singular = catch + es.", tags:["present-simple"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"Last weekend they", after:"their cousins.", cue:"visit", accept:["visited"], explain:"Finished past = visit + ed.", tags:["past-simple"] },
      { type:"choose", prompt:"Which sentence is present simple?", options:["I am studying maths right now.","I study maths every day.","I studied maths yesterday.","I am going to study maths tomorrow."], answer:"I study maths every day.", explain:"'Study' (no -ing, no 'am') = present simple, a habit or fact.", tags:["present-simple"] },
      { type:"choose", prompt:"Which is past simple?", options:["She walks to school.","She is walking to school.","She walked to school.","She has walked to school."], answer:"She walked to school.", explain:"'Walked' (verb + ed) = past simple, a completed action.", tags:["past-simple"] },
      { type:"choose", prompt:"Which is happening right now?", options:["They watch a film.","They are watching a film.","They watched a film.","They have watched a film."], answer:"They are watching a film.", explain:"'Are watching' (am/is/are + verb-ing) = present continuous, happening now.", tags:["present-continuous"] },
  ]},
  { id:"tense-c2", category:"Verb Tenses", band:"C2", name:"Present Perfect", example:"I have visited Japan.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Khan: Perfect aspect",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/verb-aspect-simple-progressive-and-perfect/e/perfect-verb-aspect"}] },
  vocab:[
    {term:"present perfect",def:"A tense that links a past action to now: have/has + past participle.",example:"She <b>has lived</b> in Sydney for three years."},
    {term:"past participle",def:"The verb form used after have/has — often ends in -ed or is irregular (gone, seen, written).",example:"I have <b>visited</b> Japan."},
  ], items:[
      { type:"identify", prompt:"Name the tense", sentence:"She <b>has lived</b> in Sydney for three years.", options:["present perfect","past simple","present simple","past perfect"], answer:"present perfect", explain:"has/have + past participle = present perfect.", tags:["present-perfect"] },
      { type:"identify", prompt:"Name the tense", sentence:"They <b>have never eaten</b> sushi.", options:["present perfect","past simple","present continuous","past perfect"], answer:"present perfect", explain:"have + never + past participle = present perfect (experience).", tags:["present-perfect"] },
      { type:"identify", prompt:"Name the tense", sentence:"I <b>have just finished</b> my homework.", options:["present perfect","past simple","present continuous","future simple"], answer:"present perfect", explain:"have + just + past participle = present perfect (recent event).", tags:["present-perfect"] },
      { type:"gapfill", prompt:"Write the correct form", before:"We", after:"that movie twice.", cue:"see", accept:["have seen"], explain:"Experience up to now = have + past participle: have seen.", tags:["present-perfect"] },
      { type:"gapfill", prompt:"Write the correct form", before:"He", after:"his lunch yet.", cue:"not eat", accept:["has not eaten","hasn't eaten","hasnt eaten"], explain:"Third person + not + past participle: has not eaten.", tags:["present-perfect"] },
      { type:"gapfill", prompt:"Write the correct form", before:"She", after:"to Perth three times.", cue:"travel", accept:["has travelled","has traveled"], explain:"Third person experience = has + past participle: has travelled.", tags:["present-perfect"] },
      { type:"match", prompt:"Same place, different tense. Match each sentence to what it really tells you.", pairs:[
          { sentence:"I have lived in Spain.", meaning:"It's part of my life experience (it still counts now)" },
          { sentence:"I lived in Spain.", meaning:"A finished fact about the past (that time is over)" }
        ], explain:"Present perfect links the past to now; past simple closes it off in the past.", tags:["present-perfect"] },
  ] },
  { id:"tense-c3", category:"Verb Tenses", band:"C3", name:"Past Perfect / Progressive", example:"He had been waiting when I arrived.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Khan: Progressive aspect",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/verb-aspect-simple-progressive-and-perfect/e/progressive-verb-aspect"}] },
  vocab:[
    {term:"past perfect",def:"A tense for an action finished before another past event: had + past participle.",example:"She <b>had finished</b> dinner before the guests arrived."},
    {term:"past perfect progressive",def:"A tense showing an ongoing action before another past event: had been + verb-ing.",example:"They <b>had been playing</b> for an hour when it rained."},
    {term:"past continuous",def:"A tense for an action in progress in the past: was/were + verb-ing.",example:"He <b>was reading</b> when the phone rang."},
  ], items:[
      { type:"identify", prompt:"Name the tense", sentence:"She <b>had finished</b> dinner before the guests arrived.", options:["past perfect","past simple","present perfect","past continuous"], answer:"past perfect", explain:"had + past participle = past perfect (earlier past event).", tags:["past-perfect"] },
      { type:"identify", prompt:"Name the tense", sentence:"They <b>had been playing</b> for an hour when it started raining.", options:["past perfect progressive","past continuous","present perfect","past perfect"], answer:"past perfect progressive", explain:"had been + verb-ing = past perfect progressive.", tags:["past-perfect-progressive"] },
      { type:"identify", prompt:"Name the tense", sentence:"He <b>was reading</b> when the phone rang.", options:["past continuous","past simple","past perfect","present continuous"], answer:"past continuous", explain:"was/were + verb-ing = past continuous (action in progress in the past).", tags:["past-continuous"] },
      { type:"gapfill", prompt:"Write the correct form", before:"By the time we arrived, the film", after:".", cue:"already start", accept:["had already started"], explain:"Earlier past action = had + already + past participle.", tags:["past-perfect"] },
      { type:"gapfill", prompt:"Write the correct form", before:"She", after:"for two hours when the bus finally came.", cue:"wait", accept:["had been waiting"], explain:"Duration before a past event = had been + verb-ing.", tags:["past-perfect-progressive"] },
      { type:"gapfill", prompt:"Write the correct form", before:"They", after:"all afternoon before it rained.", cue:"swim", accept:["had been swimming"], explain:"Ongoing past action before another past event = had been swimming.", tags:["past-perfect-progressive"] },
  ] },
  { id:"tense-c4", category:"Verb Tenses", band:"C4/C4+", name:"Future Progressive / Perfect", example:"By next year, she will be working in Sydney.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Khan: Progressive perfect",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/verb-aspect-and-modal-verbs/e/progressive-perfect-verb-aspect"},{name:"ABC: Will or going to",url:"https://www.abc.net.au/education/learn-english/learn-english-will-or-going-to/7383378"}] },
  vocab:[
    {term:"future progressive",def:"A tense for an action ongoing at a future time: will be + verb-ing.",example:"This time next week, I <b>will be flying</b> to London."},
    {term:"future perfect",def:"A tense for an action completed before a future point: will have + past participle.",example:"By Friday, she <b>will have completed</b> the project."},
  ], items:[
      { type:"identify", prompt:"Name the tense", sentence:"This time next week, I <b>will be flying</b> to London.", options:["future progressive","future perfect","present continuous","future simple"], answer:"future progressive", explain:"will be + verb-ing = future progressive (ongoing at a future time).", tags:["future-progressive"] },
      { type:"identify", prompt:"Name the tense", sentence:"By Friday, she <b>will have completed</b> the project.", options:["future perfect","future progressive","present perfect","past perfect"], answer:"future perfect", explain:"will have + past participle = future perfect (done before a future point).", tags:["future-perfect"] },
      { type:"identify", prompt:"Name the tense", sentence:"At 9 pm tonight, they <b>will be watching</b> the match.", options:["future progressive","future simple","present continuous","future perfect"], answer:"future progressive", explain:"will be + verb-ing = future progressive.", tags:["future-progressive"] },
      { type:"gapfill", prompt:"Write the correct form", before:"By December, we", after:"here for five years.", cue:"live", accept:["will have lived"], explain:"Completed duration by a future point = will have + past participle.", tags:["future-perfect"] },
      { type:"gapfill", prompt:"Write the correct form", before:"This time tomorrow, he", after:"on the train.", cue:"sit", accept:["will be sitting"], explain:"In progress at a future moment = will be + verb-ing.", tags:["future-progressive"] },
      { type:"gapfill", prompt:"Write the correct form", before:"By the end of the year, she", after:"200 books.", cue:"read", accept:["will have read"], explain:"Accumulated total by a future deadline = will have + past participle.", tags:["future-perfect"] },
  ] },

  /* ========= 3. MODALITY (assessed) ========= */
  { id:"modality-c1", category:"Modality", band:"C1", name:"Must / Can", example:"You must wear a helmet. She can swim.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"},{name:"Khan: Modal verbs",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/verb-aspect-and-modal-verbs/e/modal-verbs"},{name:"ABC: Can or could",url:"https://www.abc.net.au/education/learn-english/learn-english-can-or-could/7360062"}] },
  vocab:[
    {term:"modal verb",def:"A helping verb that shows ability, obligation, permission, or possibility (can, must, may, might, should, could, would).",example:"You <b>must</b> wear a seatbelt."},
    {term:"obligation",def:"Something you have to do — a rule or requirement.",example:"You <b>must</b> wear a helmet when cycling."},
    {term:"ability",def:"Something you are able to do — a skill or capability.",example:"She <b>can</b> speak three languages."},
  ], items:[
      { type:"identify", prompt:"What does the modal show?", sentence:"You <b>must</b> wear a seatbelt.",     options:["obligation","ability","advice","possibility"], answer:"obligation", explain:"must = a rule / strong obligation.", tags:["must"] },
      { type:"identify", prompt:"What does the modal show?", sentence:"She <b>can</b> speak three languages.", options:["obligation","ability","advice","possibility"], answer:"ability",    explain:"can = ability.", tags:["can"] },
      { type:"gapfill",  prompt:"Add the modal (obligation)", before:"You", after:"wear a helmet when cycling.", cue:"must / can", accept:["must"], explain:"A rule = must.", tags:["must"] },
      { type:"gapfill",  prompt:"Add the modal (ability)",    before:"He", after:"swim very well.",             cue:"must / can", accept:["can"],  explain:"Ability = can.", tags:["can"] },
      { type:"choose", prompt:"Which shows obligation?", options:["You can swim.","You must wear a seatbelt.","You might be late.","You could help if you wanted."], answer:"You must wear a seatbelt.", explain:"'Must' shows a rule or strong obligation.", tags:["must"] },
      { type:"choose", prompt:"Which shows ability?", options:["She must study hard.","She can speak French.","She might come tomorrow.","She may leave now."], answer:"She can speak French.", explain:"'Can' = ability to do something.", tags:["can"] },
  ]},
  { id:"modality-c2", category:"Modality", band:"C2", name:"May / Might", example:"It might rain tomorrow.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"},{name:"ABC: Modal requests",url:"https://www.abc.net.au/education/learn-english/how-to-make-polite-requests-in-english-using-modal-verbs/13653604"}] },
  vocab:[
    {term:"possibility",def:"Something that could happen but is not certain.",example:"It <b>might</b> rain tomorrow."},
    {term:"permission",def:"Being allowed to do something, given by an authority.",example:"You <b>may</b> leave the room now."},
  ], items:[
      { type:"identify", prompt:"What does the modal show?", sentence:"She <b>might</b> come to the party.", options:["possibility","obligation","ability","advice"], answer:"possibility", explain:"Might = something is possible but not certain.", tags:["might"] },
      { type:"identify", prompt:"What does the modal show?", sentence:"You <b>may</b> leave the room now.", options:["permission","possibility","ability","obligation"], answer:"permission", explain:"May from a teacher or authority = giving permission.", tags:["may"] },
      { type:"identify", prompt:"What does the modal show?", sentence:"It <b>may</b> snow tonight.", options:["possibility","permission","ability","obligation"], answer:"possibility", explain:"May + weather prediction = possibility.", tags:["may"] },
      { type:"gapfill", prompt:"Add the modal (possibility)", before:"He", after:"be late for class.", cue:"may / might", accept:["may","might"], explain:"Both may and might express possibility here.", tags:["may","might"] },
      { type:"gapfill", prompt:"Add the modal (permission)", before:"You", after:"use my calculator.", cue:"may / must", accept:["may"], explain:"Giving permission = may.", tags:["may"] },
      { type:"gapfill", prompt:"Add the modal (possibility)", before:"They", after:"move to Brisbane next year.", cue:"might / must", accept:["might"], explain:"Uncertain future plan = might (possibility, not obligation).", tags:["might"] },
  ] },
  { id:"modality-c3", category:"Modality", band:"C3", name:"Modal Perfect", example:"She should have studied harder.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"},{name:"ABC: Could have / would have",url:"https://www.abc.net.au/education/learn-english/learn-english-could-have-or-would-have/7357694"}] },
  vocab:[
    {term:"modal perfect",def:"A modal verb + have + past participle — talks about the past from now.",example:"She <b>should have studied</b> harder."},
    {term:"regret",def:"Wishing something in the past had been different.",example:"He <b>should have called</b> his mum."},
    {term:"deduction",def:"A strong conclusion based on evidence.",example:"She <b>must have forgotten</b> her keys."},
  ], items:[
      { type:"identify", prompt:"What does the modal perfect show?", sentence:"He <b>should have called</b> his mum.", options:["regret about the past","future plan","present ability","permission"], answer:"regret about the past", explain:"Should have + past participle = it was the right thing but he did not do it.", tags:["should-have"] },
      { type:"identify", prompt:"What does the modal perfect show?", sentence:"She <b>must have forgotten</b> her keys.", options:["deduction about the past","obligation","permission","advice"], answer:"deduction about the past", explain:"Must have + past participle = a strong conclusion about what happened.", tags:["must-have"] },
      { type:"identify", prompt:"What does the modal perfect show?", sentence:"They <b>could have won</b> the game.", options:["past possibility that did not happen","present ability","future possibility","obligation"], answer:"past possibility that did not happen", explain:"Could have + past participle = it was possible but did not happen.", tags:["could-have"] },
      { type:"gapfill", prompt:"Write the modal perfect form", before:"You", after:"earlier. Now we are late.", cue:"should / leave", accept:["should have left"], explain:"Past regret = should have + past participle.", tags:["should-have"] },
      { type:"gapfill", prompt:"Write the modal perfect form", before:"It is wet outside. It", after:"during the night.", cue:"must / rain", accept:["must have rained"], explain:"Strong deduction about the past = must have + past participle.", tags:["must-have"] },
      { type:"gapfill", prompt:"Write the modal perfect form", before:"We", after:"the bus, but we walked instead.", cue:"could / take", accept:["could have taken"], explain:"Past possibility not taken = could have + past participle.", tags:["could-have"] },
  ] },
  { id:"modality-c4", category:"Modality", band:"C4/C4+", name:"Modal Progressive", example:"You might have been speeding.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"}] },
  vocab:[
    {term:"modal perfect progressive",def:"Modal + have been + verb-ing — speculation about an ongoing past action.",example:"She <b>must have been sleeping</b> when I called."},
    {term:"speculation",def:"An uncertain guess about what was or is happening.",example:"He <b>might have been working</b> when the fire started."},
  ], items:[
      { type:"identify", prompt:"Name the modal form", sentence:"She <b>must have been sleeping</b> when I called.", options:["modal perfect progressive","modal perfect","past continuous","present perfect progressive"], answer:"modal perfect progressive", explain:"must have been + verb-ing = deduction about an ongoing past action.", tags:["modal-perfect-progressive"] },
      { type:"identify", prompt:"Name the modal form", sentence:"They <b>could have been waiting</b> for hours.", options:["modal perfect progressive","past perfect progressive","modal perfect","future progressive"], answer:"modal perfect progressive", explain:"could have been + verb-ing = past possibility of an ongoing action.", tags:["modal-perfect-progressive"] },
      { type:"identify", prompt:"What does this show?", sentence:"He <b>might have been working</b> when the fire started.", options:["speculation about an ongoing past action","a future plan","a present habit","an obligation"], answer:"speculation about an ongoing past action", explain:"Might have been + verb-ing = uncertain guess about what was happening.", tags:["modal-perfect-progressive"] },
      { type:"gapfill", prompt:"Write the modal progressive form", before:"She", after:"all night; she looks exhausted.", cue:"must / study", accept:["must have been studying"], explain:"Strong deduction about ongoing past = must have been + verb-ing.", tags:["modal-perfect-progressive"] },
      { type:"gapfill", prompt:"Write the modal progressive form", before:"They", after:"for the wrong bus.", cue:"might / wait", accept:["might have been waiting"], explain:"Speculation about ongoing past = might have been + verb-ing.", tags:["modal-perfect-progressive"] },
      { type:"gapfill", prompt:"Write the modal progressive form", before:"He", after:"too fast when the accident happened.", cue:"could / drive", accept:["could have been driving"], explain:"Possible ongoing past action = could have been + verb-ing.", tags:["modal-perfect-progressive"] },
  ] },

  /* ========= 4. CONDITIONALS (assessed) ========= */
  { id:"cond-c1", category:"Conditionals", band:"C1", name:"Zero", example:"If you heat ice, it melts.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Conditionals",url:"https://www.abc.net.au/education/learn-english/conditionals-in-english/11359496"}] },
  vocab:[
    {term:"conditional",def:"A sentence with an if-clause that describes what happens under certain conditions.",example:"<b>If</b> you heat ice, it melts."},
    {term:"zero conditional",def:"If + present, present — for facts and things that are always true.",example:"If you heat ice, it <b>melts</b>."},
  ], items:[
      { type:"gapfill", prompt:"Write the correct form", before:"If you heat ice, it", after:".", cue:"melt", accept:["melts"], explain:"Zero conditional: present + present for facts.", tags:["zero"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If you press this button, the light", after:".", cue:"turn on", accept:["turns on"], explain:"Zero conditional: a general truth, present + present.", tags:["zero"] },
      { type:"identify", prompt:"Which conditional?", sentence:"If water reaches 100 degrees, it <b>boils</b>.", options:["zero conditional","first conditional","second conditional","third conditional"], answer:"zero conditional", explain:"Always-true scientific fact, present + present = zero conditional.", tags:["zero"] },
      { type:"identify", prompt:"Which conditional?", sentence:"If you touch fire, you <b>get</b> burnt.", options:["zero conditional","first conditional","second conditional","third conditional"], answer:"zero conditional", explain:"General fact, present + present = zero conditional.", tags:["zero"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If plants do not get water, they", after:".", cue:"die", accept:["die"], explain:"Zero conditional: general truth = present + present.", tags:["zero"] },
      { type:"choose", prompt:"Which is a zero conditional?", options:["If you study, you will pass.","If you mix blue and yellow, you get green.","If I were rich, I would travel.","If she had studied, she would have passed."], answer:"If you mix blue and yellow, you get green.", explain:"Always-true fact, present + present = zero conditional.", tags:["zero"] },
      { type:"choose", prompt:"Which sentence is always true?", options:["If it rains, we will stay inside.","If you add salt to water, it dissolves.","If I studied, I would pass.","If they had left earlier, they would have arrived."], answer:"If you add salt to water, it dissolves.", explain:"A scientific/general fact = zero conditional (always true).", tags:["zero"] },
  ]},
  { id:"cond-c2", category:"Conditionals", band:"C2", name:"First", example:"If I study, I will pass.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Will or going to",url:"https://www.abc.net.au/education/learn-english/learn-english-will-or-going-to/7383378"}] },
  vocab:[
    {term:"first conditional",def:"If + present simple, will + base verb — for real, likely future situations.",example:"If I study, I <b>will pass</b>."},
    {term:"if-clause",def:"The part of a conditional sentence that starts with if — it sets the condition.",example:"<b>If it rains</b>, we will stay inside."},
    {term:"result clause",def:"The part that says what happens if the condition is met.",example:"If it rains, <b>we will stay inside</b>."},
  ], items:[
      { type:"gapfill",  prompt:"Write the correct form", before:"If I study, I", after:"the test.",      cue:"pass", accept:["will pass","ll pass"], explain:"First conditional: if + present, will + base verb.", tags:["first"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"If it", after:", we will stay inside.", cue:"rain", accept:["rains"], explain:"The if-clause uses the present simple: rains.", tags:["first"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"If you do not hurry, we", after:"the bus.", cue:"miss", accept:["will miss","ll miss"], explain:"Result clause of a first conditional = will + base verb: will miss.", tags:["first"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"If the team", after:"hard, they will win the final.", cue:"train", accept:["trains"], explain:"The if-clause uses present simple; third person singular = train + s.", tags:["first"] },
      { type:"identify", prompt:"Which conditional?", sentence:"If you mix blue and yellow, you <b>get</b> green.", options:["zero conditional","first conditional","second conditional","third conditional"], answer:"zero conditional",  explain:"Always-true fact, present + present = zero conditional (not first).", tags:["zero"] },
      { type:"identify", prompt:"Which conditional?", sentence:"If I finish early, I <b>will call</b> you.",        options:["zero conditional","first conditional","second conditional","third conditional"], answer:"first conditional", explain:"Real future possibility, will + base verb = first conditional.", tags:["first"] },
      { type:"identify", prompt:"Real and likely, or imaginary?", sentence:"If she practises every day, she will improve.", options:["real and likely","imaginary and unlikely","always true","a past regret"], answer:"real and likely", explain:"First conditional is about a real, likely future: if + present, will + base.", tags:["first"] },
      { type:"choose", prompt:"Which is a correct first conditional?", options:["If it rains, we will cancel the picnic.","If it will rain, we will cancel the picnic.","If it rains, we cancelled the picnic.","If it rained, we would cancel the picnic."], answer:"If it rains, we will cancel the picnic.", explain:"If + present simple (rains), then will + base verb (cancel). Never put 'will' in the if-clause.", tags:["first"] },
  ]},
  { id:"cond-c3", category:"Conditionals", band:"C3", name:"Second", example:"If I were taller, I'd play basketball.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Conditionals",url:"https://www.abc.net.au/education/learn-english/conditionals-in-english/11359496"},{name:"ABC: Will or would",url:"https://www.abc.net.au/education/learn-english/learn-english-will-or-would/7360202"}] },
  vocab:[
    {term:"second conditional",def:"If + past simple, would + base verb — for imaginary or unlikely situations now.",example:"If I <b>had</b> a million dollars, I <b>would travel</b>."},
    {term:"unreal",def:"Describing a situation that is imagined, not actual.",example:"If she <b>were</b> taller, she would play basketball."},
  ], items:[
      { type:"identify", prompt:"Which conditional?", sentence:"If I <b>had</b> a million dollars, I <b>would travel</b> the world.", options:["second conditional","first conditional","zero conditional","third conditional"], answer:"second conditional", explain:"If + past simple, would + base = second conditional (unreal present).", tags:["second"] },
      { type:"identify", prompt:"Which conditional?", sentence:"If she <b>were</b> taller, she <b>would play</b> basketball.", options:["second conditional","first conditional","third conditional","zero conditional"], answer:"second conditional", explain:"If + were, would + base = second conditional (imaginary situation).", tags:["second"] },
      { type:"identify", prompt:"Is this real or imaginary?", sentence:"If I <b>won</b> the lottery, I <b>would buy</b> a house.", options:["imaginary (unlikely)","real (likely)","always true","past regret"], answer:"imaginary (unlikely)", explain:"Second conditional describes situations the speaker considers unlikely.", tags:["second"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If I", after:"you, I would apologise.", cue:"be", accept:["were","was"], explain:"If I were you = second conditional (were is traditional, was is accepted).", tags:["second"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If we had more time, we", after:"to the beach.", cue:"go", accept:["would go","d go"], explain:"would + base verb in the result clause of the second conditional.", tags:["second"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If he", after:"harder, he would get better marks.", cue:"study", accept:["studied"], explain:"If-clause uses past simple in the second conditional: studied.", tags:["second"] },
  ] },
  { id:"cond-c4", category:"Conditionals", band:"C4/C4+", name:"Third & Mixed / Unreal", example:"If he had left earlier, he would have caught the train.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Could have / would have",url:"https://www.abc.net.au/education/learn-english/learn-english-could-have-or-would-have/7357694"}] },
  vocab:[
    {term:"third conditional",def:"If + past perfect, would have + past participle — imagining a different past.",example:"If she <b>had studied</b>, she <b>would have passed</b>."},
    {term:"mixed conditional",def:"Combines time frames — a past cause with a present result (or vice versa).",example:"If I <b>had known</b>, I <b>would be</b> there now."},
  ], items:[
      { type:"identify", prompt:"Which conditional?", sentence:"If she <b>had studied</b>, she <b>would have passed</b>.", options:["third conditional","second conditional","first conditional","zero conditional"], answer:"third conditional", explain:"If + past perfect, would have + past participle = third conditional (unreal past).", tags:["third"] },
      { type:"identify", prompt:"Which conditional?", sentence:"If I <b>had known</b>, I <b>would be</b> there now.", options:["mixed conditional","third conditional","second conditional","first conditional"], answer:"mixed conditional", explain:"If + past perfect, would + base = mixed (past cause, present result).", tags:["mixed"] },
      { type:"identify", prompt:"Is this about the past or present?", sentence:"If they <b>had left</b> earlier, they <b>would have arrived</b> on time.", options:["unreal past","unreal present","real future","always true"], answer:"unreal past", explain:"Third conditional imagines a different past that did not happen.", tags:["third"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If he had left earlier, he", after:"the train.", cue:"catch", accept:["would have caught"], explain:"Third conditional result = would have + past participle.", tags:["third"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If I", after:"about the test, I would have revised.", cue:"know", accept:["had known"], explain:"Third conditional if-clause = had + past participle.", tags:["third"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If she had eaten breakfast, she", after:"hungry now.", cue:"not be", accept:["would not be","wouldn't be","wouldnt be"], explain:"Mixed conditional: past cause, present result = would (not) + base.", tags:["mixed"] },
  ] },

  /* ========= 5. PASSIVE VOICE (assessed; grid C3 is blank) ========= */
  { id:"passive-c1", category:"Passive Voice", band:"C1", name:"Intro to Passive", example:"The letter was sent yesterday.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Active & passive voice",url:"https://www.abc.net.au/education/learn-english/active-and-passive-voice/9304750"}] },
  vocab:[
    {term:"active voice",def:"The subject does the action.",example:"<b>My grandmother</b> made the cake."},
    {term:"passive voice",def:"The subject receives the action — formed with be + past participle.",example:"The cake <b>was made</b> by my grandmother."},
  ], items:[
      { type:"identify", prompt:"Active or passive?", sentence:"The cake <b>was made</b> by my grandmother.", options:["passive","active"], answer:"passive", explain:"was + past participle = passive voice (the subject receives the action).", tags:["passive-intro"] },
      { type:"identify", prompt:"Active or passive?", sentence:"My grandmother <b>made</b> the cake.", options:["active","passive"], answer:"active", explain:"The subject does the action = active voice.", tags:["passive-intro"] },
      { type:"identify", prompt:"Active or passive?", sentence:"The window <b>was broken</b> during the storm.", options:["passive","active"], answer:"passive", explain:"was broken = passive (the window received the action).", tags:["passive-intro"] },
      { type:"gapfill", prompt:"Say what happened to the letter (keep the focus on the letter)", before:"The letter", after:"yesterday.", cue:"send (past)", accept:["was sent"], explain:"Passive past = was + past participle: was sent.", tags:["passive-intro"] },
      { type:"gapfill", prompt:"Say what happened to the homework", before:"The homework", after:"by the teacher.", cue:"check (past)", accept:["was checked"], explain:"Passive past = was + past participle: was checked.", tags:["passive-intro"] },
      { type:"gapfill", prompt:"Focus on the language, not the speakers", before:"English", after:"in many countries.", cue:"speak (present)", accept:["is spoken"], explain:"Passive present = is + past participle: is spoken.", tags:["passive-intro"] },
      { type:"transform", prompt:"Rewrite so the fence is the focus — what happened to it matters, not who did it", sentence:"My brother painted the fence.", accept:["the fence was painted by my brother","the fence was painted"], explain:"Active: my brother (subject) painted the fence. Passive: the fence becomes the subject — was painted.", tags:["passive-intro"] },
      { type:"transform", prompt:"Rewrite to put the homework first, when who marked it doesn't matter", sentence:"The teacher marked all the homework.", accept:["all the homework was marked by the teacher","all the homework was marked","the homework was marked"], explain:"The homework receives the action and becomes the subject: was marked.", tags:["passive-intro"] },
  ] },
  { id:"passive-c2", category:"Passive Voice", band:"C2", name:"Present / Past Passive", example:"These shoes were made in Italy.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Active & passive voice",url:"https://www.abc.net.au/education/learn-english/active-and-passive-voice/9304750"}] },
  vocab:[
    {term:"present passive",def:"Is/are + past participle — a passive action in the present.",example:"These shoes <b>are made</b> in Italy."},
    {term:"past passive",def:"Was/were + past participle — a passive action in the past.",example:"The bridge <b>was built</b> in 1932."},
  ], items:[
      { type:"identify", prompt:"Present passive or past passive?", sentence:"These shoes <b>are made</b> in Italy.", options:["present passive","past passive","present perfect passive","active voice"], answer:"present passive", explain:"are + past participle = present passive.", tags:["present-passive"] },
      { type:"identify", prompt:"Present passive or past passive?", sentence:"The bridge <b>was built</b> in 1932.", options:["past passive","present passive","past perfect passive","active voice"], answer:"past passive", explain:"was + past participle = past passive.", tags:["past-passive"] },
      { type:"identify", prompt:"Present passive or past passive?", sentence:"Rice <b>is grown</b> in many Asian countries.", options:["present passive","past passive","present continuous passive","active voice"], answer:"present passive", explain:"is + past participle = present passive (general fact).", tags:["present-passive"] },
      { type:"gapfill", prompt:"Write the passive form", before:"The books", after:"to the library yesterday.", cue:"return", accept:["were returned"], explain:"Past passive, plural subject = were + past participle.", tags:["past-passive"] },
      { type:"gapfill", prompt:"Write the passive form", before:"Coffee", after:"in Brazil.", cue:"grow", accept:["is grown"], explain:"Present passive fact = is + past participle.", tags:["present-passive"] },
      { type:"gapfill", prompt:"Write the passive form", before:"The email", after:"to all staff last Friday.", cue:"send", accept:["was sent"], explain:"Past passive, singular subject = was + past participle.", tags:["past-passive"] },
  ] },
  { id:"passive-c3", category:"Passive Voice", band:"C3", name:"—", example:"", introduced:false, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"passive-c4", category:"Passive Voice", band:"C4/C4+", name:"Passive Reporting", example:"The manager is said to have resigned.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Active & passive voice",url:"https://www.abc.net.au/education/learn-english/active-and-passive-voice/9304750"}] },
  vocab:[
    {term:"passive reporting",def:"Is said/believed/thought + to — reports what people say without naming them.",example:"The manager <b>is said to have resigned</b>."},
    {term:"reporting verb",def:"A verb used to pass on what others say: say, believe, think, report.",example:"He <b>is believed</b> to be very wealthy."},
  ], items:[
      { type:"identify", prompt:"What structure is this?", sentence:"The manager <b>is said to have resigned</b>.", options:["passive reporting","past passive","present perfect passive","active reporting"], answer:"passive reporting", explain:"is said to have = passive report of what people say happened.", tags:["passive-reporting"] },
      { type:"identify", prompt:"What structure is this?", sentence:"The team <b>is believed to be</b> the strongest in the league.", options:["passive reporting","present passive","past passive","active voice"], answer:"passive reporting", explain:"is believed to be = passive reporting structure.", tags:["passive-reporting"] },
      { type:"identify", prompt:"What structure is this?", sentence:"She <b>is thought to have left</b> the country.", options:["passive reporting","past perfect passive","present perfect passive","modal perfect"], answer:"passive reporting", explain:"is thought to have + past participle = passive report about a past action.", tags:["passive-reporting"] },
      { type:"gapfill", prompt:"Complete the passive report", before:"He", after:"to be very wealthy.", cue:"believe", accept:["is believed"], explain:"Passive reporting = is + past participle + to: is believed.", tags:["passive-reporting"] },
      { type:"gapfill", prompt:"Complete the passive report", before:"The suspect", after:"to have fled the city.", cue:"report", accept:["is reported","was reported"], explain:"Passive reporting = is/was reported + to have.", tags:["passive-reporting"] },
      { type:"gapfill", prompt:"Complete the passive report", before:"The painting", after:"to be worth millions.", cue:"say", accept:["is said"], explain:"Passive reporting = is said + to be.", tags:["passive-reporting"] },
  ] },

  /* ========= 6. RELATIVE CLAUSES (assessed; grid C3 is blank) ========= */
  { id:"relative-c1", category:"Relative Clauses", band:"C1", name:"Intro (who/which)", example:"That's the woman who helped me.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Relative Clauses",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Relative-Clauses.aspx"},{name:"Pronouns",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Pronouns.aspx"},{name:"Khan: Relative pronouns",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-pronoun/relative-pronouns/e/relative-pronouns"},{name:"ABC: Who or whom",url:"https://www.abc.net.au/education/learn-english/learn-english-who-or-whom/8063578"}] },
  vocab:[
    {term:"relative clause",def:"A clause that gives more information about a noun, starting with who, which, or that.",example:"The teacher <b>who teaches maths</b> is kind."},
    {term:"relative pronoun",def:"A word that introduces a relative clause: who (people), which (things), that (both).",example:"The boy <b>who</b> won the race is my friend."},
  ], items:[
      { type:"identify", prompt:"Which relative pronoun fits?", sentence:"That is the boy ___ won the race.", options:["who","which","that","where"], answer:"who", explain:"Who refers to a person.", tags:["who"] },
      { type:"identify", prompt:"Which relative pronoun fits?", sentence:"She found the book ___ was on the table.", options:["which","who","where","when"], answer:"which", explain:"Which refers to a thing.", tags:["which"] },
      { type:"identify", prompt:"What does the relative clause describe?", sentence:"The teacher <b>who teaches maths</b> is very kind.", options:["the teacher","maths","kind","teaches"], answer:"the teacher", explain:"The relative clause tells us more about the teacher.", tags:["who"] },
      { type:"gapfill", prompt:"Add the relative pronoun", before:"I have a friend", after:"speaks four languages.", cue:"who / which", accept:["who"], explain:"Friend is a person = who.", tags:["who"] },
      { type:"gapfill", prompt:"Add the relative pronoun", before:"This is the bus", after:"goes to the city.", cue:"who / which / that", accept:["which","that"], explain:"Bus is a thing = which or that.", tags:["which"] },
      { type:"gapfill", prompt:"Add the relative pronoun", before:"She is the doctor", after:"helped my mother.", cue:"who / which", accept:["who"], explain:"Doctor is a person = who.", tags:["who"] },
  ] },
  { id:"relative-c2", category:"Relative Clauses", band:"C2", name:"Defining / Non-defining", example:"My car, which is red, is outside.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Relative Clauses",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Relative-Clauses.aspx"},{name:"Comma Use",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Comma-Use.aspx"},{name:"Khan: Relative pronouns",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-pronoun/relative-pronouns/e/relative-pronouns"}] },
  vocab:[
    {term:"defining relative clause",def:"A clause that identifies which person or thing — no commas, essential information.",example:"The girl <b>who sits next to me</b> is from Japan."},
    {term:"non-defining relative clause",def:"A clause that adds extra info about something already identified — uses commas.",example:"My sister<b>, who lives in Perth,</b> is visiting."},
  ], items:[
      { type:"identify", prompt:"Defining or non-defining?", sentence:"The girl <b>who sits next to me</b> is from Japan.", options:["defining","non-defining"], answer:"defining", explain:"No commas, identifies which girl = defining.", tags:["defining"] },
      { type:"identify", prompt:"Defining or non-defining?", sentence:"My sister<b>, who lives in Perth,</b> is visiting next week.", options:["non-defining","defining"], answer:"non-defining", explain:"Commas around the clause, adds extra info = non-defining.", tags:["non-defining"] },
      { type:"identify", prompt:"Defining or non-defining?", sentence:"The phone <b>that I bought last week</b> is already broken.", options:["defining","non-defining"], answer:"defining", explain:"No commas, tells us which phone = defining.", tags:["defining"] },
      { type:"gapfill", prompt:"Add commas if needed (type the full clause)", before:"My dog", after:"loves swimming.", cue:"who is called Max / add commas if non-defining", accept:[", who is called max,",", who is called Max,"], explain:"My dog is unique, so this is non-defining and needs commas.", tags:["non-defining"] },
      { type:"gapfill", prompt:"Add the relative pronoun", before:"The students", after:"passed the exam were very happy.", cue:"who / which", accept:["who"], explain:"Students are people = who. No commas = defining.", tags:["defining"] },
      { type:"gapfill", prompt:"Add the relative pronoun", before:"The Yarra River", after:"runs through Melbourne, is very long.", cue:"who / which", accept:["which",", which"], explain:"The Yarra is unique, so use which with commas (non-defining).", tags:["non-defining"] },
      { type:"match", prompt:"The commas change who you mean. Match each sentence to what it tells you about the family.", pairs:[
          { sentence:"My sister who lives in Perth is a doctor.", meaning:"I have several sisters — this says which one" },
          { sentence:"My sister, who lives in Perth, is a doctor.", meaning:"I have one sister — Perth is just extra info" }
        ], explain:"No commas (defining) picks out which one; commas (non-defining) just add extra detail.", tags:["defining","non-defining"] },
  ] },
  { id:"relative-c3", category:"Relative Clauses", band:"C3", name:"—", example:"", introduced:false, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"relative-c4", category:"Relative Clauses", band:"C4/C4+", name:"Non-defining + Reduced", example:"Students living nearby don't drive.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Relative Clauses",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Relative-Clauses.aspx"},{name:"Embedding and Stacking Clauses",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Embedding-and-Stacking-Clauses.aspx"},{name:"Khan: Relative pronouns",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/verb-aspect-and-modal-verbs/e/relative-pronouns"}] },
  vocab:[
    {term:"reduced relative clause",def:"A shorter form with the relative pronoun and be removed, leaving just a participle.",example:"The boy <b>sitting in the corner</b> is my cousin."},
    {term:"participle",def:"A verb form used as a modifier: -ing (present) or -ed/-en (past).",example:"The car <b>parked</b> outside belongs to my teacher."},
  ], items:[
      { type:"identify", prompt:"Full or reduced relative clause?", sentence:"The boy <b>sitting in the corner</b> is my cousin.", options:["reduced","full"], answer:"reduced", explain:"No relative pronoun + participle (-ing) = reduced clause.", tags:["reduced"] },
      { type:"identify", prompt:"Full or reduced relative clause?", sentence:"The book <b>that was written by her</b> won an award.", options:["full","reduced"], answer:"full", explain:"Contains the relative pronoun 'that' = full relative clause.", tags:["full"] },
      { type:"identify", prompt:"Full or reduced relative clause?", sentence:"The car <b>parked outside</b> belongs to my teacher.", options:["reduced","full"], answer:"reduced", explain:"No pronoun + past participle = reduced clause.", tags:["reduced"] },
      { type:"gapfill", prompt:"Reduce the clause", before:"The woman", after:"at the desk is the principal.", cue:"who is sitting -> ?", accept:["sitting"], explain:"Remove who is, keep the participle: sitting.", tags:["reduced"] },
      { type:"gapfill", prompt:"Reduce the clause", before:"The letter", after:"to her was returned.", cue:"which was sent -> ?", accept:["sent"], explain:"Remove which was, keep the past participle: sent.", tags:["reduced"] },
      { type:"gapfill", prompt:"Reduce the clause", before:"Students", after:"near school walk to class.", cue:"who live -> ?", accept:["living"], explain:"Remove who + change verb to participle: living.", tags:["reduced"] },
  ] },

  /* ========= 7. AGREEMENT & NUMBER (NEW; assessed:false until pretest extended) ========= */
  { id:"agree-c1", category:"Agreement & Number", band:"C1", name:"Subject–Verb Agreement", example:"She walks. They walk.", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Subject-Verb Agreement",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Subject-Verb-Agreement.aspx"},{name:"Khan: Verb agreement",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/introduction-to-verbs/e/intro-to-verb-agreement"},{name:"ABC: Have or has",url:"https://www.abc.net.au/education/learn-english/learn-english-have-or-has/7858430"}] },
  vocab:[
    {term:"subject-verb agreement",def:"The verb must match the subject in number — singular subjects take singular verbs.",example:"She <b>walks</b>. They <b>walk</b>."},
    {term:"singular",def:"Referring to one person or thing.",example:"<b>He</b> plays the guitar."},
    {term:"plural",def:"Referring to more than one person or thing.",example:"<b>They</b> play the guitar."},
  ], items:[
      { type:"identify", prompt:"Correct or incorrect?", sentence:"She <b>walk</b> to school every day.", options:["incorrect","correct"], answer:"incorrect", explain:"Third person singular needs walks, not walk.", tags:["sv-agreement"] },
      { type:"identify", prompt:"Correct or incorrect?", sentence:"They <b>play</b> football on Saturdays.", options:["correct","incorrect"], answer:"correct", explain:"Plural subject (they) + base verb (play) = correct agreement.", tags:["sv-agreement"] },
      { type:"identify", prompt:"Correct or incorrect?", sentence:"The children <b>likes</b> ice cream.", options:["incorrect","correct"], answer:"incorrect", explain:"Children is plural; it should be like, not likes.", tags:["sv-agreement"] },
      { type:"gapfill", prompt:"Write the correct form", before:"He", after:"the guitar very well.", cue:"play", accept:["plays"], explain:"Third person singular = play + s.", tags:["sv-agreement"] },
      { type:"gapfill", prompt:"Write the correct form", before:"My parents", after:"in a big house.", cue:"live", accept:["live"], explain:"Plural subject = base form: live.", tags:["sv-agreement"] },
      { type:"gapfill", prompt:"Write the correct form", before:"The cat", after:"on the sofa every afternoon.", cue:"sleep", accept:["sleeps"], explain:"Singular subject = sleep + s.", tags:["sv-agreement"] },
  ] },
  { id:"agree-c2", category:"Agreement & Number", band:"C2", name:"Regular / Irregular Plurals", example:"one child, two children", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Nouns",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Nouns.aspx"},{name:"Khan: Plural & singular nouns",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-noun/grammar-nouns/e/plural-and-singular-nouns"},{name:"Khan: Irregular plurals",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-noun/irregular-plural-nouns-base-plurals-and-irregular-endings/e/irregular-plural-nouns--f-to--ves"}] },
  vocab:[
    {term:"regular plural",def:"A plural formed by adding -s or -es to the noun.",example:"She bought two <b>dresses</b>."},
    {term:"irregular plural",def:"A plural that does not follow the -s/-es rule — it changes form.",example:"There are three <b>children</b> in the park."},
  ], items:[
      { type:"identify", prompt:"Regular or irregular plural?", sentence:"There are three <b>children</b> in the park.", options:["irregular","regular"], answer:"irregular", explain:"child -> children is an irregular plural.", tags:["irregular-plural"] },
      { type:"identify", prompt:"Regular or irregular plural?", sentence:"She bought two <b>dresses</b> for the party.", options:["regular","irregular"], answer:"regular", explain:"dress + es = regular plural.", tags:["regular-plural"] },
      { type:"identify", prompt:"Regular or irregular plural?", sentence:"The <b>mice</b> ran under the fridge.", options:["irregular","regular"], answer:"irregular", explain:"mouse -> mice is an irregular plural.", tags:["irregular-plural"] },
      { type:"gapfill", prompt:"Write the plural", before:"There are six", after:"in the pond.", cue:"fish", accept:["fish"], explain:"Fish is the same in singular and plural.", tags:["irregular-plural"] },
      { type:"gapfill", prompt:"Write the plural", before:"He lost two", after:"in an accident.", cue:"tooth", accept:["teeth"], explain:"tooth -> teeth is an irregular plural.", tags:["irregular-plural"] },
      { type:"gapfill", prompt:"Write the plural", before:"We saw three", after:"on the farm.", cue:"sheep", accept:["sheep"], explain:"Sheep is the same in singular and plural.", tags:["irregular-plural"] },
  ] },
  { id:"agree-c3", category:"Agreement & Number", band:"C3", name:"Countable / Uncountable & Quantifiers", example:"much water, many bottles", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Nouns",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Nouns.aspx"},{name:"ABC: Each and every",url:"https://www.abc.net.au/education/learn-english/learn-english-each-and-every/8536442"}] },
  vocab:[
    {term:"countable noun",def:"A noun you can count with numbers — it has a plural form.",example:"She ate three <b>apples</b>."},
    {term:"uncountable noun",def:"A noun you cannot count with numbers — it has no plural form.",example:"Can I have some <b>water</b>?"},
    {term:"quantifier",def:"A word that tells how much or how many: much, many, a few, a little.",example:"There are not <b>many</b> chairs."},
  ], items:[
      { type:"identify", prompt:"Countable or uncountable?", sentence:"Can I have some <b>water</b>?", options:["uncountable","countable"], answer:"uncountable", explain:"Water cannot be counted with a number; it is uncountable.", tags:["uncountable"] },
      { type:"identify", prompt:"Countable or uncountable?", sentence:"She ate three <b>apples</b>.", options:["countable","uncountable"], answer:"countable", explain:"Apples can be counted: one, two, three = countable.", tags:["countable"] },
      { type:"identify", prompt:"Correct or incorrect?", sentence:"There is <b>many</b> traffic on the road.", options:["incorrect","correct"], answer:"incorrect", explain:"Traffic is uncountable; use much, not many.", tags:["quantifier"] },
      { type:"gapfill", prompt:"Choose the correct quantifier", before:"There are not", after:"chairs in the room.", cue:"much / many", accept:["many"], explain:"Chairs are countable = many.", tags:["quantifier"] },
      { type:"gapfill", prompt:"Choose the correct quantifier", before:"She does not have", after:"homework tonight.", cue:"much / many", accept:["much"], explain:"Homework is uncountable = much.", tags:["quantifier"] },
      { type:"gapfill", prompt:"Choose the correct quantifier", before:"There is", after:"milk left in the fridge.", cue:"a few / a little", accept:["a little"], explain:"Milk is uncountable = a little.", tags:["quantifier"] },
  ] },
  { id:"agree-c4", category:"Agreement & Number", band:"C4/C4+", name:"Collective / Complex Subjects", example:"The team is winning. The team are arguing.", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Subject-Verb Agreement",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Subject-Verb-Agreement.aspx"},{name:"Khan: Verb agreement",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/introduction-to-verbs/e/intro-to-verb-agreement"}] },
  vocab:[
    {term:"collective noun",def:"A noun for a group that can take a singular or plural verb depending on meaning.",example:"The team <b>is</b> playing well. (one unit)"},
    {term:"complex subject",def:"A subject made of two or more parts joined by and, or, or nor.",example:"Neither the teacher nor the students <b>were</b> happy."},
  ], items:[
      { type:"identify", prompt:"Why is the singular verb 'is' used here?", sentence:"The team <b>is</b> playing well today.", options:["the team is acting as one unit","the team members are acting separately"], answer:"the team is acting as one unit", explain:"A singular verb treats the team as a single body working together.", tags:["collective"] },
      { type:"identify", prompt:"Why is the plural verb 'are' used here?", sentence:"The class <b>are</b> working on different projects.", options:["the class members are acting separately","the class is acting as one unit"], answer:"the class members are acting separately", explain:"A plural verb treats the class as individuals, each doing their own thing.", tags:["collective"] },
      { type:"identify", prompt:"Correct or incorrect?", sentence:"Neither the teacher nor the students <b>was</b> happy.", options:["incorrect","correct"], answer:"incorrect", explain:"The nearest subject (students) is plural, so use were.", tags:["complex-subject"] },
      { type:"gapfill", prompt:"Write the correct verb form", before:"The family", after:"going on holiday next week.", cue:"is / are", accept:["is","are"], explain:"Both are acceptable: is (unit) or are (individual members).", tags:["collective"] },
      { type:"gapfill", prompt:"Write the correct verb form", before:"Either the cat or the dogs", after:"making noise.", cue:"is / are", accept:["are"], explain:"Nearest subject (dogs) is plural = are.", tags:["complex-subject"] },
      { type:"gapfill", prompt:"Write the correct verb form", before:"The committee", after:"reached a decision.", cue:"has / have", accept:["has","have"], explain:"Both work: has (one body) or have (individual members).", tags:["collective"] },
  ] },

  /* ========= 8. QUESTIONS & NEGATION (NEW; assessed:false until pretest extended) ========= */
  { id:"question-c1", category:"Questions & Negation", band:"C1", name:"Yes/No Questions & Basic Negation", example:"Do you like it? I don't like it.", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"},{name:"Khan: Sentence types",url:"https://www.khanacademy.org/humanities/grammar/syntax-sentences-and-clauses/introduction-to-sentences/e/declarative--interrogative--and-imperative-sentences"},{name:"ABC: Do and does",url:"https://www.abc.net.au/education/learn-english/learn-english-do-and-does/8468004"}] },
  vocab:[
    {term:"yes/no question",def:"A question answered with yes or no — the auxiliary comes before the subject.",example:"<b>Does</b> she like chocolate?"},
    {term:"negation",def:"Making a sentence negative, usually with not or n't after an auxiliary.",example:"He <b>doesn't</b> want to go."},
    {term:"auxiliary verb",def:"A helping verb (do, does, did, is, are, have, has) used in questions and negatives.",example:"<b>Do</b> they play tennis?"},
  ], items:[
      { type:"choose", prompt:"Which one is a yes/no question (auxiliary before the subject)?", options:["Does she like chocolate","She likes chocolate","She doesn't like chocolate","Chocolate is her favourite"], answer:"Does she like chocolate", explain:"A yes/no question inverts the order: the auxiliary 'does' comes before the subject 'she'. The others all keep statement order.", tags:["yes-no"] },
      { type:"identify", prompt:"Correct or incorrect?", sentence:"He <b>don't</b> want to go.", options:["incorrect","correct"], answer:"incorrect", explain:"Third person singular needs doesn't, not don't.", tags:["negation"] },
      { type:"identify", prompt:"Correct or incorrect?", sentence:"<b>Do</b> they play tennis?", options:["correct","incorrect"], answer:"correct", explain:"Do + plural subject + base verb = correct yes/no question.", tags:["yes-no"] },
      { type:"gapfill", prompt:"Make a question", before:"", after:"you live near the school?", cue:"do / does", accept:["do"], explain:"You = do (not does).", tags:["yes-no"] },
      { type:"gapfill", prompt:"Make it negative", before:"She", after:"like spicy food.", cue:"do + not", accept:["does not","doesn't","doesnt"], explain:"Third person singular negative = does not / doesn't.", tags:["negation"] },
      { type:"gapfill", prompt:"Make a question", before:"", after:"he speak French?", cue:"do / does", accept:["does"], explain:"He = third person singular = does.", tags:["yes-no"] },
  ] },
  { id:"question-c2", category:"Questions & Negation", band:"C2", name:"Wh- Questions", example:"Where did she go?", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"},{name:"Khan: Sentence types",url:"https://www.khanacademy.org/humanities/grammar/syntax-sentences-and-clauses/introduction-to-sentences/e/declarative--interrogative--and-imperative-sentences"}] },
  vocab:[
    {term:"wh- question",def:"A question starting with a wh- word: who, what, where, when, why, how.",example:"<b>Where</b> did you go yesterday?"},
    {term:"question word",def:"A word that asks for specific information: who (person), what (thing), where (place), when (time), why (reason), how (manner).",example:"<b>Why</b> were you late?"},
  ], items:[
      { type:"identify", prompt:"Which question word fits?", sentence:"___ did you buy that shirt?", options:["Where","What","When","Who"], answer:"Where", explain:"Where asks about place.", tags:["wh-question"] },
      { type:"identify", prompt:"Which question word fits?", sentence:"___ were you late?", options:["Why","When","How","Where"], answer:"Why", explain:"Why asks about reason.", tags:["wh-question"] },
      { type:"identify", prompt:"Correct or incorrect word order?", sentence:"<b>What does she want?</b>", options:["correct","incorrect"], answer:"correct", explain:"Wh-word + does + subject + base verb = correct order.", tags:["wh-question"] },
      { type:"gapfill", prompt:"Add the question word", before:"", after:"did you go yesterday?", cue:"where / when / why", accept:["where"], explain:"Asking about a place = where.", tags:["wh-question"] },
      { type:"gapfill", prompt:"Add the question word", before:"", after:"is your birthday?", cue:"when / where / what", accept:["when"], explain:"Asking about a time/date = when.", tags:["wh-question"] },
      { type:"gapfill", prompt:"Add the question word", before:"", after:"broke the window?", cue:"who / what / when", accept:["who"], explain:"Asking about a person (subject question) = who.", tags:["wh-question"] },
  ] },
  { id:"question-c3", category:"Questions & Negation", band:"C3", name:"Inversion & Question Tags", example:"You're coming, aren't you?", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"}] },
  vocab:[
    {term:"question tag",def:"A short question added to the end of a statement to check or confirm.",example:"She is from Melbourne, <b>isn't she</b>?"},
    {term:"inversion",def:"Swapping the order of the subject and auxiliary verb to form a question.",example:"<b>Is she</b> from Melbourne?"},
  ], items:[
      { type:"identify", prompt:"Choose the question tag", sentence:"She is from Melbourne, ___?", options:["isn't she","is she","aren't she","does she"], answer:"isn't she", explain:"Positive statement + negative tag: is -> isn't she.", tags:["question-tag"] },
      { type:"identify", prompt:"Choose the question tag", sentence:"They don't like fish, ___?", options:["do they","don't they","are they","did they"], answer:"do they", explain:"Negative statement + positive tag: don't -> do they.", tags:["question-tag"] },
      { type:"identify", prompt:"Correct or incorrect tag?", sentence:"He can swim, <b>can he</b>?", options:["incorrect","correct"], answer:"incorrect", explain:"Positive statement needs a negative tag: can't he.", tags:["question-tag"] },
      { type:"gapfill", prompt:"Add the question tag", before:"You are coming to the party,", after:"?", cue:"tag", accept:["aren't you","arent you"], explain:"Positive (are) -> negative tag: aren't you.", tags:["question-tag"] },
      { type:"gapfill", prompt:"Add the question tag", before:"She hasn't finished yet,", after:"?", cue:"tag", accept:["has she"], explain:"Negative (hasn't) -> positive tag: has she.", tags:["question-tag"] },
      { type:"gapfill", prompt:"Add the question tag", before:"They went home early,", after:"?", cue:"tag", accept:["didn't they","didnt they"], explain:"Positive past (went) -> negative tag: didn't they.", tags:["question-tag"] },
  ] },
  { id:"question-c4", category:"Questions & Negation", band:"C4/C4+", name:"Indirect / Embedded Questions", example:"Could you tell me where the station is?", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"}] },
  vocab:[
    {term:"indirect question",def:"A question embedded inside a polite phrase — uses statement word order, not inversion.",example:"Could you tell me <b>where the library is</b>?"},
    {term:"direct question",def:"A straightforward question with inverted word order.",example:"<b>Where is</b> the library?"},
  ], items:[
      { type:"identify", prompt:"Direct or indirect question?", sentence:"<b>Could you tell me where the library is?</b>", options:["indirect","direct"], answer:"indirect", explain:"Polite opener + statement word order = indirect question.", tags:["indirect"] },
      { type:"identify", prompt:"Direct or indirect question?", sentence:"<b>Where is the library?</b>", options:["direct","indirect"], answer:"direct", explain:"Wh-word + inverted verb = direct question.", tags:["direct"] },
      { type:"identify", prompt:"Correct or incorrect word order?", sentence:"Do you know <b>where is she</b>?", options:["incorrect","correct"], answer:"incorrect", explain:"Indirect questions use statement order: where she is.", tags:["indirect"] },
      { type:"gapfill", prompt:"Rewrite as indirect", before:"Could you tell me", after:"?", cue:"Where is the station?", accept:["where the station is"], explain:"Indirect: remove inversion -> where the station is.", tags:["indirect"] },
      { type:"gapfill", prompt:"Rewrite as indirect", before:"Do you know", after:"?", cue:"What time does the shop close?", accept:["what time the shop closes"], explain:"Indirect: statement order + present simple -> what time the shop closes.", tags:["indirect"] },
      { type:"gapfill", prompt:"Rewrite as indirect", before:"I wonder", after:".", cue:"Why did she leave?", accept:["why she left"], explain:"Indirect: statement order + past simple -> why she left.", tags:["indirect"] },
  ] },

  /* ========= POOLS: not mastery-tracked, excluded from the rubric matrix ========= */
  { id:"prep-pool",    category:"Prepositions", band:null, name:"Prepositions (practice pool)", example:"The book is on the table.", introduced:true, mode:"pool", assessed:false, resources:{ sheets:[{name:"Prepositions",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Prepositions.aspx"},{name:"Khan: Meet the preposition",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-preposition-and-the-conjunction/introduction-to-prepositions/e/meet-the-preposition"},{name:"Khan: Time & space prepositions",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-preposition-and-the-conjunction/introduction-to-prepositions/e/prepositions-about-time-and-space"},{name:"ABC: Prepositions of time & place",url:"https://www.abc.net.au/education/learn-english/learn-english-prepositions-of-time-and-place/8018438"}] }, items:[
      { type:"gapfill", prompt:"Add the preposition", before:"The cat is sitting", after:"the chair.", cue:"on / in / at", accept:["on"], explain:"On a surface = on.", tags:["preposition"] },
      { type:"gapfill", prompt:"Add the preposition", before:"She arrived", after:"school at 8:30.", cue:"at / in / to", accept:["at"], explain:"At a specific place/building = at.", tags:["preposition"] },
      { type:"gapfill", prompt:"Add the preposition", before:"He lives", after:"Melbourne.", cue:"in / on / at", accept:["in"], explain:"In a city = in.", tags:["preposition"] },
      { type:"gapfill", prompt:"Add the preposition", before:"The meeting is", after:"Monday.", cue:"on / in / at", accept:["on"], explain:"On a day of the week = on.", tags:["preposition"] },
      { type:"gapfill", prompt:"Add the preposition", before:"We have maths", after:"the morning.", cue:"in / on / at", accept:["in"], explain:"In a part of the day = in the morning.", tags:["preposition"] },
      { type:"gapfill", prompt:"Add the preposition", before:"The picture is hanging", after:"the wall.", cue:"on / in / at", accept:["on"], explain:"On a vertical surface = on.", tags:["preposition"] },
      { type:"identify", prompt:"Choose the correct preposition", sentence:"She is good ___ maths.", options:["at","in","on","for"], answer:"at", explain:"good at + subject = fixed preposition.", tags:["preposition"] },
      { type:"identify", prompt:"Choose the correct preposition", sentence:"He is interested ___ science.", options:["in","at","on","about"], answer:"in", explain:"interested in = fixed preposition.", tags:["preposition"] },
  ] },
  { id:"article-pool", category:"Articles",     band:null, name:"Articles (practice pool)",     example:"I have a pen. The pen is blue.", introduced:true, mode:"pool", assessed:false, resources:{ sheets:[{name:"Khan: Meet the article",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-modifier/introduction-to-adjectives-and-articles/e/meet-the-article"},{name:"Khan: Definite & indefinite",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-modifier/introduction-to-adjectives-and-articles/e/choosing-between-definite-and-indefinite-articles"},{name:"ABC: A and an",url:"https://www.abc.net.au/education/learn-english/learn-english-a-and-an/7795794"}] }, items:[
      { type:"gapfill", prompt:"Add the article", before:"She is", after:"teacher.", cue:"a / an / the", accept:["a"], explain:"A + consonant sound: a teacher.", tags:["article"] },
      { type:"gapfill", prompt:"Add the article", before:"He ate", after:"apple.", cue:"a / an / the", accept:["an"], explain:"An + vowel sound: an apple.", tags:["article"] },
      { type:"gapfill", prompt:"Add the article", before:"Please close", after:"door.", cue:"a / an / the", accept:["the"], explain:"The = specific door (both speakers know which one).", tags:["article"] },
      { type:"gapfill", prompt:"Add the article (or write 'no article')", before:"I like", after:"music.", cue:"a / the / no article", accept:["no article"], explain:"Music in general = no article needed.", tags:["zero-article"] },
      { type:"gapfill", prompt:"Add the article", before:"She wants to be", after:"engineer.", cue:"a / an / the", accept:["an"], explain:"An + vowel sound: an engineer.", tags:["article"] },
      { type:"gapfill", prompt:"Add the article", before:"", after:"sun rises in the east.", cue:"a / an / the", accept:["the"], explain:"The sun = unique thing, both speakers know = the.", tags:["article"] },
      { type:"identify", prompt:"Which article?", sentence:"I saw <b>a</b> dog in the park.", options:["a (first mention)","the (specific)","an (vowel sound)","no article"], answer:"a (first mention)", explain:"First mention of an unknown dog = a.", tags:["article"] },
      { type:"identify", prompt:"Which article?", sentence:"<b>The</b> dog was very friendly.", options:["the (specific)","a (first mention)","an (vowel sound)","no article"], answer:"the (specific)", explain:"Already mentioned = the (both speakers know which dog).", tags:["article"] },
  ] },

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

/* ===================================================================
   GOALS — Learning Intention + Success Criteria per cell (teaching mode)
   -------------------------------------------------------------------
   Teaching mode opens with an LI/SC slide. Success criteria split into:
     - a metalanguage goal ("I can recognise ..."), auto-built from the
       cell's vocab terms at runtime, gated by an on-rails check; and
     - a skill goal ("I can ..."), authored here per cell.
   `li` is the overarching learning intention. The vocab/metalanguage SC
   is generated from skill.vocab so it never drifts from the term list.
   =================================================================== */
window.GOALS = {
  "sentence-c1": { li:"I can build a simple sentence.", skill:"I can put a subject, verb, and object in the right order." },
  "sentence-c2": { li:"I can join two ideas into one compound sentence.", skill:"I can use a coordinating conjunction (and, but, or, so) to join two simple sentences." },
  "sentence-c3": { li:"I can add detail with a subordinate clause.", skill:"I can use a subordinating conjunction to attach a subordinate clause to a main clause." },
  "sentence-c4": { li:"I can rewrite a sentence to emphasise one idea.", skill:"I can use a cleft structure (It was ... who/that ...) to add emphasis." },

  "tense-c1": { li:"I can talk about now, routines, and the past.", skill:"I can choose present simple, present continuous, or past simple to fit the situation." },
  "tense-c2": { li:"I can link a past action to now.", skill:"I can form the present perfect with have/has + past participle." },
  "tense-c3": { li:"I can show which past action happened first.", skill:"I can use the past perfect and past continuous to order past events." },
  "tense-c4": { li:"I can talk about actions across future time.", skill:"I can use the future progressive and future perfect to describe future actions." },

  "modality-c1": { li:"I can express rules and ability.", skill:"I can use must for obligation and can for ability." },
  "modality-c2": { li:"I can express possibility and permission.", skill:"I can use may and might for possibility and permission." },
  "modality-c3": { li:"I can talk about the past with modals.", skill:"I can use modal + have + past participle (should have, must have)." },
  "modality-c4": { li:"I can speculate about ongoing past actions.", skill:"I can use modal + have been + verb-ing to speculate about the past." },

  "cond-c1": { li:"I can state facts and general truths with if.", skill:"I can use the zero conditional (if + present, present)." },
  "cond-c2": { li:"I can talk about likely future results.", skill:"I can use the first conditional (if + present, will + base verb)." },
  "cond-c3": { li:"I can talk about imaginary situations now.", skill:"I can use the second conditional (if + past, would + base verb)." },
  "cond-c4": { li:"I can imagine a different past.", skill:"I can use the third and mixed conditionals to talk about an unreal past." },

  "passive-c1": { li:"I can see when the subject receives the action.", skill:"I can recognise and form a basic passive (be + past participle)." },
  "passive-c2": { li:"I can use the passive in the present and the past.", skill:"I can form present and past passive sentences." },
  "passive-c4": { li:"I can report what people say impersonally.", skill:"I can use passive reporting (is said to, is believed to)." },

  "relative-c1": { li:"I can add information about a noun.", skill:"I can use who and which to start a relative clause." },
  "relative-c2": { li:"I can tell essential from extra information.", skill:"I can punctuate defining and non-defining relative clauses correctly." },
  "relative-c4": { li:"I can shorten relative clauses.", skill:"I can use reduced relative clauses with participles." },

  "agree-c1": { li:"I can match my verb to my subject.", skill:"I can make the verb agree with a singular or plural subject." },
  "agree-c2": { li:"I can form regular and irregular plurals.", skill:"I can spell regular and irregular plural nouns." },
  "agree-c3": { li:"I can use the right quantifier for the noun.", skill:"I can use much/many and a little/a few with countable and uncountable nouns." },
  "agree-c4": { li:"I can handle tricky subjects.", skill:"I can make verbs agree with collective and complex subjects." },

  "question-c1": { li:"I can ask yes/no questions and make negatives.", skill:"I can use do/does/did to form yes/no questions and negatives." },
  "question-c2": { li:"I can ask for specific information.", skill:"I can form wh- questions with the right question word." },
  "question-c3": { li:"I can check information with question tags.", skill:"I can add a correct question tag to a statement." },
  "question-c4": { li:"I can ask politely and indirectly.", skill:"I can form indirect questions using statement word order." },
};
