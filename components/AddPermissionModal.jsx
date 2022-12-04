import { Form, Container, Row, Col, ListGroup, Accordion, Modal, Button} from "react-bootstrap";
import PermissionListItem from "./PermissionListItem";

export default function AddPermissionModal(props) {
    const file = props.file
    let show = props.addingPerm

    function handleClose() {
        props.handlePermClose();
    }

    function handleConfirm(){
        //here we somehow make the new permission
        handleClose();
    }
    return (
        <>
        <Modal show={true} onClose={handleClose} size='lg' >
            <Modal.Header closeButton onClick={handleClose}>
                <Modal.Title>Modal Title</Modal.Title>
            </Modal.Header>
            <Modal.Body>
             <Form>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Email: 
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control type="email" defaultValue={"enter email"} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Type: 
                    </Form.Label>
                    <Col sm="10">
                        <Form.Select defaultValue={"user"}>
                            <option>user</option>
                            <option>group</option>
                            <option>domain</option>
                            <option>anyone</option>
                        </Form.Select>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Role: 
                    </Form.Label>
                    <Col sm="10">
                        <Form.Select defaultValue={"reader"}>
                            <option>owner</option>
                            <option>organizer</option>
                            <option>fileOrganizer</option>
                            <option>writer</option>
                            <option>commenter</option>
                            <option>reader</option>
                        </Form.Select>
                    </Col>
                </Form.Group>
             </Form>
                <Button onClick={handleConfirm}>
                    Confirm
                </Button>  
             </Modal.Body>
        </Modal>
        </>
    );
}