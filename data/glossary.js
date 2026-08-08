/* ============================================================
   GRAMMAR HUB — GLOSSARY
   ------------------------------------------------------------
   A bank of plain-English definitions for the grammar terms the
   app uses. The engine auto-links any term that appears in a
   prompt or explanation (see engine.js linkifyGlossary); clicking
   a term shows its definition with a "learn more" link.

   This is a CONTENT file (like data/skills.js): add a term by
   adding one entry. Keys are lowercase; multi-word keys are fine
   ("present perfect"). `more` is an optional Writing Hub page; if
   absent the popover falls back to a stable Wiktionary link.

   Keep definitions short, concrete and Year-7 friendly. AU spelling.
   ============================================================ */

(function () {
  // Writing Hub Core Skills page builder (same host/pattern as skills.js resources).
  const WH = (page) =>
    "https://kewhighschool.sharepoint.com/sites/KHSWritingHub/SitePages/CS-%C2%B7-" + page + ".aspx";

  window.GLOSSARY = {
    // ---- word classes ----
    "verb":        { def: "A doing or being word — it tells you what the subject does or is (run, eat, is, think).", more: WH("Verbs") },
    "noun":        { def: "A naming word for a person, place, thing or idea (teacher, Melbourne, cat, freedom).", more: WH("Nouns") },
    "pronoun":     { def: "A short word that stands in for a noun (he, she, it, they, who, which).", more: WH("Pronouns") },
    "adjective":   { def: "A word that describes a noun (big, red, happy, three)." },
    "adverb":      { def: "A word that describes a verb, often how/when/where something happens (quickly, yesterday, here)." },
    "preposition": { def: "A small linking word that shows place, time or direction (on, in, at, to, under)." },
    "article":     { def: "The little words 'a', 'an' and 'the' that go before a noun." },

    // ---- subject / object ----
    "subject":     { def: "Who or what does the action in a sentence. In 'The dog barked', the subject is 'the dog'.", more: WH("Subjects") },
    "object":      { def: "Who or what receives the action. In 'She kicked the ball', the object is 'the ball'.", more: WH("Objects") },

    // ---- joining words & clauses ----
    "conjunction":               { def: "A joining word that links ideas (and, but, so, because, although).", more: WH("Conjunctions") },
    "coordinating conjunction":  { def: "A word that joins two equal ideas (and, but, or, so).", more: WH("Conjunctions") },
    "subordinating conjunction": { def: "A word that starts a less-important clause and links it to the main one (because, although, when, if).", more: WH("Conjunctions") },
    "clause":                    { def: "A group of words with its own subject and verb.", more: WH("Clauses") },
    "main clause":               { def: "A clause that can stand alone as a complete sentence.", more: WH("Clauses") },
    "subordinate clause":        { def: "A clause that cannot stand alone — it depends on the main clause (e.g. 'because it was hot').", more: WH("Clauses") },
    "relative clause":           { def: "A clause that adds information about a noun, usually starting with who/which/that.", more: WH("Relative-Clauses") },
    "relative pronoun":          { def: "The word that starts a relative clause: who (people), which (things), that (either).", more: WH("Relative-Clauses") },
    "coordination":              { def: "Joining two equal ideas with and/but/or/so.", more: WH("Compound-Sentences") },
    "subordination":             { def: "Adding a dependent clause with a word like because/although/when.", more: WH("Complex-Sentences") },

    // ---- tense ----
    "tense":               { def: "The form of a verb that shows when something happens (past, present, future).", more: WH("Tense-Consistency") },
    "present simple":      { def: "Used for habits and facts: 'She walks to school every day.'", more: WH("Verbs") },
    "present continuous":  { def: "Used for something happening right now: 'She is walking to school.'", more: WH("Verbs") },
    "past simple":         { def: "Used for a finished action in the past: 'She walked to school.'", more: WH("Verbs") },
    "present perfect":     { def: "Links the past to now (has/have + past participle): 'She has walked 5 km.'", more: WH("Verbs") },
    "past perfect":        { def: "An earlier past action (had + past participle): 'She had left before I arrived.'", more: WH("Verbs") },
    "participle":          { def: "A verb form used in tenses or as a describing word: -ing (walking) or -ed/-en (walked, broken)." },
    "past participle":     { def: "The verb form used after has/have/had or in the passive (walked, eaten, broken, sent)." },

    // ---- voice & mood ----
    "active voice":  { def: "The subject does the action: 'The dog chased the cat.'", more: WH("Verbs") },
    "passive voice": { def: "The subject receives the action (be + past participle): 'The cat was chased.'", more: WH("Verbs") },
    "passive":       { def: "When the subject receives the action instead of doing it: 'The cake was eaten.'", more: WH("Verbs") },
    "modal verb":    { def: "A helper verb that shows things like ability, obligation or possibility (can, must, might, should).", more: WH("Auxiliary-and-Modal-Verbs") },
    "modal":         { def: "A helper verb showing ability, obligation or possibility (can, must, might, should).", more: WH("Auxiliary-and-Modal-Verbs") },
    "conditional":   { def: "An 'if' sentence about a possible or imaginary situation: 'If it rains, we will stay in.'", more: WH("Tense-Consistency") },

    // ---- number & agreement ----
    "plural":      { def: "More than one (cats, children, mice). Singular means just one.", more: WH("Nouns") },
    "countable":   { def: "A noun you can count with a number (one apple, two apples).", more: WH("Nouns") },
    "uncountable": { def: "A noun you cannot count with a number (water, music, homework).", more: WH("Nouns") },
    "quantifier":  { def: "A word showing how much/how many (much, many, some, a few, a little)." },
    "agreement":   { def: "Making the verb match the subject: 'She walks' (singular) vs 'They walk' (plural).", more: WH("Subject-Verb-Agreement") },
    "subject-verb agreement": { def: "Making the verb match the subject in number: 'She walks' vs 'They walk'.", more: WH("Subject-Verb-Agreement") },

    // ---- questions & punctuation ----
    "negation":    { def: "Making a sentence mean 'no/not': 'She does not like spicy food.'" },
    "question tag": { def: "A short question added to the end of a statement: 'You're coming, aren't you?'" },
    "inversion":   { def: "Swapping the subject and verb, often to form a question: 'You are' -> 'Are you?'" },
    "defining":    { def: "A relative clause (no commas) that tells you which one: 'The boy who sits here is new.'", more: WH("Relative-Clauses") },
    "non-defining":{ def: "A relative clause (with commas) that adds extra info: 'My brother, who lives in Perth, is a doctor.'", more: WH("Comma-Use") },
    "cleft":       { def: "A sentence split to add emphasis: 'It was Mia who solved it.'" }
  };
})();
