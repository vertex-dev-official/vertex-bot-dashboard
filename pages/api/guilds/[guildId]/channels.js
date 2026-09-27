const { requireManageableGuild } = require("../../../../lib/guildAuth");
const { getGuildChannels } = require("../../../../lib/discordBot");

module.exports = async function handler(req, res) {
  const { guildId } = req.query;
  const session = await requireManageableGuild(req, res, guildId);
  if (!session) return;

  if (req.method !== "GET") return res.status(405).json({ error: "Methode non supportee" });

  try {
    const channels = await getGuildChannels(guildId);
    return res.status(200).json({ channels });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
