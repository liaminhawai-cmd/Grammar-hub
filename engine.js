/* ============================================================
   GRAMMAR HUB — ENGINE
   ------------------------------------------------------------
   Owns: the matrix selector, the drill loop (with mastery
   rounds, adapted from Holly's "Name that Tense"), scoring, and
   the report. Knows nothing about specific grammar — it dispatches
   every item to TASK_TYPES[item.type].

   Screen flow:   select  -> [preteach] ->  task  ->  report
   Mastery loop:  wrong items come back each round until every
                  selected item has been answered correctly once.
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
  let rowLevel = {};      // category -> mastered band index (0..3), or -1 = "from scratch"
  let mode = "revision";  // "drill" (single skill + neighbors) | "revision" (whole rubric)
  let drillTarget = null; // drill mode: { category, bandIndex } | null
  const SAMPLE_PER_SKILL = 2;  // questions drawn per skill each run (revision mode)

  function show(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  /* ---------------- SELECT SCREEN ---------------- */

  function skillById(id) { return window.SKILLS.find((s) => s.id === id); }
  function itemsFor(skill) { return skill.items; }

  // ---- level model: click your highest mastered cell, drill the next band up ----
  function cellAt(cat, i) {
    if (i < 0 || i >= window.BANDS.length) return null;
    return window.SKILLS.find((s) => s.category === cat && s.band === window.BANDS[i]);
  }
  function drillableAt(cat, i) {
    const s = cellAt(cat, i);
    return (s && s.introduced && itemsFor(s).length) ? s : null;
  }
  // next drillable band strictly above the mastered level; if there is none,
  // consolidate on the mastered cell itself (top of the row).
  function targetFor(cat) {
    const lvl = rowLevel[cat];
    if (lvl === undefined) return null;
    for (let j = lvl + 1; j < window.BANDS.length; j++) {
      const s = drillableAt(cat, j);
      if (s) return s;
    }
    return lvl >= 0 ? drillableAt(cat, lvl) : drillableAt(cat, 0);
  }
  function activeTargets() {
    return Object.keys(rowLevel).map(targetFor).filter(Boolean);
  }
  function setLevel(cat, val) {
    if (rowLevel[cat] === val) delete rowLevel[cat];  // click again to clear
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

  function getDrillSkills() {
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

    // header row
    const head = document.createElement("div");
    head.className = "matrix-row matrix-head";
    head.innerHTML = `<div class="matrix-cell rowlabel"></div>` +
      window.BANDS.map((b) => `<div class="matrix-cell colhead">${b}</div>`).join("");
    wrap.appendChild(head);

    window.CATEGORIES.forEach((cat) => {
      const lvl = rowLevel[cat];
      const target = targetFor(cat);
      const targetIdx = target ? window.BANDS.indexOf(target.band) : -2;

      const row = document.createElement("div");
      row.className = "matrix-row";

      const label = document.createElement("div");
      label.textContent = cat;
      if (mode === "revision") {
        label.className = "matrix-cell rowlabel" + (lvl === -1 ? " beginner" : "");
        label.title = "Click to practise this strand from C1";
        label.addEventListener("click", () => setLevel(cat, -1));
      } else {
        label.className = "matrix-cell rowlabel";
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

        if (mode === "drill") {
          const isDT = drillTarget && drillTarget.category === cat && i === drillTarget.bandIndex;
          const isInc = drillTarget && drillTarget.category === cat &&
            (i === drillTarget.bandIndex - 1 || i === drillTarget.bandIndex + 1) && n;
          if (isDT) cell.classList.add("target");
          else if (isInc) cell.classList.add("below");

          cell.innerHTML = `<span class="cell-name">${skill.name}</span>` +
            (isDT ? `<span class="drill-tag">drill ▸</span>`
              : isInc ? `<span class="drill-tag">included</span>`
              : (n ? `<span class="cell-count">${n}</span>` : `<span class="cell-count zero">0</span>`));

          if (n) cell.addEventListener("click", () => setDrillTarget(cat, i));
        } else {
          if (lvl >= 0) {
            if (i === lvl) cell.classList.add("achieved");
            else if (i < lvl) cell.classList.add("below");
          }
          const isTarget = i === targetIdx;
          if (isTarget) cell.classList.add("target");

          cell.innerHTML = `<span class="cell-name">${skill.name}</span>` +
            (isTarget ? `<span class="drill-tag">drill ▸</span>`
                      : (n ? `<span class="cell-count">${n}</span>` : `<span class="cell-count zero">0</span>`));

          if (n) cell.addEventListener("click", () => setLevel(cat, i));
        }
        row.appendChild(cell);
      });
      wrap.appendChild(row);
    });
    refreshCount();
  }

  function refreshCount() {
    if (mode === "drill") {
      const skills = getDrillSkills();
      let items = 0;
      skills.forEach((s) => { items += itemsFor(s).length; });
      $("selCount").textContent = skills.length > 0
        ? `${skills.length} skill${skills.length === 1 ? "" : "s"} · ${items} question${items === 1 ? "" : "s"}`
        : "Click a skill to drill";
      $("startBtn").disabled = skills.length === 0;
    } else {
      const targets = activeTargets();
      let items = 0;
      targets.forEach((s) => { items += Math.min(SAMPLE_PER_SKILL, itemsFor(s).length); });
      $("selCount").textContent =
        `${targets.length} skill${targets.length === 1 ? "" : "s"} queued · ~${items} question${items === 1 ? "" : "s"}`;
      $("startBtn").disabled = targets.length === 0;
    }
  }

  function buildModeToggle() {
    const wrap = $("typeFilter");
    wrap.innerHTML =
      `<button class="filter-btn${mode === "drill" ? " active" : ""}" data-m="drill">Skill Drill</button>` +
      `<button class="filter-btn${mode === "revision" ? " active" : ""}" data-m="revision">Revision</button>`;
    wrap.querySelectorAll(".filter-btn").forEach((b) => {
      b.addEventListener("click", () => {
        mode = b.dataset.m;
        drillTarget = null;
        rowLevel = {};
        wrap.querySelectorAll(".filter-btn").forEach((x) => x.classList.toggle("active", x === b));
        buildMatrix();
        updateToolbar();
      });
    });
  }

  function updateToolbar() {
    $("selectAllBtn").style.display = mode === "revision" ? "" : "none";
    $("helpText").innerHTML = mode === "drill"
      ? `Click any skill to focus on it. You'll see worked examples, then practise that skill plus the level below (review) and above (stretch).`
      : `Click the highest level you've <b>mastered</b> in a row — it turns green, lower levels go faint green, and the next band up (marked <b>drill ▸</b>) is what you'll practise. Click the strand name to start from C1. Each run pulls a random couple of questions per skill.`;
  }

  /* ---------------- DRILL ---------------- */

  function startSession() {
    pool = [];
    if (mode === "drill") {
      getDrillSkills().forEach((skill) => {
        skill.items.forEach((item, i) => {
          pool.push({ uid: skill.id + "#" + i, skillId: skill.id, skillName: skill.name, category: skill.category, band: skill.band, item });
        });
      });
    } else {
      activeTargets().forEach((skill) => {
        const picks = shuffle(itemsFor(skill).slice()).slice(0, SAMPLE_PER_SKILL);
        picks.forEach((item) => {
          const i = skill.items.indexOf(item);
          pool.push({ uid: skill.id + "#" + i, skillId: skill.id, skillName: skill.name, category: skill.category, band: skill.band, item });
        });
      });
    }
    if (pool.length === 0) return;
    shuffle(pool);
    attempts = {}; correctEver = {}; firstPass = {}; log = [];
    currentSet = [...pool]; nextSet = []; idx = 0; round = 1;
    if (mode === "drill") {
      showPreteach();
    } else {
      show("task");
      showItem();
    }
  }

  function showItem() {
    graded = false;
    const entry = currentSet[idx];
    const type = window.TASK_TYPES[entry.item.type] || window.TASK_TYPES.produce;

    $("promptText").textContent = entry.item.prompt || type.label;
    $("skillTag").textContent = `${entry.category} · ${entry.band} · ${entry.skillName}`;

    const area = $("taskArea");
    area.innerHTML = type.render(entry.item);
    if (type.wire) type.wire(area);

    $("feedback").className = "feedback";
    $("feedback").textContent = "";
    $("checkBtn").disabled = true;
    $("checkBtn").style.display = "";
    $("nextBtn").style.display = "none";

    // progress
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
    if (response === null) return; // nothing entered yet

    const result = type.check(entry.item, response);
    if (type.mark) type.mark($("taskArea"), entry.item, result);

    attempts[entry.uid] = (attempts[entry.uid] || 0) + 1;
    if (attempts[entry.uid] === 1) firstPass[entry.uid] = result.correct;
    if (result.correct) correctEver[entry.uid] = true;

    log.push({ round, skill: entry.skillName, type: entry.item.type,
               stimulus: stripTags(entry.item.sentence || (entry.item.before + " ___ " + entry.item.after)),
               response, result: result.correct ? "correct" : "incorrect" });

    const fb = $("feedback");
    fb.className = "feedback " + (result.correct ? "good" : "bad");
    fb.innerHTML = (result.correct ? "✓ Correct. " : `✗ Not yet. Answer: <b>${escapeHtmlE(result.expected)}</b>. `) +
                   (entry.item.explain ? escapeHtmlE(entry.item.explain) : "");

    graded = true;
    $("checkBtn").style.display = "none";
    $("nextBtn").style.display = "";
    $("nextBtn").focus();
  }

  function onNext() {
    idx++;
    if (idx >= currentSet.length) {
      // close out the round
      nextSet = pool.filter((e) => !correctEver[e.uid]);
      if (nextSet.length > 0) {
        currentSet = shuffle(nextSet.slice());
        nextSet = [];
        round++;
        idx = 0;
        showItem();
      } else {
        endSession();
      }
    } else {
      showItem();
    }
  }

  function countNotMastered() { return pool.filter((e) => !correctEver[e.uid]).length; }

  /* ---------------- REPORT ---------------- */

  function endSession() {
    show("report");
    const total = pool.length;
    const firstRight = pool.filter((e) => firstPass[e.uid]).length;
    const totalAttempts = Object.values(attempts).reduce((a, b) => a + b, 0);

    $("reportSummary").innerHTML =
      `<div class="big-stat">${firstRight}/${total}</div>` +
      `<div class="stat-label">correct first try</div>` +
      `<p class="muted">Mastered all ${total} after ${totalAttempts} total attempt${totalAttempts === 1 ? "" : "s"}.</p>`;

    // per-skill breakdown
    const bySkill = {};
    pool.forEach((e) => {
      bySkill[e.skillId] = bySkill[e.skillId] || { name: e.skillName, cat: e.category, band: e.band, total: 0, right: 0 };
      bySkill[e.skillId].total++;
      if (firstPass[e.uid]) bySkill[e.skillId].right++;
    });
    let rows = Object.values(bySkill).map((s) => {
      const pct = Math.round((s.right / s.total) * 100);
      const cls = pct === 100 ? "ok" : pct >= 50 ? "mid" : "low";
      return `<div class="skill-row">
                <span class="skill-name">${s.cat} · ${s.band} · ${s.name}</span>
                <span class="skill-score ${cls}">${s.right}/${s.total}</span>
              </div>`;
    }).join("");
    $("reportSkills").innerHTML = `<h3>By skill (first try)</h3>${rows}`;

    // remediation hook: skills below 100% first-try, route to resources if mapped
    const weak = Object.entries(bySkill).filter(([, s]) => s.right < s.total);
    if (weak.length) {
      let html = `<h3>Practise next</h3>`;
      weak.forEach(([id, s]) => {
        const skill = skillById(id);
        html += `<div class="remed-row"><b>${s.name}</b> `;
        if (skill.resources && (skill.resources.video || (skill.resources.sheets || []).length)) {
          if (skill.resources.video) html += `<a href="${skill.resources.video}" target="_blank">video</a> `;
          (skill.resources.sheets || []).forEach((sh) => { html += `<a href="${sh.url}" target="_blank">${escapeHtmlE(sh.name)}</a> `; });
        } else {
          html += `<span class="muted">no resources mapped yet — add to skills.js → resources</span>`;
        }
        html += `</div>`;
      });
      $("reportRemediation").innerHTML = html;
    } else {
      $("reportRemediation").innerHTML = `<p class="muted">Every selected skill correct first try. Nothing to reteach.</p>`;
    }

    buildTeacherExport(firstRight, total, totalAttempts, bySkill);
  }

  let teacherText = "";
  function buildTeacherExport(firstRight, total, totalAttempts, bySkill) {
    let t = `GRAMMAR HUB — Teacher results\n`;
    t += `First try: ${firstRight}/${total}   Total attempts: ${totalAttempts}\n\n`;
    t += `By skill (first try):\n`;
    Object.values(bySkill).forEach((s) => { t += `  ${s.cat} · ${s.band} · ${s.name}: ${s.right}/${s.total}\n`; });
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

  /* ---------------- preteach (skill drill) ---------------- */

  function showPreteach() {
    const skills = getDrillSkills();
    const content = $("preteachContent");
    content.innerHTML = skills.map((s) => {
      const bi = window.BANDS.indexOf(s.band);
      let label, cls;
      if (bi < drillTarget.bandIndex) { label = "Review"; cls = "review"; }
      else if (bi === drillTarget.bandIndex) { label = "Target"; cls = "target"; }
      else { label = "Stretch"; cls = "stretch"; }
      return `<div class="preteach-card${cls === "target" ? " preteach-target" : ""}">
        <span class="preteach-band">${s.band}</span>
        <span class="preteach-label ${cls}">${label}</span>
        <div class="preteach-name">${escapeHtmlE(s.name)}</div>
        <div class="preteach-example">"${escapeHtmlE(s.example)}"</div>
      </div>`;
    }).join("");
    show("preteach");
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
  function escapeHtmlE(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    screens.select = $("selectScreen");
    screens.task = $("taskScreen");
    screens.report = $("reportScreen");
    screens.preteach = $("preteachScreen");

    buildModeToggle();
    buildMatrix();
    updateToolbar();

    $("selectAllBtn").addEventListener("click", () => {
      // queue every strand from its first level (drills each C1)
      window.CATEGORIES.forEach((cat) => { rowLevel[cat] = -1; });
      buildMatrix();
    });
    $("selectNoneBtn").addEventListener("click", () => { rowLevel = {}; drillTarget = null; buildMatrix(); });
    $("startBtn").addEventListener("click", startSession);
    $("preteachStartBtn").addEventListener("click", () => { show("task"); showItem(); });

    // task area emits gh:ready when an answer is entered, gh:submit on Enter
    $("taskArea").addEventListener("gh:ready", () => { if (!graded) $("checkBtn").disabled = false; });
    $("taskArea").addEventListener("gh:submit", () => { if (!graded) onCheck(); });

    $("checkBtn").addEventListener("click", onCheck);
    $("nextBtn").addEventListener("click", onNext);
    $("quitBtn").addEventListener("click", () => show("select"));

    $("copyBtn").addEventListener("click", copyTeacher);
    $("reviewBtn").addEventListener("click", () => { startSession(); }); // re-run same selection
    $("restartBtn").addEventListener("click", () => show("select"));
  });
})();
