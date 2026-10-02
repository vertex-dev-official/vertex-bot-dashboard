const { getServerSession } = require("next-auth/next");
const nextLinkModule = require("next/link");
const Link = nextLinkModule.default || nextLinkModule;
const { authOptions } = require("../../lib/authOptions");
const { fetchManageableGuilds } = require("../../lib/discord");
const { prisma } = require("../../lib/prisma");

async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) return { redirect: { destination: "/", permanent: false } };

  const guilds = await fetchManageableGuilds(session.accessToken);
  const botGuilds = await prisma.guild.findMany({ where: { id: { in: guilds.map((g) => g.id) } } });
  const botGuildIds = new Set(botGuilds.map((g) => g.id));

  const enriched = guilds.map((g) => ({ ...g, botPresent: botGuildIds.has(g.id) }));

  return { props: { guilds: enriched } };
}

function Dashboard({ guilds }) {
  const inviteUrl = process.env.NEXT_PUBLIC_BOT_INVITE_URL || "#";

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Tes serveurs</h1>

      <div className="grid gap-4">
        {guilds.map((g) => (
          <div key={g.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {g.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center font-bold">{g.name?.[0]}</div>
              )}
              <span className="font-semibold">{g.name}</span>
            </div>

            {g.botPresent ? (
              <Link href={`/dashboard/${g.id}`} className="btn-primary">
                Configurer
              </Link>
            ) : (
              <a href={`${inviteUrl}&guild_id=${g.id}`} target="_blank" rel="noreferrer" className="btn-primary opacity-70">
                Inviter le bot
              </a>
            )}
          </div>
        ))}

        {!guilds.length && <p className="text-gray-400">Aucun serveur ou tu as la permission "Gerer le serveur" n'a ete trouve.</p>}
      </div>
    </main>
  );
}

module.exports = Dashboard;
module.exports.getServerSideProps = getServerSideProps;
