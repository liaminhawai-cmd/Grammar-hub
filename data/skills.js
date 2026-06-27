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
      { type:"transform", prompt:"Put these words in subject-verb-object order.", sentence:"the ball / kicked / the boy", accept:["the boy kicked the ball"], explain:"Subject (the boy) + verb (kicked) + object (the ball).", tags:["svo"] },
      { type:"order", prompt:"Put the words in order to make a complete sentence.", words:["My","sister","plays","the","piano"], answer:"My sister plays the piano", explain:"Subject (My sister) + verb (plays) + object (the piano).", tags:["svo"] },
      { type:"edit", prompt:"Change the meaning: add a comma so you are talking TO Grandma, not planning to eat her.", tokens:["Let's","eat","Grandma"], bank:[","], accept:["Let's eat, Grandma"], allowInsert:true, explain:"The comma of direct address: 'Let's eat, Grandma' invites Grandma to eat.", tags:["svo"] },
      { type:"identify", prompt:"Is this a complete sentence?", sentence:"<b>She reads books every night.</b>", options:["Yes — subject + verb + rest","No — missing a subject","No — missing a verb","No — it is a fragment"], answer:"Yes — subject + verb + rest", explain:"She (subject) reads (verb) books every night — complete SVO.", tags:["svo"] },
      { type:"identify", prompt:"Is this a complete sentence?", sentence:"<b>Running to the shops.</b>", options:["Yes — subject + verb + rest","No — missing a subject","No — missing a verb","No — it is a fragment"], answer:"No — missing a subject", explain:"There is no subject: who is running?", tags:["svo"] },
      { type:"gapfill", prompt:"Write a verb to complete the sentence", before:"The teacher", after:"the homework.", cue:"collect", accept:["collects","collected"], explain:"The teacher collects/collected the homework — verb completes the SVO.", tags:["svo"] },
      { type:"gapfill", prompt:"Add ANY subject — who or what kicked the ball?", before:"", after:"kicked the ball over the fence.", cue:"a person or thing", accept:["i","you","he","she","we","they","it","the boy","the girl","the dog","the player","tom","sam","mia"], explain:"Any subject works here: I, you, he, she, we, they, it, or a noun like 'the boy'. A subject is needed before the verb 'kicked'.", tags:["svo"] },
      { type:"choose", prompt:"Which one is a complete sentence?", options:["The cat slept.","The small grey cat on the warm windowsill in the afternoon sun.","After the long and tiring day at school yesterday.","Running quickly down the busy street near the shops."], answer:"The cat slept.", explain:"'The cat slept' has a subject and a verb. The longer options are just descriptions with no verb doing the action, so they are fragments, not sentences.", tags:["svo"] },
      { type:"choose", prompt:"Which sentence has the words in the right order (subject, verb, object)?", options:["The boy kicked the ball.","Kicked the boy the ball.","The ball the boy kicked.","The boy the ball kicked."], answer:"The boy kicked the ball.", explain:"Subject (the boy) + verb (kicked) + object (the ball), in that order.", tags:["svo"] },
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
      { type:"join", prompt:"Join with 'because' to give a reason.", sentence1:"He wore a jacket.", sentence2:"It was cold.", accept:["he wore a jacket because it was cold","because it was cold he wore a jacket","because it was cold, he wore a jacket"], explain:"because introduces the reason: he wore a jacket because it was cold.", tags:["subordination"] },
      { type:"join", prompt:"Join with 'although' to show contrast.", sentence1:"She was tired.", sentence2:"She kept working.", accept:["although she was tired she kept working","although she was tired, she kept working","she kept working although she was tired"], explain:"although introduces the contrast: although she was tired, she kept working.", tags:["subordination"] },
      { type:"edit", prompt:"Fix the linking word.", tokens:["We","went","out","despite","it","was","raining"], bank:["although","because","unless"], accept:["We went out although it was raining"], explain:"Use 'although' before a clause (despite is followed by a noun): although it was raining.", tags:["subordination"] },
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
      { type:"transform", prompt:"Rewrite as a cleft to emphasise 'Mia'.", sentence:"Mia solved the problem.", accept:["it was mia who solved the problem","it was mia that solved the problem"], explain:"Cleft: It was Mia who solved the problem.", tags:["cleft"] },
      { type:"transform", prompt:"Rewrite as a cleft to emphasise 'the rain'.", sentence:"The rain ruined the picnic.", accept:["it was the rain that ruined the picnic","it was the rain which ruined the picnic"], explain:"Cleft: It was the rain that ruined the picnic.", tags:["cleft"] },
      { type:"edit", prompt:"Fix the cleft sentence.", tokens:["It","was","Mia","which","solved","it"], bank:["who","that","whose"], accept:["It was Mia who solved it"], explain:"Use 'who' for a person in a cleft: It was Mia who solved it.", tags:["cleft"] },
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
  ],
  worked:[
    { text:"I live in Melbourne.", note:"<b>Present simple</b> — a fact that stays true." },
    { text:"I am learning English.", note:"<b>Present continuous</b> — happening around now (am + -ing)." },
    { text:"Yesterday I watched a film.", note:"<b>Past simple</b> — finished, with a past time word." },
  ],
  sort:{
    prompt:"Drag each sentence to its tense.",
    zones:["Present simple","Present continuous","Past simple"],
    modelled:[
      { text:"She works at a bank.", zone:"Present simple", explain:"A habit or fact — no -ing, no helper. That is present simple." },
      { text:"They are eating lunch.", zone:"Present continuous", explain:"Happening right now — am/is/are + -ing. That is present continuous." },
      { text:"We visited Rome.", zone:"Past simple", explain:"Finished in the past — verb + ed. That is past simple." },
    ],
    items:[
      { text:"He plays football.", zone:"Present simple" },
      { text:"I am reading.", zone:"Present continuous" },
      { text:"She walked home.", zone:"Past simple" },
      { text:"The sun rises in the east.", zone:"Present simple" },
      { text:"They are watching TV.", zone:"Present continuous" },
      { text:"We cooked dinner.", zone:"Past simple" },
      { text:"She is sleeping.", zone:"Present continuous" },
      { text:"I finished my work.", zone:"Past simple" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite so it is happening right now (present continuous).", sentence:"She reads a book.", accept:["she is reading a book","shes reading a book"], explain:"Present continuous = am/is/are + verb-ing: she is reading a book.", tags:["present-continuous"] },
      { type:"transform", prompt:"Rewrite so it happened yesterday (past simple).", sentence:"They walk to school.", accept:["they walked to school"], explain:"Past simple of a regular verb = verb + ed: they walked to school.", tags:["past-simple"] },
      { type:"edit", prompt:"Fix the verb.", tokens:["She","go","to","work","every","day"], bank:["goes","going","went"], accept:["She goes to work every day"], explain:"Third person singular present simple adds -s: she goes.", tags:["present-simple"] },
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
  ],
  worked:[
    { text:"I have visited Japan.", note:"<b>Present perfect</b> — the experience matters now, no time given." },
    { text:"She has lived here for three years.", note:"Still true now — use <b>for</b> with present perfect." },
    { text:"He has just finished.", note:"<b>just</b> signals a very recent action — present perfect." },
  ],
  sort:{
    prompt:"Present perfect links to now; past simple is finished. Drag each sentence to its tense.",
    zones:["Present perfect","Past simple"],
    modelled:[
      { text:"She has lived here for years.", zone:"Present perfect", explain:"Links the past to now — have/has + participle. That is present perfect." },
      { text:"She lived here in 2010.", zone:"Past simple", explain:"Finished, with a specific past time. That is past simple." },
    ],
    items:[
      { text:"I have finished my homework.", zone:"Present perfect" },
      { text:"I finished it an hour ago.", zone:"Past simple" },
      { text:"They have visited Japan.", zone:"Present perfect" },
      { text:"They visited Japan last year.", zone:"Past simple" },
      { text:"He has just arrived.", zone:"Present perfect" },
      { text:"He arrived yesterday.", zone:"Past simple" },
      { text:"We have known her for ages.", zone:"Present perfect" },
      { text:"We met her in 2019.", zone:"Past simple" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite in the present perfect (it started before and still matters now).", sentence:"I finish my work.", accept:["i have finished my work","ive finished my work"], explain:"Present perfect = have/has + past participle: I have finished my work.", tags:["present-perfect"] },
      { type:"transform", prompt:"Rewrite in the present perfect.", sentence:"She visits Japan.", accept:["she has visited japan","shes visited japan"], explain:"has + past participle: she has visited Japan.", tags:["present-perfect"] },
      { type:"edit", prompt:"Fix the verb.", tokens:["I","have","saw","that","film"], bank:["seen","see","seeing"], accept:["I have seen that film"], explain:"Present perfect uses the past participle: I have seen.", tags:["present-perfect"] },
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
  ],
  worked:[
    { text:"He had been waiting when I arrived.", note:"<b>Past perfect</b> — happening before another past event." },
    { text:"She had finished before the guests came.", note:"Past perfect marks the <b>earlier</b> action." },
    { text:"I was cooking when the phone rang.", note:"<b>Past continuous</b> (was + -ing) interrupted by a past simple action." },
  ],
  sort:{
    prompt:"Drag each sentence to its past tense.",
    zones:["Past perfect","Past continuous","Past simple"],
    modelled:[
      { text:"She had left before I arrived.", zone:"Past perfect", explain:"The earlier of two past actions — had + participle. That is past perfect." },
      { text:"He was reading when I called.", zone:"Past continuous", explain:"In progress in the past — was/were + -ing. That is past continuous." },
      { text:"I called him.", zone:"Past simple", explain:"A single finished past action. That is past simple." },
    ],
    items:[
      { text:"They had eaten before we came.", zone:"Past perfect" },
      { text:"We were watching TV.", zone:"Past continuous" },
      { text:"She closed the door.", zone:"Past simple" },
      { text:"He had finished his work.", zone:"Past perfect" },
      { text:"I was sleeping at noon.", zone:"Past continuous" },
      { text:"The bell rang.", zone:"Past simple" },
      { text:"She had already gone.", zone:"Past perfect" },
      { text:"They were playing outside.", zone:"Past continuous" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite in the past perfect (this action happened first).", sentence:"She finishes dinner.", accept:["she had finished dinner","shed finished dinner"], explain:"Past perfect = had + past participle: she had finished dinner.", tags:["past-perfect"] },
      { type:"transform", prompt:"Rewrite so the action was in progress in the past (past continuous).", sentence:"He reads a book.", accept:["he was reading a book"], explain:"Past continuous = was/were + verb-ing: he was reading a book.", tags:["past-continuous"] },
      { type:"edit", prompt:"Fix the verb.", tokens:["She","had","ate","before","we","arrived"], bank:["eaten","eat","eating"], accept:["She had eaten before we arrived"], explain:"Past perfect = had + past participle: had eaten.", tags:["past-perfect"] },
      { type:"gapfill", prompt:"Write the correct form", before:"By the time we arrived, the film", after:".", cue:"already start", accept:["had already started"], explain:"Earlier past action = had + already + past participle.", tags:["past-perfect"] },
      { type:"gapfill", prompt:"Write the correct form", before:"She", after:"for two hours when the bus finally came.", cue:"wait", accept:["had been waiting"], explain:"Duration before a past event = had been + verb-ing.", tags:["past-perfect-progressive"] },
      { type:"gapfill", prompt:"Write the correct form", before:"They", after:"all afternoon before it rained.", cue:"swim", accept:["had been swimming"], explain:"Ongoing past action before another past event = had been swimming.", tags:["past-perfect-progressive"] },
  ] },
  { id:"tense-c4", category:"Verb Tenses", band:"C4/C4+", name:"Future Progressive / Perfect", example:"By next year, she will be working in Sydney.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Khan: Progressive perfect",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/verb-aspect-and-modal-verbs/e/progressive-perfect-verb-aspect"},{name:"ABC: Will or going to",url:"https://www.abc.net.au/education/learn-english/learn-english-will-or-going-to/7383378"}] },
  vocab:[
    {term:"future progressive",def:"A tense for an action ongoing at a future time: will be + verb-ing.",example:"This time next week, I <b>will be flying</b> to London."},
    {term:"future perfect",def:"A tense for an action completed before a future point: will have + past participle.",example:"By Friday, she <b>will have completed</b> the project."},
  ],
  worked:[
    { text:"By next year, she will be working in Sydney.", note:"<b>Future progressive</b> — ongoing at that future time." },
    { text:"By Friday, I will have finished the report.", note:"<b>Future perfect</b> — done before that future point." },
    { text:"At 10am tomorrow we will be travelling.", note:"will be + -ing for an action in progress later." },
  ],
  sort:{
    prompt:"Drag each sentence to its future tense.",
    zones:["Future progressive","Future perfect"],
    modelled:[
      { text:"This time tomorrow I will be flying.", zone:"Future progressive", explain:"In progress at a future time — will be + -ing. That is future progressive." },
      { text:"By Friday I will have finished.", zone:"Future perfect", explain:"Completed before a future point — will have + participle. That is future perfect." },
    ],
    items:[
      { text:"At 8pm we will be eating dinner.", zone:"Future progressive" },
      { text:"By next year she will have graduated.", zone:"Future perfect" },
      { text:"I will be working all morning.", zone:"Future progressive" },
      { text:"By June they will have moved.", zone:"Future perfect" },
      { text:"This time next week I will be relaxing.", zone:"Future progressive" },
      { text:"By then he will have left.", zone:"Future perfect" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite to show it will be in progress at a future time (future progressive).", sentence:"I fly to London.", accept:["i will be flying to london","ill be flying to london"], explain:"Future progressive = will be + verb-ing: I will be flying to London.", tags:["future-progressive"] },
      { type:"transform", prompt:"Rewrite to show it will be finished before a future point (future perfect).", sentence:"I finish the report.", accept:["i will have finished the report","ill have finished the report"], explain:"Future perfect = will have + past participle: I will have finished the report.", tags:["future-perfect"] },
      { type:"edit", prompt:"Fix the verb form.", tokens:["This","time","tomorrow","I","will","flying"], bank:["be","been","being"], accept:["This time tomorrow I will be flying"], explain:"Future progressive = will be + -ing: will be flying.", tags:["future-progressive"] },
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
  ],
  worked:[
    { text:"You must wear a helmet.", note:"<b>must</b> — a strong obligation or rule." },
    { text:"She can swim well.", note:"<b>can</b> — ability, something you are able to do." },
    { text:"I can ride a bike.", note:"can + base verb shows what you are able to do." },
  ],
  sort:{
    prompt:"Drag each sentence to what its modal shows.",
    zones:["Obligation","Ability"],
    modelled:[
      { text:"You must wear a seatbelt.", zone:"Obligation", explain:"must = you have to. That is obligation." },
      { text:"She can swim.", zone:"Ability", explain:"can = is able to. That is ability." },
    ],
    items:[
      { text:"You must stop at a red light.", zone:"Obligation" },
      { text:"He can play piano.", zone:"Ability" },
      { text:"Students must wear uniform.", zone:"Obligation" },
      { text:"I can speak French.", zone:"Ability" },
      { text:"You must finish your work.", zone:"Obligation" },
      { text:"They can run fast.", zone:"Ability" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite as a rule using 'must'.", sentence:"Wear a helmet.", accept:["you must wear a helmet"], explain:"must = a rule or strong obligation: you must wear a helmet.", tags:["must"] },
      { type:"edit", prompt:"Fix the verb after the modal.", tokens:["She","can","speaks","French"], bank:["speak","spoke","speaking"], accept:["She can speak French"], explain:"After a modal, use the base verb: can speak.", tags:["can"] },
      { type:"gapfill",  prompt:"Add the modal (obligation)", before:"You", after:"wear a helmet when cycling.", cue:"must / can", accept:["must"], explain:"A rule = must.", tags:["must"] },
      { type:"gapfill",  prompt:"Add the modal (ability)",    before:"He", after:"swim very well.",             cue:"must / can", accept:["can"],  explain:"Ability = can.", tags:["can"] },
      { type:"choose", prompt:"Which shows obligation?", options:["You can swim.","You must wear a seatbelt.","You might be late.","You could help if you wanted."], answer:"You must wear a seatbelt.", explain:"'Must' shows a rule or strong obligation.", tags:["must"] },
      { type:"choose", prompt:"Which shows ability?", options:["She must study hard.","She can speak French.","She might come tomorrow.","She may leave now."], answer:"She can speak French.", explain:"'Can' = ability to do something.", tags:["can"] },
  ]},
  { id:"modality-c2", category:"Modality", band:"C2", name:"May / Might", example:"It might rain tomorrow.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"},{name:"ABC: Modal requests",url:"https://www.abc.net.au/education/learn-english/how-to-make-polite-requests-in-english-using-modal-verbs/13653604"}] },
  vocab:[
    {term:"possibility",def:"Something that could happen but is not certain.",example:"It <b>might</b> rain tomorrow."},
    {term:"permission",def:"Being allowed to do something, given by an authority.",example:"You <b>may</b> leave the room now."},
  ],
  worked:[
    { text:"It might rain tomorrow.", note:"<b>might</b> — a possibility, not certain." },
    { text:"You may borrow my pen.", note:"<b>may</b> — giving permission." },
    { text:"She may know the answer.", note:"may also shows possibility." },
  ],
  sort:{
    prompt:"Drag each sentence to what its modal shows.",
    zones:["Possibility","Permission"],
    modelled:[
      { text:"It might rain later.", zone:"Possibility", explain:"might = maybe. That is possibility." },
      { text:"You may leave now.", zone:"Permission", explain:"may = allowed to. That is permission." },
    ],
    items:[
      { text:"She might be late.", zone:"Possibility" },
      { text:"You may sit down.", zone:"Permission" },
      { text:"It may snow tonight.", zone:"Possibility" },
      { text:"Students may use the library.", zone:"Permission" },
      { text:"They might win.", zone:"Possibility" },
      { text:"You may go now.", zone:"Permission" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite to show it is possible but not certain (use 'might').", sentence:"It rains tonight.", accept:["it might rain tonight"], explain:"might = possible, not certain: it might rain tonight.", tags:["might"] },
      { type:"transform", prompt:"Rewrite to give permission (use 'may').", sentence:"You leave now.", accept:["you may leave now"], explain:"may = giving permission: you may leave now.", tags:["may"] },
      { type:"edit", prompt:"Fix the verb after the modal.", tokens:["It","might","rains","tomorrow"], bank:["rain","rained","raining"], accept:["It might rain tomorrow"], explain:"After a modal, use the base verb: might rain.", tags:["might"] },
      { type:"edit", prompt:"Change the meaning from 'I'm certain' to 'maybe' (a guess).", tokens:["She","must","be","at","home"], bank:["might","can","will"], accept:["She might be at home"], explain:"'must' shows certainty; 'might' shows it is only possible.", tags:["might"] },
      { type:"gapfill", prompt:"Add the modal (possibility)", before:"He", after:"be late for class.", cue:"may / might", accept:["may","might"], explain:"Both may and might express possibility here.", tags:["may","might"] },
      { type:"gapfill", prompt:"Add the modal (permission)", before:"You", after:"use my calculator.", cue:"may / must", accept:["may"], explain:"Giving permission = may.", tags:["may"] },
      { type:"gapfill", prompt:"Add the modal (possibility)", before:"They", after:"move to Brisbane next year.", cue:"might / must", accept:["might"], explain:"Uncertain future plan = might (possibility, not obligation).", tags:["might"] },
  ] },
  { id:"modality-c3", category:"Modality", band:"C3", name:"Modal Perfect", example:"She should have studied harder.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"},{name:"ABC: Could have / would have",url:"https://www.abc.net.au/education/learn-english/learn-english-could-have-or-would-have/7357694"}] },
  vocab:[
    {term:"modal perfect",def:"A modal verb + have + past participle — talks about the past from now.",example:"She <b>should have studied</b> harder."},
    {term:"regret",def:"Wishing something in the past had been different.",example:"He <b>should have called</b> his mum."},
    {term:"deduction",def:"A strong conclusion based on evidence.",example:"She <b>must have forgotten</b> her keys."},
  ],
  worked:[
    { text:"She should have studied harder.", note:"<b>should have</b> — looking back with regret." },
    { text:"He must have missed the bus.", note:"<b>must have</b> — a confident conclusion about the past." },
    { text:"They must have known the truth.", note:"must have + participle = a strong deduction." },
  ],
  sort:{
    prompt:"Drag each sentence to what its modal shows.",
    zones:["Regret","Deduction"],
    modelled:[
      { text:"I should have studied.", zone:"Regret", explain:"should have = I wish I had. That is regret." },
      { text:"She must have forgotten.", zone:"Deduction", explain:"must have = I'm sure she did. That is deduction." },
    ],
    items:[
      { text:"You should have called.", zone:"Regret" },
      { text:"He must have left early.", zone:"Deduction" },
      { text:"We should have booked tickets.", zone:"Regret" },
      { text:"They must have been tired.", zone:"Deduction" },
      { text:"I should have listened.", zone:"Regret" },
      { text:"She must have seen it.", zone:"Deduction" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite to show regret (use 'should have').", sentence:"I didn't study.", accept:["i should have studied","i shouldve studied"], explain:"should have + past participle = regret: I should have studied.", tags:["should-have"] },
      { type:"transform", prompt:"Rewrite as a strong guess about the past (use 'must have').", sentence:"She forgot her keys.", accept:["she must have forgotten her keys"], explain:"must have + past participle = a confident conclusion: she must have forgotten her keys.", tags:["must-have"] },
      { type:"edit", prompt:"Fix the verb.", tokens:["You","should","have","went","earlier"], bank:["gone","go","going"], accept:["You should have gone earlier"], explain:"Modal perfect = should have + past participle: should have gone.", tags:["should-have"] },
      { type:"gapfill", prompt:"Write the modal perfect form", before:"You", after:"earlier. Now we are late.", cue:"should / leave", accept:["should have left"], explain:"Past regret = should have + past participle.", tags:["should-have"] },
      { type:"gapfill", prompt:"Write the modal perfect form", before:"It is wet outside. It", after:"during the night.", cue:"must / rain", accept:["must have rained"], explain:"Strong deduction about the past = must have + past participle.", tags:["must-have"] },
      { type:"gapfill", prompt:"Write the modal perfect form", before:"We", after:"the bus, but we walked instead.", cue:"could / take", accept:["could have taken"], explain:"Past possibility not taken = could have + past participle.", tags:["could-have"] },
  ] },
  { id:"modality-c4", category:"Modality", band:"C4/C4+", name:"Modal Progressive", example:"You might have been speeding.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"}] },
  vocab:[
    {term:"modal perfect progressive",def:"Modal + have been + verb-ing — speculation about an ongoing past action.",example:"She <b>must have been sleeping</b> when I called."},
    {term:"speculation",def:"An uncertain guess about what was or is happening.",example:"He <b>might have been working</b> when the fire started."},
  ],
  worked:[
    { text:"You might have been speeding.", note:"modal + have been + -ing — guessing about an ongoing <b>past</b> action." },
    { text:"He must be joking.", note:"modal + be + -ing — guessing about <b>now</b>." },
    { text:"They could have been sleeping.", note:"uncertain about a past action in progress." },
  ],
  sort:{
    prompt:"These modals guess about an ongoing action. Drag each to its time.",
    zones:["Happening now","Happening in the past"],
    modelled:[
      { text:"She must be sleeping.", zone:"Happening now", explain:"must be + -ing — a guess about right now." },
      { text:"She must have been sleeping.", zone:"Happening in the past", explain:"must have been + -ing — a guess about the past." },
    ],
    items:[
      { text:"He must be working.", zone:"Happening now" },
      { text:"He must have been working.", zone:"Happening in the past" },
      { text:"They might be waiting.", zone:"Happening now" },
      { text:"They might have been waiting.", zone:"Happening in the past" },
      { text:"She could be studying.", zone:"Happening now" },
      { text:"She could have been studying.", zone:"Happening in the past" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite as a guess about an action in progress in the past (use 'must have been + -ing').", sentence:"She slept.", accept:["she must have been sleeping"], explain:"must have been + verb-ing = a guess about an ongoing past action: she must have been sleeping.", tags:["modal-perfect-progressive"] },
      { type:"transform", prompt:"Rewrite as a guess about right now (use 'must be + -ing').", sentence:"He works.", accept:["he must be working"], explain:"must be + verb-ing = a guess about now: he must be working.", tags:["modal-progressive"] },
      { type:"edit", prompt:"Fix the verb form.", tokens:["She","must","have","been","sleep"], bank:["sleeping","slept","sleeps"], accept:["She must have been sleeping"], explain:"must have been + -ing: been sleeping.", tags:["modal-perfect-progressive"] },
      { type:"gapfill", prompt:"Write the modal progressive form", before:"She", after:"all night; she looks exhausted.", cue:"must / study", accept:["must have been studying"], explain:"Strong deduction about ongoing past = must have been + verb-ing.", tags:["modal-perfect-progressive"] },
      { type:"gapfill", prompt:"Write the modal progressive form", before:"They", after:"for the wrong bus.", cue:"might / wait", accept:["might have been waiting"], explain:"Speculation about ongoing past = might have been + verb-ing.", tags:["modal-perfect-progressive"] },
      { type:"gapfill", prompt:"Write the modal progressive form", before:"He", after:"too fast when the accident happened.", cue:"could / drive", accept:["could have been driving"], explain:"Possible ongoing past action = could have been + verb-ing.", tags:["modal-perfect-progressive"] },
  ] },

  /* ========= 4. CONDITIONALS (assessed) ========= */
  { id:"cond-c1", category:"Conditionals", band:"C1", name:"Zero", example:"If you heat ice, it melts.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Conditionals",url:"https://www.abc.net.au/education/learn-english/conditionals-in-english/11359496"}] },
  vocab:[
    {term:"conditional",def:"A sentence with an if-clause that describes what happens under certain conditions.",example:"<b>If</b> you heat ice, it melts."},
    {term:"zero conditional",def:"If + present, present — for facts and things that are always true.",example:"If you heat ice, it <b>melts</b>."},
  ],
  worked:[
    { text:"If you heat ice, it melts.", note:"<b>Zero conditional</b> — if + present, present. Always true." },
    { text:"If you press this button, the light turns on.", note:"A general cause and effect." },
    { text:"Plants die if they get no water.", note:"The result can come first — no comma then." },
  ],
  clausePick:{
    modelled:[
      { words:["If","you","heat","ice",",","it","melts"], find:"condition", span:[0,3], explain:"'If you heat ice' is the condition — what has to happen first." },
      { words:["Ice","melts","if","you","heat","it"], find:"result", span:[0,1], explain:"'Ice melts' is the result. Don't be fooled — here the 'if' part is at the end." },
    ],
    items:[
      { words:["If","you","drop","it",",","it","breaks"], find:"condition", span:[0,3] },
      { words:["If","you","drop","it",",","it","breaks"], find:"result", span:[5,6] },
      { words:["It","breaks","if","you","drop","it"], find:"condition", span:[2,5] },
      { words:["It","breaks","if","you","drop","it"], find:"result", span:[0,1] },
      { words:["Plants","die","if","they","get","no","water"], find:"condition", span:[2,6] },
      { words:["If","they","get","no","water",",","plants","die"], find:"result", span:[6,7] },
    ],
  },
  items:[
      { type:"gapfill", prompt:"Write the correct form", before:"If you heat ice, it", after:".", cue:"melt", accept:["melts"], explain:"Zero conditional: present + present for facts.", tags:["zero"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If you press this button, the light", after:".", cue:"turn on", accept:["turns on"], explain:"Zero conditional: a general truth, present + present.", tags:["zero"] },
      { type:"join", prompt:"Join into a zero conditional (a general fact).", sentence1:"You heat ice.", sentence2:"It melts.", accept:["if you heat ice it melts","if you heat ice, it melts","it melts if you heat ice"], explain:"Zero conditional = if + present, present: if you heat ice, it melts.", tags:["zero"] },
      { type:"edit", prompt:"Fix the verb.", tokens:["If","you","heat","ice","it","melt"], bank:["melts","melted","melting"], accept:["If you heat ice it melts"], explain:"Zero conditional: present + present, third person 'melts'.", tags:["zero"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If plants do not get water, they", after:".", cue:"die", accept:["die"], explain:"Zero conditional: general truth = present + present.", tags:["zero"] },
      { type:"choose", prompt:"Which is a zero conditional?", options:["If you study, you will pass.","If you mix blue and yellow, you get green.","If I were rich, I would travel.","If she had studied, she would have passed."], answer:"If you mix blue and yellow, you get green.", explain:"Always-true fact, present + present = zero conditional.", tags:["zero"] },
      { type:"choose", prompt:"Which sentence is always true?", options:["If it rains, we will stay inside.","If you add salt to water, it dissolves.","If I studied, I would pass.","If they had left earlier, they would have arrived."], answer:"If you add salt to water, it dissolves.", explain:"A scientific/general fact = zero conditional (always true).", tags:["zero"] },
  ]},
  { id:"cond-c2", category:"Conditionals", band:"C2", name:"First", example:"If I study, I will pass.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Will or going to",url:"https://www.abc.net.au/education/learn-english/learn-english-will-or-going-to/7383378"}] },
  vocab:[
    {term:"first conditional",def:"If + present simple, will + base verb — for real, likely future situations.",example:"If I study, I <b>will pass</b>."},
    {term:"if-clause",def:"The part of a conditional sentence that starts with if — it sets the condition.",example:"<b>If it rains</b>, we will stay inside."},
    {term:"result clause",def:"The part that says what happens if the condition is met.",example:"If it rains, <b>we will stay inside</b>."},
  ],
  worked:[
    { text:"If I study, I will pass.", note:"<b>First conditional</b> — if + present, will + verb. A real future possibility." },
    { text:"We will cancel if it rains.", note:"Result first, condition second — no comma then." },
    { text:"If you heat water to 100°C, it will boil.", note:"A likely, specific result." },
  ],
  clausePick:{
    modelled:[
      { words:["If","I","study",",","I","will","pass"], find:"condition", span:[0,2], explain:"'If I study' is the condition — what has to happen." },
      { words:["I","will","pass","if","I","study"], find:"result", span:[0,2], explain:"'I will pass' is the result. Don't be fooled — the 'if' part is at the end here." },
    ],
    items:[
      { words:["If","it","rains",",","we","will","stay","in"], find:"condition", span:[0,2] },
      { words:["If","it","rains",",","we","will","stay","in"], find:"result", span:[4,7] },
      { words:["We","will","stay","in","if","it","rains"], find:"condition", span:[4,6] },
      { words:["We","will","stay","in","if","it","rains"], find:"result", span:[0,3] },
      { words:["You","will","catch","the","bus","if","you","hurry"], find:"condition", span:[5,7] },
      { words:["If","you","hurry",",","you","will","catch","the","bus"], find:"result", span:[4,8] },
    ],
  },
  items:[
      { type:"gapfill",  prompt:"Write the correct form", before:"If I study, I", after:"the test.",      cue:"pass", accept:["will pass","ll pass"], explain:"First conditional: if + present, will + base verb.", tags:["first"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"If it", after:", we will stay inside.", cue:"rain", accept:["rains"], explain:"The if-clause uses the present simple: rains.", tags:["first"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"If you do not hurry, we", after:"the bus.", cue:"miss", accept:["will miss","ll miss"], explain:"Result clause of a first conditional = will + base verb: will miss.", tags:["first"] },
      { type:"gapfill",  prompt:"Write the correct form", before:"If the team", after:"hard, they will win the final.", cue:"train", accept:["trains"], explain:"The if-clause uses present simple; third person singular = train + s.", tags:["first"] },
      { type:"join", prompt:"Join into a first conditional (a likely future).", sentence1:"I study.", sentence2:"I will pass.", accept:["if i study i will pass","if i study, i will pass","i will pass if i study"], explain:"First conditional = if + present, will + base verb: if I study, I will pass.", tags:["first"] },
      { type:"join", prompt:"Join into a first conditional.", sentence1:"You hurry.", sentence2:"You will catch the bus.", accept:["if you hurry you will catch the bus","if you hurry, you will catch the bus","you will catch the bus if you hurry"], explain:"if + present, will + base: if you hurry, you will catch the bus.", tags:["first"] },
      { type:"edit", prompt:"Fix the result clause.", tokens:["If","it","rains","we","stay","inside"], bank:["will stay","stayed","would stay"], accept:["If it rains we will stay inside"], explain:"First conditional result uses will: we will stay.", tags:["first"] },
      { type:"choose", prompt:"Which is a correct first conditional?", options:["If it rains, we will cancel the picnic.","If it will rain, we will cancel the picnic.","If it rains, we cancelled the picnic.","If it rained, we would cancel the picnic."], answer:"If it rains, we will cancel the picnic.", explain:"If + present simple (rains), then will + base verb (cancel). Never put 'will' in the if-clause.", tags:["first"] },
  ]},
  { id:"cond-c3", category:"Conditionals", band:"C3", name:"Second", example:"If I were taller, I'd play basketball.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Conditionals",url:"https://www.abc.net.au/education/learn-english/conditionals-in-english/11359496"},{name:"ABC: Will or would",url:"https://www.abc.net.au/education/learn-english/learn-english-will-or-would/7360202"}] },
  vocab:[
    {term:"second conditional",def:"If + past simple, would + base verb — for imaginary or unlikely situations now.",example:"If I <b>had</b> a million dollars, I <b>would travel</b>."},
    {term:"unreal",def:"Describing a situation that is imagined, not actual.",example:"If she <b>were</b> taller, she would play basketball."},
  ],
  worked:[
    { text:"If I were taller, I would play basketball.", note:"<b>Second conditional</b> — unreal now. Note 'were' for all subjects." },
    { text:"If I had more time, I would learn guitar.", note:"Imaginary present — if + past, would + verb." },
    { text:"If she knew the answer, she would tell you.", note:"Unlikely or imagined, not a real plan." },
  ],
  sort:{
    prompt:"One is imaginary now, one is a real future chance. Drag each to its type.",
    zones:["Second conditional","First conditional"],
    modelled:[
      { text:"If I won the lottery, I would travel.", zone:"Second conditional", explain:"Imaginary — if + past, would. That is the second conditional." },
      { text:"If I win the raffle, I will celebrate.", zone:"First conditional", explain:"A real chance — if + present, will. That is the first conditional." },
    ],
    items:[
      { text:"If I were rich, I would help.", zone:"Second conditional" },
      { text:"If it rains, we will stay in.", zone:"First conditional" },
      { text:"If she studied, she would pass.", zone:"Second conditional" },
      { text:"If she studies, she will pass.", zone:"First conditional" },
      { text:"If I had wings, I would fly.", zone:"Second conditional" },
      { text:"If you call me, I will come.", zone:"First conditional" },
    ],
  },
  items:[
      { type:"join", prompt:"Join into a second conditional (imaginary now).", sentence1:"I was rich.", sentence2:"I would travel.", accept:["if i were rich i would travel","if i were rich, i would travel","i would travel if i were rich","if i was rich i would travel","if i was rich, i would travel"], explain:"Second conditional = if + past, would + base. Use 'were': if I were rich, I would travel.", tags:["second"] },
      { type:"transform", prompt:"Rewrite as imaginary now (second conditional).", sentence:"If I have time, I will help.", accept:["if i had time i would help","if i had time, i would help"], explain:"Second conditional = if + past, would: if I had time, I would help.", tags:["second"] },
      { type:"edit", prompt:"Fix the verb (second conditional).", tokens:["If","I","was","you","I","would","leave"], bank:["were","am","be"], accept:["If I were you I would leave"], explain:"The second conditional uses 'were' for all subjects: if I were you.", tags:["second"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If I", after:"you, I would apologise.", cue:"be", accept:["were","was"], explain:"If I were you = second conditional (were is traditional, was is accepted).", tags:["second"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If we had more time, we", after:"to the beach.", cue:"go", accept:["would go","d go"], explain:"would + base verb in the result clause of the second conditional.", tags:["second"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If he", after:"harder, he would get better marks.", cue:"study", accept:["studied"], explain:"If-clause uses past simple in the second conditional: studied.", tags:["second"] },
  ] },
  { id:"cond-c4", category:"Conditionals", band:"C4/C4+", name:"Third & Mixed / Unreal", example:"If he had left earlier, he would have caught the train.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Tense Consistency",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Tense-Consistency.aspx"},{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Could have / would have",url:"https://www.abc.net.au/education/learn-english/learn-english-could-have-or-would-have/7357694"}] },
  vocab:[
    {term:"third conditional",def:"If + past perfect, would have + past participle — imagining a different past.",example:"If she <b>had studied</b>, she <b>would have passed</b>."},
    {term:"mixed conditional",def:"Combines time frames — a past cause with a present result (or vice versa).",example:"If I <b>had known</b>, I <b>would be</b> there now."},
  ],
  worked:[
    { text:"If he had left earlier, he would have caught the train.", note:"<b>Third conditional</b> — imagining a different past." },
    { text:"If she had studied, she would have passed.", note:"if + past perfect, would have + participle." },
    { text:"If I had known then, I would be there now.", note:"<b>Mixed</b> — past cause, present result." },
  ],
  sort:{
    prompt:"One imagines a different past, one imagines now. Drag each to its type.",
    zones:["Third conditional","Second conditional"],
    modelled:[
      { text:"If he had left earlier, he would have caught the train.", zone:"Third conditional", explain:"Unreal past — if + past perfect, would have. That is the third conditional." },
      { text:"If he left now, he would catch the train.", zone:"Second conditional", explain:"Unreal present — if + past, would. That is the second conditional." },
    ],
    items:[
      { text:"If I had studied, I would have passed.", zone:"Third conditional" },
      { text:"If I studied, I would pass.", zone:"Second conditional" },
      { text:"If they had known, they would have come.", zone:"Third conditional" },
      { text:"If they knew, they would come.", zone:"Second conditional" },
      { text:"If she had asked, I would have helped.", zone:"Third conditional" },
      { text:"If she asked, I would help.", zone:"Second conditional" },
    ],
  },
  items:[
      { type:"join", prompt:"Join into a third conditional (a different past).", sentence1:"She had trained harder.", sentence2:"She would have won.", accept:["if she had trained harder she would have won","if she had trained harder, she would have won","she would have won if she had trained harder"], explain:"Third conditional = if + past perfect, would have + participle: if she had trained harder, she would have won.", tags:["third"] },
      { type:"transform", prompt:"Rewrite as a third conditional (imagine a different past).", sentence:"If it rains, we will cancel.", accept:["if it had rained we would have cancelled","if it had rained, we would have cancelled","if it had rained we would have canceled","if it had rained, we would have canceled"], explain:"Third conditional shifts both verbs back: if it had rained, we would have cancelled.", tags:["third"] },
      { type:"edit", prompt:"Fix the verb (third conditional).", tokens:["If","she","had","study","she","would","have","passed"], bank:["studied","studies","studying"], accept:["If she had studied she would have passed"], explain:"Third conditional: had + past participle (had studied).", tags:["third"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If he had left earlier, he", after:"the train.", cue:"catch", accept:["would have caught"], explain:"Third conditional result = would have + past participle.", tags:["third"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If I", after:"about the test, I would have revised.", cue:"know", accept:["had known"], explain:"Third conditional if-clause = had + past participle.", tags:["third"] },
      { type:"gapfill", prompt:"Write the correct form", before:"If she had eaten breakfast, she", after:"hungry now.", cue:"not be", accept:["would not be","wouldn't be","wouldnt be"], explain:"Mixed conditional: past cause, present result = would (not) + base.", tags:["mixed"] },
  ] },

  /* ========= 5. PASSIVE VOICE (assessed; grid C3 is blank) ========= */
  { id:"passive-c1", category:"Passive Voice", band:"C1", name:"Intro to Passive", example:"The letter was sent yesterday.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Active & passive voice",url:"https://www.abc.net.au/education/learn-english/active-and-passive-voice/9304750"}] },
  vocab:[
    {term:"active voice",def:"The subject does the action.",example:"<b>My grandmother</b> made the cake."},
    {term:"passive voice",def:"The subject receives the action — formed with be + past participle.",example:"The cake <b>was made</b> by my grandmother."},
  ],
  worked:[
    { text:"The letter was sent yesterday.", note:"<b>Passive</b> — focus on the letter, not who sent it." },
    { text:"The window was broken.", note:"be + past participle, the doer is not mentioned." },
    { text:"My grandmother made the cake. → The cake was made by my grandmother.", note:"Active becomes passive; the object moves to the front." },
  ],
  sort:{
    prompt:"In active voice the subject does the action; in passive it receives it. Drag each sentence.",
    zones:["Active voice","Passive voice"],
    modelled:[
      { text:"The chef cooked the meal.", zone:"Active voice", explain:"The subject does the action. That is active voice." },
      { text:"The meal was cooked.", zone:"Passive voice", explain:"The subject receives the action — be + participle. That is passive voice." },
    ],
    items:[
      { text:"The dog chased the cat.", zone:"Active voice" },
      { text:"The cat was chased.", zone:"Passive voice" },
      { text:"Someone stole my bike.", zone:"Active voice" },
      { text:"My bike was stolen.", zone:"Passive voice" },
      { text:"The team won the game.", zone:"Active voice" },
      { text:"The game was won.", zone:"Passive voice" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite in the passive (keep the focus on the window).", sentence:"Someone broke the window.", accept:["the window was broken","the window was broken by someone"], explain:"Passive = be + past participle: the window was broken.", tags:["passive-intro"] },
      { type:"transform", prompt:"Rewrite in the passive.", sentence:"The dog chased the cat.", accept:["the cat was chased","the cat was chased by the dog"], explain:"The object becomes the subject: the cat was chased (by the dog).", tags:["passive-intro"] },
      { type:"edit", prompt:"Fix the passive verb.", tokens:["The","window","was","break"], bank:["broken","broke","breaking"], accept:["The window was broken"], explain:"Passive = be + past participle: was broken.", tags:["passive-intro"] },
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
  ],
  worked:[
    { text:"These shoes are made in Italy.", note:"<b>Present passive</b> — are + made." },
    { text:"The bridge was built last year.", note:"<b>Past passive</b> — was + built." },
    { text:"The results are announced tomorrow.", note:"Present passive can refer to a scheduled event." },
  ],
  sort:{
    prompt:"Drag each passive sentence to its tense.",
    zones:["Present passive","Past passive"],
    modelled:[
      { text:"These cars are made in Japan.", zone:"Present passive", explain:"is/are + participle. That is present passive." },
      { text:"This bridge was built in 1932.", zone:"Past passive", explain:"was/were + participle. That is past passive." },
    ],
    items:[
      { text:"The rooms are cleaned daily.", zone:"Present passive" },
      { text:"The house was sold last week.", zone:"Past passive" },
      { text:"English is spoken here.", zone:"Present passive" },
      { text:"The cake was eaten.", zone:"Past passive" },
      { text:"These shirts are made by hand.", zone:"Present passive" },
      { text:"The letter was delivered.", zone:"Past passive" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite in the present passive (a general fact).", sentence:"People grow rice in Asia.", accept:["rice is grown in asia"], explain:"Present passive = is/are + past participle: rice is grown in Asia.", tags:["present-passive"] },
      { type:"transform", prompt:"Rewrite in the past passive.", sentence:"They built the bridge in 1932.", accept:["the bridge was built in 1932"], explain:"Past passive = was/were + past participle: the bridge was built in 1932.", tags:["past-passive"] },
      { type:"edit", prompt:"Fix the passive verb.", tokens:["The","bridge","was","build","in","1932"], bank:["built","building","builds"], accept:["The bridge was built in 1932"], explain:"Past passive = was + past participle: was built.", tags:["past-passive"] },
      { type:"gapfill", prompt:"Write the passive form", before:"The books", after:"to the library yesterday.", cue:"return", accept:["were returned"], explain:"Past passive, plural subject = were + past participle.", tags:["past-passive"] },
      { type:"gapfill", prompt:"Write the passive form", before:"Coffee", after:"in Brazil.", cue:"grow", accept:["is grown"], explain:"Present passive fact = is + past participle.", tags:["present-passive"] },
      { type:"gapfill", prompt:"Write the passive form", before:"The email", after:"to all staff last Friday.", cue:"send", accept:["was sent"], explain:"Past passive, singular subject = was + past participle.", tags:["past-passive"] },
  ] },
  { id:"passive-c3", category:"Passive Voice", band:"C3", name:"—", example:"", introduced:false, mode:"progression", assessed:false, resources:null, items:[] },
  { id:"passive-c4", category:"Passive Voice", band:"C4/C4+", name:"Passive Reporting", example:"The manager is said to have resigned.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Verbs.aspx"},{name:"ABC: Active & passive voice",url:"https://www.abc.net.au/education/learn-english/active-and-passive-voice/9304750"}] },
  vocab:[
    {term:"passive reporting",def:"Is said/believed/thought + to — reports what people say without naming them.",example:"The manager <b>is said to have resigned</b>."},
    {term:"reporting verb",def:"A verb used to pass on what others say: say, believe, think, report.",example:"He <b>is believed</b> to be very wealthy."},
  ],
  worked:[
    { text:"The manager is said to have resigned.", note:"<b>Passive reporting</b> — impersonal, no named source." },
    { text:"The suspect is believed to be abroad.", note:"is believed to — common in news writing." },
    { text:"It is thought that prices will rise.", note:"'It is thought that...' is another reporting frame." },
  ],
  sort:{
    prompt:"Passive reporting tells what people say without naming them. Drag each sentence.",
    zones:["Passive reporting","Direct statement"],
    modelled:[
      { text:"He is said to be very rich.", zone:"Passive reporting", explain:"is said to — reports what people say. That is passive reporting." },
      { text:"People say he is very rich.", zone:"Direct statement", explain:"A plain active statement with a clear subject. That is a direct statement." },
    ],
    items:[
      { text:"She is believed to be talented.", zone:"Passive reporting" },
      { text:"Everyone believes she is talented.", zone:"Direct statement" },
      { text:"The manager is thought to have resigned.", zone:"Passive reporting" },
      { text:"People think the manager resigned.", zone:"Direct statement" },
      { text:"He is known to be honest.", zone:"Passive reporting" },
      { text:"We know he is honest.", zone:"Direct statement" },
    ],
  },
  items:[
      { type:"transform", prompt:"Rewrite as a passive report (start with 'The CEO').", sentence:"People say the CEO has resigned.", accept:["the ceo is said to have resigned"], explain:"Passive reporting: the CEO is said to have resigned.", tags:["passive-reporting"] },
      { type:"transform", prompt:"Rewrite as a passive report (start with 'She').", sentence:"Everyone believes she is honest.", accept:["she is believed to be honest"], explain:"Passive reporting: she is believed to be honest.", tags:["passive-reporting"] },
      { type:"edit", prompt:"Fix the reporting verb.", tokens:["He","is","believe","to","be","honest"], bank:["believed","believing","believes"], accept:["He is believed to be honest"], explain:"Passive reporting: is believed to.", tags:["passive-reporting"] },
      { type:"gapfill", prompt:"Complete the passive report", before:"He", after:"to be very wealthy.", cue:"believe", accept:["is believed"], explain:"Passive reporting = is + past participle + to: is believed.", tags:["passive-reporting"] },
      { type:"gapfill", prompt:"Complete the passive report", before:"The suspect", after:"to have fled the city.", cue:"report", accept:["is reported","was reported"], explain:"Passive reporting = is/was reported + to have.", tags:["passive-reporting"] },
      { type:"gapfill", prompt:"Complete the passive report", before:"The painting", after:"to be worth millions.", cue:"say", accept:["is said"], explain:"Passive reporting = is said + to be.", tags:["passive-reporting"] },
  ] },

  /* ========= 6. RELATIVE CLAUSES (assessed; grid C3 is blank) ========= */
  { id:"relative-c1", category:"Relative Clauses", band:"C1", name:"Intro (who/which)", example:"That's the woman who helped me.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Relative Clauses",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Relative-Clauses.aspx"},{name:"Pronouns",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Pronouns.aspx"},{name:"Khan: Relative pronouns",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-pronoun/relative-pronouns/e/relative-pronouns"},{name:"ABC: Who or whom",url:"https://www.abc.net.au/education/learn-english/learn-english-who-or-whom/8063578"}] },
  vocab:[
    {term:"relative clause",def:"A clause that gives more information about a noun, starting with who, which, or that.",example:"The teacher <b>who teaches maths</b> is kind."},
    {term:"relative pronoun",def:"A word that introduces a relative clause: who (people), which (things), that (both).",example:"The boy <b>who</b> won the race is my friend."},
  ],
  worked:[
    { text:"That's the woman who helped me.", note:"<b>who</b> introduces a clause about a person." },
    { text:"This is the phone which I bought.", note:"<b>which</b> introduces a clause about a thing." },
    { text:"The student that sits there is new.", note:"<b>that</b> can replace who or which in defining clauses." },
  ],
  sort:{
    prompt:"who is for people, which is for things. Drag each relative clause.",
    zones:["who (people)","which (things)"],
    modelled:[
      { text:"the woman who helped me", zone:"who (people)", explain:"who is for people. This describes a person." },
      { text:"the book which I read", zone:"which (things)", explain:"which is for things. This describes a thing." },
    ],
    items:[
      { text:"the man who called", zone:"who (people)" },
      { text:"the car which broke down", zone:"which (things)" },
      { text:"the teacher who teaches us", zone:"who (people)" },
      { text:"the house which we bought", zone:"which (things)" },
      { text:"the girl who won", zone:"who (people)" },
      { text:"the dog which barked", zone:"which (things)" },
    ],
  },
  items:[
      { type:"join", prompt:"Join into one sentence using 'who'.", sentence1:"That is the boy.", sentence2:"He won the race.", accept:["that is the boy who won the race"], explain:"who joins a clause about a person: that is the boy who won the race.", tags:["who"] },
      { type:"join", prompt:"Join into one sentence using 'which'.", sentence1:"She found the book.", sentence2:"It was on the table.", accept:["she found the book which was on the table"], explain:"which joins a clause about a thing: she found the book which was on the table.", tags:["which"] },
      { type:"edit", prompt:"Fix the relative pronoun.", tokens:["The","book","who","is","on","the","table"], bank:["which","whom","whose"], accept:["The book which is on the table"], explain:"Use 'which' for a thing, not 'who'.", tags:["which"] },
      { type:"gapfill", prompt:"Add the relative pronoun", before:"I have a friend", after:"speaks four languages.", cue:"who / which", accept:["who"], explain:"Friend is a person = who.", tags:["who"] },
      { type:"gapfill", prompt:"Add the relative pronoun", before:"This is the bus", after:"goes to the city.", cue:"who / which / that", accept:["which","that"], explain:"Bus is a thing = which or that.", tags:["which"] },
      { type:"gapfill", prompt:"Add the relative pronoun", before:"She is the doctor", after:"helped my mother.", cue:"who / which", accept:["who"], explain:"Doctor is a person = who.", tags:["who"] },
  ] },
  { id:"relative-c2", category:"Relative Clauses", band:"C2", name:"Defining / Non-defining", example:"My car, which is red, is outside.", introduced:true, mode:"progression", assessed:true, resources:{ sheets:[{name:"Relative Clauses",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Relative-Clauses.aspx"},{name:"Comma Use",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Comma-Use.aspx"},{name:"Khan: Relative pronouns",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-pronoun/relative-pronouns/e/relative-pronouns"}] },
  vocab:[
    {term:"defining relative clause",def:"A clause that identifies which person or thing — no commas, essential information.",example:"The girl <b>who sits next to me</b> is from Japan."},
    {term:"non-defining relative clause",def:"A clause that adds extra info about something already identified — uses commas.",example:"My sister<b>, who lives in Perth,</b> is visiting."},
  ],
  worked:[
    { text:"The student who studies hard passes.", note:"<b>Defining</b> — no commas, says which student." },
    { text:"My sister, who lives in Perth, called.", note:"<b>Non-defining</b> — commas, extra detail." },
    { text:"The film that we saw was boring.", note:"A defining clause can use 'that'." },
  ],
  sort:{
    prompt:"Defining clauses identify which one (no commas); non-defining add extra info (commas). Drag each.",
    zones:["Defining (no commas)","Non-defining (commas)"],
    modelled:[
      { text:"The man who lives next door is kind.", zone:"Defining (no commas)", explain:"Tells you which man — essential, no commas. That is defining." },
      { text:"My father, who is a doctor, is busy.", zone:"Non-defining (commas)", explain:"Extra info, not essential — commas. That is non-defining." },
    ],
    items:[
      { text:"The book that I borrowed was great.", zone:"Defining (no commas)" },
      { text:"Paris, which is in France, is lovely.", zone:"Non-defining (commas)" },
      { text:"The girl who won is my friend.", zone:"Defining (no commas)" },
      { text:"My car, which is red, is fast.", zone:"Non-defining (commas)" },
      { text:"People who smoke risk their health.", zone:"Defining (no commas)" },
      { text:"Mr Lee, who teaches maths, is away.", zone:"Non-defining (commas)" },
    ],
  },
  items:[
      { type:"transform", prompt:"Add commas to make this non-defining (extra information).", sentence:"My brother who lives in Perth is a doctor.", accept:["my brother, who lives in perth, is a doctor"], explain:"Non-defining clauses take commas: My brother, who lives in Perth, is a doctor.", tags:["non-defining"] },
      { type:"join", prompt:"Join with a defining relative clause (no commas — say which man).", sentence1:"The man is my uncle.", sentence2:"He lives next door.", accept:["the man who lives next door is my uncle"], explain:"Defining clause, no commas: the man who lives next door is my uncle.", tags:["defining"] },
      { type:"choose", prompt:"Which sentence punctuates the extra information correctly?", options:["My sister, who lives in Perth, is a nurse.","My sister who lives in Perth is a nurse.","My sister, who lives in Perth is a nurse.","My sister who lives in Perth, is a nurse."], answer:"My sister, who lives in Perth, is a nurse.", explain:"A non-defining clause needs a comma on both sides.", tags:["non-defining"] },
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
  ],
  worked:[
    { text:"Students who live nearby walk to school. → Students living nearby walk to school.", note:"Reduce: drop 'who' and 'are' for the -ing form." },
    { text:"The cake which was made by Mum is gone. → The cake made by Mum is gone.", note:"Reduce with the past participle." },
    { text:"Anyone wanting a ticket should queue.", note:"Reduced relative clauses keep writing concise." },
  ],
  sort:{
    prompt:"A reduced relative clause drops the pronoun and 'be'. Drag each to its form.",
    zones:["Full relative clause","Reduced relative clause"],
    modelled:[
      { text:"the boy who is sitting there", zone:"Full relative clause", explain:"Has who + is. That is a full relative clause." },
      { text:"the boy sitting there", zone:"Reduced relative clause", explain:"who + is removed, leaving the participle. That is reduced." },
    ],
    items:[
      { text:"the man who is standing", zone:"Full relative clause" },
      { text:"the man standing there", zone:"Reduced relative clause" },
      { text:"the car which was parked outside", zone:"Full relative clause" },
      { text:"the car parked outside", zone:"Reduced relative clause" },
      { text:"the people who are waiting", zone:"Full relative clause" },
      { text:"the people waiting outside", zone:"Reduced relative clause" },
    ],
  },
  items:[
      { type:"transform", prompt:"Reduce the relative clause (drop 'who is').", sentence:"The man who is standing there is my dad.", accept:["the man standing there is my dad"], explain:"Drop 'who is' and keep the -ing form: the man standing there is my dad.", tags:["reduced"] },
      { type:"transform", prompt:"Reduce the relative clause (drop 'which was').", sentence:"The car which was parked outside is gone.", accept:["the car parked outside is gone"], explain:"Drop 'which was' and keep the past participle: the car parked outside is gone.", tags:["reduced"] },
      { type:"edit", prompt:"Fix the reduced relative clause.", tokens:["The","boy","sit","there","is","my","cousin"], bank:["sitting","sat","sits"], accept:["The boy sitting there is my cousin"], explain:"A reduced relative clause uses the -ing form: the boy sitting there.", tags:["reduced"] },
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
  ],
  worked:[
    { text:"She walks to school.", note:"<b>Singular</b> subject + verb + s." },
    { text:"They walk to school.", note:"<b>Plural</b> subject + verb, no s." },
    { text:"The team plays well.", note:"A collective noun usually takes a singular verb." },
  ],
  sort:{
    prompt:"Is the subject one or more than one? Drag each sentence by its subject.",
    zones:["Singular subject","Plural subject"],
    modelled:[
      { text:"The dog barks.", zone:"Singular subject", explain:"One — the verb takes -s. That is a singular subject." },
      { text:"The dogs bark.", zone:"Plural subject", explain:"More than one — no -s on the verb. That is a plural subject." },
    ],
    items:[
      { text:"She runs fast.", zone:"Singular subject" },
      { text:"They run fast.", zone:"Plural subject" },
      { text:"My friend likes pizza.", zone:"Singular subject" },
      { text:"My friends like pizza.", zone:"Plural subject" },
      { text:"The cat sleeps.", zone:"Singular subject" },
      { text:"The cats sleep.", zone:"Plural subject" },
    ],
  },
  items:[
      { type:"transform", prompt:"Fix the agreement error.", sentence:"She walk to school every day.", accept:["she walks to school every day"], explain:"Third person singular needs the -s: she walks to school every day.", tags:["sv-agreement"] },
      { type:"transform", prompt:"Fix the agreement error.", sentence:"The children likes ice cream.", accept:["the children like ice cream"], explain:"Children is plural, so use 'like': the children like ice cream.", tags:["sv-agreement"] },
      { type:"edit", prompt:"Fix the verb.", tokens:["The","children","likes","ice","cream"], bank:["like","liked","liking"], accept:["The children like ice cream"], explain:"Plural subject (children) takes 'like'.", tags:["sv-agreement"] },
      { type:"gapfill", prompt:"Write the correct form", before:"He", after:"the guitar very well.", cue:"play", accept:["plays"], explain:"Third person singular = play + s.", tags:["sv-agreement"] },
      { type:"gapfill", prompt:"Write the correct form", before:"My parents", after:"in a big house.", cue:"live", accept:["live"], explain:"Plural subject = base form: live.", tags:["sv-agreement"] },
      { type:"gapfill", prompt:"Write the correct form", before:"The cat", after:"on the sofa every afternoon.", cue:"sleep", accept:["sleeps"], explain:"Singular subject = sleep + s.", tags:["sv-agreement"] },
  ] },
  { id:"agree-c2", category:"Agreement & Number", band:"C2", name:"Regular / Irregular Plurals", example:"one child, two children", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Nouns",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Nouns.aspx"},{name:"Khan: Plural & singular nouns",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-noun/grammar-nouns/e/plural-and-singular-nouns"},{name:"Khan: Irregular plurals",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-noun/irregular-plural-nouns-base-plurals-and-irregular-endings/e/irregular-plural-nouns--f-to--ves"}] },
  vocab:[
    {term:"regular plural",def:"A plural formed by adding -s or -es to the noun.",example:"She bought two <b>dresses</b>."},
    {term:"irregular plural",def:"A plural that does not follow the -s/-es rule — it changes form.",example:"There are three <b>children</b> in the park."},
  ],
  worked:[
    { text:"one cat, two cats", note:"<b>Regular plural</b> — add -s." },
    { text:"one child, two children", note:"<b>Irregular plural</b> — a special form." },
    { text:"one box, two boxes", note:"Add -es after s, x, ch, sh." },
  ],
  sort:{
    prompt:"Regular plurals add -s/-es; irregular plurals change form. Drag each plural.",
    zones:["Regular plural","Irregular plural"],
    modelled:[
      { text:"cats", zone:"Regular plural", explain:"Just add -s. That is a regular plural." },
      { text:"children", zone:"Irregular plural", explain:"It changes form, not just + s. That is an irregular plural." },
    ],
    items:[
      { text:"dogs", zone:"Regular plural" },
      { text:"mice", zone:"Irregular plural" },
      { text:"books", zone:"Regular plural" },
      { text:"feet", zone:"Irregular plural" },
      { text:"tables", zone:"Regular plural" },
      { text:"people", zone:"Irregular plural" },
      { text:"boxes", zone:"Regular plural" },
      { text:"women", zone:"Irregular plural" },
    ],
  },
  items:[
      { type:"gapfill", prompt:"Write the plural form", before:"There are five ", after:" on the shelf.", cue:"(box)", accept:["boxes"], explain:"Add -es after x: box -> boxes.", tags:["regular-plural"] },
      { type:"gapfill", prompt:"Write the plural form", before:"Three ", after:" visited the clinic.", cue:"(woman)", accept:["women"], explain:"woman -> women is an irregular plural.", tags:["irregular-plural"] },
      { type:"edit", prompt:"Fix the plural.", tokens:["I","saw","three","mouses"], bank:["mice","mouse","meeces"], accept:["I saw three mice"], explain:"mouse -> mice (an irregular plural).", tags:["irregular-plural"] },
      { type:"gapfill", prompt:"Write the plural", before:"There are six", after:"in the pond.", cue:"fish", accept:["fish"], explain:"Fish is the same in singular and plural.", tags:["irregular-plural"] },
      { type:"gapfill", prompt:"Write the plural", before:"He lost two", after:"in an accident.", cue:"tooth", accept:["teeth"], explain:"tooth -> teeth is an irregular plural.", tags:["irregular-plural"] },
      { type:"gapfill", prompt:"Write the plural", before:"We saw three", after:"on the farm.", cue:"sheep", accept:["sheep"], explain:"Sheep is the same in singular and plural.", tags:["irregular-plural"] },
  ] },
  { id:"agree-c3", category:"Agreement & Number", band:"C3", name:"Countable / Uncountable & Quantifiers", example:"much water, many bottles", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Nouns",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Nouns.aspx"},{name:"ABC: Each and every",url:"https://www.abc.net.au/education/learn-english/learn-english-each-and-every/8536442"}] },
  vocab:[
    {term:"countable noun",def:"A noun you can count with numbers — it has a plural form.",example:"She ate three <b>apples</b>."},
    {term:"uncountable noun",def:"A noun you cannot count with numbers — it has no plural form.",example:"Can I have some <b>water</b>?"},
    {term:"quantifier",def:"A word that tells how much or how many: much, many, a few, a little.",example:"There are not <b>many</b> chairs."},
  ],
  worked:[
    { text:"many bottles", note:"Countable nouns use <b>many</b>." },
    { text:"much water", note:"Uncountable nouns use <b>much</b>." },
    { text:"a few coins / a little money", note:"a few = countable, a little = uncountable." },
  ],
  sort:{
    prompt:"Can you count it with numbers? Drag each noun.",
    zones:["Countable","Uncountable"],
    modelled:[
      { text:"apple", zone:"Countable", explain:"You can count it: one apple, two apples. That is countable." },
      { text:"water", zone:"Uncountable", explain:"You can't say 'two waters'. That is uncountable." },
    ],
    items:[
      { text:"book", zone:"Countable" },
      { text:"rice", zone:"Uncountable" },
      { text:"chair", zone:"Countable" },
      { text:"milk", zone:"Uncountable" },
      { text:"car", zone:"Countable" },
      { text:"information", zone:"Uncountable" },
      { text:"bottle", zone:"Countable" },
      { text:"advice", zone:"Uncountable" },
    ],
  },
  items:[
      { type:"transform", prompt:"Fix the quantifier error.", sentence:"There is many traffic on the road.", accept:["there is much traffic on the road"], explain:"Traffic is uncountable, so use 'much': there is much traffic on the road.", tags:["quantifier"] },
      { type:"gapfill", prompt:"Add 'much' or 'many'", before:"How ", after:" information do you have?", cue:"much / many", accept:["much"], explain:"Information is uncountable, so use 'much'.", tags:["quantifier"] },
      { type:"edit", prompt:"Fix the quantifier.", tokens:["There","is","many","traffic"], bank:["much","more","lots"], accept:["There is much traffic"], explain:"Traffic is uncountable, so use 'much'.", tags:["quantifier"] },
      { type:"gapfill", prompt:"Choose the correct quantifier", before:"There are not", after:"chairs in the room.", cue:"much / many", accept:["many"], explain:"Chairs are countable = many.", tags:["quantifier"] },
      { type:"gapfill", prompt:"Choose the correct quantifier", before:"She does not have", after:"homework tonight.", cue:"much / many", accept:["much"], explain:"Homework is uncountable = much.", tags:["quantifier"] },
      { type:"gapfill", prompt:"Choose the correct quantifier", before:"There is", after:"milk left in the fridge.", cue:"a few / a little", accept:["a little"], explain:"Milk is uncountable = a little.", tags:["quantifier"] },
  ] },
  { id:"agree-c4", category:"Agreement & Number", band:"C4/C4+", name:"Collective / Complex Subjects", example:"The team is winning. The team are arguing.", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Subject-Verb Agreement",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Subject-Verb-Agreement.aspx"},{name:"Khan: Verb agreement",url:"https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/introduction-to-verbs/e/intro-to-verb-agreement"}] },
  vocab:[
    {term:"collective noun",def:"A noun for a group that can take a singular or plural verb depending on meaning.",example:"The team <b>is</b> playing well. (one unit)"},
    {term:"complex subject",def:"A subject made of two or more parts joined by and, or, or nor.",example:"Neither the teacher nor the students <b>were</b> happy."},
  ],
  worked:[
    { text:"The team is winning.", note:"Collective noun as one unit — singular verb." },
    { text:"The team are arguing.", note:"Same noun, seen as individuals — plural verb." },
    { text:"Neither the teacher nor the students were ready.", note:"Complex subject — the verb agrees with the nearest part." },
  ],
  sort:{
    prompt:"A collective noun is one group word; a complex subject has parts joined by and/or/nor. Drag each subject.",
    zones:["Collective noun","Complex subject"],
    modelled:[
      { text:"the team", zone:"Collective noun", explain:"One word for a group. That is a collective noun." },
      { text:"the teacher and the students", zone:"Complex subject", explain:"Two parts joined by and. That is a complex subject." },
    ],
    items:[
      { text:"the family", zone:"Collective noun" },
      { text:"neither Tom nor Sam", zone:"Complex subject" },
      { text:"the committee", zone:"Collective noun" },
      { text:"both the dog and the cat", zone:"Complex subject" },
      { text:"the crowd", zone:"Collective noun" },
      { text:"either tea or coffee", zone:"Complex subject" },
    ],
  },
  items:[
      { type:"transform", prompt:"Fix the agreement error (the verb should match the nearest part).", sentence:"Neither the teacher nor the students was happy.", accept:["neither the teacher nor the students were happy"], explain:"The nearest subject (students) is plural, so use 'were'.", tags:["complex-subject"] },
      { type:"gapfill", prompt:"Choose the verb (treat the team as one unit)", before:"The team ", after:" the trophy every year.", cue:"win / wins", accept:["wins"], explain:"A collective noun acting as one unit takes a singular verb: the team wins.", tags:["collective"] },
      { type:"edit", prompt:"Fix the verb.", tokens:["Neither","Tom","nor","Sam","were","late"], bank:["was","is","be"], accept:["Neither Tom nor Sam was late"], explain:"Neither ... nor with singular names takes a singular verb: was.", tags:["complex-subject"] },
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
  ],
  worked:[
    { text:"Do you like coffee?", note:"<b>Yes/No question</b> — Do + subject + verb." },
    { text:"I don't like coffee.", note:"<b>Negative</b> — do + not + verb." },
    { text:"Does he work here?", note:"Use <b>does</b> with he/she/it." },
  ],
  sort:{
    prompt:"Drag each one to what it is.",
    zones:["Yes/No question","Negative statement"],
    modelled:[
      { text:"Do you like it?", zone:"Yes/No question", explain:"Starts with an auxiliary, ends with ?. That is a yes/no question." },
      { text:"I don't like it.", zone:"Negative statement", explain:"Auxiliary + n't in a statement. That is a negative statement." },
    ],
    items:[
      { text:"Does she sing?", zone:"Yes/No question" },
      { text:"She doesn't sing.", zone:"Negative statement" },
      { text:"Did they win?", zone:"Yes/No question" },
      { text:"They didn't win.", zone:"Negative statement" },
      { text:"Are you ready?", zone:"Yes/No question" },
      { text:"I am not ready.", zone:"Negative statement" },
    ],
  },
  items:[
      { type:"choose", prompt:"Which one is a yes/no question (auxiliary before the subject)?", options:["Does she like chocolate","She likes chocolate","She doesn't like chocolate","Chocolate is her favourite"], answer:"Does she like chocolate", explain:"A yes/no question inverts the order: the auxiliary 'does' comes before the subject 'she'. The others all keep statement order.", tags:["yes-no"] },
      { type:"transform", prompt:"Fix the error.", sentence:"He don't want to go.", accept:["he doesnt want to go","he does not want to go"], explain:"Third person singular needs 'doesn't': he doesn't want to go.", tags:["negation"] },
      { type:"edit", prompt:"Fix the negative.", tokens:["He","don't","like","fish"], bank:["doesn't","didn't","isn't"], accept:["He doesn't like fish"], explain:"Third person singular negative: doesn't.", tags:["negation"] },
      { type:"gapfill", prompt:"Make a question", before:"", after:"you live near the school?", cue:"do / does", accept:["do"], explain:"You = do (not does).", tags:["yes-no"] },
      { type:"gapfill", prompt:"Make it negative", before:"She", after:"like spicy food.", cue:"do + not", accept:["does not","doesn't","doesnt"], explain:"Third person singular negative = does not / doesn't.", tags:["negation"] },
      { type:"gapfill", prompt:"Make a question", before:"", after:"he speak French?", cue:"do / does", accept:["does"], explain:"He = third person singular = does.", tags:["yes-no"] },
  ] },
  { id:"question-c2", category:"Questions & Negation", band:"C2", name:"Wh- Questions", example:"Where did she go?", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"},{name:"Khan: Sentence types",url:"https://www.khanacademy.org/humanities/grammar/syntax-sentences-and-clauses/introduction-to-sentences/e/declarative--interrogative--and-imperative-sentences"}] },
  vocab:[
    {term:"wh- question",def:"A question starting with a wh- word: who, what, where, when, why, how.",example:"<b>Where</b> did you go yesterday?"},
    {term:"question word",def:"A word that asks for specific information: who (person), what (thing), where (place), when (time), why (reason), how (manner).",example:"<b>Why</b> were you late?"},
  ],
  worked:[
    { text:"Where did she go?", note:"<b>where</b> asks about place." },
    { text:"Why are you late?", note:"<b>why</b> asks about reason." },
    { text:"How does it work?", note:"<b>how</b> asks about manner or method." },
  ],
  sort:{
    prompt:"Each wh- word asks about something. Drag each question to what it asks about.",
    zones:["Person (who)","Thing (what)","Place (where)","Time (when)"],
    modelled:[
      { text:"Who is she?", zone:"Person (who)", explain:"who asks about a person." },
      { text:"What is that?", zone:"Thing (what)", explain:"what asks about a thing." },
      { text:"Where do you live?", zone:"Place (where)", explain:"where asks about a place." },
      { text:"When did it start?", zone:"Time (when)", explain:"when asks about a time." },
    ],
    items:[
      { text:"Who called you?", zone:"Person (who)" },
      { text:"What happened?", zone:"Thing (what)" },
      { text:"Where is the station?", zone:"Place (where)" },
      { text:"When are we leaving?", zone:"Time (when)" },
      { text:"Who won the match?", zone:"Person (who)" },
      { text:"What do you want?", zone:"Thing (what)" },
      { text:"Where did they go?", zone:"Place (where)" },
      { text:"When does it close?", zone:"Time (when)" },
    ],
  },
  items:[
      { type:"transform", prompt:"Make a wh- question about the place (ask where).", sentence:"She lives in Perth.", accept:["where does she live"], explain:"Wh-word + does + subject + base verb: where does she live?", tags:["wh-question"] },
      { type:"transform", prompt:"Make a wh- question about the time (ask when).", sentence:"The film starts at eight.", accept:["when does the film start"], explain:"when + does + subject + base verb: when does the film start?", tags:["wh-question"] },
      { type:"edit", prompt:"Fix the auxiliary verb.", tokens:["Where","do","she","live"], bank:["does","did","is"], accept:["Where does she live"], explain:"Third person singular question uses 'does': where does she live?", tags:["wh-question"] },
      { type:"gapfill", prompt:"Add the question word", before:"", after:"are my keys?", cue:"where / when / why", accept:["where"], explain:"Asking about a place = where: where are my keys?", tags:["wh-question"] },
      { type:"gapfill", prompt:"Add the question word", before:"", after:"does the film start?", cue:"when / where / why", accept:["when"], explain:"Asking about a time = when: when does the film start?", tags:["wh-question"] },
      { type:"gapfill", prompt:"Add the question word", before:"", after:"is your best friend?", cue:"who / what / where", accept:["who"], explain:"Asking about a person = who: who is your best friend?", tags:["wh-question"] },
  ] },
  { id:"question-c3", category:"Questions & Negation", band:"C3", name:"Inversion & Question Tags", example:"You're coming, aren't you?", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"}] },
  vocab:[
    {term:"question tag",def:"A short question added to the end of a statement to check or confirm.",example:"She is from Melbourne, <b>isn't she</b>?"},
    {term:"inversion",def:"Swapping the order of the subject and auxiliary verb to form a question.",example:"<b>Is she</b> from Melbourne?"},
  ],
  worked:[
    { text:"You're coming, aren't you?", note:"Positive statement takes a <b>negative</b> tag." },
    { text:"She isn't here, is she?", note:"Negative statement takes a <b>positive</b> tag." },
    { text:"Let's go, shall we?", note:"'Let's' takes the tag 'shall we?'." },
  ],
  sort:{
    prompt:"A question tag is added to a statement; a direct question inverts the verb. Drag each.",
    zones:["Question tag","Direct question"],
    modelled:[
      { text:"It's cold, isn't it?", zone:"Question tag", explain:"A mini-question added to a statement. That is a question tag." },
      { text:"Is it cold?", zone:"Direct question", explain:"Full inversion — verb before subject. That is a direct question." },
    ],
    items:[
      { text:"You're coming, aren't you?", zone:"Question tag" },
      { text:"Are you coming?", zone:"Direct question" },
      { text:"She likes tea, doesn't she?", zone:"Question tag" },
      { text:"Does she like tea?", zone:"Direct question" },
      { text:"It's late, isn't it?", zone:"Question tag" },
      { text:"Is it late?", zone:"Direct question" },
    ],
  },
  items:[
      { type:"transform", prompt:"Fix the question tag.", sentence:"He can swim, can he?", accept:["he can swim, cant he","he can swim cant he"], explain:"A positive statement needs a negative tag: he can swim, can't he?", tags:["question-tag"] },
      { type:"gapfill", prompt:"Add the question tag", before:"You finished your homework,", after:"?", cue:"positive statement -> negative tag", accept:["didnt you","did not you"], explain:"Positive statement + negative tag: you finished it, didn't you?", tags:["question-tag"] },
      { type:"edit", prompt:"Fix the question tag.", tokens:["He","can","swim","can","he"], bank:["can't","cannot","does"], accept:["He can swim can't he"], explain:"A positive statement takes a negative tag: can't he?", tags:["question-tag"] },
      { type:"gapfill", prompt:"Add the question tag", before:"You are coming to the party,", after:"?", cue:"tag", accept:["aren't you","arent you"], explain:"Positive (are) -> negative tag: aren't you.", tags:["question-tag"] },
      { type:"gapfill", prompt:"Add the question tag", before:"She hasn't finished yet,", after:"?", cue:"tag", accept:["has she"], explain:"Negative (hasn't) -> positive tag: has she.", tags:["question-tag"] },
      { type:"gapfill", prompt:"Add the question tag", before:"They went home early,", after:"?", cue:"tag", accept:["didn't they","didnt they"], explain:"Positive past (went) -> negative tag: didn't they.", tags:["question-tag"] },
  ] },
  { id:"question-c4", category:"Questions & Negation", band:"C4/C4+", name:"Indirect / Embedded Questions", example:"Could you tell me where the station is?", introduced:true, mode:"progression", assessed:false, resources:{ sheets:[{name:"Auxiliary and Modal Verbs",url:"https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-Auxiliary-and-Modal-Verbs.aspx"}] },
  vocab:[
    {term:"indirect question",def:"A question embedded inside a polite phrase — uses statement word order, not inversion.",example:"Could you tell me <b>where the library is</b>?"},
    {term:"direct question",def:"A straightforward question with inverted word order.",example:"<b>Where is</b> the library?"},
  ],
  worked:[
    { text:"Could you tell me where the station is?", note:"Indirect — note 'the station is', not 'is the station'." },
    { text:"Do you know what time it is?", note:"No inversion inside an indirect question." },
    { text:"I wonder why she left.", note:"Statement word order after 'I wonder'." },
  ],
  sort:{
    prompt:"A direct question inverts the verb; an indirect question keeps statement order. Drag each.",
    zones:["Direct question","Indirect question"],
    modelled:[
      { text:"Where is the station?", zone:"Direct question", explain:"Inverted — verb before subject. That is a direct question." },
      { text:"Could you tell me where the station is?", zone:"Indirect question", explain:"Polite frame + statement order. That is an indirect question." },
    ],
    items:[
      { text:"What time is it?", zone:"Direct question" },
      { text:"Do you know what time it is?", zone:"Indirect question" },
      { text:"Where does she live?", zone:"Direct question" },
      { text:"Could you tell me where she lives?", zone:"Indirect question" },
      { text:"When does it close?", zone:"Direct question" },
      { text:"I wonder when it closes.", zone:"Indirect question" },
    ],
  },
  items:[
      { type:"transform", prompt:"Make it indirect (start with 'Do you know').", sentence:"Where does she work?", accept:["do you know where she works"], explain:"Indirect: statement word order: do you know where she works?", tags:["indirect"] },
      { type:"transform", prompt:"Make it indirect (start with 'Could you tell me').", sentence:"What time is it?", accept:["could you tell me what time it is"], explain:"No inversion inside: could you tell me what time it is?", tags:["indirect"] },
      { type:"choose", prompt:"Which is the correct indirect question?", options:["Could you tell me where the station is?","Could you tell me where is the station?","Could you tell me where the station?","Where the station is could you tell me?"], answer:"Could you tell me where the station is?", explain:"Indirect questions use statement order: where the station is.", tags:["indirect"] },
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
