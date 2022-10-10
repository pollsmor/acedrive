import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

export default function MyApp({ Component, pageProps }: AppProps) {
  const { session } = pageProps;

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};
