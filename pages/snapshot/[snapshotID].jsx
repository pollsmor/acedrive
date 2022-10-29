import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, ListGroup, Form, FormControl } from 'react-bootstrap';
import { useRouter } from 'next/router';
import FileCard from '../../components/FileCard';
import FolderCard from '../../components/FolderCard';
import Banner from '../../components/Banner';
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
  const [files, setFiles] = useState([]); // Never changes after initial load
  const [query, setQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    async function fetchSnapshot() {
      let snapshot = await axios.get('/api/getSnapshot', { 
        params: { id: snapshotID }
      });
      setFiles(snapshot.data.files);
      setFilteredFiles(snapshot.data.files);
    }

    if (snapshotID) fetchSnapshot();
  }, [snapshotID])

  function onSearch(e) {
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
    //setFilteredFiles(SearchQuery(query));
  }
  return (
    <>
      <Banner />

      <Form onSubmit={onSearch} className='m-2'>
        <FormControl
          type='search'
          placeholder='Search For File'
          value={query}
          onChange={(e) =>{
            setQuery(e.target.value)
            if(e.target.value === ""){
              onSearch(e)
            } 
        }}
        />
      </Form>

      <ListGroup>
        {
          filteredFiles.map(f =>
            <ListGroup.Item key={f.id}>
              { f.isFolder ? <FolderCard file={f} /> : <FileCard file={f} /> }
            </ListGroup.Item>
            )
        }
      </ListGroup>

    </>
  );
}