#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { phoneHrefValue } = require("../scripts/contact-links");
const { readVars } = require("../scripts/read-vars");

const root = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "resume-tests-"));
const sourceFile = path.join(tmp, "resume.md");
const buildDir = path.join(tmp, "build");
const webDir = path.join(buildDir, "web");

const contactEnv = { RESUME_EMAIL: "env@example.com", RESUME_PHONE: "+1 (555) 333-4444" };
const projectTitle = "Fixture Project";
const projectLink = "https://example.com/project";
const resumeBasename = "test_candidate_resume";
const baseSource = read(path.join(root, "tests", "fixtures", "test-resume.md"));

function run(name, command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...options.env },
    encoding: "utf8",
  });

  const shouldFail = options.shouldFail === true;
  const passed = shouldFail ? result.status !== 0 : result.status === 0;

  if (!passed) {
    console.error(`FAIL ${name}`);
    if (result.stdout) console.error(result.stdout.trim());
    if (result.stderr) console.error(result.stderr.trim());
    process.exit(1);
  }

  console.log(`PASS ${name}`);
  return result;
}

function make(name, args, options = {}) {
  const env = { ALLOW_PLAINTEXT_BUILD: "true", ...options.env };

  return run(name, "make", [
    ...args,
    `RESUME_FILE=${sourceFile}`,
    `BUILD_DIR=${buildDir}`,
  ], { ...options, env });
}

function assert(name, condition, detail) {
  if (!condition) {
    console.error(`FAIL ${name}`);
    if (detail) console.error(detail);
    process.exit(1);
  }

  console.log(`PASS ${name}`);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function writeFakePandoc(file) {
  fs.writeFileSync(file, `#!/usr/bin/env node
const fs = require("fs");
const args = process.argv.slice(2);
const input = args[0];
let output;

for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--output") {
    output = args[i + 1];
    break;
  }

  if (args[i].startsWith("--output=")) {
    output = args[i].slice("--output=".length);
    break;
  }
}

if (!input || !output) process.exit(2);

let contents = fs.readFileSync(input, "utf8");
if (output.endsWith(".html")) {
  contents = contents.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>');
}

fs.writeFileSync(output, contents);
`);
  fs.chmodSync(file, 0o755);
}

function listFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(filePath));
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }

  return files;
}

function firstContactPayload() {
  const html = read(path.join(webDir, "index.html"));
  const script = read(path.join(webDir, "assets", "contact.js"));
  const payload = html.match(/data-text="([^"]+)"/)?.[1];
  const key = script.match(/const key = "([^"]+)"/)?.[1];
  return `${key}:${payload}`;
}

function assertNoPlainContact(values) {
  const protectedValues = [
    { label: "email", value: values.RESUME_EMAIL },
    { label: "email href", value: values.RESUME_EMAIL ? `mailto:${values.RESUME_EMAIL}` : undefined },
    { label: "phone", value: values.RESUME_PHONE },
    { label: "normalized phone href", value: values.RESUME_PHONE ? phoneHrefValue(values.RESUME_PHONE) : undefined },
    { label: "mailto scheme", value: "mailto:" },
    { label: "tel scheme", value: "tel:" },
  ].filter((entry) => entry.value);

  const failures = [];
  for (const file of listFiles(webDir)) {
    const contents = read(file);
    for (const entry of protectedValues) {
      if (contents.includes(entry.value)) {
        failures.push(`${file}: found unobfuscated ${entry.label}`);
      }
    }
  }

  assert("web contact values are obfuscated", failures.length === 0, failures.join("\n"));
}

