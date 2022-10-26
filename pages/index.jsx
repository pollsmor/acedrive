import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import WelcomePage from './WelcomePage';
import HomePage from './HomePage';
import Banner from './components/Banner';
import FileViewWindow from './components/FileViewWindow'; // Not used yet afaik?

export default function Home() {
  const { data: session, status } = useSession();
  const [viewing, setViewing] = useState('')

  function handleView(selectedFiles) {
    setViewing(selectedFiles[0]);
  }

  if (status === 'loading') return;
  else if (!session) return <WelcomePage />;
  return (
    <>
      <Head>
        <title>AceDrive</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <Banner session={session} />
      { viewing === '' ? 
        <HomePage accessToken={session.accessToken} viewCallback={handleView} /> : 
        <FileViewWindow accessToken={session.accessToken} snapshotID={viewing} closeViewCallback={() => setViewing('')} />
      }
    </>
  );
};
