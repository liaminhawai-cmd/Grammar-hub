/* ============================================================
   GRAMMAR HUB — ENGINE
   ------------------------------------------------------------
   Owns: the matrix selector, the drill loop (with mastery
   rounds, adapted from Holly's "Name that Tense"), scoring, and
   the report. Knows nothing about specific grammar — it dispatches
   every item to TASK_TYPES[item.type].

   Screen flow:   select  ->  task  ->  report
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
  let selectedSkills = new Set();
  let typeFilter = "all";

  function show(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  /* ---------------- SELECT SCREEN ---------------- */

  function skillById(id) { return window.SKILLS.find((s) => s.id === id); }
  function itemsFor(skill) {
    if (typeFilter === "all") return skill.items;
    return skill.items.filter((it) => it.type === typeFilter);
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
      const row = document.createElement("div");
      row.className = "matrix-row";
      row.innerHTML = `<div class="matrix-cell rowlabel">${cat}</div>`;
      window.BANDS.forEach((band) => {
        const skill = window.SKILLS.find((s) => s.category === cat && s.band === band);
        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        if (!skill || !skill.introduced) {
          cell.classList.add("empty");
          cell.innerHTML = `<span class="dash">—</span>`;
        } else {
          const n = itemsFor(skill).length;
          cell.classList.add(n ? "has-items" : "no-items");
          cell.dataset.id = skill.id;
          cell.innerHTML = `<span class="cell-name">${skill.name}</span>` +
            (n ? `<span class="cell-count">${n}</span>` : `<span class="cell-count zero">0</span>`);
          if (n) {
            cell.addEventListener("click", () => {
              if (selectedSkills.has(skill.id)) selectedSkills.delete(skill.id);
              else selectedSkills.add(skill.id);
              cell.classList.toggle("selected");
              refreshCount();
            });
            if (selectedSkills.has(skill.id)) cell.classList.add("selected");
          }
        }
        row.appendChild(cell);
      });
      wrap.appendChild(row);
    });
    refreshCount();
  }

  function refreshCount() {
    let items = 0;
    selectedSkills.forEach((id) => { items += itemsFor(skillById(id)).length; });
    $("selCount").textContent = `${selectedSkills.size} skill${selectedSkills.size === 1 ? "" : "s"} · ${items} item${items === 1 ? "" : "s"}`;
    $("startBtn").disabled = items === 0;
  }

  function buildTypeFilter() {
    const wrap = $("typeFilter");
    const types = ["all", "identify", "gapfill"];
    wrap.innerHTML = types.map((t) =>
      `<button class="filter-btn${t === typeFilter ? " active" : ""}" data-t="${t}">${t === "all" ? "All tasks" : window.TASK_TYPES[t].label}</button>`
    ).join("");
    wrap.querySelectorAll(".filter-btn").forEach((b) => {
      b.addEventListener("click", () => {
        typeFilter = b.dataset.t;
        wrap.querySelectorAll(".filter-btn").forEach((x) => x.classList.toggle("active", x === b));
        // drop selections that now have no items
        [...selectedSkills].forEach((id) => { if (itemsFor(skillById(id)).length === 0) selectedSkills.delete(id); });
        buildMatrix();
      });
    });
  }

  /* ---------------- DRILL ---------------- */

  function startSession() {
    pool = [];
    selectedSkills.forEach((id) => {
      const skill = skillById(id);
      itemsFor(skill).forEach((item, i) => {
        pool.push({ uid: id + "#" + i, skillId: id, skillName: skill.name, category: skill.category, band: skill.band, item });
      });
    });
    shuffle(pool);
    attempts = {}; correctEver = {}; firstPass = {}; log = [];
    currentSet = [...pool]; nextSet = []; idx = 0; round = 1;
    show("task");
    showItem();
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

    buildTypeFilter();
    buildMatrix();

    $("selectAllBtn").addEventListener("click", () => {
      window.SKILLS.forEach((s) => { if (s.introduced && itemsFor(s).length) selectedSkills.add(s.id); });
      buildMatrix();
    });
    $("selectNoneBtn").addEventListener("click", () => { selectedSkills.clear(); buildMatrix(); });
    $("startBtn").addEventListener("click", startSession);

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
