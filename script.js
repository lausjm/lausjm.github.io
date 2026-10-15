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
   TREM DE POUSO INTERATIVO
   ========================================================= */
(function landingGear() {
  const parts = {
    trunnion: {
      tag: "FIXAÇÃO",
      title: "Munhão (Trunnion)",
      text: "Ponto de fixação do trem à estrutura da aeronave. É o eixo em torno do qual o trem gira durante a retração e por onde as cargas do pouso são transmitidas para a asa ou a fuselagem.",
    },
    amortecedor: {
      tag: "ABSORÇÃO DE IMPACTO",
      title: "Amortecedor óleo-pneumático",
      text: "O coração do trem de pouso. Combina fluido hidráulico e nitrogênio: o gás funciona como mola e o óleo, ao passar por orifícios calibrados, dissipa a energia do impacto. Nível, pressão e vedações são pontos críticos de inspeção.",
    },
    torque: {
      tag: "ALINHAMENTO",
      title: "Braços de torque (Torque links)",
      text: "Conjunto articulado em forma de tesoura que liga o cilindro externo ao pistão. Permite o curso vertical do amortecedor, mas impede que o pistão gire, mantendo as rodas alinhadas com a direção da aeronave.",
    },
    brace: {
      tag: "ESTABILIDADE",
      title: "Contraventamento (Brace)",
      text: "Barras articuladas que estabilizam o trem contra esforços longitudinais e laterais. Com o trem baixado, a articulação é travada (downlock), garantindo que ele não recolha com a aeronave no solo.",
    },
    atuador: {
      tag: "RETRAÇÃO",
      title: "Atuador de retração",
      text: "Cilindro hidráulico que recolhe e baixa o trem. Trabalha em conjunto com travas (uplock e downlock) e sensores que informam a cabine: as famosas três luzes verdes de “trem baixado e travado”.",
    },
    rodas: {
      tag: "CONTATO COM O SOLO",
      title: "Rodas e pneus",
      text: "Suportam o peso da aeronave no solo. Os pneus são inflados com nitrogênio e passam por inspeções frequentes de pressão, desgaste e cortes.",
    },
    freios: {
      tag: "DESACELERAÇÃO",
      title: "Freios de disco",
      text: "Pacote de discos (de aço ou carbono) montado dentro da roda, que converte energia cinética em calor durante a frenagem. O desgaste é acompanhado por pinos indicadores.",
    },
  };

  const stage = document.getElementById("gear-stage");
  const list = document.getElementById("part-list");
  const tagEl = document.getElementById("part-tag");
  const titleEl = document.getElementById("part-title");
  const textEl = document.getElementById("part-text");
  const toggle = document.getElementById("gear-toggle");
  const statusEl = document.getElementById("gear-status");
  const lights = ["l1", "l2", "l3"].map((id) => document.getElementById(id));
  const hotspots = [...document.querySelectorAll(".hotspot")];

  // Cria os botões com o nome de cada componente
  Object.entries(parts).forEach(([key, part]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.part = key;
    b.textContent = part.title.split(" (")[0];
    list.appendChild(b);
  });
  const buttons = [...list.querySelectorAll("button")];

  function select(key) {
    const part = parts[key];
    tagEl.textContent = part.tag;
    titleEl.textContent = part.title;
    textEl.textContent = part.text;
    hotspots.forEach((h) => h.classList.toggle("active", h.dataset.part === key));
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.part === key));
  }

  hotspots.forEach((h) => h.addEventListener("click", () => select(h.dataset.part)));
  buttons.forEach((b) => b.addEventListener("click", () => select(b.dataset.part)));

  // Luzes do painel: verde = baixado e travado, vermelho = em trânsito, apagado = recolhido
  function setLights(state) {
    lights.forEach((l) => {
      l.classList.toggle("green", state === "down");
      l.classList.toggle("red", state === "transit");
    });
  }
  setLights("down");

  let down = true;
  const TRAVEL = prefersReducedMotion ? 0 : 1900;

  toggle.addEventListener("click", () => {
    toggle.disabled = true;
    setLights("transit");
    statusEl.textContent = "EM TRÂNSITO";
    stage.classList.add("in-transit");
    buttons.forEach((b) => (b.disabled = true));

    if (down) stage.classList.add("retracted");
    else stage.classList.remove("retracted");

    setTimeout(() => {
      down = !down;
      stage.classList.remove("in-transit");
      setLights(down ? "down" : "up");
      statusEl.textContent = down ? "BAIXADO E TRAVADO" : "RECOLHIDO";
      toggle.textContent = down ? "▲ Recolher trem" : "▼ Baixar trem";
      toggle.disabled = false;
      buttons.forEach((b) => (b.disabled = !down));
    }, TRAVEL);
  });
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
