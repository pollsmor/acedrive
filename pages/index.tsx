import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return 'Signed in!';
  } else {
    return 'Not signed in.';
  }
};
