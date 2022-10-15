import axios from 'axios';
import { useState, useEffect} from 'react';
import { Container, Navbar, Button, Modal, Form} from "react-bootstrap";
import SnapshotCard from './snapshotCard';

export default function HomePage(props) {
    const [snapshots, setSnapshots] = useState([])
    const [selecting, setSelecting] = useState(false)
    const [analyze, setAnalyze] = useState("")
    const [path, setPath] = useState("")
    const [drive, setDrive] = useState("")
    const [show, setShow] = useState(false)
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
        let new_selected
        if(analyze !== "Sharing Changes") {
            new_selected = []
            if (selectedFiles.indexOf(snapshots[index]) < 0 ) {
                new_selected.push(snapshots[index])
            }
            setSelectedFiles(new_selected)
        }
        else {
            new_selected = [...selectedFiles]
            if (new_selected.includes(snapshots[index])) {
                new_selected.splice(new_selected.indexOf(snapshots[index]), 1)
                setSelectedFiles(new_selected)
                return
            }
            else{
                if(new_selected.length == 2) {
                    new_selected.shift()
                    new_selected.push(snapshots[index])
                }
                else{
                    new_selected.push(snapshots[index])
                }
                setSelectedFiles(new_selected)
            }
        }
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
        else{
            // switch to call analysis functions
            console.log(`analyze type: ${analyze}`)
            console.log(`analyze path: ${path}`)
            console.log(`analyze drive: ${drive}`)
            console.log(`snapshot: ${selectedFiles[0]}`)
        }
    }

    const handleClose = () => setShow(false)
    const handleOpen = () => setShow(true)
    function handleAnalyze(e) {
        e.preventDefault();
        handleClose()
        setSelecting(true)
        toggleSelect(null, 0)
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

    let buttonEnabled = (selectedFiles.length === 1 && analyze !== "Sharing Changes") || (selectedFiles.length === 2 && analyze === "Sharing Changes")
    let confirmNavbar = <Navbar fixed="bottom" bg='light' className="justify-content-center">
                            <Button onClick={handleConfirmClick} size="lg" variant='success' disabled={!buttonEnabled}> Confirm Selected Files</Button>
                        </Navbar>

    return (
        <>
            <Navbar>
                <Container>
                    <Navbar.Brand> Snapshots: </Navbar.Brand>
                    <Button onClick={handleViewClick}>View & Search Snapshot Files</Button> 
                    <Button onClick={handleOpen}>Analyze Snapshot</Button>
                </Container>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>Analyze Snapshot</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form onSubmit={handleAnalyze}>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Analysis Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={analyze}
                                onChange={e => {
                                    setAnalyze(e.target.value);
                                }}>
                                <option>Redundant Sharing</option>
                                <option>Deviant Sharing</option>
                                <option>File-Folder Sharing Differences</option>
                                <option>Sharing Changes</option>
                            </Form.Control>
                        </Form.Group>
                       
                        <Form.Group className="mb-3" controlId="formBasicPath">
                            <Form.Label>Path (Optional)</Form.Label>
                            <Form.Control type="path" placeholder="Enter path" onChange={e => setPath(e.target.value)}/>
                            <Form.Text className="text-muted">
                                    Only perform analysis on files matching a certain path
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicDrive">
                            <Form.Label>Drive (Optional)</Form.Label>
                            <Form.Control type="drive" placeholder="Drive" onChange={e => setDrive(e.target.value)}/>
                            <Form.Text className="text-muted">
                                 Only perform analysis on files within a certain drive
                            </Form.Text>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Select Snapshot
                        </Button>
                    </Form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    </Modal.Footer>
                </Modal>
            </Navbar>
            {windowContents}
            {selecting?confirmNavbar:""}
        </>
    )
}