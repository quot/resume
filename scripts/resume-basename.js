#!/usr/bin/env node
const { readVars } = require("./read-vars");

const inputFile = process.argv[2] || "resume.md";
const name = readVars(inputFile).RESUME_NAME || "";

if (!name) {
  console.error(`Missing RESUME_NAME in frontmatter of ${inputFile}.`);
  process.exit(1);
}

const slug = name
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\s+/g, "_")
  .replace(/[^a-z_]/g, "")
  .replace(/_+/g, "_")
  .replace(/^_+|_+$/g, "");

if (!slug) {
  console.error(`RESUME_NAME in ${inputFile} did not produce a usable filename.`);
  process.exit(1);
}

process.stdout.write(`${slug}_resume`);
