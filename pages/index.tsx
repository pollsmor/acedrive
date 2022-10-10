import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

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

    console.log(session);
    if (session) getFiles();
  }, [session]);

  if (session) {
    return (
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
    );
  } else {
    return <a href='/api/auth/signin'>Sign in</a>
  }
};
