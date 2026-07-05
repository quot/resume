#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { phoneHref, phoneHrefValue } = require("../scripts/contact-links");
const { readVars } = require("../scripts/read-vars");

const varsFile = process.argv[2] || "resume.md";
const webDir = process.argv[3] || "build/web";

function listFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(filePath));
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }

  return files;
}

function uniqueEntries(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    if (!entry.value || seen.has(entry.value)) return false;

    seen.add(entry.value);
    return true;
  });
}

const vars = readVars(varsFile);

for (const key of ["RESUME_EMAIL", "RESUME_PHONE"]) {
  if (!vars[key]) {
    console.error(`${key} must be provided through the environment to verify web obfuscation.`);
    process.exit(1);
  }
}

const protectedValues = uniqueEntries([
  { label: "email", value: vars.RESUME_EMAIL },
  { label: "mailto scheme", value: "mailto:" },
  { label: "email href", value: vars.RESUME_EMAIL ? `mailto:${vars.RESUME_EMAIL}` : undefined },
  { label: "phone", value: vars.RESUME_PHONE },
  { label: "normalized phone href", value: vars.RESUME_PHONE ? phoneHrefValue(vars.RESUME_PHONE) : undefined },
  { label: "tel scheme", value: "tel:" },
  { label: "phone href", value: vars.RESUME_PHONE ? phoneHref(vars.RESUME_PHONE) : undefined },
  { label: "email placeholder", value: "{{RESUME_EMAIL}}" },
  { label: "phone placeholder", value: "{{RESUME_PHONE}}" },
  { label: "phone href placeholder", value: "{{RESUME_PHONE_HREF}}" },
]);

const failures = [];

for (const file of listFiles(webDir)) {
  const contents = fs.readFileSync(file, "utf8");

  for (const entry of protectedValues) {
    if (contents.includes(entry.value)) {
      failures.push(`${file}: found unobfuscated ${entry.label}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Web obfuscation test failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Web obfuscation test passed for ${protectedValues.length} protected values.`);
