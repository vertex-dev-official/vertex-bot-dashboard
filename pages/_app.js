const { SessionProvider } = require("next-auth/react");
require("../styles/globals.css");

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

module.exports = App;