try {
  fs.writeFileSync(sourceFile, baseSource);

  const previousEmail = process.env.RESUME_EMAIL;
  const previousPhone = process.env.RESUME_PHONE;
  delete process.env.RESUME_EMAIL;
  delete process.env.RESUME_PHONE;
  const varsSource = path.join(tmp, "vars.md");
  fs.writeFileSync(varsSource, `---
# ignored comment
RESUME_NAME: 'Quoted Candidate'
RESUME_LATEST_URL: "latest.example"
RESUME_SUMMARY: "Line one\\nLine two"
RESUME_EMAIL: "frontmatter@example.com"
---
`);
  const parsedVars = readVars(varsSource);
  assert("frontmatter parser handles quotes and escaped newlines", parsedVars.RESUME_NAME === "Quoted Candidate" && parsedVars.RESUME_SUMMARY === "Line one\nLine two");
  assert("frontmatter parser ignores contact values without environment", !Object.prototype.hasOwnProperty.call(parsedVars, "RESUME_EMAIL"));
  assert("missing frontmatter returns empty vars", Object.keys(readVars(path.join(root, "README.md"))).length === 0);
  if (previousEmail === undefined) delete process.env.RESUME_EMAIL;
  else process.env.RESUME_EMAIL = previousEmail;
  if (previousPhone === undefined) delete process.env.RESUME_PHONE;
  else process.env.RESUME_PHONE = previousPhone;

  const renderedFile = path.join(tmp, "rendered.md");
  run("render succeeds", "./scripts/render-resume.js", [sourceFile, renderedFile], { env: contactEnv });
  const rendered = read(renderedFile);
  assert("render has no unresolved placeholders", !/\{\{[A-Z0-9_]+\}\}/.test(rendered));
  assert("render includes frontmatter name heading", rendered.includes("# Test Candidate"));
  assert("render includes email", rendered.includes(contactEnv.RESUME_EMAIL));
  assert("render includes phone", rendered.includes(contactEnv.RESUME_PHONE));

  run("missing source file fails", "./scripts/render-resume.js", [
    path.join(tmp, "missing.md"),
    path.join(tmp, "missing.md"),
  ], { shouldFail: true });

  const incompleteSource = path.join(tmp, "incomplete.md");
  fs.writeFileSync(incompleteSource, baseSource);
  const missingVars = run("missing required variable fails", "./scripts/render-resume.js", [
    incompleteSource,
    path.join(tmp, "incomplete.md"),
  ], { shouldFail: true });
  assert("missing variable error omits make argument example", !missingVars.stderr.includes('make RESUME_EMAIL="person@example.com" RESUME_PHONE="+1 (555) 000-0000"'));
  assert("missing variable error includes environment guidance", missingVars.stderr.includes("Set required variables in the environment, then rerun make."));

  const frontmatterContactSource = path.join(tmp, "frontmatter-contact.md");
  fs.writeFileSync(frontmatterContactSource, baseSource.replace("RESUME_LATEST_URL", "RESUME_EMAIL: \"file@example.com\"\nRESUME_PHONE: \"+1 555 111 2222\"\nRESUME_LATEST_URL"));
  run("frontmatter contact variables are ignored", "./scripts/render-resume.js", [
    frontmatterContactSource,
    path.join(tmp, "frontmatter-contact-rendered.md"),
  ], { shouldFail: true });

  run("environment populates contacts", "./scripts/render-resume.js", [
    sourceFile,
    path.join(tmp, "env.md"),
  ], { env: contactEnv });
  const envRendered = read(path.join(tmp, "env.md"));
  assert("environment email rendered", envRendered.includes(contactEnv.RESUME_EMAIL));
  assert("environment phone rendered", envRendered.includes(contactEnv.RESUME_PHONE));

  const fakePandoc = path.join(tmp, "pandoc");
  writeFakePandoc(fakePandoc);
  const makefile = read(path.join(root, "Makefile"));
  assert("makefile uses RESUME_FILE", makefile.includes("RESUME_FILE ?= resume.md"));
  assert("makefile avoids build directory temp files", !makefile.includes('mktemp "$(BUILD_DIR)/'));
  assert("makefile guards plaintext CI builds", makefile.includes("ALLOW_PLAINTEXT_BUILD") && makefile.includes("PLAINTEXT_BUILD_TARGETS := all pdf markdown"));
  const legacyInputVariable = "SOUR" + "CE";
  assert("makefile omits legacy input variable", !new RegExp(`\\b${legacyInputVariable}\\b`).test(makefile));

  const missingNameSource = path.join(tmp, "missing-name.md");
  fs.writeFileSync(missingNameSource, `---
RESUME_LATEST_URL: "resume.test"
---
`);
  run("resume basename missing name fails", "./scripts/resume-basename.js", [missingNameSource], { shouldFail: true });
  const unusableNameSource = path.join(tmp, "unusable-name.md");
  fs.writeFileSync(unusableNameSource, `---
RESUME_NAME: "123 !!!"
---
`);
  run("resume basename unusable name fails", "./scripts/resume-basename.js", [unusableNameSource], { shouldFail: true });
  const normalizedNameSource = path.join(tmp, "normalized-name.md");
  fs.writeFileSync(normalizedNameSource, `---
RESUME_NAME: "Renée Fixture, Sr."
---
`);
  const normalizedName = run("resume basename normalizes punctuation and accents", "./scripts/resume-basename.js", [normalizedNameSource]);
  assert("resume basename normalized output", normalizedName.stdout === "renee_fixture_sr_resume");

  const editedSource = baseSource.replace("# {{RESUME_NAME}}", "# Edited Name");
  fs.writeFileSync(sourceFile, editedSource);
  make("environment contacts preserve edited source", [
    "web",
    `PANDOC=${fakePandoc}`,
  ], { env: contactEnv });
  assert("edited source is unchanged after environment contact build", read(sourceFile) === editedSource);

  const contactArgBuild = make("contact make arguments are rejected", [
    "pdf",
    `PANDOC=${fakePandoc}`,
    "RESUME_EMAIL=arg@example.com",
    "RESUME_PHONE=+1 555 999 0000",
  ], { env: contactEnv, shouldFail: true });
  assert("make argument email is rejected", contactArgBuild.stderr.includes("RESUME_EMAIL must be provided through the environment"));

  const phoneArgBuild = make("phone make argument is rejected", [
    "pdf",
    `PANDOC=${fakePandoc}`,
    "RESUME_PHONE=+1 555 999 0000",
  ], { env: contactEnv, shouldFail: true });
  assert("make argument phone is rejected", phoneArgBuild.stderr.includes("RESUME_PHONE must be provided through the environment"));

  const plaintextAllowArgBuild = make("plaintext allow make argument is rejected", [
    "pdf",
    `PANDOC=${fakePandoc}`,
    "ALLOW_PLAINTEXT_BUILD=true",
  ], { env: contactEnv, shouldFail: true });
  assert("make argument plaintext allowance is rejected", plaintextAllowArgBuild.stderr.includes("ALLOW_PLAINTEXT_BUILD must be provided through the environment"));

  make("clean before ci guard tests succeeds", ["clean"]);

  const ciPdfBuild = make("ci pdf build without plaintext allowance fails", [
    "pdf",
    `PANDOC=${fakePandoc}`,
  ], { env: { ...contactEnv, CI: "true", ALLOW_PLAINTEXT_BUILD: "" }, shouldFail: true });
  assert("ci pdf guard explains plaintext allowance", ciPdfBuild.stderr.includes("Refusing to run plaintext-producing targets in CI"));

  const ciMarkdownBuild = make("ci markdown build without plaintext allowance fails", [
    "markdown",
    `PANDOC=${fakePandoc}`,
  ], { env: { ...contactEnv, CI: "true", ALLOW_PLAINTEXT_BUILD: "" }, shouldFail: true });
  assert("ci markdown guard explains plaintext allowance", ciMarkdownBuild.stderr.includes("Set ALLOW_PLAINTEXT_BUILD=true in the environment"));

  const ciAllBuild = make("ci all build without plaintext allowance fails", [
    `PANDOC=${fakePandoc}`,
  ], { env: { ...contactEnv, CI: "true", ALLOW_PLAINTEXT_BUILD: "" }, shouldFail: true });
  assert("ci all guard fails before web output", ciAllBuild.stderr.includes("Refusing to run plaintext-producing targets in CI") && !fs.existsSync(path.join(webDir, "index.html")));

  make("ci web build without plaintext allowance succeeds", [
    "web",
    `PANDOC=${fakePandoc}`,
  ], { env: { ...contactEnv, CI: "true", ALLOW_PLAINTEXT_BUILD: "" } });
  assert("ci web-only build creates web output", fs.existsSync(path.join(webDir, "index.html")));
  make("clean after ci guard tests succeeds", ["clean"]);

  const missingWebEmail = make("web missing environment email fails", ["web", `PANDOC=${fakePandoc}`], { env: { RESUME_EMAIL: "", RESUME_PHONE: contactEnv.RESUME_PHONE }, shouldFail: true });
  assert("web missing email error mentions environment", missingWebEmail.stderr.includes("Missing RESUME_EMAIL; provide it through the environment."));
  const missingWebPhone = make("web missing environment phone fails", ["web", `PANDOC=${fakePandoc}`], { env: { RESUME_EMAIL: contactEnv.RESUME_EMAIL, RESUME_PHONE: "" }, shouldFail: true });
  assert("web missing phone error mentions environment", missingWebPhone.stderr.includes("Missing RESUME_PHONE; provide it through the environment."));

  fs.writeFileSync(sourceFile, baseSource);
  const webPlaceholderBuild = make("web resolves source placeholders before pandoc", ["web", `PANDOC=${fakePandoc}`], { env: contactEnv });
  const webPlaceholderLog = `${webPlaceholderBuild.stdout}${webPlaceholderBuild.stderr}`;
  assert("web build logs omit contact secret values", !webPlaceholderLog.includes(contactEnv.RESUME_EMAIL) && !webPlaceholderLog.includes(contactEnv.RESUME_PHONE) && !webPlaceholderLog.includes(phoneHrefValue(contactEnv.RESUME_PHONE)), "build logs contained protected contact values");
  const placeholderWeb = read(path.join(webDir, "index.html"));
  assert("web output has no unresolved contact placeholders", !placeholderWeb.includes("{{RESUME_EMAIL}}") && !placeholderWeb.includes("{{RESUME_PHONE}}"));
  assert("web output includes footer", /\d{4}-\d{2}-\d{2}/.test(placeholderWeb) && placeholderWeb.includes("resume.test"), placeholderWeb);

  make("pdf resolves source placeholders before pandoc", ["pdf", `PANDOC=${fakePandoc}`], { env: contactEnv });
  const placeholderPdf = read(path.join(buildDir, `${resumeBasename}.pdf`));
  assert("pdf output has no unresolved contact placeholders", !placeholderPdf.includes("{{RESUME_EMAIL}}") && !placeholderPdf.includes("{{RESUME_PHONE}}"));
  assert("pdf output includes environment contact values", placeholderPdf.includes(contactEnv.RESUME_EMAIL) && placeholderPdf.includes(contactEnv.RESUME_PHONE));
  assert("pdf output includes footer", /\d{4}-\d{2}-\d{2}/.test(placeholderPdf) && placeholderPdf.includes("resume.test"));

  fs.writeFileSync(sourceFile, baseSource.replace('  "title": "Fixture Developer",', '  "include": true,\n  "title": "Fixture Developer",'));
  make("include field is rejected", ["markdown"], { env: contactEnv, shouldFail: true });

  fs.writeFileSync(sourceFile, baseSource.replace(`  "link": "${projectLink}"`, `  "link": "${projectLink}",\n  "bullets": []`));
  make("resume-entry bullets field is rejected", ["markdown"], { env: contactEnv, shouldFail: true });

  fs.writeFileSync(sourceFile, baseSource.replace('  "skills": ["JavaScript", "Lua", "Markdown"]', '  "skills": ["JavaScript"],\n  "include": true'));
  make("skill-entry unsupported field is rejected", ["markdown"], { env: contactEnv, shouldFail: true });
  fs.writeFileSync(sourceFile, baseSource.replace('  "skills": ["JavaScript", "Lua", "Markdown"]', '  "skills": []'));
  make("skill-entry empty skills are rejected", ["markdown"], { env: contactEnv, shouldFail: true });
  fs.writeFileSync(sourceFile, baseSource.replace('        "label": "{{RESUME_EMAIL}}",', '        "href": "mailto:{{RESUME_EMAIL}}",'));
  make("contact-list missing label is rejected", ["markdown"], { env: contactEnv, shouldFail: true });
  fs.writeFileSync(sourceFile, baseSource.replace("```tag-line\nFixture Engineer | Testing, Automation, Documentation\n```", "```tag-line\n   \n```"));
  make("empty tag-line is rejected", ["markdown"], { env: contactEnv, shouldFail: true });
  fs.writeFileSync(sourceFile, baseSource.replace("## Skills", "```resume-footer\n{\"date\":\"2026-07-08\"}\n```\n\n## Skills"));
  make("resume-footer missing url is rejected", ["markdown"], { env: contactEnv, shouldFail: true });

  const obfuscationVariantsDir = path.join(tmp, "obfuscation-variants");
  fs.mkdirSync(obfuscationVariantsDir);
  const obfuscationVariants = [
    {
      name: "head",
      html: `<html><head></head><body><a href="mailto:{{RESUME_EMAIL}}">{{RESUME_EMAIL}}</a><a href="tel:+1%20(555)%20333-4444">+1 (555) 333-4444</a><a href="tel:{{RESUME_PHONE_HREF}}">{{RESUME_PHONE}}</a></body></html>`,
      scriptTag: "</head>",
    },
    {
      name: "body",
      html: `<html><body>{{RESUME_EMAIL}} {{RESUME_PHONE}}</body></html>`,
      scriptTag: "</body>",
    },
    {
      name: "append",
      html: `{{RESUME_EMAIL}} {{RESUME_PHONE}}`,
      scriptTag: null,
    },
  ];
  for (const variant of obfuscationVariants) {
    const inputHtml = path.join(obfuscationVariantsDir, `${variant.name}.html`);
    const outputHtml = path.join(obfuscationVariantsDir, `${variant.name}.out.html`);
    const scriptFile = path.join(obfuscationVariantsDir, `${variant.name}.js`);
    fs.writeFileSync(inputHtml, variant.html);
    run(`obfuscator handles ${variant.name} insertion`, "./scripts/obfuscate-html-contacts.js", [sourceFile, inputHtml, scriptFile, "contact.js", outputHtml], { env: contactEnv });
    const obfuscatedHtml = read(outputHtml);
    assert(`obfuscator ${variant.name} removes plaintext contacts`, !obfuscatedHtml.includes(contactEnv.RESUME_EMAIL) && !obfuscatedHtml.includes(contactEnv.RESUME_PHONE) && !obfuscatedHtml.includes("mailto:") && !obfuscatedHtml.includes("tel:"), obfuscatedHtml);
    assert(`obfuscator ${variant.name} writes script tag`, obfuscatedHtml.includes('<script src="contact.js" defer></script>'));
    if (variant.scriptTag) {
      assert(`obfuscator ${variant.name} inserts before closing tag`, obfuscatedHtml.indexOf('<script src="contact.js" defer></script>') < obfuscatedHtml.indexOf(variant.scriptTag), obfuscatedHtml);
    }
    assert(`obfuscator ${variant.name} writes decrypt script`, read(scriptFile).includes("async function revealContacts()"));
  }

  const optionalMetadataSource = baseSource.replace("## Skills", `\`\`\`resume-entry
{
  "title": "Dates Only",
  "dates": "2024 - Present"
}
\`\`\`

\`\`\`resume-entry
{
  "title": "Linked Entry",
  "company": "Linked Co",
  "link": "https://example.com/resume-entry",
  "location": "Remote"
}
\`\`\`

\`\`\`resume-entry
{
  "title": "Location Only",
  "location": "Remote"
}
\`\`\`

\`\`\`resume-entry
{
  "title": "Title Only"
}
\`\`\`

## Skills`);
  fs.writeFileSync(sourceFile, optionalMetadataSource);
  make("resume-entry optional metadata markdown succeeds", ["markdown"], { env: contactEnv });
  const optionalMarkdown = read(path.join(buildDir, `${resumeBasename}.md`));
  assert("markdown resume-entry metadata fields are optional", optionalMarkdown.includes("### Dates Only\n\n- *2024 - Present*") && optionalMarkdown.includes("### Location Only\n\n- *Remote*") && optionalMarkdown.includes("### Title Only"));
  assert("markdown resume-entry link renders under company", optionalMarkdown.includes("### Linked Entry\n\n- **Linked Co**\n- [https://example.com/resume-entry](https://example.com/resume-entry)\n- *Remote*"));
  make("resume-entry optional metadata web succeeds", ["web"], { env: contactEnv });
  const optionalWeb = read(path.join(webDir, "index.html"));
  const linkedEntryIndex = optionalWeb.indexOf("<span>Linked Entry</span>");
  const linkedEntryStart = optionalWeb.lastIndexOf('<div class="resume-entry">', linkedEntryIndex);
  const linkedEntryEnd = optionalWeb.indexOf('<div class="resume-entry">', linkedEntryIndex + 1);
  const linkedEntry = linkedEntryStart >= 0 ? optionalWeb.slice(linkedEntryStart, linkedEntryEnd >= 0 ? linkedEntryEnd : optionalWeb.length) : "";
  const linkedCompanyIndex = linkedEntry.indexOf("<em>Linked Co</em>");
  const linkedHrefIndex = linkedEntry.indexOf('href="https://example.com/resume-entry"');
  const linkedTextIndex = linkedEntry.indexOf(">https://example.com/resume-entry</a>");
  assert("web resume-entry link renders under company", linkedCompanyIndex >= 0 && linkedCompanyIndex < linkedHrefIndex && linkedHrefIndex < linkedTextIndex, linkedEntry);
  const titleOnlyIndex = optionalWeb.indexOf("<span>Title Only</span>");
  const titleOnlyStart = optionalWeb.lastIndexOf('<div class="resume-entry">', titleOnlyIndex);
  const titleOnlyEnd = optionalWeb.indexOf('<div class="resume-entry">', titleOnlyIndex + 1);
  const titleOnlyEntry = titleOnlyStart >= 0 ? optionalWeb.slice(titleOnlyStart, titleOnlyEnd >= 0 ? titleOnlyEnd : optionalWeb.length) : "";
  assert("web title-only resume-entry omits metadata row", titleOnlyEntry && !titleOnlyEntry.includes('<div class="resume-row">'), titleOnlyEntry);

  fs.writeFileSync(sourceFile, baseSource);

  make("markdown build succeeds", ["markdown"], { env: contactEnv });
  const markdownFile = path.join(buildDir, `${resumeBasename}.md`);
  const renderedBuildFile = path.join(buildDir, "resume.rendered.md");
  const markdown = read(markdownFile);
  assert("markdown output exists", fs.existsSync(markdownFile));
  assert("markdown output filename uses normalized frontmatter name", markdownFile.endsWith("test_candidate_resume.md"));
  assert("markdown build removes rendered intermediate", !fs.existsSync(renderedBuildFile));
  assert("markdown output has no unresolved contact placeholders", !markdown.includes("{{RESUME_EMAIL}}") && !markdown.includes("{{RESUME_PHONE}}"));
  assert("markdown output includes environment contact values", markdown.includes(contactEnv.RESUME_EMAIL) && markdown.includes(contactEnv.RESUME_PHONE));
  assert("markdown contact entries use one item per line", markdown.includes("<env@example.com>\n[+1 (555) 333-4444](tel:+15553334444)\n[portfolio.example/test-candidate](https://portfolio.example/test-candidate)\n[code.example/test-candidate](https://code.example/test-candidate)"));
  assert("markdown output omits commented sections", !markdown.includes("Legacy Operator") && !markdown.includes("Fixture Certification"));
  assert("markdown output omits custom blocks", !markdown.includes("```resume-entry") && !markdown.includes("```skill-entry") && !markdown.includes("```contact-list") && !markdown.includes("```tag-line"));
  assert("markdown output includes tag line", markdown.includes("Fixture Engineer | Testing, Automation, Documentation"));
  assert("markdown output omits resume HTML divs", !markdown.includes("<div class=\"resume-entry\">") && !markdown.includes("<div class=\"resume-footer\">"));
  assert("markdown output omits HTML comments", !markdown.includes("<!--"));
  assert("markdown resume entries use heading and metadata bullets", markdown.includes("### Fixture Developer\n\n- **Example Systems**\n- *Jan 2020 - Present*\n- *Testville, TS*"));
  assert("markdown resume entries do not use list separator comments", !markdown.includes("- *Location*\n\n<!-- -->\n\n-"));
  assert("markdown project resume-entry renders link before markdown bullets", markdown.includes(`### ${projectTitle}\n\n- [${projectLink}](${projectLink})\n- *Apr 2026 - Present*\n- *Node.js, Pandoc, CSS*\n\n- Building a focused resume test fixture that exercises project-style entries.`));
  assert("markdown skills use one bullet list", markdown.includes("## Skills\n\n- **Languages**: JavaScript, Lua, Markdown\n- **Tools**: Pandoc, Make, Node.js\n- **Practices**: Fixtures, Regression Tests, Documentation"));
  assert("markdown output includes labeled footer", /^-{3,}$/m.test(markdown) && markdown.includes("**Last updated:**") && markdown.includes("**Latest version:**") && markdown.includes("[resume.test](https://resume.test)"));

  make("web build succeeds", ["web"], { env: contactEnv });
  assert("web index exists", fs.existsSync(path.join(webDir, "index.html")));
  assert("web headers exists", fs.existsSync(path.join(webDir, "_headers")));
  assert("web contact script exists", fs.existsSync(path.join(webDir, "assets", "contact.js")));
  assert("web stylesheet exists", fs.existsSync(path.join(webDir, "assets", "styles", "resume.css")));
  assert("web responsive stylesheet exists", fs.existsSync(path.join(webDir, "assets", "styles", "resume-web.css")));
  assert("web index disables caching", read(path.join(webDir, "index.html")).includes('http-equiv="Cache-Control"'));
  assert("web title uses frontmatter name", read(path.join(webDir, "index.html")).includes("<title>Test Candidate Resume</title>"));
  assert("web headers disable caching", read(path.join(webDir, "_headers")).includes("Cache-Control: no-store"));
  assert("web index references contact script", read(path.join(webDir, "index.html")).includes('src="assets/contact.js"'));
  assert("web index references responsive stylesheet", read(path.join(webDir, "index.html")).includes('href="assets/styles/resume-web.css"'));
  assert("web index has encrypted contact attributes", /data-obfuscated-contact/.test(read(path.join(webDir, "index.html"))));
  assert("resume entry company and location are italicized", read(path.join(webDir, "index.html")).includes("<em>Example Systems</em>") && /<em>Testville,\s+TS<\/em>/.test(read(path.join(webDir, "index.html"))));
  assert("web tag line is centered", read(path.join(webDir, "index.html")).includes('class="tag-line"') && read(path.join(webDir, "assets", "styles", "resume.css")).includes(".tag-line") && read(path.join(webDir, "assets", "styles", "resume.css")).includes("text-align: center"));
  assert("web project resume-entry renders link", read(path.join(webDir, "index.html")).includes(`href="${projectLink}"`));
  assert("web footer prepends missing URL scheme in href", read(path.join(webDir, "index.html")).includes('href="https://resume.test"') && read(path.join(webDir, "index.html")).includes('>resume.test</a>'));
  assertNoPlainContact(contactEnv);

  const firstPayload = firstContactPayload();
  make("web rebuild succeeds", ["web"], { env: contactEnv });
  assert("web rebuild creates new key or payload", firstPayload !== firstContactPayload());

  const cssDir = path.join(webDir, "assets", "styles");
  const css = read(path.join(cssDir, "resume.css"));
  const urls = [...css.matchAll(/url\("?([^)"]+)"?\)/g)].map((match) => match[1]);
  for (const url of urls) {
    assert(`asset exists for ${url}`, fs.existsSync(path.join(cssDir, url)));
  }

  for (const font of ["assets/fonts/Lato/Lato-Regular.ttf", "assets/fonts/Lato/Lato-Italic.ttf", "assets/fonts/Lato/Lato-Bold.ttf", "assets/fonts/Lato/Lato-BoldItalic.ttf"]) {
    assert(`web font copied: ${font}`, fs.existsSync(path.join(webDir, font)));
  }

  assert("pdf engine is fixed to weasyprint", read(path.join(root, "Makefile")).includes("--pdf-engine=weasyprint"));
  make("clean before pdf-only build succeeds", ["clean"]);
  make("pdf build succeeds", ["pdf"], { env: contactEnv });
  const pdfFile = path.join(buildDir, `${resumeBasename}.pdf`);
  assert("pdf exists", fs.existsSync(pdfFile));
  assert("pdf filename uses normalized frontmatter name", pdfFile.endsWith("test_candidate_resume.pdf"));
  assert("pdf is non-empty", fs.statSync(pdfFile).size > 0);
  assert("pdf-only build does not create contact script", !fs.existsSync(path.join(webDir, "assets", "contact.js")));

  make("full build succeeds", [], { env: contactEnv });
  assert("full build pdf exists", fs.existsSync(pdfFile));
  assert("full build markdown exists", fs.existsSync(path.join(buildDir, `${resumeBasename}.md`)));
  assert("full build removes rendered intermediate", !fs.existsSync(renderedBuildFile));
  assert("full build web index exists", fs.existsSync(path.join(webDir, "index.html")));
  assert("full build web headers exists", fs.existsSync(path.join(webDir, "_headers")));
  assert("full build web stylesheet exists", fs.existsSync(path.join(webDir, "assets", "styles", "resume.css")));
  assert("full build web responsive stylesheet exists", fs.existsSync(path.join(webDir, "assets", "styles", "resume-web.css")));
  assert("full build contact script exists", fs.existsSync(path.join(webDir, "assets", "contact.js")));

  make("clean succeeds", ["clean"]);
  assert("clean removes build directory", !fs.existsSync(buildDir));
  assert("clean preserves rendered source", fs.existsSync(sourceFile));

  console.log("All tests passed.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
