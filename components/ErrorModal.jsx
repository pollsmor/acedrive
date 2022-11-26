import { Modal, Button } from "react-bootstrap";

export default function ErrorModal(props) {
    const error = props.error
    function handleClose() {
        props.closeErrorModal()
    }

    return (
        <>
          <Modal show={error != null} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>Error: <span style={{fontWeight:'bold'}}> {error?.msg} </span> </Modal.Body>
            <Modal.Body>Invalid Search: <span style={{fontWeight:'bold'}}> {error?.term} </span> </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      );
}