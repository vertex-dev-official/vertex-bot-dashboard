const { requireManageableGuild } = require("../../../../lib/guildAuth");
const { prisma } = require("../../../../lib/prisma");
const { updateSelfGuildProfile } = require("../../../../lib/discordBot");

module.exports = async function handler(req, res) {
  const { guildId } = req.query;
  const session = await requireManageableGuild(req, res, guildId);
  if (!session) return;

  if (req.method !== "POST") return res.status(405).json({ error: "Methode non supportee" });

  const { nickname, avatarUrl, bannerUrl, bio } = req.body;

  // On sauvegarde toujours ce qui est fourni, meme si l'appel a Discord echoue ensuite -
  // bio/banniere n'ont de toute facon pas d'equivalent natif Discord par serveur.
  await prisma.guild.upsert({
    where: { id: guildId },
    update: {
      ...(nickname !== undefined ? { botNickname: nickname } : {}),
      ...(avatarUrl !== undefined ? { botAvatarUrl: avatarUrl } : {}),
      ...(bannerUrl !== undefined ? { botBannerUrl: bannerUrl } : {}),
      ...(bio !== undefined ? { botBio: bio } : {}),
    },
    create: { id: guildId, botNickname: nickname || null, botAvatarUrl: avatarUrl || null, botBannerUrl: bannerUrl || null, botBio: bio || null },
  });

  try {
    await updateSelfGuildProfile(guildId, { nick: nickname, avatarUrl: avatarUrl || undefined });
    return res.status(200).json({ applied: true });
  } catch (err) {
    // Sauvegarde en base reussie, mais Discord a refuse d'appliquer nick/avatar : on le signale sans faire echouer la requete.
    return res.status(200).json({ applied: false, warning: err.message });
  }
};
