import { Modal, Button } from "react-bootstrap";

export default function ErrorModal(props) {
    const error = props.error
    
    function handleClose() {
        props.closeErrorModal()
    }

    // console.log(error)
    return (
        <>
          {error ?
            <Modal show={true} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Search Error</Modal.Title>
              </Modal.Header>
              <Modal.Body>Error: <span style={{fontWeight:'bold'}}> {error.msg} </span> </Modal.Body>
              {error.term ? 
                <Modal.Body>Invalid Search: <span style={{fontWeight:'bold'}}> {error.term} </span> </Modal.Body>
                : null}
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