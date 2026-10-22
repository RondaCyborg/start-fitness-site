// Modelo fictício para portfólio. Nenhuma academia, número ou endereço real está associado.
const DEMO_MODE = true;

/* Nenhum link de atendimento real é habilitado nesta demonstração. */
const demoToast = document.getElementById("demoToast");
let demoToastTimer;
function showDemoToast() {
  if (!demoToast) return;
  demoToast.classList.add("show");
  clearTimeout(demoToastTimer);
  demoToastTimer = setTimeout(() => demoToast.classList.remove("show"), 3200);
}
document.querySelectorAll("[data-whatsapp], [data-goal-whatsapp]").forEach(link => {
  link.href = "#";
  link.removeAttribute("target");
  link.setAttribute("aria-label", "Interação ilustrativa — não existe WhatsApp de academia");
  link.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    showDemoToast();
  });
});

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

/* Quadro de horários fictício: interativo, mas sem dados de qualquer academia real. */
const weekdays = {
  1: "SEGUNDA-FEIRA", 2: "TERÇA-FEIRA", 3: "QUARTA-FEIRA", 4: "QUINTA-FEIRA",
  5: "SEXTA-FEIRA", 6: "SÁBADO", 0: "DOMINGO"
};
const dayButtons = document.querySelectorAll(".day-button");
const selectedDayLabel = document.getElementById("selectedDayLabel");
const scheduleTimes = document.getElementById("scheduleTimes");
const scheduleNote = document.getElementById("scheduleNote");
function renderSchedule(day) {
  if (!selectedDayLabel || !scheduleTimes || !scheduleNote) return;
  selectedDayLabel.textContent = weekdays[day] || "DIA";
  scheduleTimes.innerHTML =
    '<div><small>EXEMPLO</small><strong>HORÁRIO</strong><span>—</span><strong>FICTÍCIO</strong></div>' +
    '<div class="schedule-rule"></div>' +
    '<div><small>ATENDIMENTO</small><strong>DEMO</strong><span></span><strong></strong></div>';
  scheduleNote.textContent = "Este quadro é ilustrativo. Nenhum horário de empresa real está sendo divulgado.";
}
dayButtons.forEach(button => {
  button.addEventListener("click", () => {
    dayButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    renderSchedule(Number(button.dataset.day));
  });
});
renderSchedule(1);
const liveStatus = document.getElementById("liveStatus");
const liveStatusDetail = document.getElementById("liveStatusDetail");
if (liveStatus) liveStatus.textContent = "Academia fictícia";
if (liveStatusDetail) liveStatusDetail.textContent = "Modelo demonstrativo • sem horários reais";

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
