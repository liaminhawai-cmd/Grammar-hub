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

  // ---- teaching mode state ----
  let teachPhase = "vocab";   // "vocab" | "skill" | "assess"
  let vocabQueue = [];        // vocab items to preteach
  let vocabIdx = 0;

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
      getTeachingSkills().forEach((skill) => {
        skill.items.forEach((item, i) => {
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

      // start with vocab preteach for the target cell
      startVocabPreteach();
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

  /* ---------------- VOCAB PRETEACH (teaching mode) ---------------- */

  function startVocabPreteach() {
    if (!drillTarget) { startSkillPreteach(); return; }
    const targetSkill = drillableAt(drillTarget.category, drillTarget.bandIndex);
    if (!targetSkill || !targetSkill.vocab || !targetSkill.vocab.length) {
      startSkillPreteach();
      return;
    }
    teachPhase = "vocab";
    vocabQueue = targetSkill.vocab.slice();
    vocabIdx = 0;
    show("preteach");
    showVocabCard();
  }

  function showVocabCard() {
    const v = vocabQueue[vocabIdx];
    const total = vocabQueue.length;
    $("preteachPhase").textContent = "Vocabulary";
    $("preteachProgress").textContent = `Term ${vocabIdx + 1} of ${total}`;
    $("preteachBar").style.width = Math.round(((vocabIdx + 1) / total) * 100) + "%";

    const targetSkill = drillableAt(drillTarget.category, drillTarget.bandIndex);
    const skillLabel = targetSkill ? `${targetSkill.category} · ${targetSkill.band} · ${targetSkill.name}` : "";

    $("preteachContent").innerHTML =
      `<div class="skill-tag">${escapeHtmlE(skillLabel)}</div>` +
      `<div class="teach-phase">Learn this term</div>` +
      `<div class="teach-term">${escapeHtmlE(v.term)}</div>` +
      `<div class="teach-def">${escapeHtmlE(v.def)}</div>` +
      `<div class="teach-example">${v.example}</div>`;

    $("preteachNextBtn").textContent = vocabIdx < total - 1 ? "Next term" : "Continue";
  }

  function onPreteachNext() {
    if (teachPhase === "vocab") {
      vocabIdx++;
      if (vocabIdx < vocabQueue.length) {
        showVocabCard();
      } else {
        startSkillPreteach();
      }
    } else if (teachPhase === "skill") {
      show("task");
      showItem();
    }
  }

  /* ---------------- SKILL PRETEACH (teaching mode) ---------------- */

  function startSkillPreteach() {
    teachPhase = "skill";
    const skills = getTeachingSkills();
    $("preteachPhase").textContent = "Skill overview";
    $("preteachProgress").textContent = `${skills.length} skill${skills.length === 1 ? "" : "s"} in this cycle`;
    $("preteachBar").style.width = "100%";

    $("preteachContent").innerHTML = skills.map((s) => {
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

    $("preteachNextBtn").textContent = "Start practising";
    show("preteach");
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
