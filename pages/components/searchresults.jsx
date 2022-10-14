import axios from 'axios';
import { useState, useEffect } from 'react';
import {Container, Row} from 'react-bootstrap';
import FileCard from './filecard';

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
                    <FileCard key={f.id} data={f}/>
              )
            }) }
        </Row>
      </Container>
  );
}