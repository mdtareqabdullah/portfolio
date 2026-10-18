/* GALLERY — renders the pages from data/site.js and data/projects.js. No framework, no build step. */
(() => {
  const S = window.SITE, P = window.PROJECTS || [], PAIRS = window.PAIRS || [];
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const thumb = (src) => (src.startsWith("assets/img/") ? src.replace(/\.webp$/, "_t.webp") : src);   // only images have _t thumbs
  const pad = (n) => String(n).padStart(2, "0");
  const byId = (id) => P.find((p) => p.id === id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";

  /* ---------------------------------------------------------------- shared */
  $$("[data-site]").forEach((el) => { const v = S[el.dataset.site]; if (v) el.textContent = v; });
  if ($("#yr")) $("#yr").textContent = new Date().getFullYear();
  const links = (S.links || []).filter((l) => l.url);
  if ($("#flinks")) $("#flinks").innerHTML = links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(" &nbsp;·&nbsp; ");

  // "#top" is the fixed header, which is always in view, so the browser never scrolls to it: do it by hand
  $$('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); }));

  const top = $("#top");
  if (top) { const f = () => top.classList.toggle("solid", scrollY > 60); f(); addEventListener("scroll", f, { passive: true }); }

  // light / dark: light is the default; the choice is remembered on this device
  const root = document.documentElement, meta = $('meta[name="theme-color"]');
  const paint = () => meta && (meta.content = root.dataset.theme === "dark" ? "#121214" : "#fafaf8");
  paint();
  if ($("#theme")) $("#theme").addEventListener("click", () => {
    const dark = root.dataset.theme !== "dark";
    if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    paint();
  });

  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .1 });
  const watch = () => $$(".rv:not(.in)").forEach((el) => io.observe(el));
  // inline videos play only while on screen
  const vio = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) { if (v.preload === "none") v.preload = "auto"; v.play().catch(() => {}); } else v.pause(); }), { threshold: .3 });

  // lightbox: images and videos (videos open with sound)
  const lb = $("#lightbox");
  function openLB(src, link) {
    if (!lb) return;
    lb.innerHTML = `<span class="x">Close ✕</span>` + (src.endsWith(".mp4") ? `<video src="${src}" controls autoplay playsinline></video>` : `<img src="${src}" alt="">`) +
      (link ? `<a class="btn v go" href="${link}">Open the project →</a>` : "");
    lb.classList.add("on");
  }
  const closeLB = () => { lb.classList.remove("on"); lb.innerHTML = ""; };
  if (lb) {
    lb.addEventListener("click", (e) => { if (e.target.tagName !== "VIDEO" && !e.target.closest(".go")) closeLB(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeLB(); });
  }

  /* input -> output stage. Auto-scans through pairs; dragging takes over. */
  function stage(root, pairs, auto = true) {
    const board = $(".board", root), inp = $(".in", board), out = $(".out", board);
    let i = 0, x = 100, raf, timer, user = false;
    const set = (v) => { x = v; board.style.setProperty("--x", v + "%"); };
    const show = (k) => {
      i = (k + pairs.length) % pairs.length; const p = pairs[i];
      inp.src = p.input; out.src = p.output;
      // full: the input is the same frame as the output (registered), so it fills the board like the output does
      inp.classList.toggle("full", !!p.full);
      const [l1, l2] = p.labels || ["Input", "Delivered"];
      if ($(".chip.l", board)) { $(".chip.l", board).textContent = l1; $(".chip.r", board).textContent = l2; }
      if ($("#stageName")) $("#stageName").textContent = p.name;
      $$(".dots button", root).forEach((b, j) => b.classList.toggle("on", j === i));
    };
    const scan = () => {
      cancelAnimationFrame(raf); clearTimeout(timer); set(100);
      let t0;
      const end = pairs.length > 1 ? 0 : 50;   // a single pair stops half way, ready to drag
      const step = (t) => { t0 ??= t; const k = Math.min(1, (t - t0) / 2300); const e = 1 - Math.pow(1 - k, 3); set(100 - e * (100 - end));
        if (k < 1) raf = requestAnimationFrame(step); else if (!user && pairs.length > 1) timer = setTimeout(() => { show(i + 1); scan(); }, 2800); };
      timer = setTimeout(() => (raf = requestAnimationFrame(step)), 700);
    };
    const dots = $(".dots", root);
    if (dots) {
      dots.innerHTML = pairs.map((_, j) => `<button aria-label="Example ${j + 1}"></button>`).join("");
      $$("button", dots).forEach((b, j) => b.addEventListener("click", () => { user = false; show(j); scan(); }));
    }
    const drag = (cx) => { const r = board.getBoundingClientRect(); set(Math.min(100, Math.max(0, (cx - r.left) / r.width * 100))); };
    // A mouse drags at once. A finger only drags once it moves sideways; moving up/down scrolls the page
    // (touch-action: pan-y hands vertical gestures to the browser), and a tap moves the divider there.
    let down = false, dragging = false, sx = 0, sy = 0;
    const start = (e) => { dragging = true; user = true; cancelAnimationFrame(raf); clearTimeout(timer); board.setPointerCapture(e.pointerId); drag(e.clientX); };
    board.addEventListener("pointerdown", (e) => { down = true; dragging = false; sx = e.clientX; sy = e.clientY; if (e.pointerType === "mouse") start(e); });
    board.addEventListener("pointermove", (e) => {
      if (!down) return;
      if (dragging) return drag(e.clientX);
      const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
      if (dx > 8 && dx > dy * 1.2) start(e); else if (dy > 8) down = false;
    });
    board.addEventListener("pointerup", (e) => {
      if (down && !dragging && Math.abs(e.clientX - sx) < 8 && Math.abs(e.clientY - sy) < 8) { user = true; cancelAnimationFrame(raf); clearTimeout(timer); drag(e.clientX); }
      down = dragging = false;
    });
    board.addEventListener("pointercancel", () => (down = dragging = false));
    show(0);
    if (auto && !reduced) scan(); else set(50);
  }

  /* ---------------------------------------------------------------- home */
  function home() {
    stage($("#stage"), PAIRS);
    // case studies
    $("#grid").innerHTML = P.map((p, k) => `
      <a class="case rv" href="project.html?p=${p.id}">
        <div class="fl"><span>${pad(k + 1)} — ${esc(p.title)}</span><b>${esc(p.year)}</b></div>
        <div class="media">
          <img src="${thumb(p.cover)}" alt="${esc(p.title)} — ${esc(p.sub)}" loading="lazy">
          ${p.coverVideo ? `<video data-src="${p.coverVideo}" muted loop playsinline preload="none"></video>` : ""}
        </div>
        <div class="info"><h3>${esc(p.title)}</h3><span class="arrow">→</span><span class="sub">${esc(p.sub)}</span>
          <div class="chips">${p.assessment ? `<span class="chip">Unofficial assessment</span>` : ""}${p.concept ? `<span class="chip">Concept</span>` : ""}${p.archive ? `<span class="chip">Archive</span>` : ""}${p.cats.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div></div>
      </a>`).join("");
    $$("#grid .case").forEach((a) => {
      const v = $("video", a); if (!v) return;
      a.addEventListener("pointerenter", () => { if (!v.src) { v.src = v.dataset.src; v.addEventListener("canplay", () => v.classList.add("ready"), { once: true }); } v.play().catch(() => {}); });
      a.addEventListener("pointerleave", () => v.pause());
    });
    // AI lab pipeline (the Frostline 'Break the ice' piece, step by step)
    const steps = [
      ["assets/img/frostline/product.webp", "Product photo", "One clean shot. The edge is cleaned so no white halo survives.", true],
      ["assets/img/frostline/comp.webp", "Layout", "The product placed at the size, angle and position the idea needs."],
      ["assets/img/frostline/scene.webp", "Composite", "Image models build the scene around the real product; I pick the best take."],
      ["assets/img/frostline/ice_portrait.webp", "Design", "Typography and brand system; the headline sits behind the product."],
      ["video:assets/video/frostline/ice_story.mp4", "Motion & formats", "Story, feed and banner — still and animated."],
    ];
    $("#pipe").innerHTML = steps.map(([src, h, t, contain]) => `<div class="st"><div class="media">${src.startsWith("video:")
      ? `<video src="${src.slice(6)}" poster="${src.slice(6).replace(/\.mp4$/, ".webp")}" muted loop playsinline preload="none"></video>` : `<img class="${contain ? "contain" : ""}" src="${thumb(src)}" alt="${esc(h)}" loading="lazy">`}</div><h4>${esc(h)}</h4><p>${esc(t)}</p></div>`).join("");
    $$("#pipe video").forEach((v) => vio.observe(v));

    // about: photo, three paragraphs, tools in one compact block (the CV has the rest)
    $("#photo").innerHTML = `<img src="${esc(S.photo)}" alt="${esc(S.name)}">`;
    $("#aboutText").innerHTML = S.about.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#tools").innerHTML = S.toolkit.map((g) => `<div><span>${esc(g.group)}</span>${g.items.map(esc).join(", ")}</div>`).join("");

    // contact
    const mail = $("#mail");
    mail.href = "mailto:" + S.email;
    mail.addEventListener("click", (e) => {
      if (!navigator.clipboard) return;
      e.preventDefault(); navigator.clipboard.writeText(S.email).then(() => { mail.classList.add("ok"); setTimeout(() => mail.classList.remove("ok"), 1600); location.href = "mailto:" + S.email; });
    });
    const row = [];
    if (S.whatsapp) row.push(`<a class="btn v" href="https://wa.me/${esc(S.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>`);
    row.push(`<a class="btn ${S.whatsapp ? "" : "v"}" href="cv.html">View CV</a>`);
    if (S.cvPdf) row.push(`<a class="btn" href="${esc(S.cvPdf)}" download="${esc(S.name)} — CV.pdf">Download CV (PDF)</a>`);
    links.forEach((l) => row.push(`<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`));
    $("#contactRow").innerHTML = row.join("");

    // nav highlight
    const navA = $$(".nav a");
    const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) navA.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
    $$("section[id]").forEach((s) => so.observe(s));
    watch();
  }

  /* ---------------------------------------------------------------- case study */
  function project() {
    const id = new URLSearchParams(location.search).get("p");
    const i = Math.max(0, P.findIndex((p) => p.id === id)), p = P[i], nx = P[(i + 1) % P.length];
    document.title = `${p.title} — ${S.name}`;
    const media = (g) => g.video
      ? `<video src="${g.video}" poster="${g.poster}" muted loop playsinline preload="none"></video>`
      : `<img src="${g.src}" alt="${esc(g.cap || g.fmt || p.title)}" loading="lazy">`;
    $("#cs").innerHTML = `
      <section class="cs-hero"><div class="wrap">
        <a class="back" href="index.html#work">← All work</a>
        <div class="fl rv"><span>${pad(i + 1)} — ${esc(p.cats.join(" · "))}</span><b>${p.assessment ? "Unofficial assessment · " : ""}${p.concept ? "Concept · " : ""}${p.archive ? "Archive · " : ""}${esc(p.year)}</b></div>
        <h1 class="rv">${esc(p.title)}</h1><p class="lead rv">${esc(p.sub)}</p>${p.note ? `<p class="cs-note rv">${esc(p.note)}</p>` : ""}
        <dl class="cs-meta rv"><div><dt>Client</dt><dd>${esc(p.client)}</dd></div><div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
          <div><dt>Role</dt><dd>${esc(p.role)}</dd></div><div><dt>Tools</dt><dd>${p.tools.map(esc).join(", ")}</dd></div></dl>
      </div></section>
      <div class="wrap">
        <div class="cs-cover rv"><div class="media"><img src="${p.coverWide || p.cover}" alt="${esc(p.title)}"></div></div>
        <div class="cs-text rv"><div><h3>Brief</h3><p>${esc(p.brief)}</p></div><div><h3>Approach</h3><p>${esc(p.approach)}</p></div><div><h3>Outcome</h3><p>${esc(p.outcome)}</p>${(p.links || []).length ? `<p class="cs-links">${p.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</p>` : ""}</div></div>
        ${p.before ? `<div class="cs-compare rv"><div class="stage" id="cmp"><div class="fl"><span>input → delivered</span><b>Drag</b></div><div class="board"><img class="in" alt=""><div class="outw"><img class="out" alt=""></div><div class="scan"></div><span class="chip l">Input</span><span class="chip r">Delivered</span></div></div>
          <div><div class="label">Before / after</div><h2>${p.compareHead || `One product photo <span class="it">in</span>`}</h2><p>${esc(p.compareText || "The product is the real photo, kept exact. The world around it is composited, then designed.")}</p></div></div>` : ""}
        <div class="gal">${p.gallery.map((g) => g.section ? `<div class="gsec rv"><span class="label">${esc(g.section)}</span>${g.text ? `<p>${esc(g.text)}</p>` : ""}</div>` : `<figure class="rv ${g.wide ? "wide" : ""} ${g.tall ? "tall" : ""} ${g.contain ? "contain" : ""}" data-full="${g.video || g.src}">
          <div class="fl"><span>${esc(g.fmt || "Frame")}</span><b>${esc(g.cap || "")}</b></div><div class="media">${media(g)}</div></figure>`).join("")}</div>
        <a class="next" href="project.html?p=${nx.id}"><span class="label">Next — ${pad((i + 1) % P.length + 1)}</span><b>${esc(nx.title)} →</b></a>
      </div>`;
    if (p.before) stage($("#cmp"), [{ input: p.before, output: p.after, name: "", full: p.beforeFull, labels: p.compareLabels }]);
    $$(".gal video").forEach((v) => vio.observe(v));
    $(".gal").addEventListener("click", (e) => { const f = e.target.closest("figure"); if (f) openLB(f.dataset.full); });
    watch();
  }

  if (page === "home") home();
  if (page === "project") project();
})();
