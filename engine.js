/* ============================================================
   GRAMMAR HUB — ENGINE
   ------------------------------------------------------------
   Owns: the matrix selector, the teaching/revision loop, scoring,
   and the report. Knows nothing about specific grammar — it
   dispatches every item to TASK_TYPES[item.type].

   Screen flow:
     Teaching:  select -> vocab preteach -> skill preteach -> task -> placement
     Revision:  select -> task -> report

   Teaching mode cycle:
     1. Preteach vocab for target cell
     2. Preteach skill (overview + resources) for target cell
     3. Test items from target ±1 band (mastery loop)
     4. Adaptive placement based on results
   ============================================================ */

(function () {
  const $ = (id) => document.getElementById(id);
  const screens = {};

  // ---- run state ----
  let pool = [];          // every queued entry {uid, skillId, skillName, category, band, item}
  let currentSet = [];    // this round's queue
  let nextSet = [];       // items that missed, for next round
  let idx = 0;
  let round = 1;
  let graded = false;     // current item already checked?
  let attempts = {};      // uid -> number of attempts
  let correctEver = {};   // uid -> bool
  let firstPass = {};     // uid -> bool (correct on first ever attempt)
  let log = [];           // {round, skill, type, stimulus, response, result}
  let rowLevel = {};      // category -> band index (0..3), revision mode
  let mode = "teaching";  // "teaching" (single strand, preteach + assess) | "revision" (whole rubric)
  let drillTarget = null; // teaching mode: { category, bandIndex } | null
  let selectedPools = {}; // pool category -> true
  let lastServed = {};    // skillId -> Set of item indices served last round
  const SAMPLE_PER_SKILL = 2;

  // ---- teaching mode preteach state ----
  // Teaching opens with a Learning Intention / Success Criteria slide, then
  // runs an on-rails metalanguage sequence (I-do cards, then a gated check
  // you must pass), and only then unlocks the skill task.
  // Phases: intention -> metalanguage (drag-sort I do/we do/you do, or the
  // vocab-teach/vocab-check fallback for cells without sort data) ->
  // skill-model (stepped worked examples) -> skill (level cards) -> task.
  let teachPhase = "intention";
  let vocabQueue = [];          // vocab terms for the target cell (I-do cards)
  let vocabIdx = 0;
  let metaChecks = [];          // on-rails recognition checks (one per term)
  let metaIdx = 0;
  let mlIdoIdx = 0;             // index into sort.modelled (I do)
  let workedIdx = 0;            // index into worked[] (skill modelling)
  let sortBank = [];           // shuffled sort items for we do / you do
  let sortIdx = 0;
  let sortStreak = 0;
  let sortErrors = 0;
  // clause-pick metalanguage (identify a clause inside a full sentence)
  let clIdoIdx = 0;
  let clauseBank = [];
  let clauseIdx = 0;
  let clauseStreak = 0;
  let clauseErrors = 0;
  const WEDO_COUNT = 4;        // guided-practice items before the mastery check
  const YOUDO_TARGET = 5;      // correct-in-a-row to unlock the skill

  function show(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
    window.scrollTo(0, 0);
  }

  /* ---------------- SELECT SCREEN ---------------- */

  function skillById(id) { return window.SKILLS.find((s) => s.id === id); }
  function itemsFor(skill) { return skill.items; }

  function cellAt(cat, i) {
    if (i < 0 || i >= window.BANDS.length) return null;
    return window.SKILLS.find((s) => s.category === cat && s.band === window.BANDS[i]);
  }
  function strandAssessed(cat) {
    return window.SKILLS.some((s) => s.category === cat && s.introduced && s.assessed);
  }
  function drillableAt(cat, i) {
    const s = cellAt(cat, i);
    return (s && s.introduced && itemsFor(s).length) ? s : null;
  }
  function firstDrillable(cat) {
    for (let i = 0; i < window.BANDS.length; i++) if (drillableAt(cat, i)) return i;
    return null;
  }
  function revisionSkillsFor(cat) {
    const lvl = rowLevel[cat];
    if (lvl === undefined) return [];
    const out = [];
    const before = drillableAt(cat, lvl - 1);
    if (before) out.push(before);
    const here = drillableAt(cat, lvl);
    if (here) out.push(here);
    return out;
  }
  function activeTargets() {
    const out = [];
    Object.keys(rowLevel).forEach((cat) => {
      revisionSkillsFor(cat).forEach((s) => { if (!out.includes(s)) out.push(s); });
    });
    return out;
  }
  function setLevel(cat, val) {
    if (rowLevel[cat] === val) delete rowLevel[cat];
    else rowLevel[cat] = val;
    buildMatrix();
  }

  function setDrillTarget(cat, bandIdx) {
    if (drillTarget && drillTarget.category === cat && drillTarget.bandIndex === bandIdx) {
      drillTarget = null;
    } else {
      drillTarget = { category: cat, bandIndex: bandIdx };
    }
    buildMatrix();
  }

  function getTeachingSkills() {
    if (!drillTarget) return [];
    const { category, bandIndex } = drillTarget;
    const skills = [];
    const below = drillableAt(category, bandIndex - 1);
    if (below) skills.push(below);
    const target = drillableAt(category, bandIndex);
    if (target) skills.push(target);
    const above = drillableAt(category, bandIndex + 1);
    if (above) skills.push(above);
    return skills;
  }

  function buildMatrix() {
    const wrap = $("matrix");
    wrap.innerHTML = "";

    const head = document.createElement("div");
    head.className = "matrix-row matrix-head";
    head.innerHTML = `<div class="matrix-cell rowlabel"></div>` +
      window.BANDS.map((b) => `<div class="matrix-cell colhead">${b}</div>`).join("");
    wrap.appendChild(head);

    window.CATEGORIES.forEach((cat) => {
      const lvl = rowLevel[cat];

      const row = document.createElement("div");
      row.className = "matrix-row";

      const label = document.createElement("div");
      const assessed = strandAssessed(cat);
      label.innerHTML = `<span>${cat}</span>` + (assessed ? "" : `<span class="unassessed-mark" title="Not yet on the paper pretest">*</span>`);
      if (mode === "revision") {
        const first = firstDrillable(cat);
        label.className = "matrix-cell rowlabel" + (assessed ? "" : " unassessed");
        label.title = "Click to revise this strand from C1";
        label.addEventListener("click", () => { if (first !== null) setLevel(cat, first); });
      } else {
        label.className = "matrix-cell rowlabel" + (assessed ? "" : " unassessed");
      }
      row.appendChild(label);

      window.BANDS.forEach((band, i) => {
        const skill = cellAt(cat, i);
        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        if (!skill || !skill.introduced) {
          cell.classList.add("empty");
          cell.innerHTML = `<span class="dash">—</span>`;
          row.appendChild(cell);
          return;
        }
        const n = itemsFor(skill).length;
        cell.classList.add(n ? "has-items" : "no-items");
        cell.dataset.id = skill.id;

        if (mode === "teaching") {
          const isDT = drillTarget && drillTarget.category === cat && i === drillTarget.bandIndex;
          const isInc = drillTarget && drillTarget.category === cat &&
            (i === drillTarget.bandIndex - 1 || i === drillTarget.bandIndex + 1) && n;
          if (isDT) cell.classList.add("target");
          else if (isInc) cell.classList.add("below");

          cell.innerHTML = `<span class="cell-name">${skill.name}</span>` +
            (isDT ? `<span class="drill-tag">teach ▸</span>`
              : isInc ? `<span class="drill-tag">included</span>`
              : (n ? `<span class="cell-count">${n}</span>` : `<span class="cell-count zero">0</span>`));

          if (n) cell.addEventListener("click", () => setDrillTarget(cat, i));
        } else {
          const isSel = i === lvl;
          const isReview = lvl !== undefined && i === lvl - 1 && !!drillableAt(cat, lvl - 1);
          if (isSel) cell.classList.add("target");
          else if (isReview) cell.classList.add("below");

          cell.innerHTML = `<span class="cell-name">${skill.name}</span>` +
            (isSel ? `<span class="drill-tag">revise ▸</span>`
              : isReview ? `<span class="drill-tag">review</span>`
              : (n ? `<span class="cell-count">${n}</span>` : `<span class="cell-count zero">0</span>`));

          if (n) cell.addEventListener("click", () => setLevel(cat, i));
        }
        row.appendChild(cell);
      });
      wrap.appendChild(row);
    });
    const anyUnassessed = window.CATEGORIES.some((cat) => !strandAssessed(cat));
    $("matrixLegend").innerHTML = anyUnassessed
      ? `<span class="unassessed-mark">*</span>not yet on the paper pretest (drillable, but no pretest data to seed the rubric)`
      : "";
    buildPools();
    refreshCount();
  }

  function poolSkill(cat) { return window.SKILLS.find((s) => s.mode === "pool" && s.category === cat); }

  function buildPools() {
    const wrap = $("pools");
    if (!window.POOLS || !window.POOLS.length) { wrap.innerHTML = ""; return; }
    wrap.innerHTML = `<span class="pool-label">Practice pools</span>`;
    window.POOLS.forEach((cat) => {
      const skill = poolSkill(cat);
      if (!skill) return;
      const n = skill.items.length;
      const btn = document.createElement("button");
      btn.className = "pool-btn" + (selectedPools[cat] ? " selected" : "");
      btn.innerHTML = `${cat} <span class="pool-count">${n}</span>`;
      btn.addEventListener("click", () => { togglePool(cat); });
      wrap.appendChild(btn);
    });
  }

  function togglePool(cat) {
    if (selectedPools[cat]) delete selectedPools[cat];
    else selectedPools[cat] = true;
    buildPools();
    refreshCount();
  }

  function selectedPoolSkills() {
    return Object.keys(selectedPools).map(poolSkill).filter(Boolean);
  }

  function refreshCount() {
    const pools = selectedPoolSkills();
    let poolItems = 0;
    pools.forEach((s) => { poolItems += Math.min(SAMPLE_PER_SKILL, itemsFor(s).length); });

    if (mode === "teaching") {
      const skills = getTeachingSkills();
      let items = 0;
      skills.forEach((s) => { items += itemsFor(s).length; });
      const total = skills.length + pools.length;
      const totalItems = items + poolItems;
      $("selCount").textContent = total > 0
        ? `${total} skill${total === 1 ? "" : "s"} · ${totalItems} question${totalItems === 1 ? "" : "s"}`
        : "Click a skill to teach";
      $("startBtn").disabled = total === 0;
    } else {
      const targets = activeTargets();
      let items = 0;
      targets.forEach((s) => { items += Math.min(SAMPLE_PER_SKILL, itemsFor(s).length); });
      const total = targets.length + pools.length;
      const totalItems = items + poolItems;
      $("selCount").textContent =
        `${total} skill${total === 1 ? "" : "s"} queued · ~${totalItems} question${totalItems === 1 ? "" : "s"}`;
      $("startBtn").disabled = total === 0;
    }
  }

  function buildModeToggle() {
    const wrap = $("typeFilter");
    wrap.innerHTML =
      `<button class="filter-btn${mode === "teaching" ? " active" : ""}" data-m="teaching">Teaching</button>` +
      `<button class="filter-btn${mode === "revision" ? " active" : ""}" data-m="revision">Revision</button>`;
    wrap.querySelectorAll(".filter-btn").forEach((b) => {
      b.addEventListener("click", () => {
        mode = b.dataset.m;
        drillTarget = null;
        rowLevel = {};
        selectedPools = {};
        lastServed = {};
        wrap.querySelectorAll(".filter-btn").forEach((x) => x.classList.toggle("active", x === b));
        buildMatrix();
        updateToolbar();
      });
    });
  }

  function updateToolbar() {
    $("selectAllBtn").style.display = mode === "revision" ? "" : "none";
    $("helpText").innerHTML = mode === "teaching"
      ? `Click any skill to focus on it. You'll learn the key vocabulary first, see worked examples, then practise that skill plus the level below (review) and above (stretch).`
      : `Click the cell you want to revise — it's <b>ringed</b> and the band just before it comes along (marked <b>review</b>). Click the strand name to revise from C1. Each run pulls a random couple of questions per skill.`;
  }

  /* ---------------- ITEM SAMPLING ---------------- */

  function sampleItems(skill, n) {
    const prev = lastServed[skill.id] || new Set();
    const indexed = skill.items.map((item, i) => ({ item, i }));
    const fresh = shuffle(indexed.filter((x) => !prev.has(x.i)));
    const seen = shuffle(indexed.filter((x) => prev.has(x.i)));
    return fresh.concat(seen).slice(0, n);
  }

  /* ---------------- START SESSION ---------------- */

  function startSession() {
    pool = [];
    const served = {};
    const record = (skill, i) => { (served[skill.id] = served[skill.id] || new Set()).add(i); };

    if (mode === "teaching") {
      // Sample a couple of items per level so a round stays short; the
      // mastery loop still brings missed ones back until they're correct.
      getTeachingSkills().forEach((skill) => {
        sampleItems(skill, SAMPLE_PER_SKILL).forEach(({ item, i }) => {
          record(skill, i);
          pool.push({ uid: skill.id + "#" + i, skillId: skill.id, skillName: skill.name, category: skill.category, band: skill.band, item });
        });
      });
      // add pools
      selectedPoolSkills().forEach((skill) => {
        sampleItems(skill, SAMPLE_PER_SKILL).forEach(({ item, i }) => {
          record(skill, i);
          pool.push({ uid: skill.id + "#" + i, skillId: skill.id, skillName: skill.name, category: skill.category, band: skill.band || "Pool", item });
        });
      });
      if (pool.length === 0) return;
      lastServed = served;
      shuffle(pool);
      attempts = {}; correctEver = {}; firstPass = {}; log = [];
      currentSet = [...pool]; nextSet = []; idx = 0; round = 1;

      // open the teaching cycle: learning goals -> metalanguage -> skill
      startTeaching();
    } else {
      activeTargets().forEach((skill) => {
        sampleItems(skill, SAMPLE_PER_SKILL).forEach(({ item, i }) => {
          record(skill, i);
          pool.push({ uid: skill.id + "#" + i, skillId: skill.id, skillName: skill.name, category: skill.category, band: skill.band, item });
        });
      });
      selectedPoolSkills().forEach((skill) => {
        sampleItems(skill, SAMPLE_PER_SKILL).forEach(({ item, i }) => {
          record(skill, i);
          pool.push({ uid: skill.id + "#" + i, skillId: skill.id, skillName: skill.name, category: skill.category, band: skill.band || "Pool", item });
        });
      });
      if (pool.length === 0) return;
      lastServed = served;
      shuffle(pool);
      attempts = {}; correctEver = {}; firstPass = {}; log = [];
      currentSet = [...pool]; nextSet = []; idx = 0; round = 1;
      show("task");
      showItem();
    }
  }

  /* ---------------- TEACHING PRETEACH (gradual release) ----------------
     Flow driven through one screen (#preteachScreen), four sub-phases:
       intention   -> learning intention + success criteria (metalanguage
                      goal first, skill goal locked until it's met)
       vocab-teach -> I-do cards: each key term modelled in a sentence
       vocab-check -> you-do, ON RAILS: pick the named term to proceed; a
                      wrong answer reteaches and you stay until you get it
       skill       -> I-do skill modelling, then the skill task unlocks
     Revision mode never enters here, so it never sees metalanguage. */

  function targetCell() { return drillTarget ? drillableAt(drillTarget.category, drillTarget.bandIndex) : null; }

  // Oxford-comma list join for the metalanguage success criterion.
  function listJoin(arr) {
    if (arr.length <= 1) return arr[0] || "";
    if (arr.length === 2) return arr[0] + " and " + arr[1];
    return arr.slice(0, -1).join(", ") + ", and " + arr[arr.length - 1];
  }

  // LI + the two success criteria for a cell. The metalanguage goal is built
  // from the cell's vocab terms so it never drifts; LI and skill goal come
  // from window.GOALS, with a plain fallback if a cell isn't mapped yet.
  function goalFor(skill) {
    const g = (window.GOALS && window.GOALS[skill.id]) || {};
    const terms = (skill.vocab || []).map((v) => v.term);
    const fallback = "I can use " + skill.name.toLowerCase() + ".";
    return {
      li: g.li || fallback,
      vocabGoal: terms.length ? "I can recognise " + listJoin(terms) + "." : "",
      skillGoal: g.skill || fallback,
      terms,
    };
  }

  // Distractor pool for metalanguage checks: every term used anywhere.
  function allVocabTerms() {
    const set = new Set();
    window.SKILLS.forEach((s) => (s.vocab || []).forEach((v) => set.add(v.term)));
    return Array.from(set);
  }

  // One recognition check per term: definition + example, options are the
  // term plus sibling terms (preferred) then global terms, capped at four.
  function buildMetaChecks(skill) {
    const siblings = (skill.vocab || []).map((v) => v.term);
    const global = allVocabTerms();
    return (skill.vocab || []).map((v) => {
      const opts = new Set([v.term]);
      shuffle(siblings.filter((t) => t !== v.term)).forEach((t) => { if (opts.size < 4) opts.add(t); });
      shuffle(global.filter((t) => !opts.has(t))).forEach((t) => { if (opts.size < 4) opts.add(t); });
      return { term: v.term, def: v.def, example: v.example, options: shuffle(Array.from(opts)) };
    });
  }

  function startTeaching() {
    const target = targetCell();
    if (!target) { startSkillPreteach(); return; }
    teachPhase = "intention";
    show("preteach");
    renderIntention(target);
  }

  function renderIntention(target) {
    const g = goalFor(target);
    const hasVocab = g.terms.length > 0;
    $("preteachPhase").textContent = "Learning goals";
    $("preteachProgress").textContent = `${target.category} · ${target.band} · ${target.name}`;
    $("preteachBar").style.width = "8%";

    const chips = hasVocab
      ? `<div class="li-eyebrow" style="margin-top:16px">Key words to know first</div>
         <div class="term-chips">${g.terms.map((t) => `<span class="term-chip">${escapeHtmlE(t)}</span>`).join("")}</div>`
      : "";
    const metaItem = hasVocab
      ? `<div class="sc-item"><span class="sc-step">1</span><div class="sc-body">
           <span class="sc-tag">Metalanguage — do this first</span>
           <span class="sc-goal">${linkifyGlossary(escapeHtmlE(g.vocabGoal))}</span></div></div>`
      : "";
    const skillStep = hasVocab ? "2" : "1";
    const skillLockCls = hasVocab ? " locked" : "";
    const skillTag = hasVocab ? "Skill — unlocks after step 1" : "Skill";

    $("preteachContent").innerHTML =
      `<div class="li-box"><div class="li-eyebrow">Learning intention</div>
         <div class="li-text">${linkifyGlossary(escapeHtmlE(g.li))}</div></div>` +
      `<div class="li-eyebrow">Success criteria</div>
       <div class="sc-list">${metaItem}
         <div class="sc-item${skillLockCls}"><span class="sc-step">${skillStep}</span><div class="sc-body">
           <span class="sc-tag">${skillTag}</span>
           <span class="sc-goal">${linkifyGlossary(escapeHtmlE(g.skillGoal))}</span></div></div>
       </div>` + chips;

    $("preteachNextBtn").style.display = "";
    $("preteachNextBtn").textContent = hasVocab ? "Start: learn the words" : "Start the skill";
  }

  function startVocabTeach() {
    const target = targetCell();
    teachPhase = "vocab-teach";
    vocabQueue = (target.vocab || []).slice();
    vocabIdx = 0;
    renderVocabTeach();
  }

  function renderVocabTeach() {
    const v = vocabQueue[vocabIdx];
    const total = vocabQueue.length;
    $("preteachPhase").textContent = "Vocabulary · I do";
    $("preteachProgress").textContent = `Word ${vocabIdx + 1} of ${total}`;
    $("preteachBar").style.width = Math.round(10 + ((vocabIdx + 1) / total) * 35) + "%";
    $("preteachContent").innerHTML =
      `<div class="teach-phase">Learn this word</div>` +
      `<div class="teach-term">${escapeHtmlE(v.term)}</div>` +
      `<div class="teach-def">${linkifyGlossary(escapeHtmlE(v.def))}</div>` +
      `<div class="teach-example">${v.example}</div>`;
    $("preteachNextBtn").style.display = "";
    $("preteachNextBtn").textContent = vocabIdx < total - 1 ? "Next word" : "Check what you know";
  }

  function startVocabCheck() {
    teachPhase = "vocab-check";
    metaChecks = buildMetaChecks(targetCell());
    metaIdx = 0;
    renderVocabCheck();
  }

  function renderVocabCheck() {
    const c = metaChecks[metaIdx];
    const total = metaChecks.length;
    $("preteachPhase").textContent = "Vocabulary · you do";
    $("preteachProgress").textContent = `Check ${metaIdx + 1} of ${total}`;
    $("preteachBar").style.width = Math.round(45 + ((metaIdx + 1) / total) * 30) + "%";
    // On rails: there is no Next button here — you advance by answering right.
    $("preteachNextBtn").style.display = "none";
    $("preteachContent").innerHTML =
      `<div class="teach-phase">Which word is this?</div>` +
      `<div class="teach-def">${escapeHtmlE(c.def)}</div>` +
      `<div class="teach-example">${c.example}</div>` +
      `<div class="vocab-opts" id="metaOpts">` +
        c.options.map((o) => `<button type="button" class="vocab-opt" data-opt="${escapeHtmlE(o)}">${escapeHtmlE(o)}</button>`).join("") +
      `</div>` +
      `<div class="teach-feedback" id="metaFeedback"></div>`;
    $("metaOpts").querySelectorAll(".vocab-opt").forEach((btn) => {
      btn.addEventListener("click", () => onMetaPick(btn, c));
    });
  }

  function onMetaPick(btn, c) {
    const fb = $("metaFeedback");
    if (btn.dataset.opt === c.term) {
      btn.classList.add("correct");
      $("metaOpts").querySelectorAll(".vocab-opt").forEach((b) => { b.disabled = true; if (b !== btn) b.classList.add("dim"); });
      fb.className = "teach-feedback good";
      fb.textContent = `✓ Yes — that's the ${c.term}.`;
      setTimeout(() => {
        metaIdx++;
        if (metaIdx < metaChecks.length) renderVocabCheck();
        else startSkillPreteach();
      }, 950);
    } else {
      btn.classList.add("incorrect");
      btn.disabled = true;
      fb.className = "teach-feedback bad";
      fb.innerHTML = "Not quite. " + linkifyGlossary(escapeHtmlE(c.def)) + " Try again.";
    }
  }

  /* ---------------- METALANGUAGE: pick a clause inside a full sentence ----
     For conditionals: the whole sentence is shown and the learner taps the
     part asked for (the condition, or the result). The 'if' part appears at
     the start in some items and at the end in others, and you are sometimes
     asked for the result — so it can't be gamed by spotting the word "if" or
     by position. Single tap: any word inside the target clause counts. */

  function clauseAsk(find) {
    return find === "condition" ? "the CONDITION (the if-part)" : "the RESULT (what happens)";
  }

  function startClauseIDo() {
    teachPhase = "cl-ido";
    clIdoIdx = 0;
    renderClauseIDo();
  }

  function renderClauseIDo() {
    const cp = targetCell().clausePick;
    const m = cp.modelled[clIdoIdx];
    const total = cp.modelled.length;
    $("preteachPhase").textContent = "Clauses · I do";
    $("preteachProgress").textContent = `Example ${clIdoIdx + 1} of ${total}`;
    $("preteachBar").style.width = Math.round(12 + ((clIdoIdx + 1) / total) * 22) + "%";
    const chips = m.words.map((w, i) =>
      `<span class="clause-word${i >= m.span[0] && i <= m.span[1] ? " correct" : ""}">${escapeHtmlE(w)}</span>`).join("");
    $("preteachContent").innerHTML =
      `<div class="teach-phase">Watch me find it</div>` +
      `<div class="clause-ask">Find ${clauseAsk(m.find)}.</div>` +
      `<div class="clause-sentence">${chips}</div>` +
      `<div class="teach-feedback good">${escapeHtmlE(m.explain)}</div>`;
    $("preteachNextBtn").style.display = "";
    $("preteachNextBtn").textContent = clIdoIdx < total - 1 ? "Next example" : "Your turn (We do)";
  }

  function startClauseWeDo() {
    teachPhase = "cl-wedo";
    clauseBank = shuffle(targetCell().clausePick.items.slice()).slice(0, WEDO_COUNT);
    clauseIdx = 0;
    renderClausePick();
  }

  function startClauseYouDo() {
    teachPhase = "cl-youdo";
    clauseBank = shuffle(targetCell().clausePick.items.slice());
    clauseIdx = 0; clauseStreak = 0; clauseErrors = 0;
    renderClausePick();
  }

  function renderClausePick() {
    const youdo = teachPhase === "cl-youdo";
    const cp = targetCell().clausePick;
    if (clauseIdx >= clauseBank.length) { clauseBank = shuffle(cp.items.slice()); clauseIdx = 0; }
    const item = clauseBank[clauseIdx];
    $("preteachPhase").textContent = youdo ? "Clauses · you do" : "Clauses · we do";
    if (youdo) {
      $("preteachProgress").textContent = "Keep your streak going";
      $("preteachBar").style.width = Math.round(58 + (Math.min(clauseStreak, YOUDO_TARGET) / YOUDO_TARGET) * 20) + "%";
    } else {
      $("preteachProgress").textContent = `Find ${clauseIdx + 1} of ${clauseBank.length}`;
      $("preteachBar").style.width = Math.round(36 + ((clauseIdx + 1) / clauseBank.length) * 20) + "%";
    }
    $("preteachNextBtn").style.display = "none";
    const chips = item.words.map((w, i) =>
      `<button type="button" class="clause-word" data-i="${i}">${escapeHtmlE(w)}</button>`).join("");
    $("preteachContent").innerHTML =
      `<div class="teach-phase">${youdo ? "Find it yourself" : "Now you try"}</div>` +
      `<div class="clause-ask">Tap ${clauseAsk(item.find)}.</div>` +
      `<div class="clause-sentence" id="clauseRow">${chips}</div>` +
      `<div class="teach-feedback" id="clauseFb"></div>` +
      `<div class="sort-streak" id="clauseStreak">${youdo ? `Correct in a row: ${clauseStreak} / ${YOUDO_TARGET}` : ``}</div>`;
    $("clauseRow").querySelectorAll(".clause-word").forEach((btn) => btn.addEventListener("click", () => onClauseTap(btn, item)));
  }

  function onClauseTap(btn, item) {
    const fb = $("clauseFb");
    const youdo = teachPhase === "cl-youdo";
    const i = +btn.dataset.i;
    if (i >= item.span[0] && i <= item.span[1]) {
      const row = $("clauseRow");
      for (let j = item.span[0]; j <= item.span[1]; j++) {
        const w = row.querySelector(`.clause-word[data-i="${j}"]`);
        if (w) w.classList.add("correct");
      }
      row.querySelectorAll(".clause-word").forEach((w) => { w.disabled = true; });
      fb.className = "teach-feedback good";
      fb.textContent = `✓ Yes — that's ${item.find === "condition" ? "the condition" : "the result"}.`;
      if (youdo) {
        clauseStreak++;
        const s = $("clauseStreak"); if (s) s.textContent = `Correct in a row: ${clauseStreak} / ${YOUDO_TARGET}`;
        if (clauseStreak >= YOUDO_TARGET && clauseErrors <= 1) { setTimeout(startSkillPreteach, 950); return; }
      }
      setTimeout(() => {
        clauseIdx++;
        if (!youdo && clauseIdx >= clauseBank.length) { startClauseYouDo(); return; }
        renderClausePick();
      }, 850);
    } else {
      btn.classList.add("incorrect"); btn.disabled = true;
      fb.className = "teach-feedback bad";
      const hint = item.find === "condition"
        ? "The condition is the part with 'if'."
        : "The result is the part WITHOUT 'if' — what actually happens.";
      fb.innerHTML = `Not that one. ${hint} Try again.`;
      if (youdo) clauseErrors++;
    }
  }

  function startSkillPreteach() {
    teachPhase = "skill";
    const skills = getTeachingSkills();
    const target = targetCell();
    const g = target ? goalFor(target) : null;
    $("preteachPhase").textContent = "Skill · I do";
    $("preteachProgress").textContent = `${skills.length} level${skills.length === 1 ? "" : "s"} this cycle`;
    $("preteachBar").style.width = "82%";

    const banner = (target && (target.vocab || []).length)
      ? `<div class="teach-banner">✓ Metalanguage done — now the skill</div>` : "";
    const goalLine = g
      ? `<div class="li-box"><div class="li-eyebrow">Now you can</div>
           <div class="li-text" style="font-size:17px">${linkifyGlossary(escapeHtmlE(g.skillGoal))}</div></div>` : "";

    // Worked examples model the structure across its variations and
    // permutations — the richer modelling the single example can't show.
    const worked = (target && target.worked && target.worked.length)
      ? target.worked
      : (target ? [{ text: target.example }] : []);
    const workedHtml = worked.length
      ? `<div class="li-eyebrow" style="margin-top:6px">Worked examples — the variations</div>
         <div class="worked-list">` +
         worked.map((w) => `<div class="worked-row"><div class="worked-text">${w.text}</div>` +
           (w.note ? `<div class="worked-note">${w.note}</div>` : ``) + `</div>`).join("") +
         `</div>` : "";
    const cardsHead = `<div class="li-eyebrow" style="margin-top:14px">This cycle covers</div>`;

    const cards = skills.map((s) => {
      const bi = window.BANDS.indexOf(s.band);
      let label, cls;
      if (bi < drillTarget.bandIndex) { label = "Review"; cls = "review"; }
      else if (bi === drillTarget.bandIndex) { label = "Target"; cls = "target"; }
      else { label = "Stretch"; cls = "stretch"; }
      const links = ((s.resources && s.resources.sheets) || []).map((sh) =>
        `<a href="${sh.url}" target="_blank" rel="noopener">${escapeHtmlE(resourceLabel(sh))}</a>`).join("");
      const linksRow = links ? `<div class="preteach-links">Learn more: ${links}</div>` : "";
      return `<div class="preteach-card${cls === "target" ? " preteach-target" : ""}">
        <span class="preteach-band">${s.band}</span>
        <span class="preteach-label ${cls}">${label}</span>
        <div class="preteach-name">${linkifyGlossary(escapeHtmlE(s.name))}</div>
        <div class="preteach-example">"${escapeHtmlE(s.example)}"</div>
        ${linksRow}
      </div>`;
    }).join("");

    $("preteachContent").innerHTML = banner + goalLine + workedHtml + cardsHead + cards;
    $("preteachNextBtn").style.display = "";
    $("preteachNextBtn").textContent = "Start skill practice";
    show("preteach");
  }

  // Next-button dispatcher across the preteach sub-phases. The interactive
  // phases (vocab-check, ml-wedo, ml-youdo) are excluded on purpose — they
  // advance only when the learner answers/sorts correctly.
  function onPreteachNext() {
    const target = targetCell();
    if (teachPhase === "intention") {
      if (target && target.clausePick) startClauseIDo();
      else if (target && target.sort) startMlIDo();
      else if (target && (target.vocab || []).length) startVocabTeach();
      else startSkillPreteach();
    } else if (teachPhase === "ml-ido") {
      mlIdoIdx++;
      if (mlIdoIdx < target.sort.modelled.length) renderMlIDo();
      else startMlWeDo();
    } else if (teachPhase === "cl-ido") {
      clIdoIdx++;
      if (clIdoIdx < target.clausePick.modelled.length) renderClauseIDo();
      else startClauseWeDo();
    } else if (teachPhase === "vocab-teach") {
      vocabIdx++;
      if (vocabIdx < vocabQueue.length) renderVocabTeach();
      else startVocabCheck();
    } else if (teachPhase === "skill") {
      show("task");
      showItem();
    }
  }

  /* ---------------- METALANGUAGE: drag-and-drop sorting ----------------
     Ported from the word-class sorter: gradual release across I do (watch a
     sort modelled with a think-aloud), We do (guided practice, reteach on a
     wrong drop), and You do (a mastery streak you must hit to unlock the
     skill). Pointer-event drag; a wrong/missed drop snaps the tile back. */

  function zoneAtPoint(zones, x, y) {
    for (const z of zones) {
      const r = z.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return z;
    }
    return null;
  }

  function makeDraggable(tileEl, zonesContainer, callbacks) {
    let startX, startY, dragging = false;
    tileEl.addEventListener("pointerdown", (e) => {
      if (tileEl.dataset.placed === "true") return;
      dragging = true;
      tileEl.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      tileEl.classList.add("dragging");
    });
    tileEl.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      tileEl.style.transform = "translate(" + (e.clientX - startX) + "px," + (e.clientY - startY) + "px)";
      const zones = zonesContainer.querySelectorAll(".zone");
      zones.forEach((z) => z.classList.remove("over"));
      const t = zoneAtPoint(zones, e.clientX, e.clientY);
      if (t) t.classList.add("over");
    });
    tileEl.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      tileEl.classList.remove("dragging");
      const zones = zonesContainer.querySelectorAll(".zone");
      zones.forEach((z) => z.classList.remove("over"));
      const t = zoneAtPoint(zones, e.clientX, e.clientY);
      tileEl.style.transform = "";
      if (t) callbacks.onDrop(t);
    });
  }

  function startMlIDo() {
    teachPhase = "ml-ido";
    mlIdoIdx = 0;
    renderMlIDo();
  }

  function renderMlIDo() {
    const sort = targetCell().sort;
    const m = sort.modelled[mlIdoIdx];
    const total = sort.modelled.length;
    $("preteachPhase").textContent = "Sorting · I do";
    $("preteachProgress").textContent = `Example ${mlIdoIdx + 1} of ${total}`;
    $("preteachBar").style.width = Math.round(12 + ((mlIdoIdx + 1) / total) * 22) + "%";
    const zonesHtml = sort.zones.map((z) => {
      const here = z === m.zone;
      return `<div class="zone${here ? " correct" : ""}"><div class="zone-label">${escapeHtmlE(z)}</div>` +
        (here ? `<div class="rested">${escapeHtmlE(m.text)}</div>` : ``) + `</div>`;
    }).join("");
    $("preteachContent").innerHTML =
      `<div class="teach-phase">Watch how I sort this</div>` +
      `<div class="sort-prompt">${escapeHtmlE(sort.prompt)}</div>` +
      `<div class="zones">${zonesHtml}</div>` +
      `<div class="teach-feedback good">${escapeHtmlE(m.explain)}</div>`;
    $("preteachNextBtn").style.display = "";
    $("preteachNextBtn").textContent = mlIdoIdx < total - 1 ? "Next example" : "Your turn (We do)";
  }

  function startMlWeDo() {
    teachPhase = "ml-wedo";
    sortBank = shuffle(targetCell().sort.items.slice()).slice(0, WEDO_COUNT);
    sortIdx = 0;
    renderSortPractice();
  }

  function startMlYouDo() {
    teachPhase = "ml-youdo";
    sortBank = shuffle(targetCell().sort.items.slice());
    sortIdx = 0; sortStreak = 0; sortErrors = 0;
    renderSortPractice();
  }

  // Hint for a wrong drop: reuse the matching zone's modelled think-aloud.
  function sortReteach(item) {
    const m = (targetCell().sort.modelled || []).find((x) => x.zone === item.zone);
    return m ? escapeHtmlE(m.explain) : "";
  }

  function renderSortPractice() {
    const youdo = teachPhase === "ml-youdo";
    const sort = targetCell().sort;
    if (sortIdx >= sortBank.length) { sortBank = shuffle(sort.items.slice()); sortIdx = 0; }
    const item = sortBank[sortIdx];

    $("preteachPhase").textContent = youdo ? "Sorting · you do" : "Sorting · we do";
    if (youdo) {
      $("preteachProgress").textContent = "Keep your streak going";
      $("preteachBar").style.width = Math.round(58 + (Math.min(sortStreak, YOUDO_TARGET) / YOUDO_TARGET) * 20) + "%";
    } else {
      $("preteachProgress").textContent = `Sort ${sortIdx + 1} of ${sortBank.length}`;
      $("preteachBar").style.width = Math.round(36 + ((sortIdx + 1) / sortBank.length) * 20) + "%";
    }
    $("preteachNextBtn").style.display = "none";

    const zonesHtml = sort.zones.map((z) =>
      `<div class="zone" data-zone="${escapeHtmlE(z)}"><div class="zone-label">${escapeHtmlE(z)}</div></div>`).join("");
    $("preteachContent").innerHTML =
      `<div class="teach-phase">${youdo ? "Sort it yourself" : "Now you try"}</div>` +
      `<div class="sort-prompt">${escapeHtmlE(sort.prompt)}</div>` +
      `<div class="sort-stage"><span class="sort-tile" id="sortTile">${escapeHtmlE(item.text)}</span></div>` +
      `<div class="zones" id="sortZones">${zonesHtml}</div>` +
      `<div class="teach-feedback" id="sortFeedback"></div>` +
      `<div class="sort-streak" id="sortStreak">${youdo ? `Correct in a row: ${sortStreak} / ${YOUDO_TARGET}` : ``}</div>`;

    makeDraggable($("sortTile"), $("sortZones"), { onDrop: (zoneEl) => onSortDrop(zoneEl, $("sortTile"), item) });
  }

  function onSortDrop(zoneEl, tile, item) {
    const fb = $("sortFeedback");
    const youdo = teachPhase === "ml-youdo";
    if (zoneEl.dataset.zone === item.zone) {
      tile.dataset.placed = "true";
      tile.classList.add("placed");
      zoneEl.classList.add("correct");
      zoneEl.insertAdjacentHTML("beforeend", `<div class="rested">${escapeHtmlE(item.text)}</div>`);
      fb.className = "teach-feedback good";
      fb.textContent = `✓ Yes — that belongs in “${item.zone}”.`;
      if (youdo) {
        sortStreak++;
        const sEl = $("sortStreak"); if (sEl) sEl.textContent = `Correct in a row: ${sortStreak} / ${YOUDO_TARGET}`;
        if (sortStreak >= YOUDO_TARGET && sortErrors <= 1) { setTimeout(startSkillPreteach, 950); return; }
      }
      setTimeout(() => {
        sortIdx++;
        if (!youdo && sortIdx >= sortBank.length) { startMlYouDo(); return; }
        renderSortPractice();
      }, 850);
    } else {
      zoneEl.classList.add("over");
      setTimeout(() => zoneEl.classList.remove("over"), 300);
      fb.className = "teach-feedback bad";
      fb.innerHTML = `Not quite — that belongs in “${escapeHtmlE(item.zone)}”. ${sortReteach(item)} Try again.`;
      if (youdo) sortErrors++;
    }
  }

  /* ---------------- SHOW ITEM (task screen) ---------------- */

  function showItem() {
    graded = false;
    const entry = currentSet[idx];
    const type = window.TASK_TYPES[entry.item.type] || window.TASK_TYPES.produce;

    const promptText = entry.item.prompt || type.label;
    const recognition = entry.item.type === "identify" || entry.item.type === "choose";
    $("promptText").innerHTML = recognition
      ? escapeHtmlE(promptText)
      : linkifyGlossary(escapeHtmlE(promptText));
    const tagText = recognition
      ? `${entry.category} · ${entry.band}`
      : `${entry.category} · ${entry.band} · ${entry.skillName}`;
    $("skillTag").innerHTML = linkifyGlossary(escapeHtmlE(tagText));

    const area = $("taskArea");
    area.innerHTML = type.render(entry.item);
    if (type.wire) type.wire(area);

    $("feedback").className = "feedback";
    $("feedback").textContent = "";
    $("checkBtn").disabled = true;
    $("checkBtn").style.display = "";
    $("nextBtn").style.display = "none";

    const done = pool.length - countNotMastered();
    $("remainText").textContent = `${countNotMastered()} to master`;
    $("roundText").textContent = round === 1 ? "Main round" : `Mastery round ${round - 1}`;
    $("bar").style.width = Math.round((done / pool.length) * 100) + "%";
  }

  function onCheck() {
    if (graded) return;
    const entry = currentSet[idx];
    const type = window.TASK_TYPES[entry.item.type] || window.TASK_TYPES.produce;
    const response = type.collect($("taskArea"));
    if (response === null) return;

    const result = type.check(entry.item, response);
    if (type.mark) type.mark($("taskArea"), entry.item, result);

    attempts[entry.uid] = (attempts[entry.uid] || 0) + 1;
    if (attempts[entry.uid] === 1) firstPass[entry.uid] = result.correct;
    if (result.correct) correctEver[entry.uid] = true;

    log.push({ round, skill: entry.skillName, type: entry.item.type,
               stimulus: stimulusOf(entry.item),
               response: responseText(entry.item, response), result: result.correct ? "correct" : "incorrect" });

    const fb = $("feedback");
    fb.className = "feedback " + (result.correct ? "good" : "bad");
    fb.innerHTML = (result.correct ? "✓ Correct. " : `✗ Not yet. Answer: <b>${escapeHtmlE(result.expected)}</b>. `) +
                   (entry.item.explain ? linkifyGlossary(escapeHtmlE(entry.item.explain)) : "");

    graded = true;
    $("checkBtn").style.display = "none";
    $("nextBtn").style.display = "";
    $("nextBtn").focus();
  }

  function onNext() {
    idx++;
    if (idx >= currentSet.length) {
      nextSet = pool.filter((e) => !correctEver[e.uid]);
      if (nextSet.length > 0) {
        currentSet = shuffle(nextSet.slice());
        nextSet = [];
        round++;
        idx = 0;
        showItem();
      } else {
        if (mode === "teaching") {
          endTeachingSession();
        } else {
          endSession();
        }
      }
    } else {
      showItem();
    }
  }

  function countNotMastered() { return pool.filter((e) => !correctEver[e.uid]).length; }

  /* ---------------- TEACHING MODE: PLACEMENT ---------------- */

  function endTeachingSession() {
    const total = pool.length;
    const firstRight = pool.filter((e) => firstPass[e.uid]).length;
    const totalAttempts = Object.values(attempts).reduce((a, b) => a + b, 0);

    // per-skill breakdown
    const bySkill = {};
    pool.forEach((e) => {
      const s = bySkill[e.skillId] = bySkill[e.skillId] ||
        { name: e.skillName, cat: e.category, band: e.band, total: 0, right: 0, tags: {} };
      s.total++;
      if (firstPass[e.uid]) s.right++;
      (e.item.tags || []).forEach((tag) => {
        const t = s.tags[tag] = s.tags[tag] || { total: 0, right: 0 };
        t.total++;
        if (firstPass[e.uid]) t.right++;
      });
    });

    // adaptive placement logic
    const { category, bandIndex } = drillTarget;
    const belowSkill = drillableAt(category, bandIndex - 1);
    const targetSkill = drillableAt(category, bandIndex);
    const aboveSkill = drillableAt(category, bandIndex + 1);

    const mastered = (skill) => skill && bySkill[skill.id] && bySkill[skill.id].right === bySkill[skill.id].total;
    const belowOk = !belowSkill || mastered(belowSkill);
    const targetOk = mastered(targetSkill);
    const aboveOk = !aboveSkill || mastered(aboveSkill);

    let nextBand = bandIndex;
    let msg = "";

    if (belowOk && targetOk && aboveOk) {
      // mastered everything — jump up two if possible, else one
      const jump2 = nextDrillableAbove(category, bandIndex + 1);
      const jump1 = nextDrillableAbove(category, bandIndex);
      if (jump2 !== null) {
        nextBand = jump2;
        msg = `Outstanding! You mastered all three levels. Moving to ${window.BANDS[jump2]} with a review of ${window.BANDS[bandIndex + 1]} first.`;
      } else if (jump1 !== null) {
        nextBand = jump1;
        msg = `Excellent! You mastered everything. Moving up to ${window.BANDS[jump1]}.`;
      } else {
        nextBand = null;
        msg = `You've mastered the whole strand! Nothing higher to practise.`;
      }
    } else if (!belowOk) {
      // failed the level below — drop down
      const dropTo = bandIndex - 1;
      if (dropTo >= 0 && drillableAt(category, dropTo)) {
        nextBand = dropTo;
        msg = `Let's strengthen the foundation. Dropping to ${window.BANDS[dropTo]} to build up from there.`;
      } else {
        nextBand = bandIndex;
        msg = `Some tricky spots. Let's try this level again with the preteach.`;
      }
    } else if (belowOk && targetOk && !aboveOk) {
      // beat target but not above — move up one
      const up = nextDrillableAbove(category, bandIndex);
      if (up !== null) {
        nextBand = up;
        msg = `Great work on ${window.BANDS[bandIndex]}! Moving to ${window.BANDS[up]} — you'll get the vocabulary and skill preteach first.`;
      } else {
        nextBand = null;
        msg = `Almost there! You've reached the top of the strand.`;
      }
    } else {
      // target not mastered — stay
      nextBand = bandIndex;
      msg = `Nearly there. Let's have another go at ${window.BANDS[bandIndex]} with a refresher.`;
    }

    // show placement screen
    $("placementSummary").innerHTML =
      `<div class="big-stat">${firstRight}/${total}</div>` +
      `<div class="stat-label">correct first try</div>` +
      `<p class="muted">Mastered all ${total} after ${totalAttempts} total attempt${totalAttempts === 1 ? "" : "s"}.</p>`;

    // per-skill rows
    const scoreCls = (right, tot) => {
      const pct = Math.round((right / tot) * 100);
      return pct === 100 ? "ok" : pct >= 50 ? "mid" : "low";
    };
    let skillRows = Object.values(bySkill).map((s) => {
      let row = `<div class="skill-row">
        <span class="skill-name">${escapeHtmlE(`${s.cat} · ${s.band} · ${s.name}`)}</span>
        <span class="skill-score ${scoreCls(s.right, s.total)}">${s.right}/${s.total}</span>
      </div>`;
      const tags = Object.entries(s.tags);
      if (tags.length > 1) {
        row += tags.map(([tag, t]) =>
          `<div class="subskill-row">
            <span class="subskill-name">${escapeHtmlE(tag)}</span>
            <span class="skill-score ${scoreCls(t.right, t.total)}">${t.right}/${t.total}</span>
          </div>`).join("");
      }
      return row;
    }).join("");

    // build placement rubric (just for this strand)
    let rubricHtml = "";
    const head = `<div class="matrix-row matrix-head"><div class="matrix-cell rowlabel"></div>` +
      window.BANDS.map((b) => `<div class="matrix-cell colhead">${b}</div>`).join("") + `</div>`;
    let rowHtml = `<div class="matrix-row"><div class="matrix-cell rowlabel">${escapeHtmlE(category)}</div>`;
    window.BANDS.forEach((band, i) => {
      const skill = cellAt(category, i);
      if (!skill || !skill.introduced) {
        rowHtml += `<div class="matrix-cell empty"><span class="dash">—</span></div>`;
        return;
      }
      const st = cellStatusFor(skill, bySkill);
      let cls = "matrix-cell";
      let mark = "";
      if (st.kind === "mastered") { cls += " rpt-mastered"; mark = `<span class="rpt-mark ok">✓</span>`; }
      else if (st.kind === "missed") { cls += " rpt-missed"; mark = `<span class="rpt-mark bad">✗</span>`; }
      else if (st.kind === "partial") { cls += " rpt-partial"; }
      else { cls += " rpt-none"; }
      if (nextBand !== null && i === nextBand) cls += " rpt-next";
      rowHtml += `<div class="${cls}">${mark}<span class="cell-name">${escapeHtmlE(skill.name)}</span>` +
        (nextBand !== null && i === nextBand ? `<span class="rpt-next-tag">next ▸</span>` : "") + `</div>`;
    });
    rowHtml += `</div>`;
    rubricHtml = head + rowHtml;

    $("placementRubric").innerHTML = rubricHtml;
    $("placementMsg").innerHTML = msg;

    // wire continue button
    const contBtn = $("placementContinueBtn");
    if (nextBand !== null) {
      contBtn.style.display = "";
      contBtn.textContent = `Continue to ${window.BANDS[nextBand]}`;
      contBtn.onclick = () => {
        drillTarget = { category, bandIndex: nextBand };
        buildMatrix();
        startSession();
      };
    } else {
      contBtn.style.display = "none";
    }

    // also store for teacher export
    lastReport = { bySkill, firstRight, total, totalAttempts };
    buildTeacherExport(firstRight, total, totalAttempts, bySkill);

    show("placement");
  }

  /* ---------------- REPORT (revision mode) ---------------- */

  function endSession() {
    show("report");
    const total = pool.length;
    const firstRight = pool.filter((e) => firstPass[e.uid]).length;
    const totalAttempts = Object.values(attempts).reduce((a, b) => a + b, 0);

    $("reportSummary").innerHTML =
      `<div class="big-stat">${firstRight}/${total}</div>` +
      `<div class="stat-label">correct first try</div>` +
      `<p class="muted">Mastered all ${total} after ${totalAttempts} total attempt${totalAttempts === 1 ? "" : "s"}.</p>`;

    const bySkill = {};
    pool.forEach((e) => {
      const s = bySkill[e.skillId] = bySkill[e.skillId] ||
        { name: e.skillName, cat: e.category, band: e.band, total: 0, right: 0, tags: {} };
      s.total++;
      const right = firstPass[e.uid];
      if (right) s.right++;
      (e.item.tags || []).forEach((tag) => {
        const t = s.tags[tag] = s.tags[tag] || { total: 0, right: 0 };
        t.total++;
        if (right) t.right++;
      });
    });
    const scoreCls = (right, total) => {
      const pct = Math.round((right / total) * 100);
      return pct === 100 ? "ok" : pct >= 50 ? "mid" : "low";
    };
    let rows = Object.values(bySkill).map((s) => {
      let row = `<div class="skill-row">
                <span class="skill-name">${linkifyGlossary(escapeHtmlE(`${s.cat} · ${s.band} · ${s.name}`))}</span>
                <span class="skill-score ${scoreCls(s.right, s.total)}">${s.right}/${s.total}</span>
              </div>`;
      const tags = Object.entries(s.tags);
      if (tags.length > 1) {
        row += tags.map(([tag, t]) =>
          `<div class="subskill-row">
             <span class="subskill-name">${escapeHtmlE(tag)}</span>
             <span class="skill-score ${scoreCls(t.right, t.total)}">${t.right}/${t.total}</span>
           </div>`).join("");
      }
      return row;
    }).join("");
    $("reportSkills").innerHTML = `<h3>By skill (first try)</h3>${rows}`;

    const weak = Object.entries(bySkill).filter(([, s]) => s.right < s.total);
    if (weak.length) {
      let html = `<h3>Practise next</h3>`;
      weak.forEach(([id, s]) => {
        const skill = skillById(id);
        html += `<div class="remed-row"><b>${linkifyGlossary(escapeHtmlE(s.name))}</b> `;
        if (skill.resources && (skill.resources.video || (skill.resources.sheets || []).length)) {
          if (skill.resources.video) html += `<a href="${skill.resources.video}" target="_blank">video</a> `;
          (skill.resources.sheets || []).forEach((sh) => { html += `<a href="${sh.url}" target="_blank">${escapeHtmlE(resourceLabel(sh))}</a> `; });
        } else {
          html += `<span class="muted">no resources mapped yet — add to skills.js → resources</span>`;
        }
        html += `</div>`;
      });
      $("reportRemediation").innerHTML = html;
    } else {
      $("reportRemediation").innerHTML = `<p class="muted">Every selected skill correct first try. Nothing to reteach.</p>`;
    }

    advanceSelection(bySkill);
    buildReportRubric(bySkill);
    runReportReveal();
    lastReport = { bySkill, firstRight, total, totalAttempts };
    buildTeacherExport(firstRight, total, totalAttempts, bySkill);
  }

  function runReportReveal() {
    const sections = [
      document.querySelector("#reportScreen h3"),
      $("reportRubricHint"), $("reportRubric"), $("reportRubricLegend"),
      $("reportRemediation"), $("reportSkills"),
    ].filter(Boolean);
    sections.forEach((el) => el.classList.add("report-reveal", "pre-reveal"));

    const rubric = $("reportRubric");
    const mastered = Array.from(rubric.querySelectorAll(".rpt-mastered"));
    mastered.forEach((c) => c.classList.remove("rpt-mastered"));
    const nextCell = rubric.querySelector(".rpt-next");
    if (nextCell) nextCell.classList.remove("rpt-next");

    setTimeout(() => {
      sections.forEach((el) => el.classList.remove("pre-reveal"));
      mastered.forEach((cell, i) => {
        setTimeout(() => cell.classList.add("rpt-mastered", "rpt-justmastered"), 350 + i * 160);
      });
      const tail = 350 + mastered.length * 160 + 150;
      if (nextCell) setTimeout(() => nextCell.classList.add("rpt-next"), tail);
    }, 1000);
  }

  /* ---------------- next-step rubric + exports ---------------- */
  let lastReport = null;

  function nextDrillableAbove(cat, b) {
    for (let j = b + 1; j < window.BANDS.length; j++) if (drillableAt(cat, j)) return j;
    return null;
  }

  function advanceSelection(bySkill) {
    const mastered = (skill) => skill && bySkill[skill.id] && bySkill[skill.id].right === bySkill[skill.id].total;
    if (mode === "teaching" && drillTarget) {
      const sk = cellAt(drillTarget.category, drillTarget.bandIndex);
      if (mastered(sk)) {
        const nb = nextDrillableAbove(drillTarget.category, drillTarget.bandIndex);
        if (nb !== null) drillTarget = { category: drillTarget.category, bandIndex: nb };
        else drillTarget = null;
      }
    } else {
      Object.keys(rowLevel).forEach((cat) => {
        const sk = cellAt(cat, rowLevel[cat]);
        if (mastered(sk)) {
          const nb = nextDrillableAbove(cat, rowLevel[cat]);
          if (nb !== null) rowLevel[cat] = nb;
          else delete rowLevel[cat];
        }
      });
    }
  }

  function cellStatusFor(skill, bySkill) {
    const s = bySkill[skill.id];
    if (!s) return { kind: "none" };
    if (s.right === s.total) return { kind: "mastered" };
    const tags = Object.entries(s.tags);
    const someRight = tags.some(([, t]) => t.right === t.total);
    const someWrong = tags.some(([, t]) => t.right < t.total);
    if (tags.length > 1 && someRight && someWrong) return { kind: "partial", tags };
    return { kind: "missed" };
  }

  function buildReportRubric(bySkill) {
    const wrap = $("reportRubric");
    if (!wrap) return;
    wrap.innerHTML = "";
    const head = document.createElement("div");
    head.className = "matrix-row matrix-head";
    head.innerHTML = `<div class="matrix-cell rowlabel"></div>` +
      window.BANDS.map((b) => `<div class="matrix-cell colhead">${b}</div>`).join("");
    wrap.appendChild(head);

    window.CATEGORIES.forEach((cat) => {
      const row = document.createElement("div");
      row.className = "matrix-row";
      const label = document.createElement("div");
      label.className = "matrix-cell rowlabel";
      label.textContent = cat;
      row.appendChild(label);

      window.BANDS.forEach((band, i) => {
        const skill = cellAt(cat, i);
        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        if (!skill || !skill.introduced) { cell.classList.add("empty"); cell.innerHTML = `<span class="dash">—</span>`; row.appendChild(cell); return; }

        const st = cellStatusFor(skill, bySkill);
        const isNext = (mode === "teaching")
          ? (drillTarget && drillTarget.category === cat && drillTarget.bandIndex === i)
          : (rowLevel[cat] === i);

        let mark = "", sub = "";
        if (st.kind === "mastered") { cell.classList.add("rpt-mastered"); mark = `<span class="rpt-mark ok">✓</span>`; }
        else if (st.kind === "partial") {
          cell.classList.add("rpt-partial");
          sub = `<div class="rpt-subskill">` + st.tags.map(([tag, t]) =>
            `<div><span class="${t.right === t.total ? "t" : "x"}">${t.right === t.total ? "✓" : "✗"}</span> ${escapeHtmlE(tag)}</div>`).join("") + `</div>`;
        }
        else if (st.kind === "missed") { cell.classList.add("rpt-missed"); mark = `<span class="rpt-mark bad">✗</span>`; }
        else { cell.classList.add("rpt-none"); }
        if (isNext) cell.classList.add("rpt-next");

        cell.innerHTML = `${mark}<span class="cell-name">${escapeHtmlE(skill.name)}</span>${sub}` +
          (isNext ? `<span class="rpt-next-tag">next ▸</span>` : "");
        row.appendChild(cell);
      });
      wrap.appendChild(row);
    });
    $("reportRubricLegend").innerHTML =
      `<b style="color:var(--correct)">✓</b> mastered · <b style="color:#caa53a">▮</b> half-mastered · ` +
      `<b style="color:var(--wrong)">✗</b> another go · grey = not included this round`;
  }

  /* ---- exportable progress summary ---- */
  function csvCell(v) {
    const s = String(v == null ? "" : v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
  function studentName() { const el = $("studentName"); return (el && el.value.trim()) || ""; }
  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function buildCsv() {
    if (!lastReport) return "";
    const { bySkill, firstRight, total } = lastReport;
    const name = studentName(), date = todayStr();
    let csv = "name,date,strand,band,skill,sub_skill,first_try,out_of\n";
    csv += [name, date, "OVERALL", "", "", "", firstRight, total].map(csvCell).join(",") + "\n";
    Object.values(bySkill).forEach((s) => {
      csv += [name, date, s.cat, s.band, s.name, "", s.right, s.total].map(csvCell).join(",") + "\n";
      const tags = Object.entries(s.tags || {});
      if (tags.length > 1) tags.forEach(([tag, t]) => {
        csv += [name, date, s.cat, s.band, s.name, tag, t.right, t.total].map(csvCell).join(",") + "\n";
      });
    });
    return csv;
  }
  function buildTsvRow() {
    if (!lastReport) return "";
    const { bySkill, firstRight, total } = lastReport;
    const header = ["name", "date", "first_try", "out_of"].concat(Object.values(bySkill).map((s) => `${s.cat} ${s.band}`));
    const values = [studentName(), todayStr(), firstRight, total].concat(Object.values(bySkill).map((s) => `${s.right}/${s.total}`));
    return header.join("\t") + "\n" + values.join("\t");
  }
  function downloadCsv() {
    const csv = buildCsv(); if (!csv) return;
    const safe = (studentName().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "student");
    const filename = `grammar-hub-${safe}-${todayStr()}.csv`;
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 3000);
      $("copyNote").textContent = "CSV downloaded.";
    } catch (e) {
      navigator.clipboard.writeText(csv)
        .then(() => { $("copyNote").textContent = "Download blocked — CSV text copied to clipboard instead. Paste into a text file and save as .csv."; })
        .catch(() => { $("copyNote").textContent = "Download failed. Use 'Copy row for sheet' instead."; });
    }
  }
  function copyTsv() {
    const tsv = buildTsvRow(); if (!tsv) return;
    navigator.clipboard.writeText(tsv)
      .then(() => { $("copyNote").textContent = "Row copied — paste into your sheet or form."; })
      .catch(() => { $("copyNote").textContent = "Copy failed — try Download CSV instead."; });
  }

  let teacherText = "";
  function buildTeacherExport(firstRight, total, totalAttempts, bySkill) {
    let t = `GRAMMAR HUB — Teacher results\n`;
    t += `First try: ${firstRight}/${total}   Total attempts: ${totalAttempts}\n\n`;
    t += `By skill (first try):\n`;
    Object.values(bySkill).forEach((s) => {
      t += `  ${s.cat} · ${s.band} · ${s.name}: ${s.right}/${s.total}\n`;
      const tags = Object.entries(s.tags || {});
      if (tags.length > 1) tags.forEach(([tag, x]) => { t += `      - ${tag}: ${x.right}/${x.total}\n`; });
    });
    t += `\nItem log:\n`;
    log.forEach((r) => { t += `  [r${r.round}] (${r.type}) ${r.skill} — "${r.response}" → ${r.result}\n`; });
    teacherText = t;
  }

  function copyTeacher() {
    if (!teacherText) return;
    navigator.clipboard.writeText(teacherText)
      .then(() => { $("copyNote").textContent = "Copied to clipboard."; })
      .catch(() => { $("copyNote").textContent = "Copy failed — select the report text manually."; });
  }

  /* ---------------- helpers ---------------- */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function stripTags(s) { return (s || "").replace(/<[^>]*>/g, ""); }
  function stimulusOf(item) {
    if (item.sentence) return stripTags(item.sentence);
    if (item.before !== undefined || item.after !== undefined) return stripTags((item.before || "") + " ___ " + (item.after || ""));
    if (item.sentence1 && item.sentence2) return stripTags(item.sentence1 + " + " + item.sentence2);
    if (item.words) return item.words.join(" ");
    if (item.pairs) return item.pairs.map((p) => p.sentence).join(" / ");
    return stripTags(item.prompt || "");
  }
  function responseText(item, response) {
    if (item.type === "match" && Array.isArray(response)) {
      return response.map(([s, m]) => `${item.pairs[s].sentence} = ${item.pairs[m].meaning}`).join("; ");
    }
    return response;
  }
  function escapeHtmlE(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  // ---- glossary auto-linking ----
  let glossRe = null;
  function glossRegex() {
    if (glossRe !== null) return glossRe;
    const keys = Object.keys(window.GLOSSARY || {}).sort((a, b) => b.length - a.length);
    if (!keys.length) { glossRe = false; return glossRe; }
    const alt = keys.map((k) =>
      k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/-/g, "[-–—]")).join("|");
    glossRe = new RegExp("(?<![\\w-])(?:" + alt + ")s?(?![\\w-])", "gi");
    return glossRe;
  }
  function linkifyGlossary(escapedText) {
    const re = glossRegex();
    if (!re) return escapedText;
    re.lastIndex = 0;
    return escapedText.replace(re, (m) => {
      let key = m.toLowerCase().replace(/[–—]/g, "-");
      if (!window.GLOSSARY[key] && key.endsWith("s")) key = key.slice(0, -1);
      if (!window.GLOSSARY[key]) return m;
      return `<button type="button" class="gloss" data-term="${key}">${m}</button>`;
    });
  }

  // Resource label helpers
  function whPageLabel(url) {
    try {
      const seg = decodeURIComponent((url.split("/").pop() || "").replace(/\.aspx$/i, ""));
      const page = seg.replace(/^CS\W+/, "").replace(/-/g, " ").trim();
      return page ? "Writing Hub: " + page : "Writing Hub";
    } catch (e) { return "Writing Hub"; }
  }
  function resourceLabel(sh) {
    const name = sh.name || "";
    if (/sharepoint\.com/i.test(sh.url || "") && !/^(writing hub|khan|abc|arc)\b/i.test(name))
      return "Writing Hub: " + name;
    return name;
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    screens.select = $("selectScreen");
    screens.task = $("taskScreen");
    screens.report = $("reportScreen");
    screens.preteach = $("preteachScreen");
    screens.placement = $("placementScreen");

    buildModeToggle();
    buildMatrix();
    updateToolbar();

    $("selectAllBtn").addEventListener("click", () => {
      window.CATEGORIES.forEach((cat) => { const f = firstDrillable(cat); if (f !== null) rowLevel[cat] = f; });
      (window.POOLS || []).forEach((cat) => { selectedPools[cat] = true; });
      buildMatrix();
    });
    $("selectNoneBtn").addEventListener("click", () => { rowLevel = {}; drillTarget = null; selectedPools = {}; lastServed = {}; buildMatrix(); });
    $("startBtn").addEventListener("click", startSession);

    // preteach screen buttons
    $("preteachNextBtn").addEventListener("click", onPreteachNext);
    $("preteachQuitBtn").addEventListener("click", () => show("select"));

    // task area
    $("taskArea").addEventListener("gh:ready", () => { if (!graded) $("checkBtn").disabled = false; });
    $("taskArea").addEventListener("gh:submit", () => { if (!graded) onCheck(); });

    $("checkBtn").addEventListener("click", onCheck);
    $("nextBtn").addEventListener("click", onNext);
    $("quitBtn").addEventListener("click", () => show("select"));

    // report screen buttons
    $("copyBtn").addEventListener("click", copyTeacher);
    $("downloadCsvBtn").addEventListener("click", downloadCsv);
    $("copyTsvBtn").addEventListener("click", copyTsv);
    $("reviseAgainBtn").addEventListener("click", () => { startSession(); });
    $("adjustBtn").addEventListener("click", () => { buildMatrix(); show("select"); });
    $("restartBtn").addEventListener("click", () => { rowLevel = {}; drillTarget = null; selectedPools = {}; lastServed = {}; buildMatrix(); show("select"); });

    // placement screen buttons
    $("placementSelectBtn").addEventListener("click", () => { buildMatrix(); show("select"); });

    wireGlossaryPopover();
  });

  /* ---------------- glossary popover ---------------- */
  function wireGlossaryPopover() {
    const pop = $("glossPop");
    if (!pop) return;
    const close = () => { pop.hidden = true; };

    document.addEventListener("click", (e) => {
      const term = e.target.closest && e.target.closest(".gloss");
      if (term) {
        const key = term.dataset.term;
        const entry = window.GLOSSARY && window.GLOSSARY[key];
        if (!entry) return;
        const title = key.charAt(0).toUpperCase() + key.slice(1);
        const links = [];
        if (entry.more) links.push(`<a href="${entry.more}" target="_blank" rel="noopener">${escapeHtmlE(whPageLabel(entry.more))}</a>`);
        links.push(`<a href="https://en.wiktionary.org/wiki/${encodeURIComponent(key)}" target="_blank" rel="noopener">Wiktionary</a>`);
        pop.innerHTML = `<div class="gloss-term">${escapeHtmlE(title)}</div>` +
                        `<div class="gloss-def">${escapeHtmlE(entry.def)}</div>` +
                        `<div class="gloss-links">${links.join(" · ")}</div>`;
        pop.hidden = false;
        const r = term.getBoundingClientRect();
        const maxLeft = document.documentElement.clientWidth - pop.offsetWidth - 12;
        pop.style.top = (window.scrollY + r.bottom + 6) + "px";
        pop.style.left = (window.scrollX + Math.max(8, Math.min(r.left, maxLeft))) + "px";
        e.stopPropagation();
        return;
      }
      if (!(e.target.closest && e.target.closest("#glossPop"))) close();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }
})();
