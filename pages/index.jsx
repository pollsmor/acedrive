import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from 'react-bootstrap';

export default function Home() {
  const { data: session } = useSession();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function getFiles() {
      let fileData = await axios.post('/api/google', {
        accessToken: session.accessToken
      });
      setFiles(fileData.data.files);
    }

    if (session) getFiles();
  }, [session]);

  if (session) {
    return (
      <>
        <Link href='/api/auth/signout'>
          <Button variant='primary'>Sign out</Button>
        </Link>
        <table>
          <tbody>
            { files.map(f => {
              return (
                <tr key={f.id}>
                  <td>{JSON.stringify(f)}</td>
                </tr>
              );
            }) }
          </tbody>
        </table>
      </>
    );
  } else {
    return (
      <Link href='/api/auth/signin'>
        <Button variant='primary'>Sign in</Button>
      </Link>
    );
  }
};
