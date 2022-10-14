import axios from 'axios';
import { useState, useEffect } from 'react';
import { Table, Container } from 'react-bootstrap';

export default function SearchResults(props) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function fetchLatestSnapshot() {
      let res = await axios.post('/api/getUser');
      if (res.data.snapshots.length > 0) {
        let snapshot = res.data.snapshots[0];
        setFiles(snapshot);
      }
    }

    fetchLatestSnapshot();
  }, []);

  return (
    <>
      <Container fluid>
        <h3>Contents from the latest snapshot:</h3>
      </Container>
      <Table responsive striped bordered>
        <tbody>
        { files.map(f => {
          return (
            <tr key={f.id}>
              <td style={{ 'wordBreak': 'break-all', 'fontSize': '12px' }}>{JSON.stringify(f)}</td>
            </tr>
          );
        }) }
        </tbody>
      </Table>
    </>
  );
}