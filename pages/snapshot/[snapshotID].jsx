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

  const searchHandler = (e) => {  
    e.preventDefault();  

    if (query === "") { 
      return setFilteredFiles(snapshot.files);
    }

    let searchResults = searchSnapshot(snapshot.files, query);
    
    console.log(searchResults)
    if(searchResults.status !== "ok") {
      return
    }

    setFilteredFiles(searchResults.files);
    axios.post('/api/saveSearchQuery', { query });
    setPreviousQueries([query, ...previousQueries]);
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
    <>
      <Banner />
      <Container fluid className='text-center my-2'>
        <h3 className='fw-bold'>Snapshot {snapshotID}</h3>
        <h6>Taken: {snapshot.date}</h6>
      </Container>

      <Container fluid>
        <Form onSubmit={searchHandler}>
          <FormControl
            placeholder='Search...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form>

        { previousQueries.length > 0 ? (
          <>
            <h5 className='my-2'>Previous queries:</h5>
            <ListGroup as='ol' numbered>
              { previousQueries.slice(0, 5).map((query, idx) => {
                return (
                  <ListGroup.Item action key={idx} onClick={() => setQuery(query)}>
                    {query}
                  </ListGroup.Item>
                );
              }) }
            </ListGroup>
          </>
        ) : null }

        <QueryBuilder setQuery={setQuery} />
        <AnalysisForm snapshotID={snapshotID} />
        
        <ListGroup>
        { pageFiles.map((f) => {
          return (
            <ListGroup.Item key={f.id}>
              { f.isFolder ? <FolderCard file={f} /> : <FileCard file={f} /> }
            </ListGroup.Item>
          );
        }) }
        </ListGroup>
      
        <Pagination className='justify-content-center m-3'>
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
    </>
  );
}