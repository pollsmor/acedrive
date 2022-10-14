import axios from 'axios';
import { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';

export default function SearchResults(props) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      let res = await axios.post('/api/google', {
        accessToken: props.accessToken,
        query: ``
      });

      setFiles(res.data.files);
    }

    fetchData();
  }, [props.accessToken]);

  return (
    <Table responsive striped bordered>
      <tbody>
      { files.map(f => {
        return (
          <tr key={f.id}>
            <td>{JSON.stringify(f)}</td>
          </tr>
        );
      }) }
      </tbody>
    </Table>
  );
}