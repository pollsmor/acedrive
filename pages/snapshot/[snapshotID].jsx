import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Banner from "../../components/Banner";
import FileCard from "../../components/FileCard";
import FolderCard from "../../components/FolderCard";
import AnalysisForm from "../../components/AnalysisForm";
import FileTable from "../../components/FileTable";
import QueryBuilder from "../../components/QueryBuilder";
import ErrorModal from "../../components/ErrorModal"
import FileDetailsModal from "../../components/FileDetailsModal"
import searchSnapshot from "../../algorithms/SearchSnapshot";

import {
  Container,
  ListGroup,
  Form,
  FormControl,
  Pagination,
  Row,
  Col,
  Button
} from "react-bootstrap";

export default function Snapshot() {
  const router = useRouter();
  const { snapshotID } = router.query;

  const [query, setQuery] = useState("");
  const [previousQueries, setPreviousQueries] = useState([]);
  
  const [snapshot, setSnapshot] = useState({});
  const [pageFiles, setPageFiles] = useState([]);
  const [activePage, setActivePage] = useState(1);
  
  const [searchResults, setSearchResults] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [showingResults, setShowingResults] = useState(false);
  const [openFile, setOpenFile] = useState(null)

  const [error, setError] = useState(null)

  const searchHandler = async (e) => {
    e.preventDefault();

    if (query === "") {
      setShowingResults(false);
      setSearchResults([]);
      return setFilteredFiles(snapshot.files);
    }

    let searchResults = await searchSnapshot(snapshot.files, query);
    //console.log(searchResults);
    if (searchResults.status !== "ok") {
      setError(searchResults);
      return
    }

    setSearchResults(searchResults.files);
    setFilteredFiles(searchResults.files);
    setShowingResults(true);
    const userQueries = await axios.post("/api/saveSearchQuery", { query });

    //Set Queries from users updated listed after saving
    setPreviousQueries(userQueries.data.queries);
  };

  useEffect(() => {
    async function fetchSnapshot() {
      try {
        let snapshot = await axios.get("/api/getSnapshot", {
          params: { id: snapshotID },
        });
        setSnapshot(snapshot.data);
        setFilteredFiles(snapshot.data.files);

        let user = await axios.get("/api/getUser");
        setPreviousQueries(user.data.queries);
      } catch (err) {
        alert("This is not a valid snapshot ID.");
        window.location.href = "/";
      }
    }

    if (snapshotID) fetchSnapshot();
  }, [snapshotID]);

  function closeError() {
    setError(null)
  }

  function closeDetail() {
    setOpenFile(null)
  }
  
  function sortFiles(e) {
    e.preventDefault()
    let sortType = e.target[0].value
    let sortedFiles = [...searchResults]

    if(sortType === "Last Modified") {
      sortedFiles.sort( (a, b) => (new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()))
      setFilteredFiles(sortedFiles)
    }
    else if (sortType === "Alphabetical") {
      sortedFiles.sort( (a, b) => (a.name > b.name) ? 1 : ((b.name < a.name) ? -1 : 0) )
      setFilteredFiles(sortedFiles)
    }
    else if (sortType == "Drive") {
      sortedFiles.sort( (a, b) => (a.driveName.toLowerCase() > b.driveName.toLowerCase()) ? 1 : ((b.driveName.toLowerCase() > a.driveName.toLowerCase()) ? -1 : 0))
      setFilteredFiles(sortedFiles)
    }
    else {
      setFilteredFiles(sortedFiles)
    }
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
    setPageFiles(filteredFiles.slice(startFileIdx, endFileIdx));
  }, [filteredFiles, startFileIdx, endFileIdx]);

  return (
    <>
      <Banner />
      <Container fluid className="text-center my-2">
        <h3 className="fw-bold">Snapshot {snapshotID}</h3>
        <h6>Taken: {snapshot.date}</h6>
      </Container>
      <ErrorModal error={error} closeErrorModal={closeError}/>
      <FileDetailsModal file={openFile} closeFileDetails={closeDetail}/>
      <Container fluid>
        <Form onSubmit={searchHandler}>
          <FormControl
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form>

        {previousQueries.length > 0 ? (
          <>
            <h5 className="my-2">Previous queries:</h5>
            <ListGroup as="ol" numbered>
              {previousQueries.slice(0, 5).map((query, idx) => {
                return (
                  <ListGroup.Item
                    action
                    key={idx}
                    onClick={() => setQuery(query)}
                    className="py-1"
                  >
                    {query}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </>
        ) : null}

        <QueryBuilder setQuery={setQuery} />
        <AnalysisForm snapshotID={snapshotID} />

        {showingResults ? (
          <>
            <Form onSubmit={sortFiles}>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="1">
                    Sort By: 
                </Form.Label>
                <Col sm="2">
                    <Form.Select defaultValue="Default">
                        <option>Default</option>
                        <option>Last Modified</option>
                        <option>Alphabetical</option>
                        <option>Drive</option>
                    </Form.Select>
                </Col>
                <Col sm="2">
                  <Button type="submit">
                    Submit
                  </Button>
                </Col>
              </Form.Group>
            </Form>
            <FileTable files={filteredFiles} openFileDetails={setOpenFile} />
          </>
        ) : (
          <>
            <ListGroup>
              {pageFiles.map((f) => {
                return (
                  <ListGroup.Item key={f.id}>
                    {f.isFolder ? (
                      <FolderCard file={f} />
                    ) : (
                      <FileCard file={f} />
                    )}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

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
