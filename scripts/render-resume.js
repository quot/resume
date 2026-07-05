#!/usr/bin/env node

const fs = require("fs");
const { phoneHrefValue } = require("./contact-links");
const { readVars } = require("./read-vars");

const args = process.argv.slice(2);
const preserveContactPlaceholders = args[0] === "--preserve-contact-placeholders";
if (preserveContactPlaceholders) args.shift();

const contactPlaceholderKeys = new Set(["RESUME_EMAIL", "RESUME_PHONE", "RESUME_PHONE_HREF"]);
const inputFile = args[0] || "resume.md";
const outputFile = args[1] || "build/resume.rendered.md";

if (!fs.existsSync(inputFile)) {
  console.error(`Missing source file: ${inputFile}`);
  process.exit(1);
}

const vars = readVars(inputFile);
if (vars.RESUME_PHONE) {
  vars.RESUME_PHONE_HREF = phoneHrefValue(vars.RESUME_PHONE);
}
const source = fs.readFileSync(inputFile, "utf8");
const rendered = source.replace(/\{\{([A-Z0-9_]+)\}\}/g, (placeholder, key) => {
  if (preserveContactPlaceholders && contactPlaceholderKeys.has(key)) return placeholder;

  return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : placeholder;
});

const unresolved = [...rendered.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)]
  .filter((match) => !preserveContactPlaceholders || !contactPlaceholderKeys.has(match[1]));
if (unresolved.length > 0) {
  console.error(`Error: ${outputFile} still contains unresolved placeholders.`);
  console.error(`Set required variables in the environment, then rerun make.`);
  process.exit(1);
}

fs.writeFileSync(outputFile, rendered);
