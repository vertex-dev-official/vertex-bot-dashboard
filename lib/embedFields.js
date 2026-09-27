// Champs du modele CustomEmbed modifiables depuis le panel (liste blanche,
// evite d'injecter des cles arbitraires dans Prisma via le body de la requete).
const ALLOWED_EMBED_FIELDS = [
  "title",
  "titleUrl",
  "description",
  "color",
  "authorName",
  "authorIconUrl",
  "authorUrl",
  "imageUrl",
  "thumbnailUrl",
  "footerText",
  "footerIconUrl",
  "useTimestamp",
];

function sanitizeEmbedFields(input) {
  const out = {};
  for (const key of ALLOWED_EMBED_FIELDS) {
    if (key in input) out[key] = input[key];
  }
  return out;
}

module.exports = { ALLOWED_EMBED_FIELDS, sanitizeEmbedFields };
