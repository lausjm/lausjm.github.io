// Marca que o JavaScript está ativo (habilita as animações de entrada)
document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   TEMA CLARO / ESCURO
   ========================================================= */
(function theme() {
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved;
  } catch (e) {}

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

/* =========================================================
   MENU NO CELULAR
   ========================================================= */
(function mobileMenu() {
  const btn = document.getElementById("menu-btn");
  const links = document.getElementById("nav-links");
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    })
  );
})();

/* =========================================================
   TEXTO DIGITANDO NO TOPO
   Para mudar as frases, edite a lista abaixo.
   ========================================================= */
(function typed() {
  const words = [
    "manutenção de trens de pouso.",
    "análise de dados.",
    "dashboards em Power BI.",
    "confiabilidade de equipamentos.",
    "modelagem 3D.",
    "automação com IA.",
  ];
  const el = document.getElementById("typed");
  if (prefersReducedMotion) { el.textContent = words[0]; return; }

  let w = 0, i = 0, deleting = false;
  function tick() {
    const word = words[w];
    i += deleting ? -1 : 1;
    el.textContent = word.slice(0, i);
    let delay = deleting ? 35 : 70;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
    setTimeout(tick, delay);
  }
  tick();
})();

/* =========================================================
   ANIMAÇÃO DE ENTRADA + CONTADORES
   ========================================================= */
(function reveal() {
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    if (prefersReducedMotion) { el.textContent = target; return; }
    const start = performance.now();
    const dur = 1200;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll("[data-count]").forEach(animateCount);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((el, idx) => {
    el.style.transitionDelay = `${(idx % 4) * 70}ms`;
    io.observe(el);
  });
})();

/* =========================================================
   BRILHO QUE SEGUE O MOUSE NOS CARDS
   ========================================================= */
document.querySelectorAll(".spot").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

/* =========================================================
   ROLAGEM: ALTÍMETRO, LINHA DO TEMPO E MENU ATIVO
   ========================================================= */
(function onScroll() {
  const altValue = document.getElementById("alt-value");
  const altFill = document.getElementById("alt-fill");
  const altPlane = document.getElementById("alt-plane");
  const altStatus = document.getElementById("alt-status");
  const timeline = document.getElementById("timeline");
  const tlProgress = document.getElementById("tl-progress");
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href")));
  const CRUISE = 35000;

  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(scrollY / max, 1) : 0;

    // Altímetro: o site começa em cruzeiro e "pousa" no contato
    const alt = Math.round((CRUISE * (1 - p)) / 100) * 100;
    altValue.textContent = alt.toLocaleString("pt-BR");
    altFill.style.height = `${p * 100}%`;
    altPlane.style.top = `${p * 100}%`;
    let status = "CRUZEIRO";
    if (p > 0.98) status = "POUSADO ✓";
    else if (p > 0.75) status = "APROXIMAÇÃO";
    else if (p > 0.05) status = "DESCIDA";
    altStatus.textContent = status;
    altStatus.classList.toggle("landed", p > 0.98);

    // Linha do tempo se preenche conforme a rolagem
    const r = timeline.getBoundingClientRect();
    const tp = Math.min(Math.max((innerHeight * 0.6 - r.top) / r.height, 0), 1);
    tlProgress.style.height = `${tp * 100}%`;

    // Destaca no menu a seção visível
    let current = -1;
    sections.forEach((s, idx) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = idx; });
    navLinks.forEach((a, idx) => a.classList.toggle("active", idx === current));
  }

  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  addEventListener("resize", update);
  update();
})();

/* =========================================================
   COPIAR E-MAIL
   ========================================================= */
(function copyEmail() {
  const btn = document.getElementById("copy-email");
  const fb = document.getElementById("copy-feedback");
  btn.addEventListener("click", async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      fb.textContent = "✓ E-mail copiado para a área de transferência";
    } catch (e) {
      window.location.href = `mailto:${email}`;
    }
    setTimeout(() => (fb.textContent = ""), 3000);
  });
})();

document.getElementById("year").textContent = new Date().getFullYear();
