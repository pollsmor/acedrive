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

  return (
    <>
      <div className="pagebox">
      <Banner />
      <Container fluid className='mt-2'>
        <Button onClick={takeSnapshot} style={{marginLeft:"5px", marginTop:"20px", boxShadow:'inset',
                color:"whitesmoke", borderColor:"#212529", backgroundColor: hovering? 'darkgray' : 'rgb(82,82,82)'}} 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
          Take snapshot</Button> 
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
      ) : <h5 style={{marginTop: '20px',textAlign: 'left',color: "lightgray",marginLeft: "5px"}}>
            You do not have any snapshots. Take one to begin!
          </h5> 
        }
      </Container>
      </div>
    </>
  );
}