#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { readVars } = require("../scripts/read-vars");

const root = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "resume-tests-"));
const sourceFile = path.join(tmp, "resume.md");
const buildDir = path.join(tmp, "build");
const webDir = path.join(buildDir, "web");

const contactEnv = { RESUME_EMAIL: "env@example.com", RESUME_PHONE: "+1 555 333 4444" };
const projectLink = "https://example.com/project";
const baseSource = read(path.join(root, "resume.md"))
  .replace('RESUME_LATEST_URL: "acote.dev/resume"', 'RESUME_LATEST_URL: "https://example.com/resume"')
  .replace('  "title": "Zig 3D Mesh Building",', `  "title": "Zig 3D Mesh Building",\n  "link": "${projectLink}",`);

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
    values.RESUME_EMAIL,
    values.RESUME_EMAIL ? `mailto:${values.RESUME_EMAIL}` : undefined,
    values.RESUME_PHONE,
    "mailto:",
    "tel:",
  ].filter(Boolean);

  const failures = [];
  for (const file of listFiles(webDir)) {
    const contents = read(file);
    for (const value of protectedValues) {
      if (contents.includes(value)) {
        failures.push(`${file}: ${value}`);
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
  assert("missing variable error includes make argument example", missingVars.stderr.includes('make RESUME_EMAIL="person@example.com" RESUME_PHONE="+1 (555) 000-0000"'));
  assert("missing variable error includes environment example", missingVars.stderr.includes('RESUME_EMAIL="person@example.com" RESUME_PHONE="+1 (555) 000-0000" make'));

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
  make("contact overrides preserve edited source", [
    "web",
    `PANDOC=${fakePandoc}`,
    "RESUME_EMAIL=arg@example.com",
    "RESUME_PHONE=+1 555 999 0000",
  ]);
  assert("edited source is unchanged after contact override build", read(sourceFile) === editedSource);

  make("make arguments override environment", [
    "pdf",
    `PANDOC=${fakePandoc}`,
    "RESUME_EMAIL=arg@example.com",
    "RESUME_PHONE=+1 555 999 0000",
  ], { env: contactEnv });
  const argRendered = read(path.join(buildDir, "resume.pdf"));
  assert("make argument email wins", argRendered.includes("arg@example.com") && !argRendered.includes("env@example.com"));
  assert("make argument phone wins", argRendered.includes("+1 555 999 0000") && !argRendered.includes("+1 555 333 4444"));

  fs.writeFileSync(sourceFile, baseSource);
  make("web resolves source placeholders before pandoc", ["web", `PANDOC=${fakePandoc}`], { env: contactEnv });
  const placeholderWeb = read(path.join(webDir, "index.html"));
  assert("web output has no unresolved contact placeholders", !placeholderWeb.includes("{{RESUME_EMAIL}}") && !placeholderWeb.includes("{{RESUME_PHONE}}"));
  assert("web output includes footer", /\d{4}-\d{2}-\d{2}/.test(placeholderWeb) && placeholderWeb.includes("https://example.com/resume"), placeholderWeb);

  make("pdf resolves source placeholders before pandoc", ["pdf", `PANDOC=${fakePandoc}`], { env: contactEnv });
  const placeholderPdf = read(path.join(buildDir, "resume.pdf"));
  assert("pdf output has no unresolved contact placeholders", !placeholderPdf.includes("{{RESUME_EMAIL}}") && !placeholderPdf.includes("{{RESUME_PHONE}}"));
  assert("pdf output includes environment contact values", placeholderPdf.includes(contactEnv.RESUME_EMAIL) && placeholderPdf.includes(contactEnv.RESUME_PHONE));
  assert("pdf output includes footer", /\d{4}-\d{2}-\d{2}/.test(placeholderPdf) && placeholderPdf.includes("https://example.com/resume"));

  fs.writeFileSync(sourceFile, baseSource);

  make("markdown build succeeds", ["markdown"], { env: contactEnv });
  const markdownFile = path.join(buildDir, "resume.md");
  const renderedBuildFile = path.join(buildDir, "resume.rendered.md");
  const markdown = read(markdownFile);
  assert("markdown output exists", fs.existsSync(markdownFile));
  assert("markdown build removes rendered intermediate", !fs.existsSync(renderedBuildFile));
  assert("markdown output has no unresolved contact placeholders", !markdown.includes("{{RESUME_EMAIL}}") && !markdown.includes("{{RESUME_PHONE}}"));
  assert("markdown output includes environment contact values", markdown.includes(contactEnv.RESUME_EMAIL) && markdown.includes(contactEnv.RESUME_PHONE));
  assert("markdown contact entries use one item per line", markdown.includes("<env@example.com>\n[+1 555 333 4444](tel:+1 555 333 4444)\n[linkedin.com/in/alexcoté](https://linkedin.com/in/alexcoté)\n[github.com/quot](https://github.com/quot)"));
  assert("markdown output omits excluded entries", !markdown.includes("TEST!!!!!!!!!! This should not display!!!!"));
  assert("markdown output omits custom JSON blocks", !markdown.includes("```resume-entry") && !markdown.includes("```project-entry") && !markdown.includes("```skill-entry") && !markdown.includes("```contact-list"));
  assert("markdown output omits resume HTML divs", !markdown.includes("<div class=\"resume-entry\">") && !markdown.includes("<div class=\"resume-footer\">"));
  assert("markdown output omits HTML comments", !markdown.includes("<!--"));
  assert("markdown resume entries use heading and metadata bullets", markdown.includes("### Software Developer\n\n- *C Spire*\n- *Jul 2018 - Present*\n- *Ridgeland, MS*"));
  assert("markdown resume entries do not use list separator comments", !markdown.includes("- *Location*\n\n<!-- -->\n\n-"));
  assert("markdown project entries render link before bullets", markdown.includes(`### Zig 3D Mesh Building\n\n[${projectLink}](${projectLink})\n\n- A work-in-progress project mainly used for learning Zig and graphics programming.`));
  assert("markdown skills use one bullet list", markdown.includes("## Skills\n\n- **Programming Languages**: Python, C++, PostgreSQL, C\\#, HTML, CSS, PHP, Lua, VB.Net, JavaScript, C, Assembly\n- **Systems & Tools**: Linux, Git, GCC, Make, SCons, IDEs, Code Editors"));
  assert("markdown output includes labeled footer", /^-{3,}$/m.test(markdown) && markdown.includes("**Last updated:**") && markdown.includes("**Latest version:**") && markdown.includes("https://example.com/resume"));

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
  assert("web project entries render link", read(path.join(webDir, "index.html")).includes(`<a href="${projectLink}">${projectLink}</a>`));
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
