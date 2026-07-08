# AGENTS.md

## Commands

- Use `make` as the source of truth; there are no npm package scripts.
- Full local build: `RESUME_EMAIL='email@example.com' RESUME_PHONE='+1 (555) 999-0000' make`
- Individual targets: `make web`, `make pdf`, `make markdown`, `make test`, `make clean`
- Build another resume source with `make RESUME_FILE=path/to/resume.md`.
- Run tests with `make test` or `./tests/test-suite.js`.
- To verify built web contact obfuscation, run `./tests/test-web-obfuscation.js` after `make web` with `RESUME_EMAIL` and `RESUME_PHONE` in the environment.

## Build Gotchas

- `RESUME_EMAIL` and `RESUME_PHONE` must come from the environment; the `Makefile` intentionally rejects them as make arguments.
- Contact values are kept out of frontmatter and public source. `scripts/read-vars.js` deletes frontmatter contact values and only accepts environment values.
- Keep plaintext `RESUME_EMAIL`, `RESUME_PHONE`, and derived values such as `RESUME_PHONE_HREF` out of logs and public web build files unless obfuscated; this is crawler resistance for public surfaces like GitHub Actions logs and deployed web assets.
- `pdf` uses Pandoc with `--pdf-engine=weasyprint`; keep `weasyprint` available for real PDF builds.
- Generated artifacts go under `build/`, which is ignored. Do not edit generated files as source.

## Testing

- Add tests for new features. Prefer too many regression tests over too few.
- Add new resume fixtures under `tests/fixtures/` when a focused test case needs source content beyond `tests/fixtures/test-resume.md`.
- Do not pull names, employers, links, project details, or other resume content from `resume.md` when building tests; use neutral fixture data instead.

## Structure

- `resume.md` is the main source; `RESUME_NAME` and `RESUME_LATEST_URL` live in frontmatter.
- Custom fenced blocks such as `resume-entry`, `skill-entry`, `contact-list`, `tag-line`, and `resume-footer` are rendered by `pandoc/filters/resume-entry.lua`.
- Web output copies CSS/fonts into `build/web/assets`, writes `build/web/index.html`, and obfuscates contact data via `scripts/obfuscate-html-contacts.js`.
- Cloudflare deploy serves `build/web` as Wrangler assets; see `wrangler.jsonc` and `.github/workflows/build-web.yml`.
