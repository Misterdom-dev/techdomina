#!/usr/bin/env node
// Gera a partir de data/tools.json:
//   - tools/<slug>.html      → página de review por ferramenta (+ JSON-LD + relacionadas)
//   - category/<slug>.html   → página de categoria ("Best AI X tools for small business")
//   - sitemap.xml, robots.txt
// Rode na raiz do projeto:  node scripts/generate.js
// O site continua 100% estático ao ser servido — isto é só um helper de build.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://techdomina.com";
const OG_IMAGE = `${SITE}/assets/img/og-image.png`;
const YEAR = new Date().getFullYear();

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));

// Slug idêntico ao de assets/js/main.js.
function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function officialUrl(url) {
  return String(url).split("?")[0]; // tira ?ref=... para o schema/sameAs
}

// Categorias na ordem do site, com texto de introdução próprio (honesto, sem inventar).
const CATEGORIES = [
  { name: "Marketing & Content", blurb: "From writing and design to video and SEO, these AI tools help small businesses create more marketing content in less time — without an agency budget." },
  { name: "Customer Support", blurb: "Answer customers faster and around the clock. These AI support tools handle FAQs, live chat, and tickets so a small team can keep up." },
  { name: "Sales & CRM", blurb: "Find leads, manage your pipeline, and close more deals. These AI-powered sales and CRM tools are built for small teams that need to punch above their weight." },
  { name: "Finance & Admin", blurb: "Spend less time on bookkeeping, invoices, and expenses. These AI finance and admin tools automate the back office so you can focus on the business." },
  { name: "Automation & AI Agents", blurb: "Connect your apps and put repetitive work on autopilot. These automation platforms and AI agents handle the busywork for you." }
];

const BEST_FOR = {
  "Marketing & Content": "small businesses that want to create marketing content, graphics, or video faster — without hiring an agency.",
  "Customer Support": "small teams that need to answer customers quickly and around the clock without adding headcount.",
  "Sales & CRM": "owners and small sales teams who want to find leads, manage deals, and close more business.",
  "Finance & Admin": "businesses that want to automate bookkeeping, invoicing, and expenses so they can focus on the work.",
  "Automation & AI Agents": "anyone who wants to automate repetitive tasks and connect the tools they already use."
};
const PRICING = {
  "Free": "is free to use. Check the official site for any optional paid add-ons.",
  "Freemium": "offers a free plan to get started, with paid upgrades as your needs grow. See the official site for current plans.",
  "Paid": "is a paid tool. Pricing changes often, so check the official site for the latest plans and any free trial."
};

// --- Blocos reaproveitados (caminhos root-relative: funcionam em qualquer profundidade) ---
function head(opts) {
  const jsonld = opts.jsonld
    ? `\n  <script type="application/ld+json">\n${JSON.stringify(opts.jsonld, null, 2)}\n  </script>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${esc(opts.title)}</title>
  <meta name="description" content="${esc(opts.desc)}" />${opts.noindex ? `\n  <meta name="robots" content="noindex" />` : ""}${opts.canonical ? `\n  <link rel="canonical" href="${opts.canonical}" />` : ""}

  <meta property="og:type" content="${opts.ogType || "website"}" />
  <meta property="og:url" content="${opts.canonical || SITE + "/"}" />
  <meta property="og:title" content="${esc(opts.ogTitle || opts.title)}" />
  <meta property="og:description" content="${esc(opts.ogDesc || opts.desc)}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/assets/css/styles.css" />${jsonld}
</head>`;
}

function header() {
  return `
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="/"><span class="logo-mark">td</span> techdomina</a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="menu">
        <span></span><span></span><span></span>
      </button>
      <nav id="menu" class="site-nav" aria-label="Main navigation">
        <a href="/#catalog">Browse tools</a>
        <a href="/#featured">Featured</a>
        <a href="/#list-your-tool">List your tool</a>
      </nav>
    </div>
  </header>`;
}

