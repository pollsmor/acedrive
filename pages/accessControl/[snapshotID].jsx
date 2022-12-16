
import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Banner from "../../components/Banner";
import FileTable from "../../components/FileTable";
import ErrorModal from "../../components/ErrorModal"
import accessControl from "../../algorithms/AccessControl";

import {
  Container,
  Form,
  FormControl,
  Pagination,
} from "react-bootstrap";

export default function Snapshot() {
  const router = useRouter();
  const { snapshotID } = router.query;

  const [query, setQuery] = useState("");
  
  const [snapshot, setSnapshot] = useState({});
  const [pageFiles, setPageFiles] = useState([]);
  const [activePage, setActivePage] = useState(1);
  
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [showingResults, setShowingResults] = useState(false);

  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSnapshot() {
      try {
        let snapshot = await axios.get("/api/getSnapshot", {
          params: { id: snapshotID },
        });
        setSnapshot(snapshot.data);
        setFilteredFiles(snapshot.data.files);

        let user = await axios.get("/api/getUser");
      
      } catch (err) {
        alert("This is not a valid snapshot ID.");
        window.location.href = "/";
      }
    }

    if (snapshotID) fetchSnapshot();
  }, [snapshotID]);

  const searchHandler = async (e) => {
    e.preventDefault();

    if (query === "") {
      setShowingResults(false);
      return setFilteredFiles(snapshot.files);
    }

    const searchResults = await accessControl(snapshot.files, query);

    if (searchResults.status !== "200") {
      setError(searchResults);
      return
    }

    setFilteredFiles(searchResults.files);
    setShowingResults(true);
  };

  function closeError() {
    setError(null)
  }

  // Set up pagination =================================
  let items = [];
  const filesPerPage = 10;

  if(!filteredFiles){
    filteredFiles = [];
  }
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
    if(filteredFiles){
      setPageFiles(filteredFiles.slice(startFileIdx, endFileIdx));

    }
  }, [filteredFiles, startFileIdx, endFileIdx]);

  return (
    <>
      <Banner />
      <Container fluid className="text-center my-2">
        <h3 className="fw-bold">Snapshot {snapshotID}</h3>
        <h6>Taken: {snapshot.date}</h6>
      </Container>
      <ErrorModal error={error} closeErrorModal={closeError}/>
      <Container fluid>
        <Form onSubmit={searchHandler} className="mb-3">
          <FormControl
            placeholder="Check Access Controls"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form>
        {showingResults ? (
          <>
            <FileTable files={filteredFiles} />
          </>
        ) : (
          <>
            <FileTable files={pageFiles} />
            <Pagination className="justify-content-center m-3">
              <Pagination.Prev
                disabled={activePage <= 1}
                onClick={() => setActivePage(activePage - 1)}
              >
                prev
              </Pagination.Prev>
              {items}
              <Pagination.Next
                disabled={activePage >= amtPages}
                onClick={() => setActivePage(activePage + 1)}
              >
                next
              </Pagination.Next>
            </Pagination>
          </>
        )}
      </Container>
    </>
  );
}
