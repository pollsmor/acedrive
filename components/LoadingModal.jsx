import { Modal, Container, Row, Spinner } from 'react-bootstrap';

export default function LoadingModal(props) {
  return ( 
    <Modal show={props.show} centered size='lg' keyboard={false} className="loading-modal">
      <Modal.Header>
        <Modal.Title className="loading-modal-title">Creating Snapshot</Modal.Title>
      </Modal.Header>
      <Modal.Body className='loading-modal-text'>
        <Container>
          <Row className='justify-content-center'>
              Fetching data from Drive, please be patient...
          </Row>
          <Row className='justify-content-center'>
            <Spinner animation='border' role='status' className='loading-spinner'>
              <span className='visually-hidden'>Loading...</span>
            </Spinner>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
}