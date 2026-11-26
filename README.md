# Alexander Schmutz — Apps

The website for all of Alexander Schmutz's apps for iPhone, iPad and Apple Watch: a main page with a
short introduction, the list of apps and contact details, one page per app (starting with
[Easy Dice](https://alschmut.github.io/apps/en/easy-dice/) and
[Tear Tales](https://alschmut.github.io/apps/en/tear-tales/)), and one shared privacy policy and
Impressum. Every page is in English (`/en/…`) and German (`/de/…`); see "Languages".

Live: <https://alschmut.github.io/apps/>. The site will later replace the WordPress site at
apps.t-schmutz.de.

## How it deploys

A push to `main` deploys the site through GitHub Pages' classic Jekyll build ("Deploy from a branch").
The only GitHub Actions workflow, `.github/workflows/rebuild.yml`, asks Pages to rebuild every night (see
"Before an app is on the App Store"). Pages builds with its own pinned versions (Jekyll 3.10, the
`github-pages` gem and its whitelisted plugins; this site uses `jekyll-sitemap`).

The site currently lives under the `baseurl` `/apps`. Every internal link and asset goes through
Jekyll's `relative_url` filter, so switching to a custom domain needs two changes only:

1. set `baseurl: ""` in `_config.yml`;
2. put the domain (for example `apps.t-schmutz.de`) into `CNAME` and point its DNS at GitHub Pages.

## Local preview

Docker is required: the local Ruby differs from the one GitHub Pages uses, so the site is built in a
`ruby:3.3` container. Gems are cached in the Docker volume `easydice-web-gems`.

```sh
engine/scripts/jekyll.sh serve   # http://localhost:4000/apps/  (rebuilds on change)
engine/scripts/jekyll.sh build   # writes _site/
```

## Checks

```sh
engine/scripts/jekyll.sh build && node engine/scripts/check-site.mjs
```

`engine/scripts/check-site.mjs` (Node 22, no dependencies) checks the build in `_site/`:

- the expected pages and files exist, and old or private paths (`/privacypolicy/`, `_originals/`,
  `docs/`, `scripts/`, `engine/`, `data/`, …) are not published;
- every internal `href`, `src` and `srcset` starts with the `baseurl` and resolves to a
  file, including `#fragment` targets;
- nothing is loaded from a third party (scripts, stylesheets, icons, images, CSS `url()`);
- every page in a language links to the Impressum and the privacy policy in that language, has
  `<html lang>` set, and its language menu links to the same page in every language; every old path
  without a language (`/`, `/impressum/`, `/easy-dice/`, …) redirects to `/<language>/` + that path;
- the Smart App Banner tag is on each app page in every language and not on the main pages;
- every app has one file per language, and they agree on everything but the texts (order, name,
  accent, icons, App Store id, release date, flags, hero image and screenshot files);
- for every app file in `data/<language>/apps/`, the `file:` entries under `screenshots:` and `screenshots_ipad:` are exactly the
  `.jpg` files in `assets/apps/<id>/screenshots/` (or `screenshots/<language>/` with
  `screenshots_lang`; the carousel's in `framed/` below it with `framed_screenshots: true`), and
  `hero.image` is one of the plain ones;
- every app page has the anchors `#features`, `#screenshots`, `#support` and `#download` (the header nav
  links to them, and the App Store support URL may point at `/<id>/#support`); a past app
  (`discontinued: true`) has `#features`, `#screenshots` and `#retired` instead, and no Smart App Banner;
  an app that is not released yet (`coming_soon: true`) has no Smart App Banner;
- every screenshot is at most 200 KiB;
- every app's accent colour, as text, has a contrast of at least 4.5:1 in light and dark mode, and the
  text on accent-coloured buttons too (or on the `button` colour, if the app sets one);
- no file is larger than 2 MiB.

## Where content lives

The repository has three parts: `data/` holds the content as plain YAML and Markdown, `assets/` the
images, styles and script, and `engine/` the templates and scripts that turn both into the site.

| What | Where |
|---|---|
| Name, portrait, contact channels, legal links, copyright year, languages | `data/site.yml` |
| The fixed texts of the templates (buttons, labels, tagline, intro, contact lead, badges, date format) | `data/i18n/<language>.yml` (`en.yml`, `de.yml`) |
| Everything about one app: name, texts, accent colour, App Store id, hero, features, FAQ, screenshots | `data/<language>/apps/<id>.md` (front matter only) |
| Main page | `data/<language>/index.md` (title and description; its texts are in `data/i18n/<language>.yml`) |
| Privacy policy | `data/<language>/privacy-policy.md` |
| Impressum | `data/<language>/impressum.md` |
| Old paths without a language, which redirect | `data/redirects/` |
| Not-found page (both languages) | `data/404.md` |
| App icons and screenshots | `assets/apps/<id>/` (German screenshots in `screenshots/de/`) |
| Styles (plain CSS, light and dark) | `assets/css/site.css` |
| Script (screenshot carousel arrows, language menus) | `assets/js/site.js` |
| Page structure | `engine/layouts/` (`base`, `home`, `app`, `prose`, `not-found`, `redirect`) and `engine/includes/` |
| Build, preview and checks | `engine/scripts/` |
| Site settings (URL, baseurl, folders) | `_config.yml` (GitHub Pages reads it from the root) |

The app files end in `.md` although they only hold YAML: GitHub Pages' Jekyll makes a page only from a
page file, not from a data file. Every file in `data/<language>/apps/` becomes the page
`/<language>/<file name>/`; the file name is the app's id. Jekyll reserves `name` for the file name, so an app's name is `app_name`.

## URL contract

| Path | Content |
|---|---|
| `/en/`, `/de/` | main page |
| `/en/<app id>/`, e.g. `/de/easy-dice/` | app page |
| `/en/privacy-policy/`, `/de/privacy-policy/` | privacy policy |
| `/en/impressum/`, `/de/impressum/` | Impressum |
| `/`, `/<app id>/`, `/privacy-policy/`, `/impressum/` | redirect to the same page in a language |
| `/404.html`, `/sitemap.xml`, `/robots.txt` | not-found page and files for search engines |

`/privacy-policy/` and `/impressum/` are linked from App Store Connect and from inside the apps (for
example Easy Dice's Settings), and the App Store support URL may point at `/<app id>/#support`. They
keep the paths of the old WordPress site and **must keep working**: each is a small page in
`data/redirects/` that sends the visitor on (see "Languages").

## Languages

The site is in English and German. `data/site.yml` lists the languages; each one has its pages in
`data/<code>/`, with the same file names, and the texts of the templates in `data/i18n/<code>.yml`.
A page and its translation share their path after the language (`/en/impressum/` and
`/de/impressum/`), so the language menu in the footer links from every page to the same page in the
other language.

The old paths without a language (`data/redirects/`) send the visitor to `/de/…` or `/en/…`: the
language last chosen in a language menu (kept in the browser's local storage), else the first English or
German language of the browser, else English. A `#fragment` such as `#support` is kept. Without
JavaScript they go to English.

German app pages set `screenshots_lang: de` and show the German App Store screenshots from
`assets/apps/<id>/screenshots/de/` (and `de/framed/`), under the same file names as the English ones.
App Analytics was only in English, so its German page shows the English screenshots. The German pages
show Apple's German download badge; Apple has no German pre-order badge, so the English one stays.

When you change a text, change it in both languages. The checks make sure every app has a file in
each language and that both agree on everything but the texts.

## Adding an app

1. Pick an id, for example `my-app`. It becomes the URLs `/en/my-app/` and `/de/my-app/` and the asset
   folder.
2. Copy `data/en/apps/easy-dice.md` to `data/en/apps/my-app.md` and fill in its front matter: `order` (position
   on the main page), `app_name`, `title`, `description`, `tagline`, `accent`, the `icon*` paths, `app_store_id`,
   `app_store_url`, `hero`, `sections`, `features`, `faq` and `screenshots`. The buttons are in the accent
   colour with black text; to give them other colours, for example the icon's, set both `button` and
   `on_button` (see `data/en/apps/family-tree.md`). Then do the same in German in
   `data/de/apps/my-app.md`, with the same facts and `screenshots_lang: de` if there are German
   screenshots, and add a redirect `data/redirects/my-app.md` (`permalink: /my-app/`).
3. Make the icons from the 1024 px App Store icon:

   ```sh
   mkdir -p assets/apps/my-app/screenshots
   for n in 256 180 64; do
     sips -s format png -Z $n "AppIcon-1024.png" --out assets/apps/my-app/icon-$n.png
   done
   ```

4. Make each screenshot as a 600 px wide JPG. Name the files
   `NN-short-description.jpg` (`01-single-d6.jpg`, `02-wood-d10.jpg`, …). The carousel follows the
   order of the `screenshots:` list; the number keeps the folder in the same order. Each entry there has the `file`, an `alt` text describing the image, and a
   `caption` that is shown under the image. `hero.image` names the one used in the
   hero.

   ```sh
   sips -s format jpeg -s formatOptions 78 --resampleWidth 600 "screenshot.png" \
     --out assets/apps/my-app/screenshots/01-name.jpg
   ```

   If a JPG is larger than 200 KiB (photographic backgrounds such as wood or a starry sky), make it
   again with `formatOptions 70`. The layout assumes iPhone screenshots of 1320 × 2868 px, which
   become 600 × 1303 px; for another aspect ratio, adjust the `height` of the screenshot `<img>` in `engine/layouts/app.html`.

   To show the framed App Store screenshots in the carousel, set `framed_screenshots: true` and put them, made
   the same way, in `assets/apps/my-app/screenshots/framed/` under the same file names; leave out the
   `caption`s, as each framed screenshot has its title. The hero and the main page keep the plain screenshots.

   For an iPad app, add iPad screenshots as 900 px wide JPGs named `ipad-NN-….jpg` and list them under
   `screenshots_ipad:`; they go in `screenshots/framed/` with `framed_screenshots`. The carousel then shows an
   iPhone / iPad picker above it. For landscape iPad screenshots, make them 1200 px wide and set
   `ipad_landscape: true`.

   German screenshots go in `assets/apps/my-app/screenshots/de/` (and `de/framed/`), made the same way
   from the `de-DE` App Store screenshots, under the same file names.

5. Add the app's services to the table in both privacy policies (see below).
6. Add the app's page to `PAGES` and, if it is on the App Store, its id to `APP_STORE_IDS` in
   `engine/scripts/check-site.mjs`, then run the checks. The main page lists the new app automatically; no layout or CSS change is needed.

### Before an app is on the App Store

Set `coming_soon: true` and leave out `app_store_id` and `app_store_url` (see `data/en/apps/family-tree.md`).
The page and the main page then show "Coming soon" in place of the App Store badge, and the "Get the app"
button is hidden.

Once it is up for pre-order, add both fields, remove the flag, set `release_date` (for example
`release_date: 2026-12-20`), add `sections.download_preorder` (`title`, `text`), and move the page in
`engine/scripts/check-site.mjs` to the list of pages with a Smart App Banner (see `data/en/apps/family-tree.md`).
Until that date the page shows the "Pre-order on the App Store" badge with "Arrives on" and the release date
in place of the download badge, "Pre-Order Now" in place of the "Get the app" button, the download card is made from `sections.download_preorder`, and the main page
shows a "Pre-order" label. From the release date on (in the `timezone` of `_config.yml`), it looks like
any other app.

Pages only rebuilds the site on a push, so `.github/workflows/rebuild.yml` asks it to rebuild every
night shortly after midnight (Berlin time); the switch then happens without a push. It can also be run by
hand under Actions. GitHub pauses scheduled workflows in a repository without activity for 60 days.

### When an app leaves the App Store

Set `discontinued: true` in its front matter and remove `app_store_id` and `app_store_url` (see
`data/en/apps/app-analytics.md`). The main page then lists it under "Past projects" with a "No longer
available" label, and its page shows "No longer on the App Store" in place of the App Store badge,
drops the support section and the "Get the app" button, and ends with a card made from
`sections.retired` (`title`, `text`) in place of the download card. Update `engine/scripts/check-site.mjs`,
which lists the app pages with and without a Smart App Banner.

## Editing the legal texts

- The legal texts exist in English and German (`data/en/` and `data/de/`); change both.
- When the privacy policy changes, update its "Last updated" / "Stand" date.
- When an app is added or starts using another service (analytics, crash reports, ads, purchases), add it
  to the "Which app uses what" table and describe the service in its own section.
- Internal links in the Markdown pages use Liquid, for example
  `[Impressum]({{ '/en/impressum/' | relative_url }})`, so they keep working with the `baseurl`.

## Credits

- Icons: [Bootstrap Icons](https://icons.getbootstrap.com) (MIT licence), inlined as SVG in
  `engine/includes/icon.html`.
- The App Store badges (English and German) are used according to
  [Apple's App Store marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/).
- Code licensed under the MIT licence, see `LICENSE`. Texts, portrait, app icons and screenshots
  © Alexander Schmutz.
