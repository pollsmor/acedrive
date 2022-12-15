import axios from "axios";
import { useState, useEffect } from "react";
import { Container, Button, Row, Col, ListGroup } from "react-bootstrap";
import Banner from "./Banner";
import AccessControlCard from "./AccessControlCard";
import LoadingModal from "./LoadingModal";
import ErrorModal from "./ErrorModal"
import UploadFileModal from "./UploadFileModal";

export default function HomePage(props) {
  const [snapshotIDs, setSnapshotIDs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUser() {
      let user = await axios.get("/api/getUser");
      setSnapshotIDs(user.data.snapshotIDs);
    }

    fetchUser();
  }, []);


  function closeError() {
    setError(null)
  }

  return (
    <>
      <div className="pagebox">
        <Banner />
        <ErrorModal error={error} closeErrorModal={closeError}/>
        <Container fluid className="mt-2" style={{ color: "white" }}>

          <LoadingModal show={loading} />
          <hr />

          {snapshotIDs.length > 0  ? (
            <>
              <h4>Snapshots are sorted by recency from top to bottom.</h4>
              <Row>
                <Col>
                  <h5>File sharing snapshots</h5>
                  {snapshotIDs.map((id, index) => {
                    return (
                      <AccessControlCard key={index} position={index} id={id} />
                    );
                  })}
                </Col>
              </Row>
            </>
          ) : (
            <h5
              style={{
                marginTop: "20px",
                textAlign: "left",
                color: "lightgray",
                marginLeft: "5px",
              }}
            >
              You do not have any snapshots. Take one to begin!
            </h5>
          )}
        </Container>
      </div>
    </>
  );
}
