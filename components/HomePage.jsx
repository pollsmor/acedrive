import axios from 'axios';
import { useState, useEffect} from 'react';
import { Container, Button } from 'react-bootstrap';
import Banner from './Banner';
import SnapshotCard from './SnapshotCard';
import LoadingModal from './LoadingModal';

export default function HomePage(props) {
  const [snapshotIDs, setSnapshotIDs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      let user = await axios.get('/api/getUser');
      setSnapshotIDs(user.data.snapshotIDs);
    }

    fetchUser();
  }, []);

  async function takeSnapshot() {
    setLoading(true);
    let res = await axios.post('/api/takeSnapshot', {
      accessToken: props.accessToken
    });
    
    // Retrieve ID of new snapshot instead of querying getUser again
    let new_array = [res.data.id, ...snapshotIDs];
    setSnapshotIDs(new_array);
    setLoading(false);
  }

  return (
    <>
      <Banner />
      <Container fluid className='mt-2'>
        <Button onClick={takeSnapshot}>Take snapshot</Button> 
        <LoadingModal show={loading}></LoadingModal>
        { snapshotIDs.length > 0 ? (
        <>
          <h3>Snapshots are sorted by recency from top to bottom.</h3>
          { snapshotIDs.map((snapshotID, index) => {
            return <SnapshotCard 
              key={index} 
              position={index}
              id={snapshotID} 
            />
          })}
        </>
      ) : <h4>You do not have any snapshots. Take one to begin.</h4> }
      </Container>
    </>
  );
}