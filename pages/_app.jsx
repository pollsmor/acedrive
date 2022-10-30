import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';

export default function MyApp({ Component, pageProps }) {
  const { session } = pageProps;

  return (
    <SessionProvider session={session}>
      <Head>
        <title>AceDrive</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
};
