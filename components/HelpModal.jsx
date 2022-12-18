import { Modal, Button, ListGroup } from "react-bootstrap";

export default function ErrorModal(props) {
    
    function handleClose() {
        props.closeErrorModal()
    }

    const howTo = "<searchMethod>:{<QUERY1>,<QUERY2>}";
    const example = "AR:{example@mail.com,domain.com}"
    return (
        <>
            <Modal show={true} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Instructions To Use Access Control</Modal.Title>
              </Modal.Header>
              <Modal.Body>Access Methods:
                <ListGroup as="ol" numbered>
                  <ListGroup.Item as="li">AR - Allowed Readers , AW - Allowed Writers</ListGroup.Item>
                  <ListGroup.Item as="li">DR - Denied Readers , DW - Denied Writers</ListGroup.Item>
                  <ListGroup.Item as="li">GRP - Check For Group Files *</ListGroup.Item>
                </ListGroup> 
              </Modal.Body>

              <Modal.Body>How To Write Query:
                  <p style={{fontWeight:'bold'}}>{howTo}</p>
                  Example:
                  <p style={{fontWeight:'bold'}}>{example}</p>
                <span className="" style={{color:"red"}}>* Takes True False</span>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
        </>
      );
}