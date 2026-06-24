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
        const cue = item.cue ? `<div class="cue">(${esc(item.cue)})</div>` : "";
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
        const sequence = `<div class="order-sequence" aria-label="your word order"></div>`;
        return `${prompt}
                <div class="order-words">${wordButtons}</div>
                <div>Tap words in order:</div>
                ${sequence}`;
      },

      wire(area) {
        const words = area.querySelectorAll(".order-word");
        const sequence = area.querySelector(".order-sequence");
        const selected = [];

        words.forEach((btn) => {
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index);
            if (selected.includes(idx)) {
              selected.splice(selected.indexOf(idx), 1);
              btn.classList.remove("selected");
            } else {
              selected.push(idx);
              btn.classList.add("selected");
            }
            sequence.innerHTML = selected.map((i) => `<span>${esc(item.words[i])}</span>`).join(" ");
            if (selected.length === item.words.length) ready(area);
          });
          btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && selected.length === item.words.length) submit(area);
          });
        });
      },

      collect(area) {
        const sequence = area.querySelector(".order-sequence");
        const spans = sequence.querySelectorAll("span");
        return spans.length === 0 ? null : Array.from(spans).map((s) => s.textContent).join(" ");
      },

      check(item, response) {
        const expected = item.answer;
        return { correct: norm(response) === norm(expected), expected };
      },

      mark(area, item, result) {
        const sequence = area.querySelector(".order-sequence");
        sequence.classList.add(result.correct ? "correct" : "incorrect");
        area.querySelectorAll(".order-word").forEach((btn) => btn.disabled = true);
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

  };

})();
