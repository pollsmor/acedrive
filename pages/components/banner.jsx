import { useState } from 'react';
import { Container, Nav, Navbar, Form, FormControl } from 'react-bootstrap';
import { signIn, signOut } from 'next-auth/react';

export default function Banner(props) {
  const [query, setQuery] = useState('');

  function onSearch(e) {
    e.preventDefault();
    if (query === '') return;
    console.log(`Searching ${query}.`);
  }

  return (
    <Navbar bg='dark' variant='dark'>
      <Container fluid>
        <Nav>
          <Navbar.Brand>AceDrive</Navbar.Brand>
          {/* If logged in, render the top portion. If not, the bottom. */}
          { props.session ? <>
              <Nav.Link onClick={signOut}>Sign out</Nav.Link> 
              <Form onSubmit={onSearch}>
                <FormControl 
                  type='search' 
                  placeholder='Search...' 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </Form>
            </> : <>
              <Nav.Link onClick={() => signIn('google')}>Sign in with Google</Nav.Link>
            </>
          }
        </Nav>
      </Container>
    </Navbar>
  );
}