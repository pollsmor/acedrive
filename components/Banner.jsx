import Image from 'next/future/image';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useSession, signOut } from 'next-auth/react';
import Logo from '../public/favicon.ico'

export default function Banner() {
  const { data: session, status } = useSession();

  if (session) {
    return (
      <Navbar bg='dark' variant='dark' sticky='top'>
        <Container fluid>
          <Nav>
            <Image
            src={Logo}
            width={45}
            height={40}
            className='avatar-logo'
            alt='Avatar'
            />
            <Navbar.Brand href='/' style={{color:"lightgreen"}}>AceDrive</Navbar.Brand>
          </Nav>
          <Nav>
          <Nav.Link >{session.user.email}</Nav.Link>
          <Container>

            <NavDropdown drop={'start'} menuVariant="dark">
            <Image
              src={session.user.image} 
              width={40}
              height={40}
              className='avatar' 
              alt='Avatar' 
            />
              <NavDropdown.Item >
                <Nav.Link onClick={() => signOut({ callbackUrl: '/' }) } variant="dark">Sign out</Nav.Link>
              </NavDropdown.Item>
            </NavDropdown>
            {/*
            <Nav.Link onClick={() => signOut({ callbackUrl: '/' })}>Sign out</Nav.Link> 
            */}
          </Container> 
          </Nav>
        </Container>
      </Navbar>
    );
  }
}