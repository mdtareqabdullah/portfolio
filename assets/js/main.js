/* ARTBOARD — renders the pages from data/site.js and data/projects.js. No framework, no build step. */
(() => {
  const S = window.SITE, P = window.PROJECTS || [], WALL = window.WALL || [], PAIRS = window.PAIRS || [];
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const thumb = (src) => (src.startsWith("assets/img/") ? src.replace(/\.webp$/, "_t.webp") : src);   // only images have _t thumbs
  const pad = (n) => String(n).padStart(2, "0");
  const byId = (id) => P.find((p) => p.id === id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  // a file-style name for the design-tool labels: "Md. Tareque Abdullah" -> "tareque-abdullah"
  const slug = S.name.toLowerCase().replace(/^md\.?\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  /* ---------------------------------------------------------------- shared */
  $$("[data-site]").forEach((el) => { const v = S[el.dataset.site]; if (v) el.textContent = v; });
  if ($("#yr")) $("#yr").textContent = new Date().getFullYear();
  const links = (S.links || []).filter((l) => l.url);
  if ($("#flinks")) $("#flinks").innerHTML = links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(" &nbsp;·&nbsp; ");

  // "#top" is the fixed header, which is always in view, so the browser never scrolls to it: do it by hand
  $$('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); }));

  const top = $("#top");
  if (top) { const f = () => top.classList.toggle("solid", scrollY > 60); f(); addEventListener("scroll", f, { passive: true }); }

  const cur = $(".cursor");
  if (cur && matchMedia("(hover: hover)").matches) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; });
    const loop = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener("pointerover", (e) => {
      const v = e.target.closest("[data-cursor]"), a = e.target.closest("a,button");
      cur.classList.toggle("view", !!v); cur.classList.toggle("link", !v && !!a);
      if (v) cur.querySelector("span").textContent = v.dataset.cursor;
    });
  }

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
    // headline, word by word
    const words = ["Creative", "designer", "for", "brands", "that", "*sell.*"];
    $("#h1").innerHTML = words.map((w, k) => {
      const it = w.startsWith("*"); const t = esc(w.replace(/\*/g, ""));
      return `<span class="w"><span style="animation-delay:${k * .07}s" class="${it ? "it" : ""}">${t}</span></span>`;
    }).join(" ");
    $("#stats").innerHTML = S.stats.map((s) => `<div><b>${esc(s.n)}${s.unit ? `<sup>${esc(s.unit)}</sup>` : ""}</b><span>${esc(s.label)}</span></div>`).join("");
    stage($("#stage"), PAIRS);
    const m = S.ticker.map((x) => `<span>${esc(x)}</span>`).join("");
    $("#marq").innerHTML = m + m;

    // case studies
    const cats = ["All", ...new Set(P.flatMap((p) => p.cats))];
    const count = (c) => (c === "All" ? P.length : P.filter((p) => p.cats.includes(c)).length);
    $("#filters").innerHTML = cats.map((c, k) => `<button class="${k ? "" : "on"}" data-c="${esc(c)}">${esc(c)}<sup>${count(c)}</sup></button>`).join("");
    $("#grid").innerHTML = P.map((p, k) => `
      <a class="case rv ${k < 2 ? "big" : ""}" href="project.html?p=${p.id}" data-cats="${esc(p.cats.join("|"))}" data-cursor="Open">
        <div class="fl"><span>${pad(k + 1)} — ${esc(p.title)}</span><b>${esc(p.year)}</b></div>
        <div class="crops"><div class="media">
          <img src="${thumb(p.cover)}" alt="${esc(p.title)} — ${esc(p.sub)}" loading="lazy">
          ${p.coverVideo ? `<video data-src="${p.coverVideo}" muted loop playsinline preload="none"></video>` : ""}
          <i class="sel"></i></div></div>
        <div class="info"><h3>${esc(p.title)}</h3><span class="arrow">→</span><span class="sub">${esc(p.sub)}</span>
          <div class="chips">${p.concept ? `<span class="chip c">Concept</span>` : ""}${p.archive ? `<span class="chip c">Archive</span>` : ""}${p.cats.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div></div>
      </a>`).join("");
    $$("#grid .case").forEach((a) => {
      const v = $("video", a); if (!v) return;
      a.addEventListener("pointerenter", () => { if (!v.src) { v.src = v.dataset.src; v.addEventListener("canplay", () => v.classList.add("ready"), { once: true }); } v.play().catch(() => {}); });
      a.addEventListener("pointerleave", () => v.pause());
    });
    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#filters button").forEach((x) => x.classList.toggle("on", x === b));
      $$("#grid .case").forEach((t) => t.classList.toggle("hide", b.dataset.c !== "All" && !t.dataset.cats.split("|").includes(b.dataset.c)));
    });

    // creative wall
    $("#wall").innerHTML = WALL.map((w) => `<a href="${w.src}" data-id="${w.id}" data-fmt="${esc(w.fmt)}" data-title="${esc((byId(w.id) || {}).title || "")}" data-cursor="View" class="rv"><img src="${thumb(w.src)}" alt="" loading="lazy"></a>`).join("");
    $("#wall").addEventListener("click", (e) => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); openLB(a.getAttribute("href"), "project.html?p=" + a.dataset.id); });

    // motion reel, mixed like the wall: one project after another (never two cuts of one project side by side), a
    // banner after every three vertical cuts, and one vertical cut per concept (the story, not also its 4:5 twin)
    const all = P.flatMap((p) => p.gallery.filter((g) => g.video).map((g) => ({ ...g, p })));
    const concept = (g) => g.video.replace(/_(story|portrait|landscape)\.mp4$/, "");
    const seen = new Set(), tall = [], wide = [];
    for (const g of [...all].sort((a, b) => /_story\./.test(b.video) - /_story\./.test(a.video))) {
      if (g.wide) { wide.push(g); continue; }
      if (seen.has(concept(g))) continue;
      seen.add(concept(g)); tall.push(g);
    }
    const deal = (list) => {      // round-robin across projects, in project order
      const by = P.map((p) => list.filter((g) => g.p === p)), out = [];
      for (let i = 0; by.some((q) => q.length > i); i++) by.forEach((q) => q[i] && out.push(q[i]));
      return out;
    };
    const T = deal(tall), Wd = deal(wide), vids = [];
    T.forEach((g, i) => {
      vids.push(g);
      if (i % 3 !== 2) return;
      // the banner here must belong to neither neighbour
      const near = new Set([...vids.slice(-4), ...T.slice(i + 1, i + 4)].map(concept));      // nor repeat a concept just seen in another format
      const k = Wd.findIndex((w) => w.p !== g.p && (!T[i + 1] || w.p !== T[i + 1].p) && !near.has(concept(w)));
      if (k >= 0) vids.push(Wd.splice(k, 1)[0]);
    });
    // banners left over go in from the end, each where neither neighbour is its own project
    for (const w of Wd) {
      let j = vids.length;
      while (j > 1 && (vids[j - 1].p === w.p || (vids[j] && vids[j].p === w.p) || vids[j - 1].wide)) j--;
      vids.splice(j, 0, w);
    }
    $("#reel").innerHTML = vids.map((g) => `<figure data-full="${g.video}" data-id="${g.p.id}" data-cursor="Play">
        <div class="v ${g.wide ? "wide" : ""}"><video src="${g.video}" poster="${g.poster}" muted loop playsinline preload="none"></video>${g.p.id === "brand-shorts" ? `<span class="sound">Voice-over · tap</span>` : ""}</div>
        <figcaption><b>${esc(g.p.title)}</b><span>${esc(g.fmt || "")}</span></figcaption></figure>`).join("");
    $$("#reel video").forEach((v) => vio.observe(v));
    $("#reel").addEventListener("click", (e) => { const f = e.target.closest("figure"); if (f) openLB(f.dataset.full, "project.html?p=" + f.dataset.id); });

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

    // services
    $("#svc").innerHTML = S.services.map((s) => `<article class="rv"><div class="n">${esc(s.no)}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
      <div class="del">${(s.deliver || []).map((d) => `<span class="chip">${esc(d)}</span>`).join("")}</div>
      ${s.proof.length ? `<div class="proof">${s.proof.map((id) => `<a href="project.html?p=${id}">${esc((byId(id) || {}).title || id)} →</a>`).join("")}</div>` : ""}</article>`).join("");

    // experience
    $("#nums").innerHTML = S.stats.map((s) => `<div><b>${esc(s.n)}</b><span>${esc(s.label)}</span></div>`).join("");
    $("#timeline").innerHTML = S.experience.map((x) => `<article class="rv"><div class="yrs">${esc(x.years)}</div><div><h3>${esc(x.title)}</h3><h4>${esc(x.org)}</h4>
      <ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></article>`).join("") +
      (S.education || []).map((x) => `<article class="rv"><div class="yrs">${esc(x.years)}</div><div><h3>${esc(x.title)}</h3><h4>${esc(x.org)}</h4></div></article>`).join("");

    // toolkit: a layers panel
    const eye = `<svg class="eye" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 8s2.6-5 7-5 7 5 7 5-2.6 5-7 5-7-5-7-5Z"/><circle cx="8" cy="8" r="2.2"/></svg>`;
    const folder = `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1.5 4.5h4l1.5 1.5h7.5v7h-13z"/></svg>`;
    const swc = ["#d4ff2e", "#8AD8FF", "#F2A65A", "#E8191F", "#efece4", "#7B2CF5"];
    let ci = 0;
    $("#panel").innerHTML = `<div class="bar"><i></i><i></i><i></i><span>${esc(slug)}.psd — Layers</span></div>
      <div class="tabs"><b>Layers</b><span>Channels</span><span>Paths</span></div>
      ${S.toolkit.map((g) => `<div class="row grp">${eye}${folder}<span>${esc(g.group)}</span><span class="lock">${g.items.length}</span></div>` +
        g.items.map((t) => `<div class="row item">${eye}<i class="sw" style="background:${swc[ci++ % swc.length]}"></i><span>${esc(t)}</span><span class="lock">🔒</span></div>`).join("")).join("")}
      <div class="foot"><span>${S.toolkit.reduce((n, g) => n + g.items.length, 0)} layers · ${S.toolkit.length} groups</span><span>RGB / 8</span></div>`;
    $("#panel").addEventListener("click", (e) => {
      const r = e.target.closest(".row"); if (!r) return;
      if (e.target.closest(".eye")) r.classList.toggle("off");
      else { $$("#panel .row").forEach((x) => x.classList.remove("sel")); r.classList.add("sel"); }
    });
    $("#langs").innerHTML = (S.languages || []).map((l) => `<div><b>${esc(l.name)}</b><span>${esc(l.level)}</span></div>`).join("");

    // about: the portrait as a selected frame
    $("#selframe").innerHTML = `<span class="name">${esc(slug)}.png</span>
      <div class="ph"><img src="${esc(S.photo)}" alt="${esc(S.name)}"></div>
      <div class="box"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="dim">${esc(S.roleLong)}</span>`;
    $("#aboutText").innerHTML = S.about.map((p) => `<p>${esc(p)}</p>`).join("");

    // behance archive
    const be = S.behance || [], beLink = links.find((l) => /behance/i.test(l.label));
    if (be.length || beLink) {
      $("#behance").hidden = false;
      $("#be").innerHTML = be.map((b) => `<a href="${esc(b.url)}" target="_blank" rel="noopener" class="rv" data-cursor="Behance"><div class="fl"><span>${esc(b.cat || "Project")}</span><b>${esc(b.year || "")}</b></div>
        <div class="media"><img src="${esc(b.cover)}" alt="${esc(b.title)}" loading="lazy"></div><h3>${esc(b.title)}</h3><span>View on Behance ↗</span></a>`).join("");
      if (beLink) $("#beMore").innerHTML = `<a class="btn" href="${esc(beLink.url)}" target="_blank" rel="noopener">All projects on Behance ↗</a>`;
    }

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
    if (S.cvPdf) row.push(`<a class="btn" href="${esc(S.cvPdf)}" download>Download CV (PDF)</a>`);
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
    document.documentElement.style.setProperty("--accent", p.accent || "#d4ff2e");
    const media = (g) => g.video
      ? `<video src="${g.video}" poster="${g.poster}" muted loop playsinline preload="none"></video>`
      : `<img src="${g.src}" alt="${esc(g.cap || g.fmt || p.title)}" loading="lazy">`;
    $("#cs").innerHTML = `
      <section class="cs-hero canvas-bg"><div class="wrap">
        <a class="back" href="index.html#work">← All work</a>
        <div class="fl rv"><span>${pad(i + 1)} — ${esc(p.cats.join(" · "))}</span><b>${p.concept ? "Concept · " : ""}${p.archive ? "Archive · " : ""}${esc(p.year)}</b></div>
        <h1 class="rv">${esc(p.title)}</h1><p class="lead rv">${esc(p.sub)}</p>
        <dl class="cs-meta rv"><div><dt>Client</dt><dd>${esc(p.client)}</dd></div><div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
          <div><dt>Role</dt><dd>${esc(p.role)}</dd></div><div><dt>Tools</dt><dd>${p.tools.map(esc).join(", ")}</dd></div></dl>
      </div></section>
      <div class="wrap">
        <div class="cs-cover rv"><div class="fl"><span>Cover</span><b>${esc(p.title)}</b></div><div class="crops"><div class="media"><img src="${p.cover}" alt="${esc(p.title)}"></div></div></div>
        <div class="cs-text rv"><div><h3>Brief</h3><p>${esc(p.brief)}</p></div><div><h3>Approach</h3><p>${esc(p.approach)}</p></div><div><h3>Outcome</h3><p>${esc(p.outcome)}</p>${(p.links || []).length ? `<p class="cs-links">${p.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</p>` : ""}</div></div>
        ${p.before ? `<div class="cs-compare rv"><div class="stage" id="cmp"><div class="fl"><span>input → delivered</span><b>Drag</b></div><div class="crops"><div class="board" data-cursor="Drag"><img class="in" alt=""><div class="outw"><img class="out" alt=""></div><div class="scan"></div><span class="chip l">Input</span><span class="chip r">Delivered</span></div></div></div>
          <div><div class="label">Before / after</div><h2>${p.compareHead || `One product photo <span class="it" style="color:var(--accent)">in</span>`}</h2><p style="color:var(--chalk-2);max-width:460px">${esc(p.compareText || "The product is the real photo, kept exact. The world around it is composited, then designed.")}</p></div></div>` : ""}
        <div class="gal">${p.gallery.map((g) => g.section ? `<div class="gsec rv"><span class="label">${esc(g.section)}</span>${g.text ? `<p>${esc(g.text)}</p>` : ""}</div>` : `<figure class="rv ${g.wide ? "wide" : ""} ${g.tall ? "tall" : ""} ${g.contain ? "contain" : ""}" data-full="${g.video || g.src}" data-cursor="${g.video ? "Play" : "Zoom"}">
          <div class="fl"><span>${esc(g.fmt || "Frame")}</span><b>${esc(g.cap || "")}</b></div><div class="media">${media(g)}</div></figure>`).join("")}</div>
        <a class="next" href="project.html?p=${nx.id}" data-cursor="Next"><span class="label">Next — ${pad((i + 1) % P.length + 1)}</span><b>${esc(nx.title)} →</b></a>
      </div>`;
    if (p.before) stage($("#cmp"), [{ input: p.before, output: p.after, name: "", full: p.beforeFull, labels: p.compareLabels }]);
    $$(".gal video").forEach((v) => vio.observe(v));
    $(".gal").addEventListener("click", (e) => { const f = e.target.closest("figure"); if (f) openLB(f.dataset.full); });
    watch();
  }

  if (page === "home") home();
  if (page === "project") project();
})();
