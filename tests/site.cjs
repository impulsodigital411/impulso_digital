// Run against a local HTTP server. Development-only: playwright, @axe-core/playwright.
const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium, firefox } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");

const base = process.env.IMPULSO_URL || "http://127.0.0.1:8765/";
const screenshots = process.env.IMPULSO_SCREENSHOTS;
const sizes = [
  [320, 568],
  [360, 640],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
];
const langs = ["es", "en", "de", "fr", "ru", "zh", "ja", "ko"];
const wa = "https://wa.me/5492646313348";
const services = [
  "optCustom",
  "optWeb",
  "optShop",
  "optStock",
  "optBooking",
  "optOrders",
  "optGym",
  "optAutomation",
  "optRedesign",
  "other",
];

async function brandAssets(page) {
  await page.goto(base);
  const result = await page.evaluate(async () => {
    const files = [
      "impulso.png",
      "impulso-digital.png",
      "impulso-footer.png",
      "impulso-digital-footer.png",
      "favicon.png",
      "impulso-isotipo.png",
    ];
    const sizes = await Promise.all(
      files.map(async (file) => {
        const image = new Image();
        image.src = `imagenes/logo/${file}`;
        await image.decode();
        return [file, image.naturalWidth, image.naturalHeight];
      }),
    );
    const current = [
      ".site-header .brand img",
      ".footer .brand img",
      ".logo-core img",
      'link[rel="icon"]',
    ]
      .map((selector) => document.querySelector(selector))
      .map(
        (element) =>
          element.getAttribute("src") || element.getAttribute("href"),
      );
    return { sizes, current };
  });
  assert.deepEqual(result.sizes, [
    ["impulso.png", 2131, 707],
    ["impulso-digital.png", 2131, 707],
    ["impulso-footer.png", 2131, 707],
    ["impulso-digital-footer.png", 2131, 707],
    ["favicon.png", 64, 64],
    ["impulso-isotipo.png", 690, 690],
  ]);
  assert.deepEqual(
    result.current,
    [
      "impulso.png",
      "impulso-footer.png",
      "impulso-isotipo.png",
      "favicon.png",
    ].map((file) => `imagenes/logo/${file}`),
  );
  console.log("  Marca: los seis PNG responden y se decodifican");
}

async function matrix(page) {
  await page.goto(base);
  await page.locator("#contactForm").waitFor({ state: "attached" });
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    for (const lang of langs) {
      await page.locator("#language").selectOption(lang);
      const problems = await page.evaluate(async (code) => {
        const { translations } = await import(
          new URL("translations.js", document.baseURI).href
        );
        const dict = translations[code];
        const failures = [];
        const root = document.documentElement;
        if (root.lang !== (code === "zh" ? "zh-Hans" : code))
          failures.push("lang");
        if (root.scrollWidth > root.clientWidth)
          failures.push(`overflow ${root.scrollWidth}/${root.clientWidth}`);
        for (const [attr, output] of [
          ["data-i", null],
          ["data-i-label", "aria-label"],
          ["data-i-title", "title"],
        ]) {
          for (const el of document.querySelectorAll(`[${attr}]`)) {
            const key = el.getAttribute(attr);
            if (
              !dict[key] ||
              (output ? el.getAttribute(output) : el.textContent) !== dict[key]
            )
              failures.push(key);
          }
        }
        for (const element of document.querySelectorAll(
          "h1, h2, h3, .navwrap, .button, .fields input, .fields select, .fields textarea, .catalog-item, .contact-links a, .footer-inner",
        )) {
          const rect = element.getBoundingClientRect();
          if (
            rect.left < -1 ||
            rect.right > root.clientWidth + 1 ||
            element.scrollWidth > element.clientWidth + 1
          ) {
            failures.push(
              `${element.tagName} ${element.id || element.className}`,
            );
          }
        }
        if (
          document.title !== `Impulso | ${dict.metaTitle}` ||
          document.querySelector('meta[name="description"]').content !==
            dict.heroText
        )
          failures.push("SEO");
        for (const link of document.querySelectorAll('a[href^="#"]')) {
          if (!document.getElementById(link.hash.slice(1)))
            failures.push(link.hash);
        }
        for (const image of document.querySelectorAll(
          "img:not([loading=lazy])",
        )) {
          if (!image.complete || !image.naturalWidth) failures.push(image.src);
        }
        return failures;
      }, lang);
      assert.deepEqual(problems, [], `${width}px/${lang}`);
      if (screenshots && lang === "es") {
        await page.screenshot({
          path: path.join(screenshots, `${width}-es.png`),
          fullPage: width === 390 || width === 1440,
        });
      }
    }
  }
  await page.reload();
  assert.equal(await page.locator("#language").inputValue(), "ko");
  await page.locator("#language").selectOption("es");
  console.log(
    `  Responsive/i18n: ${sizes.length * langs.length} combinaciones`,
  );
}

