import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';

export default function OneDriveTest() {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function getFiles() {
      let fileData = await axios.get('/api/getOneDriveFiles');
      console.log(fileData.data);
      setFiles(fileData.data);
    }

    if (session) getFiles();
  }, [session])

  return session ? (
    <ListGroup>
      { files.map(f => {
        return (
          <ListGroup.Item key={f.id}>
            <pre>{ JSON.stringify(f, null, 2) }</pre>
          </ListGroup.Item>
        );
      }) }
    </ListGroup>
   ) : 'Not signed in.';
};