function footerCats() {
  return `<nav class="footer-cats" aria-label="Categories">` +
    CATEGORIES.map((c) => `<a href="/category/${slugify(c.name)}.html">${esc(c.name)}</a>`).join("") +
    `</nav>`;
}

function footer() {
  return `
  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-brand"><span class="logo-mark">td</span> techdomina</p>
      ${footerCats()}
      <p class="footer-note">Some links are affiliate links — if you buy through them we may earn a commission at no extra cost to you. It never affects which tools we recommend.</p>
      <p class="footer-copy">&copy; ${YEAR} techdomina. All rights reserved.</p>
    </div>
  </footer>

  <script src="/assets/js/main.js"></script>

  <!-- Cloudflare Web Analytics -->
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "00d045d8a894490b97b006eb4d9674fd"}'></script>
  <!-- End Cloudflare Web Analytics -->
</body>
</html>
`;
}

function toolCard(tool) {
  const slug = slugify(tool.name);
  return `
        <a class="tool-card" href="/tools/${slug}.html" aria-label="Read our ${esc(tool.name)} review">
          <div class="tool-top">
            <span class="tool-logo" style="background:${esc(tool.color)}">${esc(tool.initial)}</span>
            <div>
              <div class="tool-title">${esc(tool.name)}</div>
              <div class="tool-cat">${esc(tool.category)}</div>
            </div>
          </div>
          <p class="tool-desc">${esc(tool.description)}</p>
          <div class="tool-meta">
            <span class="price-badge price-${esc(tool.price)}">${esc(tool.price)}</span>
            <span class="tool-visit">View &rarr;</span>
          </div>
        </a>`;
}

function visitBtn(tool) {
  return `<a class="btn btn-primary btn-lg" href="${esc(tool.url)}" target="_blank" rel="sponsored noopener">Visit ${esc(tool.name)} &rarr;</a>`;
}

// --- Página de review ---
function reviewPage(tool) {
  const slug = slugify(tool.name);
  const catSlug = slugify(tool.category);
  const canonical = `${SITE}/tools/${slug}.html`;
  const title = `${tool.name} Review — ${tool.category} AI Tool | techdomina`;
  const desc = `${tool.description} See what ${tool.name} does, who it's best for, and how pricing works.`;
  const related = tools.filter((t) => t.category === tool.category && t.name !== tool.name).slice(0, 4);

  const offers = (tool.price === "Free" || tool.price === "Freemium")
    ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } } : {};

  const jsonld = [
    Object.assign({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: tool.description,
      url: officialUrl(tool.url)
    }, offers),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: tool.category, item: `${SITE}/category/${catSlug}.html` },
        { "@type": "ListItem", position: 3, name: `${tool.name} review`, item: canonical }
      ]
    }
  ];

  return `${head({ title, desc, canonical, ogType: "article", ogTitle: `${tool.name} Review | techdomina`, ogDesc: tool.description, jsonld })}
<body>
  <a class="skip-link" href="#review">Skip to content</a>
${header()}
  <main id="review">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a><span>/</span><a href="/category/${catSlug}.html">${esc(tool.category)}</a><span>/</span>${esc(tool.name)}
      </nav>

      <article class="review">
        <div class="review-head">
          <span class="tool-logo" style="background:${esc(tool.color)}">${esc(tool.initial)}</span>
          <div>
            <h1>${esc(tool.name)} review</h1>
            <div class="review-meta">
              <span>${esc(tool.category)}</span>
              <span class="price-badge price-${esc(tool.price)}">${esc(tool.price)}</span>
            </div>
          </div>
        </div>

        <p class="review-lead">${esc(tool.description)}</p>
        ${visitBtn(tool)}

        <section>
          <h2>What is ${esc(tool.name)}?</h2>
          <p>${esc(tool.name)} is an AI tool in the ${esc(tool.category.toLowerCase())} space. ${esc(tool.description)} For small business owners, the appeal is simple: get more done with less time and a smaller team.</p>
        </section>

        <section>
          <h2>Who it's best for</h2>
          <p>${esc(tool.name)} is a good fit for ${esc(BEST_FOR[tool.category] || "small business owners.")}</p>
        </section>

        <section>
          <h2>Pricing</h2>
          <p>${esc(tool.name)} ${esc(PRICING[tool.price] || "has flexible pricing — see the official site.")}</p>
        </section>

        <div class="review-cta">
          ${visitBtn(tool)}
          <a class="btn btn-ghost" href="/category/${catSlug}.html">More ${esc(tool.category)} tools</a>
        </div>

        <p class="review-note">Disclosure: the link above may be an affiliate link. If you sign up through it we may earn a commission at no extra cost to you — it never affects which tools we recommend.</p>

        ${related.length ? `<section class="related">
          <h2>More ${esc(tool.category)} tools</h2>
          <div class="grid grid-tools">${related.map(toolCard).join("")}
          </div>
        </section>` : ""}
      </article>
    </div>
  </main>
${footer()}`;
}

