import axios from 'axios';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
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
        <a href='/api/auth/signout'>
          <Button variant='primary'>Sign out</Button>
        </a>
        <table>
          <tbody>
            { files.map(f => {
              return (
                <tr key={f.id}>
                  <td>{f.name}</td>
                </tr>
              );
            }) }
          </tbody>
        </table>
      </>
    );
  } else {
    return (
      <a href='/api/auth/signin'>
        <Button variant='primary'>Sign in</Button>
      </a>
    );
  }
};
