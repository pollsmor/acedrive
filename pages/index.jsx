import Head from 'next/head';
import { useSession } from 'next-auth/react';
import Banner from './components/banner';
import Welcome from './components/welcome';

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>AceDrive</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Banner session={session} />
      {/* If session is found, render home page. Else, render a welcome screen. */}
      { session ? 
        'Hello World' :
        <Welcome />
      }
    </>
  );
};
