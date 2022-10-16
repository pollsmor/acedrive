import axios from 'axios';
import { useState, useEffect} from 'react';
import { Container, Nav, Navbar, Button, Modal, Form} from "react-bootstrap";
import SnapshotCard from './snapshotCard';
import AnalyzeDeviant from '../algorithms/AnalyzeDeviant';
import AnalyzeFileFolderDifferences from '../algorithms/FileFolderDifferences';
import AnalyzeSharingChanges from '../algorithms/SharingChanges';
import AnalysisResultsModal from './AnalysisResultsModal';
import ErrorModal from './errormodal';

export default function HomePage(props) {
    const [snapshots, setSnapshots] = useState([])
    const [selecting, setSelecting] = useState(false)
    const [analyze, setAnalyze] = useState("")
    const [threshold, setThreshold] = useState("80")
    const [path, setPath] = useState("")
    const [drive, setDrive] = useState("")
    const [results, setResults] = useState(null)
    const [show, setShow] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [errorMsg, setErrorMsg] = useState("")

    useEffect( () => {
        async function fetchUser() {
          let res = await axios.post('/api/getUser');
          if (res.data.snapshotIDs.length > 0) {
            setSnapshots(res.data.snapshotIDs)
          }
        }
    
        fetchUser();
    }, []);

    async function takeSnapshot() {
        let res = await axios.post('/api/takeSnapshot', {
          accessToken: props.accessToken
        });
    
        let new_array = [res.data.id, ...snapshots]
        setSnapshots(new_array)
      }
    

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

    function stopSelecting() {
        setResults(null)
        setAnalyze("")
        setSelectedFiles([])
        setSelecting(false)
        setThreshold(80)
        setPath("")
        setDrive("")
    }

    function handleViewClick(e) {
        if(selecting ===  (selectedFiles.indexOf(snapshots[0]) >= 0)) {
            toggleSelect(null, 0)
        }
        setSelecting(!selecting)
    }

    async function handleConfirmClick(e) {
        if(analyze === "") {
            props.viewCallback(selectedFiles)
        }
        else{
            let results = null  
            // call analysis functions
            if(analyze === "Deviant Sharing") {
                results = await AnalyzeDeviant(selectedFiles[0], path, drive, threshold)
            }
            else if(analyze === "File-Folder Sharing Differences") {
                results = await AnalyzeFileFolderDifferences(selectedFiles[0], path, drive)
            }
            else {
                results = await AnalyzeSharingChanges(selectedFiles[0], selectedFiles[1], path, drive)
            }
            setResults(results)
        }
    }

    function clearErrorMsg() {
        setErrorMsg("")
    }

    const handleClose = () => {setAnalyze(""); setShow(false)}
    const handleOpen = () => {setShow(true); setAnalyze("Deviant Sharing")}
    
    function handleAnalyze(e) {
        e.preventDefault();

        if(analyze === "Deviant Sharing") {
            let num = parseFloat(threshold)
            if(Number.isNaN(num)) {
                setErrorMsg("Deviant Sharing threshold must be a number")
                return
            }
            if(num < 50 || num > 100) {
                setErrorMsg("Deviant Sharing threshold must be between 50 and 100")
                return
            }
        }
        setShow(false)
        setSelecting(true)
        if(analyze !== "Sharing Changes") {
            toggleSelect(null, 0)
        }
    }

    let windowContents = "Take a snapshot to begin"
    if(snapshots.length > 0) {
        windowContents =
            <Container style={{marginBottom: '65px'}}>
                {snapshots.map((snapshot, index) => {
                    return <SnapshotCard key={index} id={snapshot} position={index} selecting={selecting} selected={selectedFiles.includes(snapshot)} clickCallback={toggleSelect}/>
                })}
            </Container>
    }

    let buttonEnabled = (selectedFiles.length === 1 && analyze !== "Sharing Changes") || (selectedFiles.length === 2 && analyze === "Sharing Changes")
    let confirmNavbar = <Navbar fixed="bottom" bg='light' className="justify-content-center">
                            <Button onClick={stopSelecting} size="lg" variant='primary'> Close </Button>
                            <Button onClick={handleConfirmClick} size="lg" variant='success' disabled={!buttonEnabled}> Confirm Selected Files</Button>
                        </Navbar>

    return (
        <>
            <Navbar>
                <Container>
                    <Navbar.Brand> Snapshots: </Navbar.Brand>
                    <Nav.Link onClick={takeSnapshot} disabled={selecting}>Take snapshot</Nav.Link>
                    <Button onClick={handleViewClick} disabled={selecting}>View & Search Snapshot Files</Button> 
                    <Button onClick={handleOpen} disabled={selecting}>Analyze Snapshot</Button>
                </Container>
                <AnalysisResultsModal show={(results!==null)} closeResultsCallback={stopSelecting} analysis={analyze} results={results}/>
                <ErrorModal msg={errorMsg} clearErrorCallback={clearErrorMsg} />
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
                                <option>Deviant Sharing</option>
                                <option>File-Folder Sharing Differences</option>
                                <option>Sharing Changes</option>
                            </Form.Control>
                        </Form.Group>
                       
                        <Form.Group> 
                            <Form.Label> Threshold (Deviant Sharing Only) </Form.Label>
                            <Form.Control placeholder="Deviance Threshhold" onChange={e => setThreshold(e.target.value)} disabled={analyze!=="Deviant Sharing"}/>
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