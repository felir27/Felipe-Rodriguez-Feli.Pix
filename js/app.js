/* Site logic. You shouldn't need to edit this file — content lives in js/photos.js. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach((c) => c != null && n.append(c));
    return n;
  };

  const fmtDate = (iso) => {
    const d = new Date(iso + "T12:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const exif = (p) => [p.camera, p.lens, p.settings].filter(Boolean).join(" · ");
  const SHOOT_LIST = (typeof SHOOTS !== "undefined" ? SHOOTS : []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const catBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
  const shootBySlug = (slug) => SHOOT_LIST.find((c) => c.slug === slug);
  const photosIn = (slug) => PHOTOS.filter((p) => p.category === slug);
  // A shoot opens on its cover photo, then the rest newest first.
  // (A photo can be in a series via `category` and in a shoot via `shoot` at the same time.)
  const photosInShoot = (slug) => {
    const cover = (SHOOT_LIST.find((s) => s.slug === slug) || {}).cover;
    return PHOTOS.filter((p) => p.shoot === slug)
      .sort((a, b) => (b.src === cover) - (a.src === cover) || b.date.localeCompare(a.date));
  };
  const fmtMonth = (iso) => {
    const d = new Date((iso || "") + "T12:00:00");
    return isNaN(d) ? (iso || "") : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };
  /* Responsive images: js/sizes.js (made by tools/resize.mjs) lists each photo's size and its smaller copies.
     A photo missing from it still works; it just loads the full file. */
  const SIZE_MAP = typeof SIZES !== "undefined" ? SIZES : {};
  const STEPS = typeof SIZE_STEPS !== "undefined" ? SIZE_STEPS : [];
  function imgAttrs(src, sizes) {
    const dim = SIZE_MAP[src];
    if (!dim) return { src };
    const [w, h] = dim;
    const name = src.replace(/^images\//, "");
    const set = STEPS.filter((s) => s < w).map((s) => `images/${s}/${name} ${s}w`).concat(`${src} ${w}w`).join(", ");
    return { src, srcset: set, sizes: sizes || "100vw", width: w, height: h };
  }
  const img = (src, alt, sizes, lazy = true) => el("img", { ...imgAttrs(src, sizes), alt: alt || "", loading: lazy ? "lazy" : null, decoding: "async" });
  const setImg = (node, src, sizes) => { const a = imgAttrs(src, sizes); ["srcset", "sizes", "width", "height"].forEach((k) => a[k] ? node.setAttribute(k, a[k]) : node.removeAttribute(k)); node.src = src; };
  const imgEl = (p, lazy = true, sizes) => img(p.src, p.title, sizes, lazy);
  // A photo's true width/height ratio. Layouts use it so photos are never cropped or stretched.
  const ratioOf = (src) => { const d = SIZE_MAP[src]; return d ? d[0] / d[1] : 1.5; };
  // Split items into rows (2 then 3, repeating); each tile's flex-grow is its photo's ratio,
  // so every photo in a row ends up the same height at its own shape.
  function photoRows(items, srcOf, makeTile, cls) {
    const rows = [];
    for (let i = 0, n = 2; i < items.length; i += n, n = n === 2 ? 3 : 2) rows.push(items.slice(i, i + n));
    return rows.map((row) => el("div", { class: `photo-row ${cls}` }, row.map((it, j) => {
      const t = makeTile(it, row.length);
      t.style.flex = `${ratioOf(srcOf(it)).toFixed(4)} 1 0`;
      return t;
    })));
  }

  /* ---------- Static site text ---------- */
  function fillSite() {
    const first = SITE.name.split(" ")[0];
    const initials = SITE.name.split(/\s+/).map((w) => w[0]).join(".") + ".";
    const set = (key, val) => document.querySelectorAll(`[data-site="${key}"]`).forEach((n) => (n.textContent = val));
    set("name", SITE.name);
    set("first", first);
    set("initials", initials);
    set("tagline-line", [SITE.tagline, SITE.location].filter(Boolean).join(" · "));
    set("pitch", SITE.pitch || "");

    setImg($("#hero-img"), SITE.heroImage, "100vw");
    const heroPhoto = PHOTOS.find((p) => p.src === SITE.heroImage);
    $("#hero-caption").textContent = heroPhoto ? heroPhoto.title : "";
    $("#hero-count").textContent = `${PHOTOS.length} photos · ${CATEGORIES.length} series` + (SHOOT_LIST.length ? ` · ${SHOOT_LIST.length} shoots` : "");

    $("#about-text").replaceChildren(...SITE.about.map((t) => el("p", { text: t })));
    const portrait = PHOTOS.find((p) => p.subject === "portrait" && p.layout === "half") || PHOTOS[0];
    if (SITE.aboutImage || portrait) setImg($("#about-img"), SITE.aboutImage || portrait.src, "(max-width: 820px) 100vw, 400px");
    const years = PHOTOS.map((p) => p.date.slice(0, 4)).sort();
    const facts = [
      ["Based in", SITE.location],
      ["Shoots", (SITE.aboutShoots || SUBJECTS).join(", ")],
      ["Archive", years.length ? `${years[0]}–${years[years.length - 1]}` : ""],
      ["Awards", PHOTOS.filter((p) => p.award).map((p) => `“${p.title}”: ${p.award}`).join("; ")],
    ].filter(([, v]) => v);
    $("#about-facts").replaceChildren(...facts.map(([k, v]) => el("div", {}, el("dt", { text: k }), el("dd", { text: v }))));

    if (!SITE.formEndpoint) $("#f-submit").textContent = "Email this request";
    $("#f-type").replaceChildren(...SITE.requestTypes.map((t) => el("option", { text: t, value: t })));
    $("#contact-email").textContent = SITE.email;
    if (SITE.instagram) { const ig = $("#contact-ig"); ig.href = SITE.instagram; ig.hidden = false; }
    $("#footer-copy").textContent = `© ${new Date().getFullYear()} ${SITE.name}`;
    document.title = `${SITE.name} ${SITE.tagline}`;
  }

  /* ---------- Contact form ---------- */
  function setupForm() {
    const form = $("#contact-form"), status = $("#f-status"), btn = $("#f-submit");
    $("#copy-email").addEventListener("click", () => {
      const done = () => { status.className = "form-status ok"; status.textContent = "Email address copied."; };
      try {
        navigator.clipboard.writeText(SITE.email).then(done, selectAddr);
      } catch (e) { selectAddr(); }
    });
    function selectAddr() {
      const r = document.createRange(); r.selectNodeContents($("#contact-email"));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";
      const bad = [...form.querySelectorAll("[required]")].find((f) => !f.value.trim() || !f.checkValidity());
      if (bad) { status.textContent = `Please fill in “${form.querySelector(`label[for="${bad.id}"]`).textContent}”.`; bad.focus(); return; }
      if (!SITE.formEndpoint) {
        // No form service set up: hand the request to the visitor's email app, filled in.
        const v = (n) => (form.elements[n].value || "").trim();
        const body = [
          `Name: ${v("name")}`, `Email: ${v("email")}`, `Type of request: ${v("request_type")}`,
          v("preferred_date") ? `Preferred date: ${v("preferred_date")}` : "", "", v("message"),
        ].filter((l, i) => l || i > 3).join("\n");
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Photo request: ${v("request_type")}`)}&body=${encodeURIComponent(body)}`;
        status.className = "form-status ok";
        status.textContent = `Your email app should open with this request filled in; press Send there. If nothing opened, email ${SITE.email}.`;
        return;
      }
      btn.disabled = true; status.textContent = "Sending…";
      try {
        const res = await fetch(SITE.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.className = "form-status ok";
        status.textContent = "Thanks, your request was sent. I'll reply by email.";
      } catch (err) {
        status.textContent = `That didn't go through. Try again, or email ${SITE.email}.`;
      } finally { btn.disabled = false; }
    });
  }

  /* ---------- Portfolio (category covers) ---------- */
  function renderPortfolio() {
    $("#all-box-stack").replaceChildren(...PHOTOS.slice(0, 4).map((p) => img(p.src, "", "40px")));
    $("#all-box-count").textContent = ` ${PHOTOS.length} photos, filter by subject, color and date`;
    const coverOf = (c) => c.cover || (photosIn(c.slug)[0] || {}).src;
    $("#cats").replaceChildren(...photoRows(CATEGORIES, coverOf, (c, perRow) => {
      const n = photosIn(c.slug).length;
      return el("a", { class: "cat", href: `#cat-${c.slug}` },
        img(coverOf(c), "", perRow === 2 ? "(max-width: 760px) 100vw, 660px" : "(max-width: 760px) 100vw, 440px"),
        el("div", { class: "cat-label" },
          el("h2", { text: c.name }),
          el("span", { class: "mono", text: `${String(n).padStart(2, "0")} photos →` })));
    }, "cats-row"));

    $("#shoots").hidden = SHOOT_LIST.length === 0;
    $("#shoots-intro").textContent = SITE.shootsIntro || "";
    const shootCover = (sh) => sh.cover || (photosInShoot(sh.slug)[0] || {}).src;
    // One row per three shoots, each card sized to its cover's shape.
    const shootRows = [];
    for (let i = 0; i < SHOOT_LIST.length; i += 3) shootRows.push(SHOOT_LIST.slice(i, i + 3));
    $("#shoot-grid").replaceChildren(...shootRows.map((row) => el("div", { class: "photo-row shoots-row" }, row.map((sh) => {
      const card = el("a", { class: "shoot", href: `#shoot-${sh.slug}`, style: `flex: ${ratioOf(shootCover(sh)).toFixed(4)} 1 0` },
        el("span", { class: "frame" }, img(shootCover(sh), "", "(max-width: 700px) 100vw, 440px")),
        el("span", { class: "row mono" }, el("span", { class: "tag", text: sh.type || "" }), el("span", { text: fmtMonth(sh.date) })),
        el("h3", { text: sh.name }),
        el("p", { class: "client", text: [sh.client, sh.location].filter(Boolean).join(" · ") }));
      return card;
    }))));
  }

  /* ---------- Category / shoot: the whole series as a scrolling sequence ---------- */
  // Justified rows: photos in a row share one height and together fill the width, so they tile
  // with no empty space and none is cropped. `target` is the screen's usable width / height:
  // a row whose ratios add up to about that is exactly one screen tall, so each whole photo
  // fits on screen. Photos are added to a row until it reaches the target.
  function buildRows(list, target) {
    const rows = [];
    let cur = [], s = 0;
    for (const p of list) {
      const r = ratioOf(p.src);
      // Close the row if this photo would overshoot the target by more than the row falls short.
      if (cur.length && s + r - target > target - s) { rows.push(cur); cur = []; s = 0; }
      cur.push(p); s += r;
      if (s >= target) { rows.push(cur); cur = []; s = 0; }
    }
    if (cur.length) {
      // A short leftover joins the row before it if that keeps rows from getting too thin.
      const prev = rows[rows.length - 1], ps = prev ? prev.reduce((a, p) => a + ratioOf(p.src), 0) : 0;
      if (prev && s < target * 0.6 && ps + s <= target * 1.6) prev.push(...cur); else rows.push(cur);
    }
    return rows;
  }
  // Usable width / height for a row: the content width over the screen height minus the header,
  // a caption line and some breathing room (kept in step with --row-h in style.css).
  // The screen height every "fit the whole photo on screen" size is based on. Phones change
  // innerHeight while scrolling (the address bar hides and shows), which made photos resize
  // mid-scroll, so on touch screens it's measured once and only updated when the width changes
  // (rotation). Mouse/trackpad screens follow every window resize. CSS reads it as --screen-h.
  const touchScreen = matchMedia("(hover: none)").matches;
  let screenH = innerHeight, screenW = innerWidth;
  const applyScreenH = () => document.documentElement.style.setProperty("--screen-h", `${screenH}px`);
  applyScreenH();
  function rowTarget() {
    const w = $("#sequence").clientWidth || Math.min(1320, innerWidth);
    const h = screenH - 60 - 96;
    return Math.max(1.2, w / Math.max(240, h));
  }
  let seqState = null;
  window.addEventListener("resize", () => {
    if (touchScreen && innerWidth === screenW) return; // only the address bar moved: keep everything still
    screenW = innerWidth; screenH = innerHeight; applyScreenH();
    if (!seqState || $("#view-category").hidden) return;
    const t = rowTarget();
    if (Math.abs(t - seqState.target) / seqState.target > 0.12) renderCategory(seqState.slug, seqState.kind);
  });

  function figure(p, list, lazy, sizes) {
    return el("figure", {},
      el("button", { type: "button", class: "open", "aria-label": `Open ${p.title} full screen`, onclick: () => openLightbox(list, list.indexOf(p)) }, imgEl(p, lazy, sizes)),
      el("figcaption", {}, el("span", { class: "t", text: p.title }),
        el("span", { class: "mono", text: [fmtDate(p.date), exif(p)].filter(Boolean).join(" · ") }),
        awardEl(p)));
  }
  // A photo's award (the `award` field in photos.js), shown in amber under its caption.
  const awardEl = (p) => p.award ? el("span", { class: "award mono", text: `★ ${p.award}` }) : null;

  function renderCategory(slug, kind) {
    const isShoot = kind === "shoot";
    const c = isShoot ? shootBySlug(slug) : catBySlug(slug);
    if (!c) { location.hash = isShoot ? "shoots" : "portfolio"; return; }
    const list = isShoot ? photosInShoot(slug) : photosIn(slug);
    $("#cat-title").textContent = c.name;
    $("#cat-blurb").textContent = c.blurb || "";
    const back = $("#cat-back");
    back.href = isShoot ? "#shoots" : "#portfolio";
    back.textContent = isShoot ? "← Past shoots" : "← Portfolio";
    const meta = $("#cat-meta");
    meta.hidden = !isShoot;
    if (isShoot) meta.replaceChildren(...[c.type, fmtMonth(c.date), c.client, c.location].filter(Boolean)
      .map((t, i) => el("span", { class: i === 0 ? "tag" : null, text: t })));
    const target = rowTarget();
    seqState = { slug, kind, target };
    $("#sequence").replaceChildren(...(list.length ? buildRows(list, target).map((row, i) => {
      const total = row.reduce((s, p) => s + ratioOf(p.src), 0);
      // --sum and --n let CSS cap the row's width so its height never exceeds the screen.
      return el("div", { class: "photo-row seq-row", style: `--sum: ${total.toFixed(4)}; --n: ${row.length}` },
        row.map((p) => {
          const r = ratioOf(p.src);
          const f = figure(p, list, i > 0, `(max-width: 760px) 100vw, ${Math.round(1320 * r / total)}px`);
          f.style.flex = `${r.toFixed(4)} 1 0`;
          f.style.setProperty("--r", r.toFixed(4));
          return f;
        }));
    }) : [el("p", { class: "empty", text: "No photos here yet." })]));
    const group = isShoot ? SHOOT_LIST : CATEGORIES;
    const ci = group.indexOf(c), nxt = group[(ci + 1) % group.length];
    const nl = $("#cat-next-link");
    nl.hidden = group.length < 2;
    nl.href = `#${isShoot ? "shoot" : "cat"}-${nxt.slug}`; nl.textContent = `Next: ${nxt.name} →`;
  }

  /* ---------- All photos (filters + grid) ---------- */
  const flt = { subject: null, color: null, year: "", sort: "new" };
  let filtered = [];

  function setupFilters() {
    const subjRow = $("#flt-subject");
    const mkChip = (label, val) => el("button", { type: "button", class: "chip", "aria-pressed": "false", "data-val": val ?? "", text: label,
      onclick: () => { flt.subject = flt.subject === val ? null : val; syncFilters(); } });
    subjRow.append(mkChip("All", null), ...SUBJECTS.map((s) => mkChip(s, s)));

    const colorRow = $("#flt-color");
    const used = new Set(PHOTOS.map((p) => p.color));
    Object.entries(COLORS).filter(([name]) => used.has(name)).forEach(([name, hex]) => {
      colorRow.append(el("button", { type: "button", class: "swatch", style: `background:${hex}`, title: name, "aria-label": name, "aria-pressed": "false", "data-val": name,
        onclick: () => { flt.color = flt.color === name ? null : name; syncFilters(); } }));
    });

    const years = [...new Set(PHOTOS.map((p) => p.date.slice(0, 4)))].sort().reverse();
    $("#flt-year").replaceChildren(el("option", { value: "", text: "Any year" }), ...years.map((y) => el("option", { value: y, text: y })));
    $("#flt-year").addEventListener("change", (e) => { flt.year = e.target.value; syncFilters(); });
    $("#flt-sort").addEventListener("change", (e) => { flt.sort = e.target.value; syncFilters(); });
    $("#clear-filters").addEventListener("click", () => { Object.assign(flt, { subject: null, color: null, year: "", sort: "new" }); syncFilters(); });
    syncFilters();
  }

  function syncFilters() {
    $("#flt-subject").querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.val || null) === flt.subject)));
    $("#flt-color").querySelectorAll(".swatch").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.val === flt.color)));
    $("#flt-year").value = flt.year; $("#flt-sort").value = flt.sort;
    filtered = PHOTOS.filter((p) =>
      (!flt.subject || p.subject === flt.subject) &&
      (!flt.color || p.color === flt.color) &&
      (!flt.year || p.date.startsWith(flt.year)))
      .sort((a, b) => flt.sort === "new" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    const any = flt.subject || flt.color || flt.year;
    $("#clear-filters").hidden = !any && flt.sort === "new";
    $("#result-count").textContent = `${filtered.length} of ${PHOTOS.length} photos`;
    $("#grid-empty").hidden = filtered.length > 0;
    $("#grid").replaceChildren(...filtered.map((p, idx) =>
      el("button", { type: "button", class: "tile", "aria-label": `Open ${p.title}`, onclick: () => openLightbox(filtered, idx) },
        imgEl(p, true, "(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 440px"),
        el("span", { class: "meta" },
          el("span", { class: "t" }, el("span", { class: "dot", style: `background:${COLORS[p.color] || "#888"}` }), p.title),
          el("span", { class: "mono", text: `${fmtDate(p.date)} · ${p.subject}` }),
          exif(p) ? el("span", { class: "mono exif", text: exif(p) }) : null,
          awardEl(p)))));
  }

  /* ---------- Lightbox ---------- */
  let lb = 0, lbList = [], lastFocus = null;
  function openLightbox(list, idx) { lastFocus = document.activeElement; lbList = list; lb = idx; $("#lightbox").hidden = false; document.body.style.overflow = "hidden"; drawLightbox(); $("#lb-close").focus(); }
  function closeLightbox() { $("#lightbox").hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); }
  function drawLightbox() {
    const p = lbList[lb]; if (!p) return closeLightbox();
    setImg($("#lb-img"), p.src, "100vw"); $("#lb-img").alt = p.title;
    $("#lb-count").textContent = `${lb + 1} / ${lbList.length}`;
    const cat = p.shoot ? shootBySlug(p.shoot) : catBySlug(p.category);
    $("#lb-cap").replaceChildren(el("span", { class: "t", text: p.title }),
      el("span", { class: "mono", text: [fmtDate(p.date), cat && cat.name, exif(p)].filter(Boolean).join(" · ") }),
      awardEl(p) || "");
  }
  function stepLightbox(d) {
    lb = (lb + d + lbList.length) % lbList.length; drawLightbox();
    // Warm the next photo in the same direction so stepping feels instant.
    const n = lbList[(lb + d + lbList.length) % lbList.length];
    if (n) { const pre = new Image(), a = imgAttrs(n.src, "100vw"); if (a.srcset) { pre.sizes = a.sizes; pre.srcset = a.srcset; } pre.src = n.src; }
  }
  function setupLightbox() {
    $("#lb-close").addEventListener("click", closeLightbox);
    $("#lb-prev").addEventListener("click", () => stepLightbox(-1));
    $("#lb-next").addEventListener("click", () => stepLightbox(1));
    $("#lightbox").addEventListener("click", (e) => { if (e.target.classList.contains("img-wrap")) closeLightbox(); });
  }

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select")) return;
    if (!$("#lightbox").hidden) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
      return;
    }
  });

  /* ---------- Routing (hash based, works on GitHub Pages) ---------- */
  const views = ["home", "portfolio", "category", "all"];
  function show(name) {
    views.forEach((v) => { $(`#view-${v}`).hidden = v !== name; });
  }
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    let active = "";
    if (h === "portfolio") { show("portfolio"); active = "portfolio"; window.scrollTo(0, 0); }
    else if (h === "all") { show("all"); active = "all"; window.scrollTo(0, 0); }
    else if (h.startsWith("cat-")) { show("category"); active = "portfolio"; renderCategory(h.slice(4), "cat"); window.scrollTo(0, 0); }
    else if (h.startsWith("shoot-")) { show("category"); active = "shoots"; renderCategory(h.slice(6), "shoot"); window.scrollTo(0, 0); }
    else if (h === "shoots") {
      const wasHidden = $("#view-portfolio").hidden;
      show("portfolio"); active = "shoots";
      requestAnimationFrame(() => $("#shoots").scrollIntoView({ behavior: wasHidden ? "auto" : "smooth" }));
    }
    else {
      const wasHidden = $("#view-home").hidden;
      show("home");
      if (h === "about" || h === "contact") {
        active = h;
        requestAnimationFrame(() => $("#" + h).scrollIntoView({ behavior: wasHidden ? "auto" : "smooth" }));
      } else window.scrollTo(0, 0);
    }
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.dataset.nav === active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    closeMenu();
    updateHeader();
  }
  // Clicking a link to the hash you're already on should still work.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href") === location.hash) { e.preventDefault(); route(); }
  });

  /* ---------- Phone menu ---------- */
  function closeMenu() {
    $("#nav").classList.remove("open");
    $("#menu-btn").setAttribute("aria-expanded", "false");
    $("#menu-btn").textContent = "Menu";
  }
  function setupMenu() {
    $("#menu-btn").addEventListener("click", () => {
      const open = !$("#nav").classList.contains("open");
      if (open) {
        $("#nav").classList.add("open");
        $("#menu-btn").setAttribute("aria-expanded", "true");
        $("#menu-btn").textContent = "Close";
      } else closeMenu();
      updateHeader();
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-header") && $("#nav").classList.contains("open")) { closeMenu(); updateHeader(); }
    });
  }

  /* ---------- Light / dark switch ---------- */
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function currentTheme() {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return darkQuery.matches ? "dark" : "light";
  }
  function syncSwitch() {
    const dark = currentTheme() === "dark";
    const b = $("#theme-toggle");
    b.setAttribute("aria-checked", String(dark));
    b.title = dark ? "Switch to light mode" : "Switch to dark mode";
  }
  function setupTheme() {
    $("#theme-toggle").addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncSwitch();
    });
    if (darkQuery.addEventListener) darkQuery.addEventListener("change", syncSwitch);
    syncSwitch();
  }

  function updateHeader() {
    const onHome = !$("#view-home").hidden;
    const menuOpen = $("#nav").classList.contains("open");
    const overHero = !menuOpen && onHome && window.scrollY < $(".hero").offsetHeight - 70;
    $("#site-header").classList.toggle("solid", !overHero);
    $("#site-header").classList.toggle("over-photo", overHero);
  }

  /* ---------- Boot ---------- */
  fillSite();
  setupForm();
  renderPortfolio();
  setupFilters();
  setupLightbox();
  setupMenu();
  setupTheme();
  window.addEventListener("hashchange", route);
  window.addEventListener("scroll", updateHeader, { passive: true });
  route();
})();
