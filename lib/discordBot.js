// ================================================================
// Appels a l'API Discord avec le TOKEN DU BOT (pas celui de l'utilisateur).
// Utilise pour: lister les salons d'un serveur, et publier/editer des
// embeds directement depuis le panel web, sans que le process du bot
// ait besoin d'etre modifie (le bot lit simplement la meme base ensuite).
// ================================================================

const API = "https://discord.com/api/v10";

function botHeaders() {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN manquant dans les variables d'environnement du panel web.");
  }
  return {
    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    "Content-Type": "application/json",
  };
}

const TEXT_LIKE_CHANNEL_TYPES = new Set([0, 5, 15]); // GUILD_TEXT, GUILD_ANNOUNCEMENT, GUILD_FORUM

/**
 * Liste les salons textuels d'un serveur (pour peupler le selecteur de destination dans l'editeur).
 */
async function getGuildChannels(guildId) {
  const res = await fetch(`${API}/guilds/${guildId}/channels`, { headers: botHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Impossible de recuperer les salons (${res.status}): ${body}`);
  }
  const channels = await res.json();
  return channels
    .filter((c) => TEXT_LIKE_CHANNEL_TYPES.has(c.type))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((c) => ({ id: c.id, name: c.name, type: c.type, parentId: c.parent_id }));
}

/**
 * Convertit un CustomEmbed (+ fields) sauvegarde en base vers le format JSON attendu par l'API Discord.
 */
function toDiscordEmbedPayload(embed) {
  const payload = {};
  if (embed.title) payload.title = embed.title;
  if (embed.titleUrl) payload.url = embed.titleUrl;
  if (embed.description) payload.description = embed.description;
  if (embed.color) payload.color = parseInt(embed.color.replace("#", ""), 16) || 0;
  if (embed.imageUrl) payload.image = { url: embed.imageUrl };
  if (embed.thumbnailUrl) payload.thumbnail = { url: embed.thumbnailUrl };
  if (embed.authorName) payload.author = { name: embed.authorName, icon_url: embed.authorIconUrl || undefined, url: embed.authorUrl || undefined };
  if (embed.footerText) payload.footer = { text: embed.footerText, icon_url: embed.footerIconUrl || undefined };
  if (embed.useTimestamp) payload.timestamp = new Date().toISOString();

  const fields = (embed.fields || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((f) => f.name && f.value)
    .map((f) => ({ name: f.name, value: f.value, inline: !!f.inline }));
  if (fields.length) payload.fields = fields;

  return payload;
}

/**
 * Envoie un nouveau message avec l'embed dans un salon donne.
 */
async function sendEmbedToChannel(channelId, embed) {
  const res = await fetch(`${API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: botHeaders(),
    body: JSON.stringify({
      content: embed.content || undefined,
      embeds: [toDiscordEmbedPayload(embed)],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord a refuse l'envoi (${res.status}): ${body}`);
  }
  return res.json();
}

/**
 * Edite un message existant (utilise quand on republie un embed deja envoye, pour le mettre a jour en place
 * plutot que de spammer un nouveau message a chaque modification).
 */
async function editEmbedMessage(channelId, messageId, embed) {
  const res = await fetch(`${API}/channels/${channelId}/messages/${messageId}`, {
    method: "PATCH",
    headers: botHeaders(),
    body: JSON.stringify({
      content: embed.content || undefined,
      embeds: [toDiscordEmbedPayload(embed)],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord a refuse la modification (${res.status}): ${body}`);
  }
  return res.json();
}

/**
 * Applique le pseudo et/ou l'avatar specifique a ce serveur pour le bot, via son propre profil de membre.
 * L'avatar par-serveur est une fonctionnalite recente de l'API Discord: on tente l'appel et on remonte
 * une erreur claire si Discord la refuse, sans jamais bloquer la sauvegarde des autres champs.
 */
async function updateSelfGuildProfile(guildId, { nick, avatarUrl } = {}) {
  const body = {};
  if (nick !== undefined) body.nick = nick || null;

  if (avatarUrl) {
    const imgRes = await fetch(avatarUrl);
    if (!imgRes.ok) throw new Error(`Impossible de telecharger l'avatar (HTTP ${imgRes.status}).`);
    const contentType = imgRes.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    if (buffer.byteLength > 8 * 1024 * 1024) throw new Error("L'image depasse la limite de 8 Mo autorisee par Discord.");
    body.avatar = `data:${contentType};base64,${buffer.toString("base64")}`;
  } else if (avatarUrl === null) {
    body.avatar = null;
  }

  const res = await fetch(`${API}/guilds/${guildId}/members/@me`, { method: "PATCH", headers: botHeaders(), body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord a refuse la mise a jour du profil (${res.status}): ${text}`);
  }
  return res.json();
}

module.exports = { getGuildChannels, sendEmbedToChannel, editEmbedMessage, toDiscordEmbedPayload, updateSelfGuildProfile };