// --- Página de categoria ---
function categoryPage(cat) {
  const slug = slugify(cat.name);
  const canonical = `${SITE}/category/${slug}.html`;
  const list = tools.filter((t) => t.category === cat.name);
  const title = `Best AI ${cat.name} Tools for Small Business (${YEAR}) | techdomina`;
  const desc = `${cat.blurb} ${list.length} hand-picked tools, compared.`;

  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: cat.name, item: canonical }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best AI ${cat.name} tools for small business`,
      itemListElement: list.map((t, i) => ({
        "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE}/tools/${slugify(t.name)}.html`
      }))
    }
  ];

  return `${head({ title, desc, canonical, jsonld })}
<body>
  <a class="skip-link" href="#cat">Skip to content</a>
${header()}
  <main id="cat">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a><span>/</span>${esc(cat.name)}
      </nav>

      <div class="cat-hero">
        <h1>Best AI ${esc(cat.name)} tools for small business</h1>
        <p class="cat-intro">${esc(cat.blurb)}</p>
      </div>

      <div class="grid grid-tools">${list.map(toolCard).join("")}
      </div>

      <div class="review-cta">
        <a class="btn btn-ghost" href="/#catalog">&larr; Browse all tools</a>
      </div>
    </div>
  </main>
${footer()}`;
}

// --- Página 404 (GitHub Pages serve /404.html automaticamente) ---
function notFoundPage() {
  return `${head({ title: "Page not found (404) | techdomina", desc: "The page you were looking for doesn't exist.", noindex: true })}
<body>
  <a class="skip-link" href="#nf">Skip to content</a>
${header()}
  <main id="nf">
    <div class="container notfound">
      <p class="nf-code">404</p>
      <h1>This page took a coffee break</h1>
      <p class="nf-text">The page you were looking for doesn't exist or may have moved. Let's get you back to the good stuff.</p>
      <div class="nf-actions">
        <a class="btn btn-primary btn-lg" href="/#catalog">Browse all tools</a>
        <a class="btn btn-ghost" href="/">Go to homepage</a>
      </div>
    </div>
  </main>
${footer()}`;
}

// --- Geração ---
const toolsDir = path.join(ROOT, "tools");
const catDir = path.join(ROOT, "category");
fs.mkdirSync(toolsDir, { recursive: true });
fs.mkdirSync(catDir, { recursive: true });

const urls = [`${SITE}/`];
CATEGORIES.forEach((cat) => {
  const slug = slugify(cat.name);
  fs.writeFileSync(path.join(catDir, `${slug}.html`), categoryPage(cat));
  urls.push(`${SITE}/category/${slug}.html`);
});
tools.forEach((tool) => {
  const slug = slugify(tool.name);
  fs.writeFileSync(path.join(toolsDir, `${slug}.html`), reviewPage(tool));
  urls.push(`${SITE}/tools/${slug}.html`);
});

// 404 (não entra no sitemap)
fs.writeFileSync(path.join(ROOT, "404.html"), notFoundPage());

const today = new Date().toISOString().slice(0, 10);
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Generated ${CATEGORIES.length} category pages + ${tools.length} review pages + sitemap (${urls.length} URLs) + robots.txt`);
