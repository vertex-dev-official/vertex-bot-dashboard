const { requireManageableGuild } = require("../../../../../../lib/guildAuth");
const { prisma } = require("../../../../../../lib/prisma");
const { sendEmbedToChannel, editEmbedMessage } = require("../../../../../../lib/discordBot");

module.exports = async function handler(req, res) {
  const { guildId, embedId } = req.query;
  const session = await requireManageableGuild(req, res, guildId);
  if (!session) return;

  if (req.method !== "POST") return res.status(405).json({ error: "Methode non supportee" });

  const embed = await prisma.customEmbed.findFirst({
    where: { id: embedId, guildId },
    include: { fields: { orderBy: { order: "asc" } } },
  });
  if (!embed) return res.status(404).json({ error: "Embed introuvable." });

  const { channelId, updateLastMessage } = req.body;
  if (!channelId) return res.status(400).json({ error: "Salon de destination requis." });

  try {
    let result;
    // Si on republie dans le MEME salon que la derniere fois et qu'on a demande une mise a jour
    // en place, on edite le message existant plutot que d'en renvoyer un nouveau.
    if (updateLastMessage && embed.lastSentChannelId === channelId && embed.lastSentMessageId) {
      result = await editEmbedMessage(channelId, embed.lastSentMessageId, embed);
    } else {
      result = await sendEmbedToChannel(channelId, embed);
    }

    await prisma.customEmbed.update({
      where: { id: embed.id },
      data: { lastSentChannelId: channelId, lastSentMessageId: result.id },
    });

    return res.status(200).json({ messageId: result.id, channelId });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
