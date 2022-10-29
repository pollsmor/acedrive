import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import Welcome from '../components/Welcome';
import Banner from '../components/Banner';
import HomePage from '../components/HomePage';

export default function Home() {
  const { data: session, status } = useSession();
  const [viewing, setViewing] = useState('');

  if (status === 'loading') return;
  return (
    <>
      <Head>
        <title>AceDrive</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      { session ? 
        <HomePage accessToken={session.accessToken} /> : 
        <Welcome /> 
      }
    </>
  );
};
