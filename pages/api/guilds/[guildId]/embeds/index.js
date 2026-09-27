const { requireManageableGuild } = require("../../../../../lib/guildAuth");
const { prisma } = require("../../../../../lib/prisma");
const { sanitizeEmbedFields } = require("../../../../../lib/embedFields");

module.exports = async function handler(req, res) {
  const { guildId } = req.query;
  const session = await requireManageableGuild(req, res, guildId);
  if (!session) return;

  if (req.method === "GET") {
    const embeds = await prisma.customEmbed.findMany({
      where: { guildId },
      orderBy: { updatedAt: "desc" },
      include: { fields: { orderBy: { order: "asc" } } },
    });
    return res.status(200).json({ embeds });
  }

  if (req.method === "POST") {
    const { name, content, fields, ...rest } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Le nom de l'embed est requis." });

    const existing = await prisma.customEmbed.findFirst({ where: { guildId, name: name.trim() } });
    if (existing) return res.status(409).json({ error: "Un embed avec ce nom existe deja." });

    // S'assure que le Guild existe (meme comportement que la page de config generale)
    await prisma.guild.upsert({ where: { id: guildId }, update: {}, create: { id: guildId } });

    const created = await prisma.customEmbed.create({
      data: {
        guildId,
        name: name.trim(),
        content: content || null,
        ...sanitizeEmbedFields(rest),
        fields: {
          create: (fields || []).map((f, i) => ({ name: f.name || "", value: f.value || "", inline: !!f.inline, order: i })),
        },
      },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return res.status(201).json({ embed: created });
  }

  return res.status(405).json({ error: "Methode non supportee" });
};
