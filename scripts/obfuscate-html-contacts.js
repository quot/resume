#!/usr/bin/env node
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { readVars } = require("./read-vars");

const varsFile = process.argv[2] || "resume.md";
const htmlFile = process.argv[3] || "build/web/index.html";
const scriptFile = process.argv[4] || "build/web/contact.js";
const scriptSrc = process.argv[5] || path.relative(path.dirname(htmlFile), scriptFile).replace(/\\/g, "/");

// This is deliberate bot-scraping resistance for the public web build. It does
// not provide cryptographic secrecy because the decrypting script ships too.

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phoneHref(value) {
  const normalized = value.replace(/[^0-9+]/g, "").replace(/(?!^)\+/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

function phoneSourceHref(value) {
  return `tel:${encodeURI(value)}`;
}

function encrypt(key, value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${Buffer.concat([ciphertext, tag]).toString("base64url")}`;
}

function obfuscatedLink(key, label, href, fallback) {
  return `<a href="#" rel="nofollow noindex" data-obfuscated-contact data-text="${encrypt(key, label)}" data-href="${encrypt(key, href)}">${fallback}</a>`;
}

function obfuscatedText(key, text, fallback) {
  return `<span data-obfuscated-contact data-text="${encrypt(key, text)}">${fallback}</span>`;
}

const vars = readVars(varsFile);
let html = fs.readFileSync(htmlFile, "utf8");
const key = crypto.randomBytes(32);

const contacts = [
  {
    label: vars.RESUME_EMAIL,
    href: vars.RESUME_EMAIL ? `mailto:${vars.RESUME_EMAIL}` : undefined,
    sourceHrefs: vars.RESUME_EMAIL ? [`mailto:${vars.RESUME_EMAIL}`] : [],
    fallback: "email",
  },
  {
    label: vars.RESUME_PHONE,
    href: vars.RESUME_PHONE ? phoneHref(vars.RESUME_PHONE) : undefined,
    sourceHrefs: vars.RESUME_PHONE ? [`tel:${vars.RESUME_PHONE}`, phoneSourceHref(vars.RESUME_PHONE)] : [],
    fallback: "phone",
  },
].filter((contact) => contact.label && contact.href);

for (const contact of contacts) {
  const label = escapeHtml(contact.label);

  for (const sourceHref of contact.sourceHrefs) {
    const href = escapeHtml(sourceHref);
    const linkPattern = new RegExp(
      `<a\\s+href="${escapeRegExp(href)}">${escapeRegExp(label)}</a>`,
      "g",
    );

    html = html.replace(
      linkPattern,
      obfuscatedLink(key, contact.label, contact.href, contact.fallback),
    );
  }

  html = html.replace(
    new RegExp(escapeRegExp(label), "g"),
    obfuscatedText(key, contact.label, contact.fallback),
  );
}

const decryptScript = `(() => {
  const key = "${key.toString("base64")}";
  const decoder = new TextDecoder();

  const bytes = (value) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  };

  async function decrypt(payload) {
    const [iv, encrypted] = payload.split(".").map(bytes);
    const cryptoKey = await crypto.subtle.importKey("raw", bytes(key), "AES-GCM", false, ["decrypt"]);
    return decoder.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, encrypted));
  }

  async function revealContacts() {
    for (const element of document.querySelectorAll("[data-obfuscated-contact]")) {
      element.textContent = await decrypt(element.dataset.text);
      if (element.dataset.href) {
        element.setAttribute("href", await decrypt(element.dataset.href));
      }
    }
  }

  if (window.crypto && window.crypto.subtle) {
    revealContacts().catch(() => {});
  }
})();
`;

const scriptTag = `<script src="${scriptSrc}" defer></script>`;

if (html.includes("</head>")) {
  html = html.replace("</head>", `  ${scriptTag}\n</head>`);
} else if (html.includes("</body>")) {
  html = html.replace("</body>", `${scriptTag}\n</body>`);
} else {
  html += `\n${scriptTag}\n`;
}

fs.writeFileSync(htmlFile, html);
fs.writeFileSync(scriptFile, decryptScript);
