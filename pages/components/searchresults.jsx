import axios from 'axios';
import { useState, useEffect } from 'react';
import {Container, Row, Form, FormControl} from 'react-bootstrap';
import FileCard from './filecard';
import SearchQuery from '../searchQuery';

export default function SearchResults(props) {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');

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

  function onSearch(e) {
    e.preventDefault();
    if (query === '') return;

    console.log(`searching ${query}`)
    let search = new SearchQuery(query)
    if(search.valid === false){
      setQuery("invalid")
      return
    }
    else {
      filtered = FilterFiles(files, search)
    }
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
      <Container fluid="lg">
        <Row>
            { files.map(f => {
              return (
                    <FileCard key={f.id} data={f}/>
              )
            }) }
        </Row>
      </Container>
    </>
  );
}
