import axios from 'axios';
import { useState, useEffect } from 'react';
import {Container, Row, Form, FormControl, Col} from 'react-bootstrap';
import FileCard from './filecard';
import FolderCard from './foldercard';

export default function SearchResults(props) {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function fetchLatestSnapshot() {
      let res = await axios.post('/api/getUser');
      if (res.data.snapshotIDs.length > 0) {
        let snapshot = await axios.post('/api/getSnapshot', res.data.snapshotIDs[0])
          setFiles(snapshot.data.files);
      }
    }

    fetchLatestSnapshot();
  }, []);

  function onSearch(e) {
    e.preventDefault();
    if (query === '') return;

    console.log(`searching ${query}`)
    let search = new SearchQuery(query)
    filtered = FilterFiles(files, search)
  }

  return (
    <>
      <Form onSubmit={onSearch} className='d-flex'>
      <FormControl 
        type='search' 
        placeholder='Search...' 
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
    </Form>
      <Container>
        <Row>
            <Col>
              { files.map(f => {
                return (f.content? <FolderCard key={f.id} data={f}/> : <FileCard key={f.id} data={f}/>)
              }) }
            </Col>
        </Row>
      </Container>
    </>
  );
}