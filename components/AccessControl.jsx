import axios from "axios";
import Banner from "./Banner";
import ErrorModal from "./ErrorModal";
import LoadingModal from "./LoadingModal";
import { useState, useEffect } from "react";
import AccessControlCard from "./AccessControlCard";
import { Container, Row, ListGroup, Alert, Col } from "react-bootstrap";

export default function AccessControl(props) {
  const session = props.session;
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accessControlQueries, setAccessControlQueries] = useState([]);

  const [snapshotIDs, setSnapshotIDs] = useState([]);
  const [groupSnapshotInfo, setGroupSnapshotInfo] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      let user = await axios.get("/api/getUser");
      setSnapshotIDs(user.data.snapshotIDs);
      setGroupSnapshotInfo(user.data.groupSnapshotInfo);
    }

    fetchUser();
  }, []);

  const closeError = () => {
    setError(null);
  };

  const getUserAccessControls = async () => {
    try {
      const access = await axios.post("/api/accessControl/getAccessControl");
      setAccessControlQueries(access.data.accessControl);
    } catch (error) {
      setError({
        msg: "Some Error Occured",
      });
    }
  };

  useEffect(() => {
    getUserAccessControls();
  }, []);

  return (
    <div style={{ backgroundColor: "#212529", height: "100%" }}>
      <Banner />
      <ErrorModal error={error} closeErrorModal={closeError} />

      <Container fluid className="mt-2" style={{ color: "white" }}>
        <LoadingModal show={loading} />
        <hr />
        {show && (
          <Alert variant="danger" onClose={() => setShow(false)} dismissible>
            {alert}
          </Alert>
        )}
        <h5>Access Controls</h5>
        {accessControlQueries.length > 0 ? (
          <Container fluid className="px-0 py-2">
            <h5>Previous Access Control Queries:</h5>
            <ListGroup as="ol" numbered>
              {accessControlQueries.slice(0, 5).map((accessControl, idx) => {
                return (
                  <ListGroup.Item key={idx} className="py-1 d-inline-block">
                    {accessControl.searchQuery},{" "}
                    {accessControl.accessControlQuery}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Container>
        ) : null}

        {snapshotIDs.length > 0 || groupSnapshotInfo.length > 0 ? (
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
              {session.provider === "google" ? (
                <Col style={{ color: "white" }}>
                  <h5>Group membership snapshots</h5>
                  {groupSnapshotInfo &&
                    groupSnapshotInfo.map((info, index) => {
                      return (
                        <AccessControlCard
                          key={index}
                          position={index}
                          id={info.id}
                          isGroupSnapshot={true}
                        />
                      );
                    })}
                </Col>
              ) : null}
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
  );
}
