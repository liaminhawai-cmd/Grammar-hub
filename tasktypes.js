/* ============================================================
   GRAMMAR HUB — TASK TYPES
   ------------------------------------------------------------
   The registry the engine dispatches to. Each item in a skill
   has a `type`; the engine looks it up here and calls the
   interface below. Types are self-contained and never call each
   other (see DESIGN_RULES.md §1).

   INTERFACE (SPEC.md §5) — a task type is one entry in
   window.TASK_TYPES keyed by the item's `type`:

     label                  text shown in the task filter.
     render(item) -> html   markup for #taskArea. Reuse existing
                            classes (.stimulus/.options/.gap-input);
                            do not invent component styles.
     wire(area)             optional. Attach listeners after render.
                            Tell the engine an answer is ready by
                            dispatching a bubbling "gh:ready" from
                            inside `area`; dispatch "gh:submit" to
                            check immediately (e.g. on Enter).
     collect(area) -> resp  the learner's response, or null if
                            nothing has been entered yet.
     check(item, resp)      -> { correct:bool, expected:string }.
                            `expected` is shown in the feedback line
                            and the model answer must grade correct
                            (this is what README's sanity check runs).
     mark(area,item,result) optional. Paint the input(s) correct /
                            incorrect after grading.

   Add a new type by appending one entry and a stub note in SPEC.
   ============================================================ */

