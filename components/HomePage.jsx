import axios from 'axios';
import { useState, useEffect} from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import Banner from './Banner';
import SnapshotCard from './SnapshotCard';
import LoadingModal from './LoadingModal';
import UploadFileModal from './UploadFileModal';

export default function HomePage(props) {
  const [snapshotIDs, setSnapshotIDs] = useState([]);
  const [groupSnapshotIDs, setGroupSnapshotIDs] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      let user = await axios.get('/api/getUser');
      setSnapshotIDs(user.data.snapshotIDs);
      setGroupSnapshotIDs(user.data.groupSnapshotIDs);
      setQueries(user.data.queries);
    }

    fetchUser();
  }, []);

  async function takeSnapshot() {
    setLoading(true);
    let res = await axios.post('/api/takeSnapshot');
    
    // Retrieve ID of new snapshot instead of querying getUser again
    let new_array = [res.data.id, ...snapshotIDs];
    setSnapshotIDs(new_array);
    setLoading(false);
  }

  const [hovering, setHovering] = useState(false);
  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  const [groupHovering, setGroupHovering] = useState(false);
  const handleGroupMouseEnter = () => {
    setGroupHovering(true);
  };

  const handleGroupMouseLeave = () => {
    setGroupHovering(false);
  };

  const handleUpload = () => {
    setUploading(true);
  }

  const hideUpload = () => {
    setUploading(false)
  }

  return (
    <>
      <div className="pagebox">
      <Banner />
      <Container fluid className='mt-2' style={{ color: 'white' }}>
        <Button onClick={takeSnapshot} style={{marginLeft:"5px", marginTop:"20px", boxShadow:'inset',
                color:"whitesmoke", borderColor:"#212529", backgroundColor: hovering? 'darkgray' : 'rgb(82,82,82)'}} 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
          Take snapshot</Button> 
        <Button onClick={handleUpload} style={{marginLeft:"5px", marginTop:"20px", boxShadow:'inset',
                color:"whitesmoke", borderColor:"#212529", backgroundColor: groupHovering? 'darkgray' : 'rgb(82,82,82)'}} 
                onMouseEnter={handleGroupMouseEnter}
                onMouseLeave={handleGroupMouseLeave}>
          Upload Group Snapshot</Button> 
        <UploadFileModal show={uploading} closeCallback={hideUpload}></UploadFileModal>
        <LoadingModal show={loading}></LoadingModal>

        <h3>Previous search queries</h3>
        { queries.slice(0, 5).map((q, idx) => {
          // Only have the first 5 search queries to avoid clogging up the page
          return (
            <h4 key={idx}>
              {idx + 1}. {q}
            </h4>
          );
        }) }
        <hr />

        { snapshotIDs.length > 0 ? (
        <>
          <h3>Snapshots are sorted by recency from top to bottom.</h3>
          <Row>
          <Col>
            <h3>File sharing snapshots</h3>
            { snapshotIDs.map((id, index) => {
              return (
                <SnapshotCard 
                  key={index} 
                  position={index}
                  id={id} 
                />
              );
            }) }
          </Col>
          { props.session.provider === 'google' ? 
          <Col style={{ color: 'white' }}>
            <h3>Group membership snapshots</h3>
            { groupSnapshotIDs.map((id, index) => {
              return (
                <SnapshotCard 
                  key={index} 
                  position={index}
                  id={id}
                  isGroupSnapshot={true} 
                />
              );
            }) }
          </Col> : null
          }
          </Row>
        </>
      ) : <h5 style={{marginTop: '20px',textAlign: 'left',color: "lightgray",marginLeft: "5px"}}>
            You do not have any snapshots. Take one to begin!
          </h5> 
        }
      </Container>
      </div>
    </>
  );
}