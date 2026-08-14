# raghavendra80.github.io

Personal site for Raghavendra Ramesh — built with [Astro](https://astro.build), deployed on GitHub Pages.

## Stack

- **Astro** (static output) — pages in `src/pages/`, shared layout/components in `src/layouts/` and `src/components/`, client-side scripts (canvas hero, command palette, typing effect, scroll reveals) in `src/scripts/`.
- **No GitHub Actions.** The site builds locally and the output is committed straight into `docs/`, which GitHub Pages serves directly (source: `master` branch, `/docs` path). This sidesteps GitHub's own build pipeline entirely.

## Development

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # builds to docs/
npm run preview   # serves the built docs/ output locally
```

## Deploying

Just commit and push. A `pre-commit` git hook (`.githooks/pre-commit`) runs `npm run build` and stages the fresh `docs/` output as part of every commit — if the build fails, the commit is aborted, so `master` never contains a broken build. `git push` ships it; GitHub Pages serves whatever is in `docs/` on `master`, no separate deploy step.

If you're cloning this repo fresh, point git at the tracked hooks directory once:

```bash
git config core.hooksPath .githooks
```

## Content

- `/` — home/about
- `/publications/` — BibBase-embedded bibliography (sourced from `public/files/conf.bib` and `public/files/pre.bib`)
- `/whitepapers/` — Supra whitepapers
- `/blog/` — external blog post links
- `/talks/` — talks & videos
- `/cv/` — career history
