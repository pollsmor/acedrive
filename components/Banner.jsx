import Image from 'next/future/image';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { useSession, signOut } from 'next-auth/react';

export default function Banner() {
  const { data: session, status } = useSession();

  if (session) {
    return (
      <Navbar bg='dark' variant='dark'>
        <Container fluid>
          <Nav>
            <Navbar.Brand href='/'>AceDrive</Navbar.Brand>
            <Nav.Link>{session.user.email}</Nav.Link>
            <Image 
              src={session.user.image} 
              width={40}
              height={40}
              className='avatar' 
              alt='Avatar' 
            />
            <Nav.Link onClick={() => signOut({ callbackUrl: '/' })}>Sign out</Nav.Link> 
          </Nav>
        </Container>
      </Navbar>
    );
  }
}