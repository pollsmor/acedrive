import { Container, ListGroup } from 'react-bootstrap';

export default function Welcome() {
  return (
    <Container fluid>
      <h5 className='my-2'>
        Welcome to AceDrive, an implementation of the Cloud Drive Sharing Manager application 
        designed by Professor Scott Stoller as the final project of CSE 416 in the Fall 2022 
        semester. This application extends the sharing functionality of cloud storage services 
        such as Google Drive and Microsoft OneDrive, supporting features such as:
      </h5>
      <ListGroup>
        <ListGroup.Item>
          Maintaining a user profile with recent search queries, access control requirements, etc.
        </ListGroup.Item>
        <ListGroup.Item>
          Reading comprehensive information about file sharing and group membership to support search and analysis
        </ListGroup.Item>
        <ListGroup.Item>
          Advanced search queries with regex support and a query builder
        </ListGroup.Item>
        <ListGroup.Item>
          Updating and analyzing sharing permissions to detect redundant/deviant sharing
        </ListGroup.Item>
        <ListGroup.Item>
          And more!
        </ListGroup.Item>
      </ListGroup>
      <h3 className='my-2'>To get started, sign in with your Google account!</h3>
    </Container>
  );
}