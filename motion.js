export function initMotion(tr) {
  const root = document.documentElement;
  const hero = document.querySelector(".hero");
  const visual = hero.querySelector(".hero-visual");
  const stage = hero.querySelector(".logo-stage");
  const controls = hero.querySelector(".hero-controls");
  const toggle = document.getElementById("motionToggle");
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia(
    "(hover: hover) and (pointer: fine) and (min-width: 681px)",
  );
  const ribbon = hero.querySelector(".ribbon-art");
  let paused = false;

  function translate() {
    const label = tr(paused ? "play" : "pause");
    toggle.title = label;
    toggle.setAttribute("aria-label", label);
  }

  function refresh() {
    root.classList.toggle("motion-off", paused);
    root.classList.toggle("tab-hidden", document.hidden);
    toggle.dataset.paused = String(paused);
    toggle.hidden = preference.matches;
    if (paused || preference.matches || document.hidden) resetPointer();
    onScroll(scrollY);
    translate();
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    refresh();
  });
  preference.addEventListener("change", refresh);
  document.addEventListener("visibilitychange", refresh);

  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting) {
            if (target.classList.contains("arrive")) {
              target.classList.remove("arrive");
              reveal.unobserve(target);
            }
            continue;
          }
          if (
            !preference.matches &&
            !paused &&
            !document.hidden &&
            !target.contains(document.activeElement)
          ) {
            target.classList.add("arrive");
          } else {
            reveal.unobserve(target);
          }
        }
      },
      { threshold: 0.08 },
    );
    for (const element of document.querySelectorAll(".reveal"))
      reveal.observe(element);

    new IntersectionObserver(
      ([entry]) => {
        hero.classList.toggle("ribbons-offscreen", !entry.isIntersecting);
        onScroll(scrollY);
      },
      { threshold: 0.01 },
    ).observe(hero);
    new IntersectionObserver(
      ([entry]) => {
        hero.classList.toggle("orbits-offscreen", !entry.isIntersecting);
        if (!entry.isIntersecting) resetPointer();
      },
      { threshold: 0.05 },
    ).observe(visual);
    new IntersectionObserver(
      ([entry]) => {
        hero.classList.toggle("cue-offscreen", !entry.isIntersecting);
      },
      { threshold: 0.15 },
    ).observe(controls);
  }

  let point;
  let pointerFrame = 0;
  function resetPointer() {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    for (const property of ["--mx", "--my", "--tilt-x", "--tilt-y"])
      stage.style.removeProperty(property);
    visual.style.removeProperty("--halo-x");
    visual.style.removeProperty("--halo-y");
  }
  visual.addEventListener(
    "pointermove",
    (event) => {
      if (
        event.pointerType === "touch" ||
        !desktop.matches ||
        preference.matches ||
        paused ||
        document.hidden
      )
        return;
      point = { x: event.clientX, y: event.clientY };
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        const rect = visual.getBoundingClientRect();
        const x = (point.x - rect.left) / rect.width - 0.5;
        const y = (point.y - rect.top) / rect.height - 0.5;
        stage.style.setProperty("--mx", `${x * 34}px`);
        stage.style.setProperty("--my", `${y * 25}px`);
        stage.style.setProperty("--tilt-x", `${y * -14}deg`);
        stage.style.setProperty("--tilt-y", `${x * 17}deg`);
        visual.style.setProperty("--halo-x", `${x * 74}px`);
        visual.style.setProperty("--halo-y", `${y * 60}px`);
        pointerFrame = 0;
      });
    },
    { passive: true },
  );
  visual.addEventListener("pointerleave", resetPointer);
  visual.addEventListener("pointercancel", resetPointer);
  function onScroll(position) {
    if (
      desktop.matches &&
      !preference.matches &&
      !paused &&
      !document.hidden &&
      !hero.classList.contains("ribbons-offscreen")
    ) {
      ribbon.style.setProperty(
        "--scroll-drift",
        `${Math.min(52, Math.max(0, position * 0.095))}px`,
      );
    } else if (ribbon.style.getPropertyValue("--scroll-drift")) {
      ribbon.style.removeProperty("--scroll-drift");
    }
  }
  desktop.addEventListener("change", () => {
    resetPointer();
    onScroll(scrollY);
  });
  refresh();
  return { translate, onScroll };
}
