import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, ListGroup, Form, FormControl, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Banner from '../../components/Banner';
import AnalysisForm from '../../components/AnalysisForm';
import FileCard from '../../components/FileCard';
import FolderCard from '../../components/FolderCard';

export default function Snapshot() {
  const router = useRouter();
  const { snapshotID } = router.query;
  const [snapshot, setSnapshot] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    async function fetchSnapshot() {
      let snapshot = await axios.get('/api/getSnapshot', { 
        params: { id: snapshotID }
      });
      setSnapshot(snapshot.data);
      setFilteredFiles(snapshot.data.files);
    }

    if (snapshotID) fetchSnapshot();
  }, [snapshotID]);

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
    <Container fluid className='p-0'>
      <Banner />
      <Container className='text-center my-2'>
        <h3 className='fw-bold'>Snapshot {snapshotID}</h3>
        <h6>Taken: {snapshot.date}</h6>
      </Container>
      <Form onSubmit={onSearch} className='m-2'>
        <FormControl
          type='search'
          placeholder='Search...'
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </Form>
      <AnalysisForm snapshotID={snapshotID} />
      <ListGroup>{fileItems}</ListGroup>
    </Container>
  );
}