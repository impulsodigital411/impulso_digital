// Populate only with approved project material. Optional keys: description
// ({es, en, …}), screenshots ([{src, width, height, alt: {es, en, …}}]),
// and demo ({href, label: {es, en, …}}). See LEEME_ACTUALIZACION.md.
const solutions = {
  c1: { service: "optStock" },
  c2: { service: "optGym" },
  c3: { service: "optBooking" },
  c4: { service: "optOrders" },
  c5: { service: "optWeb" },
};

export function initCatalog(prefill) {
  const localized = [];
  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            for (const { isIntersecting, target } of entries) {
              if (!isIntersecting) continue;
              observer.unobserve(target);
              target.dispatchEvent(new Event("load-portfolio"));
            }
          },
          { rootMargin: "220px 0px" },
        )
      : null;

  for (const link of document.querySelectorAll(".catalog-item[data-project]")) {
    const project = link.dataset.project;
    const { service, description, screenshots = [], demo } = solutions[project];
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;
      prefill(project, service);
    });
    if (!description && !screenshots.length && !demo) continue;

    const details = document.createElement("div");
    details.className = "portfolio-details";
    details.hidden = true;
    link.after(details);

    if (description) {
      const copy = document.createElement("p");
      localized.push([copy, "textContent", description]);
      details.append(copy);
      details.hidden = false;
    }
    if (demo) {
      const anchor = document.createElement("a");
      anchor.href = demo.href;
      anchor.className = "textlink";
      localized.push([anchor, "textContent", demo.label]);
      details.append(anchor);
      details.hidden = false;
    }
    function loadScreens() {
      for (const { src, width, height, alt } of screenshots) {
        const image = new Image(width, height);
        image.decoding = "async";
        image.className = "portfolio-image";
        const entry = [image, "alt", alt];
        localized.push(entry);
        translateEntry(entry);
        image.addEventListener(
          "load",
          () => {
            details.append(image);
            details.hidden = false;
          },
          { once: true },
        );
        image.src = src;
      }
    }
    if (screenshots.length && observer) {
      link.addEventListener("load-portfolio", loadScreens, { once: true });
      observer.observe(link);
    } else if (screenshots.length) {
      queueMicrotask(loadScreens);
    }
  }

  let lang = "es";
  function translateEntry([element, property, texts]) {
    const entry = texts[lang] ? lang : "es";
    element[property] = texts[entry];
    element.lang = entry === "zh" ? "zh-Hans" : entry;
  }
  return (language) => {
    lang = language;
    localized.forEach(translateEntry);
  };
}
