const NextAuth = require("next-auth").default;
const { authOptions } = require("../../../lib/authOptions");

module.exports = NextAuth(authOptions);
