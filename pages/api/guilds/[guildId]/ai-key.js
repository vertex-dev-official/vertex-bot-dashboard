const { requireManageableGuild } = require("../../../../lib/guildAuth");
const { prisma } = require("../../../../lib/prisma");

const VALID_PROVIDERS = ["anthropic", "openai", "groq"];

/**
 * Route dediee (separee de /config) pour que la cle API IA du serveur ne transite
 * jamais via le formulaire de config general ni ne soit renvoyee en clair au navigateur.
 */
module.exports = async function handler(req, res) {
  const { guildId } = req.query;
  const session = await requireManageableGuild(req, res, guildId);
  if (!session) return;

  if (req.method === "POST") {
    const { provider, apiKey, remove } = req.body;

    if (remove) {
      await prisma.guild.upsert({
        where: { id: guildId },
        update: { aiProvider: null, aiApiKey: null },
        create: { id: guildId },
      });
      return res.status(200).json({ hasAiKey: false });
    }

    if (!VALID_PROVIDERS.includes(provider)) return res.status(400).json({ error: "Fournisseur invalide." });
    if (!apiKey || !apiKey.trim()) return res.status(400).json({ error: "La cle API est requise." });

    await prisma.guild.upsert({
      where: { id: guildId },
      update: { aiProvider: provider, aiApiKey: apiKey.trim() },
      create: { id: guildId, aiProvider: provider, aiApiKey: apiKey.trim() },
    });

    return res.status(200).json({ hasAiKey: true, provider });
  }

  return res.status(405).json({ error: "Methode non supportee" });
};
