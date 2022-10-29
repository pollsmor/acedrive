import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Accordion, Container, Form, Button } from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';
import AnalyzeDeviant from '../algorithms/AnalyzeDeviant.js';
import AnalyzeFileFolderDifferences from '../algorithms/FileFolderDifferences.js';
import AnalyzeSharingChanges from '../algorithms/SharingChanges.js';
import AnalysisResultsModal from './AnalysisResultsModal';

export default function AnalysisForm(props) {
  let snapshotID = props.snapshotID;
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);
  const [results, setResults] = useState(null);

  // Form control
  const [analysisType, setAnalysisType] = useState('Deviant Sharing');
  const [snapshotIDs, setSnapshotIDs] = useState([]);
  const [otherSnapshotID, setOtherSnapshotID] = useState('');
  const [threshold, setThreshold] = useState(75);
  const [path, setPath] = useState('');
  const [driveName, setDriveName] = useState('');

  useEffect(() => {
    async function fetchUser() {
      let user = await axios.get('/api/getUser');
      let snapshotIDs = user.data.snapshotIDs;
      snapshotIDs = snapshotIDs.filter(id => id !== snapshotID);
      setSnapshotIDs(snapshotIDs);
      if (snapshotIDs.length > 0)
        setOtherSnapshotID(snapshotIDs[0]);
    }

    fetchUser();
  }, [snapshotID]);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (analysisType === 'Sharing Changes' && otherSnapshotID === '') return;

    let results = null;
    // Call analysis functions
    if (analysisType === 'Deviant Sharing')
      results = await AnalyzeDeviant(snapshotID, path, driveName, threshold);
    else if (analysisType === 'File-Folder Sharing Differences')
      results = await AnalyzeFileFolderDifferences(snapshotID, path, driveName);
    else
      results = await AnalyzeSharingChanges(snapshotID, otherSnapshotID, path, driveName);

    setResults(results);
  }

  function handleClose() { setResults(null) };

  return (
    <Container fluid className='pb-2'>
      <AnalysisResultsModal 
        show={results !== null} 
        onHide={handleClose} 
        analysisType={analysisType} 
        results={results}
      />
      <Accordion defaultActiveKey='lol-idc'>
        <Accordion.Item>
          <Accordion.Header>
            <h4>Analyze Snapshot</h4>
          </Accordion.Header>
          <Accordion.Body>
            <Form onSubmit={handleAnalyze}>
              <Form.Group className='mb-2'>
                <Form.Label>Select Analysis Type</Form.Label>
                <Form.Control
                  as='select'
                  value={analysisType}
                  onChange={e => { setAnalysisType(e.target.value) }}
                >
                  <option>Deviant Sharing</option>
                  <option>File-Folder Sharing Differences</option>
                  <option>Sharing Changes</option>
                </Form.Control>
              </Form.Group>
                
              { analysisType === 'Sharing Changes' ?
                <Form.Group className='mb-2'>
                  <Form.Label>Other Snapshot</Form.Label>
                  <Form.Control
                    as='select'
                    value={otherSnapshotID}
                    onChange={e => { setOtherSnapshotID(e.target.value) }}
                    disabled={snapshotIDs.length === 0}
                  >
                    { snapshotIDs.map(id => {
                      return <option key={id}>{id}</option>
                    }) }
                  </Form.Control>
                  <Form.Text className='text-muted'>
                    Snapshots sorted by recency from top to bottom.
                  </Form.Text>
                </Form.Group> : null
              }

              { analysisType === 'Deviant Sharing' ?
                <Form.Group className='mb-2'> 
                  <Form.Label>Threshold</Form.Label>
                  <RangeSlider 
                    value={threshold}
                    tooltipPlacement='top'
                    min={50}
                    max={100}
                    onChange={e => setThreshold(e.target.value)} 
                    disabled={analysisType !== 'Deviant Sharing'}
                    />
                  <Form.Text className='text-muted'>
                    Choose a value from 50-100.
                  </Form.Text>
                </Form.Group> : null
              }

              <Form.Group className='mb-2'>
                <Form.Label>Path (optional)</Form.Label>
                <Form.Control 
                  type='path' 
                  placeholder='Enter path...' 
                  onChange={e => setPath(e.target.value)}
                />
                <Form.Text className='text-muted'>
                  Only perform analysis on files matching a certain path.
                </Form.Text>
              </Form.Group>

              <Form.Group className='mb-2'>
                <Form.Label>Drive (optional)</Form.Label>
                <Form.Control 
                  placeholder='Enter drive name...' 
                  onChange={e => setDriveName(e.target.value)}
                />
                <Form.Text className='text-muted'>
                  Only perform analysis on files within a certain drive.
                </Form.Text>
              </Form.Group>

              <Button variant='primary' type='submit'>Analyze</Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}