async function contact(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.whatsappDrafts = [];
    window.open = (url) => {
      window.whatsappDrafts.push(url);
      return null;
    };
  });
  await page.goto("about:blank");
  await page.goto(new URL("#contacto", base).href);
  assert.equal(await page.locator(".whatsapp").getAttribute("href"), wa);
  assert.equal(await page.locator(".portfolio-details").count(), 0);
  assert.deepEqual(
    await page
      .locator("#servicio option:not([value=''])")
      .evaluateAll((options) => options.map((option) => option.value)),
    services,
  );
  const submit = page.locator('#contactForm button[type="submit"]');
  const status = page.locator("#status");
  for (const lang of langs) {
    await page.locator("#language").selectOption(lang);
    const t = await page.evaluate(
      async (code) =>
        (await import(new URL("translations.js", document.baseURI).href))
          .translations[code],
      lang,
    );
    await page.locator("#nombre").fill(" ");
    await page.locator("#mensaje").fill("");
    await submit.click();
    assert.equal(await status.textContent(), t.errName);
    assert.equal(await page.locator(":focus").getAttribute("id"), "nombre");
    await page.locator("#nombre").fill("Prueba & QA");
    await submit.click();
    assert.equal(await status.textContent(), t.errProject);
    assert.equal(await page.locator(":focus").getAttribute("id"), "mensaje");
    await page.locator("#empresa").fill("Negocio QA");
    await page.locator("#servicio").selectOption("optAutomation");
    await page.locator("#mensaje").fill("Mensaje + ✓");
    await page.locator("#email").fill("");
    await page.locator("#telefono").fill("");
    await submit.click();
    assert.equal(await status.textContent(), t.errContact);
    await page.locator("#email").fill("no-es-email");
    await submit.click();
    assert.equal(await status.textContent(), t.errEmail);
    await page.locator("#email").fill("");
    await page.locator("#telefono").fill("1234");
    await submit.click();
    assert.equal(await status.textContent(), t.errPhone);
    await page.locator("#telefono").fill("+54 264 444 5678");
    await submit.click();
    assert.equal(await status.textContent(), t.success);
    const outbound = new URL(
      await page.locator("#chatLink").getAttribute("href"),
    );
    assert.equal(`${outbound.origin}${outbound.pathname}`, wa);
    assert.equal(
      outbound.searchParams.get("text"),
      [
        t.hello,
        `${t.name}: Prueba & QA`,
        `${t.company}: Negocio QA`,
        `${t.phone}: +54 264 444 5678`,
        `${t.interest}: ${t.optAutomation}`,
        `${t.message}: Mensaje + ✓`,
      ].join("\n"),
    );
    assert.equal(
      outbound.href,
      await page.evaluate(() => window.whatsappDrafts.at(-1)),
    );
    assert.equal(await page.locator("#chatLink").textContent(), t.openChat);
  }
  assert.equal(
    await page.evaluate(() => window.whatsappDrafts.length),
    langs.length,
  );

  await page.locator("#language").selectOption("es");
  await page.locator("#mensaje").fill("");
  const expected = ["optStock", "optGym", "optBooking", "optOrders", "optWeb"];
  for (let i = 0; i < expected.length; i++) {
    const item = page.locator(".catalog-item").nth(i);
    await item.click();
    assert.equal(new URL(page.url()).hash, "#contacto");
    assert.equal(await page.locator("#servicio").inputValue(), expected[i]);
    assert.ok(
      (await page.locator("#mensaje").inputValue()).includes(
        await item.locator("h3").textContent(),
      ),
    );
  }
  const spanishDraft = await page.locator("#mensaje").inputValue();
  await page.locator("#language").selectOption("en");
  assert.notEqual(await page.locator("#mensaje").inputValue(), spanishDraft);
  await page.locator("#mensaje").fill("Texto escrito por la persona");
  await page.locator(".catalog-item").first().click();
  assert.equal(
    await page.locator("#mensaje").inputValue(),
    "Texto escrito por la persona",
  );
  await page.locator("#email").fill("qa@example.org");
  await page.locator("#telefono").fill("");
  await page.locator("#empresa").fill("");
  await submit.click();
  const emailDraft = new URL(
    await page.locator("#chatLink").getAttribute("href"),
  ).searchParams.get("text");
  assert.ok(emailDraft.includes("qa@example.org"));
  assert.ok(!emailDraft.includes("Negocio QA"));
  console.log(
    "  Contacto: 8 idiomas, 5 errores por idioma, 10 servicios y consultas desde los 5 rubros",
  );
}

