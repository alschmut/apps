---
date: 2026-10-05T18:19:06+00:00
git_commit: d18b909823c0cfbb2960af9207e105f49451a2be
branch: master
topic: "Multi-app portfolio redesign of EasyDice-Web"
tags: [plan, jekyll, github-pages, design, easy-dice, privacy-policy, impressum]
status: draft
---

# PLAN: Multi-app portfolio redesign of EasyDice-Web

Replace the forked "Automatic App Landing Page" template with a hand-built portfolio site for all of
Alexander Schmutz's apps:

- a **main page** in the style of apps.peterkurzok.de (`PeterWebsite/app-site-main`): a personal hero,
  a list of apps, and contact cards;
- one **app page per app** in the style of karacho.peterkurzok.de (`PeterWebsite/karacho-web-main`),
  starting with Easy Dice;
- **one** shared privacy policy and **one** shared Impressum.

The site still deploys the same way: a push to `master` triggers GitHub Pages' built-in Jekyll build.
It replaces the WordPress site at apps.t-schmutz.de later; the domain switch and the repository
rename are **not** part of this plan. All content is in English.

## Acceptance Criteria

- Pushing to `master` deploys through GitHub Pages' classic Jekyll build. There is no GitHub Actions
  workflow, and `Gemfile` still uses `github-pages`.
- The site is served at `https://alschmut.github.io/EasyDice-Web/`. Every internal link and asset
  resolves under that baseurl and would work unchanged at a root domain once `baseurl` is emptied.
- The site has these URLs:

  | Path | Content |
  |---|---|
  | `/` | main page |
  | `/easy-dice/` | Easy Dice app page |
  | `/privacy-policy/` | shared privacy policy (same path as WordPress) |
  | `/impressum/` | shared Impressum (same path as WordPress) |
  | `/404.html` | not-found page |
  | `/sitemap.xml`, `/robots.txt` | for search engines |

  `/privacypolicy/` no longer exists and is not redirected.
- **Main page:**
  - a hero with the cropped portrait, name, tagline, intro, and round Email, GitHub and LinkedIn icons;
  - an "Apps" list in which the Easy Dice row is tinted with its accent and links to `/easy-dice/`;
  - Contact cards;
  - a footer with ©, Impressum and Privacy Policy.
- **Easy Dice page**, top to bottom:
  - a sticky header with the app icon and name, nav links (Features, Screenshots, Support) and a
    "Get the app" button;
  - a hero with an accent gradient, a tilted screenshot and the App Store badge;
  - a carousel of all 8 iPhone screenshots with a lightbox;
  - 6 feature cards;
  - a Support FAQ with `id="support"`;
  - a download band;
  - a footer.
- Light and dark mode follow the system. Each app's accent colour comes from its front matter.
  Text in the accent colour meets WCAG AA (≥ 4.5:1) in both modes.
- There is one English privacy policy and one Impressum. The policy covers Mixpanel, Sentry, Google
  AdMob with UMP, Guild Ads, in-app purchases, GitHub Pages hosting and email contact.
- The built site makes **no third-party runtime requests**: no jQuery, no FontAwesome, no iTunes API,
  no Google CDN, no web fonts.
- Adding a future app takes one Markdown file in `_apps/` and one folder in `assets/apps/<id>/`, with
  no layout or CSS change.
- `node scripts/check-site.mjs` passes on the built `_site/`. The README documents the structure, local
  preview, checks and how to add an app.

## Technical Key Decisions and Tradeoffs

