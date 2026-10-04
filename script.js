const DEMO_MODE = true;

const WHATSAPP_NUMBER = "5585999411884";

const messages = {
  header: "Olá! Vi o site da Start Fitness e gostaria de saber mais sobre planos e matrícula.",
  menu: "Olá! Vi o site da Start Fitness e quero tirar algumas dúvidas.",
  hero: "Olá! Vi o site da Start Fitness e quero conhecer a academia. Pode me passar informações sobre planos e matrícula?",
  schedule: "Olá! Vi o site da Start Fitness e gostaria de confirmar os horários de funcionamento.",
  final: "Olá! Quero começar na Start Fitness. Pode me passar informações sobre planos, valores e matrícula?",
  floating: "Olá! Vi o site da Start Fitness e gostaria de mais informações."
};

const goalMessages = {
  massa: "Olá! Meu objetivo é ganhar massa e gostaria de saber como começar na Start Fitness.",
  emagrecer: "Olá! Meu objetivo é emagrecer e gostaria de saber como começar na Start Fitness.",
  condicionamento: "Olá! Meu objetivo é melhorar o condicionamento e gostaria de informações sobre a Start Fitness.",
  rotina: "Olá! Quero criar uma rotina de treinos e gostaria de saber mais sobre a Start Fitness."
};

const whatsappUrl = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  const key = link.dataset.whatsapp;
  link.href = whatsappUrl(messages[key] || messages.floating);
});

document.querySelectorAll("[data-goal-whatsapp]").forEach((link) => {
  const key = link.dataset.goalWhatsapp;
  link.href = whatsappUrl(goalMessages[key] || messages.floating);
});


/* Proteção da demonstração comercial */
const demoToast = document.getElementById("demoToast");
let demoToastTimer;

function showDemoToast() {
  if (!demoToast) return;
  demoToast.classList.add("show");
  clearTimeout(demoToastTimer);
  demoToastTimer = setTimeout(() => demoToast.classList.remove("show"), 3200);
}

if (DEMO_MODE) {
  document.querySelectorAll("[data-whatsapp], [data-goal-whatsapp]").forEach((link) => {
    link.setAttribute("aria-label", "Botão demonstrativo — WhatsApp liberado na versão final");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showDemoToast();
    });
  });
}

/* Header + mobile menu */
const header = document.querySelector(".site-header");
const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

function updateHeader() {
  header?.classList.toggle("scrolled", window.scrollY > 18);
}
updateHeader();

function closeMenu() {
  mobileMenu?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  mobileMenu?.classList.toggle("open", !open);
  document.body.classList.toggle("menu-open", !open);
});
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

/* Hero media expansion — requestAnimationFrame, no animation library */
const hero = document.querySelector("[data-hero-motion]");
const heroMedia = document.getElementById("heroExpandMedia");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

let ticking = false;

function updateHeroMotion() {
  if (!hero || !heroMedia || window.matchMedia("(max-width: 980px)").matches) {
    ticking = false;
    return;
  }

  const rect = hero.getBoundingClientRect();
  const scrollable = Math.max(1, hero.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / scrollable);
  const eased = progress * progress * (3 - 2 * progress);

  const sticky = hero.querySelector(".hero-sticky");
  const stickyRect = sticky.getBoundingClientRect();
  const viewportCenterX = window.innerWidth / 2;
  const mediaCenterX = stickyRect.left + heroMedia.offsetLeft + heroMedia.offsetWidth / 2;
  const mediaCenterY = stickyRect.top + heroMedia.offsetTop + heroMedia.offsetHeight / 2;

  /* Uses transform only: smooth and inexpensive, without changing page layout on every frame. */
  const targetScale = Math.min(
    1.72,
    Math.max(1.38, Math.min(window.innerWidth * 0.92 / heroMedia.offsetWidth, window.innerHeight * 0.84 / heroMedia.offsetHeight))
  );
  const shiftX = (viewportCenterX - mediaCenterX) * eased * 0.86;
  const shiftY = (window.innerHeight * 0.50 - mediaCenterY) * eased * 0.55;

  hero.style.setProperty("--hero-p", progress.toFixed(3));
  hero.style.setProperty("--hero-scale", lerp(1, targetScale, eased).toFixed(3));
  hero.style.setProperty("--hero-x", `${shiftX.toFixed(1)}px`);
  hero.style.setProperty("--hero-y", `${shiftY.toFixed(1)}px`);
  hero.style.setProperty("--hero-radius", `${lerp(30, 14, eased).toFixed(1)}px`);
  hero.style.setProperty("--hero-copy-opacity", clamp(1 - progress * 2.3).toFixed(3));
  hero.style.setProperty("--hero-chip-opacity", clamp(1 - progress * 2.0).toFixed(3));
  hero.style.setProperty("--hero-media-message-opacity", clamp((progress - 0.35) * 2.0).toFixed(3));

  ticking = false;
}

function requestMotionUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateHeroMotion);
    ticking = true;
  }
}

window.addEventListener("scroll", () => {
  updateHeader();
  requestMotionUpdate();
  updateManifesto();
}, { passive: true });
window.addEventListener("resize", requestMotionUpdate, { passive: true });
requestMotionUpdate();

/* Pointer-follow spotlight */
document.querySelectorAll("[data-spotlight]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  });
});

/* Manifesto word reveal */
const manifesto = document.getElementById("manifesto");
const manifestoWords = [...document.querySelectorAll(".reveal-word")];

