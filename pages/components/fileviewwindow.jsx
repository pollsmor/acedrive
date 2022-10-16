import axios from 'axios';
import { useState, useEffect } from 'react';
import {Container, Row, Form, FormControl, Col, Button} from 'react-bootstrap';
import FileCard from './filecard';
import FolderCard from './foldercard';

export default function FileViewWindow(props) {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');
  const snapshotID = props.snapshotID

  useEffect(() => {

    async function fetchSnapshot() {
        let snapshot = await axios.post('/api/getSnapshot', {id: snapshotID})
        setFiles(snapshot.data.files);
      }
  
      fetchSnapshot()
  }, []);

  function onSearch(e) {
    e.preventDefault();
    if (query === '') return;

    console.log(`searching ${query}`)
    let search = new SearchQuery(query)
    filtered = FilterFiles(files, search)
  }

  function closeView() {
    props.closeViewCallback()
  }
 
  return (
    <>
      <Button onClick={closeView} variant='danger'>Close File View</Button>
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