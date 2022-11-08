import { useState, useEffect } from 'react';
import { Accordion, Container, Form, Button } from 'react-bootstrap';

export default function QueryBuilder(props) {
  const [driveName, setDriveName] = useState('');
  const [owner, setOwner] = useState('');
  const [creator, setCreator] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [readable, setReadable] = useState('');
  const [writable, setWritable] = useState('');
  const [sharable, setSharable] = useState('');
  const [name, setName] = useState('');
  const [inFolder, setInFolder] = useState('');
  const [folder, setFolder] = useState('');
  const [path, setPath] = useState('');
  const [sharing, setSharing] = useState('');

  function op(label, value, setFunction, placeholder, description) {
    return { label, value, setFunction, placeholder, description };
  }

  const operatorData = [
    op('Drive Name', driveName, setDriveName, 'drive:',
      `Takes "MyDrive" or a shared drive's name, and returns files in that drive.`),
    op('Owned by', owner, setOwner, 'owner:', 
      'Returns files owned by a user.'),
    op('Created by', creator, setCreator, 'creator:',
      `Returns files created by a user. Same as 'owner:' in Google Drive.`),
    op('Shared by', from, setFrom, 'from:', 
      'Returns files shared by a user.'),
    op('Directly shared with', to, setTo, 'to:', 
      `Returns files directly shared with a user. 
       This ignores inherited and group permissions.`),
    op('Viewable by', readable, setReadable, 'readable:',
      'Returns files viewable by a user.'),
    op('Editable by', writable, setWritable, 'writable:',
      'Returns files that can be edited by a user.'),
    op('Sharable by', sharable, setSharable, 'sharable:',
      `Returns files whose permissions can be changed by a user.`),
    op('File name', name, setName, 'name:',
      'Takes a regular expression, and returns files whose names match it.'),
    op('In folder', inFolder, setInFolder, 'inFolder:',
      `Takes a regular expression, and returns files in all folders whose 
       names match it. This ignores the contents of subfolders.`),
    op('Under folder', folder, setFolder, 'folder:',
      'Same as the previous operator, but includes subfolders.'),
    op('Path', path, setPath, 'path:',
      `Takes a regular expression, and returns files under paths that match it.
       Includes subfolders - use "/" as separator.`),
    // sharing: is a special case with only 3 possible values - handled manually.
  ];

  function builderHandler(e) {
    e.preventDefault();
    let query = '';
    for (let op of operatorData) {
      if (op.value !== '') {
        if (query !== '') query += ' and ';
        query += (op.placeholder + op.value);
      }
    }

    if (sharing !== '') {
      if (query !== '') query += ' and ';
      query += `sharing:${sharing}`;
    }

    props.setQuery(query.trim()); // Get rid of empty space on the sides of the query
    window.scrollTo(0, 0);
  }

  return (
    <Accordion defaultActiveKey='hello-world' className='my-2'>
      <Accordion.Item>
        <Accordion.Header>
          <h4>Query Builder</h4>
        </Accordion.Header>
        <Accordion.Body>
          <h6>For the fields below, a &quot;user&quot; is synonymous with their email.</h6>
          <Form onSubmit={builderHandler}>
            { operatorData.map((op) => {
              return (
                <Form.Group className='mb-1' key={op.label}>
                  <Form.Label>{op.label}</Form.Label>
                  <Form.Control
                    size='sm'
                    placeholder={op.placeholder}
                    value={op.value}
                    onChange={e => { op.setFunction(e.target.value) }}
                  />
                  <Form.Text className='text-muted'>{op.description}</Form.Text>
                </Form.Group>
              );
            }) }

            <Form.Group className='mb-1'>
              <Form.Label>Sharing status</Form.Label>
              <Form.Control
                as='select'
                value={sharing}
                onChange={e => { setSharing(e.target.value) }}
              >
                <option label=' '></option> 
                <option label='Unshared files'>none</option>
                <option label='Files shared with anyone with the link'>anyone</option>
                <option label='Files shared with specific users'>individual</option>
                <option label={`Files shared with anyone in the owner's domain`}>domain</option>
              </Form.Control>
              <Form.Text className='text-muted'>
                Restrict based on sharing status of various files.
              </Form.Text>
            </Form.Group>

            <Button variant='primary' type='submit'>Build query</Button>
          </Form>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}