import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, ListGroup, Form, FormControl } from 'react-bootstrap';
import { useRouter } from 'next/router';
import FileCard from '../../components/FileCard';
import FolderCard from '../../components/FolderCard';
import Banner from '../../components/Banner';

export default function Snapshot() {
  const router = useRouter();
  const { snapshotID } = router.query;
  const [files, setFiles] = useState([]); // Never changes after initial load
  const [query, setQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    async function fetchSnapshot() {
      let snapshot = await axios.get('/api/getSnapshot', { 
        params: { id: snapshotID }
      });
      setFiles(snapshot.data.files);
      setFilteredFiles(snapshot.data.files);
    }

    if (snapshotID) fetchSnapshot();
  }, [snapshotID])

  function onSearch(e) {
    e.preventDefault();
    if (query === '') return;
    console.log(`Searching ${query}...`);

    //setFilteredFiles(SearchQuery(query));
  }

  let fileItems = filteredFiles.map(f => {
    return (
      <ListGroup.Item key={f.id}>
        { f.isFolder ? <FolderCard file={f} /> : <FileCard file={f} /> }
      </ListGroup.Item>
    )
  });
  return (
    <>
      <Banner />
      <Form onSubmit={onSearch} className='m-2'>
        <FormControl
          type='search'
          placeholder='Search...'
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </Form>
      <ListGroup>{fileItems}</ListGroup>
    </>
  );
}