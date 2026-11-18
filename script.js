(() => {
  "use strict";
  const W = window.WEDDING;
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  function parts(iso) {
    const [d, t = "00:00"] = iso.split("T");
    const [y, m, day] = d.split("-").map(Number);
    const [hh, mm] = t.split(":").map(Number);
    return { y, m, day, hh, mm, wd: new Date(Date.UTC(y, m - 1, day)).getUTCDay() };
  }
  const pad = (n) => String(n).padStart(2, "0");
  const fmtTime = ({ hh, mm }) => `${((hh + 11) % 12) + 1}:${pad(mm)} ${hh < 12 ? "AM" : "PM"}`;
  const gcalStamp = (p) => `${p.y}${pad(p.m)}${pad(p.day)}T${pad(p.hh)}${pad(p.mm)}00`;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ------------------------------------------------------------------
     Personalisation:  yoursite.vercel.app/?to=The%20Khan%20Family
     ------------------------------------------------------------------ */
  const params = new URLSearchParams(location.search);
  const guest = (params.get("to") || params.get("guest") || "").trim().slice(0, 48);
  if (guest) {
    const g = $("#guestName");
    g.textContent = guest;
    if (guest.length > 18) g.classList.add("long");
  }

  /* ------------------------------------------------------------------
     Fill content from config
     ------------------------------------------------------------------ */
  const main = parts(W.mainDate);
  const initials = `${W.monogram[0]}&${W.monogram[1]}`;
  document.querySelectorAll("#sealArt text").forEach((t) => (t.textContent = initials));
  document.title = `You're Invited · ${W.partner1} & ${W.partner2}`;

  $("#stampDate").textContent = `${pad(main.day)}·${pad(main.m)}·${String(main.y).slice(2)}`;
  $("#postmarkText").innerHTML = `WITH LOVE<br>${MONTHS[main.m - 1].slice(0, 3).toUpperCase()} ${main.y}`;
  const stacked = (el) => { el.innerHTML = ""; [W.partner1, "&", W.partner2].forEach((t, i) => { const s = document.createElement("span"); s.textContent = t; s.className = i === 1 ? "amp-s" : "nm"; el.appendChild(s); }); };
  stacked($("#cardNames"));
  if ((W.partner1 + W.partner2).length > 18) $("#cardNames").classList.add("long");
  $("#cardDate").textContent = `${pad(main.day)} · ${pad(main.m)} · ${main.y}`;

  function splitLetters(el, text, start) {
    // letters animate one by one, but words never break apart when a long name wraps
    const step = Math.min(0.09, 1.3 / text.length);
    let n = 0;
    text.split(" ").forEach((word, wi) => {
      if (wi) el.appendChild(document.createTextNode(" "));
      const w = document.createElement("span");
      w.className = "word";
      [...word].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "l";
        s.textContent = ch;
        s.style.setProperty("--ld", `${start + n++ * step}s`);
        w.appendChild(s);
      });
      n++;
      el.appendChild(w);
    });
    if (text.length > 16) el.classList.add("xlong");
    else if (text.length > 9) el.classList.add("long");
    el.setAttribute("aria-label", text);
  }
  splitLetters($("#name1"), W.partner1, 1.6);
  splitLetters($("#name2"), W.partner2, 2.6);

  $("#inviteLine").textContent = W.invitationLine;
  $("#dWeekday").textContent = DAYS[main.wd];
  $("#dDay").textContent = pad(main.day);
  $("#dMonthYear").textContent = `${MONTHS[main.m - 1]} ${main.y}`;
  $("#quoteText").textContent = `“${W.quote.text}”`;
  $("#quoteAuthor").textContent = W.quote.author;
  stacked($("#signoff"));
  $("#hashtag").textContent = W.hashtag || "";
  if (W.dressCode) $("#dress").innerHTML = `<b>Dress code</b>`, $("#dress").append(W.dressCode);
  else $("#dress").remove();


  /* Event cards */
  const ICONS = {
    rings: '<circle cx="19" cy="30" r="10"/><circle cx="29" cy="30" r="10"/><path d="M25 14l2-4h4l2 4-4 4.5z"/>',
    glass: '<g transform="rotate(-14 16 24)"><path d="M12 8h8l-.6 11a3.4 3.4 0 0 1-6.8 0z"/><path d="M16 22.4V38M12 38h8"/></g><g transform="rotate(14 32 24)"><path d="M28 8h8l-.6 11a3.4 3.4 0 0 1-6.8 0z"/><path d="M32 22.4V38M28 38h8"/></g><path d="M24 6v-3M20 7l-2-2M28 7l2-2"/>',
    moon: '<path d="M27 8a15 15 0 1 0 13 22A12 12 0 0 1 27 8z"/><path d="M36 10v4M34 12h4M40 20v2M39 21h2"/>',
    flower: '<circle cx="24" cy="24" r="3.5"/><path d="M24 20.5c-4-6-1-11 0-12 1 1 4 6 0 12zM27.5 24c6-4 11-1 12 0-1 1-6 4-12 0zM24 27.5c4 6 1 11 0 12-1-1-4-6 0-12zM20.5 24c-6 4-11 1-12 0 1-1 6-4 12 0z"/>',
  };
  const list = $("#events");
  const events = Array.isArray(W.events) ? W.events : [];
  if (!events.length) {
    // no events: drop the cards (and the whole section if there's no dress code either)
    if (W.dressCode) { list.remove(); document.querySelector(".events > .eyebrow").remove(); }
    else document.querySelector("section.events").remove();
  }
  events.forEach((ev, i) => {
    const s = parts(ev.start), e = parts(ev.end || ev.start);
    const where = ev.mapQuery || `${ev.venue}, ${ev.address}`;
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`;
    const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(`${ev.title} · ${W.partner1} & ${W.partner2}`)}` +
      `&dates=${gcalStamp(s)}/${gcalStamp(e)}` +
      `&ctz=${encodeURIComponent(W.timezone || "")}` +
      `&location=${encodeURIComponent(where)}` +
      `&details=${encodeURIComponent(`We can't wait to celebrate with you. ${location.origin}${location.pathname}`)}`;
    const el = document.createElement("article");
    el.className = "event reveal";
    el.style.transitionDelay = `${i * 0.12}s`;
    el.innerHTML = `
      <svg class="event-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[ev.icon] || ICONS.flower}</svg>
      <h3></h3>
      <div class="when"><b>${DAYS[s.wd]}, ${s.day} ${MONTHS[s.m - 1]} ${s.y}</b>${fmtTime(s)}${ev.end ? " onwards" : ""}</div>
      <div class="sep"></div>
      <p class="venue"></p>
      <p class="addr"></p>
      <div class="actions">
        <a class="btn" href="${maps}" target="_blank" rel="noopener">Directions</a>
        <a class="btn" href="${cal}" target="_blank" rel="noopener">Save the date</a>
      </div>`;
    el.querySelector("h3").textContent = ev.title;
    el.querySelector(".venue").textContent = ev.venue;
    el.querySelector(".addr").textContent = ev.address;
    list.appendChild(el);
  });

  /* Wreath (procedurally drawn botanical laurel) */
  (function buildWreath() {
    const svg = $("#wreath"), NS = "http://www.w3.org/2000/svg";
    const C = 100, R = 76;
    const P = (deg, r = R) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)];
    const f = (n) => n.toFixed(2);
    let html = "";
    const branch = (from, to, delay) => {
      const dir = Math.sign(to - from);
      const [x0, y0] = P(from), [x1, y1] = P(to);
      html += `<path class="draw" pathLength="1" style="animation-delay:${delay}s" d="M${f(x0)} ${f(y0)} A${R} ${R} 0 0 ${dir > 0 ? 1 : 0} ${f(x1)} ${f(y1)}"/>`;
      const span = Math.abs(to - from), n = Math.floor(span / 12);
      for (let i = 0; i < n; i++) {
        const a = from + dir * (8 + i * 12);
        const t = i / n;
        const rad = (a * Math.PI) / 180;
        const tx = -Math.sin(rad) * dir, ty = Math.cos(rad) * dir; // travel direction
        [1, -1].forEach((side, k) => {
          const ang = side * 0.62;
          const dx = tx * Math.cos(ang) - ty * Math.sin(ang);
          const dy = tx * Math.sin(ang) + ty * Math.cos(ang);
          const L = 15 - t * 6, w = 4.2 - t * 1.4;
          const [bx, by] = P(a);
          const tipx = bx + dx * L, tipy = by + dy * L;
          const mx = bx + dx * L * 0.5, my = by + dy * L * 0.5;
          const c1 = [mx - dy * w, my + dx * w], c2 = [mx + dy * w, my - dx * w];
          html += `<path class="draw" pathLength="1" style="animation-delay:${f(delay + 0.25 + i * 0.07 + k * 0.03)}s" d="M${f(bx)} ${f(by)} Q${f(c1[0])} ${f(c1[1])} ${f(tipx)} ${f(tipy)} Q${f(c2[0])} ${f(c2[1])} ${f(bx)} ${f(by)}"/>`;
        });
      }
      const [ex, ey] = P(to + dir * 3);
      html += `<circle class="berry" cx="${f(ex)}" cy="${f(ey)}" r="1.8" style="animation-delay:${delay + 1.2}s"/>`;
    };
    branch(102, 250, 0.4);
    branch(78, -70, 0.5);
    const [bx, by] = P(90, R);
    html += `<circle class="berry" cx="${f(bx)}" cy="${f(by)}" r="2.4" style="animation-delay:.5s"/>`;
    html += `<text class="initials" x="100" y="112" text-anchor="middle">${W.monogram[0]}<tspan class="and" dx="4" dy="-2">&amp;</tspan><tspan dx="4" dy="2">${W.monogram[1]}</tspan></text>`;
    svg.innerHTML = html;
  })();

  /* ------------------------------------------------------------------
     Sound (synthesised – no files needed)
     ------------------------------------------------------------------ */
  let AC = null;
  const audioCtx = () => {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch { AC = null; } }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  };
  function noise(dur) {
    const ctx = AC, b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b; return s;
  }
  function whoosh() {
    const ctx = audioCtx(); if (!ctx) return;
    const t = ctx.currentTime, n = noise(0.7), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "bandpass"; f.Q.value = 0.8;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2200, t + 0.6);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.25); g.gain.linearRampToValueAtTime(0, t + 0.7);
    n.connect(f).connect(g).connect(ctx.destination); n.start(t);
  }
  function crack() {
    const ctx = audioCtx(); if (!ctx) return;
    const t = ctx.currentTime, n = noise(0.15), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "highpass"; f.frequency.value = 1400;
    g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    n.connect(f).connect(g).connect(ctx.destination); n.start(t);
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.18);
    og.gain.setValueAtTime(0.25, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(og).connect(ctx.destination); o.start(t); o.stop(t + 0.22);
  }
  function chime() {
    const ctx = audioCtx(); if (!ctx) return;
    const notes = [880, 1108.73, 1318.51, 1760, 2217.46];
    notes.forEach((fq, i) => {
      const t = ctx.currentTime + 0.12 + i * 0.13;
      [1, 2.01].forEach((h, k) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = fq * h;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(k ? 0.012 : 0.045, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 2.7);
      });
    });
  }

  /* Optional background music */
  const audio = $("#audio"), musicBtn = $("#music");
  let hasMusic = false;
  if (W.music) {
    fetch(W.music, { method: "HEAD" }).then((r) => {
      const type = r.headers.get("content-type") || "";
      if (r.ok && !type.includes("text/html")) { hasMusic = true; audio.src = W.music; musicBtn.hidden = false; }
    }).catch(() => {});
  }
  function playMusic() {
    if (!hasMusic) return;
    audio.volume = 0;
    audio.play().then(() => {
      musicBtn.classList.add("playing"); musicBtn.setAttribute("aria-label", "Pause music");
      let v = 0; const id = setInterval(() => { v = Math.min(0.55, v + 0.03); audio.volume = v; if (v >= 0.55) clearInterval(id); }, 120);
    }).catch(() => {});
  }
  musicBtn.addEventListener("click", () => {
    if (audio.paused) playMusic();
    else { audio.pause(); musicBtn.classList.remove("playing"); musicBtn.setAttribute("aria-label", "Play music"); }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !audio.paused) { audio.pause(); audio.dataset.resume = "1"; }
    else if (!document.hidden && audio.dataset.resume) { audio.play().catch(() => {}); delete audio.dataset.resume; }
  });

  /* ------------------------------------------------------------------
     Gold dust (intro)
     ------------------------------------------------------------------ */
  const dust = $("#dust"), dctx = dust.getContext("2d");
  const DPR = Math.min(devicePixelRatio || 1, 2);
  let dW, dH, motes = [], sparks = [], dustOn = true;
  function sizeDust() { dW = innerWidth; dH = innerHeight; dust.width = dW * DPR; dust.height = dH * DPR; dctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  sizeDust(); addEventListener("resize", sizeDust);
  const N = reduced ? 25 : Math.round(Math.min(90, (innerWidth * innerHeight) / 9000));
  for (let i = 0; i < N; i++) motes.push({ x: Math.random() * dW, y: Math.random() * dH, r: Math.random() * 1.5 + 0.3, vy: -(Math.random() * 0.25 + 0.05), vx: (Math.random() - 0.5) * 0.12, p: Math.random() * 6.28, s: Math.random() * 0.02 + 0.006 });
  function burst(x, y, n = 70) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 5 + 1;
      sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, r: Math.random() * 1.8 + 0.6, life: 1, d: Math.random() * 0.012 + 0.008 });
    }
  }
  (function loopDust() {
    if (!dustOn) return;
    dctx.clearRect(0, 0, dW, dH);
    for (const m of motes) {
      m.x += m.vx; m.y += m.vy; m.p += m.s;
      if (m.y < -5) { m.y = dH + 5; m.x = Math.random() * dW; }
      const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(m.p));
      dctx.fillStyle = `rgba(222,190,130,${a})`;
      dctx.beginPath(); dctx.arc(m.x, m.y, m.r, 0, 6.283); dctx.fill();
    }
    sparks = sparks.filter((s) => s.life > 0);
    for (const s of sparks) {
      s.x += s.vx; s.y += s.vy; s.vx *= 0.96; s.vy = s.vy * 0.96 + 0.05; s.life -= s.d;
      dctx.fillStyle = `rgba(240,212,150,${Math.max(0, s.life)})`;
      dctx.beginPath(); dctx.arc(s.x, s.y, s.r, 0, 6.283); dctx.fill();
    }
    requestAnimationFrame(loopDust);
  })();

  /* ------------------------------------------------------------------
     Intro choreography
     ------------------------------------------------------------------ */
  const stage = $("#stage"), flip = $("#envFlip"), front = $("#envFront"), seal = $("#seal");
  const flap = $("#flap"), card = $("#card"), hint = $("#hint"), kicker = $("#kicker");
  let state = "closed";

  const hand = $("#tapHand");
  const AUTO_FLIP_MS = 9000;   // if nobody taps, the envelope turns over by itself
  const AUTO_OPEN_MS = 9000;   // ...and then opens by itself
  let autoTimer = 0;

  stage.addEventListener("animationend", (e) => {
    if (e.animationName === "arrive" && state === "closed") {
      stage.classList.add("floating");
      hand.classList.add("show");
    }
  });
  autoTimer = setTimeout(() => flipEnvelope(), AUTO_FLIP_MS);

  function setHint(ur, en) {
    hint.classList.add("swap");
    setTimeout(() => {
      $("#hintUr").textContent = ur; $("#hintEn").textContent = en;
      hint.classList.remove("swap");
      hint.style.animation = "fadeIn .8s ease forwards, pulse 2.4s 1s ease-in-out infinite";
    }, 400);
  }

  // Elders may tap anywhere — any tap on the screen moves to the next step
  $("#intro").addEventListener("click", () => {
    if (state === "closed") flipEnvelope();
    else if (state === "sealed") openSeal();
  });

  // Gentle wiggle if the guest hasn't tapped yet
  const wiggleTimer = setInterval(() => {
    if (state !== "closed") return clearInterval(wiggleTimer);
    front.classList.remove("env-wiggle"); void front.offsetWidth; front.classList.add("env-wiggle");
  }, 5200);

  async function flipEnvelope() {
    if (state !== "closed") return;
    state = "flipping";
    clearTimeout(autoTimer);
    hand.classList.remove("show");
    audioCtx(); whoosh();
    stage.classList.add("floating");
    flip.classList.add("flipped");
    setHint("اب سرخ مہر کو دبائیں", "Now tap the red seal");
    await wait(reduced ? 300 : 1300);
    flip.classList.add("settled");
    seal.classList.add("ready");
    hand.classList.add("on-seal", "show");
    state = "sealed";
    autoTimer = setTimeout(() => openSeal(), AUTO_OPEN_MS);
  }

  async function openSeal() {
    if (state !== "sealed") return;
    state = "opening";
    clearTimeout(autoTimer);
    hand.classList.remove("show");
    playMusic();            // must start inside the tap
    crack();
    if (navigator.vibrate) navigator.vibrate([18, 40, 26]);
    seal.classList.remove("ready"); seal.classList.add("shake");
    hint.classList.add("swap"); kicker.style.transition = "opacity .8s"; kicker.style.opacity = "0";

    // freeze the floating motion smoothly
    const m = getComputedStyle(stage).transform;
    stage.style.transform = m === "none" ? "" : m;
    stage.classList.remove("floating"); stage.classList.add("still");
    requestAnimationFrame(() => { stage.style.transition = "transform .9s ease"; stage.style.transform = "none"; });

    await wait(340);
    seal.classList.remove("shake"); seal.classList.add("broken");
    const r = seal.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, reduced ? 20 : 90);
    $("#flash").classList.add("go");
    chime();

    await wait(380);
    flap.classList.add("open"); whoosh();
    await wait(480);
    flap.classList.add("behind");

    await wait(520);
    card.classList.add("out");

    await wait(1450);
    stage.classList.add("exit");

    await wait(420);
    card.classList.add("lift", "fade-content");
    const c = card.getBoundingClientRect();
    const dx = innerWidth / 2 - (c.left + c.width / 2);
    const dy = innerHeight / 2 - (c.top + c.height / 2);
    const s = Math.max(innerWidth / c.width, innerHeight / c.height) * 1.2;
    card.style.transition = "transform 1.5s cubic-bezier(.7,0,.2,1), box-shadow 1.5s";
    card.style.boxShadow = "none";
    card.style.transform = `translate(${dx}px, ${dy}px) translateY(-58%) scale(${s})`;

    await wait(1450);
    document.body.classList.add("opened");
    $("#invite").removeAttribute("aria-hidden");
    $("#intro").classList.add("gone");
    startPetals();
    document.body.classList.remove("is-intro");
    window.scrollTo(0, 0);

    await wait(1000);
    dustOn = false;
    $("#intro").remove();
    state = "open";
  }

  // Keyboard: Enter/Space work natively on buttons.

  /* ------------------------------------------------------------------
     Petals (after opening)
     ------------------------------------------------------------------ */
  function startPetals() {
    if (reduced) return;
    const cv = $("#petals"), ctx = cv.getContext("2d");
    let w, h; const petals = [];
    const size = () => { w = innerWidth; h = innerHeight; cv.width = w * DPR; cv.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    size(); addEventListener("resize", size);
    const COLORS = ["#ecd0c8", "#f2ddd5", "#e3bfb5", "#f5e6dc"];
    const spawn = (y) => petals.push({
      x: Math.random() * w, y: y ?? -20, r: Math.random() * 5 + 5,
      vy: Math.random() * 0.6 + 0.5, sw: Math.random() * 1.5 + 0.5, ph: Math.random() * 6.28,
      rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.04, flip: Math.random() * 6.28,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    });
    for (let i = 0; i < 34; i++) spawn(-Math.random() * h * 0.9);
    let last = 0, born = performance.now();
    (function tick(t) {
      ctx.clearRect(0, 0, w, h);
      const age = t - born;
      // keep a gentle trickle after the opening shower
      if (t - last > 2600 && petals.length < 7 && age > 9000) { spawn(); last = t; }
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.ph += 0.015; p.flip += 0.03; p.rot += p.vr;
        p.y += p.vy; p.x += Math.sin(p.ph) * p.sw * 0.6;
        if (p.y > h + 20) { petals.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(Math.cos(p.flip) * 0.6 + 0.4, 1);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r * 0.9, -p.r * 0.6, p.r * 0.7, p.r * 0.8, 0, p.r);
        ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.8, -p.r * 0.9, -p.r * 0.6, 0, -p.r);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(tick);
    })(performance.now());
  }

  /* ------------------------------------------------------------------
     Scroll reveals + countdown
     ------------------------------------------------------------------ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const target = Date.parse(`${pad(main.y)}-${pad(main.m)}-${pad(main.day)}T${pad(main.hh || 0)}:${pad(main.mm || 0)}:00${W.utcOffset || "Z"}`);
  const nums = {}; document.querySelectorAll(".cd-n").forEach((n) => (nums[n.dataset.u] = n));
  function updateCountdown() {
    let diff = Math.max(0, target - Date.now());
    if (!diff) { const eb = document.querySelector(".countdown .eyebrow"); if (eb) eb.textContent = "Happily ever after"; }
    const v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
    for (const k in v) {
      const txt = k === "d" ? String(v[k]) : pad(v[k]);
      if (nums[k].textContent !== txt) {
        nums[k].textContent = txt;
        nums[k].classList.remove("tick"); void nums[k].offsetWidth; nums[k].classList.add("tick");
      }
    }
  }
  updateCountdown(); setInterval(updateCountdown, 1000);

  // the "scroll down" helper stays on screen until the guest starts scrolling
  addEventListener("scroll", () => $("#scrollCue").classList.toggle("away", scrollY > 60), { passive: true });
  $("#scrollCue").addEventListener("click", () => {
    document.querySelector(".quote").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $("#replay").addEventListener("click", () => { window.scrollTo(0, 0); location.reload(); });
})();
