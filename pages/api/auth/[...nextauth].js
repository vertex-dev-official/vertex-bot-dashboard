// Selon comment le bundler de Vercel/Next interprete le package next-auth (module ESM ou CJS),
// l'export utile se trouve tantot sur .default, tantot directement sur l'objet require() -
// on gere les deux cas pour eviter un module.exports vide qui ferait planter toutes les routes
// d'authentification ("Page /api/auth/[...nextauth] does not export a default function").
const nextAuthModule = require("next-auth");
const NextAuth = nextAuthModule.default || nextAuthModule;
const { authOptions } = require("../../../lib/authOptions");

module.exports = NextAuth(authOptions);
