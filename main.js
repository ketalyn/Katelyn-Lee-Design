const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll('.top-nav a[href^="#"]');
const content = document.querySelector(".content");
const projectCards = [...document.querySelectorAll(".project-card[data-project]")];
const projectLinks = [...document.querySelectorAll(".project-link[data-project]")];
const timeEl = document.getElementById("sidebar-time");

function updateSidebarTime() {
  if (!timeEl) return;

  const now = new Date();

const formatted = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true
}).format(now);

  timeEl.textContent = formatted;
}

function updateActiveNav() {
  let currentSection = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSection}`
    );
  });
}

function setActiveProject(projectId) {
  projectLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.project === projectId);
  });
}

function updateActiveProject() {
  if (!content || !projectCards.length || window.innerWidth <= 768) return;

  const contentTop = content.getBoundingClientRect().top;
  const triggerOffset = 140;

  let activeProject = projectCards[0].dataset.project;

  projectCards.forEach((card) => {
    const topWithinContent = card.getBoundingClientRect().top - contentTop;

    if (topWithinContent <= triggerOffset) {
      activeProject = card.dataset.project;
    }
  });

  setActiveProject(activeProject);
}

function scrollToProjectCard(targetCard, projectId) {
  if (!content || !targetCard) return;

  const defaultOffset = 80;
  const firstCardOffset = 160;
  const isFirstCard = projectCards[0] === targetCard;
  const offset = isFirstCard ? firstCardOffset : defaultOffset;

  const targetTop = Math.max(0, targetCard.offsetTop - offset);

  content.scrollTo({
    top: targetTop,
    behavior: "smooth"
  });

  setActiveProject(projectId);
}

function bindDesktopProjectHover() {
  if (window.innerWidth <= 768) return;

  projectLinks.forEach((link) => {
    const targetId = link.dataset.project;
    const targetCard = document.querySelector(`.project-card[data-project="${targetId}"]`);

    if (!targetCard) return;

    link.addEventListener("mouseenter", () => {
      scrollToProjectCard(targetCard, targetId);
    });

    link.addEventListener("focus", () => {
      scrollToProjectCard(targetCard, targetId);
    });
  });
}

window.addEventListener("load", () => {
  updateActiveNav();
  updateActiveProject();
  bindDesktopProjectHover();
  updateSidebarTime();
  setInterval(updateSidebarTime, 1000);
});

if (content) {
  content.addEventListener("scroll", () => {
    updateActiveNav();
    updateActiveProject();
  });
}