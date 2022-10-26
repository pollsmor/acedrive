import Image from 'next/future/image';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { signOut } from 'next-auth/react';

export default function Banner(props) {
  if (!props.session) return; // To get "npm run build" prerendering off my back
  return (
    <Navbar bg='dark' variant='dark'>
      <Container fluid>
        <Nav>
          <Navbar.Brand>AceDrive</Navbar.Brand>
          <Image 
            src={props.session.user.image} 
            width={40}
            height={40}
            className='avatar' 
            alt='Avatar' 
          />
          <Nav.Link onClick={signOut}>Sign out</Nav.Link> 
        </Nav>
      </Container>
    </Navbar>
  );
}