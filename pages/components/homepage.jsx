import axios from 'axios';
import { useState, useEffect} from 'react';
import { Container, Navbar, NavDropdown, Button } from "react-bootstrap";
import SnapshotCard from './snapshotCard';

export default function HomePage(props) {
    const [snapshots, setSnapshots] = useState([])
    const [selecting, setSelecting] = useState(false)
    const [analyze, setAnalyze] = useState("")
    const [selectedFiles, setSelectedFiles] = useState([])

    useEffect( () => {
        async function fetchUser() {
          let res = await axios.post('/api/getUser');
          if (res.data.snapshotIDs.length > 0) {
            setSnapshots(res.data.snapshotIDs)
          }
        }
    
        fetchUser();
    }, []);

    function toggleSelect(e, index) {
        let new_selected = []
        if (selectedFiles.indexOf(snapshots[index]) < 0 ) {
            new_selected.push(snapshots[index])
        }
        setSelectedFiles(new_selected)
    }

    function handleViewClick(e) {
        if(selecting ===  (selectedFiles.indexOf(snapshots[0]) >= 0)) {
            toggleSelect(null, 0)
        }
        setSelecting(!selecting)
    }

    function handleConfirmClick(e) {
        if(analyze === "") {
            props.viewCallback(selectedFiles)
        }
    }

    let windowContents = "Take a snapshot to begin"
    if(snapshots.length > 0) {
        windowContents =
            <Container>
                {snapshots.map((snapshot, index) => {
                    return <SnapshotCard key={index} id={snapshot} position={index} selecting={selecting} selected={selectedFiles.includes(snapshot)} clickCallback={toggleSelect}/>
                })}
            </Container>
    }

    let buttonEnabled = (selectedFiles.length === 1 && analyze !== "compare") || (selectedFiles.length === 2 && analyze === "compare")
    let confirmNavbar = <Navbar fixed="bottom" bg='light' className="justify-content-center">
                            <Button onClick={handleConfirmClick} size="lg" variant='success' disabled={!buttonEnabled}> Confirm Selected Files</Button>
                        </Navbar>

    return (
        <>
            <Navbar>
                <Container>
                    <Navbar.Brand> Snapshots: </Navbar.Brand>
                    <Button onClick={handleViewClick}>View & Search Snapshot Files</Button> 
                    <Button>Analyze Snapshot</Button>
                </Container>
            </Navbar>
            {windowContents}
            {selecting?confirmNavbar:""}
        </>
    )
}