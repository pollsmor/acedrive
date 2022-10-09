import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { google } from 'googleapis';

export default function Home() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      console.log(session.access_token);
    }
  }, [session]);

  if (session) {
    return 'Signed in!';
  } else {
    return 'Not signed in.';
  }
};
