import axios from 'axios';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Banner from '../../components/Banner';
import FileCard from '../../components/FileCard';
import FolderCard from '../../components/FolderCard';
import AnalysisForm from '../../components/AnalysisForm';
import FileTable from '../../components/FileTable';

import { Container, ListGroup, Form, FormControl, Pagination } from 'react-bootstrap';

export default function Snapshot() {
  
  const router = useRouter();
  const { snapshotID } = router.query;

  const [query, setQuery] = useState('');
  const [snapshot, setSnapshot] = useState([]);
  const [pageFiles,setPageFiles] = useState([])
  const [activePage, setActivePage] = useState(1);
  const [filteredFiles, setFilteredFiles] = useState([]);

  const searchSnapshot = async (e) => {
    e.preventDefault();  
    
    const fetchSnapshotSearch = async (snapshotID, query) =>{
      try {
        const results = await axios.get('/api/searchSnapshot', { 
          params: { id: snapshotID , query: query }
        });
        return results.data;
      } catch (err) {
        alert('Invalid snapshot ID searched.');
      }
    }
    
    const searchedFiles = await fetchSnapshotSearch(snapshotID, query);
    setFilteredFiles(searchedFiles);
  }
  
    // Set up pagination =================================
  let items = [];
  const filesPerPage = 10;
  let amtPages = Math.ceil(filteredFiles.length / filesPerPage);
  for (let page = 1; page <= amtPages; page++) {
    items.push(
      <Pagination.Item
        key={page}
        active={page === activePage}
        onClick={() => setActivePage(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

    // Only get files present on a specific page
  let startFileIdx = filesPerPage * (activePage - 1);
  let endFileIdx = startFileIdx + filesPerPage;

  // ====================================================

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
  
  useEffect(()=>{
    setPageFiles(filteredFiles.slice(startFileIdx, endFileIdx))
  },[filteredFiles,startFileIdx,endFileIdx])



  return (
    <Container fluid className='p-0'>
      <Banner />
      <Container className='text-center my-2'>
        <h3 className='fw-bold'>Snapshot {snapshotID}</h3>
        <h6>Taken: {snapshot.date}</h6>
      </Container>
      <Form onSubmit={searchSnapshot} className='m-2'>
        <FormControl
          type='search'
          placeholder='Search...'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value === '') searchSnapshot(e);
          }}
        />
      </Form>
      
      <AnalysisForm snapshotID={snapshotID} />
      
        {pageFiles.length > 0 && query && filteredFiles.length > 0 ? 
        <FileTable pageFiles={pageFiles} /> : <ListGroup>
          {pageFiles.map((f) =>{
            return (<ListGroup.Item key={f.id}>
              { f.isFolder ? <FolderCard file={f} /> : <FileCard file={f} /> }
            </ListGroup.Item>)}
            )}</ListGroup>
      }
      
      <br />
      <Pagination className='justify-content-center'>
        <Pagination.Prev
          disabled={activePage <= 1}
          onClick={() => setActivePage(activePage - 1)}
        >
          prev
        </Pagination.Prev>
        { items }
        <Pagination.Next
          disabled={activePage >= amtPages}
          onClick={() => setActivePage(activePage + 1)}
        >
          next
        </Pagination.Next>
      </Pagination>

    </Container>
  );
}