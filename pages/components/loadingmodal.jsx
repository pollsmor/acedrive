import {Modal, Container, Row, Spinner} from 'react-bootstrap'

export default function LoadingModal(props) {


    return ( 
        <Modal show={props.show} centered size='lg' keyboard={false} >
            <Modal.Header>
                <Modal.Title>Creating Snapshot</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row className='justify-content-center'>
                        Fetching data from Google Drive, please be patient
                    </Row>
                    <Row className='justify-content-center'>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Row>
                </Container>
            </Modal.Body>
        </Modal>)
}