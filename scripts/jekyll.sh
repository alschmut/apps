#!/bin/sh
# Builds or serves the site in Docker with the Ruby version GitHub Pages uses.
#   scripts/jekyll.sh build   → _site/
#   scripts/jekyll.sh serve   → http://localhost:4000/EasyDice-Web/
# Gems are cached in the named Docker volume "easydice-web-gems".
set -eu

CMD="${1:-build}"
shift 2>/dev/null || true
PORTS=""
ARGS="$*"

case "$CMD" in
  build) ;;
  serve)
    PORTS="-p 4000:4000"
    # Inside the container Jekyll would bind to 127.0.0.1, and file events
    # don't cross the bind mount reliably.
    ARGS="--host 0.0.0.0 --force_polling $ARGS"
    ;;
  *)
    echo "usage: $0 build|serve [jekyll options]" >&2
    exit 2
    ;;
esac

cd "$(dirname "$0")/.."

# An interactive terminal gets -it, so Ctrl-C stops `serve`; CI and scripts run without a TTY.
TTY=""
if [ -t 0 ] && [ -t 1 ]; then TTY="-it"; fi

# shellcheck disable=SC2086
exec docker run --rm ${TTY} -v "$PWD":/srv/site -v easydice-web-gems:/usr/local/bundle -w /srv/site \
  -e PAGES_REPO_NWO=alschmut/EasyDice-Web \
  ${PORTS} ruby:3.3 sh -c "bundle install --quiet && bundle exec jekyll $CMD $ARGS"
