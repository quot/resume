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
const projectTitle = "Zig 3D Mesh Generator";
const projectLink = "https://example.com/project";
const baseSource = read(path.join(root, "resume.md"))
  .replace('  "link": "https://github.com/quot/donut"', `  "link": "${projectLink}"`);

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
  return run(name, "make", [
    ...args,
    `SOURCE=${sourceFile}`,
    `BUILD_DIR=${buildDir}`,
  ], options);
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

  const renderedFile = path.join(tmp, "rendered.md");
  run("render succeeds", "./scripts/render-resume.js", [sourceFile, renderedFile], { env: contactEnv });
  const rendered = read(renderedFile);
  assert("render has no unresolved placeholders", !/\{\{[A-Z0-9_]+\}\}/.test(rendered));
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

  const editedSource = baseSource.replace("# Your Name", "# Edited Name");
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

  fs.writeFileSync(sourceFile, baseSource);
  const webPlaceholderBuild = make("web resolves source placeholders before pandoc", ["web", `PANDOC=${fakePandoc}`], { env: contactEnv });
  const webPlaceholderLog = `${webPlaceholderBuild.stdout}${webPlaceholderBuild.stderr}`;
  assert("web build logs omit contact secret values", !webPlaceholderLog.includes(contactEnv.RESUME_EMAIL) && !webPlaceholderLog.includes(contactEnv.RESUME_PHONE) && !webPlaceholderLog.includes(phoneHrefValue(contactEnv.RESUME_PHONE)), "build logs contained protected contact values");
  const placeholderWeb = read(path.join(webDir, "index.html"));
  assert("web output has no unresolved contact placeholders", !placeholderWeb.includes("{{RESUME_EMAIL}}") && !placeholderWeb.includes("{{RESUME_PHONE}}"));
  assert("web output includes footer", /\d{4}-\d{2}-\d{2}/.test(placeholderWeb) && placeholderWeb.includes("acote.dev/resume"), placeholderWeb);

  make("pdf resolves source placeholders before pandoc", ["pdf", `PANDOC=${fakePandoc}`], { env: contactEnv });
  const placeholderPdf = read(path.join(buildDir, "resume.pdf"));
  assert("pdf output has no unresolved contact placeholders", !placeholderPdf.includes("{{RESUME_EMAIL}}") && !placeholderPdf.includes("{{RESUME_PHONE}}"));
  assert("pdf output includes environment contact values", placeholderPdf.includes(contactEnv.RESUME_EMAIL) && placeholderPdf.includes(contactEnv.RESUME_PHONE));
  assert("pdf output includes footer", /\d{4}-\d{2}-\d{2}/.test(placeholderPdf) && placeholderPdf.includes("acote.dev/resume"));

  fs.writeFileSync(sourceFile, baseSource.replace('  "title": "Software Developer",', '  "include": true,\n  "title": "Software Developer",'));
  make("include field is rejected", ["markdown"], { env: contactEnv, shouldFail: true });

  fs.writeFileSync(sourceFile, baseSource.replace(`  "link": "${projectLink}"`, `  "link": "${projectLink}",\n  "bullets": []`));
  make("resume-entry bullets field is rejected", ["markdown"], { env: contactEnv, shouldFail: true });

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
  const optionalMarkdown = read(path.join(buildDir, "resume.md"));
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
  const markdownFile = path.join(buildDir, "resume.md");
  const renderedBuildFile = path.join(buildDir, "resume.rendered.md");
  const markdown = read(markdownFile);
  assert("markdown output exists", fs.existsSync(markdownFile));
  assert("markdown build removes rendered intermediate", !fs.existsSync(renderedBuildFile));
  assert("markdown output has no unresolved contact placeholders", !markdown.includes("{{RESUME_EMAIL}}") && !markdown.includes("{{RESUME_PHONE}}"));
  assert("markdown output includes environment contact values", markdown.includes(contactEnv.RESUME_EMAIL) && markdown.includes(contactEnv.RESUME_PHONE));
  assert("markdown contact entries use one item per line", markdown.includes("<env@example.com>\n[+1 (555) 333-4444](tel:+15553334444)\n[linkedin.com/in/-alexcote](https://linkedin.com/in/-alexcote)\n[github.com/quot](https://github.com/quot)"));
  assert("markdown output omits commented sections", !markdown.includes("System Administrator") && !markdown.includes("A+ Certified"));
  assert("markdown output omits custom blocks", !markdown.includes("```resume-entry") && !markdown.includes("```skill-entry") && !markdown.includes("```contact-list") && !markdown.includes("```tag-line"));
  assert("markdown output includes tag line", markdown.includes("Backend Software Engineer | JVM, Kotlin, Kafka, Search, Distributed Systems"));
  assert("markdown output omits resume HTML divs", !markdown.includes("<div class=\"resume-entry\">") && !markdown.includes("<div class=\"resume-footer\">"));
  assert("markdown output omits HTML comments", !markdown.includes("<!--"));
  assert("markdown resume entries use heading and metadata bullets", markdown.includes("### Software Developer\n\n- **C Spire**\n- *Jul 2018 - Present*\n- *Ridgeland, MS*"));
  assert("markdown resume entries do not use list separator comments", !markdown.includes("- *Location*\n\n<!-- -->\n\n-"));
  assert("markdown project resume-entry renders link before markdown bullets", markdown.includes(`### ${projectTitle}\n\n- [${projectLink}](${projectLink})\n- *Apr 2026 - Present*\n\n- Building an experimental 3D mesh generation tool in Zig using Sokol and OpenGL.`));
  assert("markdown skills use one bullet list", markdown.includes("## Skills\n\n- **Languages**: Java, Kotlin, Scala, Python, Zig, SQL, JavaScript, HTML/CSS\n- **Backend**: Spring Boot, Ktor, Akka, Akka HTTP, Hibernate, Apache Camel\n- **Data & Infrastructure**: Kafka, Kafka Connect, Solr, Redis, Docker, Podman, Linux, Git, Maven, Gradle\n- **Web**: HTMX, HTML/CSS, JavaScript"));
  assert("markdown output includes labeled footer", /^-{3,}$/m.test(markdown) && markdown.includes("**Last updated:**") && markdown.includes("**Latest version:**") && markdown.includes("[acote.dev/resume](https://acote.dev/resume)"));

  make("web build succeeds", ["web"], { env: contactEnv });
  assert("web index exists", fs.existsSync(path.join(webDir, "index.html")));
  assert("web headers exists", fs.existsSync(path.join(webDir, "_headers")));
  assert("web contact script exists", fs.existsSync(path.join(webDir, "assets", "contact.js")));
  assert("web stylesheet exists", fs.existsSync(path.join(webDir, "assets", "styles", "resume.css")));
  assert("web index disables caching", read(path.join(webDir, "index.html")).includes('http-equiv="Cache-Control"'));
  assert("web headers disable caching", read(path.join(webDir, "_headers")).includes("Cache-Control: no-store"));
  assert("web index references contact script", read(path.join(webDir, "index.html")).includes('src="assets/contact.js"'));
  assert("web index has encrypted contact attributes", /data-obfuscated-contact/.test(read(path.join(webDir, "index.html"))));
  assert("resume entry company and location are italicized", read(path.join(webDir, "index.html")).includes("<em>C Spire</em>") && read(path.join(webDir, "index.html")).includes("<em>Ridgeland, MS</em>"));
  assert("web tag line is centered", read(path.join(webDir, "index.html")).includes('class="tag-line"') && read(path.join(webDir, "assets", "styles", "resume.css")).includes(".tag-line") && read(path.join(webDir, "assets", "styles", "resume.css")).includes("text-align: center"));
  assert("web project resume-entry renders link", read(path.join(webDir, "index.html")).includes(`href="${projectLink}"`));
  assert("web footer prepends missing URL scheme in href", read(path.join(webDir, "index.html")).includes('href="https://acote.dev/resume"') && read(path.join(webDir, "index.html")).includes('>acote.dev/resume</a>'));
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
  const pdfFile = path.join(buildDir, "resume.pdf");
  assert("pdf exists", fs.existsSync(pdfFile));
  assert("pdf is non-empty", fs.statSync(pdfFile).size > 0);
  assert("pdf-only build does not create contact script", !fs.existsSync(path.join(webDir, "assets", "contact.js")));

  make("full build succeeds", [], { env: contactEnv });
  assert("full build pdf exists", fs.existsSync(pdfFile));
  assert("full build markdown exists", fs.existsSync(path.join(buildDir, "resume.md")));
  assert("full build removes rendered intermediate", !fs.existsSync(renderedBuildFile));
  assert("full build web index exists", fs.existsSync(path.join(webDir, "index.html")));
  assert("full build web headers exists", fs.existsSync(path.join(webDir, "_headers")));
  assert("full build web stylesheet exists", fs.existsSync(path.join(webDir, "assets", "styles", "resume.css")));
  assert("full build contact script exists", fs.existsSync(path.join(webDir, "assets", "contact.js")));

  make("clean succeeds", ["clean"]);
  assert("clean removes build directory", !fs.existsSync(buildDir));
  assert("clean preserves rendered source", fs.existsSync(sourceFile));

  console.log("All tests passed.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
