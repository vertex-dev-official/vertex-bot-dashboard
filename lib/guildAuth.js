const { getServerSession } = require("next-auth/next");
const { authOptions } = require("./authOptions");
const { fetchManageableGuilds } = require("./discord");

/**
 * Verifie que l'utilisateur connecte a bien le droit de gerer ce serveur.
 * Retourne la session si OK, ou envoie directement la reponse d'erreur (401/403) et retourne null.
 * Usage: const session = await requireManageableGuild(req, res, guildId); if (!session) return;
 */
async function requireManageableGuild(req, res, guildId) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Non authentifie" });
    return null;
  }

  const manageable = await fetchManageableGuilds(session.accessToken);
  if (!manageable.some((g) => g.id === guildId)) {
    res.status(403).json({ error: "Tu n'as pas la permission de gerer ce serveur." });
    return null;
  }

  return session;
}

module.exports = { requireManageableGuild };
