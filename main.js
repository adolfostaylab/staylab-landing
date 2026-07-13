/* Staylab landing — vanilla JS, no dependencies. */
(() => {
  "use strict";

  // "?static" previews the reduced-motion experience without an OS setting
  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    new URLSearchParams(location.search).has("static");
  if (reducedMotion) document.documentElement.style.scrollBehavior = "auto";

  /* ---------- Nav ---------- */
  const nav = document.querySelector(".nav");
  const onScrollNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  const menuBtn = document.querySelector(".menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    menuBtn.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    mobileMenu.hidden = open;
  });
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      menuBtn.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    // above-the-fold content reveals immediately (staggered via --d);
    // everything below waits for the observer
    const fold = window.innerHeight * 0.92;
    const deferred = [];
    revealEls.forEach((el) => {
      if (el.getBoundingClientRect().top < fold) {
        setTimeout(() => el.classList.add("is-in"), 60);
      } else {
        deferred.push(el);
      }
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    deferred.forEach((el) => io.observe(el));
  }

  /* ---------- Vision statement: scroll-lit words ---------- */
  const statement = document.querySelector("#vision-statement p");
  if (statement) {
    const words = statement.textContent.trim().split(/\s+/);
    statement.innerHTML = words
      .map((w) => `<span class="w">${w}</span>`)
      .join(" ");
    const spans = statement.querySelectorAll(".w");

    if (reducedMotion) {
      spans.forEach((s) => s.classList.add("is-lit"));
    } else {
      const litWords = () => {
        const rect = statement.getBoundingClientRect();
        const vh = window.innerHeight;
        // progress: 0 when statement enters bottom, 1 when its center passes 38% of viewport
        const start = vh * 0.92;
        const end = vh * 0.38;
        const p = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        const count = Math.round(p * spans.length);
        spans.forEach((s, i) => s.classList.toggle("is-lit", i < count));
      };
      litWords();
      window.addEventListener("scroll", litWords, { passive: true });
      window.addEventListener("resize", litWords, { passive: true });
    }
  }

  /* ---------- Problem facade (asset map) ---------- */
  const facade = document.getElementById("facade");
  if (facade) {
    const COLS = 9;
    const ROWS = 13;
    const cells = [];
    for (let i = 0; i < COLS * ROWS; i++) {
      const c = document.createElement("span");
      c.className = "facade-cell";
      facade.appendChild(c);
      cells.push(c);
    }
    const idx = (col, row) => row * COLS + col;
    // cell groups per problem item
    const groups = [
      // 0 unused inventory: rooftop row + parking (bottom corners)
      [idx(1,0), idx(2,0), idx(3,0), idx(4,0), idx(5,0), idx(6,0), idx(7,0), idx(0,12), idx(1,12), idx(7,12), idx(8,12)],
      // 1 premium upgrades: upper suite block
      [idx(6,2), idx(7,2), idx(6,3), idx(7,3), idx(8,2), idx(8,3)],
      // 2 ancillary services: mid-left cluster (spa / dining)
      [idx(0,6), idx(1,6), idx(2,6), idx(0,7), idx(1,7), idx(2,7)],
      // 3 FF&E lifecycle: scattered single rooms
      [idx(4,4), idx(2,9), idx(6,8), idx(3,11), idx(7,5), idx(5,10)],
      // 4 disconnected revenue: wide spread
      [idx(0,2), idx(3,3), idx(8,6), idx(1,9), idx(5,7), idx(8,10), idx(2,4), idx(4,8)],
    ];

    let activeGroup = -1;
    let idleTimer = null;
    let idleIndex = 0;

    const light = (g) => {
      cells.forEach((c) => c.classList.remove("is-lit"));
      if (g >= 0) groups[g].forEach((i) => cells[i] && cells[i].classList.add("is-lit"));
    };

    const items = document.querySelectorAll(".problem-item");
    const setActive = (g) => {
      activeGroup = g;
      items.forEach((it) => it.classList.toggle("is-active", Number(it.dataset.group) === g));
      light(g);
    };

    const startIdle = () => {
      stopIdle();
      if (reducedMotion) { setActive(0); return; }
      idleTimer = setInterval(() => {
        idleIndex = (idleIndex + 1) % groups.length;
        setActive(idleIndex);
      }, 2600);
    };
    const stopIdle = () => { if (idleTimer) clearInterval(idleTimer), (idleTimer = null); };

    items.forEach((it) => {
      const g = Number(it.dataset.group);
      const on = () => { stopIdle(); setActive(g); };
      const off = () => { idleIndex = g; startIdle(); };
      it.addEventListener("mouseenter", on);
      it.addEventListener("mouseleave", off);
      it.addEventListener("focus", on);
      it.addEventListener("blur", off);
    });

    // begin cycling when visible
    const facadeIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? (setActive(0), startIdle()) : stopIdle()));
      },
      { threshold: 0.25 }
    );
    facadeIO.observe(facade);
  }

  /* ---------- Engine scene (the shift) ---------- */
  const engineSec = document.getElementById("engine");
  if (engineSec) {
    const svgNS = "http://www.w3.org/2000/svg";
    const track = document.getElementById("engine-track");
    const svg = document.getElementById("engine-svg");
    const windowsG = document.getElementById("e-windows");
    const caption = document.getElementById("engine-caption");
    const beatLines = engineSec.querySelectorAll(".engine-line");
    const core = document.getElementById("e-core");
    const draws = svg.querySelectorAll(".e-draw");
    const fades = svg.querySelectorAll(".e-fade");

    // window grid: main tower + annex rooms aligned with their zones
    const addWin = (x, y, w, h) => {
      const r = document.createElementNS(svgNS, "rect");
      r.setAttribute("x", x); r.setAttribute("y", y);
      r.setAttribute("width", w); r.setAttribute("height", h);
      r.setAttribute("rx", 2);
      windowsG.appendChild(r);
    };
    for (let c = 0; c < 5; c++)
      for (let r = 0; r < 9; r++) addWin(283 + c * 32, 132 + r * 42, 18, 24);
    [[168, 368], [206, 368], [168, 468], [206, 468],
     [488, 406], [526, 406], [488, 484], [526, 484]].forEach(([x, y]) => addWin(x, y, 18, 20));

    const zones = {}, links = {}, chips = {};
    svg.querySelectorAll(".e-zone").forEach((z) => (zones[z.dataset.zone] = z));
    svg.querySelectorAll(".e-link").forEach((l) => (links[l.dataset.link] = l));
    engineSec.querySelectorAll(".echip").forEach((c) => (chips[c.dataset.chip] = c));

    const ORDER = [
      ["rooftop", "Rooftop", "+$18,400/yr"],
      ["suites", "Suite upgrades", "+$96/night"],
      ["spa", "Spa", "+$2,300/mo"],
      ["meeting", "Meeting room", "+$640/day"],
      ["restaurant", "Restaurant", "+$1,150/wk"],
      ["parking", "Parking", "+11% utilization"],
      ["storage", "Storage", "+$410/mo"],
      ["ffe", "FF&E resale", "$12,750 recovered"],
    ];
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const START = 0.16, SPAN = 0.62;
    const assetT = (p, i) => clamp01((p - (START + (i / ORDER.length) * SPAN)) / 0.05);

    let prog = 0;
    let lastCaption = -1;
    const update = (p) => {
      prog = p;
      engineSec.classList.toggle("is-started", p > 0.02);
      engineSec.classList.toggle("is-final", p > 0.86);
      const d = clamp01(p / START);
      draws.forEach((el) => (el.style.strokeDashoffset = String(1 - d)));
      fades.forEach((el) => (el.style.opacity = String(d * 0.8)));
      windowsG.style.opacity = String(d);
      let lit = 0, currentIdx = -1;
      ORDER.forEach(([id], i) => {
        const t = assetT(p, i);
        lit += t;
        if (t > 0) currentIdx = i;
        zones[id].style.opacity = String(t);
        zones[id].classList.toggle("is-lit", t > 0.5);
        links[id].style.strokeDashoffset = String(1 - t);
        if (chips[id]) chips[id].classList.toggle("is-on", t > 0.55);
      });
      if (currentIdx !== lastCaption) {
        caption.textContent = currentIdx >= 0
          ? `${ORDER[currentIdx][1]} — ${ORDER[currentIdx][2]}`
          : "";
        lastCaption = currentIdx;
      }
      const beat = p < START ? 0 : p < 0.48 ? 1 : p < 0.84 ? 2 : 3;
      beatLines.forEach((l) => l.classList.toggle("is-on", Number(l.dataset.beat) === beat));
      const frac = lit / ORDER.length;
      const s = 0.55 + 0.45 * frac;
      core.setAttribute("transform", `translate(360 320) scale(${s.toFixed(3)}) translate(-360 -320)`);
      core.style.opacity = String(0.25 + 0.75 * frac);
    };

    // revenue particles flowing along lit links
    const particlesG = document.getElementById("e-particles");
    const linkPaths = ORDER.map(([id]) => links[id]);
    const linkLens = linkPaths.map((p) => p.getTotalLength());
    const dots = ORDER.map((_, i) => {
      const arr = [];
      for (let k = 0; k < 2; k++) {
        const c = document.createElementNS(svgNS, "circle");
        c.setAttribute("r", "2.4");
        c.setAttribute("fill", "#F5DFAD");
        c.style.opacity = "0";
        particlesG.appendChild(c);
        arr.push({ el: c, t: (k * 0.5 + i * 0.13) % 1 });
      }
      return arr;
    });

    if (reducedMotion) {
      update(1);
      dots.forEach((arr, i) => {
        const pt = linkPaths[i].getPointAtLength(0.55 * linkLens[i]);
        arr[0].el.setAttribute("cx", pt.x);
        arr[0].el.setAttribute("cy", pt.y);
        arr[0].el.style.opacity = "0.9";
      });
    } else {
      const onScroll = () => {
        const r = track.getBoundingClientRect();
        const total = Math.max(1, r.height - window.innerHeight);
        update(clamp01(-r.top / total));
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });

      let running = false, raf = 0, last = 0;
      const tick = (now) => {
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
        last = now;
        ORDER.forEach((_, i) => {
          const t = assetT(prog, i);
          dots[i].forEach((d) => {
            if (t >= 1) {
              d.t = (d.t + dt * 0.22) % 1;
              const pt = linkPaths[i].getPointAtLength(d.t * linkLens[i]);
              d.el.setAttribute("cx", pt.x);
              d.el.setAttribute("cy", pt.y);
              d.el.style.opacity = String(0.9 * Math.sin(d.t * Math.PI));
            } else {
              d.el.style.opacity = "0";
            }
          });
        });
        raf = requestAnimationFrame(tick);
      };
      const setRun = (on) => {
        if (on && !running) { running = true; last = 0; raf = requestAnimationFrame(tick); }
        else if (!on && running) { running = false; cancelAnimationFrame(raf); }
      };
      const engIO = new IntersectionObserver(
        (entries) => entries.forEach((e) => setRun(e.isIntersecting && !document.hidden)),
        { threshold: 0.03 }
      );
      engIO.observe(engineSec);
      document.addEventListener("visibilitychange", () => {
        const r = engineSec.getBoundingClientRect();
        setRun(!document.hidden && r.bottom > 0 && r.top < window.innerHeight);
      });
    }
  }

  /* ---------- Roadmap progress ---------- */
  const timeline = document.getElementById("timeline");
  const fill = document.getElementById("timeline-fill");
  if (timeline && fill) {
    const stages = timeline.querySelectorAll(".stage");
    const update = () => {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.25;
      const total = rect.height + (start - end);
      const p = Math.min(1, Math.max(0, (start - rect.top) / total));
      const horizontal = window.innerWidth >= 900;
      if (horizontal) {
        fill.style.width = `${p * 100}%`;
        fill.style.height = "100%";
      } else {
        fill.style.height = `${p * 100}%`;
        fill.style.width = "100%";
      }
      stages.forEach((s, i) => {
        const threshold = (i + 0.4) / stages.length;
        s.classList.toggle("is-reached", p >= threshold);
      });
    };
    if (reducedMotion) {
      fill.style.width = "100%";
      fill.style.height = "100%";
      stages.forEach((s) => s.classList.add("is-reached"));
    } else {
      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update, { passive: true });
    }
  }

  /* ---------- Upgrade simulation ---------- */
  const simEl = document.getElementById("sim");
  if (simEl) {
    const guests = [
      { name: "John Smith", meta: "Room 204 · 2 nights · arrives Fri", nights: 2, offer: "Executive Suite", price: 89, prob: 82 },
      { name: "Ana García", meta: "Room 310 · 3 nights · arrives Sat", nights: 3, offer: "Terrace Suite", price: 74, prob: 76 },
      { name: "M. Tanaka", meta: "Room 118 · 1 night · arrives Tue", nights: 1, offer: "Junior Suite", price: 59, prob: 31 },
      { name: "L. Fontaine", meta: "Room 402 · 2 nights · arrives Thu", nights: 2, offer: "Executive Suite", price: 96, prob: 88 },
    ];
    const $ = (id) => document.getElementById(id);
    const nameEl = $("sim-name"), metaEl = $("sim-meta"), probVal = $("sim-prob-val"),
      barFill = $("sim-bar-fill"), offerTitle = $("sim-offer-title"), priceEl = $("sim-price"),
      statusEl = $("sim-status"), sendBtn = $("sim-send"), nextBtn = $("sim-next"),
      totalEl = $("sim-total-val");
    let idx = 0, total = 0, busy = false;

    const render = () => {
      const g = guests[idx];
      nameEl.textContent = g.name;
      metaEl.textContent = g.meta;
      probVal.textContent = `${g.prob}%`;
      offerTitle.textContent = `Offer ${g.offer}`;
      priceEl.innerHTML = `+$${g.price}<i>/night</i>`;
      simEl.classList.toggle("low", g.prob < 50);
      statusEl.classList.remove("ok");
      if (g.prob < 50) {
        statusEl.textContent = `Model holds this offer — ${g.prob}% acceptance. No spam, no discount reflex.`;
        sendBtn.disabled = true;
        sendBtn.textContent = "Held by the model";
      } else {
        statusEl.textContent = "";
        sendBtn.disabled = false;
        sendBtn.textContent = "Send offer";
      }
      barFill.style.width = "0%";
      setTimeout(() => { barFill.style.width = `${g.prob}%`; }, 40);
    };

    sendBtn.addEventListener("click", () => {
      if (busy || sendBtn.disabled) return;
      const g = guests[idx];
      busy = true;
      sendBtn.disabled = true;
      statusEl.classList.remove("ok");
      statusEl.textContent = "Offer sent — guest is viewing…";
      const gain = g.price * g.nights;
      const finish = () => {
        statusEl.classList.add("ok");
        statusEl.textContent = `Accepted ✓ +$${gain} added to the stay (${g.nights} night${g.nights > 1 ? "s" : ""})`;
        total += gain;
        totalEl.textContent = `$${total.toLocaleString("en-US")}`;
        busy = false;
      };
      if (reducedMotion) finish();
      else setTimeout(finish, 900);
    });

    nextBtn.addEventListener("click", () => {
      if (busy) return;
      idx = (idx + 1) % guests.length;
      render();
    });

    render();
  }

  /* ---------- Hero canvas: the night tower ---------- */
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hero = document.querySelector(".hero");

  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* --- geometry: windows on the shell of a tower --- */
  const COLS = 7, ROWS = 14, DEPTH = 4;
  const SX = 30, SY = 33, SZ = 30;
  const windows = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      for (let z = 0; z < DEPTH; z++) {
        const shell = x === 0 || x === COLS - 1 || z === 0 || z === DEPTH - 1;
        if (!shell) continue;
        windows.push({
          x: (x - (COLS - 1) / 2) * SX,
          y: (y - (ROWS - 1) / 2) * SY,
          z: (z - (DEPTH - 1) / 2) * SZ,
          lit: Math.random() < 0.15,
          tw: Math.random() * Math.PI * 2,
          spd: 0.5 + Math.random() * 0.9,
        });
      }
    }
  }
  const litWindows = windows.filter((w) => w.lit);

  // tower wireframe corners
  const hw = ((COLS - 1) / 2) * SX + 14;
  const hh = ((ROWS - 1) / 2) * SY + 18;
  const hd = ((DEPTH - 1) / 2) * SZ + 14;
  const corners = [
    [-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd],
    [-hw, hh, -hd], [hw, hh, -hd], [hw, hh, hd], [-hw, hh, hd],
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  // orbital revenue rings
  const rings = [
    { r: 250, y: -120, n: 110, speed: 0.06, tilt: 0.0 },
    { r: 300, y: 60, n: 130, speed: -0.045, tilt: 0.0 },
  ];

  // particles: lit window -> ring
  const PARTICLE_COUNT = 26;
  const particles = [];
  const newParticle = (p) => {
    const w = litWindows[(Math.random() * litWindows.length) | 0] || windows[0];
    const ring = rings[(Math.random() * rings.length) | 0];
    const ang = Math.random() * Math.PI * 2;
    p.sx = w.x; p.sy = w.y; p.sz = w.z;
    p.ex = Math.cos(ang) * ring.r;
    p.ey = ring.y;
    p.ez = Math.sin(ang) * ring.r;
    p.t = 0;
    p.dur = 2.6 + Math.random() * 2.4;
    return p;
  };
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = newParticle({});
    p.t = Math.random(); // desync
    particles.push(p);
  }

  /* --- glow sprites (pre-rendered) --- */
  const makeSprite = (r, g, b, size) => {
    const s = document.createElement("canvas");
    s.width = s.height = size * 2;
    const c = s.getContext("2d");
    const grad = c.createRadialGradient(size, size, 0, size, size, size);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.25, `rgba(${r},${g},${b},0.5)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    c.fillStyle = grad;
    c.fillRect(0, 0, size * 2, size * 2);
    return s;
  };
  const brassSprite = makeSprite(232, 196, 138, 14);

  /* --- projection --- */
  const TILT = 0.42;
  const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
  const FOCAL = 760;
  let rotBase = 0.5;
  let mouseX = 0, mouseTargetX = 0;
  let mouseY = 0, mouseTargetY = 0;

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouseTargetX = ((e.clientX - r.left) / r.width - 0.5) * 0.34;
    mouseTargetY = ((e.clientY - r.top) / r.height - 0.5) * 0.1;
  }, { passive: true });

  // composition anchor: tower sits right-of-center on wide screens, centered on mobile
  const anchor = () => {
    if (W >= 1020) return { cx: W * 0.72, cy: H * 0.46, scale: 1 };
    if (W >= 720) return { cx: W * 0.62, cy: H * 0.42, scale: 0.85 };
    return { cx: W * 0.5, cy: H * 0.4, scale: 0.62 };
  };

  const project = (x, y, z, rot, cx, cy, sc) => {
    // rotate around Y
    const cr = Math.cos(rot), sr = Math.sin(rot);
    let px = x * cr - z * sr;
    let pz = x * sr + z * cr;
    // tilt around X
    let py = y * cosT - pz * sinT;
    pz = y * sinT + pz * cosT;
    const s = FOCAL / (FOCAL + pz);
    return {
      x: cx + px * s * sc,
      y: cy + py * s * sc,
      s: s * sc,
      z: pz,
    };
  };

  const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  let lastTime = 0;
  const drawFrame = (time) => {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;

    ctx.clearRect(0, 0, W, H);
    const { cx, cy, scale } = anchor();

    mouseX += (mouseTargetX - mouseX) * 0.04;
    mouseY += (mouseTargetY - mouseY) * 0.04;
    rotBase += dt * 0.07;
    const rot = rotBase + mouseX;
    const cyOff = cy + mouseY * 60;

    /* wireframe edges */
    ctx.strokeStyle = "rgba(238, 228, 205, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [a, b] of edges) {
      const pa = project(corners[a][0], corners[a][1], corners[a][2], rot, cx, cyOff, scale);
      const pb = project(corners[b][0], corners[b][1], corners[b][2], rot, cx, cyOff, scale);
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
    ctx.stroke();

    /* rings */
    for (const ring of rings) {
      const step = (Math.PI * 2) / ring.n;
      const phase = time * 0.001 * ring.speed * Math.PI * 2;
      for (let i = 0; i < ring.n; i++) {
        if (i % 3 === 0) continue; // dashed
        const a = i * step + phase;
        const p = project(Math.cos(a) * ring.r, ring.y, Math.sin(a) * ring.r, rot, cx, cyOff, scale);
        const depth = (FOCAL - p.z) / (FOCAL * 2) + 0.25;
        ctx.fillStyle = `rgba(227, 190, 126, ${0.16 * depth * 2})`;
        ctx.fillRect(p.x, p.y, 2 * p.s, 2 * p.s);
      }
    }

    /* windows — unlit ones are crisp grid points so the facade reads as
       architecture; lit ones glow brass */
    ctx.fillStyle = "rgba(178, 192, 218, 1)";
    for (const w of windows) {
      const p = project(w.x, w.y, w.z, rot, cx, cyOff, scale);
      const depthA = Math.max(0.12, Math.min(1, (FOCAL - p.z) / FOCAL - 0.1));
      if (!w.lit) {
        const size = Math.max(1.4, 2.8 * p.s);
        ctx.globalAlpha = depthA * 0.5;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        ctx.globalAlpha = 1;
      }
    }
    for (const w of litWindows) {
      const p = project(w.x, w.y, w.z, rot, cx, cyOff, scale);
      const depthA = Math.max(0.12, Math.min(1, (FOCAL - p.z) / FOCAL - 0.1));
      const twinkle = 0.72 + 0.28 * Math.sin(time * 0.001 * w.spd + w.tw);
      const size = 13 * p.s * twinkle;
      ctx.globalAlpha = depthA * twinkle;
      ctx.drawImage(brassSprite, p.x - size, p.y - size, size * 2, size * 2);
      ctx.globalAlpha = 1;
    }

    /* revenue particles */
    for (const p of particles) {
      p.t += dt / p.dur;
      if (p.t >= 1) newParticle(p);
      const t = easeInOut(p.t);
      // arc outward: lerp + radial bulge
      const bx = (p.sx + p.ex) / 2 * 1.5;
      const bz = (p.sz + p.ez) / 2 * 1.5;
      const omt = 1 - t;
      const x = omt * omt * p.sx + 2 * omt * t * bx + t * t * p.ex;
      const y = omt * omt * p.sy + 2 * omt * t * ((p.sy + p.ey) / 2 - 30) + t * t * p.ey;
      const z = omt * omt * p.sz + 2 * omt * t * bz + t * t * p.ez;
      const pr = project(x, y, z, rot, cx, cyOff, scale);
      const fade = Math.sin(Math.min(1, p.t) * Math.PI);
      const size = 6 * pr.s;
      ctx.globalAlpha = fade * 0.85;
      ctx.drawImage(brassSprite, pr.x - size, pr.y - size, size * 2, size * 2);
      ctx.globalAlpha = 1;
    }
  };

  // paint one frame immediately so the canvas is never blank before rAF ticks
  drawFrame(1600);
  lastTime = 0;

  if (!reducedMotion) {
    let running = false;
    let rafId = 0;
    const loop = (t) => {
      drawFrame(t);
      rafId = requestAnimationFrame(loop);
    };
    const setRunning = (on) => {
      if (on && !running) {
        running = true;
        lastTime = 0;
        rafId = requestAnimationFrame(loop);
      } else if (!on && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };
    const heroIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => setRunning(e.isIntersecting && !document.hidden)),
      { threshold: 0.02 }
    );
    heroIO.observe(hero);
    document.addEventListener("visibilitychange", () => {
      const rect = hero.getBoundingClientRect();
      setRunning(!document.hidden && rect.bottom > 0);
    });
  }
})();
