#!/usr/bin/env node

const fs = require("fs");
const { readVars } = require("./read-vars");

const inputFile = process.argv[2] || "resume.md";
const outputFile = process.argv[3] || "build/resume.rendered.md";

if (!fs.existsSync(inputFile)) {
  console.error(`Missing source file: ${inputFile}`);
  process.exit(1);
}

const vars = readVars(inputFile);
const source = fs.readFileSync(inputFile, "utf8");
const rendered = source.replace(/\{\{([A-Z0-9_]+)\}\}/g, (placeholder, key) => {
  return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : placeholder;
});

const unresolved = rendered.match(/\{\{[A-Z0-9_]+\}\}/);
if (unresolved) {
  console.error(`Error: ${outputFile} still contains unresolved placeholders.`);
  console.error(`Provide required variables through make arguments, for example:`);
  console.error(`  make RESUME_EMAIL="person@example.com" RESUME_PHONE="+1 (555) 000-0000"`);
  console.error(`Or through environment variables, for example:`);
  console.error(`  RESUME_EMAIL="person@example.com" RESUME_PHONE="+1 (555) 000-0000" make`);
  process.exit(1);
}

fs.writeFileSync(outputFile, rendered);
