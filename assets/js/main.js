/* ==========================================================================
   VANTERA — interactions
   Vanilla JS, no dependencies. Everything degrades gracefully without JS.
   ========================================================================== */
(() => {
  "use strict";

  const cfg = window.VANTERA_CONFIG || {};
  const contact = Object.assign(
    {
      phoneDisplay: "+91 93872 32918",
      phoneTel: "+919387232918",
      whatsappNumber: "919387232918",
      whatsappGreeting: "Hello VANTERA, I'd like to discuss a project.",
    },
    cfg.contact || {}
  );

  /* ---------- helpers ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const mqStack = window.matchMedia("(min-width: 1024px) and (min-height: 740px)");
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const isHttp = (u) => /^https?:\/\/[^\s]+\.[^\s]+$/i.test(String(u || "").trim());
  const debounce = (fn, ms) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };
  const waLink = (text) => `https://wa.me/${contact.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  /* ---------- toast ---------- */
  const toastEl = $("[data-toast]");
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2800);
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      /* fall through to legacy copy */
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    ta.remove();
    return ok;
  };

  /* ==========================================================================
     1. Contact links (single source of truth: site-config.js)
     ========================================================================== */
  $$("[data-wa]").forEach((a) => (a.href = waLink(contact.whatsappGreeting)));
  $$("[data-tel]").forEach((a) => {
    a.href = `tel:${contact.phoneTel}`;
    if (a.hasAttribute("aria-label")) a.setAttribute("aria-label", `Call ${contact.phoneDisplay}`);
  });
  $$("[data-phone-text]").forEach((el) => (el.textContent = contact.phoneDisplay));

  /* ==========================================================================
     2. Portfolio (rendered from site-config.js)
     ========================================================================== */
  const casesWrap = $("[data-cases]");
  const serviceForCategory = (p) =>
    p.enquiryService || (/landing/i.test(p.category || "") ? "Landing Page" : /website/i.test(p.category || "") ? "Business Website" : "Other");

  const buildCase = (p, idx, total) => {
    const img = p.images || {};
    const el = document.createElement("article");
    el.className = "case reveal";
    el.dataset.category = p.category || "";
    el.style.setProperty("--i", idx);
    if (p.tint) el.style.setProperty("--tint", p.tint);
    el.setAttribute("aria-label", `${p.title}${p.subtitle ? " — " + p.subtitle : ""}`);

    const pad = (n) => String(n).padStart(2, "0");
    const demo = isHttp(p.demoUrl) ? p.demoUrl.trim() : "";
    const alt = p.alt || `${p.title} — ${p.subtitle || p.category || "project"} preview`;

    const shot = img.desktop
      ? `<img class="shot" src="${esc(img.desktop)}"${
          img.desktopSmall ? ` srcset="${esc(img.desktopSmall)} 800w, ${esc(img.desktop)} 1600w" sizes="(min-width: 1024px) 50vw, 92vw"` : ""
        } width="1600" height="1000" alt="${esc(alt)}" loading="lazy" decoding="async">`
      : `<div class="case__placeholder" aria-hidden="true">${esc((p.title || "V").charAt(0))}</div>`;
    const full =
      img.desktop && img.fullPage
        ? `<img class="shot-full" data-src="${esc(img.fullPage)}"${img.fullPageSmall ? ` data-src-small="${esc(img.fullPageSmall)}"` : ""} alt="" decoding="async">`
        : "";
    const phone = img.mobile
      ? `<div class="case__phone" aria-hidden="true"><div class="phone"><div class="phone__screen"><img src="${esc(img.mobile)}" width="480" height="1039" alt="" loading="lazy" decoding="async">${
          img.mobileFull ? `<img class="shot-full" data-src="${esc(img.mobileFull)}" alt="" decoding="async">` : ""
        }</div></div></div>`
      : "";
    const highlights =
      Array.isArray(p.highlights) && p.highlights.length
        ? `<ul class="case__highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`
        : "";
    const hint = full ? `<span class="case__hint">${mqFine.matches ? "Hover to scroll the page" : "Live page preview"}</span>` : "";

    el.innerHTML = `
      <div class="case__inner">
        <div class="case__media">
          <div class="frame case__browser">
            <div class="frame__bar"><i></i><i></i><i></i><span class="frame__url"><svg aria-hidden="true"><use href="#i-lock"/></svg>${esc(
              p.title
            )}</span></div>
            <div class="frame__view">${shot}${full}</div>
          </div>
          ${phone}
          ${hint}
        </div>
        <div class="case__info">
          <div class="case__meta">
            <span>${pad(idx + 1)} / ${pad(total)}</span>
            ${p.category ? `<span class="case__cat">${esc(p.category)}</span>` : ""}
            ${p.label ? `<span>${esc(p.label)}</span>` : ""}
          </div>
          <h3 class="case__title">${esc(p.title)}</h3>
          ${p.subtitle ? `<p class="case__subtitle">${esc(p.subtitle)}</p>` : ""}
          ${p.description ? `<p class="case__desc">${esc(p.description)}</p>` : ""}
          ${highlights}
          <div class="case__actions">
            ${
              demo
                ? `<a class="btn btn--gold" href="${esc(demo)}" target="_blank" rel="noopener noreferrer"><span>View Live Demo</span><svg class="btn__icon" aria-hidden="true"><use href="#i-arrow-ur"/></svg><span class="sr-only">(${esc(
                    p.title
                  )}, opens in a new tab)</span></a>`
                : ""
            }
            <a class="case__similar" href="#enquiry" data-prefill-service="${esc(serviceForCategory(p))}" data-prefill-note="${esc(
              `I'd like a project similar to ${p.title}.`
            )}">Start a similar project<svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
          </div>
        </div>
      </div>`;
    return el;
  };

  const loadPreview = (caseEl) => {
    $$(".shot-full", caseEl).forEach((img) => {
      if (img.src) return;
      const box = img.parentElement;
      const small = img.dataset.srcSmall;
      const needed = box.clientWidth * (window.devicePixelRatio || 1);
      img.addEventListener(
        "load",
        () => {
          box.classList.add("is-ready");
          measureCase(caseEl);
        },
        { once: true }
      );
      img.src = small && needed < 900 ? small : img.dataset.src;
    });
  };

  const measureCase = (caseEl) => {
    const boxes = $$(".is-ready", caseEl);
    if (!boxes.length) return;
    // One shared duration per project so desktop and phone previews move in sync.
    const main = $(".frame__view.is-ready", caseEl) || boxes[0];
    const mainImg = $(".shot-full", main);
    const mainShift = Math.max(0, mainImg.offsetHeight - main.clientHeight);
    const dur = clamp(mainShift / 300, 4, 12);
    boxes.forEach((box) => {
      const img = $(".shot-full", box);
      const shift = Math.max(0, img.offsetHeight - box.clientHeight);
      box.style.setProperty("--shift", `${shift}px`);
      box.style.setProperty("--dur", `${(mqFine.matches ? dur : dur * 1.7).toFixed(2)}s`);
    });
  };

  const renderProjects = () => {
    if (!casesWrap) return;
    const projects = (cfg.projects || []).filter((p) => p && p.visible !== false && p.title);
    casesWrap.innerHTML = "";
    projects.forEach((p, i) => casesWrap.appendChild(buildCase(p, i, projects.length)));
    casesWrap.classList.toggle("is-stacked", projects.length > 1);

    // Filters (only when there is something to filter)
    const box = $("[data-filters]");
    const cats = [...new Set(projects.map((p) => p.category).filter(Boolean))];
    if (box && cats.length > 1 && projects.length > 2) {
      const items = [["All", "*", projects.length], ...cats.map((c) => [c, c, projects.filter((p) => p.category === c).length])];
      box.innerHTML = items
        .map(
          ([label, val, n], i) =>
            `<button type="button" class="filter" data-filter="${esc(val)}" aria-pressed="${i === 0}">${esc(label)}<sup>${n}</sup></button>`
        )
        .join("");
      box.hidden = false;
      box.addEventListener("click", (e) => {
        const b = e.target.closest("[data-filter]");
        if (!b) return;
        $$(".filter", box).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        const f = b.dataset.filter;
        let i = 0;
        $$(".case", casesWrap).forEach((c) => {
          const show = f === "*" || c.dataset.category === f;
          c.classList.toggle("is-filtered-out", !show);
          if (show) {
            c.style.setProperty("--i", i++);
            c.classList.add("is-in");
            loadPreview(c);
          }
        });
        casesWrap.classList.toggle("is-stacked", i > 1);
        remeasure();
      });
    }

    // Lazy-load scrolling previews shortly before they enter the viewport
    const cases = $$(".case", casesWrap);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          loadPreview(en.target);
        }),
      { rootMargin: "400px 0px" }
    );
    cases.forEach((c) => io.observe(c));

    // On touch screens, gently auto-scroll the preview that is in view
    if (!mqFine.matches && !mqReduce.matches) {
      const playIO = new IntersectionObserver(
        (entries) => entries.forEach((en) => en.target.classList.toggle("is-playing", en.intersectionRatio >= 0.5)),
        { threshold: [0, 0.5, 1] }
      );
      cases.forEach((c) => playIO.observe(c));
    }
    window.addEventListener(
      "resize",
      debounce(() => cases.forEach(measureCase), 200)
    );
  };
  renderProjects();

  /* ==========================================================================
     3. Reveal on scroll
     ========================================================================== */
  const revealIO =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((en) => {
              if (!en.isIntersecting) return;
              const el = en.target;
              revealIO.unobserve(el);
              // Grouped items reveal in sequence (90 ms apart) via a timed class rather than animation-delay
              const step = mqReduce.matches ? 0 : parseFloat(el.style.getPropertyValue("--stagger")) || 0;
              if (step > 0) setTimeout(() => el.classList.add("is-in"), step * 90);
              else el.classList.add("is-in");
            }),
          { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
        )
      : null;
  $$(".reveal").forEach((el) => (revealIO ? revealIO.observe(el) : el.classList.add("is-in")));

  // Pause decorative loops (glows, floating frames, marquee…) while off-screen
  if ("IntersectionObserver" in window) {
    const zoneIO = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.target.classList.toggle("is-offscreen", !en.isIntersecting)),
      { rootMargin: "120px 0px" }
    );
    $$(".hero, .marquee, .note, .contact").forEach((z) => zoneIO.observe(z));
  }

  /* ==========================================================================
     4. Philosophy statement — words light up while scrolling
     ========================================================================== */
  const statement = $("[data-words]");
  if (statement) {
    let n = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else {
              const s = document.createElement("span");
              s.className = "w";
              s.style.setProperty("--i", n++);
              s.textContent = part;
              frag.appendChild(s);
            }
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1) walk(ch);
      });
    };
    walk(statement);
    statement.style.setProperty("--n", n);
  }

  /* ==========================================================================
     5. Navigation, progress & scroll-linked effects (one rAF loop)
     ========================================================================== */
  const nav = $("[data-nav]");
  const progressBar = $("[data-progress]");
  const hero = $(".hero");
  const stageEl = $("[data-stage]");
  const timeline = $("[data-timeline]");
  const timelineFill = timeline ? $(".timeline__fill", timeline) : null;
  const steps = timeline ? $$(".step", timeline) : [];
  const fab = $("[data-fab]");
  let menuOpen = false;
  let lastY = window.scrollY;
  let ticking = false;
  let stepMarks = [];
  let fabBlocked = false;
  let heroH = 1;
  let stack = []; // visible case studies + their (cached) sticky offsets
  let needsMeasure = true;

  // Write a CSS custom property only when its value actually changes — unchanged
  // writes would still invalidate style, so this keeps idle sections free.
  const setVar = (el, name, value) => {
    const memo = el._v || (el._v = {});
    if (memo[name] !== value) {
      memo[name] = value;
      el.style.setProperty(name, value);
    }
  };

  const measureTimeline = () => {
    if (!timeline) return;
    const rail = $(".timeline__rail", timeline).getBoundingClientRect();
    const vertical = rail.height > rail.width;
    stepMarks = steps.map((s) => {
      const node = $(".step__node", s).getBoundingClientRect();
      return vertical ? (node.top + node.height / 2 - rail.top) / rail.height : (node.left + node.width / 2 - rail.left) / rail.width;
    });
  };

  // Geometry that only changes on resize / filtering — measured once, not every frame
  const measure = () => {
    needsMeasure = false;
    heroH = hero ? Math.max(1, hero.offsetHeight) : 1;
    stack = casesWrap
      ? $$(".case:not(.is-filtered-out)", casesWrap).map((el) => ({ el, top: parseFloat(getComputedStyle(el).top) || 0 }))
      : [];
    measureTimeline();
  };

  const update = () => {
    ticking = false;
    if (needsMeasure) measure();

    // 1) Read everything first…
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const sRect = statement ? statement.getBoundingClientRect() : null;
    const tRect = timeline ? timeline.getBoundingClientRect() : null;
    const stacking = stack.length > 1 && mqStack.matches && casesWrap.classList.contains("is-stacked") && !mqReduce.matches;
    const caseTops = stacking ? stack.map((c) => c.el.getBoundingClientRect().top) : null;

    // 2) …then write, so a frame never forces an extra style/layout pass
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 24);
      if (!menuOpen) {
        if (y > lastY + 6 && y > vh * 0.9) nav.classList.add("is-hidden");
        else if (y < lastY - 6 || y < vh * 0.5) nav.classList.remove("is-hidden");
      }
    }
    lastY = y;

    if (progressBar) setVar(progressBar, "--progress", max > 0 ? (y / max).toFixed(4) : "0");
    if (stageEl && !mqReduce.matches) setVar(stageEl, "--hero-p", clamp(y / heroH, 0, 1).toFixed(3));

    if (sRect) setVar(statement, "--p", clamp((vh * 0.85 - sRect.top) / (sRect.height + vh * 0.35), 0, 1).toFixed(3));

    if (tRect) {
      const p = clamp((vh * 0.72 - tRect.top) / Math.max(1, tRect.height * 0.9), 0, 1);
      if (timelineFill) setVar(timelineFill, "--tl", p.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle("is-lit", p >= (stepMarks[i] || 0) - 0.01 && p > 0));
    }

    // Stacked case studies: the covered card recedes as the next one arrives
    stack.forEach((c, i) => {
      let s = 0;
      if (stacking && i < stack.length - 1) s = clamp((vh - caseTops[i + 1]) / Math.max(1, vh - stack[i + 1].top), 0, 1);
      setVar(c.el, "--shrink", s.toFixed(3));
    });

    if (fab) fab.classList.toggle("is-visible", y > vh * 0.85 && !fabBlocked && !menuOpen);
  };
  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  const remeasure = () => {
    needsMeasure = true;
    requestUpdate();
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", debounce(remeasure, 150));
  window.addEventListener("load", remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  update();

  // Hide the floating WhatsApp button where it would compete with the main CTAs
  if (fab && "IntersectionObserver" in window) {
    const blockers = new Set();
    const fabIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => (en.isIntersecting ? blockers.add(en.target) : blockers.delete(en.target)));
        fabBlocked = blockers.size > 0;
        requestUpdate();
      },
      { threshold: 0.12 }
    );
    $$("#enquiry, #contact, .footer").forEach((el) => fabIO.observe(el));
  }

  // Scrollspy
  const spyLinks = $$("[data-spy]");
  if (spyLinks.length && "IntersectionObserver" in window) {
    const map = new Map(spyLinks.map((a) => [a.dataset.spy, a]));
    const spyIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = en.target.id === "enquiry" || en.target.id === "why" ? null : en.target.id;
          spyLinks.forEach((a) => a.classList.toggle("is-active", !!id && a.dataset.spy === id));
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main section[id]").forEach((s) => (map.has(s.id) || s.id === "enquiry" || s.id === "why" || s.id === "top" ? spyIO.observe(s) : null));
  }

  /* ==========================================================================
     6. Mobile menu
     ========================================================================== */
  const menu = $("[data-menu]");
  const toggle = $("[data-menu-toggle]");
  const mainEl = $("#main");
  const footerEl = $(".footer");
  const setInert = (on) =>
    [mainEl, footerEl, fab].forEach((el) => {
      if (!el) return;
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  const openMenu = () => {
    if (!menu || menuOpen) return;
    menuOpen = true;
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
    toggle.setAttribute("aria-expanded", "true");
    $(".sr-only", toggle).textContent = "Close menu";
    nav.classList.add("is-menu");
    nav.classList.remove("is-hidden");
    document.documentElement.style.overflow = "hidden";
    setInert(true);
    requestUpdate();
  };
  const closeMenu = (restoreFocus = true) => {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    $(".sr-only", toggle).textContent = "Open menu";
    nav.classList.remove("is-menu");
    document.documentElement.style.overflow = "";
    setInert(false);
    setTimeout(() => {
      if (!menuOpen) menu.hidden = true;
    }, 650);
    if (restoreFocus) toggle.focus();
    requestUpdate();
  };
  if (menu && toggle) {
    toggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
    $$("[data-menu-close]", menu).forEach((el) => el.addEventListener("click", () => closeMenu()));
    $$("[data-menu-link]", menu).forEach((a) =>
      a.addEventListener("click", (e) => {
        const target = $(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        closeMenu(false);
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: mqReduce.matches ? "auto" : "smooth", block: "start" });
          history.replaceState(null, "", a.getAttribute("href"));
        });
      })
    );
    document.addEventListener("keydown", (e) => {
      if (!menuOpen) return;
      if (e.key === "Escape") closeMenu();
      if (e.key === "Tab") {
        const focusables = [toggle, ...$$("a, button", menu)].filter((el) => el.offsetParent !== null);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    window.matchMedia("(min-width: 1180px)").addEventListener("change", (e) => e.matches && closeMenu(false));
  }

  /* ==========================================================================
     7. Hero — pointer parallax + live site preview
     ========================================================================== */
  const stage = $("[data-stage]");
  const rig = $("[data-rig]");
  if (stage && rig && hero && mqFine.matches && !mqReduce.matches) {
    const layers = $$(".layer", rig).map((el) => ({ el, d: parseFloat(el.dataset.depth) || 0.5 }));
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      rig.style.setProperty("--ry", `${(cx * 4.5).toFixed(3)}deg`);
      rig.style.setProperty("--rx", `${(-cy * 3.2).toFixed(3)}deg`);
      layers.forEach(({ el, d }) => {
        el.style.setProperty("--lx", `${(cx * d * 16).toFixed(2)}px`);
        el.style.setProperty("--ly", `${(cy * d * 11).toFixed(2)}px`);
      });
      raf = Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015 ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener("pointerleave", () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  const heroFrame = $("[data-hero-frame]");
  if (heroFrame && !mqReduce.matches) {
    const img = $(".frame__scroll", heroFrame);
    const view = img.parentElement;
    const setShift = () => {
      const shift = Math.max(0, img.offsetHeight - view.clientHeight);
      heroFrame.style.setProperty("--shift", `${shift}px`);
      heroFrame.style.setProperty("--dur", `${clamp(shift / 60, 26, 70).toFixed(1)}s`);
    };
    const start = () => {
      const small = img.dataset.srcSmall;
      img.addEventListener(
        "load",
        () => {
          setShift();
          heroFrame.classList.add("is-scrolling");
          window.addEventListener("resize", debounce(setShift, 200));
        },
        { once: true }
      );
      img.src = small && view.clientWidth * (window.devicePixelRatio || 1) < 900 ? small : img.dataset.src;
    };
    // Begin only after the page has fully loaded — never competes with first paint.
    if (document.readyState === "complete") setTimeout(start, 1200);
    else window.addEventListener("load", () => setTimeout(start, 1200), { once: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => heroFrame.classList.toggle("is-paused", !en.isIntersecting)).observe(heroFrame);
    }
  }

  /* ==========================================================================
     8. Micro-interactions: spotlight cards, magnetic buttons
     ========================================================================== */
  if (mqFine.matches && !mqReduce.matches) {
    $$("[data-spotlight]").forEach((card) =>
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
        card.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
      })
    );
    $$("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--tx", `${((e.clientX - (r.left + r.width / 2)) * 0.16).toFixed(1)}px`);
        btn.style.setProperty("--ty", `${((e.clientY - (r.top + r.height / 2)) * 0.26).toFixed(1)}px`);
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--tx", "0px");
        btn.style.setProperty("--ty", "0px");
      });
    });
  }

  /* ==========================================================================
     9. "Why" section — inspection mode toggle
     ========================================================================== */
  const inspect = $("[data-inspect]");
  if (inspect) {
    const sw = $("[data-inspect-toggle]", inspect);
    let touched = false;
    const set = (on) => {
      sw.setAttribute("aria-checked", String(on));
      inspect.classList.toggle("is-on", on);
    };
    sw.addEventListener("click", () => {
      touched = true;
      set(sw.getAttribute("aria-checked") !== "true");
    });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([en]) => {
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            io.disconnect();
            setTimeout(() => !touched && set(true), 1100);
          }
        },
        { threshold: [0, 0.55] }
      );
      io.observe(inspect);
    }
  }

  /* ==========================================================================
     10. FAQ accordion (native <details>, animated)
     ========================================================================== */
  const items = $$(".qa");
  const animate = (d, open) => {
    const body = $(".qa__a", d);
    if (body._anim) body._anim.cancel();
    if (open) {
      d.classList.remove("is-closing");
      d.open = true;
      const h = body.scrollHeight;
      body._anim = body.animate([{ height: "0px", opacity: 0 }, { height: `${h}px`, opacity: 1 }], {
        duration: 520,
        easing: "cubic-bezier(.16,1,.3,1)",
      });
    } else {
      d.classList.add("is-closing");
      const h = body.offsetHeight;
      body._anim = body.animate([{ height: `${h}px`, opacity: 1 }, { height: "0px", opacity: 0 }], {
        duration: 380,
        easing: "cubic-bezier(.65,0,.35,1)",
      });
      body._anim.onfinish = () => {
        d.open = false;
        d.classList.remove("is-closing");
      };
    }
    body._anim.addEventListener("finish", () => (body._anim = null));
  };
  items.forEach((d) =>
    $("summary", d).addEventListener("click", (e) => {
      if (mqReduce.matches || !Element.prototype.animate) return;
      e.preventDefault();
      const opening = !d.open || d.classList.contains("is-closing");
      if (opening) items.forEach((o) => o !== d && o.open && !o.classList.contains("is-closing") && animate(o, false));
      animate(d, opening);
    })
  );

  /* ==========================================================================
     11. Copy phone number
     ========================================================================== */
  $$("[data-copy-phone]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const label = $("[data-copy-label]", btn);
      const ok = await copyText(contact.phoneDisplay);
      if (ok) {
        if (label) label.textContent = "Copied";
        toast(`${contact.phoneDisplay} copied to clipboard`);
        setTimeout(() => label && (label.textContent = "Copy Number"), 2400);
      } else {
        toast(`Couldn't copy automatically — the number is ${contact.phoneDisplay}`);
      }
    })
  );

  /* ==========================================================================
     12. Project request form → WhatsApp
     ========================================================================== */
  const form = $("[data-form]");
  if (!form) return;
  const statusBox = $("[data-form-status]", form);
  const retryLink = $("[data-wa-retry]", form);
  const copyMsgBtn = $("[data-copy-message]", form);
  const descEl = form.elements.description;
  const countEl = $("[data-count]", form);
  const order = ["name", "brand", "phone", "email", "service", "budget", "description", "reference"];
  let lastMessage = "";

  // Wire hints/errors for assistive tech
  ["name", "brand", "phone", "email", "description", "reference"].forEach((n) => {
    const el = form.elements[n];
    const ids = [`${el.id}-hint`, `${el.id}-err`].filter((id) => document.getElementById(id));
    if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
  });

  const wrapOf = (name) => (name === "service" ? $("#f-service") : name === "budget" ? $("#f-budget") : form.elements[name].closest(".field"));
  const setError = (name, msg) => {
    const wrap = wrapOf(name);
    if (!wrap) return;
    const err = $(".field__error", wrap);
    if (err) err.textContent = msg || "";
    wrap.classList.toggle("is-invalid", !!msg);
    const el = form.elements[name];
    if (el && el.nodeType === 1) el.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  const normalisePhone = (raw) => {
    const s = String(raw || "").trim();
    const plus = s.startsWith("+");
    let d = s.replace(/[^\d]/g, "");
    if (!d) return null;
    if (!plus) {
      if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
      if (d.length === 10 && /^[6-9]/.test(d)) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
      if (d.length === 12 && d.startsWith("91") && /^[6-9]/.test(d.slice(2))) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
      return null;
    }
    if (d.startsWith("91")) return d.length === 12 && /^[6-9]/.test(d.slice(2)) ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : null;
    return d.length >= 8 && d.length <= 15 ? `+${d}` : null;
  };
  const normaliseUrl = (raw) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    try {
      const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
      return /\./.test(u.hostname) && !/\s/.test(s) ? u.href : null;
    } catch (_) {
      return null;
    }
  };

  const collect = () => {
    const f = form.elements;
    return {
      name: f.name.value.trim().replace(/\s+/g, " "),
      brand: f.brand.value.trim().replace(/\s+/g, " "),
      phoneRaw: f.phone.value,
      email: f.email.value.trim(),
      service: (form.querySelector('input[name="service"]:checked') || {}).value || "",
      budget: (form.querySelector('input[name="budget"]:checked') || {}).value || "",
      description: f.description.value.trim(),
      referenceRaw: f.reference.value,
    };
  };

  const validate = (d) => {
    const e = {};
    if (d.name.length < 2) e.name = "Please enter your full name.";
    if (!d.brand) e.brand = "Please enter your business or brand name.";
    d.phone = normalisePhone(d.phoneRaw);
    if (!String(d.phoneRaw).trim()) e.phone = "Please enter your WhatsApp number.";
    else if (!d.phone) e.phone = "Please enter a valid number — a 10-digit Indian mobile, or include your country code (e.g. +44…).";
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = "Please enter a valid email address, or leave it empty.";
    if (!d.service) e.service = "Please choose what you need.";
    if (!d.budget) e.budget = "Please choose an approximate budget.";
    if (d.description.length < 10) e.description = "Please describe your project in a little more detail (at least 10 characters).";
    d.reference = normaliseUrl(d.referenceRaw);
    if (d.reference === null) e.reference = "Please enter a valid website address (e.g. example.com), or leave it empty.";
    return e;
  };

  const buildMessage = (d) =>
    [
      "*New Project Request — VANTERA*",
      "",
      `*Name:* ${d.name}`,
      `*Business / Brand:* ${d.brand}`,
      `*WhatsApp:* ${d.phone}`,
      `*Email:* ${d.email || "Not provided"}`,
      "",
      `*What I need:* ${d.service}`,
      `*Approximate budget:* ${d.budget}`,
      `*Reference website:* ${d.reference || "Not provided"}`,
      "",
      "*Project description:*",
      d.description,
      "",
      "— Sent from the VANTERA website",
    ].join("\n");

  const updateCount = () => {
    if (countEl) countEl.textContent = `${descEl.value.length} / ${descEl.maxLength || 1500}`;
  };
  descEl.addEventListener("input", updateCount);
  updateCount();

  // Clear a field's error as soon as the visitor fixes it
  form.addEventListener("input", (e) => {
    const name = e.target.name;
    if (name && wrapOf(name) && wrapOf(name).classList.contains("is-invalid")) {
      const errs = validate(collect());
      setError(name, errs[name]);
    }
    if (statusBox && !statusBox.hidden && e.target.type !== "radio") statusBox.hidden = true;
  });
  form.addEventListener("change", (e) => {
    if (e.target.type === "radio") setError(e.target.name, "");
  });
  form.elements.phone.addEventListener("blur", () => {
    const v = form.elements.phone.value;
    if (v.trim()) setError("phone", normalisePhone(v) ? "" : validate(collect()).phone);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = collect();
    const errors = validate(data);
    order.forEach((n) => setError(n, errors[n]));
    const first = order.find((n) => errors[n]);
    if (first) {
      const target = first === "service" || first === "budget" ? form.querySelector(`input[name="${first}"]`) : form.elements[first];
      wrapOf(first).scrollIntoView({ behavior: mqReduce.matches ? "auto" : "smooth", block: "center" });
      setTimeout(() => target.focus({ preventScroll: true }), 350);
      toast("Please check the highlighted fields.");
      return;
    }

    lastMessage = buildMessage(data);
    const url = waLink(lastMessage);
    retryLink.href = url;

    // Open WhatsApp with the request pre-filled. Nothing is claimed as "sent":
    // the visitor confirms by pressing Send inside WhatsApp.
    const win = window.open(url, "_blank");
    if (win) {
      try {
        win.opener = null;
      } catch (_) {
        /* ignore */
      }
    } else {
      window.location.href = url; // pop-up blocked → open in this tab
    }

    statusBox.hidden = false;
    statusBox.focus({ preventScroll: true });
    statusBox.scrollIntoView({ behavior: mqReduce.matches ? "auto" : "smooth", block: "nearest" });
  });

  copyMsgBtn &&
    copyMsgBtn.addEventListener("click", async () => {
      if (!lastMessage) return;
      const ok = await copyText(lastMessage);
      toast(ok ? "Message copied — paste it into WhatsApp to send." : "Couldn't copy automatically. Please use “Open WhatsApp again”.");
    });

  // CTA shortcuts: pre-select the matching options in the form
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-prefill-service], [data-prefill-budget]");
    if (!a) return;
    const pick = (name, value) => {
      if (!value) return false;
      const r = $$(`input[name="${name}"]`, form).find((i) => i.value === value);
      if (r) {
        r.checked = true;
        setError(name, "");
      }
      return !!r;
    };
    const svc = a.dataset.prefillService;
    const picked = pick("service", svc);
    pick("budget", a.dataset.prefillBudget);
    const note = a.dataset.prefillNote;
    if (note && !descEl.value.trim()) {
      descEl.value = `${note} `;
      updateCount();
    }
    if (picked) toast(`“${svc}” selected — add a few details below.`);
  });
})();
