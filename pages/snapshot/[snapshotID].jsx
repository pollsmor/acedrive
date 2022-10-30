import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, ListGroup, Form, FormControl, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Banner from '../../components/Banner';
import AnalysisForm from '../../components/AnalysisForm';
import FileCard from '../../components/FileCard';
import FolderCard from '../../components/FolderCard';
import lodash from 'lodash'

const queryOperator = {
  "drive":"driveName",
  "owner":"owners",
  "creator":"user",//TODO:Check Where We can get this key
  "from":"sharingUser",
  "to":"user",
  "readable":"user",
  "writable":"user",
  "sharable":"user",
  "name":"regexp",
  "inFolder":"regexp",
  "folder":"regexp",
  "path":"path",
  "sharing":"none",
  "sharing":"anyone",
  "sharing":"individual",
  "sharing":"domain",
  "foldersonly":"true"
}

export default function Snapshot() {
  const router = useRouter();
  const { snapshotID } = router.query;
  const [snapshot, setSnapshot] = useState([]);
  const [query, setQuery] = useState('');
  const [files,setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    async function fetchSnapshot() {
      try {
        let snapshot = await axios.get('/api/getSnapshot', { 
          params: { id: snapshotID }
        });
        setSnapshot(snapshot.data);
        setFiles(snapshot.data.files);
        setFilteredFiles(snapshot.data.files);
      } catch (err) {
        alert('This is not a valid snapshot ID.');
        window.location.href = '/';
      }
    }

    if (snapshotID) fetchSnapshot();
  }, [snapshotID]);

  const searchSnapShot = (e) => {
    e.preventDefault();
    

    const splitQuery = query.split(":");
    let searchForKeywords = query;
    let fieldTofetch = "name";

    if(splitQuery.length > 0){
      if(Object.keys(queryOperator).includes(splitQuery[0])){
        fieldTofetch = queryOperator[splitQuery[0]];
        searchForKeywords = splitQuery[1];
      }
    }

    if (query === '' || searchForKeywords === ''){
      setFilteredFiles(files);
      return;
    }

    let searchedFiles = [];

    if(splitQuery[0] === "owner" || splitQuery[0] === "from" ){
      searchedFiles = files.filter((file)=>{
        const fileDetails = file[fieldTofetch];
        let matchedDetails = [];
        if(Array.isArray(fileDetails)){
          matchedDetails = lodash.filter(fileDetails,(detail)=>{
            console.log(detail)
            if(detail.displayName.toLowerCase().search(searchForKeywords.toLowerCase()) !== -1){
              return detail;
            }
          })
          if(matchedDetails.length > 0){
            return file;
          }
        }else{
          if(fileDetails){
            console.log(fileDetails)
            if(fileDetails?.displayName.toLowerCase().search(searchForKeywords.toLowerCase()) !== -1){
              return file;
            }
          }
        }
      })
    }else{
      searchedFiles = files.filter((file)=>{
        const fileName = file[fieldTofetch].toLowerCase();
        if(fileName.search(searchForKeywords.toLowerCase()) !== -1){
          return file;
        }
      })
    }
    setFilteredFiles(searchedFiles);
  }

  return (
    <Container fluid className='p-0'>
      <Banner />
      <Container className='text-center my-2'>
        <h3 className='fw-bold'>Snapshot {snapshotID}</h3>
        <h6>Taken: {snapshot.date}</h6>
      </Container>
      <Form onSubmit={searchSnapShot} className='m-2'>
        <FormControl
          type='search'
          placeholder='Search For File'
          value={query}
          onChange={(e) =>{
            setQuery(e.target.value)
            if(e.target.value === ""){
              searchSnapShot(e)
            } 
        }}
        />
      </Form>

      
      <AnalysisForm snapshotID={snapshotID} />

      <ListGroup>
        {
          filteredFiles.map(f =>
            <ListGroup.Item key={f.id}>
              { f.isFolder ? <FolderCard file={f} /> : <FileCard file={f} /> }
            </ListGroup.Item>
            )
        }
      </ListGroup>
    </Container>
  );
}