1. **Build: Jekyll on the classic GitHub Pages build.**
   - Why: the site should keep working the way it does today: push, and Pages builds it. Content stays
     in Markdown and YAML.
   - Impact:
     - Only GitHub Pages' pinned versions are available: Jekyll 3.10.0, Ruby 3.3.4, Liquid 4.0.4,
       kramdown 2.4.0, and the whitelisted plugins, of which we use `jekyll-sitemap`
       (https://pages.github.com/versions.json, checked 2026-10-05).
     - The Astro reference components are hand-ported to Liquid includes.
     - There is no build-time image pipeline, so images are resized once with `sips` and committed.
2. **Styles: one plain CSS file, no Sass.**
   - Why: Pages' `jekyll-sass-converter` 1.5.2 uses the old Ruby Sass, which cannot parse modern CSS
     such as `color-mix(in srgb, …)`, `clamp()` or `:has()` reliably.
   - Impact: `assets/css/site.css` is served as-is. `main.scss`, `_sass/` and the `sass:` config are
     deleted.
3. **Content model: `_data/site.yml` plus an `_apps` collection.**
   - Why: the main page loops over `site.apps`, so a new app is one file. Per-app facts (accent, App
     Store id, features, FAQ, screenshots) live in that app's front matter, next to its page.
   - Impact: the `apps` collection is configured with `output: true` and `permalink: /:name/`, and
     defaults to `layout: app`. Ordering uses an `order` front matter key.
4. **Theme: neutral light and dark tokens from app-site, components from Karacho, accent per app.**
   - Why: you asked for one site for many apps whose icon colours differ. The screenshots carry the
     app's own colours, so the chrome around them stays calm.
   - Impact:
     - `--accent` is set inline per app (`style="--accent: #FFCC00"`).
     - Text in the accent colour uses an "ink" mix:
       `color-mix(in srgb, var(--accent) var(--accent-ink-mix), var(--accent-ink-base))`, with 45% mixed
       towards black in light mode and 80% mixed towards white in dark mode.
     - Fills such as tints, gradients, the button background and icon tiles use the raw accent.
     - Text on an accent fill uses `--on-accent` (default `#16161a`). An app can override it with
       `on_accent`.
5. **Legal paths keep the WordPress paths: `/privacy-policy/` and `/impressum/`.**
   - Why: App Store Connect (all 4 locales) and `EasyDice/Settings/SettingsView.swift:58` link to
     `apps.t-schmutz.de/privacy-policy` and `/impressum`. Once the domain points here, those links keep
     working. GitHub Pages redirects the forms without a trailing slash itself.
   - Impact: these are ordinary Markdown pages with explicit `permalink`s.
6. **No runtime third parties, and our own JavaScript is minimal.**
   - Why: privacy (the policy can say "no third-party requests") and simplicity.
   - Impact:
     - Icons are inline SVG paths from Bootstrap Icons (MIT), collected in `_includes/icon.html`.
     - One file, `assets/js/site.js`, loaded with `defer`, holds the nav toggle, carousel arrows and
       lightbox. Without JS the page still works: the nav is open via a `<noscript>` style, the carousel
       scrolls by touch or trackpad, and screenshot links open the full image.
     - App facts are static front matter. The iTunes lookup is dropped.
7. **Local builds run in Docker (`ruby:3.3`).**
   - Why: the local Ruby is 4.0, while Pages pins Ruby 3.3.4 and `github-pages` 232.
   - Impact: `scripts/jekyll.sh build|serve` wraps
     `docker run … ruby:3.3 bundle exec jekyll …` with a named volume for gems. `Gemfile` gains
     `webrick`, which Jekyll needs on Ruby ≥ 3. GitHub Pages ignores the Gemfile.
8. **Verification uses `scripts/check-site.mjs`, built on Node built-ins only, as Karacho's
   `check-dist.mjs` does.**
   - Why: there are no tests in a static site, but the URL contract, links, assets, absence of third
     parties and accent contrast can all be checked mechanically on `_site/`.
   - Impact: no `package.json` is needed. The check runs with `node scripts/check-site.mjs` after a
     build.
9. **Images:**
   - The portrait original moves to `_originals/portrait.jpg`. Jekyll ignores underscore folders, so it
     is kept in git but not published. A 640² crop is published.
   - The 8 PNG screenshots (1320×2868, up to 7.3 MB each) become a JPG at full size (q≈82) and a
     600 px-wide JPG thumbnail.
   - The app icon is converted from the EasyDice repo's 1024² JPG to 256, 180 and 64 px PNGs.
   - Apple's SVG badges are copied from karacho-web-main.

## Current State

The repository is a fork of Emil Baehr's "Automatic App Landing Page" template (MIT):

```
master ──push──▶ GitHub Pages (classic Jekyll build, github-pages gem) ──▶ alschmut.github.io/EasyDice-Web/

EasyDice-Web/
├── _config.yml              all content + theme colours (ios_app_id 1514806286, features, your_name, email …)
├── index.html               front matter only → _layouts/default.html
├── _layouts/default.html    device frame + clip-path screenshot, app info, features, footer
├── _layouts/page.html       Markdown sub-pages
├── _includes/
│   ├── head.html            FontAwesome CDN, main.css, Smart App Banner
│   ├── header.html          app icon + nav from site.pages (include_in_header)
│   ├── features.html        loops site.features (FontAwesome icons)
│   ├── footer.html          "Made with ♥ by …", social icons, page links
│   ├── screencontent.html   jQuery: inject screenshot/video from assets/screenshot|videos
│   └── appstoreimages.html  jQuery: iTunes lookup API → name, icon, price, store link (client-side)
├── _pages/privacypolicy.md  → /privacypolicy/  (custom "pages" collection)
├── main.scss + _sass/       Sass templated from _config.yml (base, layout, github-markdown)
├── assets/                  device PNGs, store badge PNGs, placeholder screenshot, headerimage.png, squircle SVGs
│   └── portrait.jpg         NEW, untracked, 3151×3151, 1.5 MB (added by you for this redesign)
├── CNAME                    empty
├── Gemfile                  gem 'github-pages'
└── README.md                template README
```

Facts that shape the plan:

- The App Store `privacy_url` and `support_url` point at the WordPress site
  `http://apps.t-schmutz.de/privacy-policy` and `/impressum`. The same privacy URL is hard-coded in the
  app (`EasyDice/Settings/SettingsView.swift:58`).
- What the app actually uses, from `Package.resolved`, `AnalyticsAdapter.swift`, `AdvertBannerView.swift`
  and `UserSettings.swift`:
  - Mixpanel analytics, on by default, with an in-app `isDataAnalyticsEnabled` switch.
  - Sentry crash reporting in release builds only, with the user id set to the Mixpanel id; the in-app
    feedback is sent through Sentry.
  - Google Mobile Ads and Google UMP.
  - Guild Ads, shown instead of AdMob for about a third of installs (`isUsingGuildAdsInteger > 66`).
  - The current policy still names AppCenter, which is no longer used.
- The iTunes lookup for 1514806286 gives `minimumOsVersion` 17.0, the price "free", and the store URL
  `https://apps.apple.com/app/id1514806286`.
- Source assets:
  - Screenshots:
    `/Users/alexander.schmutz/Documents/Projects-private/AppAssets/EasyDice/version_1_14_0/en-GB/iPhone 17 Pro Max-{1..6}-page.png`
    and `-{7,8}-settings.png`. They are raw, with no frame and no caption.
  - Icon: `/Users/alexander.schmutz/Documents/Projects-private/EasyDice/EasyDice/Assets.xcassets/AppIcon.appiconset/EasyDice Gradient.jpg`,
    1024², a yellow square with white pips.
  - Badges: `/Users/alexander.schmutz/Documents/Projects-private/PeterWebsite/karacho-web-main/src/assets/images/app-store-download-{black,white}.svg`.

## Desired End State

```
EasyDice-Web/
├── _config.yml                  site settings only (title, url, baseurl, collections, defaults, plugins, exclude)
├── _data/site.yml               owner (name, tagline, intro, portrait), contact (lead, channels), legal links, copyright_year
├── _apps/
│   └── easy-dice.md             front matter: all Easy Dice facts → /easy-dice/
├── _layouts/
│   ├── base.html                <html>, head, header slot, main, footer
│   ├── home.html                hero + apps list + contact (main page)
│   ├── app.html                 app page: header nav, hero, screenshots, features, support, download, lightbox
│   └── prose.html               privacy policy, Impressum, 404
├── _includes/
│   ├── head.html                meta, canonical, OG, favicons, theme-color, CSS, Smart App Banner (apps only)
│   ├── site-header.html         slim header for main/legal pages (name → home)
│   ├── app-header.html          sticky app header (icon, name, nav, "Get the app")
│   ├── footer.html              site footer (app tagline/social on app pages)
│   ├── icon.html                inline SVG icon by name (Bootstrap Icons paths)
│   ├── app-row.html             one row of the main page app list
│   └── store-badge.html         <picture> with black/white App Store badge
├── index.html                   layout: home
├── privacy-policy.md            permalink /privacy-policy/
├── impressum.md                 permalink /impressum/
├── 404.html                     layout: prose, permalink /404.html
├── robots.txt                   Liquid → sitemap URL
├── assets/
│   ├── css/site.css
│   ├── js/site.js
│   ├── favicon.svg              "AS" monogram (main + legal pages)
│   ├── images/portrait.jpg      640×640 crop
│   ├── images/app-store-download-black.svg, -white.svg
│   └── apps/easy-dice/
│       ├── icon-256.png, icon-180.png, icon-64.png
│       └── screenshots/01-…08-*.jpg  +  screenshots/thumbs/01-…08-*.jpg
├── _originals/portrait.jpg      unpublished original
├── scripts/jekyll.sh            Docker wrapper: build | serve
├── scripts/check-site.mjs       verifies _site/
├── Gemfile                      github-pages + webrick
├── README.md                    rewritten
└── docs/agents/plans/…          this plan (excluded from build)
```

### Main page (`/`), desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   ╭──────────╮   Alexander Schmutz                                          │
│   │ portrait │   iOS developer in Stuttgart, Germany                        │
│   │  200px   │   I build small, focused apps for iPhone, iPad and Apple     │
│   ╰──────────╯   Watch in my free time — simple to use, quick to open,      │
│                  and made with care.                                        │
│                  (✉) (GitHub) (in)                                          │
│                                                                            │
│   Apps                                                                     │
├────────────────────────────────────────────────────────────────────────────┤  ← row tinted with accent (7% light / 13% dark)
│   ┌──────┐  Easy Dice                                                       │
│   │ icon │  Simple, modern dice for iPhone, iPad and Apple Watch  (ink)     │
│   │ 128  │  Roll one to six dice with a tap — D2 to D100, with sound,       │
│   └──────┘  vibration and the total at a glance …                           │
│             More about Easy Dice →                                (ink)     │
├────────────────────────────────────────────────────────────────────────────┤
│   Contact                                                                  │
│   Questions about an app, feedback, or an idea? Any of these reach me.     │
│   ┌────────────────────────────┐ ┌────────────────────────────┐            │
│   │ (✉) Email                  │ │ (GitHub) GitHub            │            │
│   │     apps@t-schmutz.de      │ │     @alschmut              │            │
│   └────────────────────────────┘ └────────────────────────────┘            │
│   ┌────────────────────────────┐                                           │
│   │ (in) LinkedIn              │                                           │
│   │     alexander-schmutz      │                                           │
│   └────────────────────────────┘                                           │
├────────────────────────────────────────────────────────────────────────────┤
│   © 2026 Alexander Schmutz                       Impressum   Privacy Policy │
└────────────────────────────────────────────────────────────────────────────┘
```

On a phone (< 46rem) the hero stacks and centres: the portrait at 160 px, then the text. App rows stack
icon over text below 40rem. Contact cards drop to one column.

### Easy Dice page (`/easy-dice/`), desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [ic] Easy Dice                 Features  Screenshots  Support [Get the app]│ sticky, blurred
├────────────────────────────────────────────────────────────────────────────┤
│░░ accent gradient (yellow → bg) with two soft radial glows ░░░░░░░░░░░░░░░░│
│                                                     ┌────────┐             │
│  Roll the dice. Any dice.                           │ purple │  tilted −4°  │
│  Easy Dice is a simple, modern dice app for board   │   ⚂    │  hangs 6rem  │
│  games, role-playing and quick decisions …          │        │  into next   │
│  [  Download on the App Store  ]                    └────────┘             │
│  Free download · iPhone, iPad & Apple Watch · No account                   │
├────────────────────────────────────────────────────────────────────────────┤
│                  A look at Easy Dice                                       │
│      One to six dice, eight dice types, and a background you like.         │
│  (‹) [shot][shot][shot][shot] →→ scroll-snap carousel                  (›) │
├────────────────────────────────────────────────────────────────────────────┤
│                  Everything a dice needs                                   │
│  ┌ ▣ Up to six dice ┐ ┌ ▣ Every dice type ┐ ┌ ▣ Sound, vibr.,shake┐       │
│  └──────────────────┘ └───────────────────┘ └─────────────────────┘        │
│  ┌ ▣ On your wrist  ┐ ┌ ▣ Hear the sum    ┐ ┌ ▣ Make it yours    ┐        │
│  └──────────────────┘ └───────────────────┘ └─────────────────────┘        │
├────────────────────────────────────────────────────────────────────────────┤
│  #support        Support                                                   │
│     Something not working, or an idea? Write to apps@t-schmutz.de.         │
│  ┌ What do I need to run Easy Dice?                                  ˅ ┐   │
│  ├ How do I roll the dice?                                           ˅ ┤   │
│  └ …                                                                 ˅ ┘   │
├────────────────────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░ accent gradient band ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                         Get Easy Dice                                      │
│      Free on the App Store for iPhone, iPad and Apple Watch …              │
│                 [  Download on the App Store  ]                            │
├────────────────────────────────────────────────────────────────────────────┤
│ Simple, modern dice for iPhone, iPad and Apple Watch.     (✉) (GH) (in)    │
│ ─────────────────────────────────────────────────────────────────────────  │
│        Privacy Policy   Impressum   Terms of Use   More apps               │
│                      © 2026 Alexander Schmutz                              │
└────────────────────────────────────────────────────────────────────────────┘
```

Lightbox: a native `<dialog>` with the caption in the header, a close button, and the full-size JPG.
Clicking the backdrop or pressing Esc closes it.

### Prose pages (`/privacy-policy/`, `/impressum/`, `/404.html`)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Alexander Schmutz                                      Apps  Contact       │  slim header (→ / and /#contact)
├────────────────────────────────────────────────────────────────────────────┤
│        Privacy Policy                                                      │  max-width 42rem
│        Last updated: 5 October 2026                                        │
│        ## …                                                                │
├────────────────────────────────────────────────────────────────────────────┤
│   © 2026 Alexander Schmutz                       Impressum   Privacy Policy │
└────────────────────────────────────────────────────────────────────────────┘
```

## Abstractions and Code Reuse

Nothing of the old template's markup or Sass is reused; the whole template is replaced. The designs are
ported from the two Astro references, and these map one-to-one:

| Reference (Astro) | New (Jekyll) |
|---|---|
| app-site `Base.astro` tokens and `.prose` styles | `assets/css/site.css` `:root` tokens, `.prose` |
| app-site `Hero.astro` | `_layouts/home.html` hero block |
| app-site `AppRow.astro` | `_includes/app-row.html` |
| app-site `ContactSheet.astro` | `_layouts/home.html` contact block |
| app-site `Footer.astro` | `_includes/footer.html`, main and legal variant |
| karacho `Header.astro` + inline toggle script | `_includes/app-header.html` + `assets/js/site.js` |
| karacho `Hero.astro`, `Cta.astro`, `StoreBadge.astro` | `_layouts/app.html` hero + `_includes/store-badge.html` |
| karacho `Screenshots.astro` + `Lightbox.astro` | `_layouts/app.html` sections + `assets/js/site.js` |
| karacho `Features.astro`, `Faq.astro`, `Download.astro` | `_layouts/app.html` sections |
| karacho `Icon.astro` (Bootstrap Icons) | `_includes/icon.html` |
| karacho `site.css` component styles | `assets/css/site.css`, re-tokenised for light/dark and accent |
| karacho `scripts/check-dist.mjs` | `scripts/check-site.mjs`, adapted to baseurl, Jekyll and contrast |

### `_data/site.yml` (shape)

```yaml
owner:
  name: Alexander Schmutz
  tagline: iOS developer in Stuttgart, Germany
  intro: >-
    I build small, focused apps for iPhone, iPad and Apple Watch in my free time:
    simple to use, quick to open, and made with care.
  portrait: /assets/images/portrait.jpg
contact:
  lead: Questions about an app, feedback, or an idea? Any of these reach me.
  channels:
    - { id: email,    label: Email,    handle: apps@t-schmutz.de,  href: "mailto:apps@t-schmutz.de" }
    - { id: github,   label: GitHub,   handle: "@alschmut",        href: "https://github.com/alschmut" }
    - { id: linkedin, label: LinkedIn, handle: alexander-schmutz,  href: "https://www.linkedin.com/in/alexander-schmutz" }
legal:
  links:
    - { label: Impressum,      href: /impressum/ }
    - { label: Privacy Policy, href: /privacy-policy/ }
copyright_year: 2026
```

### `_apps/easy-dice.md` (front matter shape and Easy Dice copy)

```yaml
---
order: 1
name: Easy Dice
title: "Easy Dice: Simple, modern dice"           # <title>
description: >-                                     # meta description + app row text
  Roll one to six dice with a tap — D2 to D100, with sound, vibration and the total at a glance.
  On iPhone, iPad and right on your wrist with Apple Watch.
tagline: Simple, modern dice for iPhone, iPad and Apple Watch
accent: "#FFCC00"
# on_accent: "#16161a"                              # optional, default
icon: /assets/apps/easy-dice/icon-256.png
icon_touch: /assets/apps/easy-dice/icon-180.png
icon_favicon: /assets/apps/easy-dice/icon-64.png
app_store_id: "1514806286"
app_store_url: https://apps.apple.com/app/id1514806286
link_label: More about Easy Dice
hero:
  title: Roll the dice. Any dice.
  subtitle: >-
    Easy Dice is a simple, modern dice app for board games, role-playing and quick decisions:
    up to six dice, eight dice types and the total at a glance, on iPhone, iPad and Apple Watch.
  trust: [Free download, "iPhone, iPad & Apple Watch", No account]
  image: 01-single-d6.jpg
  image_alt: Easy Dice on iPhone, showing a single white D6 on a purple background
sections:
  screenshots: { title: A look at Easy Dice, description: "One to six dice, eight dice types, and a background you like." }
  features:    { title: Everything a dice needs, description: "Simple to use, quick to roll, and made to be read at a glance." }
  support:     { title: Support, description: "Something not working, or an idea? Write to apps@t-schmutz.de. I read every message." }
  download:    { title: Get Easy Dice, text: "Free on the App Store for iPhone, iPad and Apple Watch. Easy Dice Pro, an in-app purchase, removes the ads and supports the development." }
features:
  - { icon: dice-5,           title: Up to six dice,              text: "Roll one to six dice at once and see their total instantly. Keep your finger on the screen and they keep rolling until you let go." }
  - { icon: grid-3x3-gap,     title: Every dice type,             text: "Switch between D2, D4, D6, D8, D10, D12, D20 and D100 with one tap on the dice button." }
  - { icon: volume-up,        title: "Sound, vibration, shake",   text: "Realistic rolling sounds and a gentle vibration with every roll. Or simply shake your iPhone to roll." }
  - { icon: smartwatch,       title: On your wrist,               text: "Roll up to four dice on Apple Watch, and open Easy Dice straight from a complication on your watch face." }
  - { icon: universal-access, title: Hear the sum,                text: "Easy Dice can announce the total of every roll in your language, and works with VoiceOver." }
  - { icon: image,            title: Make it yours,               text: "Colourful gradients, wood, cork, marble or a starry sky, or one of your own photos as background. White or dark dice." }
faq:
  - q: What do I need to run Easy Dice?
    a: An iPhone or iPad with iOS 17 or later. Easy Dice also comes with an app for Apple Watch.
  - q: How do I roll the dice?
    a: Tap the dice. Keep your finger on them and they keep rolling until you let go, or simply shake your device.
  - q: How do I change the number of dice or the dice type?
    a: Swipe left or right to roll one to six dice. Tap the dice button at the top, for example D6, to pick another type from D2 to D100. In Settings you can hide that button and the sum.
  - q: What does Easy Dice Pro add?
    a: Easy Dice is free and shows a small ad banner. Easy Dice Pro, an in-app purchase, removes the ads and supports the development of the app.
  - q: Can I turn off the sound or the vibration?
    a: "Yes. Settings has a switch for each: sounds, announce sum, vibration, dark dice, show sum, the dice button, and keeping the display awake."
  - q: Do you collect data about me?
    a: Easy Dice has no account. It uses usage analytics, which you can switch off in Settings, and crash reports to improve the app, and the free version shows ads. The [privacy policy](/privacy-policy/) explains each service.
  - q: How do I get in touch?
    a: Write to [apps@t-schmutz.de](mailto:apps@t-schmutz.de), or use "Give feedback" in the app's Settings.
screenshots:
  - { file: 01-single-d6.jpg,      alt: "One D6 on a purple background",              caption: "A single D6 on a colourful background" }
  - { file: 02-wood-d10.jpg,       alt: "Two D10 on a wooden background",              caption: "Two D10 on a wooden background" }
  - { file: 03-dice-picker.jpg,    alt: "The dice type menu from D2 to D100",          caption: "Pick any dice type, from D2 to D100" }
  - { file: 04-four-dice.jpg,      alt: "Four D6 with the total 13",                   caption: "Four dice, with the total at the top" }
  - { file: 05-dark-dice.jpg,      alt: "Five dark dice on orange",                    caption: "Five dice in the dark style" }
  - { file: 06-six-dice.jpg,       alt: "Six dice on a starry sky",                    caption: "Six dice under a starry sky" }
  - { file: 07-settings.jpg,       alt: "The Settings screen",                         caption: "Sounds, vibration, dice style and more in Settings" }
  - { file: 08-backgrounds.jpg,    alt: "The background picker",                       caption: "Choose a background or import your own photo" }
---
```

The FAQ answers are drafted from verified facts: App Store metadata, the iTunes lookup, `UserSettings`,
and the screenshots. Review the wording on the live preview, especially Pro and Apple Watch.

### Accent handling (CSS)

```css
:root { --accent: #8e8e93; --on-accent: #16161a; --tint-strength: 7%;
        --accent-ink-mix: 45%; --accent-ink-base: #000; }
@media (prefers-color-scheme: dark) { :root { --tint-strength: 13%; --accent-ink-mix: 80%; --accent-ink-base: #fff; } }
.accent-scope { --accent-ink: color-mix(in srgb, var(--accent) var(--accent-ink-mix), var(--accent-ink-base)); }
```

Each app row and the app page `<body>` get `class="accent-scope" style="--accent: {{ app.accent }}"`.
The `--accent-ink` value has to be redeclared on the element that sets `--accent`. A custom property
on `:root` would resolve `var(--accent)` too early, which is why it sits on `.accent-scope`.

## Logging & Observability

There is no runtime logging; the old `console.log`/`console.info` calls disappear with the jQuery
includes. Build-time observability comes from `scripts/check-site.mjs`, which prints one line per check:

```
✓ _site/index.html
✓ _site/easy-dice/index.html
✓ _site/privacy-policy/index.html
✓ _site/impressum/index.html
✓ _site/404.html
✓ _site/sitemap.xml
✓ _site/robots.txt
✓ _site/privacypolicy/ is gone
✓ 143 internal links resolve under /EasyDice-Web
✓ 0 third-party scripts, stylesheets, fonts or images
✓ 8 screenshot files match the screenshots of _apps/easy-dice.md
✓ easy-dice: accent ink contrast 6.2:1 (light), 11.0:1 (dark); on-accent 11.9:1
✓ largest file 0.6 MiB (limit 2 MiB)
```

Failures print `✗ <check>   <problem>` and the script exits with code 1. The numbers above are
illustrative.

## Implementation

### Phase 1: New site frame, main page and legal pages

Dependencies: None

This phase replaces the template with the new frame. The main page, Impressum, privacy policy and 404
become complete. `/easy-dice/` exists in a reduced form (header, hero with badge, download band,
footer), so the app row link and the check script are already valid.

**Tasks**:

*Remove the old template*
- [x] Delete the old template files: `index.html` (recreated below), `main.scss`, `_sass/`,
  `_layouts/default.html`, `_layouts/page.html`, all six files in `_includes/`,
  `_pages/privacypolicy.md`, and the old assets (`assets/{appstore,playstore,black,blue,coral,white,yellow}.png`,
  `assets/headerimage.png`, `assets/squircle*.svg`, `assets/screenshot/`, `assets/videos/`).
- [x] Move `assets/portrait.jpg` to `_originals/portrait.jpg`.

*Configuration and tooling*
- [x] Rewrite `_config.yml` with these settings:
  - `title: Alexander Schmutz — Apps` (`lang` is not needed: `base.html` writes `lang="en"`)
  - `description`
  - `url: https://alschmut.github.io`
  - `baseurl: /EasyDice-Web`
  - `markdown: kramdown`
  - `kramdown:` in block style with `input: GFM` and `smart_quotes: "apos,apos,quot,quot"` (it must be quoted, because in a YAML flow mapping the commas would split it into keys)
  - `plugins: [jekyll-sitemap]`
  - `collections: { apps: { output: true, permalink: /:name/ } }`
  - `defaults` with `scope: { type: apps }` that set `layout: app`
  - `exclude: [README.md, LICENSE, Gemfile, Gemfile.lock, CNAME, docs, scripts, vendor, node_modules]`

  Comment that emptying `baseurl` is all that is needed for a custom domain.
- [x] Update `Gemfile` to:
  ```ruby
  source "https://rubygems.org"
  gem "github-pages", group: :jekyll_plugins
  gem "webrick"   # jekyll serve on Ruby >= 3; ignored by GitHub Pages
  ```
- [x] Update `.gitignore`: keep the existing entries and add `.jekyll-cache`, `.DS_Store` and `vendor/`.
- [x] Add `scripts/jekyll.sh` (executable). It runs `build` or `serve` in Docker with the named gem
  volume, and `serve` publishes port 4000. The site is then at `http://localhost:4000/EasyDice-Web/`.
  ```sh
  docker run --rm -v "$PWD":/srv/site -v easydice-web-gems:/usr/local/bundle -w /srv/site \
    ${PORTS} ruby:3.3 sh -c "bundle install --quiet && bundle exec jekyll $CMD $ARGS"
  ```
  `serve` adds `-p 4000:4000` and `ARGS="--host 0.0.0.0 --force_polling"`: inside the container Jekyll
  would otherwise bind to 127.0.0.1, and file events don't cross the bind mount reliably. Both commands
  set `-e PAGES_REPO_NWO=alschmut/EasyDice-Web` so `jekyll-github-metadata` doesn't guess the repo.

*Data and assets*
- [x] Add `_data/site.yml` with the shape and copy shown above.
- [x] Create `assets/images/portrait.jpg` from `_originals/portrait.jpg`. Crop a square around the face
  The starting point is a 1500×1500 region at offset x 900, y 450, which puts the face slightly above
  the centre with the hood visible. Then resize to 640² at JPEG quality 80, writing to a new file:
  `sips -c 1500 1500 --cropOffset 450 900 _originals/portrait.jpg --out /tmp/crop.jpg && sips -Z 640 -s formatOptions 80 /tmp/crop.jpg --out assets/images/portrait.jpg`.
  Adjust the offset after looking at the result. (Implemented: `-c 2500 2500 --cropOffset 300 330`, 98 KB.) Check visually that
  the face is centred with some headroom and that the file is < 120 KB.
- [x] Add `assets/favicon.svg`: a rounded square in `#16161a` with a white "AS" in the system font. It is
  used on the main and legal pages.
- [x] Add the Easy Dice icons from
  `EasyDice/Assets.xcassets/AppIcon.appiconset/EasyDice Gradient.jpg`:
  `assets/apps/easy-dice/icon-256.png`, `icon-180.png` and `icon-64.png`, made with
  `sips -s format png -Z <n>`.
- [x] Copy `app-store-download-black.svg` and `-white.svg` from `karacho-web-main/src/assets/images/` to
  `assets/images/`.

*Includes and layouts*
- [x] Add `_includes/icon.html`. It takes `name` and `size` and outputs an inline `<svg viewBox="0 0 16 16"
  fill="currentColor" aria-hidden="true">` built from a `case` on the name. The paths are copied from
  Bootstrap Icons 1.11 (MIT), e.g. `https://unpkg.com/bootstrap-icons@1.11.3/icons/<name>.svg`, and the
  include carries a licence comment. The icons needed are:
  - `envelope`, `github`, `linkedin`, `arrow-right`;
  - for Phase 2: `chevron-left`, `chevron-right`, `x-lg`, `dice-5`, `grid-3x3-gap`, `volume-up`,
    `smartwatch`, `universal-access`, `image`.
- [x] Add `_includes/head.html`. It contains:
  - charset and viewport;
  - `<title>`: `page.title` plus " — " plus `site.data.site.owner.name`, or `page.title` alone on app
    pages;
  - the meta description;
  - a canonical link and `og:*` tags from `page.url | absolute_url`;
  - `og:image`: the app's first screenshot on app pages, otherwise the portrait;
  - `twitter:card`;
  - the `color-scheme` meta and `theme-color` light and dark values;
  - favicon and apple-touch-icon: the app icon PNGs when `page.collection == "apps"`, otherwise
    `favicon.svg`;
  - `<link rel="stylesheet" href="{{ '/assets/css/site.css' | relative_url }}">` and
    `<script defer src="{{ '/assets/js/site.js' | relative_url }}">`;
  - `<meta name="apple-itunes-app" content="app-id=…">` only when `page.app_store_id` is set;
  - `noindex` when `page.noindex`.
- [x] Add `_layouts/base.html` with this structure:
  `<!doctype html><html lang="en">` → `head` include →
  `<body class="{{ layout.body_class }}{% if page.accent %} accent-scope{% endif %}" {% if page.accent %}style="--accent: {{ page.accent }}; --on-accent: {{ page.on_accent | default: '#16161a' }}"{% endif %}>`
  → the header include, chosen from `layout.header` (`site`, `app` or `none`) → `<main id="main">{{ content }}</main>`.
  Jekyll 3 merges child layout front matter into `layout.*`, so each child layout sets the values:
  `home.html` uses `header: none, body_class: home`, `app.html` uses `header: app, body_class: app-page`,
  and `prose.html` uses `header: site, body_class: prose-page`
  → the footer include. Add a "Skip to content" link.
- [x] Add `_includes/site-header.html`: the owner name linking to `/`, plus "Apps" (`/#apps`) and
  "Contact" (`/#contact`). It is used on the legal pages and the 404 page; the main page has no top bar,
  like app-site.
- [x] Add `_includes/footer.html` with two variants:
  - Main and legal pages: `© {{ site.data.site.copyright_year }} Alexander Schmutz` on the left, the
    `legal.links` on the right (app-site footer style).
  - App pages: the app tagline and social icons, then Privacy Policy, Impressum, Terms of Use
    (`https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`) and More apps (`/`), then ©
    (Karacho footer style).

  Every internal href goes through `relative_url`.
- [x] Add `_includes/app-row.html`, which renders one `app` from `site.apps`:
  - `<section class="app-row accent-scope" style="--accent: …">`;
  - the icon (128 px, 96 px on phones, `border-radius: 22.5%`) linking to `app.url | relative_url`;
  - `h3` with the name, the tagline in `--accent-ink`, and the description;
  - a CTA reading `app.link_label` plus the arrow icon, in `--accent-ink`.
- [x] Add `_layouts/home.html`:
  - the hero, with the portrait (`fetchpriority="high"`, width and height 200), `h1` name, tagline,
    intro, and the round channel icons, each with an `sr-only` label and `rel="me noopener"` for http
    links;
  - `<section id="apps">` with the `h2` "Apps" and a loop over `site.apps | sort: "order"` rendering
    `app-row.html`;
  - `<section id="contact">` with the contact cards.
- [x] Add `index.html` (`layout: home`, `title: Apps for iPhone, iPad and Apple Watch`, plus a
  description).
- [x] Add `_layouts/prose.html`. It uses `base` with front matter `header: site` and `body_class: prose-page`, and wraps `{{ content }}` in `<article class="container prose">`. It does **not** render `page.title` as a heading, because each Markdown page starts with its own `# H1`, so there is exactly one `h1`.
- [x] Add `_includes/store-badge.html`: a `<picture>` whose `<source media="(prefers-color-scheme: dark)">`
  is the white SVG and whose `<img>` is the black SVG (height 50, 45 on phones), with
  `alt="Download on the App Store"`, wrapped in a link to `page.app_store_url`.
- [x] Add `_layouts/app.html` at Phase 1 scope:
  - `app-header.html`, with only the brand and the "Get the app" button (`#download`) for now;
  - the hero, with the title, subtitle, store badge, trust list and tilted hero screenshot. All app
    asset URLs are built from `page.slug` (`easy-dice`):
    `{% assign app_dir = '/assets/apps/' | append: page.slug %}`, so the screenshots are at
    `{{ app_dir }}/screenshots/{{ file }}` and the thumbnails at `{{ app_dir }}/screenshots/thumbs/{{ file }}`.
    The `icon*` keys hold full paths. Because the hero uses `hero.image`, the hero image is created
    now: produce `01-single-d6.jpg` (full and thumbnail) in this phase, as described in Phase 2's
    asset task.
  - the `#download` band;
  - the footer.
- [x] Add `_includes/app-header.html`: a sticky, blurred bar with the 28 px app icon and name (linking to
  the app page top) and the nav list (filled in Phase 2) plus the `button-small` "Get the app" link.
  On < 768 px it shows the hamburger toggle, as in Karacho.

*Pages and content*
- [x] Add `_apps/easy-dice.md` with the full front matter shown above, all of it now, even though
  Phase 1 renders only part of it.
- [x] Add `assets/css/site.css`, organised in the sections below. Port the values from app-site
  `Base.astro`, `AppRow.astro`, `Hero.astro`, `ContactSheet.astro`, `Footer.astro` and Karacho
  `site.css`, and replace Karacho's dark-only colours with the shared tokens.
  - **Tokens**: light and dark `--bg`, `--surface`, `--surface-raised`, `--text`, `--text-muted`,
    `--border`, `--shadow`, the accent tokens, `--radius`, `--icon-radius: 22.5%`, `--content-width`,
    `--gutter`, and the system font stack.
  - **Base**: reset, body, headings, `img`, `a`, `:focus-visible`, `.container`, `.sr-only`,
    `.section-title`, `.skip-link`, and reduced motion.
  - **Buttons**: `.button` (accent fill, `--on-accent` text), `.button-small`.
  - **Site header** and **app header** (sticky, `backdrop-filter`, nav toggle), with
    `scroll-padding-top` on `html`.
  - **Home hero**, **app rows** (`color-mix` tint background and border), and **contact cards**.
  - **App hero**:
    `background: radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 45%), radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 45%), linear-gradient(135deg, color-mix(in srgb, var(--accent) 28%, var(--bg)) 0%, var(--bg) 75%)`,
    with text in `--text`. The tilted image appears ≥ 992 px.
  - **Section header**, **download band** (same gradient family), **store badges**.
  - **Prose**: 42 rem, muted paragraphs, `h2` spacing, links, `address`, tables (for the "which app
    uses what" table).
  - **Footer**, both variants.
  - Phase 2 adds screenshots, lightbox, feature cards and FAQ.
- [x] Add `assets/js/site.js` with the nav toggle only: the Karacho logic, guarded by
  `if (toggle)`. Phase 2 extends it.
- [x] Add `impressum.md` (`layout: prose`, `permalink: /impressum/`, `title: Impressum`, description)
  with these sections:
  - `# Impressum`
  - `## Information in accordance with § 5 DDG`: Alexander Schmutz, Am Bühl 2, 78476 Allensbach,
    Germany, in an `<address>`.
  - `## Contact`: Phone [+49 151 56926858](tel:+4915156926858), Email
    [apps@t-schmutz.de](mailto:apps@t-schmutz.de).
  - `## Responsible for the content in accordance with § 18 Abs. 2 MStV`: Alexander Schmutz, address
    as above.
  - `## EU dispute resolution`: the ODR platform link
    (https://ec.europa.eu/consumers/odr/), and a statement that you are neither obliged nor willing to
    take part in consumer arbitration.
  - `## Liability for links`: as app-site.
  - `## Copyright`: the site's content and the app icons and screenshots are © Alexander Schmutz;
    Apple's App Store badge is a trademark of Apple Inc.
- [x] Add `privacy-policy.md` (`layout: prose`, `permalink: /privacy-policy/`, `title: Privacy Policy`,
  description). It is a full rewrite in Karacho's plain first-person tone, starting with
  "Last updated: 5 October 2026", with these sections:
  1. **Intro**: one policy for this website and all of Alexander Schmutz's apps. The controller is
     named in the Impressum (link). The apps have no accounts and no server of mine.
  2. **This website**:
     - It is a static site hosted on GitHub Pages by GitHub, Inc., 88 Colin P. Kelly Jr. Street,
       San Francisco, CA 94107, USA. GitHub processes connection data (IP address, requested URL, time,
       user agent) to deliver the page and keep it secure, and may keep logs. Legal basis:
       Art. 6(1)(f) GDPR. Link to the GitHub General Privacy Statement.
     - There are no cookies, no analytics, and nothing loaded from third parties.
  3. **Which app uses what**: a table with the columns App, Analytics, Crash reports, Ads and In-app
     purchases. The only row so far is Easy Dice: Mixpanel, Sentry, Google AdMob or Guild Ads, Apple.
     A sentence notes that new apps are added to the table.
  4. **Usage analytics (Mixpanel)**:
     - The provider is Mixpanel, Inc., San Francisco, USA.
     - It receives app events (for example screens opened and settings changed), a random app-specific
       user ID, the device model, the OS and app version, and the country derived from the IP address.
       The purpose is to understand which features are used.
     - The analytics are on by default and can be switched off at any time in the app's Settings.
     - Legal basis: Art. 6(1)(f) GDPR.
     - Data transfer to the USA happens under the EU–US Data Privacy Framework or the standard
       contractual clauses.
     - Link: https://mixpanel.com/legal/privacy-policy/
  5. **Crash reports and feedback (Sentry)**:
     - The provider is Functional Software, Inc. (Sentry), San Francisco, USA.
     - On a crash or error it receives a stack trace, the device model, the OS and app version, and
       the same random user ID. Messages sent with "Give feedback" are also sent through Sentry.
     - The purpose is fixing bugs and answering feedback.
     - Legal basis: Art. 6(1)(f) GDPR, or (b) for feedback you send.
     - Link: https://sentry.io/privacy/
  6. **Advertising (Google AdMob)**:
     - The provider is Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland.
     - The free version shows a banner. In the EEA and UK, Google's consent dialog (User Messaging
       Platform) asks for consent before personalised ads; without consent only non-personalised ads
       are shown.
     - It receives device information, IP address, advertising and usage data, and possibly the
       advertising identifier if you allow tracking.
     - Legal basis: Art. 6(1)(a) GDPR (consent) for personalised ads, otherwise Art. 6(1)(f).
     - Links: https://policies.google.com/privacy and
       https://policies.google.com/technologies/partner-sites
  7. **Advertising (Guild Ads)**:
     - Some installs show a Guild Ads banner instead of AdMob. Guild (guildads.com) is the sole
       controller of this data.
     - It receives the app-specific vendor identifier (IDFV, never the advertising identifier), ad
       impressions and clicks with the placement, and coarse device context: model, OS version,
       locale, time zone, app bundle ID and version.
     - The ads are contextual, with no cross-app tracking.
     - Legal basis: Art. 6(1)(f) GDPR.
     - Link: https://guildads.com
  8. **In-app purchases**: Easy Dice Pro and any future purchases are handled entirely by Apple. I
     receive no payment details or personal information, only anonymous sales reports. Link to Apple's
     privacy policy.
  9. **Settings stored on your device**: they stay on the device, and deleting the app removes them.
  10. **Contacting me**: email to apps@t-schmutz.de. Legal basis: Art. 6(1)(b) or (f) GDPR. The
      correspondence is kept as long as needed. Wording as in Karacho's policy.
  11. **Your rights**: Art. 15–18, 20 and 21 GDPR, and the right to complain to a supervisory
      authority.
  12. **Changes**: a new version appears on this page with a new date.
  13. **Contact**: apps@t-schmutz.de, and the Impressum link.

  Internal links in the Markdown pages use Liquid, for example `[Impressum]({{ '/impressum/' | relative_url }})`, because plain `/impressum/` would miss the baseurl. Jekyll renders Liquid in pages before Markdown.
- [x] Add `404.html` (`layout: prose`, `permalink: /404.html`, `title: Page not found`,
  `noindex: true`). The text says this page doesn't exist, followed by a "← Back to the apps" link.
  GitHub Pages serves this page for missing paths at any depth, so every link and asset must be
  root-relative through `relative_url`, never document-relative.
- [x] Add `robots.txt` with front matter and the content `User-agent: *`, `Allow: /`, and
  `Sitemap: {{ "/sitemap.xml" | absolute_url }}`.

*Verification script and README*
- [x] Add `scripts/check-site.mjs` (Node 22, built-ins only). It reads `baseurl` from `_config.yml`
  with a regex and checks `_site/`:
  - **Expected files**: `index.html`, `easy-dice/index.html`, `privacy-policy/index.html`,
    `impressum/index.html`, `404.html`, `sitemap.xml`, `robots.txt`, `assets/css/site.css`,
    `assets/js/site.js`.
  - **Absent**: `privacypolicy/`, `main.css`, `assets/portrait.jpg`, `_originals/`, `docs/`,
    `scripts/`.
  - **Internal links**: every `href`, `src`, `srcset` and `data-full` in every HTML file that isn't
    `http(s):`, `mailto:` or `tel:` must start with the baseurl. Strip it and resolve to a file
    (`/x/` → `x/index.html`). A `#fragment` must exist as an `id` in the target. Fragment-only links
    resolve within the same file.
  - **No third parties**: no `<script src>`, `<link rel=stylesheet|icon|preload>`, `<img src>`,
    `<source srcset>` or CSS `url(` whose value **starts with** `http:`, `https:` or `//`, in HTML or
    `site.css`. Data URIs such as the FAQ chevron mask contain `http://www.w3.org/2000/svg` and must not
    be flagged.
  - **Legal links**: every HTML page except 404 links to `/impressum/` and `/privacy-policy/`.
  - **Smart App Banner**: `easy-dice/index.html` contains
    `<meta name="apple-itunes-app" content="app-id=1514806286">`, and `index.html` does not.
  - **Accent contrast**: for every `_apps/*.md`, parse `accent` (and `on_accent`, default `#16161a`). The mix percentages and the background colours are constants at the top of the script, with a comment to keep them in sync with the `:root` tokens in `site.css`. and compute the ink
    colour with the sRGB `color-mix` formula:
    - light: 45% accent and 55% black, against the 7% accent tint over `#ffffff`;
    - dark: 80% accent and 20% white, against the 13% tint over `#0b0b0f`.

    Each ratio must be ≥ 4.5. `--on-accent` on the accent must also be ≥ 4.5.
  - **Size**: no file > 2 MiB.

  Print `✓`/`✗` lines and exit 1 on any failure.
- [x] Rewrite `README.md` with these sections:
  - what the site is (live URL; it will replace apps.t-schmutz.de);
  - how it deploys (classic GitHub Pages build from `master`, no Actions, `baseurl` and the later
    domain switch: set `baseurl: ""` and add the domain to `CNAME`);
  - local preview (`scripts/jekyll.sh serve` → http://localhost:4000/EasyDice-Web/; Docker required);
  - checks (`scripts/jekyll.sh build && node scripts/check-site.mjs`);
  - where content lives (a table);
  - the URL contract (`/privacy-policy/` and `/impressum/` are linked from App Store Connect and the
    apps and must stay);
  - adding an app (a step list, including image commands with `sips`);
  - editing legal texts (update "Last updated"; add new apps or services to the privacy table);
  - credits (Bootstrap Icons MIT; Apple badge guidelines).

  Remove all template text and the donation link. Keep `LICENSE` unchanged.

**Automated Verification**:
- [x] `scripts/jekyll.sh build` exits 0, and the output has no `Liquid Warning`, `Liquid Exception` or `Error` lines. The usual `jekyll-github-metadata` notices about API authentication are acceptable.
- [x] `node scripts/check-site.mjs` exits 0 with every Phase 1 check green: expected files, absent
  files, internal links, no third parties, legal links, Smart App Banner, accent contrast and size.
- [x] `grep -rniE "jquery|fontawesome|itunes.apple.com/lookup|googleapis" _site` finds nothing.
- [x] `git ls-files assets | grep -E "headerimage|playstore|squircle|screenshot/yourscreenshot"` finds
  nothing.
- [x] `sips -g pixelWidth -g pixelHeight assets/images/portrait.jpg` reports 640×640, and the file is
  < 120 KB.

**Manual Verification**:
- [ ] Run `scripts/jekyll.sh serve` and open `http://localhost:4000/EasyDice-Web/`. The hero, the
  tinted Easy Dice row and the contact cards match the mockup in light **and** dark mode (toggle the
  macOS appearance).
- [ ] At about 375 px wide (responsive mode), the hero is centred, the app row stacks, there is no
  horizontal scroll, and the touch targets are ≥ 44 px.
- [ ] The portrait crop looks good, with the face centred and not cut off.
- [ ] `/privacy-policy/` and `/impressum/` read well and show the correct address and phone number,
  and the policy's facts match the app.
- [ ] `/easy-dice/` in its reduced form shows the hero gradient, the tilted screenshot on desktop, and
  a badge that swaps black/white with the colour scheme and opens the App Store listing.
- [ ] `http://localhost:4000/EasyDice-Web/does-not-exist` shows the styled 404 with working CSS.

### Phase 2: Full Easy Dice showcase

Dependencies: Phase 1

This phase completes the app page: the screenshot carousel with lightbox, feature cards, Support FAQ,
and header nav. It also extends the check script for app-page invariants.

**Tasks**:
- [x] Create the remaining screenshot assets in `assets/apps/easy-dice/screenshots/`, mapping source
  to target as follows:

  | Source `iPhone 17 Pro Max-…` | Target |
  |---|---|
  | `1-page.png` | `01-single-d6.jpg` (already made in Phase 1) |
  | `2-page.png` | `02-wood-d10.jpg` |
  | `3-page.png` | `03-dice-picker.jpg` |
  | `4-page.png` | `04-four-dice.jpg` |
  | `5-page.png` | `05-dark-dice.jpg` |
  | `6-page.png` | `06-six-dice.jpg` |
  | `7-settings.png` | `07-settings.jpg` |
  | `8-settings.png` | `08-backgrounds.jpg` |

  First run `mkdir -p assets/apps/easy-dice/screenshots/thumbs`. Then, for each, make the full image with
  `sips -s format jpeg -s formatOptions 82 <src> --out screenshots/<target>`, and the thumbnail with
  `sips -s format jpeg -s formatOptions 78 --resampleWidth 600 <src> --out screenshots/thumbs/<target>`.
  If a full JPG is > 1.5 MiB (the wood and galaxy textures), drop it to quality 72.
- [x] Extend `_layouts/app.html`:
  - **`#screenshots`**: a section header, then `.screenshots-container` with prev/next arrow buttons
    (`chevron-left`/`chevron-right`, hidden < 768 px) and a `.screenshots-scroll` scroll-snap row.
    For each `page.screenshots` entry, output a `<a class="screenshot-trigger" href="{full}"
    data-full="{full}" data-caption="{caption}">` wrapping
    `<img src="{thumb}" width="600" height="1303" alt="{alt}" loading="lazy" decoding="async">`, with a
    `<figcaption>` beneath showing the caption. All URLs go through `relative_url`. Being an `<a>`, it
    still opens the full image without JS.
  - **`#features`**: a section header, then a 3-column grid (1 column < 56 rem) of `.feature-card`
    elements. Each has an icon tile (accent tint background, accent border at 30%, icon in
    `--accent-ink`), an `h3` and the text.
  - **`#support`**: a section header with the description, the email linked as `mailto:`, then an
    accordion of `<details name="faq" class="faq-item"><summary>{q}</summary><div class="faq-body"><p>{a}</p></div></details>`.
    The answers go through `markdownify`, with the wrapping `<p>`/`</p>` removed via `remove`, so Markdown links in answers render. The answers mentioning the email address write it as `[apps@t-schmutz.de](mailto:apps@t-schmutz.de)`, because kramdown does not auto-link bare addresses. Root-relative links in answers (such as `/privacy-policy/`) are rewritten after `markdownify` with `replace: 'href="/', base_href`, where `{% capture base_href %}href="{{ site.baseurl }}/{% endcapture %}`, so they get the baseurl.
  - **Lightbox**: `<dialog class="lightbox" aria-labelledby="lightbox-caption">` with an `h2` caption,
    a close button (`x-lg` icon) and an `<img class="lightbox-image">`.
- [x] Fill the `app-header.html` nav with Features (`#features`), Screenshots (`#screenshots`) and
  Support (`#support`). The links are fragment-only because they only exist on the app page.
- [x] Extend `assets/js/site.js`, porting Karacho's `Screenshots.astro` and `Lightbox.astro` scripts:
  - carousel arrows: `scrollBy` one card width plus the 24 px gap, with `behavior: 'smooth'`, or
    `'auto'` when reduced motion is preferred;
  - lightbox: `preventDefault` on trigger click, clear the `src`, set the new src, alt and caption,
    then call `showModal()`; close on the button, on a backdrop click, or on Esc (native);
  - `html:has(dialog[open]) { overflow: hidden }` in CSS.
- [x] Add the Phase 2 CSS sections, ported from Karacho `site.css` and retokenised:
  - **Screenshots**: `--surface` section background, extra top padding ≥ 992 px for the hanging hero
    image, 300 px images (240 px < 768 px), `border-radius: 1.5rem`, shadow, hover lift, captions in
    `--text-muted` at 0.875 rem, centred.
  - **Lightbox**: `max-width: 500px`, `--bg` background, `::backdrop` at `rgb(0 0 0 / .6)`.
  - **Features**: cards in `--surface-raised` with a border and hover lift.
  - **FAQ**: grouped corners, the chevron mask, rotation when open.
- [x] Extend `scripts/check-site.mjs`:
  - **Screenshots match**: for **every** `_apps/<slug>.md`, the `file:` entries (parsed with a regex on
    `file: … .jpg`) equal the `.jpg` files in `assets/apps/<slug>/screenshots/` and in `thumbs/`, as
    sorted sets. `hero.image` must be one of them.
  - **App page anchors**: every `<slug>/index.html` contains `id="features"`, `id="screenshots"`,
    `id="support"` and `id="download"`, and each nav link resolves. The existing fragment check covers
    this; assert the ids explicitly too, because the App Store support URL may later point at
    `/easy-dice/#support`.
  - **Lightbox targets**: every `data-full` resolves (already covered by the link check; keep it in the
    attribute list).
  - **Image sizes**: every screenshot JPG is ≤ 1.5 MiB and every thumbnail ≤ 200 KiB.
- [x] Update `README.md`: describe the screenshot naming and captions, the asset commands, and the
  checks the script runs.

**Automated Verification**:
- [x] `scripts/jekyll.sh build` exits 0, and the output has no `Liquid Warning`, `Liquid Exception` or `Error` lines.
- [x] `node scripts/check-site.mjs` exits 0, including the new checks: screenshots match, app-page
  anchors and image sizes.
- [x] `ls assets/apps/easy-dice/screenshots/*.jpg | wc -l` and
  `ls assets/apps/easy-dice/screenshots/thumbs/*.jpg | wc -l` both print 8.
- [x] `grep -c 'class="faq-item"' _site/easy-dice/index.html` prints 7, and
  `grep -c 'class="feature-card"' _site/easy-dice/index.html` prints 6.

**Manual Verification**:
- [ ] On `/easy-dice/` in light and dark mode: the carousel scrolls by trackpad and touch and the arrows
  step one card. Clicking a screenshot opens the lightbox with the right image and caption. Esc, the
  close button and a backdrop click all close it, and the page does not scroll behind it.
- [ ] With JS disabled, clicking a screenshot opens the full JPG, the mobile nav is reachable, and the
  FAQ still opens and closes.
- [ ] The header nav links scroll to their sections without the sticky header covering the headings.
  On a phone, the hamburger opens and closes the nav and a link tap closes it.
- [ ] Opening one FAQ entry closes the other open one (`details name`). Review all FAQ answers and
  feature texts for accuracy (Pro, Apple Watch, settings names).
- [ ] After pushing to `master`, the GitHub Pages build succeeds (repo → Settings → Pages / Actions
  "pages build and deployment"), and `https://alschmut.github.io/EasyDice-Web/`,
  `/easy-dice/`, `/privacy-policy/` and `/impressum/` all load with CSS, images and working links.

## Implementation Notes

During implementation, document user feedback, problems, and decisions here.

- Phase 1 deviations: `theme: null` in `_config.yml` (stops Pages adding its default theme CSS); `jekyll.sh` uses `-it` only with a TTY; `icon.html` maps `email` to the `envelope` icon; the app-row icon link is `tabindex=-1`/`aria-hidden` because the CTA link below goes to the same page; Mixpanel and Sentry are named with city and country only.
- Phase 2 deviations: the carousel and feature grid are `<ul>`/`<li>`; features have 2 columns between 40 and 56 rem; a modifier-click on a screenshot opens the image normally instead of the lightbox; the carousel arrows are centred on the images.
- Thumbnails resample to 600×1303 (not 1304), so the `<img>` height attribute is 1303. Thumbnails 02 and 06 use quality 70 to stay ≤ 200 KiB.
- Out of scope (follow-ups):
  - repository rename;
  - pointing apps.t-schmutz.de at this repository (set `baseurl: ""`, add `CNAME`, DNS);
  - changing App Store Connect URLs (not needed if the paths are kept);
  - Tear Tales and App Analytics pages;
  - updating the in-app privacy URL from `http://` to `https://`.

## References

- Reference site, main page: `/Users/alexander.schmutz/Documents/Projects-private/PeterWebsite/app-site-main`
  (`src/layouts/Base.astro`, `src/components/{Hero,AppRow,ContactSheet,Footer}.astro`, `src/pages/{privacy,imprint}.astro`)
- Reference site, app page: `/Users/alexander.schmutz/Documents/Projects-private/PeterWebsite/karacho-web-main`
  (`src/styles/site.css`, `src/components/*.astro`, `src/data/site.ts`, `src/pages/privacy.md`, `scripts/check-dist.mjs`)
- Easy Dice App Store metadata: `/Users/alexander.schmutz/Documents/Projects-private/EasyDice/fastlane/metadata/en-GB/`
- Easy Dice SDK usage: `EasyDice/Common/Adapter/AnalyticsAdapter.swift`, `EasyDice/Pager/AdvertBannerView.swift`,
  `EasyDice/Common/Store/UserSettings.swift`, `EasyDice.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`
- Screenshots: `/Users/alexander.schmutz/Documents/Projects-private/AppAssets/EasyDice/version_1_14_0/en-GB/iPhone 17 Pro Max-*.png`
- Current WordPress pages to be replaced: http://apps.t-schmutz.de/privacy-policy, http://apps.t-schmutz.de/impressum
- GitHub Pages dependency versions: https://pages.github.com/versions.json
- Guild Ads SDK privacy section: https://github.com/Guild-Ads/guild-ads-ios#privacy
- Bootstrap Icons (MIT): https://icons.getbootstrap.com
