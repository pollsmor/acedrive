import axios from 'axios';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Banner from '../../components/Banner';
import FileCard from '../../components/FileCard';
import FolderCard from '../../components/FolderCard';
import AnalysisForm from '../../components/AnalysisForm';

import { Container, ListGroup, Form, FormControl } from 'react-bootstrap';

export default function Snapshot() {
  
  const router = useRouter();
  const { snapshotID } = router.query;

  const [query, setQuery] = useState('');
  const [snapshot, setSnapshot] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    async function fetchSnapshot() {
      try {
        let snapshot = await axios.get('/api/getSnapshot', { 
          params: { id: snapshotID }
        });
        setSnapshot(snapshot.data);
        setFilteredFiles(snapshot.data.files);
      } catch (err) {
        alert('This is not a valid snapshot ID.');
        window.location.href = '/';
      }
    }

    if (snapshotID) fetchSnapshot();
  }, [snapshotID]);

  const fetchSnapshotSearch = async(snapshotId,query) =>{
      try {
        const results = await axios.get('/api/searchSnapShot', { 
          params: { id: snapshotId ,query: query}
        });
        return (results.data)
      } catch (err) {
        alert('Nothing Matched The Query');
      }
  }

  const searchSnapShot = async (e) => {
    e.preventDefault();  
    const searchedFiles = await fetchSnapshotSearch(snapshotID,query);
    setFilteredFiles(searchedFiles);
  }

  return (
    <Container fluid className='p-0'>
      <Banner />
      <Container className='text-center my-2'>
        <h3 className='fw-bold'>Snapshot {snapshotID}</h3>
        <h6>Taken: {snapshot.date}</h6>
      </Container>
      <Form onSubmit={searchSnapShot} className='m-2'>
        <FormControl
          type='search'
          placeholder='Search For File'
          value={query}
          onChange={(e) =>{
            setQuery(e.target.value)
            if(e.target.value === ""){
              searchSnapShot(e)
            } 
        }}
        />
      </Form>
      
      <AnalysisForm snapshotID={snapshotID} />

      <ListGroup>
        {
          filteredFiles.map(f =>
            <ListGroup.Item key={f.id}>
              { f.isFolder ? <FolderCard file={f} /> : <FileCard file={f} /> }
            </ListGroup.Item>
            )
        }
      </ListGroup>
    </Container>
  );
}