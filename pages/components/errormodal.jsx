import {Button, Modal} from 'react-bootstrap'

export default function ErrorModal(props) {

    function handleClose() {
        props.clearErrorCallback()
    }

    return (
        <Modal show={props.msg!==''} onHide={handleClose} centered size='sm'>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>Error: {props.msg}</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
}