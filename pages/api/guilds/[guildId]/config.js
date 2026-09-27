const { getServerSession } = require("next-auth/next");
const { authOptions } = require("../../../../lib/authOptions");
const { prisma } = require("../../../../lib/prisma");
const { fetchManageableGuilds } = require("../../../../lib/discord");

module.exports = async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non authentifie" });

  const { guildId } = req.query;

  // Verifie que l'utilisateur a bien le droit de gerer ce serveur avant toute lecture/ecriture
  const manageable = await fetchManageableGuilds(session.accessToken);
  if (!manageable.some((g) => g.id === guildId)) {
    return res.status(403).json({ error: "Tu n'as pas la permission de gerer ce serveur." });
  }

  if (req.method === "GET") {
    const guild = await prisma.guild.upsert({
      where: { id: guildId },
      update: {},
      create: { id: guildId },
    });
    const [levelRewards, shopItems, ticketCategories] = await Promise.all([
      prisma.levelReward.findMany({ where: { guildId } }),
      prisma.shopItem.findMany({ where: { guildId } }),
      prisma.ticketCategory.findMany({ where: { guildId } }),
    ]);
    // La cle API IA ne quitte jamais le serveur en clair : on ne renvoie qu'un indicateur de presence.
    const { aiApiKey, ...safeGuild } = guild;
    return res.status(200).json({ guild: { ...safeGuild, hasAiKey: !!aiApiKey }, levelRewards, shopItems, ticketCategories });
  }

  if (req.method === "POST") {
    const allowedFields = [
      "embedColor",
      "economyEnabled",
      "levelingEnabled",
      "moderationEnabled",
      "ticketsEnabled",
      "musicEnabled",
      "gamesEnabled",
      "captchaEnabled",
      "confessionsEnabled",
      "welcomeChannelId",
      "welcomeMessage",
      "leaveChannelId",
      "leaveMessage",
      "logsChannelId",
      "confessionChannelId",
      "levelUpChannelId",
      "levelUpMessage",
      "xpPerMessage",
      "xpCooldown",
      "currencyName",
      "currencySymbol",
      "dailyAmount",
      "workMin",
      "workMax",
      "automodConfig",
      "aiEnabled",
      "aiChannelId",
      "botNickname",
      "botBio",
      "botAvatarUrl",
      "botBannerUrl",
    ];

    const data = {};
    for (const field of allowedFields) {
      if (field in req.body) data[field] = req.body[field];
    }

    const updated = await prisma.guild.update({ where: { id: guildId }, data });
    return res.status(200).json({ guild: updated });
  }

  return res.status(405).json({ error: "Methode non supportee" });
};
