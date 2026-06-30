#!/usr/bin/env node
// Gera as páginas de review (tools/<slug>.html), o sitemap.xml e o robots.txt
// a partir de data/tools.json. Rode na raiz do projeto:  node scripts/generate.js
// É um helper de build — o site continua 100% estático ao ser servido.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://techdomina.com";
const OG_IMAGE = `${SITE}/assets/img/og-image.png`;

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));

// Slug idêntico ao de assets/js/main.js (os links dos cards dependem disso).
function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// "Para quem serve" derivado da categoria — honesto, sem inventar features.
const BEST_FOR = {
  "Marketing & Content": "small businesses that want to create marketing content, graphics, or video faster — without hiring an agency.",
  "Customer Support": "small teams that need to answer customers quickly and around the clock without adding headcount.",
  "Sales & CRM": "owners and small sales teams who want to find leads, manage deals, and close more business.",
  "Finance & Admin": "businesses that want to automate bookkeeping, invoicing, and expenses so they can focus on the work.",
  "Automation & AI Agents": "anyone who wants to automate repetitive tasks and connect the tools they already use."
};

// Texto de preço por faixa — sem inventar valores (que mudam toda hora).
const PRICING = {
  "Free": "is free to use. Check the official site for any optional paid add-ons.",
  "Freemium": "offers a free plan to get started, with paid upgrades as your needs grow. See the official site for current plans.",
  "Paid": "is a paid tool. Pricing changes often, so check the official site for the latest plans and any free trial."
};

function visitBtn(tool) {
  return `<a class="btn btn-primary btn-lg" href="${esc(tool.url)}" target="_blank" rel="sponsored noopener">Visit ${esc(tool.name)} &rarr;</a>`;
}

function pageHTML(tool) {
  const slug = slugify(tool.name);
  const title = `${tool.name} Review — ${tool.category} AI Tool | techdomina`;
  const desc = `${tool.description} See what ${tool.name} does, who it's best for, and how pricing works.`;
  const bestFor = BEST_FOR[tool.category] || "small business owners.";
  const pricing = PRICING[tool.price] || "has flexible pricing — see the official site.";
  const canonical = `${SITE}/tools/${slug}.html`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${esc(tool.name)} Review | techdomina" />
  <meta property="og:description" content="${esc(tool.description)}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="../favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="../assets/css/styles.css" />
</head>
<body>
  <a class="skip-link" href="#review">Skip to content</a>

  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="../"><span class="logo-mark">td</span> techdomina</a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="menu">
        <span></span><span></span><span></span>
      </button>
      <nav id="menu" class="site-nav" aria-label="Main navigation">
        <a href="../#catalog">Browse tools</a>
        <a href="../#featured">Featured</a>
        <a href="../#list-your-tool">List your tool</a>
      </nav>
    </div>
  </header>

  <main id="review">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../">Home</a><span>/</span><a href="../#catalog">${esc(tool.category)}</a><span>/</span>${esc(tool.name)}
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
          <p>${esc(tool.name)} is a good fit for ${esc(bestFor)}</p>
        </section>

        <section>
          <h2>Pricing</h2>
          <p>${esc(tool.name)} ${esc(pricing)}</p>
        </section>

        <div class="review-cta">
          ${visitBtn(tool)}
          <a class="btn btn-ghost" href="../#catalog">&larr; Back to all tools</a>
        </div>

        <p class="review-note">Disclosure: the link above may be an affiliate link. If you sign up through it we may earn a commission at no extra cost to you — it never affects which tools we recommend.</p>
      </article>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-brand"><span class="logo-mark">td</span> techdomina</p>
      <p class="footer-copy">&copy; ${new Date().getFullYear()} techdomina. All rights reserved.</p>
    </div>
  </footer>

  <script src="../assets/js/main.js"></script>
</body>
</html>
`;
}

// --- Gera as páginas ---
const outDir = path.join(ROOT, "tools");
fs.mkdirSync(outDir, { recursive: true });
const urls = [`${SITE}/`];
tools.forEach((tool) => {
  const slug = slugify(tool.name);
  fs.writeFileSync(path.join(outDir, `${slug}.html`), pageHTML(tool));
  urls.push(`${SITE}/tools/${slug}.html`);
});

// --- sitemap.xml ---
const today = new Date().toISOString().slice(0, 10);
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);

// --- robots.txt ---
fs.writeFileSync(
  path.join(ROOT, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
);

console.log(`Generated ${tools.length} review pages + sitemap.xml (${urls.length} URLs) + robots.txt`);