async function navigationAndMotion(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").getAttribute("href"), "#main");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(":focus").getAttribute("id"), "main");
  const menu = page.locator("#menu");
  await menu.click();
  await page.keyboard.press("Escape");
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.equal(await page.locator(":focus").getAttribute("id"), "menu");
  await menu.click();
  await page.locator('#nav a[href="#catalogo"]').click();
  await page.waitForFunction(
    () => document.querySelector("#nav [aria-current]").hash === "#catalogo",
  );
  assert.equal(await page.locator(":focus").getAttribute("id"), "catalogo");
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  await page.goBack();
  assert.equal(new URL(page.url()).hash, "#main");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(base);
  const spin = () =>
    page.locator(".logo-core").evaluate((el) => getComputedStyle(el).transform);
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".logo-core"))
        .animationPlayState === "running",
  );
  const firstAngle = await spin();
  await page.waitForFunction(
    (first) =>
      getComputedStyle(document.querySelector(".logo-core")).transform !==
      first,
    firstAngle,
  );
  for (const effect of [".ribbon-motion", ".r1", ".orbit-far .r2", ".orbit-near .r2", ".r3"]) {
    assert.equal(
      await page
        .locator(effect)
        .evaluate((el) => getComputedStyle(el).animationPlayState),
      "running",
    );
  }
  await page.evaluate(() => scrollTo({ top: 120, behavior: "instant" }));
  await page.waitForFunction(
    () =>
      parseFloat(
        document
          .querySelector(".ribbon-art")
          .style.getPropertyValue("--scroll-drift"),
      ) > 0,
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  const stage = page.locator(".logo-stage");
  const bounds = await stage.boundingBox();
  await page.mouse.move(
    bounds.x + bounds.width * 0.8,
    bounds.y + bounds.height * 0.5,
  );
  await page.waitForFunction(() =>
    document.querySelector(".logo-stage").style.getPropertyValue("--mx"),
  );
  const toggle = page.locator("#motionToggle");
  await toggle.click();
  assert.equal(await toggle.getAttribute("data-paused"), "true");
  assert.equal(await page.locator(".logo-core").evaluate((el) => getComputedStyle(el).animationPlayState), "paused");
  await page.reload();
  await toggle.waitFor();
  assert.equal(await toggle.getAttribute("data-paused"), "false");
  await page.locator(".site-nav a[href='#servicios']").click();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".logo-core"))
        .animationPlayState === "paused",
  );
  await page.locator(".site-nav a[href='#inicio']").click();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".logo-core"))
        .animationPlayState === "running",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await toggle.waitFor({ state: "hidden" });
  assert.equal(
    await page
      .locator(".logo-core")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.evaluate(() =>
    scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await page.waitForFunction(
    () => document.querySelector(".progress").style.transform === "scaleX(1)",
  );
  console.log(
    "  Navegación: teclado, menú, historial, anclas y progreso; rotación, cursor, pausa y movimiento reducido",
  );
}

async function catalogAssets(context) {
  // Fixture only: the production catalogue stays empty of media and demos.
  const page = await context.newPage();
  await page.route("**/catalog.js", async (route) => {
    const response = await route.fetch();
    const source = (await response.text()).replace(
      /c1: \{ service: "optStock"[^}]*\}/,
      `c1: {
      service: "optStock",
      description: { es: "Descripción de prueba", en: "Fixture description" },
      screenshots: [
        { src: "imagenes/logo/impulso-isotipo.png", width: 690, height: 690, alt: { es: "Isotipo", en: "Brand mark" } },
        { src: "qa-unreadable.webp", width: 231, height: 231, alt: { es: "No debe aparecer" } }
      ],
      demo: { href: "#contacto", label: { es: "Demo de prueba", en: "Fixture demo" } }
    }`,
    );
    await route.fulfill({ response, body: source });
  });
  let brokenRequested = false;
  await page.route("**/qa-unreadable.webp", (route) => {
    brokenRequested = true;
    return route.fulfill({ contentType: "image/webp", body: "unreadable" });
  });
  await page.goto(new URL("#catalogo", base).href);
  const details = page.locator(".portfolio-details");
  await page.locator("#language").selectOption("en");
  await page
    .locator('.catalog-item[data-project="c1"]')
    .scrollIntoViewIfNeeded();
  await details.locator("img").waitFor();
  assert.equal(await details.locator("img").getAttribute("alt"), "Brand mark");
  assert.equal(await details.locator("p").textContent(), "Fixture description");
  assert.equal(await details.locator("a").textContent(), "Fixture demo");
  assert.ok(brokenRequested);
  assert.equal(await details.locator("img").count(), 1);
  await page.close();
  console.log(
    "  Catálogo: detalle, demo y alt traducidos; se omite una imagen no válida",
  );
}

