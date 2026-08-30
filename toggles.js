function prepareProjectDescriptionToggles() {
  const toggles = document.querySelectorAll(".project-toggle");

  toggles.forEach((toggle) => {
    const meta = toggle.closest(".project-meta, .related-project-meta");
    if (!meta) return;

    const description = meta.querySelector(
      ".project-description, .related-project-description"
    );

    if (!description) return;

    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!isExpanded));
      toggle.setAttribute(
        "aria-label",
        isExpanded ? "Show project description" : "Hide project description"
      );

      description.hidden = isExpanded;
    });
  });
}

prepareProjectDescriptionToggles();