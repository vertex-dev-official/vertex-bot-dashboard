const MANAGE_GUILD = 0x20;

/**
 * Recupere les serveurs Discord de l'utilisateur connecte et ne garde que
 * ceux ou il a la permission "Gerer le serveur" (seuls ceux-la sont editables ici).
 */
async function fetchManageableGuilds(accessToken) {
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const guilds = await res.json();
  return guilds.filter((g) => (g.permissions & MANAGE_GUILD) === MANAGE_GUILD || g.owner);
}

module.exports = { fetchManageableGuilds };
