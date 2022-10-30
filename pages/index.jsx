import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import Welcome from '../components/Welcome';
import HomePage from '../components/HomePage';

export default function Home() {
  const { data: session, status } = useSession();
  const [viewing, setViewing] = useState('');

  if (status === 'loading') return;
  return (
    session ? 
      <HomePage accessToken={session.accessToken} /> : 
      <Welcome /> 
  );
};
