# Alexander Schmutz — Apps (website)

See `README.md` for how the site is built, previewed, checked and deployed.

## Git: trunk-based development on main

- Commit directly on `main`. Don't create feature branches, and don't open pull requests unless asked.
- Keep commits small and self-contained, so `main` is always deployable.
- A push to `main` deploys the site through GitHub Pages, so push only when asked.
- Before committing, run the checks: `engine/scripts/jekyll.sh build && node engine/scripts/check-site.mjs`
  (needs Docker, e.g. Colima).
