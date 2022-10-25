import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react'
import Banner from './components/banner';
import Welcome from './components/welcome';
import FileViewWindow from './components/fileviewwindow';
import HomePage from './components/homepage.jsx'

export default function Home() {
  const { data: session, status } = useSession();
  const [viewing, setViewing] = useState("")

  function handleView(selectedFiles) {
    setViewing(selectedFiles[0])
  }

  function closeView() {
    setViewing("")
  }

  if (status === 'loading') return null;
  return (
    <>
      <Head>
        <title>AceDrive</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Banner session={session} />
      {/* If session is found, render home page. Else, render a welcome screen. */}
      {session ?
        (viewing === "" ? <HomePage accessToken={session.accessToken} viewCallback={handleView} /> :
          <FileViewWindow accessToken={session.accessToken} snapshotID={viewing} closeViewCallback={closeView} />) :
        <Welcome />
      }
    </>
  );
};
