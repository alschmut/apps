# Alexander Schmutz — Apps

The website for all of Alexander Schmutz's apps for iPhone, iPad and Apple Watch: a main page with a
short introduction, the list of apps and contact details, one page per app (starting with
[Easy Dice](https://alschmut.github.io/apps/easy-dice/) and
[Tear Tales](https://alschmut.github.io/apps/tear-tales/)), and one shared privacy policy and
Impressum.

Live: <https://alschmut.github.io/apps/>. The site will later replace the WordPress site at
apps.t-schmutz.de.

## How it deploys

A push to `master` deploys the site through GitHub Pages' classic Jekyll build ("Deploy from a branch").
There is no GitHub Actions workflow; Pages builds with its own pinned versions (Jekyll 3.10, the
`github-pages` gem and its whitelisted plugins; this site uses `jekyll-sitemap`).

The site currently lives under the `baseurl` `/apps`. Every internal link and asset goes through
Jekyll's `relative_url` filter, so switching to a custom domain needs two changes only:

1. set `baseurl: ""` in `_config.yml`;
2. put the domain (for example `apps.t-schmutz.de`) into `CNAME` and point its DNS at GitHub Pages.

## Local preview

Docker is required: the local Ruby differs from the one GitHub Pages uses, so the site is built in a
`ruby:3.3` container. Gems are cached in the Docker volume `easydice-web-gems`.

```sh
scripts/jekyll.sh serve   # http://localhost:4000/apps/  (rebuilds on change)
scripts/jekyll.sh build   # writes _site/
```

## Checks

```sh
scripts/jekyll.sh build && node scripts/check-site.mjs
```

`scripts/check-site.mjs` (Node 22, no dependencies) checks the build in `_site/`:

- the expected pages and files exist, and old or private paths (`/privacypolicy/`, `_originals/`,
  `docs/`, `scripts/`, …) are not published;
- every internal `href`, `src`, `srcset` and `data-full` starts with the `baseurl` and resolves to a
  file, including `#fragment` targets;
- nothing is loaded from a third party (scripts, stylesheets, icons, images, CSS `url()`);
- every page except the 404 page links to the Impressum and the privacy policy;
- the Smart App Banner tag is on each app page and not on the main page;
- for every app in `_apps/`, the `file:` entries under `screenshots:` are exactly the `.jpg` files in
  `assets/apps/<id>/screenshots/` and in its `thumbs/` folder, and `hero.image` is one of them;
- every app page has the anchors `#features`, `#screenshots`, `#support` and `#download` (the header nav
  links to them, and the App Store support URL may point at `/<id>/#support`);
- every full-size screenshot is at most 1.5 MiB and every thumbnail at most 200 KiB;
- every app's accent colour, as text, has a contrast of at least 4.5:1 in light and dark mode, and the
  text on accent-coloured buttons too;
- no file is larger than 2 MiB.

## Where content lives

| What | Where |
|---|---|
| Name, tagline, intro, portrait, contact channels, legal links, copyright year | `_data/site.yml` |
| Everything about one app: name, texts, accent colour, App Store id, hero, features, FAQ, screenshots | `_apps/<id>.md` (front matter) |
| App icons and screenshots | `assets/apps/<id>/` |
| Privacy policy | `privacy-policy.md` |
| Impressum | `impressum.md` |
| Not-found page | `404.html` |
| Page structure | `_layouts/` (`base`, `home`, `app`, `prose`) and `_includes/` |
| Styles (plain CSS, light and dark) | `assets/css/site.css` |
| Script (navigation toggle, screenshot carousel arrows, lightbox) | `assets/js/site.js` |
| Site settings (URL, baseurl, collections) | `_config.yml` |
| Unpublished originals (full-size portrait) | `_originals/` |

## URL contract

| Path | Content |
|---|---|
| `/` | main page |
| `/<app id>/`, e.g. `/easy-dice/` | app page |
| `/privacy-policy/` | privacy policy |
| `/impressum/` | Impressum |
| `/404.html`, `/sitemap.xml`, `/robots.txt` | not-found page and files for search engines |

`/privacy-policy/` and `/impressum/` are linked from App Store Connect and from inside the apps (for
example Easy Dice's Settings). They keep the paths of the old WordPress site and **must not change**.

## Adding an app

1. Pick an id, for example `my-app`. It becomes the URL `/my-app/` and the asset folder.
2. Copy `_apps/easy-dice.md` to `_apps/my-app.md` and fill in its front matter: `order` (position on the
   main page), `name`, `title`, `description`, `tagline`, `accent` (and `on_accent` if dark text on the
   accent is hard to read), the `icon*` paths, `app_store_id`, `app_store_url`, `hero`,
   `sections`, `features`, `faq` and `screenshots`.
3. Make the icons from the 1024 px App Store icon:

   ```sh
   mkdir -p assets/apps/my-app/screenshots/thumbs
   for n in 256 180 64; do
     sips -s format png -Z $n "AppIcon-1024.png" --out assets/apps/my-app/icon-$n.png
   done
   ```

4. Make each screenshot as a full-size JPG and a 600 px thumbnail with the same name. Name the files
   `NN-short-description.jpg` (`01-single-d6.jpg`, `02-wood-d10.jpg`, …). The carousel follows the
   order of the `screenshots:` list; the number keeps the folder in the same order. Each entry there has the `file`, an `alt` text describing the image, and a
   `caption` that is shown under the image and in the lightbox. `hero.image` names the one used in the
   hero.

   ```sh
   sips -s format jpeg -s formatOptions 82 "screenshot.png" --out assets/apps/my-app/screenshots/01-name.jpg
   sips -s format jpeg -s formatOptions 78 --resampleWidth 600 "screenshot.png" \
     --out assets/apps/my-app/screenshots/thumbs/01-name.jpg
   ```

   If a full JPG is larger than 1.5 MiB (photographic backgrounds such as wood or a starry sky), make
   it again with `formatOptions 72`; if a thumbnail is larger than 200 KiB, use `formatOptions 70`.
   The layout assumes iPhone screenshots of 1320 × 2868 px, whose thumbnails are 600 × 1303 px; for
   another aspect ratio, adjust the `height` of the screenshot `<img>` in `_layouts/app.html`.

5. Add the app's services to the table in `privacy-policy.md` (see below).
6. Run the checks. The main page lists the new app automatically; no layout or CSS change is needed.

## Editing the legal texts

- When the privacy policy changes, update its "Last updated" date.
- When an app is added or starts using another service (analytics, crash reports, ads, purchases), add it
  to the "Which app uses what" table and describe the service in its own section.
- Internal links in the Markdown pages use Liquid, for example
  `[Impressum]({{ '/impressum/' | relative_url }})`, so they keep working with the `baseurl`.

## Credits

- Icons: [Bootstrap Icons](https://icons.getbootstrap.com) (MIT licence), inlined as SVG in
  `_includes/icon.html`.
- The App Store badge is used according to
  [Apple's App Store marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/).
- Code licensed under the MIT licence, see `LICENSE`. Texts, portrait, app icons and screenshots
  © Alexander Schmutz.
