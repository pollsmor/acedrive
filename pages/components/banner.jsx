import axios from 'axios';
import { useState } from 'react';
import Image from 'next/future/image';
import { Container, Nav, Navbar, Form, FormControl } from 'react-bootstrap';
import { signIn, signOut } from 'next-auth/react';

export default function Banner(props) {
  const [query, setQuery] = useState('');

  function onSearch(e) {
    e.preventDefault();
    if (query === '') return;
    console.log(`Searching ${query}.`);
  }

  async function takeSnapshot() {
    await axios.post('/api/takeSnapshot', {
      accessToken: props.session.accessToken
    });
  }

  return (
    <Navbar bg='dark' variant='dark'>
      <Container fluid>
        <Nav>
          <Navbar.Brand>AceDrive</Navbar.Brand>
          {/* If logged in, render the top portion. If not, the bottom. */}
          { props.session ? <>
              <Form onSubmit={onSearch} className='d-flex'>
                <FormControl 
                  type='search' 
                  placeholder='Search...' 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </Form>
              <Nav.Link onClick={takeSnapshot}>Take snapshot</Nav.Link>
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