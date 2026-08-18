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

  // ---- persistence (localStorage) ----
  const STORE_KEY = "grammarHub.v1";
  const BUILD = "2026-08-04.1";
  let history = [];       // [{date, skillId, right, total}] across sessions
  let writings = [];      // [{date, promptId, text}] optional writing-task responses
  let savedName = "";     // remembered student name (survives refresh)
  let savedCode = "";     // remembered student code (survives refresh)
  // Label scheme: "eal" (C1–C4 bands, the default and source of truth) or
  // "vic" (Victorian Curriculum codes overlaid — a DRAFT mapping, see
  // data/curriculum.js). Toggling relabels; it never changes the mechanics.
  let curriculum = "eal";

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
    setTranslateMode("unit");   // reset to teaching default; renders re-set it
    // the selector (matrix/timeline) uses the full screen width; the
    // task/preteach/report screens stay at reading width
    document.body.classList.toggle("wide", name === "select");
    window.scrollTo(0, 0);
  }

  /* ---------------- SELECT SCREEN ---------------- */

  function skillById(id) { return window.SKILLS.find((s) => s.id === id); }
  function itemsFor(skill) { return skill.items; }

  // Stable links let another ELC tool open one exact Grammar Hub skill.
  // A valid link deliberately wins over saved selector state; an invalid link
  // leaves the learner's restored selection alone. `start=1` is opt-in so a
  // normal shared link still lands on the selector and shows what was chosen.
  function applyDeepLink() {
    let params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { return false; }
    const id = params.get("skill");
    if (!id) return false;

    const skill = skillById(id);
    if (!skill || !skill.introduced || !itemsFor(skill).length) return false;

    curriculum = "eal";   // stable IDs map to the source-of-truth EAL cells
    rowLevel = {};
    drillTarget = null;
    selectedPools = {};

    if (skill.mode === "pool") {
      mode = "revision";
      selectedPools[skill.category] = true;
    } else {
      const bandIndex = window.BANDS.indexOf(skill.band);
      if (bandIndex < 0) return false;
      mode = params.get("mode") === "revision" ? "revision" : "teaching";
      if (mode === "revision") rowLevel[skill.category] = bandIndex;
      else drillTarget = { category: skill.category, bandIndex };
    }

    return params.get("start") === "1";
  }

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

  /* ---------------- non-EAL (year-level) view ----------------
     Same skills, same sequence, labels a mainstream student understands:
     each strand is chunked however makes sense (Verb Tenses collapses to
     2 chunks, Modality to 1) with year-level tags — NOT the four C-band
     columns, and no curriculum codes on screen. Teaching mode: clicking a
     chunk targets its first cell and the normal cycle (vocab → skill →
     placement) walks the underlying sequence. Revision mode: clicking
     toggles the chunk into the practice queue. */

  function vicChunkList(cat) { return (window.VIC_CHUNKS && window.VIC_CHUNKS[cat]) || []; }
  // The band index a chunk sits at (chunks map 1:1 to cells; the first
  // covered cell decides). The non-EAL view drives the SAME selection state
  // as the EAL grid (rowLevel/drillTarget), so review/stretch, placement and
  // report logic are identical in both views by construction.
  function chunkBandIndex(ch) {
    const sk = chunkSkills(ch)[0];
    return sk ? window.BANDS.indexOf(sk.band) : -1;
  }
  // Student-facing band label: EAL students know the C bands; non-EAL
  // students see neutral step numbers. Teacher exports always keep C bands.
  function bandLabel(i) { return curriculum === "vic" ? "Step " + (i + 1) : window.BANDS[i]; }
  function skillBandLabel(bandName) {
    const i = window.BANDS.indexOf(bandName);
    return i < 0 ? bandName : bandLabel(i);   // pools have band "Pool" — pass through
  }
  function chunkSkills(ch) { return ch.covers.map(skillById).filter((s) => s && s.introduced && s.items.length); }
  function buildVicMatrix(wrap) {
    // A shared year axis (F–10): every chunk is a bar positioned and sized
    // by its year span, so each strand reads as a left-to-right timeline.
    const YEAR_TICKS = ["F", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const head = document.createElement("div");
    head.className = "vic-row vic-yearhead";
    head.innerHTML = `<div class="matrix-cell rowlabel"></div>` +
      YEAR_TICKS.map((y) => `<div class="vic-tick">${y}</div>`).join("");
    wrap.appendChild(head);

    window.CATEGORIES.forEach((cat) => {
      const chunks = vicChunkList(cat);
      if (!chunks.length) return;
      const row = document.createElement("div");
      row.className = "vic-row";

      // Lane assignment: chunks whose year spans overlap (e.g. Plurals at 5
      // inside Subject-verb agreement 3-6) stack in extra lanes under the
      // same strand label instead of wrapping into orphan grid rows.
      const laneOf = {}, laneEnd = [];
      chunks.map((ch, i) => i)
        .sort((a, b) => (chunks[a].y0 || 0) - (chunks[b].y0 || 0))
        .forEach((i) => {
          const y0 = chunks[i].y0 != null ? chunks[i].y0 : 0;
          const y1 = chunks[i].y1 != null ? chunks[i].y1 : 10;
          let l = 0;
          while (l < laneEnd.length && y0 <= laneEnd[l]) l++;
          laneOf[i] = l;
          laneEnd[l] = y1;
        });

      const label = document.createElement("div");
      label.className = "matrix-cell rowlabel";
      label.textContent = cat;
      label.style.gridRow = "1 / span " + (laneEnd.length || 1);
      row.appendChild(label);
      chunks.forEach((ch, idx) => {
        const skills = chunkSkills(ch);
        const n = skills.reduce((t, s) => t + s.items.length, 0);
        const bi = chunkBandIndex(ch);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "matrix-cell vic-chunk" + (n ? " has-items" : " no-items");
        let tag = "";
        if (mode === "teaching") {
          // same semantics as the EAL grid: one target, neighbours included
          const isDT = drillTarget && drillTarget.category === cat && bi === drillTarget.bandIndex;
          const isInc = drillTarget && drillTarget.category === cat && n &&
            (bi === drillTarget.bandIndex - 1 || bi === drillTarget.bandIndex + 1);
          if (isDT) { cell.classList.add("target"); tag = `<span class="drill-tag">teach ▸</span>`; }
          else if (isInc) { cell.classList.add("below"); tag = `<span class="drill-tag">included</span>`; }
          if (n && bi >= 0) cell.addEventListener("click", () => setDrillTarget(cat, bi));
        } else {
          // one selection per strand; the step before comes along as review
          const lvl = rowLevel[cat];
          const isSel = bi === lvl;
          const isReview = lvl !== undefined && bi === lvl - 1 && !!drillableAt(cat, lvl - 1);
          if (isSel) { cell.classList.add("target"); tag = `<span class="drill-tag">practise ▸</span>`; }
          else if (isReview) { cell.classList.add("below"); tag = `<span class="drill-tag">review</span>`; }
          if (n && bi >= 0) cell.addEventListener("click", () => setLevel(cat, bi));
        }
        // year F is grid column 2 (column 1 is the strand label)
        const y0 = ch.y0 != null ? ch.y0 : 0, y1 = ch.y1 != null ? ch.y1 : 10;
        cell.style.gridColumn = (y0 + 2) + " / " + (y1 + 3);
        cell.style.gridRow = String(laneOf[idx] + 1);
        cell.innerHTML =
          `<span class="vic-years">Years ${escapeHtmlE(ch.years)}</span>` +
          `<span class="cell-name">${escapeHtmlE(ch.title)}</span>` +
          (skills.length > 1 ? `<span class="vic-covers">${skills.length} steps inside</span>` : "") +
          (tag || `<span class="cell-count">${n}</span>`);
        row.appendChild(cell);
      });
      wrap.appendChild(row);
    });
    $("matrixLegend").innerHTML =
      `Topics sit where they usually appear in mainstream English, Foundation to Year 10 — work left to right. The practice sequence is the same as the EAL view underneath.`;
  }

  function buildMatrix() {
    const wrap = $("matrix");
    wrap.innerHTML = "";
    if (curriculum === "vic") {   // non-EAL student view: year-level chunks
      buildVicMatrix(wrap);
      buildPools();
      refreshCount();
      refreshReviewBtn();
      persist();
      return;
    }

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
    refreshReviewBtn();
    persist();   // selection changes flow through here
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
      const targets = activeTargets();   // both views drive rowLevel
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

  // Audience toggle: EAL students see the C-level grid; non-EAL (mainstream)
  // students see the same skills chunked with year-level labels. Same
  // sequence and mechanics underneath — only the labels change audience.
  function buildCurricToggle() {
    const wrap = $("curricToggle");
    if (!wrap) return;
    wrap.innerHTML =
      `<button class="filter-btn${curriculum === "eal" ? " active" : ""}" data-c="eal">EAL · C levels</button>` +
      `<button class="filter-btn${curriculum === "vic" ? " active" : ""}" data-c="vic">Non-EAL · year levels</button>`;
    wrap.querySelectorAll(".filter-btn").forEach((b) => {
      b.addEventListener("click", () => {
        curriculum = b.dataset.c;
        buildCurricToggle();
        buildMatrix();   // re-render the grid for the audience; persist() runs in here
        updateToolbar();
        updateTranslateBar();  // dropdown+toggle live only in EAL mode
      });
    });
  }

  function updateToolbar() {
    $("selectAllBtn").style.display = mode === "revision" ? "" : "none";
    if (curriculum === "vic") {
      $("helpText").innerHTML = mode === "teaching"
        ? `Topics run left to right, Foundation to Year 10. Click one to learn it: key words first, worked examples, then practice — the topic before comes along as review and the next one as stretch.`
        : `Click the topic you want to practise — one per row, and the topic before it comes along as <b>review</b>. Pick topics in as many rows as you like, then start.`;
      return;
    }
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
      // revision queue: EAL view uses the cell selection; non-EAL view uses
      // the selected year-level chunks (all steps inside each chunk).
      const targets = activeTargets();   // both views drive rowLevel
      targets.forEach((skill) => {
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
    setTranslateMode("unit");
    const g = goalFor(target);
    const hasVocab = g.terms.length > 0;
    $("preteachPhase").textContent = "Learning goals";
    $("preteachProgress").textContent = `${target.category} · ${skillBandLabel(target.band)} · ${target.name}`;
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
    $("preteachNextBtn").disabled = false;
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
    setTranslateMode("unit");  // learning a word — translating the definition helps here
    $("preteachPhase").textContent = "Vocabulary · I do";
    $("preteachProgress").textContent = `Word ${vocabIdx + 1} of ${total}`;
    $("preteachBar").style.width = Math.round(10 + ((vocabIdx + 1) / total) * 35) + "%";
    $("preteachContent").innerHTML =
      `<div class="teach-phase">Learn this word</div>` +
      `<div class="teach-term">${escapeHtmlE(v.term)}</div>` +
      `<div class="teach-def">${linkifyGlossary(escapeHtmlE(v.def))}</div>` +
      `<div class="teach-example">${v.example}</div>`;
    $("preteachNextBtn").style.display = "";
    $("preteachNextBtn").disabled = false;
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
    setTranslateMode("block"); // this IS the word-meaning test — no translating the answer
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
      `<div class="teach-feedback" id="metaFeedback" aria-live="polite"></div>`;
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

  /* ---------------- METALANGUAGE: select a clause inside a full sentence ----
     The whole sentence is shown as word chips and the learner must select
     EVERY word of the part asked for, then press Check — sometimes one
     clause, sometimes the other, with the clause at the start in some items
     and at the end in others. No bucket label to word-match against and no
     single lucky tap: you have to know where the clause begins AND ends.
     Punctuation chips are inert and never part of the answer.
     Data (per cell): clausePick { labels:{find:label}, hints:{find:hint},
       modelled:[{words,find,span,explain}], items:[{words,find,span}] } */

  function clauseLabel(cp, find) { return (cp.labels && cp.labels[find]) || find; }
  function clauseShort(cp, find) { return clauseLabel(cp, find).replace(/\s*\(.*\)\s*$/, "").toLowerCase(); }
  function clauseHint(cp, find) { return (cp.hints && cp.hints[find]) || ""; }
  function isPunct(w) { return /^[,.;:!?]+$/.test(w); }
  function clauseRequired(item) {
    const req = new Set();
    for (let j = item.span[0]; j <= item.span[1]; j++) if (!isPunct(item.words[j])) req.add(j);
    return req;
  }

  function startClauseIDo() {
    teachPhase = "cl-ido";
    clIdoIdx = 0;
    renderClauseIDo();
  }

  function renderClauseIDo() {
    setTranslateMode("word");
    const cp = targetCell().clausePick;
    const m = cp.modelled[clIdoIdx];
    const total = cp.modelled.length;
    $("preteachPhase").textContent = "Clauses · I do";
    $("preteachProgress").textContent = `Example ${clIdoIdx + 1} of ${total}`;
    $("preteachBar").style.width = Math.round(12 + ((clIdoIdx + 1) / total) * 22) + "%";
    const chips = m.words.map((w, i) => isPunct(w)
      ? `<span class="clause-punct">${escapeHtmlE(w)}</span>`
      : `<span class="clause-word${i >= m.span[0] && i <= m.span[1] ? " correct" : ""}">${escapeHtmlE(w)}</span>`).join("");
    $("preteachContent").innerHTML =
      `<div class="teach-phase">Watch me find the whole thing</div>` +
      `<div class="clause-ask">Find ${clauseLabel(cp, m.find)} — every word of it.</div>` +
      `<div class="clause-sentence">${chips}</div>` +
      `<div class="teach-feedback good">${escapeHtmlE(m.explain)}</div>`;
    const btn = $("preteachNextBtn");
    btn.style.display = ""; btn.disabled = false;
    btn.textContent = clIdoIdx < total - 1 ? "Next example" : "Your turn (We do)";
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
    setTranslateMode("word");
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
    // The big button becomes the Check gate: enabled once something is selected.
    const btn = $("preteachNextBtn");
    btn.style.display = ""; btn.textContent = "Check"; btn.disabled = true;
    const chips = item.words.map((w, i) => isPunct(w)
      ? `<span class="clause-punct">${escapeHtmlE(w)}</span>`
      : `<button type="button" class="clause-word" data-i="${i}">${escapeHtmlE(w)}</button>`).join("");
    $("preteachContent").innerHTML =
      `<div class="teach-phase">${youdo ? "Find it yourself" : "Now you try"}</div>` +
      `<div class="clause-ask">Select <b>every word</b> of ${clauseLabel(cp, item.find)}, then Check.</div>` +
      `<div class="clause-sentence" id="clauseRow">${chips}</div>` +
      `<div class="teach-feedback" id="clauseFb" aria-live="polite"></div>` +
      `<div class="sort-streak" id="clauseStreak">${youdo ? `Correct in a row: ${clauseStreak} / ${YOUDO_TARGET}` : ``}</div>`;
    $("clauseRow").querySelectorAll(".clause-word").forEach((w) => w.addEventListener("click", () => {
      w.classList.toggle("sel");
      btn.disabled = !$("clauseRow").querySelector(".clause-word.sel");
    }));
  }

  function checkClauseSelection() {
    const youdo = teachPhase === "cl-youdo";
    const cp = targetCell().clausePick;
    const item = clauseBank[clauseIdx];
    const row = $("clauseRow"), fb = $("clauseFb");
    const required = clauseRequired(item);
    const chips = Array.from(row.querySelectorAll(".clause-word"));
    const selected = chips.filter((c) => c.classList.contains("sel")).map((c) => +c.dataset.i);
    const wrong = selected.filter((i) => !required.has(i));

    if (wrong.length === 0 && selected.length === required.size) {
      chips.forEach((c) => {
        c.disabled = true;
        if (required.has(+c.dataset.i)) { c.classList.remove("sel"); c.classList.add("correct"); }
      });
      fb.className = "teach-feedback good";
      fb.textContent = `✓ Yes — that's ${clauseShort(cp, item.find)}, the whole thing.`;
      $("preteachNextBtn").disabled = true;
      if (youdo) {
        clauseStreak++;
        const s = $("clauseStreak"); if (s) s.textContent = `Correct in a row: ${clauseStreak} / ${YOUDO_TARGET}`;
        if (clauseStreak >= YOUDO_TARGET) { setTimeout(startSkillPreteach, 950); return; }
      }
      setTimeout(() => {
        clauseIdx++;
        if (!youdo && clauseIdx >= clauseBank.length) { startClauseYouDo(); return; }
        renderClausePick();
      }, 950);
    } else if (wrong.length) {
      // Flash and drop the wrong picks, keep the right ones — no answer reveal.
      wrong.forEach((i) => {
        const c = chips.find((x) => +x.dataset.i === i);
        c.classList.add("incorrect"); c.classList.remove("sel");
      });
      fb.className = "teach-feedback bad";
      fb.innerHTML = `Not quite — the red words aren't part of it. ${escapeHtmlE(clauseHint(cp, item.find))} Adjust and Check again.`;
      if (youdo) {
        clauseStreak = 0;   // "correct in a row" means exactly that
        const s = $("clauseStreak"); if (s) s.textContent = `Correct in a row: ${clauseStreak} / ${YOUDO_TARGET}`;
      }
      setTimeout(() => chips.forEach((c) => c.classList.remove("incorrect")), 1200);
      $("preteachNextBtn").disabled = !row.querySelector(".clause-word.sel");
    } else {
      fb.className = "teach-feedback bad";
      fb.textContent = "You've found part of it — the clause has more words. Keep going.";
      if (youdo) {
        clauseStreak = 0;
        const s = $("clauseStreak"); if (s) s.textContent = `Correct in a row: ${clauseStreak} / ${YOUDO_TARGET}`;
      }
    }
  }

  function startSkillPreteach() {
    teachPhase = "skill";
    setTranslateMode("unit");
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
        <span class="preteach-band">${skillBandLabel(s.band)}</span>
        <span class="preteach-label ${cls}">${label}</span>
        <div class="preteach-name">${linkifyGlossary(escapeHtmlE(s.name))}</div>
        <div class="preteach-example">"${escapeHtmlE(s.example)}"</div>
        ${linksRow}
      </div>`;
    }).join("");

    $("preteachContent").innerHTML = banner + goalLine + workedHtml + cardsHead + cards;
    $("preteachNextBtn").style.display = "";
    $("preteachNextBtn").disabled = false;
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
    } else if (teachPhase === "cl-wedo" || teachPhase === "cl-youdo") {
      checkClauseSelection();   // the button is the Check gate in these phases
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
    setTranslateMode("word");
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
    $("preteachNextBtn").disabled = false;
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
    setTranslateMode("word");
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

    // Zones are real buttons: you can drag the tile onto them OR just tap/press
    // one to place the tile there — so the task works with keyboard and touch,
    // not only pointer drag.
    const zonesHtml = sort.zones.map((z) =>
      `<button type="button" class="zone" data-zone="${escapeHtmlE(z)}" aria-label="Put “${escapeHtmlE(item.text)}” in ${escapeHtmlE(z)}"><span class="zone-label">${escapeHtmlE(z)}</span></button>`).join("");
    $("preteachContent").innerHTML =
      `<div class="teach-phase">${youdo ? "Sort it yourself" : "Now you try"}</div>` +
      `<div class="sort-prompt">${escapeHtmlE(sort.prompt)}</div>` +
      `<div class="sort-stage"><span class="sort-tile" id="sortTile">${escapeHtmlE(item.text)}</span></div>` +
      `<div class="sort-help">Drag the word into a box, or tap a box to put it there.</div>` +
      `<div class="zones" id="sortZones">${zonesHtml}</div>` +
      `<div class="teach-feedback" id="sortFeedback" aria-live="polite"></div>` +
      `<div class="sort-streak" id="sortStreak">${youdo ? `Correct in a row: ${sortStreak} / ${YOUDO_TARGET}` : ``}</div>`;

    $("sortZones").querySelectorAll(".zone").forEach((z) =>
      z.addEventListener("click", () => { if ($("sortTile").dataset.placed !== "true") onSortDrop(z, $("sortTile"), item); }));
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
        if (sortStreak >= YOUDO_TARGET) { setTimeout(startSkillPreteach, 950); return; }
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
      if (youdo) {
        sortStreak = 0;     // wrong answer breaks the run
        const sEl = $("sortStreak"); if (sEl) sEl.textContent = `Correct in a row: ${sortStreak} / ${YOUDO_TARGET}`;
      }
    }
  }

  /* ---------------- SHOW ITEM (task screen) ---------------- */

  function showItem() {
    graded = false;
    const entry = currentSet[idx];
    const type = window.TASK_TYPES[entry.item.type] || window.TASK_TYPES.produce;
    // items testing a word's meaning opt out of translation (options never
    // translate anyway; this also locks the prompt/stimulus).
    setTranslateMode(entry.item.noTranslate ? "block" : "word");

    const promptText = entry.item.prompt || type.label;
    const recognition = entry.item.type === "identify" || entry.item.type === "choose";
    $("promptText").innerHTML = recognition
      ? escapeHtmlE(promptText)
      : linkifyGlossary(escapeHtmlE(promptText));
    const tagText = recognition
      ? `${entry.category} · ${skillBandLabel(entry.band)}`
      : `${entry.category} · ${skillBandLabel(entry.band)} · ${entry.skillName}`;
    $("skillTag").innerHTML = linkifyGlossary(escapeHtmlE(tagText));

    // Land keyboard / screen-reader users on the new question. A type's wire()
    // may then move focus to its input (e.g. gapfill), which is what we want.
    $("promptText").setAttribute("tabindex", "-1");
    $("promptText").focus();

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
        msg = `Outstanding! You mastered all three levels. Moving to ${bandLabel(jump2)} with a review of ${bandLabel(bandIndex + 1)} first.`;
      } else if (jump1 !== null) {
        nextBand = jump1;
        msg = `Excellent! You mastered everything. Moving up to ${bandLabel(jump1)}.`;
      } else {
        nextBand = null;
        msg = `You've mastered the whole strand! Nothing higher to practise.`;
      }
    } else if (!belowOk) {
      // failed the level below — drop down
      const dropTo = bandIndex - 1;
      if (dropTo >= 0 && drillableAt(category, dropTo)) {
        nextBand = dropTo;
        msg = `Let's strengthen the foundation. Dropping to ${bandLabel(dropTo)} to build up from there.`;
      } else {
        nextBand = bandIndex;
        msg = `Some tricky spots. Let's try this level again with the preteach.`;
      }
    } else if (belowOk && targetOk && !aboveOk) {
      // beat target but not above — move up one
      const up = nextDrillableAbove(category, bandIndex);
      if (up !== null) {
        nextBand = up;
        msg = `Great work on ${bandLabel(bandIndex)}! Moving to ${bandLabel(up)} — you'll get the vocabulary and skill preteach first.`;
      } else {
        nextBand = null;
        msg = `Almost there! You've reached the top of the strand.`;
      }
    } else {
      // target not mastered — stay
      nextBand = bandIndex;
      msg = `Nearly there. Let's have another go at ${bandLabel(bandIndex)} with a refresher.`;
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
        <span class="skill-name">${escapeHtmlE(`${s.cat} · ${skillBandLabel(s.band)} · ${s.name}`)}</span>
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
      window.BANDS.map((b, i) => `<div class="matrix-cell colhead">${bandLabel(i)}</div>`).join("") + `</div>`;
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
      contBtn.textContent = `Continue to ${bandLabel(nextBand)}`;
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
    recordHistory(bySkill);
    drawWritingCard(bySkill, "placementWriting");
    buildTeacherExport(firstRight, total, totalAttempts, bySkill);

    // reflect the placement move (drillTarget was advanced) in saved state
    if (savedName) { const e = $("studentNameP"); if (e) e.value = savedName; }
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
                <span class="skill-name">${linkifyGlossary(escapeHtmlE(`${s.cat} · ${skillBandLabel(s.band)} · ${s.name}`))}</span>
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
    recordHistory(bySkill);
    drawWritingCard(bySkill, "reportWriting");
    buildTeacherExport(firstRight, total, totalAttempts, bySkill);
  }

  function runReportReveal() {
    const sections = [
      document.querySelector("#reportScreen h3"),
      $("reportRubricHint"), $("reportRubric"), $("reportRubricLegend"),
      $("reportRemediation"), $("reportSkills"), $("reportWriting"),
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
      window.BANDS.map((b, i) => `<div class="matrix-cell colhead">${bandLabel(i)}</div>`).join("");
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
  // Name + note live on both the report and placement screens; read/write
  // whichever exists so the exports work from either.
  function studentName() {
    const a = $("studentName"), b = $("studentNameP"), c = $("studentNameR");
    return ((a && a.value.trim()) || (b && b.value.trim()) || (c && c.value.trim()) || savedName || "");
  }
  function studentCode() {
    const c = $("studentCodeR");
    return ((c && c.value.trim()) || savedCode || "");
  }

  /* ---------------- persistence ---------------- */
  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        v: 1, name: studentName(), code: savedCode, mode, curric: curriculum, rowLevel, drillTarget, selectedPools, history, writings,
      }));
    } catch (e) { /* private mode / quota — carry on without saving */ }
  }
  function restoreState() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch (e) { s = null; }
    if (!s || s.v !== 1) return;
    if (s.mode === "teaching" || s.mode === "revision") mode = s.mode;
    if (s.curric === "eal" || s.curric === "vic") curriculum = s.curric;
    if (s.rowLevel && typeof s.rowLevel === "object") rowLevel = s.rowLevel;
    if (s.drillTarget && typeof s.drillTarget === "object") drillTarget = s.drillTarget;
    if (s.selectedPools && typeof s.selectedPools === "object") selectedPools = s.selectedPools;
    if (Array.isArray(s.history)) history = s.history;
    if (Array.isArray(s.writings)) writings = s.writings;
    if (typeof s.name === "string") savedName = s.name;
    if (typeof s.code === "string") savedCode = s.code;
    // drop anything that no longer matches the current rubric (content may have moved)
    Object.keys(rowLevel).forEach((cat) => {
      if (!window.CATEGORIES.includes(cat) || !(rowLevel[cat] >= 0 && rowLevel[cat] < window.BANDS.length)) delete rowLevel[cat];
    });
    if (drillTarget && (!window.CATEGORIES.includes(drillTarget.category) ||
        !(drillTarget.bandIndex >= 0 && drillTarget.bandIndex < window.BANDS.length))) drillTarget = null;
    Object.keys(selectedPools).forEach((cat) => { if (!(window.POOLS || []).includes(cat)) delete selectedPools[cat]; });
  }
  function recordHistory(bySkill) {
    const date = todayStr();
    Object.entries(bySkill).forEach(([id, s]) => history.push({ date, skillId: id, right: s.right, total: s.total }));
    if (history.length > 500) history = history.slice(-500);   // cap growth
    persist();
  }
  function clearSaved() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    rowLevel = {}; drillTarget = null; selectedPools = {}; history = []; writings = []; savedName = ""; savedCode = "";
    const a = $("studentName"), b = $("studentNameP");
    if (a) a.value = ""; if (b) b.value = "";
    ["studentNameR", "studentCodeR"].forEach((id) => { const el = $(id); if (el) el.value = ""; });
    setCopyNote("");
    buildMatrix();
  }

  /* ---------------- smart review (uses saved history) ---------------- */
  // Aggregate first-try history per skill and rank the weakest (progression
  // cells that are still drillable), lowest success rate first.
  function skillWeakness() {
    const agg = {};
    history.forEach((h) => { const a = agg[h.skillId] = agg[h.skillId] || { right: 0, total: 0 }; a.right += h.right; a.total += h.total; });
    return Object.entries(agg)
      .map(([id, a]) => ({ id, ratio: a.total ? a.right / a.total : 1, total: a.total }))
      .filter((x) => {
        if (!(x.total > 0) || x.ratio >= 1) return false;
        const sk = skillById(x.id);
        return sk && sk.mode === "progression" && sk.introduced && itemsFor(sk).length;
      })
      .sort((a, b) => a.ratio - b.ratio);
  }
  function refreshReviewBtn() {
    const btn = $("reviewWeakBtn");
    if (!btn) return;
    const n = skillWeakness().length;
    btn.style.display = n ? "" : "none";
    btn.textContent = `Review what you missed (${Math.min(n, 4)})`;
  }
  // Queue the (up to 4) weakest cells as a revision session and start it.
  // Works in both views: EAL selects the cells, non-EAL selects the chunks
  // that contain them (the revision queue reads whichever the view uses).
  function reviewWeakest() {
    const weak = skillWeakness().slice(0, 4);
    if (!weak.length) return;
    mode = "revision"; drillTarget = null; rowLevel = {}; selectedPools = {};
    weak.forEach((w) => {
      const sk = skillById(w.id);
      const bi = window.BANDS.indexOf(sk.band);
      if (bi >= 0) rowLevel[sk.category] = bi;   // one band per strand (revision model)
    });
    buildModeToggle(); updateToolbar(); buildMatrix();
    if (Object.keys(rowLevel).length) startSession();
  }
  /* ---------------- writing prompts (data/prompts.js) ---------------- */
  // A short optional writing task at the end of a session, aimed at what the
  // student most needs to consolidate. Revision mode targets the 1–3 weakest
  // cells across saved history; a teaching cycle targets the cell(s) just
  // drilled, shakiest first. Never scored — the response is saved so it shows
  // in the report and teacher export, nothing more.
  function writingTargets(bySkill) {
    if (mode === "revision") {
      const weak = skillWeakness().slice(0, 3).map((w) => w.id);
      if (weak.length) return weak;
    }
    return Object.entries(bySkill)
      .filter(([id]) => { const sk = skillById(id); return sk && sk.mode === "progression"; })
      .sort((a, b) => (a[1].right / a[1].total) - (b[1].right / b[1].total))
      .slice(0, 3).map(([id]) => id);
  }
  // Best prompt = covers as many target cells as possible without dragging in
  // cells the student doesn't need: one weak cell → a single-skill prompt for
  // it; two or three shared weaknesses → a prompt that hits them together.
  function pickPrompt(targets, excludeId) {
    const bank = window.WRITING_PROMPTS || [];
    if (!bank.length || !targets.length) return null;
    const W = new Set(targets);
    const scored = [];
    bank.forEach((p) => {
      const cover = p.skills.filter((s) => W.has(s)).length;
      if (!cover) return;
      const stray = p.skills.length - cover;
      scored.push({ p, score: cover * 2 - stray + (p.skills.includes(targets[0]) ? 1 : 0) });
    });
    if (!scored.length) return null;
    // "different prompt" drops the current one first, so it falls through to
    // the next-best tier instead of dealing the same card again
    const pool2 = scored.filter((x) => x.p.id !== excludeId);
    const use = pool2.length ? pool2 : scored;
    const top = use.reduce((m, x) => Math.max(m, x.score), -Infinity);
    const cands = use.filter((x) => x.score === top);
    return cands[Math.floor(Math.random() * cands.length)].p;
  }
  let writingPrompt = null, writingTargetIds = [];
  function drawWritingCard(bySkill, elId) {
    const el = $(elId);
    if (!el) return;
    writingTargetIds = writingTargets(bySkill);
    writingPrompt = pickPrompt(writingTargetIds, null);
    renderWritingCard(el);
  }
  function renderWritingCard(el) {
    const p = writingPrompt;
    if (!p) { el.innerHTML = ""; return; }
    const saved = writings.find((w) => w.promptId === p.id);
    const names = p.skills.map((id) => { const sk = skillById(id); return sk ? `${sk.name} (${skillBandLabel(sk.band)})` : id; });
    el.innerHTML = `<div class="writing-card">
        <h3>✍️ ${escapeHtmlE(p.title)}</h3>
        <div class="wp-meta">Optional writing task · ${escapeHtmlE(p.time)} · practises ${escapeHtmlE(names.join(" + "))}</div>
        <div class="wp-prompt">${escapeHtmlE(p.prompt)}</div>
        <ul class="wp-checks">${p.checks.map((c) => `<li>${escapeHtmlE(c)}</li>`).join("")}</ul>
        <textarea data-wp-text placeholder="Type it here if you like — it goes on your report so your teacher can read it. Or write it on paper instead.">${escapeHtmlE(saved ? saved.text : "")}</textarea>
        <div class="wp-foot">
          <button class="btn btn-ghost" type="button" data-wp-shuffle>Try a different prompt</button>
          <span class="wp-note" data-wp-note>${saved && saved.text ? "Saved on this device ✓" : "Nothing here is marked — this is practice, not a test."}</span>
        </div>
      </div>`;
    el.querySelector("[data-wp-shuffle]").addEventListener("click", () => {
      writingPrompt = pickPrompt(writingTargetIds, p.id);
      renderWritingCard(el);
    });
    el.querySelector("[data-wp-text]").addEventListener("input", (e) => {
      const text = e.target.value;
      const cur = writings.find((w) => w.promptId === p.id);
      if (cur) { cur.text = text; cur.date = todayStr(); }
      else writings.push({ date: todayStr(), promptId: p.id, text });
      while (writings.length > 20) writings.shift();
      persist();
      const n = el.querySelector("[data-wp-note]");
      if (n) n.textContent = "Saved on this device ✓";
      if (lastReport) buildTeacherExport(lastReport.firstRight, lastReport.total, lastReport.totalAttempts, lastReport.bySkill);
    });
  }

  function setCopyNote(msg) {
    ["copyNote", "copyNoteP"].forEach((id) => { const el = $(id); if (el) el.textContent = msg; });
  }
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
      setCopyNote("CSV downloaded.");
    } catch (e) {
      navigator.clipboard.writeText(csv)
        .then(() => { setCopyNote("Download blocked — CSV text copied to clipboard instead. Paste into a text file and save as .csv."); })
        .catch(() => { setCopyNote("Download failed. Use 'Copy row for sheet' instead."); });
    }
  }
  function copyTsv() {
    const tsv = buildTsvRow(); if (!tsv) return;
    navigator.clipboard.writeText(tsv)
      .then(() => { setCopyNote("Row copied — paste into your sheet or form."); })
      .catch(() => { setCopyNote("Copy failed — try Download CSV instead."); });
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
    const written = writings.filter((w) => w.text && w.text.trim());
    if (written.length) {
      t += `\nWriting tasks (optional, unmarked):\n`;
      written.slice(-3).forEach((w) => {
        const p = (window.WRITING_PROMPTS || []).find((x) => x.id === w.promptId);
        t += `  ${w.date} · ${p ? p.title : w.promptId}${p ? ` (${p.skills.join(", ")})` : ""}\n`;
        t += `    "${w.text.trim()}"\n`;
      });
    }
    t += `\nItem log:\n`;
    log.forEach((r) => { t += `  [r${r.round}] (${r.type}) ${r.skill} — "${r.response}" → ${r.result}\n`; });
    teacherText = t;
  }

  function copyTeacher() {
    if (!teacherText) return;
    navigator.clipboard.writeText(teacherText)
      .then(() => { setCopyNote("Copied to clipboard."); })
      .catch(() => { setCopyNote("Copy failed — select the report text manually."); });
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

  /* ================= EAL TRANSLATE =================
     One word or sentence at a time. In EAL mode a language dropdown and a
     Translate toggle sit in the top bar. With the toggle on, tapping a
     translatable unit — a grid cell name, the prompt, a stimulus sentence,
     an instruction cue, or a taught word/definition — swaps its English for
     the chosen language; tapping it again flips straight back. Nothing is
     stored: every re-render is English again, and only the chosen language
     is remembered between visits.

     It is deliberately blocked where a word's MEANING is being tested — the
     vocab "you do" check and any item flagged noTranslate — and answer
     options are never translatable, so it can never hand over an answer.

     PROVIDER: defaults to the free, key-less MyMemory endpoint so it works
     from a plain static page today. For production — and to keep student
     text inside the school's own Microsoft tenant — swap the body of
     translateProvider for a fetch to an Azure Translator function. Nothing
     else changes. Tests override window.GH_TRANSLATE.provider. */

  const TR_LANGS = [
    { code: "ar", label: "Arabic" }, { code: "zh-CN", label: "Chinese (Simplified)" },
    { code: "zh-TW", label: "Chinese (Traditional)" }, { code: "yue", label: "Cantonese" },
    { code: "vi", label: "Vietnamese" }, { code: "fa", label: "Dari / Persian" },
    { code: "ps", label: "Pashto" }, { code: "hi", label: "Hindi" },
    { code: "pa", label: "Punjabi" }, { code: "ur", label: "Urdu" },
    { code: "ta", label: "Tamil" }, { code: "bn", label: "Bengali" },
    { code: "ne", label: "Nepali" }, { code: "my", label: "Burmese" },
    { code: "th", label: "Thai" }, { code: "km", label: "Khmer" },
    { code: "id", label: "Indonesian" }, { code: "tl", label: "Filipino" },
    { code: "ms", label: "Malay" }, { code: "so", label: "Somali" },
    { code: "sw", label: "Swahili" }, { code: "am", label: "Amharic" },
    { code: "tr", label: "Turkish" }, { code: "es", label: "Spanish" },
    { code: "pt", label: "Portuguese" }, { code: "fr", label: "French" },
    { code: "ru", label: "Russian" }, { code: "ko", label: "Korean" },
    { code: "ja", label: "Japanese" },
  ];
  // Text a student may tap to translate. Deliberately excludes every answer
  // surface (options, sort zones, clause word-chips) so it can't reveal an
  // answer, and anything holding a form field (handled again at tap time).
  const TR_UNIT_SEL = ".cell-name,.vic-chunk,.rowlabel,#promptText,.stimulus,.cue," +
                      ".teach-def,.teach-example,.teach-term," +          // vocab teach
                      ".li-text,.sc-goal,.term-chip," +                   // learning goals
                      ".sort-prompt,.sort-help,.sort-tile,.clause-ask";   // sort / clause
  const TR_BLOCK_SEL = ".options,.choose-options,.order-bank,.edit-bank,.match-grid," +
                       ".vocab-opts,.zones,.clause-sentence,[data-no-tr]";

  let translateOn = false;
  let translateLang = "";
  const trCache = new Map();          // `${lang} ${text}` -> translation (session only)
  const trOriginal = new WeakMap();   // element -> original innerHTML
  // Only ONE thing is ever shown translated at a time. In teaching screens a
  // whole unit translates (trCurrentUnit); in question screens only a single
  // tapped word translates (trWordSpan). Tapping something new reverts the last.
  let trCurrentUnit = null;
  let trWordSpan = null;

  async function translateProvider(text, target) {
    const url = "https://api.mymemory.translated.net/get?q=" +
                encodeURIComponent(text) + "&langpair=en|" + encodeURIComponent(target);
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const t = data && data.responseData && data.responseData.translatedText;
    if (!t || (data.responseStatus && +data.responseStatus !== 200)) throw new Error("no translation");
    return String(t);
  }
  window.GH_TRANSLATE = window.GH_TRANSLATE || {};
  if (!window.GH_TRANSLATE.provider) window.GH_TRANSLATE.provider = translateProvider;

  function updateTranslateBar() {
    const bar = $("translateBar");
    if (!bar) return;
    const eal = curriculum === "eal";
    bar.hidden = !eal;
    document.body.classList.toggle("tbar-space", eal);
    if (!eal && translateOn) {          // leaving EAL turns the tool off
      translateOn = false;
      document.body.classList.remove("tr-on");
      revertAll();
      syncTranslateToggle();
    }
  }
  // Mode per screen, set by the render paths:
  //   "unit"  teaching screens — tap translates a whole word/sentence
  //   "word"  question / assessed screens — tap translates ONE word only, so a
  //           student can't translate a whole sentence into the answer
  //   "block" word-meaning test — no translation at all
  function setTranslateMode(mode) {
    const b = document.body;
    b.classList.toggle("tr-block", mode === "block");
    b.classList.toggle("tr-word", mode === "word");
    revertAll();                         // never carry a translation across screens
    syncTranslateToggle();
    const note = $("transNote");
    if (note) note.textContent = translateHint();
  }
  function translateHint() {
    if (!translateOn) return "";
    const b = document.body;
    if (b.classList.contains("tr-block")) return "Translation is off for this question";
    if (b.classList.contains("tr-word")) return "Tap a single word to translate it";
    return "Tap any word or sentence — one at a time";
  }
  function syncTranslateToggle() {
    const btn = $("transToggle");
    if (!btn) return;
    const blocked = document.body.classList.contains("tr-block");
    btn.disabled = blocked;
    btn.classList.toggle("on", translateOn && !blocked);
    btn.setAttribute("aria-pressed", String(translateOn && !blocked));
    btn.textContent = translateOn ? "Translate: on" : "Translate";
  }
  function translatableUnit(el, wordMode) {
    if (!el || !el.closest) return null;
    let unit = el.closest(TR_UNIT_SEL);
    if (!unit) {                        // tapping anywhere on a grid cell targets its name
      const cell = el.closest(".matrix-cell");
      if (cell) unit = cell.querySelector(".cell-name");
    }
    if (!unit) return null;
    if (unit.closest(TR_BLOCK_SEL)) return null;
    // Whole-unit mode replaces textContent, so refuse anything holding a form
    // field. Word mode only wraps the tapped word, so a blank is safe there.
    if (!wordMode && unit.querySelector("input,select,textarea")) return null;
    if (!(unit.textContent || "").trim()) return null;
    return unit;
  }

  /* --- teaching mode: translate a whole unit, one at a time --- */
  async function toggleUnit(unit) {
    if (unit.classList.contains("tr-loading")) return;
    if (trOriginal.has(unit)) { revertUnit(); return; }   // tap again = English
    if (!translateLang) { flashTransNote("Pick a language first"); return; }
    revertUnit(); revertWord();                            // one thing at a time
    const source = (unit.textContent || "").trim();
    trOriginal.set(unit, unit.innerHTML);
    trCurrentUnit = unit;
    unit.classList.add("tr-loading");
    try {
      const key = translateLang + " " + source;
      let out = trCache.get(key);
      if (out == null) { out = await window.GH_TRANSLATE.provider(source, translateLang); trCache.set(key, out); }
      if (trCurrentUnit !== unit) return;                 // reverted mid-fetch
      unit.textContent = out;
      unit.classList.remove("tr-loading");
      unit.classList.add("tr-done");
    } catch (e) {
      if (trOriginal.has(unit)) { unit.innerHTML = trOriginal.get(unit); trOriginal.delete(unit); }
      if (trCurrentUnit === unit) trCurrentUnit = null;
      unit.classList.remove("tr-loading");
      flashTransNote("Translation unavailable");
    }
  }
  function revertUnit() {
    const u = trCurrentUnit;
    trCurrentUnit = null;
    if (u && trOriginal.has(u)) { u.innerHTML = trOriginal.get(u); trOriginal.delete(u); }
    if (u) u.classList.remove("tr-done", "tr-loading");
  }

  /* --- question mode: translate only the single tapped word, one at a time --- */
  function wordAtPoint(x, y) {
    let range = null;
    if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(x, y);
    else if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      if (p) { range = document.createRange(); range.setStart(p.offsetNode, p.offset); }
    }
    if (!range) return null;
    const node = range.startContainer;
    if (!node || node.nodeType !== 3) return null;        // text node only
    const text = node.data;
    const isW = (c) => c != null && !/[\s.,!?;:"“”‘’()\[\]{}]/.test(c);
    let i = range.startOffset;
    if (i >= text.length) i = text.length - 1;
    if (i > 0 && !isW(text[i])) i--;
    if (i < 0 || !isW(text[i])) return null;
    let s = i, e = i + 1;
    while (s > 0 && isW(text[s - 1])) s--;
    while (e < text.length && isW(text[e])) e++;
    const word = text.slice(s, e);
    return word.trim() ? { node, s, e, word } : null;
  }
  async function translateWordAt(x, y) {
    if (!translateLang) { flashTransNote("Pick a language first"); return; }
    // tapping the word that's already translated flips it back to English
    if (trWordSpan) {
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === trWordSpan || trWordSpan.contains(hit))) { revertWord(); return; }
    }
    revertWord(); revertUnit();                           // one thing at a time
    const info = wordAtPoint(x, y);
    if (!info) return;
    info.node.splitText(info.e);
    const mid = info.node.splitText(info.s);              // node | mid(word) | after
    const span = document.createElement("span");
    span.className = "tr-word-live tr-loading";
    span.dataset.en = info.word;
    span.textContent = info.word;
    mid.parentNode.replaceChild(span, mid);
    trWordSpan = span;
    try {
      const key = translateLang + " " + info.word;
      let out = trCache.get(key);
      if (out == null) { out = await window.GH_TRANSLATE.provider(info.word, translateLang); trCache.set(key, out); }
      if (trWordSpan !== span) return;
      span.textContent = out;
      span.classList.remove("tr-loading");
      span.classList.add("tr-done");
    } catch (e) {
      if (trWordSpan === span) revertWord();
      flashTransNote("Translation unavailable");
    }
  }
  function revertWord() {
    const sp = trWordSpan;
    trWordSpan = null;
    if (sp && sp.parentNode) {
      const parent = sp.parentNode;
      sp.replaceWith(document.createTextNode(sp.dataset.en != null ? sp.dataset.en : sp.textContent));
      parent.normalize();
    }
  }

  function revertAll() {
    revertWord();
    revertUnit();
    // defensive sweep for anything left translated after a re-render
    document.querySelectorAll(".tr-word-live").forEach((sp) => {
      if (sp.parentNode) { const p = sp.parentNode; sp.replaceWith(document.createTextNode(sp.dataset.en != null ? sp.dataset.en : sp.textContent)); p.normalize(); }
    });
    document.querySelectorAll(".tr-done,.tr-loading").forEach((u) => {
      if (trOriginal.has(u)) { u.innerHTML = trOriginal.get(u); trOriginal.delete(u); }
      u.classList.remove("tr-done", "tr-loading");
    });
  }
  function flashTransNote(msg) {
    const note = $("transNote");
    if (!note) return;
    note.textContent = msg;
    clearTimeout(flashTransNote._t);
    flashTransNote._t = setTimeout(() => {
      const note2 = $("transNote");
      if (note2) note2.textContent = translateHint();
    }, 2400);
  }
  function initTranslate() {
    const bar = $("translateBar");
    if (!bar) return;
    const sel = $("transLang");
    const btn = $("transToggle");
    sel.innerHTML = `<option value="">Language…</option>` +
      TR_LANGS.map((l) => `<option value="${l.code}">${escapeHtmlE(l.label)}</option>`).join("");
    try { const saved = localStorage.getItem("gh_tr_lang"); if (saved) { translateLang = saved; sel.value = saved; } } catch (e) {}
    sel.addEventListener("change", () => {
      translateLang = sel.value;
      try { localStorage.setItem("gh_tr_lang", translateLang); } catch (e) {}
      revertAll();                       // a new language clears anything on screen
    });
    btn.addEventListener("click", () => {
      if (document.body.classList.contains("tr-block")) return;
      translateOn = !translateOn;
      document.body.classList.toggle("tr-on", translateOn);
      if (!translateOn) revertAll();
      syncTranslateToggle();
      const note = $("transNote");
      if (note) note.textContent = translateHint();
    });
    // capture phase: intercept before the cell / option handlers so a tap
    // translates instead of selecting, and reverting can't leak an action.
    document.addEventListener("click", (e) => {
      if (!translateOn || document.body.classList.contains("tr-block")) return;
      if (e.target.closest("#translateBar")) return;
      const wordMode = document.body.classList.contains("tr-word");
      const unit = translatableUnit(e.target, wordMode);
      if (!unit) return;
      e.preventDefault();
      e.stopPropagation();
      if (wordMode) translateWordAt(e.clientX, e.clientY);
      else toggleUnit(unit);
    }, true);
    syncTranslateToggle();
  }
  /* ================= PROGRESS (report anytime) =================
     A student can open this from the practice screen at any point. It
     summarises the current session (skills, tries, first-try and mastered
     counts) and, from the saved history, their progress over time across
     earlier sessions/modules. Name + student code go on it; Save as PDF
     prints just this screen; Back returns to the exact question they were on
     without touching any session state. */
  let progCameFrom = "task";
  function activeScreenName() {
    return Object.keys(screens).find((k) => screens[k] && screens[k].classList.contains("active")) || "task";
  }
  function sessionSnapshot() {
    const bySkill = {};
    let attemptedItems = 0, firstRight = 0, mastered = 0;
    pool.forEach((e) => {
      const s = bySkill[e.skillId] = bySkill[e.skillId] ||
        { name: e.skillName, cat: e.category, band: e.band, total: 0, attempted: 0, first: 0, mastered: 0 };
      s.total++;
      if ((attempts[e.uid] || 0) > 0) { s.attempted++; attemptedItems++; }
      if (firstPass[e.uid]) { s.first++; firstRight++; }
      if (correctEver[e.uid]) { s.mastered++; mastered++; }
    });
    return { bySkill, totalItems: pool.length, attemptedItems, firstRight, mastered };
  }
  function historyBySkill() {
    const agg = {};
    history.forEach((h) => {
      const a = agg[h.skillId] = agg[h.skillId] || { right: 0, total: 0, sessions: 0 };
      a.right += h.right; a.total += h.total; a.sessions++;
    });
    return agg;
  }
  function buildProgress() {
    const who = studentName(), code = studentCode();
    $("progWho").innerHTML =
      (who ? `<b>${escapeHtmlE(who)}</b>` : "<i>(add your name below)</i>") +
      (code ? ` &middot; code <b>${escapeHtmlE(code)}</b>` : "") +
      ` &middot; ${escapeHtmlE(todayStr())}`;

    const snap = sessionSnapshot();
    if (snap.totalItems) {
      const rows = Object.values(snap.bySkill).map((s) =>
        `<tr><td>${escapeHtmlE(`${s.cat} · ${skillBandLabel(s.band)} · ${s.name}`)}</td>` +
        `<td class="num">${s.attempted}/${s.total}</td>` +
        `<td class="num">${s.first}</td>` +
        `<td class="num">${s.mastered}/${s.total}</td></tr>`).join("");
      $("progSession").innerHTML =
        `<div class="prog-section-title">This session so far</div>` +
        `<table class="prog-table"><tr><th>Skill</th><th>Tried</th><th>First try &#10003;</th><th>Mastered</th></tr>` +
        rows +
        `<tr class="prog-total"><td>Total</td><td class="num">${snap.attemptedItems}/${snap.totalItems}</td>` +
        `<td class="num">${snap.firstRight}</td><td class="num">${snap.mastered}/${snap.totalItems}</td></tr>` +
        `</table>` +
        `<p class="muted">${mode === "teaching" ? "Teaching cycle" : "Revision session"} &mdash; “First try” is questions right on the very first attempt; “Mastered” is questions you got right in the end.</p>`;
    } else {
      $("progSession").innerHTML = `<p class="prog-empty">No questions answered in this session yet.</p>`;
    }

    const agg = historyBySkill();
    const otRows = Object.entries(agg)
      .map(([id, a]) => ({ sk: skillById(id), a }))
      .filter((x) => x.sk)
      .sort((x, y) => (x.sk.category + x.sk.band).localeCompare(y.sk.category + y.sk.band))
      .map(({ sk, a }) => {
        const pct = a.total ? Math.round(100 * a.right / a.total) : 0;
        return `<tr><td>${escapeHtmlE(`${sk.category} · ${skillBandLabel(sk.band)} · ${sk.name}`)}</td>` +
          `<td class="num">${a.right}/${a.total}</td><td class="num">${pct}%</td><td class="num">${a.sessions}</td></tr>`;
      }).join("");
    $("progOverTime").innerHTML = otRows
      ? `<div class="prog-section-title">Your progress over time</div>` +
        `<table class="prog-table"><tr><th>Skill</th><th>First try &#10003;</th><th>Rate</th><th>Sessions</th></tr>${otRows}</table>` +
        `<p class="muted">Totals from every completed session saved on this device.</p>`
      : `<div class="prog-section-title">Your progress over time</div><p class="prog-empty">Finish a session and your skills will start showing up here.</p>`;
  }
  function openProgress() {
    progCameFrom = activeScreenName();
    const nR = $("studentNameR"), cR = $("studentCodeR");
    if (nR) nR.value = studentName();
    if (cR) cR.value = studentCode();
    buildProgress();
    show("progress");
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    screens.select = $("selectScreen");
    screens.task = $("taskScreen");
    screens.report = $("reportScreen");
    screens.preteach = $("preteachScreen");
    screens.placement = $("placementScreen");
    screens.progress = $("progressScreen");

    restoreState();                       // bring back mode/selection/name/history
    const autoStart = applyDeepLink();    // a valid shared link overrides selector state
    document.body.classList.add("wide");  // boot lands on the selector
    buildModeToggle();
    buildCurricToggle();
    buildMatrix();
    updateToolbar();
    initTranslate();
    updateTranslateBar();
    const buildTag = $("buildTag"); if (buildTag) buildTag.textContent = "build " + BUILD;

    // put the remembered name into both export fields and keep them in sync
    [$("studentName"), $("studentNameP")].forEach((el) => { if (el && savedName) el.value = savedName; });
    ["studentName", "studentNameP"].forEach((id) => {
      const el = $(id); if (!el) return;
      el.addEventListener("input", () => {
        savedName = el.value;
        const other = $(id === "studentName" ? "studentNameP" : "studentName");
        if (other) other.value = el.value;
        persist();
      });
    });
    const clearBtn = $("clearSavedBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearSaved);
    const reviewBtn = $("reviewWeakBtn");
    if (reviewBtn) reviewBtn.addEventListener("click", reviewWeakest);

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

    // progress (report anytime) buttons
    if ($("studentNameR") && savedName) $("studentNameR").value = savedName;
    if ($("studentCodeR") && savedCode) $("studentCodeR").value = savedCode;
    document.querySelectorAll(".reportNowBtn").forEach((b) => b.addEventListener("click", openProgress));
    $("progressBackBtn").addEventListener("click", () => {
      show(progCameFrom);
      if (progCameFrom === "task" && currentSet[idx]) setTranslateMode(currentSet[idx].item.noTranslate ? "block" : "word");
      else if (progCameFrom === "preteach") {
        // restore the phase's mode (show() defaults to unit)
        if (teachPhase === "vocab-check") setTranslateMode("block");
        else if (/^(ml|cl)-/.test(teachPhase)) setTranslateMode("word");
      }
    });
    $("progressPdfBtn").addEventListener("click", () => {
      savedName = ($("studentNameR") && $("studentNameR").value.trim()) || savedName;
      savedCode = ($("studentCodeR") && $("studentCodeR").value.trim()) || savedCode;
      [$("studentName"), $("studentNameP")].forEach((el) => { if (el) el.value = savedName; });
      persist();
      buildProgress();
      setTimeout(() => window.print(), 60);
    });
    ["studentNameR", "studentCodeR"].forEach((id) => {
      const el = $(id); if (!el) return;
      el.addEventListener("input", () => {
        if (id === "studentNameR") { savedName = el.value; [$("studentName"), $("studentNameP")].forEach((o) => { if (o) o.value = el.value; }); }
        else savedCode = el.value;
        persist();
        if (screens.progress && screens.progress.classList.contains("active")) buildProgress();
      });
    });

    // placement screen buttons
    $("placementSelectBtn").addEventListener("click", () => { buildMatrix(); show("select"); });
    // placement shares the report's export helpers (studentName/copyNote read both screens)
    $("downloadCsvBtnP").addEventListener("click", downloadCsv);
    $("copyTsvBtnP").addEventListener("click", copyTsv);
    $("copyBtnP").addEventListener("click", copyTeacher);

    wireGlossaryPopover();
    if (autoStart) startSession();
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
