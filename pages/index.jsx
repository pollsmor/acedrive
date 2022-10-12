import Head from 'next/head';
import { useSession } from 'next-auth/react';
import Banner from './components/banner';
import Welcome from './components/welcome';
import SearchResults from './components/searchresults';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  } else {
    return (
      <>
        <Head>
          <title>AceDrive</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Banner session={session} />
        {/* If session is found, render home page. Else, render a welcome screen. */}
        { session ? 
          <SearchResults accessToken={session.accessToken} /> :
          <Welcome token={session.accessToken} />
        }
      </>
    );
  }
};
