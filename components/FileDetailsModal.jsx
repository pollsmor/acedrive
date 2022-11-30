import { Modal, Button } from "react-bootstrap";

export default function FileDetailsModal(props) {
    const file = props.file

    function handleClose() {
        props.closeFileDetails()
    }

    // console.log(error)
    return (
        <>
          {file ?
            <Modal show={true} onHide={handleClose} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>File Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>{file.name}</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          : null}
        </>
      );
}