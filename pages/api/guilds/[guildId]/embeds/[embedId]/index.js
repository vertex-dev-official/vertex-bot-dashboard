const { requireManageableGuild } = require("../../../../../../lib/guildAuth");
const { prisma } = require("../../../../../../lib/prisma");
const { sanitizeEmbedFields } = require("../../../../../../lib/embedFields");

module.exports = async function handler(req, res) {
  const { guildId, embedId } = req.query;
  const session = await requireManageableGuild(req, res, guildId);
  if (!session) return;

  const existing = await prisma.customEmbed.findFirst({ where: { id: embedId, guildId } });
  if (!existing) return res.status(404).json({ error: "Embed introuvable." });

  if (req.method === "GET") {
    const embed = await prisma.customEmbed.findUnique({
      where: { id: embedId },
      include: { fields: { orderBy: { order: "asc" } } },
    });
    return res.status(200).json({ embed });
  }

  if (req.method === "PUT") {
    const { name, content, fields, ...rest } = req.body;

    if (name && name.trim() && name.trim() !== existing.name) {
      const clash = await prisma.customEmbed.findFirst({ where: { guildId, name: name.trim(), NOT: { id: embedId } } });
      if (clash) return res.status(409).json({ error: "Un embed avec ce nom existe deja." });
    }

    // On remplace entierement les champs (fields) a chaque sauvegarde: plus simple et fiable
    // qu'un diff, et le nombre de champs par embed reste petit (limite Discord = 25).
    await prisma.embedField.deleteMany({ where: { embedId } });

    const updated = await prisma.customEmbed.update({
      where: { id: embedId },
      data: {
        ...(name && name.trim() ? { name: name.trim() } : {}),
        content: content ?? null,
        ...sanitizeEmbedFields(rest),
        fields: {
          create: (fields || []).map((f, i) => ({ name: f.name || "", value: f.value || "", inline: !!f.inline, order: i })),
        },
      },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return res.status(200).json({ embed: updated });
  }

  if (req.method === "DELETE") {
    await prisma.customEmbed.delete({ where: { id: embedId } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Methode non supportee" });
};
