import axios from 'axios';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Banner from '../../components/Banner';
import FileCard from '../../components/FileCard';
import FolderCard from '../../components/FolderCard';
import AnalysisForm from '../../components/AnalysisForm';
import FileTable from '../../components/FileTable';
import QueryBuilder from '../../components/QueryBuilder';
import searchSnapshot from '../../algorithms/SearchSnapshot';

import { Container, ListGroup, Form, FormControl, Pagination } from 'react-bootstrap';

export default function Snapshot() {
  
  const router = useRouter();
  const { snapshotID } = router.query;

  const [query, setQuery] = useState('');
  const [previousQueries, setPreviousQueries] = useState([]);
  const [snapshot, setSnapshot] = useState({});
  const [pageFiles,setPageFiles] = useState([])
  const [activePage, setActivePage] = useState(1);
  const [filteredFiles, setFilteredFiles] = useState([]);

  const validOps = [
    'drive:', 'owner:', 'creator:', 'from:', 'to:', 'readable:',
    'writable:', 'sharable:', 'name:', 'inFolder:', 'folder:', 'path:',
    'sharing:'
  ];
  const searchHandler = (e) => {  
    e.preventDefault();  

    if (query === "") { 
      return setFilteredFiles(snapshot.files);
    }

    // Make sure the query is valid.
    let queryParts = query.split(' ');
    for (let queryPart of queryParts) {
      if (!validOps.some((op) => queryPart.includes(op))) {
        return console.log(`Invalid query: ${query}`);
      }
    }

    let searchedFiles = searchSnapshot(snapshot.files, query)
    setFilteredFiles(searchedFiles);
    axios.post('/api/saveSearchQuery', { query });
    
  }

  useEffect(() => {
    async function fetchSnapshot() {
      try {
        let snapshot = await axios.get('/api/getSnapshot', { 
          params: { id: snapshotID }
        });
        setSnapshot(snapshot.data);
        setFilteredFiles(snapshot.data.files);

        let user = await axios.get('/api/getUser');
        setPreviousQueries(user.data.queries);
      } catch (err) {
        alert('This is not a valid snapshot ID.');
        window.location.href = '/';
      }
    }
    
    if (snapshotID) fetchSnapshot();
  }, [snapshotID]);

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
    setPageFiles(filteredFiles.slice(startFileIdx, endFileIdx));
  }, [filteredFiles, startFileIdx, endFileIdx]);

  return (
    <Container fluid className='p-0'>
      <Banner />
      <Container className='text-center my-2'>
        <h3 className='fw-bold'>Snapshot {snapshotID}</h3>
        <h6>Taken: {snapshot.date}</h6>
      </Container>

      <Form onSubmit={searchHandler} className='m-2'>
        <FormControl
          type='search'
          placeholder='Search...'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
          }}
        />
      </Form>
      <h3>Previous queries:</h3>
      <ListGroup>
        { previousQueries.slice(0, 5).map((query, idx) => {
          return (
            <ListGroup.Item action key={idx} onClick={() => setQuery(query)}>
              {query}
            </ListGroup.Item>
          );
        }) }
      </ListGroup>

      <QueryBuilder setQuery={setQuery} />
      
      <AnalysisForm snapshotID={snapshotID} />
      
       <ListGroup>
        {pageFiles.map((f) =>{
          return (<ListGroup.Item key={f.id}>
            { f.isFolder ? <FolderCard file={f} /> : <FileCard file={f} /> }
          </ListGroup.Item>)}
          )}</ListGroup>
      
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