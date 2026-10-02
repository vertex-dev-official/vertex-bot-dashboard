const { useSession, signIn, signOut } = require("next-auth/react");
const nextLinkModule = require("next/link");
const Link = nextLinkModule.default || nextLinkModule;

function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        Panel de configuration <span className="text-accent">Vertex Bot</span>
      </h1>
      <p className="text-lg text-gray-300 max-w-xl mb-10">
        Economie, niveaux, moderation, tickets, musique, mini-jeux, giveaways, roles-reaction...
        Configure tout ton bot Discord sans jamais toucher au code.
      </p>

      {status === "loading" && <p>Chargement...</p>}

      {!session && status !== "loading" && (
        <button className="btn-primary text-lg" onClick={() => signIn("discord")}>
          Se connecter avec Discord
        </button>
      )}

      {session && (
        <div className="flex flex-col items-center gap-4">
          <p>
            Connecte en tant que <strong>{session.user?.name}</strong>
          </p>
          <Link href="/dashboard" className="btn-primary text-lg">
            Acceder au dashboard
          </Link>
          <button className="text-sm text-gray-400 underline" onClick={() => signOut()}>
            Se deconnecter
          </button>
        </div>
      )}
    </main>
  );
}

module.exports = Home;
