/* ============================================================
   GRAMMAR HUB — WRITING PROMPTS
   ------------------------------------------------------------
   Short, low-stakes writing tasks (10 to 15 minutes) offered at
   the end of a teaching unit or after revision. Always OPTIONAL:
   nothing here is marked, scored, or fed into the mastery loop.
   The engine only reads this array; it knows nothing about
   grammar.

   A prompt:
     id      "wp-" + first skill id + counter (unique)
     skills  1 to 3 cell ids from window.SKILLS (never a cell
             with introduced:false, so never passive-c3 or
             relative-c3)
     title   short, projectable on the board
     time    always "10–15 min"
     prompt  instructions written directly to the student
     checks  2 to 4 self-check success criteria in student words

   HOUSE STYLE: AU spelling, no em dashes in learner-facing text,
   EAL secondary register. Scenarios must be attemptable by a
   student who arrived in Melbourne last month.
   ============================================================ */

window.WRITING_PROMPTS = [

  /* ========= 1. SENTENCE STRUCTURE ========= */

  { id:"wp-sentence-c1-1", skills:["sentence-c1"], title:"Six things I did today", time:"10–15 min",
    prompt:"Write six short sentences about your day, one for each of these times: morning, recess, lunch, afternoon, after school, evening. Every sentence needs a person or thing doing something. Start like this: ‘I ate rice for breakfast.’ Keep each sentence to one idea only.",
    checks:["Every sentence has a subject (who or what) before the verb","Every sentence has a verb (the doing word)","Where there is an object, it comes after the verb","No sentence is a fragment, so each one could stand alone"] },

  { id:"wp-sentence-c1-2", skills:["sentence-c1"], title:"Photo captions for my phone", time:"10–15 min",
    prompt:"Imagine five photos on your phone: one of food, one of a friend, one of a street, one of a pet or animal, one of something at school. Write one caption for each photo. A caption must be a full sentence, not just words, so ‘Noodles’ becomes ‘My mother made noodles.’",
    checks:["Each caption has a subject and a verb","Each caption makes sense on its own","The word order is subject, then verb, then object","There are five captions, all different"] },

  { id:"wp-sentence-c1-3", skills:["sentence-c1"], title:"The busy kitchen", time:"10–15 min",
    prompt:"Picture a kitchen at dinner time with four people in it. Write eight sentences saying who does what. For example: ‘My father chops the onions. My sister washes the rice.’ Use a different person or a different verb in every sentence.",
    checks:["Eight sentences, each with a clear subject and verb","The object (the thing being chopped, washed, carried) comes after the verb","No two sentences use the same verb","Every sentence starts with a capital letter and ends with a full stop"] },

  { id:"wp-sentence-c2-1", skills:["sentence-c2"], title:"Two sides of my week", time:"10–15 min",
    prompt:"Write six sentences about last week, and join two ideas in every one using and, but, or, or so. For example: ‘The bus was late, so I missed the first ten minutes of maths.’ Try to use each of the four joining words at least once.",
    checks:["Each sentence joins two complete ideas","I used and, but, or and so at least once each","I put a comma before but and so when the two ideas are full sentences","The joining word matches the meaning: but for a surprise, so for a result"] },

  { id:"wp-sentence-c2-2", skills:["sentence-c2"], title:"Message thread: making a plan", time:"10–15 min",
    prompt:"Write a message thread between you and a friend deciding what to do on Saturday. Write at least eight messages, alternating between the two of you. In every message you must join two ideas, like this: ‘We can meet at the station or you can come to my house.’",
    checks:["Every message joins two ideas with and, but, or, or so","At least two messages offer a choice using or","At least one message shows a result using so","The thread reads like real texting, but each message is still a full compound sentence"] },

  { id:"wp-sentence-c2-3", skills:["sentence-c2"], title:"Review: the best and worst of it", time:"10–15 min",
    prompt:"Review a game, a film, or a restaurant you know well, in six sentences. Every sentence must balance a good point against a bad point, or add a second point, using and, but, or, so. Start like this: ‘The food was cheap, but the queue was very long.’",
    checks:["Six sentences, each one a compound sentence","At least three sentences use but to contrast a good point with a bad one","A comma sits before but and so where two full ideas are joined","I finish with a clear recommendation"] },

  { id:"wp-sentence-c3-1", skills:["sentence-c3"], title:"Although it rained", time:"10–15 min",
    prompt:"Write a diary entry of about eight sentences about a day that did not go to plan. Begin at least four sentences with a subordinating conjunction: although, because, when, while, since, after, before. Start like this: ‘Although I set two alarms, I still woke up late.’",
    checks:["At least four sentences begin with although, because, when, while, since, after or before","When the subordinate clause comes first, a comma follows it","Every sentence still has a main clause that could stand alone","The conjunction fits the meaning: although for surprise, because for a reason"] },

  { id:"wp-sentence-c3-2", skills:["sentence-c3"], title:"Why I chose it", time:"10–15 min",
    prompt:"Explain a real choice you made: a subject you picked, a sport you joined, a phone you bought, or a place your family moved to. Write six to eight sentences and give reasons and conditions using because, since, so that, even though, unless. For example: ‘I chose art because I wanted one subject where nobody corrects my English.’",
    checks:["At least four sentences contain a subordinate clause","I used because or since to give a reason","I used even though or although at least once to admit a problem","Each sentence has one main idea plus the extra clause, not two main ideas jammed together"] },

  { id:"wp-sentence-c3-3", skills:["sentence-c3"], title:"Story opening: the room was empty", time:"10–15 min",
    prompt:"Write the opening paragraph of a story that begins when someone walks into a room and finds it empty. Use while, as, when, and before to layer the actions together. Try an opening like: ‘While the rest of the class waited outside, Mai pushed the door open.’",
    checks:["At least four subordinating conjunctions across the paragraph","Sentences that start with a subordinate clause have a comma after it","I used while or as to show two things happening at the same time","The paragraph is one connected scene, not a list of separate sentences"] },

  { id:"wp-sentence-c4-1", skills:["sentence-c4"], title:"Setting the record straight", time:"10–15 min",
    prompt:"A rumour has gone around your year level and the details are all wrong. Write a short message correcting it, in six sentences, using emphatic cleft structures. For example: ‘It was Minh who found the wallet, not Daniel. What actually happened was much less dramatic.’",
    checks:["At least three sentences use ‘It was … who/that …’","At least two sentences use ‘What … was/is …’","The emphasis falls on the word I most want to correct","The tone stays calm and the meaning is still clear"] },

  { id:"wp-sentence-c4-2", skills:["sentence-c4"], title:"The moment that decided the match", time:"10–15 min",
    prompt:"Write a short sports report about the turning point of a game, real or invented. Use cleft sentences to put the spotlight exactly where you want it: ‘It was the third goal that broke them. What the crowd noticed was the silence on the bench.’ Six to eight sentences.",
    checks:["At least three cleft sentences ‘It was … that/who …’","At least one sentence beginning ‘What …’","Each cleft emphasises a different element: a person, a time, or a thing","The report still reads smoothly, not like a grammar exercise"] },

  { id:"wp-sentence-c4-3", skills:["sentence-c4"], title:"What I actually want", time:"10–15 min",
    prompt:"Someone has misunderstood what you want, in a shop, at home, or from a teacher. Write six sentences explaining what you really mean. Lead with the emphasis: ‘What I need is more time, not more advice. It is the deadline that worries me, not the topic.’",
    checks:["At least three sentences begin with ‘What I …’","At least two sentences use ‘It is/was … that …’","Each emphatic sentence corrects one specific misunderstanding","I did not simply repeat the same structure with the same words"] },

  /* ========= 2. VERB TENSES ========= */

  { id:"wp-tense-c1-1", skills:["tense-c1"], title:"Usually and right now", time:"10–15 min",
    prompt:"Write eight sentences about yourself in pairs. In each pair, the first sentence says what you usually do, the second says what is happening right now. For example: ‘I usually walk to school. Today I am sitting on the bus because it is raining.’",
    checks:["The ‘usually’ sentences use present simple: I walk, she walks","The ‘right now’ sentences use present continuous: I am sitting","Third person singular verbs end in s: he plays, she watches","The two sentences in each pair are clearly about the same thing"] },

  { id:"wp-tense-c1-2", skills:["tense-c1"], title:"Yesterday, hour by hour", time:"10–15 min",
    prompt:"Write a diary entry about yesterday in eight sentences, moving forward in time from waking up to going to bed. Everything already happened, so every verb is past simple. Start like this: ‘I woke up at seven. I ate bread and drank tea.’",
    checks:["Every verb is in the past simple","Irregular verbs are correct: went, ate, saw, had, took","Regular verbs end in ed: walked, watched, finished","The order of events is clear from first to last"] },

  { id:"wp-tense-c1-3", skills:["tense-c1"], title:"Video call to family", time:"10–15 min",
    prompt:"Write a dialogue of about ten lines from a video call with a relative overseas. They ask what you are doing, and you answer with both your normal routine and what is happening at that moment. Example line: ‘Right now I am cooking noodles, but I usually eat at school.’",
    checks:["Present continuous is used for what is happening during the call","Present simple is used for routines and habits","Past simple is used for anything that happened earlier today","Every ‘am/is/are + ing’ has the correct form of be"] },

  { id:"wp-tense-c2-1", skills:["tense-c2"], title:"Since I arrived", time:"10–15 min",
    prompt:"Write eight sentences about the time since you started at this school, or since you moved to this suburb. Do not give exact dates, because the point is what has happened up to now. Start like this: ‘I have made three new friends since February. I have not tried the canteen pies yet.’",
    checks:["Every sentence uses have or has plus a past participle","Past participles are correct: made, been, seen, taken, written","I used since and for correctly: since a point in time, for a length of time","At least two sentences use already, yet, or never"] },

  { id:"wp-tense-c2-2", skills:["tense-c2"], title:"Have you ever?", time:"10–15 min",
    prompt:"Write a short interview between you and a classmate about experiences: food, travel, sport, embarrassing moments. Ask six questions starting with ‘Have you ever …?’ and write the answers too. Example: ‘Have you ever eaten durian? Yes, I have tried it twice.’",
    checks:["Every question uses Have/Has + subject + past participle","Short answers use have or has, not do or did","At least two answers use never or twice or before","Where a question moves to a finished time, the answer switches to past simple"] },

  { id:"wp-tense-c2-3", skills:["tense-c2"], title:"Group chat before the deadline", time:"10–15 min",
    prompt:"Write a group chat between three students the night before an assignment is due. They compare what they have finished and what they have not started. Ten messages. Example: ‘I have written the introduction but I have not found any sources yet.’",
    checks:["Messages use have/has plus past participle to report progress","Negatives use have not or has not, often shortened to haven’t or hasn’t","At least three messages use yet, already, or so far","The names on the messages make it clear who has done what"] },

  { id:"wp-tense-c3-1", skills:["tense-c3"], title:"By the time I got there", time:"10–15 min",
    prompt:"Write about arriving somewhere too late: a bus, a party, a shop, a match. Tell the story in eight sentences, and make clear what had already happened before you arrived. Start like this: ‘By the time I reached the oval, the game had already started.’",
    checks:["Past perfect (had + past participle) is used for the earlier events","Past simple is used for the event I arrived at","At least two sentences use ‘by the time’ or ‘before’ or ‘already’","The order of the two past times is never confusing"] },

  { id:"wp-tense-c3-2", skills:["tense-c3"], title:"I had been waiting twenty minutes", time:"10–15 min",
    prompt:"Write about a long wait that was finally interrupted: at a station, a clinic, a job trial, or outside a locked classroom. Eight sentences. Use the past perfect progressive for the waiting and the past simple for the interruption: ‘I had been standing in the rain for twenty minutes when the tram finally came.’",
    checks:["At least three sentences use had been plus an ing verb","The interrupting event is in past simple","I used ‘for’ with lengths of time: for twenty minutes, for an hour","The reader can tell which action came first and which cut it short"] },

  { id:"wp-tense-c3-3", skills:["tense-c3"], title:"The missing phone", time:"10–15 min",
    prompt:"A phone goes missing from a school bag. Write a short account, like a detective explaining what had happened before the phone disappeared. Eight to ten sentences. Example: ‘Nobody had touched the bag before lunch. Ravi had been sitting near it all morning.’",
    checks:["Past perfect (had + past participle) reports what happened before the discovery","Past perfect progressive (had been + ing) covers ongoing background actions","Past simple is used for the discovery itself","The timeline is clear even though it moves backwards"] },

  { id:"wp-tense-c4-1", skills:["tense-c4"], title:"This time next year", time:"10–15 min",
    prompt:"Write eight sentences predicting your life exactly one year from today: where you will be living, what you will be studying, who you will be seeing. Use the future progressive: ‘This time next year I will be sitting in a Year 10 classroom, and my cousin will be flying to Melbourne.’",
    checks:["Sentences use will be plus an ing verb for actions in progress","At least two sentences begin with a time marker like ‘This time next year’","Contractions like ‘I’ll be’ are spelled correctly","The predictions are specific, not just ‘I will be happy’"] },

  { id:"wp-tense-c4-2", skills:["tense-c4"], title:"By the time I turn twenty", time:"10–15 min",
    prompt:"Write about what you will have completed by a future date: finishing school, saving money, learning to drive, visiting a country. Eight sentences using the future perfect. Start like this: ‘By the time I turn twenty, I will have finished Year 12 and I will have saved enough for a trip home.’",
    checks:["Sentences use will have plus a past participle","Every sentence has a future deadline: by then, by 2030, by the time I …","Past participles are correct: finished, saved, seen, written, become","At least one sentence is negative: I will not have …"] },

  { id:"wp-tense-c4-3", skills:["tense-c4"], title:"The busiest Saturday", time:"10–15 min",
    prompt:"Plan an extremely busy Saturday hour by hour and write it as a message to a friend who wants to meet you. Say what you will be doing at each hour, and what you will have finished by certain times. Example: ‘At two I will still be working, but by four I will have finished my shift.’",
    checks:["Future progressive (will be + ing) says what is in progress at a given hour","Future perfect (will have + past participle) says what is complete by a given hour","Every claim is tied to a clock time","The friend could work out exactly when I am free"] },

  /* ========= 3. MODALITY ========= */

  { id:"wp-modality-c1-1", skills:["modality-c1"], title:"Rules for the new student", time:"10–15 min",
    prompt:"A new student joins your class tomorrow and speaks little English. Write ten short rules and tips for them, using must, must not, can and cannot. Start like this: ‘You must bring your student card every day. You can eat in the courtyard at lunch.’",
    checks:["must and must not are used for rules","can and cannot are used for what is allowed or possible","The verb after must and can has no ‘to’ and no s: ‘She can go’, not ‘She can goes’","The rules are things a real new student would need on day one"] },

  { id:"wp-modality-c1-2", skills:["modality-c1"], title:"What I can do", time:"10–15 min",
    prompt:"Write a short profile of yourself for a club, a team, or a part time job application. List eight abilities and limits using can and cannot. For example: ‘I can carry heavy boxes and I can count money quickly. I cannot work on Sunday mornings.’",
    checks:["Every ability uses can plus a base verb","Every limit uses cannot or can’t plus a base verb","At least two sentences say what I must do as well: I must leave by five","No ‘to’ after can: ‘I can lift’, not ‘I can to lift’"] },

  { id:"wp-modality-c1-3", skills:["modality-c1"], title:"Instructions for the pet sitter", time:"10–15 min",
    prompt:"Your family is away for a week and a neighbour is looking after your pet, your plants, or your little brother. Write ten instructions using must, must not and can. Example: ‘You must feed her twice a day. You must not open the back gate. You can watch TV in the lounge.’",
    checks:["Strong rules use must or must not","Permission uses can","At least three instructions are negative","Each instruction is one clear sentence a stranger could follow"] },

  { id:"wp-modality-c2-1", skills:["modality-c2"], title:"It might rain on Saturday", time:"10–15 min",
    prompt:"Write a message to a friend planning an outdoor day when nothing is certain. Give six possibilities using may and might, and say what each one would mean. Start like this: ‘It might rain in the afternoon, so we may need a backup plan.’",
    checks:["Possibilities use may or might plus a base verb","At least one negative: it might not, we may not","No ‘to’ after may or might","Every possibility is followed by what it would mean for the plan"] },

  { id:"wp-modality-c2-2", skills:["modality-c2"], title:"Where is my phone?", time:"10–15 min",
    prompt:"Your phone has vanished somewhere between home and school. Write eight guesses about where it is and what happened, none of them certain. Example: ‘It might be in my sports bag. It may have slipped out on the tram.’",
    checks:["Each guess uses may or might","Guesses about right now use may/might be","At least two sentences use may not or might not","No guess is stated as a fact"] },

  { id:"wp-modality-c2-3", skills:["modality-c2"], title:"Asking politely", time:"10–15 min",
    prompt:"Write three short dialogues, each about four lines: asking a teacher to hand work in late, asking a manager to change a shift, asking a neighbour for a favour. Use may for polite requests and might for uncertainty. Example: ‘May I hand this in on Monday? I might not finish tonight.’",
    checks:["Requests use ‘May I …?’ with a base verb","Uncertain answers use might or may","The three dialogues use different levels of politeness for the three people","No ‘to’ after may or might"] },

  { id:"wp-modality-c3-1", skills:["modality-c3"], title:"The test I did not study for", time:"10–15 min",
    prompt:"Write a diary entry the evening after a test that went badly. Look back and say what you should and should not have done. Start like this: ‘I should have started revising on Tuesday. I should not have watched three episodes instead.’",
    checks:["Regrets use should have or should not have plus a past participle","At least one sentence uses could have to name a missed option","At least one uses would have to say what would have followed","Past participles are correct: studied, gone, written, done"] },

  { id:"wp-modality-c3-2", skills:["modality-c3"], title:"Advice, one week too late", time:"10–15 min",
    prompt:"A friend has already lost a part time job, an argument, or a place in a team. Write them a short letter of about eight sentences: kind, but honest about what could have been done differently. Example: ‘You could have told the manager you were sick. I should have reminded you to call.’",
    checks:["At least four sentences use should have, could have, or might have","The past participle after have is correct every time","At least one sentence takes some responsibility myself","The letter still sounds supportive, not cruel"] },

  { id:"wp-modality-c3-3", skills:["modality-c3"], title:"She never came", time:"10–15 min",
    prompt:"Someone did not turn up to meet you and their phone is off. Write eight sentences speculating about why, ranked from most likely to least likely. Example: ‘She must have missed the bus. She might have forgotten the time. She cannot have ignored six messages on purpose.’",
    checks:["Strong deductions use must have plus a past participle","Weaker guesses use might have or could have","At least one impossibility uses cannot have or could not have","The order of my guesses matches how sure I am"] },

  { id:"wp-modality-c4-1", skills:["modality-c4"], title:"The empty classroom", time:"10–15 min",
    prompt:"You walk into a classroom at lunch and find a chair on a desk, a window open, and a half eaten sandwich. Write eight sentences guessing what people had been doing there. Example: ‘Someone might have been climbing to reach the projector. They must have been eating in here, which is not allowed.’",
    checks:["Guesses use might/must/could + have been + an ing verb","At least one negative: they cannot have been …","The guesses explain the clues in the room, one by one","I did not slip back into simple ‘might have done’ where an ongoing action fits better"] },

  { id:"wp-modality-c4-2", skills:["modality-c4"], title:"Sorry, I missed your call", time:"10–15 min",
    prompt:"You missed six calls from home. Write a message explaining what you might have been doing at each time, and then a reply from your parent guessing too. Ten lines total. Example: ‘At four I must have been training, and at five I could have been sitting on the tram with no signal.’",
    checks:["Explanations use must/might/could + have been + ing","Each guess is tied to a specific time","At least two different modals appear, not just might","The reply also uses at least one modal progressive"] },

  { id:"wp-modality-c4-3", skills:["modality-c4"], title:"How we lost that match", time:"10–15 min",
    prompt:"Write a short post match analysis of a game your team lost. Speculate about what the other side had been planning and what your own team could have been doing better. Example: ‘They must have been studying our defence all week. We could have been pressing higher instead of waiting.’",
    checks:["At least four sentences use a modal plus have been plus an ing verb","Speculation about the opponents and about my own team both appear","At least one sentence uses should have been to name a better ongoing tactic","The analysis reads like commentary, not a list"] },

  /* ========= 4. CONDITIONALS ========= */

  { id:"wp-cond-c1-1", skills:["cond-c1"], title:"Kitchen science", time:"10–15 min",
    prompt:"Write eight sentences about things that always happen in a kitchen, using if or when plus the present simple in both halves. Example: ‘If you heat oil for too long, it smokes. When rice absorbs all the water, it is ready.’",
    checks:["Both halves of every sentence use the present simple","if and when both appear at least twice","A comma follows the if clause when it comes first","Every sentence is a general truth, not a one time event"] },

  { id:"wp-cond-c1-2", skills:["cond-c1"], title:"If the screen freezes", time:"10–15 min",
    prompt:"Write a troubleshooting guide for a phone, a game console, or a laptop, for someone who is not confident with technology. Eight lines. Example: ‘If the screen freezes, you hold the power button for ten seconds. If the app closes itself, you check for updates.’",
    checks:["Each line follows the pattern: if + present simple, present simple","The advice is always true, not just for one occasion","At least two lines start with the result and put if second","Someone could actually follow these steps"] },

  { id:"wp-cond-c1-3", skills:["cond-c1"], title:"House rules that never change", time:"10–15 min",
    prompt:"Every home has rules that always work the same way. Write eight of yours using zero conditionals. Example: ‘If someone leaves dishes in the sink, my mother calls a family meeting. If we come home after nine, we take our shoes off at the door.’",
    checks:["Present simple in both halves of every sentence","Subject and verb agree: he leaves, they leave","At least two sentences use when instead of if","Each rule describes what always happens, not what happened once"] },

  { id:"wp-cond-c2-1", skills:["cond-c2"], title:"If it rains on Saturday", time:"10–15 min",
    prompt:"Write a message thread of ten messages planning a real weekend with a friend, where the plan depends on the weather, money, and who else says yes. Example: ‘If it rains, we will go to the library instead. If Ali comes, we will need a bigger table.’",
    checks:["The if half uses the present simple","The result half uses will or won’t plus a base verb","At least two messages are negative: if we don’t …, we won’t …","No ‘will’ inside the if clause"] },

  { id:"wp-cond-c2-2", skills:["cond-c2"], title:"A warning to my younger self", time:"10–15 min",
    prompt:"Write eight warnings to a younger sibling or a Year 7 student about the year ahead. Each one is a real consequence. Start like this: ‘If you leave every assignment until Sunday night, you will hate Sundays.’",
    checks:["Every warning uses if + present simple, then will + base verb","At least three warnings use if you don’t …","At least one uses unless instead of if not","The consequences are realistic, not exaggerated jokes"] },

  { id:"wp-cond-c2-3", skills:["cond-c2"], title:"If I get the job", time:"10–15 min",
    prompt:"You have applied for your first part time job. Write eight sentences about what will change if you get it, and what you will do if you do not. Example: ‘If they call me back, I will need to buy black shoes. If I don’t get it, I will apply at the supermarket.’",
    checks:["if + present simple, then will + base verb in every sentence","Both possibilities appear: getting the job and not getting it","At least one sentence uses might or may in the result half","No ‘will’ after if"] },

  { id:"wp-cond-c3-1", skills:["cond-c3"], title:"If I ran this school", time:"10–15 min",
    prompt:"Imagine you are principal for one day. Write eight sentences about what you would change and what would happen. This is imaginary, so use the second conditional: ‘If I ran this school, lunch would be forty minutes long. Nobody would start before nine.’",
    checks:["The if half uses the past simple even though it is about now","The result half uses would plus a base verb","At least one sentence uses ‘If I were …’","No would inside the if clause"] },

  { id:"wp-cond-c3-2", skills:["cond-c3"], title:"If I had that much money", time:"10–15 min",
    prompt:"You have imaginary money, but not unlimited: enough to change your family’s year, not the world. Write eight sentences about what you would do. Example: ‘If I had that money, I would fly my grandmother here for winter.’",
    checks:["Past simple in the if half, would plus base verb in the result","At least two sentences use could or might instead of would","At least one is negative: I wouldn’t …","Every idea is clearly imaginary, not a real plan"] },

  { id:"wp-cond-c3-3", skills:["cond-c3"], title:"If I were you", time:"10–15 min",
    prompt:"A friend cannot decide between two subjects, two teams, or two weekend jobs. Write them a short reply of eight sentences full of imaginary advice. Start like this: ‘If I were you, I would choose the earlier shift.’",
    checks:["At least three sentences use ‘If I were you, I would …’","Other sentences use past simple + would for imaginary situations","At least one uses might to soften the advice","The advice is specific to their two choices"] },

  { id:"wp-cond-c4-1", skills:["cond-c4"], title:"The day everything went wrong", time:"10–15 min",
    prompt:"Write about a day when one small mistake made everything else collapse. First tell what happened in four sentences, then write six sentences about how it could have gone differently. Example: ‘If I had charged my phone, I would not have missed the message.’",
    checks:["The if half uses had plus a past participle","The result half uses would have, could have, or might have plus a past participle","At least four full third conditional sentences","Everything is finished and unchangeable, so no present or future forms slip in"] },

  { id:"wp-cond-c4-2", skills:["cond-c4"], title:"If we had never moved", time:"10–15 min",
    prompt:"Think about one big past decision by you or your family. Write eight sentences about how life now would be different if it had not happened. Mix the times: ‘If we hadn’t moved to Melbourne, I would be in Year 9 in Hanoi right now.’",
    checks:["The if half uses had plus a past participle for the past decision","At least three results use would be or would not be about now, not would have been","At least two full third conditionals about the past are also included","The difference between past cause and present result is clear"] },

  { id:"wp-cond-c4-3", skills:["cond-c4"], title:"Post match regrets", time:"10–15 min",
    prompt:"Your team lost a close game. Write the captain’s short speech in the change room: honest, not angry, about eight sentences. Example: ‘If we had defended the last five minutes, we would have won. If Sam hadn’t been injured, we might have held on.’",
    checks:["had plus past participle in the if half every time","would have, could have or might have plus past participle in the result","At least one mixed sentence about how things would be now","The speech ends with something forward looking"] },

  /* ========= 5. PASSIVE VOICE ========= */

  { id:"wp-passive-c1-1", skills:["passive-c1"], title:"Lost property notice", time:"10–15 min",
    prompt:"Something of yours went missing at school: a bag, a jumper, a water bottle, a calculator. Write a short notice for the office in six sentences. You do not know who did anything, so the thing comes first: ‘My jacket was taken from the gym on Tuesday.’",
    checks:["Each sentence starts with the thing, not the person","Each verb is was or were plus a past participle","I did not invent a person to blame","Past participles are correct: taken, left, moved, found"] },

  { id:"wp-passive-c1-2", skills:["passive-c1"], title:"It was already done", time:"10–15 min",
    prompt:"You come home and everything has been dealt with, but nobody says who did it. Write six sentences describing what you find. Example: ‘The dishes were washed. My bed was made. The rubbish was taken out.’",
    checks:["Every sentence uses was or were plus a past participle","The thing that had something done to it is the subject","was goes with singular things, were with plural things","Nobody is named as the doer"] },

  { id:"wp-passive-c1-3", skills:["passive-c1"], title:"Notices on the school door", time:"10–15 min",
    prompt:"Write six short official notices for a school noticeboard, the kind where nobody signs their name. Example: ‘The excursion was cancelled. All lockers were checked this morning. Phones are collected at the front desk.’",
    checks:["Every notice uses a form of be plus a past participle","The notices sound official because no person is named","Singular and plural subjects take was or were correctly","Each notice is one clear sentence"] },

  { id:"wp-passive-c2-1", skills:["passive-c2"], title:"How it is made", time:"10–15 min",
    prompt:"Explain how a dish from your family is made, but write it like a food label or a factory description, not like a recipe with ‘you’. Eight sentences. Example: ‘The rice is soaked overnight. The pork is marinated in fish sauce and then it is steamed for an hour.’",
    checks:["Every step uses is or are plus a past participle","No ‘you’ and no imperative verbs like ‘add’ or ‘mix’","Singular and plural subjects choose is or are correctly","The steps are in the right order and could be followed"] },

  { id:"wp-passive-c2-2", skills:["passive-c2"], title:"Where my things come from", time:"10–15 min",
    prompt:"Look at five things you own and write a short paragraph about each one, three sentences each, saying where and when it was made, bought, given, or repaired. Example: ‘These shoes were made in Vietnam. They were given to me by my uncle.’",
    checks:["Past passive uses was or were plus a past participle","Present passive uses is or are plus a past participle","‘by’ is only used when the doer really matters","The five objects are genuinely different in what happened to them"] },

  { id:"wp-passive-c2-3", skills:["passive-c2"], title:"School newsletter report", time:"10–15 min",
    prompt:"Write a short newsletter item about changes at your school over the last year. Newsletters are written in the passive because the doers are a committee nobody names. Example: ‘The courtyard was repainted in March. Recycling bins are now emptied twice a week.’",
    checks:["Both present passive (is/are + participle) and past passive (was/were + participle) appear","The changes, not the people, are the subjects","At least one sentence uses ‘by’ to credit a group who deserve it","The item reads like a real newsletter, about eight sentences"] },

  { id:"wp-passive-c4-1", skills:["passive-c4"], title:"According to the rumour mill", time:"10–15 min",
    prompt:"Write a short report on a school rumour, in the careful language a newspaper uses when nothing is confirmed. Eight sentences. Example: ‘The canteen is said to be changing its menu. The decision is believed to have been made last term.’",
    checks:["At least four sentences use is/are said, believed, thought, reported, or known plus to","Finished events use ‘to have’ plus a past participle","At least one sentence uses the frame ‘It is thought that …’","No source is ever named, which is the point"] },

  { id:"wp-passive-c4-2", skills:["passive-c4"], title:"The transfer nobody confirmed", time:"10–15 min",
    prompt:"Write a sports gossip column about a player, coach, or team, real or invented, where every claim is unconfirmed. Eight sentences. Example: ‘The captain is understood to have met the rival club twice. He is thought to be unhappy with his contract.’",
    checks:["Every claim uses a passive reporting frame: is said to, is believed to, is understood to","‘to be’ is used for now and ‘to have’ plus a participle for the past","At least two different reporting verbs appear","No sentence states an unconfirmed claim as a plain fact"] },

  { id:"wp-passive-c4-3", skills:["passive-c4"], title:"Incident report", time:"10–15 min",
    prompt:"Write a formal report about something that went wrong at a workplace or event, in the distant, careful style of an official document. Eight sentences. Example: ‘The door is believed to have been left unlocked. Staff are reported to have followed the correct procedure.’",
    checks:["Passive reporting frames carry the uncertain claims","Confirmed facts use ordinary passives: was found, were checked","At least one sentence combines both: is believed to have been left","The register stays formal throughout, with no ‘I reckon’"] },

  /* ========= 6. RELATIVE CLAUSES ========= */

  { id:"wp-relative-c1-1", skills:["relative-c1"], title:"The people in my week", time:"10–15 min",
    prompt:"Write six sentences introducing six people you saw this week, adding who they are with a who clause. Start like this: ‘My neighbour is the man who fixes bikes in his driveway.’",
    checks:["Every sentence contains who or which","who is used for people and which for things","The clause comes straight after the noun it describes","Each sentence still works as a full sentence if the clause is removed"] },

  { id:"wp-relative-c1-2", skills:["relative-c1"], title:"Everything in my bag", time:"10–15 min",
    prompt:"Empty your school bag in your imagination and describe eight things in it, saying what each one does or where it came from. Example: ‘I have a pencil case which my sister gave me and a bottle which leaks.’",
    checks:["Every object is described with a which or that clause","which and that are used for things, not who","The clause follows the object immediately","Eight different objects, eight different clauses"] },

  { id:"wp-relative-c1-3", skills:["relative-c1"], title:"Guess who, guess what", time:"10–15 min",
    prompt:"Write ten clues for a guessing game about people and objects at your school, without naming them. Example: ‘It is the room which smells of paint. She is the teacher who never sits down.’",
    checks:["Every clue uses who or which","People clues use who, object clues use which","No clue names the answer","The clues are fair, so a classmate could actually guess"] },

  { id:"wp-relative-c2-1", skills:["relative-c2"], title:"My street", time:"10–15 min",
    prompt:"Describe your street or apartment block in eight sentences. Some clauses tell us which one you mean and take no commas; others add extra information and take commas. Example: ‘The shop that sells phone cases is always closed. My building, which was painted last year, has a broken lift.’",
    checks:["Defining clauses have no commas and tell the reader which one","Non-defining clauses sit inside commas and add extra detail","At least three of each type","‘that’ is only used in defining clauses, never after a comma"] },

  { id:"wp-relative-c2-2", skills:["relative-c2"], title:"Profile of a friend", time:"10–15 min",
    prompt:"Write a short profile of a friend for a class display, eight sentences. Use commas around the facts that are extra, and no commas around the facts that identify. Example: ‘Amira, who moved here in Year 7, is the friend I message first. The song that she plays every morning is now stuck in my head.’",
    checks:["Extra information sits between commas","Identifying information has no commas","At least one non-defining clause uses which about a thing","Removing a non-defining clause still leaves a complete sentence"] },

  { id:"wp-relative-c2-3", skills:["relative-c2"], title:"Review with extra detail", time:"10–15 min",
    prompt:"Review a place you know: a food court, a park, a pool, a library. Eight sentences. Use non-defining clauses to slip in extra facts and defining clauses to point at exactly which thing you mean. Example: ‘The noodle stall, which only opens at noon, is worth the wait. The seats that face the window fill up first.’",
    checks:["Commas mark every non-defining clause, at both ends","Defining clauses have no commas","who, which and that are each used correctly at least once","The review still gives a clear opinion"] },

  { id:"wp-relative-c4-1", skills:["relative-c4"], title:"A feature about my school", time:"10–15 min",
    prompt:"Write a paragraph for a magazine feature about your school, in a polished, formal style. Use non-defining clauses for background and reduced clauses to keep sentences tight. Example: ‘Students living more than an hour away, most of whom catch two trains, arrive before the gates open.’",
    checks:["At least two reduced clauses with an ing or ed form and no relative pronoun","At least two non-defining clauses inside commas","At least one clause uses whom, whose, or ‘of whom’","The paragraph reads as one connected piece of writing"] },

  { id:"wp-relative-c4-2", skills:["relative-c4"], title:"Captions for an exhibition", time:"10–15 min",
    prompt:"Imagine a photo exhibition about your suburb. Write six museum style captions, each two sentences, packing information in tightly. Example: ‘The market, built in 1878, still opens at dawn. Traders arriving before sunrise set up under lights.’",
    checks:["At least four captions use a reduced clause: built, arriving, sold, waiting","Non-defining clauses appear inside commas where full clauses are needed","No caption is a run on sentence","Each caption could sit under a photograph and make sense alone"] },

  { id:"wp-relative-c4-3", skills:["relative-c4"], title:"News feature: the new rule", time:"10–15 min",
    prompt:"A new rule has been introduced at school or in your suburb. Write a news feature paragraph of eight sentences reporting how different groups reacted. Example: ‘Parents, many of whom work night shifts, say the change helps. Students affected by the earlier start have complained.’",
    checks:["At least two reduced clauses replace a full relative clause","At least one clause uses ‘many of whom’ or ‘most of which’ or ‘whose’","Commas are correct around every non-defining clause","The paragraph keeps a neutral, reporting tone"] },

  /* ========= 7. AGREEMENT & NUMBER ========= */

  { id:"wp-agree-c1-1", skills:["agree-c1"], title:"Morning in my house", time:"10–15 min",
    prompt:"Write eight sentences about what each person in your household does before school or work. Change the person every sentence. Example: ‘My mother leaves at six. My brothers argue about the bathroom. I wait for my turn.’",
    checks:["he, she and it verbs end in s: leaves, watches, goes","I, you, we and they verbs have no s: leave, watch, go","Every sentence has a different subject","don’t and doesn’t are used correctly in any negatives"] },

  { id:"wp-agree-c1-2", skills:["agree-c1"], title:"Class survey results", time:"10–15 min",
    prompt:"You surveyed your class about food, sport, or screen time. Write eight sentences reporting the results, mixing singular and plural subjects. Example: ‘Twelve students play a sport after school. One student walks an hour to get here.’",
    checks:["Plural subjects take plural verbs: students play","Singular subjects take the s form: one student walks","‘Everyone’ and ‘nobody’ take a singular verb","Numbers and verbs agree in every sentence"] },

  { id:"wp-agree-c1-3", skills:["agree-c1"], title:"Two teammates, two routines", time:"10–15 min",
    prompt:"Describe the training routines of two people on a team, then of the team together. Ten sentences. Example: ‘Hana trains on Tuesdays. Her brothers train on weekends. They all run the same warm up.’",
    checks:["Singular subjects use the s form of the verb","Plural subjects use the plain form","has and have are used correctly","No verb changes its form for no reason in the middle of the paragraph"] },

  { id:"wp-agree-c2-1", skills:["agree-c2"], title:"Packing list for the trip", time:"10–15 min",
    prompt:"You are packing for a week away. Write a list of fifteen items with quantities, and write it in full sentences, not just words. Try to include tricky plurals: two knives, three pairs of shoes, six scarves. Example: ‘I am taking two pairs of shoes and three loaves of bread for the bus.’",
    checks:["Regular plurals add s or es correctly: bags, boxes, watches","Irregular plurals are correct: knives, scarves, feet, children","Words that do not change are handled properly: sheep, fish","Numbers match the plural forms"] },

  { id:"wp-agree-c2-2", skills:["agree-c2"], title:"My old school", time:"10–15 min",
    prompt:"Describe a school you went to before this one, in eight sentences, focusing on numbers of things and people. Example: ‘There were forty children in my class and only two women teaching science.’",
    checks:["Irregular plurals are correct: children, women, men, people","Regular plurals are spelled correctly, including y to ies: countries, libraries","Verbs agree with the plural subjects","At least six plural nouns appear"] },

  { id:"wp-agree-c2-3", skills:["agree-c2"], title:"Recipe for six people", time:"10–15 min",
    prompt:"Write a recipe that feeds six, with an ingredient list and six numbered steps. Quantities force plurals, so watch them. Example: ‘Slice four tomatoes and two potatoes. Add three leaves of basil.’",
    checks:["Every quantity is followed by the correct plural form","Tricky plurals are right: potatoes, tomatoes, leaves, halves","Singular items keep their singular form: one onion","The recipe could actually be cooked from these steps"] },

  { id:"wp-agree-c3-1", skills:["agree-c3"], title:"Shopping for a party", time:"10–15 min",
    prompt:"You are shopping for a party for twenty people. Write a message to whoever is helping you, in ten sentences, checking amounts. Example: ‘How much rice do we need? We already have too many soft drinks and not enough ice.’",
    checks:["much is used with uncountable nouns: much rice, much water","many is used with countable nouns: many bottles, many plates","a few, a little, enough and too much are used correctly","No uncountable noun is given an s: no ‘rices’ or ‘advices’"] },

  { id:"wp-agree-c3-2", skills:["agree-c3"], title:"Too much homework", time:"10–15 min",
    prompt:"Write a polite but firm complaint to a year level coordinator about workload. Eight sentences, and quantify everything. Example: ‘We have too much homework and too many assessments in the same week. There is very little time left for sleep.’",
    checks:["much and little go with uncountable nouns like homework, time, work, information","many and few go with countable nouns like assessments, tests, tasks","At least two sentences use ‘too much’ or ‘too many’","The complaint stays polite while being specific about numbers"] },

  { id:"wp-agree-c3-3", skills:["agree-c3"], title:"What is in the fridge", time:"10–15 min",
    prompt:"Compare what is in your fridge now with what should be in it. Write ten sentences using quantifiers. Example: ‘There is plenty of milk but there are only two eggs. We have hardly any bread and far too much sauce.’",
    checks:["There is goes with uncountable and singular nouns; there are goes with plurals","some, any, plenty of, hardly any are used correctly","Uncountable nouns never take a number directly: two cartons of milk, not two milks","At least eight different nouns appear"] },

  { id:"wp-agree-c4-1", skills:["agree-c4"], title:"The team is, the team are", time:"10–15 min",
    prompt:"Write a match report where the team acts as one body sometimes and as arguing individuals at other times. Eight sentences. Example: ‘The team is unbeaten this season. At half time the team were arguing about who should take the free kick.’",
    checks:["A collective noun acting as one unit takes a singular verb","A collective noun acting as separate people takes a plural verb","At least two of each choice, and each choice makes sense","Pronouns match the choice: it for the unit, they for the individuals"] },

  { id:"wp-agree-c4-2", skills:["agree-c4"], title:"Minutes of the club meeting", time:"10–15 min",
    prompt:"Write the minutes of a school club meeting in a formal style, eight sentences, with complicated subjects. Example: ‘Neither of the treasurers was present. Each of the members has paid the fee. A list of proposed events was circulated.’",
    checks:["neither, either, each and every take a singular verb","The verb agrees with the head noun, not the noun nearest to it: ‘A list of events was …’","Collective nouns like the committee, the staff, the group are handled consistently","The register stays formal throughout"] },

  { id:"wp-agree-c4-3", skills:["agree-c4"], title:"Who decides what", time:"10–15 min",
    prompt:"Explain who makes decisions in a school, a family, or a workplace, using long, complex subjects. Eight sentences. Example: ‘The group of students who run the newsletter meets on Fridays. Everybody on the two committees has a vote.’",
    checks:["The verb agrees with the head of the subject, not with the words in between","everybody, somebody and nobody take a singular verb","‘Both … and …’ takes a plural verb; ‘neither … nor …’ agrees with the nearer subject","Every subject is at least four words long"] },

  /* ========= 8. QUESTIONS & NEGATION ========= */

  { id:"wp-question-c1-1", skills:["question-c1"], title:"Meeting someone new", time:"10–15 min",
    prompt:"Write a dialogue between you and a student who joined your class today. Ask eight yes or no questions and write their answers, some of them negative. Example: ‘Do you live near the school? No, I don’t. I take two buses.’",
    checks:["Questions start with Do, Does, Did, Is, Are, Was, Were or Can","Short answers use the same helping verb: Yes, I do. No, she isn’t.","Negatives use don’t, doesn’t, didn’t or isn’t correctly","The main verb after do, does and did has no ending: ‘Did you go?’ not ‘Did you went?’"] },

  { id:"wp-question-c1-2", skills:["question-c1"], title:"Has anyone seen my jumper?", time:"10–15 min",
    prompt:"Write a message thread where you are searching for something you lost and asking people yes or no questions. Ten messages. Example: ‘Did you take it by mistake? No, I didn’t, but I don’t remember seeing it either.’",
    checks:["Every question is a yes or no question, not a wh- question","At least four negative sentences use don’t, doesn’t, didn’t, haven’t or isn’t","Helping verbs match the tense of the question","The thread reaches some kind of ending"] },

  { id:"wp-question-c1-3", skills:["question-c1"], title:"Twenty questions", time:"10–15 min",
    prompt:"Play a guessing game on paper. Choose an object in your classroom and write twelve yes or no questions someone might ask to find it, with your answers. Example: ‘Is it bigger than a book? No, it isn’t. Can you eat it? No, you can’t.’",
    checks:["Every question can only be answered yes or no","Questions use Is, Are, Does, Can, Has correctly at the start","Negative answers use isn’t, doesn’t, can’t, hasn’t","The questions narrow down sensibly from general to specific"] },

  { id:"wp-question-c2-1", skills:["question-c2"], title:"Interview with someone older", time:"10–15 min",
    prompt:"Interview a parent, grandparent, or older relative about their life at your age. Write eight wh- questions and their answers. Example: ‘Where did you go to school? What did you do after class?’",
    checks:["Questions start with What, Where, When, Why, How, Who or Which","The word order is question word, then helping verb, then subject","After did, the main verb stays in its base form","The answers actually answer the question asked"] },

  { id:"wp-question-c2-2", skills:["question-c2"], title:"Press conference", time:"10–15 min",
    prompt:"You are a journalist interviewing an athlete, a musician, or a game designer after a big event. Write ten wh- questions and short answers. Example: ‘How did you prepare for the final? Why did you change the plan at half time?’",
    checks:["At least six different question words are used","Every question inverts the subject and helping verb correctly","At least two questions use How + adjective: how long, how often, how far","The questions get more interesting as the interview goes on"] },

  { id:"wp-question-c2-3", skills:["question-c2"], title:"What did I miss?", time:"10–15 min",
    prompt:"You were away for three days. Write a message thread asking a classmate everything you need to know, in wh- questions, with their replies. Ten messages. Example: ‘What did we do in science? When is the assignment due?’",
    checks:["Every question begins with a wh- word","Present and past questions both appear, with the right helping verb","‘Who’ questions about the subject do not need did: ‘Who took the notes?’","I ended up with enough information to catch up"] },

  { id:"wp-question-c3-1", skills:["question-c3"], title:"You are coming, aren’t you?", time:"10–15 min",
    prompt:"Write a dialogue where one person keeps checking things they already half know, and the other keeps correcting them. Ten lines using question tags. Example: ‘You’re bringing the ball, aren’t you? You didn’t forget again, did you?’",
    checks:["Positive statements take a negative tag, and negative statements take a positive tag","The tag repeats the helping verb from the statement","The pronoun in the tag matches the subject","At least eight tags across the dialogue, all different"] },

  { id:"wp-question-c3-2", skills:["question-c3"], title:"Confirming the booking", time:"10–15 min",
    prompt:"You are nervously ringing to confirm a booking, an appointment, or a shift. Write the phone call, twelve lines, checking everything twice with tags and inverted questions. Example: ‘The class starts at four, doesn’t it? Is there anything I need to bring?’",
    checks:["Question tags follow the positive and negative rule","Inverted questions put the helping verb before the subject","At least two tags use a modal: won’t you, can’t we, should I","The caller sounds polite and nervous, which is the point"] },

  { id:"wp-question-c3-3", skills:["question-c3"], title:"Never had I seen", time:"10–15 min",
    prompt:"Write a dramatic story opening of about eight sentences where the narrator is shocked by something. Use inversion after negative openers for effect. Example: ‘Never had I seen the oval so empty. Not once did anyone explain why.’",
    checks:["At least three sentences begin with Never, Rarely, Seldom, Not once, or No sooner","After those openers the helping verb comes before the subject","The rest of the sentence keeps normal word order","The inversion adds drama and does not sound accidental"] },

  { id:"wp-question-c4-1", skills:["question-c4"], title:"Lost in a new city", time:"10–15 min",
    prompt:"You have just arrived somewhere new and need help from strangers. Write eight polite indirect questions you could ask. Example: ‘Could you tell me where the station is? Do you know what time the last train leaves?’",
    checks:["Each question begins with a polite frame: Could you tell me, Do you know, I wonder","Inside the frame the word order is a statement: where the station is","No did, do or does inside the embedded question","The questions are ones a real newcomer would need"] },

  { id:"wp-question-c4-2", skills:["question-c4"], title:"Email to a teacher", time:"10–15 min",
    prompt:"Write a polite email to a teacher asking four things you need to know about an assignment. Indirect questions make it sound respectful. Example: ‘I was wondering whether the word count includes the reference list.’",
    checks:["Each question uses an indirect frame: I was wondering, Could you let me know, I would like to know","Embedded questions use statement word order","whether or if is used for yes or no questions inside the frame","The email has a greeting and a sign off"] },

  { id:"wp-question-c4-3", skills:["question-c4"], title:"The order never arrived", time:"10–15 min",
    prompt:"Write a customer service phone call about an order that has not arrived. Twelve lines, with the customer staying polite through indirect questions and the staff member answering. Example: ‘Could you tell me when it was posted? Do you know why it hasn’t been scanned?’",
    checks:["The customer’s questions are indirect, with statement word order inside","At least one embedded question uses whether or if","No inversion appears inside the embedded part","The call stays polite even as the customer gets frustrated"] },

  /* ========= MULTI-SKILL PROMPTS =========
     Two or three cells that plausibly go wrong together. The two
     teacher exemplars open this section. ===================== */

  { id:"wp-question-c4-4", skills:["question-c4","question-c3","modality-c2"], title:"Same conversation, different mood", time:"10–15 min",
    prompt:"Two people have the same conversation on three different days, but the mood changes each time. Day one they are annoyed: ‘Are you REALLY wearing that?’ Day two they are careful: ‘I notice your shirt is very bright.’ Day three they are polite and distant: ‘Could I ask whether you have thought about the blue one?’ Write all three versions, about six lines each.",
    checks:["The angry version uses blunt direct questions with inverted word order","The polite version uses indirect questions with statement word order inside","At least two question tags appear somewhere across the three versions","Softening words like might, may and perhaps appear in the polite version but not the angry one"] },

  { id:"wp-tense-c1-4", skills:["tense-c1","modality-c1","agree-c1"], title:"Habits of my family", time:"10–15 min",
    prompt:"Describe what the people you live with do every day and the rules they live by. Ten sentences, changing person often. Example: ‘My aunt gets up at five because she must catch the first bus. My cousins can stay up late on Fridays, but they never do.’",
    checks:["Routines use the present simple, with s on he, she and it verbs","Rules use must, must not, can and cannot","Plural subjects take plural verbs: my cousins stay, my aunt stays","Each person appears at least twice so the habits build a picture"] },

  { id:"wp-sentence-c1-4", skills:["sentence-c1","tense-c1","agree-c1"], title:"One day at my school", time:"10–15 min",
    prompt:"Write ten short sentences describing an ordinary school day, from the gate in the morning to the gate in the afternoon. Keep every sentence simple and complete. Example: ‘The bell rings at nine. My friends wait near the lockers. I forget my pen every Monday.’",
    checks:["Every sentence has a subject and a verb in that order","Verbs are present simple, with s after he, she, it and singular nouns","Plural subjects take verbs with no s","No sentence is a fragment"] },

  { id:"wp-sentence-c2-4", skills:["sentence-c2","tense-c2","agree-c2"], title:"What has changed this year", time:"10–15 min",
    prompt:"Write eight sentences about what has changed for you since the year started, joining two ideas in each one. Example: ‘I have joined two clubs and I have met about twenty new people, but I still have no idea where the science rooms are.’",
    checks:["Each sentence joins two ideas with and, but, or, so","Changes use have or has plus a past participle","Plural nouns are spelled correctly, including irregular ones: children, people, weeks","A comma sits before but and so between two full ideas"] },

  { id:"wp-cond-c2-4", skills:["cond-c2","modality-c2"], title:"Maybe, if it works out", time:"10–15 min",
    prompt:"Write a message to a friend about a plan that depends on several things you cannot control. Ten messages. Example: ‘If my shift finishes early, I will come straight over, but my manager might ask me to stay.’",
    checks:["Conditions use if plus the present simple, then will plus a base verb","Uncertain parts use may or might plus a base verb","No will inside the if clause","The friend can tell which parts are decided and which are only possible"] },

  { id:"wp-passive-c2-4", skills:["passive-c2","tense-c2"], title:"The suburb has changed", time:"10–15 min",
    prompt:"Write about how a place you know has changed: a street, a market, a park, a school. Eight sentences. Nobody needs to be named as the doer. Example: ‘The old bakery has been replaced by a phone shop. Two new bins were installed near the tram stop last month.’",
    checks:["Present perfect passive uses has been or have been plus a past participle","Past passive uses was or were plus a past participle","Finished times take the past passive; unfinished times take the present perfect","The changes, not the workers, are the subjects of the sentences"] },

  { id:"wp-relative-c2-4", skills:["relative-c2","sentence-c3"], title:"The place I go to think", time:"10–15 min",
    prompt:"Describe a place you go when you want to be alone or calm. Eight sentences, and build every one out with an extra clause. Example: ‘Although it is only a bench near the car park, the spot that faces the oval is where I sit. The tree behind it, which lost half its branches in a storm, still gives shade.’",
    checks:["At least three sentences use although, because, when or while","At least three relative clauses with who, which or that appear","Non-defining clauses have commas; defining clauses do not","No sentence has two main clauses jammed together without a joining word"] },

  { id:"wp-tense-c3-4", skills:["tense-c3","cond-c3"], title:"What I would do differently", time:"10–15 min",
    prompt:"Tell the story of something that had already gone wrong before you noticed, then imagine the person you would need to be for it not to happen again. Eight sentences of story, four of reflection. Example: ‘By the time I checked, the deadline had passed. If I were more organised, I would keep one calendar instead of three.’",
    checks:["Past perfect (had + past participle) shows what happened before the discovery","Past simple carries the main story","The reflection uses if plus past simple, then would plus a base verb","At least one sentence uses ‘If I were …’"] },

  { id:"wp-cond-c4-4", skills:["cond-c4","modality-c3"], title:"The long version of sorry", time:"10–15 min",
    prompt:"Write an apology message to someone you let down: a friend, a teammate, a family member. Ten lines. Take real responsibility for the past. Example: ‘I should have told you on Thursday. If I had said something earlier, you would not have waited an hour in the cold.’",
    checks:["Regrets use should have or could have plus a past participle","Imagined past outcomes use if + had + past participle, then would have + past participle","At least two full third conditional sentences appear","The apology names what I will do next, not only what went wrong"] },

  { id:"wp-question-c2-4", skills:["question-c2","tense-c1"], title:"Profile of a classmate", time:"10–15 min",
    prompt:"Interview a classmate about their normal week, then write it up as a short profile. Write the eight questions first, then three sentences of profile. Example: ‘Where do you go after school? Kenji trains four evenings a week and studies on the tram.’",
    checks:["Every question begins with a wh- word and inverts the helping verb","Questions about routines use do or does, not did","The profile uses present simple with s on he and she verbs","Every answer in the profile matches a question that was asked"] },

  { id:"wp-question-c1-4", skills:["question-c1","modality-c1"], title:"First day questions", time:"10–15 min",
    prompt:"You are new and you need to know what is allowed. Write ten yes or no questions for a student helper, with their answers about the rules. Example: ‘Can we eat in the library? No, you can’t, but you must not leave the grounds either.’",
    checks:["Questions use Can, Do, Does, Is or Are at the start","Answers use can, can’t, must and must not to explain the rules","Short answers repeat the helping verb from the question","At least three answers are negative"] },

  { id:"wp-passive-c4-4", skills:["passive-c4","relative-c4"], title:"The story nobody will confirm", time:"10–15 min",
    prompt:"Write one polished news paragraph about an unconfirmed story: a closure, a transfer, a cancelled event. Eight sentences, formal, with packed information. Example: ‘The company, which employs sixty people locally, is believed to have been sold last month. Workers arriving on Monday were reportedly told nothing.’",
    checks:["Unconfirmed claims use is/are said, believed, reported, understood plus to","At least two non-defining clauses sit inside commas","At least one reduced clause with an ing or ed form appears","No claim is stated as certain unless it really is"] },

  { id:"wp-sentence-c4-4", skills:["sentence-c4","passive-c4"], title:"Opinion column: the real story", time:"10–15 min",
    prompt:"Write the opening of an opinion column arguing that everyone has misunderstood a decision, at school or in the news. Eight sentences. Example: ‘It is the timing, not the cost, that should worry us. The plan is said to have been approved months ago.’",
    checks:["At least three cleft sentences: ‘It is … that …’ or ‘What … is …’","At least two passive reporting frames: is said to, is believed to","The emphasis in each cleft lands on the point I am arguing","The tone is confident but not rude"] },

  { id:"wp-tense-c4-4", skills:["tense-c4","cond-c2"], title:"Five year plan", time:"10–15 min",
    prompt:"Write a plan for the next five years that admits everything depends on things going right. Ten sentences. Example: ‘By 2031 I will have finished my course, and if I pass the first year, I will be working part time in a lab.’",
    checks:["Future perfect (will have + past participle) marks what is complete by a date","Future progressive (will be + ing) marks what is in progress","Conditions use if plus present simple, then will plus a base verb","No will inside an if clause"] },

  { id:"wp-agree-c3-4", skills:["agree-c3","modality-c1","cond-c1"], title:"How to cook it properly", time:"10–15 min",
    prompt:"Teach someone to cook a dish they have never made, warning them about the parts that go wrong. Ten lines. Example: ‘You must not add too much water. If the pan gets too hot, the garlic burns in seconds. Use a little salt and many small pieces, not a few big ones.’",
    checks:["much and little go with uncountable ingredients; many and few go with countable ones","Rules use must and must not","Warnings use if plus present simple in both halves","Someone could follow this and produce the dish"] },

  { id:"wp-agree-c4-4", skills:["agree-c4","relative-c4"], title:"Annual report of the club", time:"10–15 min",
    prompt:"Write the yearly report of a club, team, or committee in a formal style. Eight sentences with long subjects. Example: ‘The committee, most of whom joined last year, has met eleven times. Members living outside the area attend online.’",
    checks:["The verb agrees with the head of a long subject, not the nearest noun","Collective nouns take a singular or plural verb consistently with the meaning","At least one non-defining clause uses ‘most of whom’ or ‘whose’","At least one reduced clause replaces a full relative clause"] },

  { id:"wp-sentence-c3-4", skills:["sentence-c3","tense-c3"], title:"Before the phone call", time:"10–15 min",
    prompt:"Write the opening of a story where a phone call changes everything, but first show what had been happening all evening. Ten sentences. Example: ‘While my mother was cooking, my brother had already gone upstairs. Nobody had noticed the missed calls because the phone had been face down.’",
    checks:["Past perfect and past perfect progressive carry what happened before the call","Past simple carries the call itself","At least four subordinating conjunctions: while, when, because, although, before","Commas follow subordinate clauses that come first"] },

  { id:"wp-modality-c4-4", skills:["modality-c4","question-c3"], title:"The interview room", time:"10–15 min",
    prompt:"Write a scene where someone is questioned about where they were, and neither person is certain. Twelve lines. Example: ‘You were waiting outside at six, weren’t you? I might have been standing there, but I could have been walking home by then.’",
    checks:["Questions use tags that match the statement: positive statement, negative tag","Speculation uses might/must/could + have been + an ing verb","At least three question tags and three modal progressives appear","The scene has some tension but stays realistic"] },

  { id:"wp-cond-c1-4", skills:["cond-c1","question-c1"], title:"How to play, and the questions people ask", time:"10–15 min",
    prompt:"Explain the rules of a game you know well, then add a short list of frequently asked questions with answers. Six rules and five questions. Example: ‘If a player drops the ball, the turn passes. Can two people play on the same team? Yes, they can.’",
    checks:["Rules use if plus present simple in both halves","Questions are yes or no questions starting with Can, Do, Does or Is","Answers repeat the helping verb: Yes, they can. No, it doesn’t.","A stranger could learn the game from this"] },

  { id:"wp-relative-c1-4", skills:["relative-c1","agree-c1","tense-c1"], title:"The people I see every day", time:"10–15 min",
    prompt:"Write eight sentences about people you see regularly but might not know well: a bus driver, a shopkeeper, a coach, a neighbour. Say who they are and what they do. Example: ‘The woman who runs the fruit shop opens at six every morning.’",
    checks:["Every sentence contains a who or which clause","Singular subjects take verbs ending in s: the woman opens","Plural subjects take verbs with no s: the boys wait","All verbs are present simple, describing regular actions"] },

  { id:"wp-tense-c2-4", skills:["tense-c2","question-c2"], title:"The experience swap", time:"10–15 min",
    prompt:"Interview someone about the most unusual things they have done, then push for details. Ten lines. Example: ‘Have you ever cooked for more than ten people? Yes, twice. Where did you learn to do that?’",
    checks:["Experience questions use Have you ever plus a past participle","Follow up questions use wh- words about a finished time and switch to past simple","Answers match the tense of the question","At least four different wh- words appear"] },

  { id:"wp-modality-c2-4", skills:["modality-c2","cond-c2","question-c1"], title:"Convincing my parents", time:"10–15 min",
    prompt:"Write a conversation where you ask permission for something your parents are unsure about: a trip, a job, a later curfew. Twelve lines. Example: ‘Can I go if Linh’s mother drives us? You may be tired the next day. If I finish my homework first, will you think about it?’",
    checks:["Requests and checks are yes or no questions with the helping verb first","Possibilities use may or might plus a base verb","Offers and deals use if plus present simple, then will plus a base verb","Both sides get to speak and the conversation reaches a decision"] },
];