(function () {

  /* ---------------- shared helpers (kept local; see DESIGN_RULES §1) ---------------- */

  // Normalise a free-typed answer for comparison. SPEC.md §6 contract:
  // lowercase, strip apostrophes, collapse spaces, drop trailing
  // punctuation. accept[] lists still carry contraction variants.
  function norm(s) {
    return (s || "")
      .toLowerCase()
      .replace(/[‘’']/g, "")     // strip apostrophes (don't == dont)
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.,!?;:]+$/, ""); // drop trailing punctuation
  }

  function esc(s) {
    return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Fire the events the engine listens for on #taskArea.
  function ready(el) { el.dispatchEvent(new CustomEvent("gh:ready", { bubbles: true })); }
  function submit(el) { el.dispatchEvent(new CustomEvent("gh:submit", { bubbles: true })); }

  // A shuffled list of indices 0..n-1 (so a render can scramble display order
  // without touching the underlying data).
  function shuffleIdx(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // A placeholder type used by the five roadmap stubs below. Renders a
  // note, never reports an answer, so the engine's Check stays disabled.
  function stub(label, blurb) {
    return {
      label,
      render: () => `<div class="stub">${esc(label)} — ${esc(blurb)}</div>`,
      collect: () => null,
      check: () => ({ correct: false, expected: "" }),
    };
  }

  /* ---------------- the registry ---------------- */

  window.TASK_TYPES = {

    /* ===== identify: MCQ, name the grammatical feature ===== */
    identify: {
      label: "Identify",

      render(item) {
        // item.sentence already wraps the target in <b></b> (trusted content).
        const opts = item.options.map((o) =>
          `<button type="button" class="option" data-value="${esc(o)}">${esc(o)}</button>`
        ).join("");
        return `<div class="stimulus">${item.sentence}</div>
                <div class="options">${opts}</div>`;
      },

      wire(area) {
        const opts = area.querySelectorAll(".option");
        opts.forEach((btn) => {
          btn.addEventListener("click", () => {
            opts.forEach((o) => o.classList.remove("chosen"));
            btn.classList.add("chosen");
            ready(area);
          });
          btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && btn.classList.contains("chosen")) submit(area);
          });
        });
      },

      collect(area) {
        const chosen = area.querySelector(".option.chosen");
        return chosen ? chosen.dataset.value : null;
      },

      check(item, response) {
        return { correct: response === item.answer, expected: item.answer };
      },

      mark(area, item, result) {
        area.querySelectorAll(".option").forEach((btn) => {
          btn.disabled = true;
          const v = btn.dataset.value;
          if (v === item.answer) btn.classList.add("correct");
          else if (btn.classList.contains("chosen") && !result.correct) btn.classList.add("incorrect");
        });
      },
    },

    /* ===== gapfill: type the correct form into a blank ===== */
    gapfill: {
      label: "Gap fill",

      render(item) {
        const cue = item.cue ? `<div class="cue gap-cue">(${esc(item.cue)})</div>` : "";
        return `${cue}
                <div class="stimulus gap">
                  <span>${esc(item.before)}</span>
                  <input class="gap-input" type="text" autocomplete="off"
                         autocapitalize="off" spellcheck="false" aria-label="your answer">
                  <span>${esc(item.after)}</span>
                </div>`;
      },

      wire(area) {
        const input = area.querySelector(".gap-input");
        input.addEventListener("input", () => { if (input.value.trim()) ready(area); });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && input.value.trim()) submit(area);
        });
        input.focus();
      },

      collect(area) {
        const v = area.querySelector(".gap-input").value.trim();
        return v === "" ? null : v;
      },

      check(item, response) {
        const accept = (item.accept || []).map(norm);
        return { correct: accept.includes(norm(response)), expected: item.accept[0] };
      },

      mark(area, item, result) {
        const input = area.querySelector(".gap-input");
        input.readOnly = true;
        input.classList.add(result.correct ? "correct" : "incorrect");
      },
    },

    /* ===== roadmap stubs (SPEC.md §10) — wired but inert until built ===== *
       Each is ONE isolated type so adding it can't break the working banks.
       `produce` is also the engine's fallback for any unknown item type.   */
    /* ===== choose: MCQ, pick the correct sentence ===== */
    choose: {
      label: "Choose",

      render(item) {
        const opts = item.options.map((o) =>
          `<button type="button" class="option" data-value="${esc(o)}">${esc(o)}</button>`
        ).join("");
        return `<div class="options choose-options">${opts}</div>`;
      },

      wire(area) {
        const opts = area.querySelectorAll(".option");
        opts.forEach((btn) => {
          btn.addEventListener("click", () => {
            opts.forEach((o) => o.classList.remove("chosen"));
            btn.classList.add("chosen");
            ready(area);
          });
          btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && btn.classList.contains("chosen")) submit(area);
          });
        });
      },

      collect(area) {
        const chosen = area.querySelector(".option.chosen");
        return chosen ? chosen.dataset.value : null;
      },

      check(item, response) {
        return { correct: response === item.answer, expected: item.answer };
      },

      mark(area, item, result) {
        area.querySelectorAll(".option").forEach((btn) => {
          btn.disabled = true;
          const v = btn.dataset.value;
          if (v === item.answer) btn.classList.add("correct");
          else if (btn.classList.contains("chosen") && !result.correct) btn.classList.add("incorrect");
        });
      },
    },

    /* ===== transform: rewrite a sentence to a target form ===== */
    transform: {
      label: "Transform",

      render(item) {
        const prompt = `<div class="cue">${esc(item.prompt)}</div>`;
        const stimulus = `<div class="stimulus">${esc(item.sentence)}</div>`;
        return `${prompt}
                ${stimulus}
                <div class="stimulus gap">
                  <input class="gap-input" type="text" autocomplete="off"
                         autocapitalize="off" spellcheck="false" aria-label="your rewritten answer">
                </div>`;
      },

      wire(area) {
        const input = area.querySelector(".gap-input");
        input.addEventListener("input", () => { if (input.value.trim()) ready(area); });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && input.value.trim()) submit(area);
        });
        input.focus();
      },

      collect(area) {
        const v = area.querySelector(".gap-input").value.trim();
        return v === "" ? null : v;
      },

      check(item, response) {
        const accept = (item.accept || []).map(norm);
        return { correct: accept.includes(norm(response)), expected: item.accept[0] };
      },

      mark(area, item, result) {
        const input = area.querySelector(".gap-input");
        input.readOnly = true;
        input.classList.add(result.correct ? "correct" : "incorrect");
      },
    },

    /* ===== join: combine two sentences with a connective ===== */
    join: {
      label: "Join",

      render(item) {
        const prompt = `<div class="cue">${esc(item.prompt)}</div>`;
        const s1 = `<div class="stimulus">${esc(item.sentence1)}</div>`;
        const s2 = `<div class="stimulus">${esc(item.sentence2)}</div>`;
        return `${prompt}
                ${s1}
                ${s2}
                <div class="stimulus gap">
                  <input class="gap-input" type="text" autocomplete="off"
                         autocapitalize="off" spellcheck="false" aria-label="your combined sentence">
                </div>`;
      },

      wire(area) {
        const input = area.querySelector(".gap-input");
        input.addEventListener("input", () => { if (input.value.trim()) ready(area); });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && input.value.trim()) submit(area);
        });
        input.focus();
      },

      collect(area) {
        const v = area.querySelector(".gap-input").value.trim();
        return v === "" ? null : v;
      },

      check(item, response) {
        const accept = (item.accept || []).map(norm);
        return { correct: accept.includes(norm(response)), expected: item.accept[0] };
      },

      mark(area, item, result) {
        const input = area.querySelector(".gap-input");
        input.readOnly = true;
        input.classList.add(result.correct ? "correct" : "incorrect");
      },
    },

    /* ===== order: put scrambled words in correct order ===== */
    order: {
      label: "Order",

      render(item) {
        const prompt = `<div class="cue">${esc(item.prompt)}</div>`;
        const wordButtons = item.words.map((w, i) =>
          `<button type="button" class="order-word" data-index="${i}">${esc(w)}</button>`
        ).join("");
        return `${prompt}
                <div class="order-line" aria-label="your sentence"><span class="order-placeholder">tap words below to build your sentence…</span></div>
                <div class="order-bank">${wordButtons}</div>
                <div class="order-hint">Tap a word to add it. Tap a word in your sentence to send it back.</div>`;
      },

      // DOM-only: tapping a word moves the button between the bank and the
      // sentence line. (wire only receives `area`, so never reference `item` here.)
      wire(area) {
        const line = area.querySelector(".order-line");
        const bank = area.querySelector(".order-bank");
        const ph = line.querySelector(".order-placeholder");
        const total = area.querySelectorAll(".order-word").length;

        function refresh() {
          const inLine = line.querySelectorAll(".order-word").length;
          if (ph) ph.style.display = inLine ? "none" : "";
          if (inLine === total) ready(area);
        }
        area.querySelectorAll(".order-word").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (btn.parentElement === bank) { btn.classList.add("in-line"); line.appendChild(btn); }
            else { btn.classList.remove("in-line"); bank.appendChild(btn); }
            refresh();
          });
          btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && line.querySelectorAll(".order-word").length === total) submit(area);
          });
        });
      },

      collect(area) {
        const line = area.querySelector(".order-line");
        const placed = Array.from(line.querySelectorAll(".order-word")).map((b) => b.textContent);
        const total = area.querySelectorAll(".order-word").length;
        return placed.length === total && total > 0 ? placed.join(" ") : null;
      },

      check(item, response) {
        const expected = item.answer;
        return { correct: norm(response) === norm(expected), expected };
      },

      mark(area, item, result) {
        area.querySelector(".order-line").classList.add(result.correct ? "correct" : "incorrect");
        area.querySelectorAll(".order-word").forEach((btn) => { btn.disabled = true; });
      },
    },

    /* ===== produce: free written response, teacher assessed ===== */
    produce: {
      label: "Produce",

      render(item) {
        return `<div class="cue">${esc(item.prompt)}</div>
                <textarea class="produce-input" rows="4" autocomplete="off"
                          spellcheck="true" aria-label="your answer"></textarea>`;
      },

      wire(area) {
        const input = area.querySelector(".produce-input");
        input.addEventListener("input", () => { if (input.value.trim()) ready(area); });
        input.addEventListener("keydown", (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && input.value.trim()) submit(area);
        });
        input.focus();
      },

      collect(area) {
        const v = area.querySelector(".produce-input").value.trim();
        return v === "" ? null : v;
      },

      check(item, response) {
        return { correct: true, expected: "(teacher assessed)" };
      },

      mark(area, item, result) {
        const input = area.querySelector(".produce-input");
        input.readOnly = true;
        input.classList.add("produce-submitted");
      },
    },

    /* ===== match: same words, different punctuation/grammar, different meaning ===== *
       The point is that a small change flips the meaning ("Let's eat, Grandma"
       vs "Let's eat Grandma"). Learner taps a sentence, then taps the meaning
       it carries. Correct = every sentence paired to its own meaning.          */
    match: {
      label: "Match",

      render(item) {
        const prompt = `<div class="cue">${esc(item.prompt)}</div>`;
        // shuffle each column independently so position is not a clue
        const sCol = shuffleIdx(item.pairs.length).map((oi) =>
          `<button type="button" class="match-item" data-side="s" data-oi="${oi}">${esc(item.pairs[oi].sentence)}</button>`).join("");
        const mCol = shuffleIdx(item.pairs.length).map((oi) =>
          `<button type="button" class="match-item" data-side="m" data-oi="${oi}">${esc(item.pairs[oi].meaning)}</button>`).join("");
        return `${prompt}
                <div class="match-grid">
                  <div class="match-col">${sCol}</div>
                  <div class="match-col">${mCol}</div>
                </div>
                <div class="match-hint">Tap a sentence, then tap its meaning. Tap a matched item to undo.</div>`;
      },

      wire(area) {
        const sBtns = Array.from(area.querySelectorAll('.match-item[data-side="s"]'));
        const mBtns = Array.from(area.querySelectorAll('.match-item[data-side="m"]'));
        const pairs = [];            // {s, m} original indices
        area._matchPairs = pairs;    // collect() reads this back
        let pendS = null, pendM = null;

        function clearPending() {
          pendS = null; pendM = null;
          sBtns.concat(mBtns).forEach((b) => b.classList.remove("pending"));
        }
        function repaint() {
          sBtns.concat(mBtns).forEach((b) => {
            b.classList.remove("paired");
            const old = b.querySelector(".match-badge");
            if (old) old.remove();
          });
          pairs.forEach((p, i) => {
            [sBtns.find((b) => +b.dataset.oi === p.s), mBtns.find((b) => +b.dataset.oi === p.m)]
              .forEach((b) => {
                if (!b) return;
                b.classList.add("paired");
                const badge = document.createElement("span");
                badge.className = "match-badge";
                badge.textContent = i + 1;
                b.appendChild(badge);
              });
          });
        }
        function commitIfReady() {
          if (pendS === null || pendM === null) return;
          pairs.push({ s: pendS, m: pendM });
          clearPending();
          repaint();
          if (pairs.length === sBtns.length) ready(area);
        }
        function bind(btns, side) {
          btns.forEach((b) => b.addEventListener("click", () => {
            const oi = +b.dataset.oi;
            const pi = pairs.findIndex((p) => p[side] === oi);
            if (pi >= 0) { pairs.splice(pi, 1); repaint(); return; }  // tap a match to undo
            if (side === "s") pendS = oi; else pendM = oi;
            btns.forEach((x) => x.classList.toggle("pending", x === b));
            commitIfReady();
          }));
        }
        bind(sBtns, "s");
        bind(mBtns, "m");
      },

      collect(area) {
        const pairs = area._matchPairs || [];
        const total = area.querySelectorAll('.match-item[data-side="s"]').length;
        if (pairs.length < total) return null;
        return pairs.map((p) => [p.s, p.m]);
      },

      check(item, response) {
        const ok = Array.isArray(response) && response.length === item.pairs.length &&
                   response.every((pair) => pair[0] === pair[1]);
        const expected = item.pairs.map((p) => `"${p.sentence}" = ${p.meaning}`).join("; ");
        return { correct: ok, expected };
      },

      mark(area, item, result) {
        const pairs = area._matchPairs || [];
        const sBtns = Array.from(area.querySelectorAll('.match-item[data-side="s"]'));
        const mBtns = Array.from(area.querySelectorAll('.match-item[data-side="m"]'));
        pairs.forEach((p) => {
          const right = p.s === p.m;
          [sBtns.find((b) => +b.dataset.oi === p.s), mBtns.find((b) => +b.dataset.oi === p.m)]
            .forEach((b) => { if (b) b.classList.add(right ? "correct" : "incorrect"); });
        });
        area.querySelectorAll(".match-item").forEach((b) => { b.disabled = true; });
      },
    },

  };

})();