async function run(engine, name) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    await context.route(
      /^https:\/\/(wa\.me|(?:[^/]+\.)?whatsapp\.com)\//,
      (route) => route.abort(),
    );
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    console.log(name);
    await brandAssets(page);
    await matrix(page);
    await contact(page);
    await navigationAndMotion(page);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base);
      if (width === 390) await page.locator("#menu").click();
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      assert.deepEqual(
        violations.map(({ id, nodes }) => [
          id,
          nodes.map(({ target }) => target),
        ]),
        [],
        `axe ${width}`,
      );
    }
    assert.deepEqual(errors, [], "Errores de consola/red");
    console.log(
      "  axe: sin infracciones automáticas en 390/1440 px; sin errores de consola/red",
    );
    await catalogAssets(context);

    const plain = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 568 },
    });
    const fallback = await plain.newPage();
    await fallback.goto(base);
    await fallback.locator('#nav a[href="#contacto"]').click();
    assert.equal(new URL(fallback.url()).hash, "#contacto");
    for (const id of [
      "nombre",
      "empresa",
      "email",
      "telefono",
      "servicio",
      "mensaje",
    ]) {
      assert.ok(await fallback.locator(`#${id}`).isVisible(), id);
    }
    assert.equal(
      await fallback.locator("#contactFallback a").getAttribute("href"),
      wa,
    );
    assert.ok(await fallback.locator("#contactFallback a").isVisible());
    assert.ok(
      await fallback.locator('#contactForm button[type="submit"]').isDisabled(),
    );
    await plain.close();

    const degraded = await context.newPage({ reducedMotion: "no-preference" });
    await degraded.route("**/motion.js", (route) => route.abort());
    await degraded.addInitScript(() => {
      window.open = (url) => {
        window.draftUrl = url;
      };
    });
    await degraded.goto(new URL("#contacto", base).href);
    assert.ok(await degraded.locator("#contactForm").isVisible());
    await degraded.locator("#nombre").fill("Andrea Prueba");
    await degraded.locator("#email").fill("qa@example.org");
    await degraded.locator("#mensaje").fill("Consulta de prueba");
    await degraded.locator('#contactForm button[type="submit"]').click();
    const degradedDraft = new URL(
      await degraded.evaluate(() => window.draftUrl),
    );
    assert.equal(degradedDraft.origin + degradedDraft.pathname, wa);
    assert.ok(
      degradedDraft.searchParams.get("text").includes("Consulta de prueba"),
    );
    await degraded.emulateMedia({ reducedMotion: "no-preference" });
    await degraded.goto(base);
    const initial = await degraded.locator(".logo-core").evaluate((el) => getComputedStyle(el).transform);
    await degraded.waitForFunction((value) => getComputedStyle(document.querySelector(".logo-core")).transform !== value, initial);
    await degraded.close();
    console.log(
      "  Formulario visible sin JS y operativo con el módulo de animación bloqueado",
    );
  } finally {
    await browser.close();
  }
}

(async () => {
  if (process.env.IMPULSO_BROWSER !== "firefox")
    await run(chromium, "Chromium");
  if (process.env.IMPULSO_BROWSER !== "chromium") await run(firefox, "Firefox");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
