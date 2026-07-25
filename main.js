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

/* ---------------------------------
   INTRO: HOVER INDIVIDUAL CHARACTERS
---------------------------------- */

const intro = document.querySelector(".intro");

const introGlyphs = [
  "◉", "◊", "○", "▣", "✽", "▲", "⎈", "☉", "⌘",
  "□", "△", "◇", "●", "✦", "◌", "▤", "◐", "◆"
];

function prepareIntroCharacters() {
  if (!intro || intro.dataset.charactersPrepared === "true") return;

  const walker = document.createTreeWalker(
    intro,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return node.nodeValue.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    }
  );

  const textNodes = [];
  let currentNode;

  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  let glyphIndex = 0;

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();

    [...textNode.nodeValue].forEach((character) => {
      if (/[\p{L}\p{N}]/u.test(character)) {
        const span = document.createElement("span");

        span.className = "intro-character";
        span.textContent = character;

        span.dataset.original = character;
        span.dataset.glyph =
          introGlyphs[glyphIndex % introGlyphs.length];

        glyphIndex++;

        fragment.appendChild(span);
      } else {
        fragment.appendChild(
          document.createTextNode(character)
        );
      }
    });

    textNode.parentNode.replaceChild(fragment, textNode);
  });

  intro.dataset.charactersPrepared = "true";
}

function bindIntroCharacterHover() {
  const characters = document.querySelectorAll(".intro-character");
  const CHARACTER_RESTORE_DELAY = 2000;

  characters.forEach((character) => {
    let restoreTimeout;

    character.addEventListener("mouseenter", () => {
      clearTimeout(restoreTimeout);

      character.textContent = character.dataset.glyph;
      character.classList.add("is-glyph");
    });

    character.addEventListener("mouseleave", () => {
      restoreTimeout = setTimeout(() => {
        character.textContent = character.dataset.original;
        character.classList.remove("is-glyph");
      }, CHARACTER_RESTORE_DELAY);
    });
  });
}

prepareIntroCharacters();
bindIntroCharacterHover();

function previewIntroInteraction() {
  const characters = [...document.querySelectorAll(".intro-character")];

  if (!characters.length) return;

  // how many letters animate
  const PREVIEW_COUNT = 5;

  // copy the array and shuffle it
  const shuffled = [...characters].sort(() => Math.random() - 0.5);

  // grab the first few
  const previewCharacters = shuffled.slice(0, PREVIEW_COUNT);

  setTimeout(() => {
    previewCharacters.forEach((character, index) => {
      setTimeout(() => {
        character.textContent = character.dataset.glyph;
        character.classList.add("is-glyph");

        setTimeout(() => {
          character.textContent = character.dataset.original;
          character.classList.remove("is-glyph");
        }, 1000);
      }, index * 420);
    });
  }, 1500);
}

previewIntroInteraction();

/* ---------------------------------
   PROJECT IMAGE CAROUSELS
---------------------------------- */

function prepareProjectCarousels() {
  const carousels = document.querySelectorAll(".project-carousel");
  const carouselCursor = document.querySelector(".carousel-cursor");

  if (!carouselCursor) return;

  carousels.forEach((carousel) => {
    const image = carousel.querySelector(".carousel-media");
    const previousButton = carousel.querySelector(".carousel-zone-left");
    const nextButton = carousel.querySelector(".carousel-zone-right");

    if (!image || !previousButton || !nextButton) return;

    const images = (carousel.dataset.images || "")
      .split(",")
      .map((path) => path.trim())
      .filter(Boolean);

    if (images.length < 2) {
      previousButton.hidden = true;
      nextButton.hidden = true;
      return;
    }

    let currentIndex = Math.max(
      0,
      images.indexOf(image.getAttribute("src"))
    );

    // Preload every image so swaps happen immediately.
    images.forEach((src) => {
  if (src.toLowerCase().endsWith(".mp4")) {
    const preload = document.createElement("video");
    preload.preload = "metadata";
    preload.src = src;
  } else {
    const preload = new Image();
    preload.src = src;
  }
});

    function showImage(index) {
  currentIndex = (index + images.length) % images.length;

  const src = images[currentIndex];
  const isVideo = src.toLowerCase().endsWith(".mp4");

  let media = carousel.querySelector(".carousel-media");

  if (isVideo) {
    if (!media || media.tagName !== "VIDEO") {
      const video = document.createElement("video");

      video.className = "carousel-image carousel-media";
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;

      if (media) {
        media.replaceWith(video);
      } else {
        image.replaceWith(video);
      }

      media = video;
    }

    media.src = src;
    media.load();
    media.play().catch(() => {});
  } else {
    if (!media || media.tagName !== "IMG") {
      const newImage = document.createElement("img");

      newImage.className = "carousel-image carousel-media";
      newImage.alt = image.alt || "Project preview";

      if (media) {
        media.replaceWith(newImage);
      } else {
        image.replaceWith(newImage);
      }

      media = newImage;
    }

    media.src = src;
  }
}

    function moveCursor(event) {
      carouselCursor.style.left = `${event.clientX}px`;
      carouselCursor.style.top = `${event.clientY}px`;
    }

    function showCursor(direction) {
      carouselCursor.textContent =
        direction === "left" ? "☜" : "☞";

      carouselCursor.classList.add("is-visible");
    }

    function hideCursor() {
      carouselCursor.classList.remove("is-visible");
    }

    previousButton.addEventListener("mouseenter", () => {
      showCursor("left");
    });

    previousButton.addEventListener("mousemove", moveCursor);
    previousButton.addEventListener("mouseleave", hideCursor);

    previousButton.addEventListener("click", () => {
      showImage(currentIndex - 1);
    });

    nextButton.addEventListener("mouseenter", () => {
      showCursor("right");
    });

    nextButton.addEventListener("mousemove", moveCursor);
    nextButton.addEventListener("mouseleave", hideCursor);

    nextButton.addEventListener("click", () => {
      showImage(currentIndex + 1);
    });
  });
}

prepareProjectCarousels();

/* ---------------------------------
   PROJECT DESCRIPTION TOGGLES
---------------------------------- */

function prepareProjectDescriptionToggles() {
  const projectMetas = document.querySelectorAll(".project-meta");

  projectMetas.forEach((meta) => {
    const toggle = meta.querySelector(".project-toggle");
    const description = meta.querySelector(".project-description");

    if (!toggle || !description) return;

    toggle.addEventListener("click", () => {
      const isExpanded =
        toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute(
        "aria-expanded",
        String(!isExpanded)
      );

      toggle.setAttribute(
        "aria-label",
        isExpanded
          ? "Show project description"
          : "Hide project description"
      );

      description.hidden = isExpanded;
    });
  });
}

prepareProjectDescriptionToggles();