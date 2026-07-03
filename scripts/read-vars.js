const fs = require("fs");

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function readFrontmatter(file) {
  const values = {};
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) return values;

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const pair = trimmed.match(/^([A-Z0-9_]+):\s*(.*)$/);
    if (!pair) continue;

    values[pair[1]] = unquote(pair[2].trim()).replace(/\\n/g, "\n");
  }

  // Keep contact values out of the public repo; CI/local builds inject them as
  // secret environment variables instead of reading them from frontmatter.
  for (const key of ["RESUME_EMAIL", "RESUME_PHONE"]) {
    delete values[key];
    if (Object.prototype.hasOwnProperty.call(process.env, key)) values[key] = process.env[key];
  }

  return values;
}

module.exports = { readVars: readFrontmatter };
