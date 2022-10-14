import axios from 'axios';
import { useState, useEffect } from 'react';
import { Table, Container, Row, Col} from 'react-bootstrap';
import File from './file';

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
      <Container fluid="lg">
        <Row>
            { files.map(f => {
              return (
                    <File key={f.id} data={f}/>
              )
            }) }
        </Row>
      </Container>
  );
}


// return (
//   <tr key={f.id}>
//     <td style={{ 'wordBreak': 'break-all', 'fontSize': '12px' }}>{JSON.stringify(f)}</td>
//   </tr>
// );