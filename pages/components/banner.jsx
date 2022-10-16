import Image from 'next/future/image';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { signIn, signOut } from 'next-auth/react';

export default function Banner(props) {
  return (
    <Navbar bg='dark' variant='dark'>
      <Container fluid>
        <Nav>
          <Navbar.Brand>AceDrive</Navbar.Brand>
          {/* If logged in, render the top portion. If not, the bottom. */}
          { props.session ? <>
              <Image 
                src={props.session.user.image} 
                width={40}
                height={40}
                className='avatar' 
                alt='Avatar' 
              />
              <Nav.Link onClick={signOut}>Sign out</Nav.Link> 
            </> : <>
              <Nav.Link onClick={() => signIn('google')}>Sign in with Google</Nav.Link>
            </>
          }
        </Nav>
      </Container>
    </Navbar>
  );
}