import { signIn } from 'next-auth/react';
import { Container, ListGroup, Button } from 'react-bootstrap';

export default function Welcome() {
  return (
    <div className='pagebox'>
    <Container fluid>
      <h5 className='welcome-text'>
        Welcome to AceDrive, an implementation of the Cloud Drive Sharing Manager application 
        designed by Professor Scott Stoller as the final project of CSE 416 in the Fall 2022 
        semester. This application extends the sharing functionality of cloud storage services 
        such as Google Drive and Microsoft OneDrive, supporting features such as:
      </h5>

      <ListGroup>
        <ListGroup.Item className='welcome-list-group-items'>
          Maintaining a user profile with recent search queries, access control requirements, etc.
        </ListGroup.Item>
        <ListGroup.Item className='welcome-list-group-items'>
          Reading comprehensive information about file sharing and group membership to support search and analysis
        </ListGroup.Item>
        <ListGroup.Item className='welcome-list-group-items'>
          Advanced search queries with regex support and a query builder
        </ListGroup.Item>
        <ListGroup.Item className='welcome-list-group-items'>
          Updating and analyzing sharing permissions to detect redundant/deviant sharing
        </ListGroup.Item>
        <ListGroup.Item className='welcome-list-group-items'>
          And more!
        </ListGroup.Item>
      </ListGroup>

      <br />
      <Button className="button-type2" size='lg' onClick={() => signIn('google')}>Sign in with Google</Button>
      <br /><br />
      <Button className="button-type2" size='lg' onClick={() => signIn('microsoft')}>Sign in with Microsoft</Button>
    </Container>
    </div>
  );
}