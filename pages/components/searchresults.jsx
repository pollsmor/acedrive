import axios from 'axios';
import { useState, useEffect } from 'react';
import {Container, Row, Form, FormControl} from 'react-bootstrap';
import FileCard from './filecard';
import SearchQuery from '../searchQuery';

export default function SearchResults(props) {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function fetchLatestSnapshot() {
      let res = await axios.post('/api/getUser');
      if (res.data.snapshots.length > 0) {
        let snapshot = res.data.snapshots[0];
        setFiles(snapshot);
      }
    }

    fetchLatestSnapshot();
  }, []);

  function onSearch(e) {
    e.preventDefault();
    if (query === '') return;

    console.log(`searching ${query}`)
    let search = new SearchQuery(query)
    filtered = FilterFiles(files, search)
  }

  return (
    <>
      <Form onSubmit={onSearch} className='d-flex'>
      <FormControl 
        type='search' 
        placeholder='Search...' 
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
    </Form>
      <Container fluid="lg">
        <Row>
            { files.map(f => {
              return (
                    <FileCard key={f.id} data={f}/>
              )
            }) }
        </Row>
      </Container>
    </>
  );
}

function FilterFiles(files, query) {
  let query_fields = queryString.split(" ")
  for (let field of query_fields) {
      if (field.indexOf(':') === -1){
          return {files: files, valid: false}
      }

      let type = field.substring(0, field.indexOf(':'))
      let value = field.substring(field.indexOf(':')+1)
      console.log(`query type: ${type} \nfor value ${value}`)

      switch(type) {
          case "drive": this.drive = value
          break

          case "owner": this.owner = value
          break

          case "creator": this.creator = value
          break

          case "from": this.from = value
          break

          case "to": this.to = value
          break

          case "readable": this.readable = value
          break

          case "writable": this.writable = value
          break

          case "shareable": this.shareable = value
          break

          case "name": this.name = value
          break

          case "inFolder": this.inFolder = value
          break

          case "folder": this.folder = value
          break

          case "path": this.path = value
          break

          case "sharing": this.sharing = value
          break

          default: {this.valid = false; return}          
      }
  }
}