function phoneHrefValue(value) {
  if (!value) return "";

  return value.replace(/[^0-9+]/g, "").replace(/(?!^)\+/g, "");
}

function phoneHref(value) {
  const normalized = phoneHrefValue(value);
  return normalized ? `tel:${normalized}` : undefined;
}

module.exports = { phoneHref, phoneHrefValue };
