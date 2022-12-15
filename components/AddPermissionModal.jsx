import { Form, Container, Row, Col, ListGroup, Accordion, Modal, Button} from "react-bootstrap";
import PermissionListItem from "./PermissionListItem";
import axios from "axios";

export default function AddPermissionModal(props) {
    const file = props.file
    let show = props.addingPerm
 
    //const permission = [];

    function handleClose() {
        props.handlePermClose();
    }

    //copy view link for anyone function defined below
    function copyLink(){
        //async function called below
        getViewLink();
    }

    async function getViewLink(){
        let permission = ["get link"] 
        const result = await axios.post("/api/saveFilePermissions", { permission, file });
        if(result.data === "Bad Request"){
            alert("Could not acquire a view link");
        }
        else{
            //console.log("link: "+result.data.webViewLink.data.webViewLink);

            let link = result.data.webViewLink.data.webViewLink;
            
            // The link here gives access based on what kind of options
            // for link sharing are chosen on google drive.

            window.prompt("Link here: ", link);
        }
    }

    async function postPermission(){
        //edit the request underneath
        //getting values from the frontend fields
        var email = document.getElementsByClassName("emailBox")[0].value;
        var type = document.getElementsByClassName("typeDropdown")[0].value;
        var role = document.getElementsByClassName("roleDropdown")[0].value;
        var requestType = "add permission";
        //pushing the new permission fields into the permission array
        const permission = [requestType, email, type, role, file.id];
        //console.log("request: "+permission);
        const result = await axios.post("/api/saveFilePermissions", { permission , file });
        if(result.data === "Bad Request"){
            alert("Options selected were unexpected, Permission was not added");
        }
    }

    function handleConfirm(){
        postPermission();
        handleClose();
    }
    return (
        <>
        <Modal show={true} onClose={handleClose} size='lg' >
            <Modal.Header closeButton onClick={handleClose}>
                <Modal.Title>Adding a Permission to {file.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
             <Form>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2" >
                        Email: 
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control type="email" defaultValue={"enter email"} className="emailBox" />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2" >
                        Type: 
                    </Form.Label>
                    <Col sm="10">
                        <Form.Select defaultValue={"user"} className="typeDropdown">
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
                        <Form.Select defaultValue={"reader"} className="roleDropdown">
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
                <Modal.Footer>
                <Button onClick={handleConfirm}>
                    Confirm
                </Button>
                <Button onClick={copyLink}>
                    Sharable link
                </Button> 
                </Modal.Footer>
             </Modal.Body>
        </Modal>
        </>
    );
}