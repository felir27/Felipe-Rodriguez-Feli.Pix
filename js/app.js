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
  const photosInShoot = (slug) => PHOTOS.filter((p) => p.shoot === slug);
  const fmtMonth = (iso) => {
    const d = new Date((iso || "") + "T12:00:00");
    return isNaN(d) ? (iso || "") : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };
  const imgEl = (p, lazy = true) => el("img", { src: p.src, alt: p.title || "", loading: lazy ? "lazy" : null, decoding: "async" });

  /* ---------- Static site text ---------- */
  function fillSite() {
    const first = SITE.name.split(" ")[0];
    const initials = SITE.name.split(/\s+/).map((w) => w[0]).join(".") + ".";
    const set = (key, val) => document.querySelectorAll(`[data-site="${key}"]`).forEach((n) => (n.textContent = val));
    set("name", SITE.name);
    set("first", first);
    set("initials", initials);
    set("tagline-line", [SITE.tagline, SITE.location].filter(Boolean).join(" · "));

    $("#hero-img").src = SITE.heroImage;
    const heroPhoto = PHOTOS.find((p) => p.src === SITE.heroImage);
    $("#hero-caption").textContent = heroPhoto ? heroPhoto.title : "";
    $("#hero-count").textContent = `${PHOTOS.length} photos · ${CATEGORIES.length} series` + (SHOOT_LIST.length ? ` · ${SHOOT_LIST.length} shoots` : "");

    $("#about-text").replaceChildren(...SITE.about.map((t) => el("p", { text: t })));
    const portrait = PHOTOS.find((p) => p.subject === "portrait" && p.layout === "half") || PHOTOS[0];
    if (SITE.aboutImage || portrait) { $("#about-img").src = SITE.aboutImage || portrait.src; }
    const years = PHOTOS.map((p) => p.date.slice(0, 4)).sort();
    const facts = [
      ["Based in", SITE.location],
      ["Shoots", (SITE.aboutShoots || SUBJECTS).join(", ")],
      ["Archive", years.length ? `${years[0]}–${years[years.length - 1]}` : ""],
    ].filter(([, v]) => v);
    $("#about-facts").replaceChildren(...facts.map(([k, v]) => el("div", {}, el("dt", { text: k }), el("dd", { text: v }))));

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
        status.textContent = `The form isn't connected yet. Email ${SITE.email} directly for now.`;
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
    $("#all-box-stack").replaceChildren(...PHOTOS.slice(0, 4).map((p) => el("img", { src: p.src, alt: "", loading: "lazy" })));
    $("#all-box-count").textContent = ` ${PHOTOS.length} photos, filter by subject, color and date`;
    $("#cats").replaceChildren(...CATEGORIES.map((c) => {
      const n = photosIn(c.slug).length;
      return el("a", { class: "cat", href: `#cat-${c.slug}` },
        el("img", { src: c.cover || (photosIn(c.slug)[0] || {}).src, alt: "", loading: "lazy" }),
        el("div", { class: "cat-label" },
          el("h2", { text: c.name }),
          el("span", { class: "mono", text: `${String(n).padStart(2, "0")} photos →` })));
    }));

    $("#shoots").hidden = SHOOT_LIST.length === 0;
    $("#shoots-intro").textContent = SITE.shootsIntro || "";
    $("#shoot-grid").replaceChildren(...SHOOT_LIST.map((sh) => {
      const ph = photosInShoot(sh.slug);
      return el("a", { class: "shoot", href: `#shoot-${sh.slug}` },
        el("span", { class: "frame" }, el("img", { src: sh.cover || (ph[0] || {}).src, alt: "", loading: "lazy" })),
        el("span", { class: "row mono" }, el("span", { class: "tag", text: sh.type || "" }), el("span", { text: fmtMonth(sh.date) })),
        el("h3", { text: sh.name }),
        el("p", { class: "client", text: [sh.client, sh.location].filter(Boolean).join(" · ") }));
    }));
  }

  /* ---------- Category carousel ---------- */
  const car = { slides: [], i: 0, slug: null };
  const narrow = () => window.matchMedia("(max-width: 900px), (max-height: 500px)").matches;

  function buildSlides(list) {
    // Two "half" photos in a row share a slide (unless the screen is narrow).
    const out = [];
    for (let k = 0; k < list.length; k++) {
      const p = list[k];
      if (p.layout === "half" && !narrow()) {
        const q = list[k + 1];
        if (q && q.layout === "half") { out.push({ kind: "pair", photos: [p, q] }); k++; }
        else out.push({ kind: "single-half", photos: [p] });
      } else out.push({ kind: p.layout === "half" ? "single-half" : "full", photos: [p] });
    }
    return out;
  }

  function figure(p, lazy) {
    return el("figure", {}, imgEl(p, lazy),
      el("figcaption", {}, el("span", { class: "t", text: p.title }),
        el("span", { class: "mono", text: [fmtDate(p.date), exif(p)].filter(Boolean).join(" · ") })));
  }

  function renderCategory(slug, keepIndex, kind) {
    kind = kind || car.kind || "cat";
    const isShoot = kind === "shoot";
    const c = isShoot ? shootBySlug(slug) : catBySlug(slug);
    if (!c) { location.hash = isShoot ? "shoots" : "portfolio"; return; }
    car.kind = kind;
    const list = isShoot ? photosInShoot(slug) : photosIn(slug);
    const prevPhoto = keepIndex && car.slides[car.i] ? car.slides[car.i].photos[0] : null;
    car.slug = slug;
    car.slides = buildSlides(list);
    car.i = prevPhoto ? Math.max(0, car.slides.findIndex((s) => s.photos.includes(prevPhoto))) : 0;
    $("#cat-title").textContent = c.name;
    $("#cat-blurb").textContent = c.blurb || "";
    const back = $("#cat-back");
    back.href = isShoot ? "#shoots" : "#portfolio";
    back.textContent = isShoot ? "← Past shoots" : "← Portfolio";
    const meta = $("#cat-meta");
    meta.hidden = !isShoot;
    if (isShoot) meta.replaceChildren(...[c.type, fmtMonth(c.date), c.client, c.location].filter(Boolean)
      .map((t, i) => el("span", { class: i === 0 ? "tag" : null, text: t })));
    $("#thumbs").replaceChildren(...car.slides.map((s, idx) =>
      el("button", { type: "button", "aria-label": `Slide ${idx + 1}: ${s.photos.map((p) => p.title).join(" and ")}`, onclick: () => go(idx) },
        s.photos.map((p) => el("img", { src: p.src, alt: "", loading: "lazy" })))));
    const group = isShoot ? SHOOT_LIST : CATEGORIES;
    const ci = group.indexOf(c), nxt = group[(ci + 1) % group.length];
    const nl = $("#cat-next-link");
    nl.hidden = group.length < 2;
    nl.href = `#${isShoot ? "shoot" : "cat"}-${nxt.slug}`; nl.textContent = `Next: ${nxt.name} →`;
    showSlide();
  }

  function showSlide() {
    const s = car.slides[car.i];
    if (!s) { $("#stage").replaceChildren(el("p", { class: "empty", text: "No photos here yet." })); $("#counter").textContent = ""; return; }
    $("#stage").replaceChildren(el("div", { class: `slide ${s.kind}` }, s.photos.map((p) => figure(p, false))));
    $("#counter").textContent = `${String(car.i + 1).padStart(2, "0")} / ${String(car.slides.length).padStart(2, "0")}`;
    [...$("#thumbs").children].forEach((b, idx) => b.setAttribute("aria-current", idx === car.i ? "true" : "false"));
    const cur = $("#thumbs").children[car.i];
    if (cur) { const t = $("#thumbs"); t.scrollTo({ left: cur.offsetLeft - t.clientWidth / 2 + cur.clientWidth / 2, behavior: "smooth" }); }
    // preload neighbours
    [car.i + 1, car.i - 1].forEach((j) => { const n = car.slides[(j + car.slides.length) % car.slides.length]; n && n.photos.forEach((p) => { new Image().src = p.src; }); });
  }
  function go(idx) {
    if (!car.slides.length) return;
    car.i = (idx + car.slides.length) % car.slides.length;
    showSlide();
  }

  function setupCarousel() {
    $("#prev").addEventListener("click", () => go(car.i - 1));
    $("#next").addEventListener("click", () => go(car.i + 1));
    let x0 = null;
    const stage = $("#stage");
    stage.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(car.i + (dx < 0 ? 1 : -1));
    });
    let wasNarrow = narrow();
    window.addEventListener("resize", () => {
      if (narrow() !== wasNarrow) { wasNarrow = narrow(); if (car.slug && !$("#view-category").hidden) renderCategory(car.slug, true); }
    });
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
      el("button", { type: "button", class: "tile", "aria-label": `Open ${p.title}`, onclick: () => openLightbox(idx) },
        imgEl(p),
        el("span", { class: "meta" },
          el("span", { class: "t" }, el("span", { class: "dot", style: `background:${COLORS[p.color] || "#888"}` }), p.title),
          el("span", { class: "mono", text: `${fmtDate(p.date)} · ${p.subject}` }),
          exif(p) ? el("span", { class: "mono exif", text: exif(p) }) : null))));
  }

  /* ---------- Lightbox ---------- */
  let lb = 0, lastFocus = null;
  function openLightbox(idx) { lastFocus = document.activeElement; lb = idx; $("#lightbox").hidden = false; document.body.style.overflow = "hidden"; drawLightbox(); $("#lb-close").focus(); }
  function closeLightbox() { $("#lightbox").hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); }
  function drawLightbox() {
    const p = filtered[lb]; if (!p) return closeLightbox();
    $("#lb-img").src = p.src; $("#lb-img").alt = p.title;
    $("#lb-count").textContent = `${lb + 1} / ${filtered.length}`;
    const cat = p.shoot ? shootBySlug(p.shoot) : catBySlug(p.category);
    $("#lb-cap").replaceChildren(el("span", { class: "t", text: p.title }),
      el("span", { class: "mono", text: [fmtDate(p.date), cat && cat.name, exif(p)].filter(Boolean).join(" · ") }));
  }
  function stepLightbox(d) { lb = (lb + d + filtered.length) % filtered.length; drawLightbox(); }
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
    if (!$("#view-category").hidden) {
      if (e.key === "ArrowLeft") go(car.i - 1);
      if (e.key === "ArrowRight") go(car.i + 1);
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
    else if (h.startsWith("cat-")) { show("category"); active = "portfolio"; renderCategory(h.slice(4), false, "cat"); window.scrollTo(0, 0); }
    else if (h.startsWith("shoot-")) { show("category"); active = "shoots"; renderCategory(h.slice(6), false, "shoot"); window.scrollTo(0, 0); }
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
  setupCarousel();
  setupFilters();
  setupLightbox();
  setupMenu();
  setupTheme();
  window.addEventListener("hashchange", route);
  window.addEventListener("scroll", updateHeader, { passive: true });
  route();
})();
