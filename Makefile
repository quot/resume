PANDOC ?= pandoc
SOURCE ?= resume.md
BUILD_DIR ?= build
WEB_DIR ?= $(BUILD_DIR)/web
WEB_ASSETS_DIR ?= $(WEB_DIR)/assets
BASENAME ?= resume
BUILD_SOURCE ?= $(BUILD_DIR)/$(BASENAME).rendered.md
STYLESHEET ?= assets/styles/resume.css
PDF_STYLESHEET ?= assets/styles/resume-pdf.css
RESUME_ENTRY_FILTER ?= pandoc/filters/resume-entry.lua

# Contact values intentionally come from build-time secrets so the public repo
# can contain the resume source without publishing email or phone values.
ifeq ($(origin RESUME_EMAIL),command line)
$(error RESUME_EMAIL must be provided through the environment, not as a make argument)
endif

ifeq ($(origin RESUME_PHONE),command line)
$(error RESUME_PHONE must be provided through the environment, not as a make argument)
endif

.PHONY: all web pdf markdown test clean FORCE
.INTERMEDIATE: $(BUILD_SOURCE)

all: web pdf markdown

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUILD_SOURCE): $(SOURCE) scripts/render-resume.js FORCE | $(BUILD_DIR)
	./scripts/render-resume.js $(SOURCE) $(BUILD_SOURCE)
	@latest_url="$$(node -e 'const { readVars } = require("./scripts/read-vars"); process.stdout.write(readVars(process.argv[1]).RESUME_LATEST_URL || "")' "$(SOURCE)")"; \
	if [ -z "$$latest_url" ]; then \
		printf 'Missing RESUME_LATEST_URL in frontmatter of $(SOURCE).\n' >&2; \
		exit 1; \
	fi; \
	printf '\n```resume-footer\n{"date":"%s","url":"%s"}\n```\n' "$$(date +%Y-%m-%d)" "$$latest_url" >> $(BUILD_SOURCE)

$(WEB_DIR):
	mkdir -p $(WEB_DIR)

web: $(WEB_DIR)
	mkdir -p $(WEB_ASSETS_DIR)/styles $(WEB_ASSETS_DIR)/fonts/Lato
	cp $(STYLESHEET) $(WEB_ASSETS_DIR)/styles/resume.css
	cp web/headers.txt $(WEB_DIR)/_headers
	cp assets/fonts/Lato/*.ttf $(WEB_ASSETS_DIR)/fonts/Lato/
	@set -e; \
	if [ -z "$$RESUME_EMAIL" ]; then \
		printf 'Missing RESUME_EMAIL; provide it through the environment.\n' >&2; \
		exit 1; \
	fi; \
	if [ -z "$$RESUME_PHONE" ]; then \
		printf 'Missing RESUME_PHONE; provide it through the environment.\n' >&2; \
		exit 1; \
	fi; \
	tmp_source="$$(mktemp "$(BUILD_DIR)/web.source.XXXXXX")"; \
	tmp_html="$$(mktemp "$(BUILD_DIR)/web.html.XXXXXX")"; \
	trap 'rm -f "$$tmp_source" "$$tmp_html"' EXIT; \
	./scripts/render-resume.js --preserve-contact-placeholders $(SOURCE) "$$tmp_source"; \
	resume_name="$$(node -e 'const { readVars } = require("./scripts/read-vars"); process.stdout.write(readVars(process.argv[1]).RESUME_NAME || "")' "$(SOURCE)")"; \
	if [ -z "$$resume_name" ]; then \
		printf 'Missing RESUME_NAME in frontmatter of $(SOURCE).\n' >&2; \
		exit 1; \
	fi; \
	latest_url="$$(node -e 'const { readVars } = require("./scripts/read-vars"); process.stdout.write(readVars(process.argv[1]).RESUME_LATEST_URL || "")' "$(SOURCE)")"; \
	if [ -z "$$latest_url" ]; then \
		printf 'Missing RESUME_LATEST_URL in frontmatter of $(SOURCE).\n' >&2; \
		exit 1; \
	fi; \
	printf '\n```resume-footer\n{"date":"%s","url":"%s"}\n```\n' "$$(date +%Y-%m-%d)" "$$latest_url" >> "$$tmp_source"; \
	$(PANDOC) "$$tmp_source" \
		--lua-filter $(RESUME_ENTRY_FILTER) \
		--standalone \
		--metadata pagetitle="$$resume_name Resume" \
		--include-in-header web/head.html \
		--css assets/styles/resume.css \
		--from=markdown \
		--to=html \
		--output "$$tmp_html"; \
	./scripts/obfuscate-html-contacts.js $(SOURCE) "$$tmp_html" $(WEB_ASSETS_DIR)/contact.js assets/contact.js $(WEB_DIR)/index.html

pdf: $(BUILD_SOURCE) scripts/resume-basename.js $(BUILD_DIR)
	@output="$(BUILD_DIR)/$$(./scripts/resume-basename.js $(SOURCE)).pdf"; \
	$(PANDOC) $(BUILD_SOURCE) \
		--lua-filter $(RESUME_ENTRY_FILTER) \
		--standalone \
		--metadata pagetitle="Resume" \
		--css $(STYLESHEET) \
		--css $(PDF_STYLESHEET) \
		--pdf-engine=weasyprint \
		--output "$$output"

markdown: $(BUILD_SOURCE) scripts/resume-basename.js $(BUILD_DIR)
	@output="$(BUILD_DIR)/$$(./scripts/resume-basename.js $(SOURCE)).md"; \
	$(PANDOC) $(BUILD_SOURCE) \
		--lua-filter $(RESUME_ENTRY_FILTER) \
		--to=gfm \
		--wrap=none \
		--output "$$output"

test:
	./tests/test-suite.js

clean:
	rm -rf $(BUILD_DIR)
