// Verifies the Jekyll build in _site/ against the URL contract of the site.
// Run after a build:  engine/scripts/jekyll.sh build && node engine/scripts/check-site.mjs
// Node 22, built-ins only. Prints one ✓/✗ line per check and exits 1 on any failure.
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const siteDir = path.join(root, '_site');
const sizeLimit = 2 * 1024 * 1024;
const screenshotLimit = 200 * 1024;
const appPageIds = ['features', 'screenshots', 'support', 'download'];
// An app that is no longer on the App Store (discontinued: true) has no support or download section.
const pastAppPageIds = ['features', 'screenshots', 'retired'];

// Keep in sync with the :root tokens in assets/css/site.css (--accent-ink-mix,
// --accent-ink-base, --tint-strength, --bg, in light and in dark mode).
const MODES = {
  light: { inkMix: 0.45, inkBase: '#000000', tintStrength: 0.07, bg: '#f8f7fb' },
  dark: { inkMix: 0.8, inkBase: '#ffffff', tintStrength: 0.13, bg: '#13121a' },
};
// Keep in sync with --on-accent in assets/css/site.css.
const ON_ACCENT = '#000000';
const MIN_CONTRAST = 4.5;

// Every language has its pages under /<code>/; the paths without a language are redirects to them.
const LANGUAGES = ['en', 'de'];
const PAGES = ['', 'easy-dice/', 'tear-tales/', 'app-analytics/', 'family-tree/', 'privacy-policy/', 'impressum/'];
const APP_STORE_IDS = { 'easy-dice': '1514806286', 'tear-tales': '6499500073', 'family-tree': '6814184164' };
const NO_BANNER = ['', 'app-analytics/'];

const expectedFiles = [
  ...LANGUAGES.flatMap((lang) => PAGES.map((page) => `${lang}/${page}index.html`)),
  ...PAGES.map((page) => `${page}index.html`),
  '404.html',
  'sitemap.xml',
  'robots.txt',
  'assets/css/site.css',
  'assets/js/site.js',
];
const absentPaths = ['privacypolicy', 'main.css', 'assets/portrait.jpg', '_originals', 'docs', 'scripts', 'engine', 'data'];

let failures = 0;
const pass = (message) => console.log(`✓ ${message}`);
const fail = (message) => {
  failures += 1;
  console.log(`✗ ${message}`);
};
const check = (ok, message, problem = '') => (ok ? pass(message) : fail(`${message}   ${problem}`.trimEnd()));

if (!existsSync(siteDir)) {
  console.log('✗ _site/ does not exist; run engine/scripts/jekyll.sh build first');
  process.exit(1);
}

// baseurl from _config.yml, e.g. "/apps" or "" for a root domain.
const config = await readFile(path.join(root, '_config.yml'), 'utf8');
const baseurl = (config.match(/^baseurl:\s*["']?([^"'\s#]*)["']?/m)?.[1] ?? '').replace(/\/$/, '');