function updateManifesto() {
  if (!manifesto || !manifestoWords.length) return;

  const rect = manifesto.getBoundingClientRect();
  const travel = Math.max(1, manifesto.offsetHeight - window.innerHeight * 0.62);
  const progress = clamp((window.innerHeight * 0.72 - rect.top) / travel);
  const visibleWords = Math.round(progress * manifestoWords.length);

  manifestoWords.forEach((word, index) => {
    word.classList.toggle("active", index < visibleWords);
  });
}
updateManifesto();

/* Sticky goal stories */
const goalStories = [...document.querySelectorAll("[data-goal-story]")];
const goalProgressBar = document.getElementById("goalProgressBar");

if (goalStories.length) {
  const goalObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const activeIndex = goalStories.indexOf(visible.target);

    goalStories.forEach((story, index) => story.classList.toggle("active", index === activeIndex));
    if (goalProgressBar) {
      goalProgressBar.style.width = `${((activeIndex + 1) / goalStories.length) * 100}%`;
    }
  }, {
    threshold: [0.3, 0.55, 0.75],
    rootMargin: "-18% 0px -26% 0px"
  });

  goalStories.forEach((story) => goalObserver.observe(story));
}

/* Interactive gallery */
const galleryItems = [...document.querySelectorAll(".gallery-item")];
function activateGalleryItem(item) {
  galleryItems.forEach((galleryItem) => galleryItem.classList.toggle("active", galleryItem === item));
}
galleryItems.forEach((item) => {
  item.addEventListener("pointerenter", () => {
    if (window.matchMedia("(hover: hover)").matches) activateGalleryItem(item);
  });
  item.addEventListener("focus", () => activateGalleryItem(item));
  item.addEventListener("click", () => activateGalleryItem(item));
});

/* Interactive schedule */
const weekdays = {
  1: "SEGUNDA-FEIRA",
  2: "TERÇA-FEIRA",
  3: "QUARTA-FEIRA",
  4: "QUINTA-FEIRA",
  5: "SEXTA-FEIRA",
  6: "SÁBADO",
  0: "DOMINGO"
};

const dayButtons = document.querySelectorAll(".day-button");
const selectedDayLabel = document.getElementById("selectedDayLabel");
const scheduleTimes = document.getElementById("scheduleTimes");
const scheduleNote = document.getElementById("scheduleNote");

function renderSchedule(day) {
  if (!selectedDayLabel || !scheduleTimes || !scheduleNote) return;
  selectedDayLabel.textContent = weekdays[day];

  if (day >= 1 && day <= 5) {
    scheduleTimes.innerHTML = `
      <div><small>MANHÃ</small><strong>05:30</strong><span>até</span><strong>11:30</strong></div>
      <div class="schedule-rule"></div>
      <div><small>TARDE / NOITE</small><strong>14:30</strong><span>até</span><strong>21:30</strong></div>
    `;
    scheduleNote.textContent = "Horários podem sofrer alterações em feriados. Confirme com a equipe quando necessário.";
  } else {
    scheduleTimes.innerHTML = `
      <div><small>FIM DE SEMANA</small><strong>CONFIRME</strong><span></span><strong></strong></div>
      <div class="schedule-rule"></div>
      <div><small>INFORMAÇÃO</small><strong>WHATSAPP</strong><span></span><strong></strong></div>
    `;
    scheduleNote.textContent = "Não exibimos um horário de fim de semana sem confirmação pública. Consulte a equipe pelo WhatsApp.";
  }
}

dayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    dayButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderSchedule(Number(button.dataset.day));
  });
});

/* Live status fixed to America/Fortaleza, the timezone used in Baturité/CE. */
const liveStatus = document.getElementById("liveStatus");
const liveStatusDetail = document.getElementById("liveStatusDetail");
const minutes = (h, m) => h * 60 + m;

function getFortalezaNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Fortaleza",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    day: dayMap[values.weekday],
    hour: Number(values.hour),
    minute: Number(values.minute)
  };
}

function updateLiveStatus() {
  const now = getFortalezaNow();
  const day = now.day;
  const current = minutes(now.hour, now.minute);

  if (liveStatus && liveStatusDetail) {
    if (day >= 1 && day <= 5) {
      const morningOpen = current >= minutes(5, 30) && current < minutes(11, 30);
      const afternoonOpen = current >= minutes(14, 30) && current < minutes(21, 30);

      if (morningOpen || afternoonOpen) {
        liveStatus.textContent = "Aberto agora";
        liveStatusDetail.textContent = afternoonOpen ? "Hoje até 21:30" : "Turno da manhã até 11:30";
      } else if (current < minutes(5, 30)) {
        liveStatus.textContent = "Abre às 05:30";
        liveStatusDetail.textContent = "Primeiro turno de hoje";
      } else if (current < minutes(14, 30)) {
        liveStatus.textContent = "Retorna às 14:30";
        liveStatusDetail.textContent = "Intervalo entre os turnos";
      } else {
        liveStatus.textContent = "Fechado agora";
        liveStatusDetail.textContent = "Próximo turno: 05:30";
      }
    } else {
      liveStatus.textContent = "Consulte hoje";
      liveStatusDetail.textContent = "Fim de semana: confirme no WhatsApp";
    }
  }

  dayButtons.forEach((item) => item.classList.toggle("active", Number(item.dataset.day) === day));
  renderSchedule(day);
}

updateLiveStatus();
setInterval(updateLiveStatus, 60000);

/* Standard reveal animations */
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -30px" });

revealItems.forEach((item) => revealObserver.observe(item));

/* One FAQ open at a time */
document.querySelectorAll("details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll("details").forEach((other) => {
      if (other !== detail) other.removeAttribute("open");
    });
  });
});
