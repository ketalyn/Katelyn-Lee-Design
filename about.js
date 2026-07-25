const intro = document.querySelector(".about-copy");

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
        const parent = node.parentElement;

        // Do not scramble the fridge link.
        if (parent?.closest(".fridge-link")) {
          return NodeFilter.FILTER_REJECT;
        }

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
  const characters =
    document.querySelectorAll(".intro-character");

  const RESTORE_DELAY = 2000;

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
      }, RESTORE_DELAY);
    });
  });
}

prepareIntroCharacters();
bindIntroCharacterHover();