const entries = await readdir(siteDir, { recursive: true, withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile())
  .map((entry) => path.relative(siteDir, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'));
const fileSet = new Set(files);
const read = (file) => readFile(path.join(siteDir, file), 'utf8');

// Expected and absent files
for (const file of expectedFiles) check(fileSet.has(file), `_site/${file}`, 'missing');
for (const entry of absentPaths) {
  const label = entry.includes('.') ? entry : `${entry}/`;
  check(!existsSync(path.join(siteDir, entry)), `_site/${label} is gone`, 'still published');
}

const htmlFiles = files.filter((file) => file.endsWith('.html'));
const html = new Map(await Promise.all(htmlFiles.map(async (file) => [file, await read(file)])));
const langOf = (file) => LANGUAGES.find((lang) => file.startsWith(`${lang}/`));
const isRedirect = (file) => (html.get(file) ?? '').includes('location.replace(');
const css = fileSet.has('assets/css/site.css') ? await read('assets/css/site.css') : '';

// Internal links: href, src and srcset
const isExternal = (target) => /^(https?:|mailto:|tel:)/i.test(target);
const pageFor = (pathname) => {
  const relative = pathname.replace(/^\//, '');
  return relative === '' || relative.endsWith('/') ? `${relative}index.html` : relative;
};
const hasId = (content, id) => content.includes(`id="${id}"`);

let links = 0;
const linkProblems = [];
for (const [file, content] of html) {
  const targets = [];
  for (const [, attribute, value] of content.matchAll(/\s(href|src|srcset)="([^"]*)"/g)) {
    if (attribute === 'srcset') {
      for (const candidate of value.split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        if (url) targets.push(url);
      }
    } else {
      targets.push(value);
    }
  }
  for (const target of targets) {
    if (isExternal(target)) continue;
    links += 1;
    const [withoutQuery] = target.split('?');
    const hashIndex = withoutQuery.indexOf('#');
    const pathname = hashIndex >= 0 ? withoutQuery.slice(0, hashIndex) : withoutQuery;
    const fragment = hashIndex >= 0 ? withoutQuery.slice(hashIndex + 1) : '';
    let page = file;
    if (pathname) {
      if (!pathname.startsWith(`${baseurl}/`)) {
        linkProblems.push(`${file}: "${target}" does not start with "${baseurl}/"`);
        continue;
      }
      page = pageFor(pathname.slice(baseurl.length));
      if (!fileSet.has(page)) {
        const isPage = !path.extname(page) && fileSet.has(`${page}/index.html`);
        linkProblems.push(isPage ? `${file}: "${target}" must end with "/"` : `${file}: "${target}" does not resolve`);
        continue;
      }
    }
    if (fragment && !hasId(html.get(page) ?? '', fragment)) {
      linkProblems.push(`${file}: "${target}" points at a missing id`);
    }
  }
}
linkProblems.forEach((problem) => fail(`internal link   ${problem}`));
if (linkProblems.length === 0) pass(`${links} internal links resolve under ${baseurl || '/'}`);

// No third parties: nothing loaded from another origin. Data URIs (such as an SVG mask that
// contains "http://www.w3.org/2000/svg") start with "data:" and are not flagged.
const isRemote = (value) => /^(https?:|\/\/)/i.test(value.trim());
const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1];
const thirdParty = [];
for (const [file, content] of html) {
  for (const [tag, name] of content.matchAll(/<(script|link|img|source)\b[^>]*>/gi)) {
    const element = name.toLowerCase();
    let values = [];
    if (element === 'script' || element === 'img') values = [attribute(tag, 'src'), ...(attribute(tag, 'srcset') ?? '').split(',')];
    if (element === 'source') values = (attribute(tag, 'srcset') ?? '').split(',');
    if (element === 'link') {
      const rel = (attribute(tag, 'rel') ?? '').toLowerCase();
      if (/\b(stylesheet|icon|preload|apple-touch-icon|modulepreload)\b/.test(rel)) values = [attribute(tag, 'href')];
    }
    for (const value of values) {
      const url = value?.trim().split(/\s+/)[0];
      if (url && isRemote(url)) thirdParty.push(`${file}: <${element}> ${url}`);
    }
  }
  for (const [, url] of content.matchAll(/url\(\s*['"]?([^'")\s]+)/gi)) {
    if (isRemote(url)) thirdParty.push(`${file}: url(${url})`);
  }
}
for (const [, url] of css.matchAll(/url\(\s*['"]?([^'")\s]+)/gi)) {
  if (isRemote(url)) thirdParty.push(`assets/css/site.css: url(${url})`);
}
for (const [, url] of css.matchAll(/@import\s+(?:url\()?\s*['"]?([^'")\s;]+)/gi)) {
  if (isRemote(url)) thirdParty.push(`assets/css/site.css: @import ${url}`);
}
thirdParty.forEach((problem) => fail(`third party   ${problem}`));
check(thirdParty.length === 0, `${thirdParty.length} third-party scripts, stylesheets, fonts or images`);

// Legal links in the page's language on every page but the 404 page and the redirects
const languagePages = [...html.keys()].filter((file) => langOf(file));
const missingLegal = languagePages.filter((file) => {
  const lang = langOf(file);
  return ![`${baseurl}/${lang}/impressum/`, `${baseurl}/${lang}/privacy-policy/`].every((target) =>
    html.get(file).includes(`href="${target}"`),
  );
});
check(
  missingLegal.length === 0,
  `${languagePages.length} pages link to the Impressum and the privacy policy in their language`,
  `missing in ${missingLegal.join(', ')}`,
);

// Languages: html lang, a language menu that links to the same page in every language, and the old
// paths without a language redirect to it
const languageProblems = [];
for (const file of languagePages) {
  const lang = langOf(file);
  const content = html.get(file);
  const neutral = file.slice(lang.length).replace(/index\.html$/, '');
  if (!content.includes(`<html lang="${lang}">`)) languageProblems.push(`${file}: no <html lang="${lang}">`);
  for (const other of LANGUAGES) {
    if (!content.includes(`class="lang-menu-item" href="${baseurl}/${other}${neutral}"`)) {
      languageProblems.push(`${file}: the language menu does not link to /${other}${neutral}`);
    }
  }
}
for (const page of PAGES) {
  const file = `${page}index.html`;
  if (!isRedirect(file) || !(html.get(file) ?? '').includes(`'${baseurl}/' + pick + '/${page}'`)) {
    languageProblems.push(`${file}: does not redirect to /<language>/${page}`);
  }
}
languageProblems.forEach((problem) => fail(`languages   ${problem}`));
if (languageProblems.length === 0) {
  pass(`${languagePages.length} pages in ${LANGUAGES.join(' and ')} link to each other; ${PAGES.length} old paths redirect`);
}

// Smart App Banner on the app pages only
for (const lang of LANGUAGES) {
  for (const [page, appId] of Object.entries(APP_STORE_IDS)) {
    const banner = `<meta name="apple-itunes-app" content="app-id=${appId}">`;
    const file = `${lang}/${page}/index.html`;
    check((html.get(file) ?? '').includes(banner), `${file} has the Smart App Banner`, 'missing');
  }
  for (const page of NO_BANNER) {
    const file = `${lang}/${page}index.html`;
    check(!(html.get(file) ?? '').includes('name="apple-itunes-app"'), `${file} has no Smart App Banner`, 'found one');
  }
}

// Accent contrast of every app, computed like color-mix(in srgb, …)
const hex = (value) => {
  const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255);
};
const mix = (a, b, weightA) => a.map((channel, i) => channel * weightA + b[i] * (1 - weightA));
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const frontMatter = (source) => source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
const field = (source, key) => source.match(new RegExp(`^${key}:\\s*["']?(#[0-9a-fA-F]{3,6})["']?`, 'm'))?.[1];

// The app files of every language, as "<lang>/apps/<id>.md" relative to data/.
const appFiles = [];
for (const lang of LANGUAGES) {
  const dir = path.join(root, 'data', lang, 'apps');
  const names = existsSync(dir) ? (await readdir(dir)).filter((file) => file.endsWith('.md')).sort() : [];
  appFiles.push(...names.map((name) => `${lang}/apps/${name}`));
}
const slugOf = (appFile) => path.basename(appFile, '.md');
const langOfApp = (appFile) => appFile.split('/')[0];
const readApp = async (appFile) => frontMatter(await readFile(path.join(root, 'data', appFile), 'utf8'));
check(appFiles.length > 0, `${appFiles.length} app files in data/<language>/apps/`, 'none found');

// Every app in every language, with the same facts: only the texts differ.
const SHARED_KEYS = ['order', 'app_name', 'accent', 'button', 'on_button', 'icon', 'icon_touch', 'icon_favicon', 'app_store_id',
  'app_store_url', 'release_date', 'discontinued', 'coming_soon', 'framed_screenshots', 'ipad_landscape'];
const facts = (data) => ({
  ...Object.fromEntries(SHARED_KEYS.map((key) => [key, data.match(new RegExp(`^${key}:\\s*(.*?)\\s*(#.*)?$`, 'm'))?.[1] ?? ''])),
  hero_image: data.match(/^\s+image:\s*["']?([^"'\s#]+)/m)?.[1] ?? '',
  files: [...data.matchAll(/\bfile:\s*["']?([^"'\s,}]+)/g)].map((match) => match[1]).join(' '),
});
const slugs = [...new Set(appFiles.map(slugOf))].sort();
for (const slug of slugs) {
  const problems = [];
  const [first, ...others] = LANGUAGES;
  if (!appFiles.includes(`${first}/apps/${slug}.md`)) problems.push(`data/${first}/apps/${slug}.md missing`);
  for (const lang of others) {
    const appFile = `${lang}/apps/${slug}.md`;
    if (!appFiles.includes(appFile)) {
      problems.push(`data/${appFile} missing`);
      continue;
    }
    if (problems.length > 0) continue;
    const a = facts(await readApp(`${first}/apps/${slug}.md`));
    const b = facts(await readApp(appFile));
    const differ = Object.keys(a).filter((key) => a[key] !== b[key]);
    if (differ.length > 0) problems.push(`data/${appFile} differs from data/${first}/apps/${slug}.md in ${differ.join(', ')}`);
  }
  check(problems.length === 0, `${slug}: one file per language with the same facts`, problems.join('; '));
}

for (const appFile of appFiles.filter((file) => langOfApp(file) === LANGUAGES[0])) {
  const slug = slugOf(appFile);
  const data = await readApp(appFile);
  const accentValue = field(data, 'accent');
  const accent = accentValue && hex(accentValue);
  if (!accent) {
    fail(`${slug}: accent colour   missing or not a hex colour in data/apps/${appFile}`);
    continue;
  }
  const ratios = Object.fromEntries(
    Object.entries(MODES).map(([mode, m]) => {
      const ink = mix(accent, hex(m.inkBase), m.inkMix);
      const tint = mix(accent, hex(m.bg), m.tintStrength);
      return [mode, contrast(ink, tint)];
    }),
  );
  // With button and on_button the buttons have their own colours in place of the accent.
  const button = field(data, 'button') && hex(field(data, 'button'));
  const onButton = field(data, 'on_button') && hex(field(data, 'on_button'));
  const onAccentRatio = button && onButton ? contrast(onButton, button) : contrast(hex(ON_ACCENT), accent);
  const ok = ratios.light >= MIN_CONTRAST && ratios.dark >= MIN_CONTRAST && onAccentRatio >= MIN_CONTRAST;
  check(
    ok,
    `${slug}: accent ink contrast ${ratios.light.toFixed(1)}:1 (light), ${ratios.dark.toFixed(1)}:1 (dark); on-accent ${onAccentRatio.toFixed(1)}:1`,
    `each must be at least ${MIN_CONTRAST}:1`,
  );
}

// Screenshots, app page anchors and image sizes of every app
const jpgsIn = async (dir) =>
  existsSync(dir) ? (await readdir(dir)).filter((file) => file.toLowerCase().endsWith('.jpg')).sort() : [];
const sameSet = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);
const kib = (bytes) => `${Math.round(bytes / 1024)} KiB`;
for (const appFile of appFiles) {
  const slug = slugOf(appFile);
  const lang = langOfApp(appFile);
  const data = await readApp(appFile);

  // screenshots: lists the plain iPhone screenshots; screenshots_ipad: the iPad ones of the carousel.
  // With framed_screenshots: true the carousel's files are in screenshots/framed/.
  const filesIn = (list) =>
    [...(data.match(new RegExp(`^${list}:\\n((?:\\s+-.*\\n?)*)`, 'm'))?.[1] ?? '').matchAll(/\bfile:\s*["']?([^"'\s,}]+\.jpg)/g)]
      .map((match) => match[1]);
  const iphoneFiles = filesIn('screenshots');
  const ipadFiles = filesIn('screenshots_ipad');
  const framed = /^framed_screenshots:\s*true\b/m.test(data);
  const listed = (framed ? iphoneFiles : [...iphoneFiles, ...ipadFiles]).sort();
  // With screenshots_lang (such as de) the screenshots are in screenshots/<lang>/.
  const shotsLang = data.match(/^screenshots_lang:\s*["']?([a-z]+)/m)?.[1];
  const shotsDir = path.join(root, 'assets', 'apps', slug, 'screenshots', ...(shotsLang ? [shotsLang] : []));
  const framedDir = path.join(shotsDir, 'framed');
  const shotFiles = await jpgsIn(shotsDir);
  const framedFiles = await jpgsIn(framedDir);
  const framedListed = framed ? [...iphoneFiles, ...ipadFiles].sort() : [];
  const heroImage = data.match(/^\s+image:\s*["']?([^"'\s#]+)/m)?.[1];
  const problems = [];
  if (listed.length === 0) problems.push('no screenshots listed');
  if (!sameSet(listed, shotFiles)) problems.push(`screenshots/ has [${shotFiles.join(', ')}]`);
  if (!sameSet(framedListed, framedFiles)) problems.push(`screenshots/framed/ has [${framedFiles.join(', ')}]`);
  if (!heroImage || !iphoneFiles.includes(heroImage)) problems.push(`hero.image "${heroImage ?? ''}" is not one of them`);
  check(
    problems.length === 0,
    `${listed.length + framedListed.length} screenshot files match the screenshots of data/${appFile}`,
    problems.join('; '),
  );

  const page = `${lang}/${slug}/index.html`;
  const content = html.get(page) ?? '';
  const ids = /^discontinued:\s*true\b/m.test(data) ? pastAppPageIds : appPageIds;
  const missingIds = ids.filter((id) => !hasId(content, id));
  check(
    html.has(page) && missingIds.length === 0,
    `${page} has the anchors #${ids.join(', #')}`,
    html.has(page) ? `missing #${missingIds.join(', #')}` : 'page missing',
  );

  if (lang !== LANGUAGES[0] && !shotsLang) continue; // same screenshots as the first language
  const sizeOf = async (file) => (await stat(file)).size;
  const allShots = [...shotFiles.map((file) => path.join(shotsDir, file)), ...framedFiles.map((file) => path.join(framedDir, file))];
  const shotSizes = await Promise.all(allShots.map(sizeOf));
  const bigShots = allShots.filter((_, i) => shotSizes[i] > screenshotLimit).map((file) => path.relative(shotsDir, file));
  check(
    bigShots.length === 0,
    `${shotsLang ? `${slug} (${shotsLang})` : slug}: largest screenshot ${kib(Math.max(0, ...shotSizes))} (limit 200 KiB)`,
    `too large: ${bigShots.join(', ')}`,
  );
}

// File size
const sizes = await Promise.all(files.map(async (file) => (await stat(path.join(siteDir, file))).size));
const largest = Math.max(0, ...sizes);
const oversized = files.filter((_, i) => sizes[i] > sizeLimit);
check(
  oversized.length === 0,
  `largest file ${(largest / 1024 / 1024).toFixed(1)} MiB (limit 2 MiB)`,
  `too large: ${oversized.join(', ')}`,
);

if (failures > 0) {
  console.log(`${failures} ${failures === 1 ? 'check' : 'checks'} failed.`);
  process.exit(1);
}
console.log('All checks passed.');
