import { translations } from "./translations.js";
import { initContact } from "./contact.js";
import { initCatalog } from "./catalog.js";

const root = document.documentElement;
const selector = document.getElementById("language");
const storageKey = "impulso.lang";
let lang = "es";
const tr = (key) => translations[lang][key] ?? translations.es[key];
const title = document.querySelector('meta[property="og:title"]');
const descriptions = document.querySelectorAll(
  'meta[name="description"], meta[property="og:description"]',
);
const locale = document.querySelector('meta[property="og:locale"]');
const locales = {
  es: "es_AR",
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
  ru: "ru_RU",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
};

const contact = initContact(tr);
const updateCatalog = initCatalog(contact.prefill);
let motion;

function setLanguage(value) {
  lang = Object.hasOwn(translations, value) ? value : "es";
  root.lang = lang === "zh" ? "zh-Hans" : lang;
  selector.value = lang;
  for (const element of document.querySelectorAll("[data-i]")) {
    element.textContent = tr(element.dataset.i);
  }
  for (const element of document.querySelectorAll("[data-i-label]")) {
    element.setAttribute("aria-label", tr(element.dataset.iLabel));
  }
  for (const element of document.querySelectorAll("[data-i-title]")) {
    element.title = tr(element.dataset.iTitle);
  }
  document.title = `Impulso | ${tr("metaTitle")}`;
  title.content = document.title;
  for (const description of descriptions) description.content = tr("heroText");
  locale.content = locales[lang];
  contact.translate();
  updateCatalog(lang);
  motion?.translate();
}

let saved;
try {
  saved = localStorage.getItem(storageKey);
} catch {
  /* Storage is optional. */
}
setLanguage(saved);
selector.addEventListener("change", () => {
  setLanguage(selector.value);
  try {
    localStorage.setItem(storageKey, lang);
  } catch {
    /* This visit still uses the chosen language. */
  }
});

const header = document.querySelector(".site-header");
const nav = document.getElementById("nav");
const menu = document.getElementById("menu");
const mobileNav = matchMedia("(max-width: 970px)");

function setMenu(open) {
  nav.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
}

header.classList.add("nav-ready");
menu.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  if (mobileNav.matches)
    document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
  setMenu(false);
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    setMenu(false);
    menu.focus();
  }
});
mobileNav.addEventListener("change", () => {
  if (mobileNav.matches && nav.contains(document.activeElement)) menu.focus();
  setMenu(false);
});

const sections = [...document.querySelectorAll("main .section")];
const navLinks = new Map(
  [...nav.querySelectorAll("a")].map((link) => [link.hash.slice(1), link]),
);
const progress = document.querySelector(".progress");
let current;
let frame = 0;

function updateScroll() {
  frame = 0;
  const max = root.scrollHeight - root.clientHeight;
  const position = scrollY;
  const activationLine = header.offsetHeight + 30;
  let section = sections[0];
  for (const item of sections) {
    if (item.getBoundingClientRect().top <= activationLine) section = item;
  }
  const atEnd = max > 0 && position >= max - 1;
  if (atEnd) section = sections.at(-1);
  if (section.id !== current) {
    navLinks.get(current)?.removeAttribute("aria-current");
    navLinks.get(section.id).setAttribute("aria-current", "location");
    current = section.id;
  }
  progress.style.transform = `scaleX(${atEnd ? 1 : max > 0 ? Math.max(0, position / max) : 0})`;
  motion?.onScroll(position);
}

function scheduleScroll() {
  if (!frame) frame = requestAnimationFrame(updateScroll);
}

addEventListener("scroll", scheduleScroll, { passive: true });
addEventListener("resize", scheduleScroll);
addEventListener("pageshow", scheduleScroll);
if ("ResizeObserver" in window) {
  const sizes = new ResizeObserver(scheduleScroll);
  sizes.observe(document.body);
  sizes.observe(header);
}
updateScroll();

// Movement is progressive enhancement; a missing module must not block contact.
import("./motion.js")
  .then(({ initMotion }) => {
    motion = initMotion(tr);
    motion.onScroll(scrollY);
  })
  .catch(() => {
    /* The page remains usable with the static artwork. */
  });
