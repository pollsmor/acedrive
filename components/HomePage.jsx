import axios from 'axios';
import { useState, useEffect} from 'react';
import { Container, Nav, Navbar, Button, Modal, Form } from 'react-bootstrap';
import AnalyzeDeviant from '../algorithms/AnalyzeDeviant.js';
import AnalyzeFileFolderDifferences from '../algorithms/FileFolderDifferences.js';
import AnalyzeSharingChanges from '../algorithms/SharingChanges.js';
import Banner from './Banner';
import SnapshotCard from './SnapshotCard';
import AnalysisResultsModal from './AnalysisResultsModal';
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';

export default function HomePage(props) {
  const [snapshotIDs, setSnapshotIDs] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyze, setAnalyze] = useState('');
  const [threshold, setThreshold] = useState('80');
  const [path, setPath] = useState('');
  const [drive, setDrive] = useState('');
  const [results, setResults] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

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
    
  function toggleSelect(e, index) {
    let new_selected;
    if (analyze !== 'Sharing Changes') {
        new_selected = [];
        if (selectedFiles.indexOf(snapshotIDs[index]) < 0 )
          new_selected.push(snapshotIDs[index]);
        setSelectedFiles(new_selected);
    } else {
      new_selected = [...selectedFiles];
      if (new_selected.includes(snapshotIDs[index])) {
        new_selected.splice(new_selected.indexOf(snapshotIDs[index]), 1);
        setSelectedFiles(new_selected);
      } else {
        if (new_selected.length === 2) {
          new_selected.shift();
          new_selected.push(snapshotIDs[index]);
        } else {
          new_selected.push(snapshotIDs[index]);
        }

        setSelectedFiles(new_selected);
      }
    }
  }

  function stopSelecting() {
    setResults(null);
    setAnalyze('');
    setSelectedFiles([]);
    setSelecting(false);
    setThreshold(80);
    setPath('');
    setDrive('');
  }

  async function handleConfirmClick(e) {
    if (analyze === '') props.viewCallback(selectedFiles);
    else {
      let results = null;
      // Call analysis functions
      if (analyze === 'Deviant Sharing')
        results = await AnalyzeDeviant(selectedFiles[0], path, drive, threshold);
      else if (analyze === 'File-Folder Sharing Differences')
        results = await AnalyzeFileFolderDifferences(selectedFiles[0], path, drive);
      else
        results = await AnalyzeSharingChanges(selectedFiles[0], selectedFiles[1], path, drive);

      setResults(results);
    }
  }

  function clearErrorMsg() {
      setErrorMsg('');
  }

  function handleClose() {
    setAnalyze(''); 
    setShowMenu(false);
  }

  function handleOpen() {
    setShowMenu(true); 
    setAnalyze('Deviant Sharing');
  }
    
  function handleAnalyze(e) {
    e.preventDefault();
    if (analyze === 'Deviant Sharing') {
        let num = parseFloat(threshold);
        if (Number.isNaN(num)) {
            return setErrorMsg('Deviant sharing threshold must be a number!');
        } else if(num < 50 || num > 100) {
            return setErrorMsg('Deviant Sharing threshold must be between 50 and 100!');
        }
    }

    setShowMenu(false);
    setSelecting(true);
    if (analyze !== 'Sharing Changes') toggleSelect(null, 0);
  }

  let windowContents = 'Take a snapshot to begin.';
  if (snapshotIDs.length > 0) {
    windowContents = (
      <Container fluid style={{marginBottom: '65px'}}>
        <h3>Snapshots are sorted by recency from top to bottom.</h3>
        { snapshotIDs.map((snapshotID, index) => {
          return <SnapshotCard 
            key={index} 
            position={index}
            id={snapshotID} 
            selecting={selecting} 
            selected={selectedFiles.includes(snapshotID)} clickCallback={toggleSelect}
          />
        })}
      </Container>
    );
  }

  let buttonEnabled = 
    (selectedFiles.length === 1 && analyze !== 'Sharing Changes') || 
    (selectedFiles.length === 2 && analyze === 'Sharing Changes');
  let confirmNavbar = (
    <Navbar fixed='bottom' bg='light' className='justify-content-center'>
      <Button onClick={stopSelecting} size='lg' variant='primary'>Close</Button>
      <Button onClick={handleConfirmClick} size='lg' variant='success' disabled={!buttonEnabled}>Confirm Selected Files</Button>
    </Navbar>
  );

  return (
    <>
      <Banner />
      <Navbar>
        <Container>
          <Button variant='secondary' onClick={takeSnapshot} disabled={selecting}>Take snapshot</Button> 
          <Button onClick={handleOpen} disabled={selecting}>Analyze Snapshot</Button>
        </Container>
        <AnalysisResultsModal 
          show={(results!==null)} 
          closeResultsCallback={stopSelecting} 
          analysis={analyze} 
          results={results}
        />
        <ErrorModal msg={errorMsg} clearErrorCallback={clearErrorMsg} />
        <LoadingModal show={loading}></LoadingModal>
        <Modal show={showMenu} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Analyze Snapshot</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAnalyze}>
              <Form.Group className='mb-3'>
                <Form.Label>Select Analysis Type</Form.Label>
                <Form.Control
                  as='select'
                  value={analyze}
                  onChange={e => { setAnalyze(e.target.value) }}
                >
                  <option>Deviant Sharing</option>
                  <option>File-Folder Sharing Differences</option>
                  <option>Sharing Changes</option>
                </Form.Control>
              </Form.Group>
                
              <Form.Group> 
                <Form.Label>Threshold (deviant sharing only)</Form.Label>
                <Form.Control 
                  placeholder='Deviance Threshhold' 
                  onChange={e => setThreshold(e.target.value)} 
                  disabled={analyze !== 'Deviant Sharing'}
                />
              </Form.Group>

              <Form.Group className='mb-3' controlId='formBasicPath'>
                <Form.Label>Path (optional)</Form.Label>
                <Form.Control 
                  type='path' 
                  placeholder='Enter path' 
                  onChange={e => setPath(e.target.value)}
                />
                <Form.Text className='text-muted'>
                  Only perform analysis on files matching a certain path
                </Form.Text>
              </Form.Group>

              <Form.Group className='mb-3' controlId='formBasicDrive'>
                <Form.Label>Drive (optional)</Form.Label>
                <Form.Control 
                  type='drive' 
                  placeholder='Drive' 
                  onChange={e => setDrive(e.target.value)}
                />
                <Form.Text className='text-muted'>
                  Only perform analysis on files within a certain drive
                </Form.Text>
              </Form.Group>

              <Button variant='primary' type='submit'>Select snapshot</Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Navbar>
      {windowContents}
      {selecting ? confirmNavbar: ''}
    </>
  );
}