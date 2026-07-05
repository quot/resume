#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { phoneHref } = require("../scripts/contact-links");
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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const vars = readVars(varsFile);
const protectedValues = unique([
  vars.RESUME_EMAIL,
  "mailto:",
  vars.RESUME_EMAIL ? `mailto:${vars.RESUME_EMAIL}` : undefined,
  vars.RESUME_PHONE,
  "tel:",
  vars.RESUME_PHONE ? phoneHref(vars.RESUME_PHONE) : undefined,
]);

if (protectedValues.length === 0) {
  console.error("No protected contact values found in resume frontmatter.");
  process.exit(1);
}

const failures = [];

for (const file of listFiles(webDir)) {
  const contents = fs.readFileSync(file, "utf8");

  for (const value of protectedValues) {
    if (contents.includes(value)) {
      failures.push(`${file}: found unobfuscated value ${JSON.stringify(value)}`);
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
